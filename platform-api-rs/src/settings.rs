//! Settings aggregator subsystem. Port of the Java `platform-api`:
//!   * `SettingsSectionsController`      → `GET /sections` (grouped, permission-filtered)
//!   * `SettingsRegistrationController`  → `/internal/settings/register` CRUD
//!   * grouping/ordering logic of `SettingsSectionRegistry` + the controller
//!
//! The in-memory store + register/deregister/all_sections live in
//! `settings_registry::SettingsRegistry` (shared, reused here). This module only
//! adds the axum wiring + the aggregation/permission/grouping logic.
//!
//! Routes are BARE (no `/api/platform` prefix); the gateway strips it. The Java
//! controller mounts `/sections` at the root and the registration controller at
//! `/internal/settings`.

use crate::auth::SettingsUserContext;
use crate::settings_registry::{SettingSection, SettingsRegisterRequest};
use crate::state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
    Extension, Json, Router,
};
use serde::Serialize;
use std::collections::{HashMap, HashSet};

// ── predefined group order ───────────────────────────────────────────────────
// Matches the Java `SettingsSectionsController.GROUPS` list (in declaration
// order) plus the trailing HELP group. Custom groups not in this set are
// appended alphabetically just before HELP. (key, label).
const GROUPS: &[(&str, &str)] = &[
    ("GENERAL", "General"),
    ("PNO", "PnO"),
    ("PLATFORM", "Platform"),
    ("PSM", "Product Structure Management"),
    ("APPLICATION", "Application"),
    ("INDEX", "Index"),
];
const HELP_GROUP: (&str, &str) = ("HELP", "Help");

/// Default group when a section declares none. Matches the Java
/// `s.group() != null ? s.group() : "GENERAL"`.
const DEFAULT_GROUP: &str = "GENERAL";
/// Default serviceCode reported for a section. The shared `SettingsRegistry`
/// flattens sections without their owning serviceCode, so we fall back to the
/// Java default `getOrDefault(s.key(), "platform")`.
const DEFAULT_SERVICE_CODE: &str = "platform";

// ── response DTOs (match the Java records byte-for-byte) ─────────────────────
// SettingsGroupDto record fields are `groupKey`, `groupLabel`, `sections`.
// SettingsSectionResponse record fields are `key`, `label`, `canWrite`,
// `serviceCode`, `icon`. Jackson serializes record components verbatim.

#[derive(Debug, Serialize)]
struct SettingsSectionResponse {
    key: String,
    label: String,
    #[serde(rename = "canWrite")]
    can_write: bool,
    #[serde(rename = "serviceCode")]
    service_code: String,
    icon: Option<String>,
}

#[derive(Debug, Serialize)]
struct SettingsGroupDto {
    #[serde(rename = "groupKey")]
    group_key: String,
    #[serde(rename = "groupLabel")]
    group_label: String,
    sections: Vec<SettingsSectionResponse>,
}

// ── axum wiring ──────────────────────────────────────────────────────────────

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/sections", get(get_sections))
        .route("/internal/settings/register", post(register).get(list_all))
        .route(
            "/internal/settings/register/:service_code/instances/:instance_id",
            delete(deregister_instance),
        )
        .route(
            "/internal/settings/register/:service_code",
            delete(deregister_service),
        )
}

// ── GET /sections — the aggregator ───────────────────────────────────────────

async fn get_sections(
    State(state): State<AppState>,
    Extension(ctx): Extension<SettingsUserContext>,
) -> Json<Vec<SettingsGroupDto>> {
    let is_admin = ctx.is_admin;

    // Grants: pno user-context global permissions. Degrades to empty on pno
    // failure (PnoClient already returns an empty context in that case).
    let grants: HashSet<String> = if is_admin {
        HashSet::new()
    } else {
        state
            .pno
            .user_context(&ctx.user_id)
            .await
            .global_permissions
            .into_iter()
            .collect()
    };

    let visible = |permission: &Option<String>| -> bool {
        is_admin
            || permission.is_none()
            || permission
                .as_deref()
                .map(|p| grants.contains(p))
                .unwrap_or(true)
    };

    // Flatten all registered sections, dedupe by key (first wins, matching the
    // Java map-put-then-stream behaviour where the section instances are kept
    // but the serviceCode map collapses duplicates).
    let mut seen: HashSet<String> = HashSet::new();
    let all: Vec<SettingSection> = state
        .settings
        .all_sections()
        .into_iter()
        .filter(|s| seen.insert(s.key.clone()))
        .collect();

    // Permission filter.
    let visible_sections: Vec<SettingSection> =
        all.into_iter().filter(|s| visible(&s.permission)).collect();

    // Group by group key (default GENERAL).
    let mut by_group: HashMap<String, Vec<SettingSection>> = HashMap::new();
    for s in visible_sections {
        let g = if s.group.is_empty() {
            DEFAULT_GROUP.to_string()
        } else {
            s.group.clone()
        };
        by_group.entry(g).or_default().push(s);
    }

    // Ordered group list: known groups in declared order, then custom groups
    // (sorted, key reused as label) before HELP.
    let mut known: HashSet<&str> = GROUPS.iter().map(|(k, _)| *k).collect();
    known.insert(HELP_GROUP.0);

    let mut ordered: Vec<(String, String)> =
        GROUPS.iter().map(|(k, l)| (k.to_string(), l.to_string())).collect();
    let mut custom: Vec<String> = by_group
        .keys()
        .filter(|k| !known.contains(k.as_str()))
        .cloned()
        .collect();
    custom.sort();
    for k in custom {
        ordered.push((k.clone(), k));
    }
    ordered.push((HELP_GROUP.0.to_string(), HELP_GROUP.1.to_string()));

    let result: Vec<SettingsGroupDto> = ordered
        .into_iter()
        .filter_map(|(key, label)| {
            by_group.remove(&key).map(|mut sections| {
                sections.sort_by_key(|s| s.order);
                let resp = sections
                    .into_iter()
                    .map(|s| SettingsSectionResponse {
                        key: s.key,
                        label: s.label,
                        can_write: is_admin
                            || s.permission.is_none()
                            || s.permission
                                .as_deref()
                                .map(|p| grants.contains(p))
                                .unwrap_or(true),
                        service_code: DEFAULT_SERVICE_CODE.to_string(),
                        icon: s.icon,
                    })
                    .collect::<Vec<_>>();
                SettingsGroupDto {
                    group_key: key,
                    group_label: label,
                    sections: resp,
                }
            })
        })
        .filter(|g| !g.sections.is_empty())
        .collect();

    Json(result)
}

