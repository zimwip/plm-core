//! Admin endpoints backing the Platform settings tabs. Ports:
//!   * `RegistryAdminController`     → `/admin/registry/{grouped,tags,overview}`
//!   * `ExpectedServicesController`  → `/admin/environment/expected-services` CRUD
//!
//! All admin-gated (MANAGE_PLATFORM). Routes are BARE (gateway strips
//! `/api/platform`).

use crate::auth::SettingsUserContext;
use crate::error::{ApiError, ApiResult};
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::routing::{get, post};
use axum::{Extension, Json, Router};
use serde::Deserialize;
use serde_json::{json, Value};
use std::collections::BTreeMap;

const REQUIRED_PERMISSION: &str = "MANAGE_PLATFORM";
/// Always-present services (informational on delete). Mirrors
/// `ExpectedServicesConfig.BASELINE`.
const BASELINE: &[&str] = &["pno", "platform"];
const EXPECTED_CHANGED_SUBJECT: &str = "env.global.EXPECTED_SERVICES_CHANGED";

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/admin/registry/grouped", get(grouped))
        .route("/admin/registry/tags", get(tags))
        .route("/admin/registry/overview", get(overview))
        .route(
            "/admin/environment/expected-services",
            get(get_expected).put(replace_expected),
        )
        .route(
            "/admin/environment/expected-services/services",
            post(add_service),
        )
        .route(
            "/admin/environment/expected-services/services/:code",
            axum::routing::delete(remove_service),
        )
}

/// Admin gate: token `isAdmin`, else token perms must include MANAGE_PLATFORM.
/// (Roles + perms are now carried by the token, so no pno round-trip.)
fn require_admin(ctx: &SettingsUserContext) -> ApiResult<()> {
    if ctx.is_admin || ctx.perms.iter().any(|p| p == REQUIRED_PERMISSION) {
        return Ok(());
    }
    Err(ApiError::Forbidden(format!("{REQUIRED_PERMISSION} required")))
}

fn iso(ms: i64) -> Value {
    chrono::DateTime::from_timestamp_millis(ms)
        .map(|d| json!(d.to_rfc3339()))
        .unwrap_or(Value::Null)
}

// ── /admin/registry/grouped ──────────────────────────────────────────────────

async fn grouped(
    State(state): State<AppState>,
    Extension(ctx): Extension<SettingsUserContext>,
) -> ApiResult<Json<Value>> {
    require_admin(&ctx)?;
    let now = chrono::Utc::now().timestamp_millis();
    let mut body: BTreeMap<String, Vec<Value>> = BTreeMap::new();
    for r in state.registry.status_instances() {
        let untagged = r.space_tag.as_deref().map(str::trim).unwrap_or("").is_empty();
        let age = r.last_heartbeat_ok.map(|hb| json!((now - hb) / 1000)).unwrap_or(Value::Null);
        let inst = json!({
            "instanceId": r.instance_id,
            "serviceCode": r.service_code,
            "baseUrl": r.base_url,
            "version": r.version,
            "spaceTag": r.space_tag,
            "untagged": untagged,
            "registeredAt": iso(r.registered_at),
            "lastHeartbeatOk": r.last_heartbeat_ok.map(iso).unwrap_or(Value::Null),
            "consecutiveFailures": r.consecutive_failures,
            "healthy": r.consecutive_failures == 0,
            "ageSeconds": age,
        });
        body.entry(r.service_code.clone()).or_default().push(inst);
    }
    Ok(Json(json!(body)))
}

// ── /admin/registry/tags ─────────────────────────────────────────────────────

async fn tags(
    State(state): State<AppState>,
    Extension(ctx): Extension<SettingsUserContext>,
) -> ApiResult<Json<Value>> {
    require_admin(&ctx)?;
    let mut by_service: BTreeMap<String, std::collections::BTreeSet<String>> = BTreeMap::new();
    for r in state.registry.status_instances() {
        if let Some(tag) = r.space_tag.as_deref().map(str::trim).filter(|t| !t.is_empty()) {
            by_service.entry(r.service_code).or_default().insert(tag.to_string());
        }
    }
    let out: BTreeMap<String, Vec<String>> = by_service
        .into_iter()
        .map(|(k, v)| (k, v.into_iter().collect()))
        .collect();
    Ok(Json(json!(out)))
}

// ── /admin/registry/overview ─────────────────────────────────────────────────

async fn overview(
    State(state): State<AppState>,
    Extension(ctx): Extension<SettingsUserContext>,
) -> ApiResult<Json<Value>> {
    require_admin(&ctx)?;
    let probe_ctx = json!({
        "userId": ctx.user_id,
        "projectSpaceId": ctx.project_space,
        "admin": true,
        "roleIds": ctx.role_ids,
        "globalPerms": ctx.perms,
    });

    let mut by_service = serde_json::Map::new();
    for code in state.local_registry.all_service_codes() {
        let items: Vec<Value> = state
            .client
            .post_json(&code, "/internal/items/visible", &probe_ctx)
            .await
            .unwrap_or_default();
        let creatable = items.iter().filter(|d| d.get("create").map(|v| !v.is_null()).unwrap_or(false)).count();
        let listable = items.iter().filter(|d| d.get("list").map(|v| !v.is_null()).unwrap_or(false)).count();
        by_service.insert(
            code.clone(),
            json!({
                "instances": state.local_registry.instances(&code).len(),
                "settingsSections": state.settings.sections_for_service(&code).len(),
                "itemDescriptors": items.len(),
                "creatableItems": creatable,
                "listableItems": listable,
            }),
        );
    }

    let regs: Vec<Value> = state
        .settings
        .all_registrations()
        .into_iter()
        .map(|(svc, inst, sections)| json!({ "serviceCode": svc, "instanceId": inst, "sections": sections }))
        .collect();

    Ok(Json(json!({
        "self": state.config.service_code,
        "services": by_service,
        "settingsRegistrations": regs,
    })))
}

// ── /admin/environment/expected-services ─────────────────────────────────────

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetExpected {
    #[serde(default)]
    expected_services: Option<Vec<String>>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AddService {
    service_code: String,
}

async fn publish_expected_changed(state: &AppState, list: &[String]) {
    if let Some(nats) = &state.nats {
        let payload =
            serde_json::to_vec(&json!({ "expectedServices": list })).unwrap_or_default();
        let _ = nats.publish(EXPECTED_CHANGED_SUBJECT, payload).await;
    }
}

async fn get_expected(
    State(state): State<AppState>,
    Extension(ctx): Extension<SettingsUserContext>,
) -> ApiResult<Json<Value>> {
    require_admin(&ctx)?;
    let list = state.expected.read().await.clone();
    Ok(Json(json!({ "expectedServices": list })))
}

async fn replace_expected(
    State(state): State<AppState>,
    Extension(ctx): Extension<SettingsUserContext>,
    Json(body): Json<SetExpected>,
) -> ApiResult<Json<Value>> {
    require_admin(&ctx)?;
    let new_list = body.expected_services.unwrap_or_default();
    {
        let mut w = state.expected.write().await;
        *w = new_list.clone();
    }
    publish_expected_changed(&state, &new_list).await;
    Ok(Json(json!({ "expectedServices": new_list })))
}

async fn add_service(
    State(state): State<AppState>,
    Extension(ctx): Extension<SettingsUserContext>,
    Json(body): Json<AddService>,
) -> ApiResult<Json<Value>> {
    require_admin(&ctx)?;
    let list = {
        let mut w = state.expected.write().await;
        let code = body.service_code.trim().to_string();
        if !code.is_empty() && !w.contains(&code) {
            w.push(code);
        }
        w.clone()
    };
    publish_expected_changed(&state, &list).await;
    Ok(Json(json!({ "expectedServices": list })))
}

async fn remove_service(
    State(state): State<AppState>,
    Extension(ctx): Extension<SettingsUserContext>,
    Path(code): Path<String>,
) -> ApiResult<Json<Value>> {
    require_admin(&ctx)?;
    let (list, removed) = {
        let mut w = state.expected.write().await;
        let before = w.len();
        w.retain(|c| c != &code);
        (w.clone(), w.len() != before)
    };
    publish_expected_changed(&state, &list).await;
    Ok(Json(json!({
        "expectedServices": list,
        "removed": removed,
        "baseline": BASELINE.contains(&code.as_str()),
    })))
}