// ── /internal/settings/register ──────────────────────────────────────────────

/// Response body for POST /register, matching the Java `Map.of(...)`.
#[derive(Debug, Serialize)]
struct RegisterResponse {
    #[serde(rename = "serviceCode")]
    service_code: String,
    #[serde(rename = "instanceId")]
    instance_id: Option<String>,
    #[serde(rename = "sectionCount")]
    section_count: usize,
}

async fn register(
    State(state): State<AppState>,
    Json(req): Json<SettingsRegisterRequest>,
) -> impl IntoResponse {
    if req.service_code.trim().is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "serviceCode is required" })),
        )
            .into_response();
    }
    let section_count = req.sections.len();
    let service_code = req.service_code.clone();
    let instance_id = req.instance_id.clone();
    state.settings.register(&req);
    (
        StatusCode::OK,
        Json(RegisterResponse {
            service_code,
            instance_id,
            section_count,
        }),
    )
        .into_response()
}

async fn deregister_instance(
    State(state): State<AppState>,
    Path((service_code, instance_id)): Path<(String, String)>,
) -> StatusCode {
    state
        .settings
        .deregister_instance(&service_code, &instance_id);
    StatusCode::NO_CONTENT
}

async fn deregister_service(
    State(state): State<AppState>,
    Path(service_code): Path<String>,
) -> StatusCode {
    state.settings.deregister_service(&service_code);
    StatusCode::NO_CONTENT
}

/// Debug listing of all registered sections (the Java returns the raw
/// registrations; we lack per-service grouping in the shared registry, so we
/// return the flat section list).
async fn list_all(State(state): State<AppState>) -> Json<Vec<SettingSection>> {
    Json(state.settings.all_sections())
}

/// Self-register platform-api's OWN settings sections at boot — the Java side
/// does this via `plm.settings.enabled` + `@Bean SettingSectionDto` (the
/// PLATFORM group: Environment/Secrets/Service Registry/Actions/Algorithms, plus
/// HELP). Without this the Settings page is missing its Platform front.
pub fn register_own_sections(reg: &crate::settings_registry::SettingsRegistry) {
    let s = |key: &str, label: &str, group: &str, order: i32, perm: Option<&str>, icon: &str| {
        SettingSection {
            key: key.into(),
            label: label.into(),
            group: group.into(),
            order,
            permission: perm.map(|p| p.to_string()),
            icon: Some(icon.into()),
        }
    };
    let req = SettingsRegisterRequest {
        service_code: "platform".into(),
        instance_id: Some("self".into()),
        sections: vec![
            s("platform-environment", "Environment", "PLATFORM", 5, Some("MANAGE_PLATFORM"), "globe"),
            s("secrets", "Secrets", "PLATFORM", 15, Some("MANAGE_SECRETS"), "key"),
            s("service-registry", "Service Registry", "PLATFORM", 20, Some("MANAGE_PLATFORM"), "network"),
            s("actions-catalog", "Actions & Guards", "PLATFORM", 30, Some("MANAGE_PLATFORM"), "zap"),
            s("platform-algorithms", "Algorithms", "PLATFORM", 40, Some("MANAGE_PLATFORM"), "cpu"),
            s("api-playground", "API Playground", "HELP", 10, None, "terminal"),
            s("user-manual", "User Manual", "HELP", 20, None, "book"),
        ],
    };
    reg.register(&req);
}
