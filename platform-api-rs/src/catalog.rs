//! Algorithm / Action catalog subsystem — Rust port of the Java
//! `platform-api` `actions` + `registry` packages.
//!
//! Routes are BARE (no `/api/platform` prefix; the gateway strips it). JSON
//! field names match the Java wire shape byte-for-byte:
//!   * snapshot DTOs (`/internal/config/actions`) use the record field names
//!     (camelCase) of `com.plm.platform.config.dto.*`.
//!   * list endpoints emit camelCased column keys via [`camelize`] — the port
//!     of `MapKeyUtil.camelize` (snake_case DB columns → camelCase JSON keys,
//!     preserving column order).
//!
//! DB access is RUNTIME sqlx (`sqlx::query`), never the compile-time `query!`
//! macros, so the crate builds with no live database.

use crate::catalog_db::{
    persist_to_db, AlgorithmInput, ContributionInput, GuardEntry, HandlerEntry,
};
use crate::error::{ApiError, ApiResult};
use crate::state::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    routing::{delete, get, post},
    Json, Router,
};
use chrono::{Duration as ChronoDuration, NaiveDateTime, Timelike, Utc};
use serde::Deserialize;
use serde_json::{json, Map, Value};
use sqlx::postgres::PgRow;
use sqlx::{Column, PgPool, Row, TypeInfo};
use std::collections::BTreeMap;
use std::time::Duration;

const CONFIG_CHANGED_SUBJECT: &str = "env.service.platform.CONFIG_CHANGED";
/// What services actually publish (Java `env.service.{svc}.ALGORITHM_STATS`).
const ALGORITHM_STATS_SUBJECT: &str = "env.service.*.ALGORITHM_STATS";
const STATS_WINDOW_SECONDS: i64 = 15;
const STATS_RETENTION_HOURS: i64 = 48;

// ── routes ───────────────────────────────────────────────────────────────

pub fn routes() -> Router<AppState> {
    Router::new()
        // Auto-registration + discovery
        .route("/internal/registry/actions", post(register_actions))
        .route("/registry/actions", get(catalog))
        // Full snapshot
        .route("/internal/config/actions", get(config_actions_snapshot))
        // Internal algorithm queries
        .route("/internal/algorithms/instances", get(internal_list_instances))
        .route("/internal/algorithms/by-type", get(internal_list_by_type))
        // Algorithm management
        .route("/algorithms/types", get(list_types))
        .route("/algorithms", get(list_algorithms))
        .route("/algorithms/services", get(list_algorithm_services))
        .route("/algorithms/by-type/:type_id", get(list_by_type))
        .route("/algorithms/:algorithm_id/parameters", get(list_algorithm_parameters))
        .route("/algorithms/instances", get(list_all_instances).post(create_instance))
        .route(
            "/algorithms/instances/:instance_id",
            axum::routing::put(update_instance).delete(delete_instance),
        )
        .route("/algorithms/:algorithm_id/instances", get(list_instances))
        .route("/algorithms/instances/:instance_id/params", get(get_instance_params))
        .route(
            "/algorithms/instances/:instance_id/params/:parameter_id",
            axum::routing::put(set_instance_param),
        )
        // Wrappers
        .route(
            "/algorithms/actions/:action_id/wrappers",
            get(list_action_wrappers).post(attach_action_wrapper),
        )
        .route(
            "/algorithms/actions/:action_id/wrappers/:wrapper_id",
            delete(detach_action_wrapper),
        )
        // Transition guards (table moved to psm-admin; stubs as in Java)
        .route(
            "/algorithms/transitions/:transition_id/guards",
            get(list_transition_guards).post(attach_transition_guard),
        )
        .route(
            "/algorithms/transitions/guards/:guard_id",
            axum::routing::put(update_transition_guard).delete(detach_transition_guard),
        )
        // Action guards (via algorithms/ alias)
        .route(
            "/algorithms/actions/:action_id/guards",
            get(list_action_guards_alias).post(attach_action_guard_alias),
        )
        .route(
            "/algorithms/actions/:action_id/guards/:guard_id",
            axum::routing::put(update_action_guard_alias).delete(detach_action_guard_alias),
        )
        // Stats
        .route("/algorithms/stats", get(get_stats).delete(reset_stats))
        .route("/algorithms/stats/timeseries", get(get_timeseries))
        // Action management
        .route("/actions/services", get(list_action_services))
        .route("/actions", get(list_actions).post(create_action))
        .route(
            "/actions/:action_id",
            get(get_action)
                .put(update_action)
                .delete(delete_action),
        )
        .route(
            "/actions/:action_id/parameters",
            get(list_action_parameters).post(add_action_parameter),
        )
        .route(
            "/actions/:action_id/guards",
            get(list_action_guards).post(attach_action_guard),
        )
        .route(
            "/actions/:action_id/guards/:guard_id",
            axum::routing::put(update_action_guard).delete(detach_action_guard),
        )
}

// ── query params ───────────────────────────────────────────────────────────

#[derive(Deserialize, Default)]
struct ServiceCodeQuery {
    #[serde(rename = "serviceCode")]
    service_code: Option<String>,
}

#[derive(Deserialize)]
struct TypeIdQuery {
    #[serde(rename = "typeId")]
    type_id: String,
}

#[derive(Deserialize, Default)]
struct TimeseriesQuery {
    #[serde(rename = "serviceCode")]
    service_code: Option<String>,
    #[serde(default = "default_hours")]
    hours: i64,
}
fn default_hours() -> i64 {
    24
}

fn blank_to_none(s: Option<String>) -> Option<String> {
    s.filter(|v| !v.trim().is_empty())
}

// ── MapKeyUtil.camelize port + generic row→Value ─────────────────────────────

/// snake_case → camelCase (port of `MapKeyUtil.toCamel`).
fn to_camel(key: &str) -> String {
    if key.is_empty() || !key.contains('_') {
        return key.to_string();
    }
    let mut out = String::with_capacity(key.len());
    let mut upper = false;
    for c in key.chars() {
        if c == '_' {
            upper = true;
            continue;
        }
        if upper {
            out.extend(c.to_uppercase());
            upper = false;
        } else {
            out.push(c);
        }
    }
    out
}

/// Convert a single DB cell to a JSON value, mapping common Postgres types.
/// Falls back to a string for anything exotic.
fn cell_to_json(row: &PgRow, idx: usize, type_name: &str) -> Value {
    macro_rules! try_get {
        ($t:ty) => {{
            let v: Result<Option<$t>, _> = row.try_get(idx);
            match v {
                Ok(Some(x)) => return json!(x),
                Ok(None) => return Value::Null,
                Err(_) => {}
            }
        }};
    }
    match type_name {
        "INT2" => {
            try_get!(i16);
        }
        "INT4" => {
            try_get!(i32);
        }
        "INT8" => {
            try_get!(i64);
        }
        "FLOAT4" => {
            let v: Result<Option<f32>, _> = row.try_get(idx);
            if let Ok(opt) = v {
                return opt.map(|x| json!(x as f64)).unwrap_or(Value::Null);
            }
        }
        "FLOAT8" | "NUMERIC" => {
            try_get!(f64);
        }
        "BOOL" => {
            try_get!(bool);
        }
        "TIMESTAMP" | "TIMESTAMPTZ" => {
            let v: Result<Option<NaiveDateTime>, _> = row.try_get(idx);
            if let Ok(opt) = v {
                return match opt {
                    Some(dt) => json!(dt.to_string()),
                    None => Value::Null,
                };
            }
        }
        _ => {}
    }
    // string-ish fallback (VARCHAR/TEXT and any unmapped type)
    let v: Result<Option<String>, _> = row.try_get(idx);
    match v {
        Ok(Some(s)) => json!(s),
        Ok(None) => Value::Null,
        Err(_) => Value::Null,
    }
}

/// Whole row → ordered JSON object with snake_case keys (no camelization).
fn row_to_object(row: &PgRow) -> Map<String, Value> {
    let mut obj = Map::new();
    for (i, col) in row.columns().iter().enumerate() {
        let tn = col.type_info().name();
        obj.insert(col.name().to_string(), cell_to_json(row, i, tn));
    }
    obj
}

/// Whole row → ordered JSON object with camelCased keys (port of `camelize`).
fn row_to_camel(row: &PgRow) -> Value {
    let mut obj = Map::new();
    for (i, col) in row.columns().iter().enumerate() {
        let tn = col.type_info().name();
        obj.insert(to_camel(col.name()), cell_to_json(row, i, tn));
    }
    Value::Object(obj)
}

fn rows_to_camel(rows: &[PgRow]) -> Vec<Value> {
    rows.iter().map(row_to_camel).collect()
}

// Small typed accessors used by the snapshot builder.
fn s(obj: &Map<String, Value>, key: &str) -> Option<String> {
    match obj.get(key) {
        Some(Value::String(v)) => Some(v.clone()),
        Some(Value::Null) | None => None,
        Some(other) => Some(other.to_string()),
    }
}
fn i(obj: &Map<String, Value>, key: &str) -> i64 {
    match obj.get(key) {
        Some(Value::Number(n)) => n.as_i64().unwrap_or(0),
        Some(Value::String(v)) => v.parse().unwrap_or(0),
        _ => 0,
    }
}
fn b(obj: &Map<String, Value>, key: &str) -> bool {
    match obj.get(key) {
        Some(Value::Bool(v)) => *v,
        Some(Value::Number(n)) => n.as_i64().unwrap_or(0) != 0,
        Some(Value::String(v)) => v.eq_ignore_ascii_case("true") || v == "1",
        _ => false,
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Auto-registration: POST /internal/registry/actions
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Deserialize)]
struct RegisterRequest {
    #[serde(rename = "serviceCode")]
    service_code: Option<String>,
    #[serde(default)]
    handlers: Option<Vec<HandlerInput>>,
    #[serde(default)]
    guards: Option<Vec<GuardInput>>,
    #[serde(default)]
    contributions: Option<Vec<ContributionInputDto>>,
    #[serde(default)]
    events: Option<Vec<EventInput>>,
}

#[derive(Deserialize, Clone)]
struct HandlerInput {
    code: String,
    label: Option<String>,
    module: Option<String>,
    #[serde(rename = "httpMethod")]
    http_method: Option<String>,
    #[serde(rename = "pathTemplate")]
    path_template: Option<String>,
    #[serde(rename = "bodyShape")]
    body_shape: Option<String>,
}

#[derive(Deserialize, Clone)]
struct GuardInput {
    code: String,
    label: Option<String>,
    module: Option<String>,
}

#[derive(Deserialize, Clone)]
struct ContributionInputDto {
    #[serde(rename = "typeId")]
    type_id: String,
    #[serde(rename = "typeName")]
    type_name: String,
    #[serde(rename = "javaInterface")]
    java_interface: Option<String>,
    #[serde(default)]
    algorithms: Option<Vec<AlgorithmInputDto>>,
}

#[derive(Deserialize, Clone)]
struct AlgorithmInputDto {
    code: String,
    label: Option<String>,
    module: Option<String>,
}

#[derive(Deserialize, Clone)]
struct EventInput {
    code: String,
    description: Option<String>,
    scope: Option<String>,
}

async fn register_actions(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> ApiResult<Json<Value>> {
    let svc = match req.service_code.as_deref() {
        Some(s) if !s.trim().is_empty() => s.to_string(),
        _ => return Err(ApiError::BadRequest("serviceCode is required".into())),
    };

    let handler_inputs = req.handlers.clone().unwrap_or_default();
    let guard_inputs = req.guards.clone().unwrap_or_default();
    let contribution_inputs = req.contributions.clone().unwrap_or_default();
    let event_inputs = req.events.clone().unwrap_or_default();

    let handlers: Vec<HandlerEntry> = handler_inputs
        .iter()
        .map(|h| HandlerEntry {
            code: h.code.clone(),
            label: h.label.clone(),
            module: h.module.clone(),
        })
        .collect();
    let guards: Vec<GuardEntry> = guard_inputs
        .iter()
        .map(|g| GuardEntry {
            code: g.code.clone(),
            label: g.label.clone(),
            module: g.module.clone(),
        })
        .collect();
    let contributions: Vec<ContributionInput> = contribution_inputs
        .iter()
        .map(|c| ContributionInput {
            type_id: c.type_id.clone(),
            type_name: c.type_name.clone(),
            java_interface: c.java_interface.clone(),
            algorithms: c
                .algorithms
                .clone()
                .unwrap_or_default()
                .into_iter()
                .map(|a| AlgorithmInput {
                    code: a.code,
                    label: a.label,
                    module: a.module,
                })
                .collect(),
        })
        .collect();

    // Persist (best-effort, like Java: swallow + log on failure).
    let changed = match persist_to_db(&state.db, &svc, &handlers, &guards, &contributions).await {
        Ok(c) => c,
        Err(e) => {
            tracing::warn!("Registration DB persist failed for service {svc}: {e}");
            false
        }
    };

    // Publish CONFIG_CHANGED only when the catalog actually changed.
    if changed {
        publish_config_changed(&state, "REGISTER", "ACTION_CATALOG", &svc).await;
    }

    let alg_count: usize = contributions.iter().map(|c| c.algorithms.len()).sum();
    let event_count = event_inputs.len();
    Ok(Json(json!({
        "serviceCode": svc,
        "handlerCount": handlers.len(),
        "guardCount": guards.len(),
        "eventCount": event_count,
        "contributionAlgorithmCount": alg_count,
        "registeredAt": Utc::now().to_rfc3339(),
    })))
}

/// Best-effort CONFIG_CHANGED: write to event_outbox (replay backstop) AND
/// publish directly to NATS. Port of `ConfigChangedPublisher`.
async fn publish_config_changed(state: &AppState, op: &str, entity_type: &str, entity_id: &str) {
    let payload = format!("{entity_type}:{entity_id}");
    // outbox row (replayed by the poller if the direct publish below fails)
    let id = format!("{}", uuid_v4_like());
    let _ = sqlx::query(
        "INSERT INTO event_outbox (id, destination, payload, created_at) VALUES ($1,$2,$3,$4)",
    )
    .bind(&id)
    .bind(CONFIG_CHANGED_SUBJECT)
    .bind(&payload)
    .bind(Utc::now().naive_utc())
    .execute(&state.db)
    .await;

    if let Some(nats) = &state.nats {
        // Mirror Java sendInternal("platform","CONFIG_CHANGED", event): JSON body.
        let body = json!({
            "operation": op,
            "entityType": entity_type,
            "entityId": entity_id,
        });
        if let Err(e) = nats
            .publish(CONFIG_CHANGED_SUBJECT, serde_json::to_vec(&body).unwrap_or_default())
            .await
        {
            tracing::warn!("Direct NATS publish failed, OutboxPoller will retry: {e}");
        }
    }
}

/// Minimal random hex id (UUID-ish; event_outbox.id is VARCHAR(36)).
fn uuid_v4_like() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let r = std::ptr::addr_of!(nanos) as usize as u128;
    let mix = nanos ^ (r.rotate_left(17));
    format!(
        "{:08x}-{:04x}-4{:03x}-{:04x}-{:012x}",
        (mix & 0xffff_ffff) as u32,
        ((mix >> 32) & 0xffff) as u16,
        ((mix >> 48) & 0xfff) as u16,
        (((mix >> 60) & 0x3fff) | 0x8000) as u16,
        ((mix >> 74) & 0xffff_ffff_ffff) as u64,
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// GET /registry/actions  (in-memory discovery — rebuilt from DB here)
// ═══════════════════════════════════════════════════════════════════════════
//
// The Java version serves an in-memory map populated by register(). The Rust
// port has no in-process catalog cache, so it reconstructs the same shape from
// the persisted algorithm rows (handlers = sys-handler type, guards = sys-guard
// type). Events are not persisted, so they are returned empty.

async fn catalog(State(state): State<AppState>) -> ApiResult<Json<Value>> {
    let rows = sqlx::query(
        "SELECT a.service_code, a.code, a.name, a.module_name, t.id AS type_id \
         FROM algorithm a JOIN algorithm_type t ON t.id = a.algorithm_type_id \
         ORDER BY a.service_code, a.code",
    )
    .fetch_all(&state.db)
    .await?;

    let mut by_service: BTreeMap<String, (Vec<Value>, Vec<Value>)> = BTreeMap::new();
    for r in &rows {
        let svc: String = r.get("service_code");
        let code: String = r.get("code");
        let name: String = r.get("name");
        let module: Option<String> = r.get("module_name");
        let type_id: String = r.get("type_id");
        let entry = by_service.entry(svc).or_default();
        let item = json!({ "code": code, "label": name, "module": module });
        if type_id.starts_with("sys-guard-") {
            entry.1.push(item);
        } else {
            entry.0.push(item);
        }
    }

    let mut services = Map::new();
    for (svc, (handlers, guards)) in by_service {
        services.insert(
            svc,
            json!({
                "handlers": handlers,
                "guards": guards,
                "events": Value::Array(vec![]),
                "registeredAt": Utc::now().to_rfc3339(),
            }),
        );
    }
    Ok(Json(json!({ "services": services })))
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. GET /internal/config/actions  — full snapshot (byte-for-byte DTO shapes)
// ═══════════════════════════════════════════════════════════════════════════

async fn config_actions_snapshot(
    State(state): State<AppState>,
    Query(q): Query<ServiceCodeQuery>,
) -> ApiResult<Json<Value>> {
    let svc = blank_to_none(q.service_code);
    let actions = build_actions(&state.db, svc.as_deref()).await?;
    let algorithms = build_algorithms(&state.db, svc.as_deref()).await?;
    let permissions = build_permissions(&state).await;
    Ok(Json(json!({
        "actions": actions,
        "algorithms": algorithms,
        "permissions": permissions,
    })))
}

/// Fetch rows, optionally filtered by service_code, with a JOIN-aware base SQL.
async fn fetch_scoped(
    pool: &PgPool,
    sql_all: &str,
    sql_svc: &str,
    svc: Option<&str>,
) -> Result<Vec<PgRow>, sqlx::Error> {
    match svc {
        Some(s) => sqlx::query(sql_svc).bind(s).fetch_all(pool).await,
        None => sqlx::query(sql_all).fetch_all(pool).await,
    }
}

fn group_by<'a>(rows: &'a [PgRow], key: &str) -> BTreeMap<String, Vec<&'a PgRow>> {
    let mut map: BTreeMap<String, Vec<&PgRow>> = BTreeMap::new();
    for r in rows {
        let k: Option<String> = r.try_get(key).ok();
        if let Some(k) = k {
            map.entry(k).or_default().push(r);
        }
    }
    map
}

async fn build_actions(pool: &PgPool, svc: Option<&str>) -> ApiResult<Vec<Value>> {
    let actions = fetch_scoped(
        pool,
        "SELECT * FROM action",
        "SELECT * FROM action WHERE service_code = $1",
        svc,
    )
    .await?;
    let params = fetch_scoped(
        pool,
        "SELECT * FROM action_parameter",
        "SELECT ap.* FROM action_parameter ap JOIN action a ON a.id = ap.action_id WHERE a.service_code = $1",
        svc,
    )
    .await?;
    let req_perms = fetch_scoped(
        pool,
        "SELECT * FROM action_required_permission",
        "SELECT ar.* FROM action_required_permission ar JOIN action a ON a.id = ar.action_id WHERE a.service_code = $1",
        svc,
    )
    .await?;
    let guards = fetch_scoped(
        pool,
        "SELECT * FROM action_guard",
        "SELECT ag.* FROM action_guard ag JOIN action a ON a.id = ag.action_id WHERE a.service_code = $1",
        svc,
    )
    .await?;
    let wrappers = fetch_scoped(
        pool,
        "SELECT * FROM action_wrapper",
        "SELECT aw.* FROM action_wrapper aw WHERE aw.service_code = $1",
        svc,
    )
    .await?;

    let params_by = group_by(&params, "action_id");
    let perms_by = group_by(&req_perms, "action_id");
    let guards_by = group_by(&guards, "action_id");
    let wrappers_by = group_by(&wrappers, "action_id");

    let mut result = Vec::new();
    for a in &actions {
        let a = row_to_object(a);
        let action_id = s(&a, "id").unwrap_or_default();

        let mut action_params = Vec::new();
        if let Some(ps) = params_by.get(&action_id) {
            for p in ps {
                let p = row_to_object(p);
                action_params.push(json!({
                    "id": s(&p, "id"),
                    "actionId": action_id,
                    "paramName": s(&p, "param_name"),
                    "paramLabel": s(&p, "param_label"),
                    "dataType": s(&p, "data_type"),
                    "required": b(&p, "required"),
                    "defaultValue": s(&p, "default_value"),
                    "allowedValues": s(&p, "allowed_values"),
                    "widgetType": s(&p, "widget_type"),
                    "validationRegex": s(&p, "validation_regex"),
                    "minValue": s(&p, "min_value"),
                    "maxValue": s(&p, "max_value"),
                    "visibility": s(&p, "visibility"),
                    "displayOrder": i(&p, "display_order"),
                    "tooltip": s(&p, "tooltip"),
                }));
            }
        }

        let mut required_perms = Vec::new();
        if let Some(rps) = perms_by.get(&action_id) {
            for rp in rps {
                let rp = row_to_object(rp);
                required_perms.push(s(&rp, "permission_code"));
            }
        }

        let mut action_guards = Vec::new();
        if let Some(gs) = guards_by.get(&action_id) {
            for g in gs {
                let g = row_to_object(g);
                action_guards.push(json!({
                    "id": s(&g, "id"),
                    "algorithmInstanceId": s(&g, "algorithm_instance_id"),
                    "effect": s(&g, "effect"),
                    "displayOrder": i(&g, "display_order"),
                    "tier": "ACTION",
                    "actionId": action_id,
                    "transitionId": Value::Null,
                    "nodeTypeId": Value::Null,
                    "overrideAction": Value::Null,
                }));
            }
        }

        let mut action_wrappers = Vec::new();
        if let Some(ws) = wrappers_by.get(&action_id) {
            for w in ws {
                let w = row_to_object(w);
                action_wrappers.push(json!({
                    "id": s(&w, "id"),
                    "actionId": action_id,
                    "algorithmInstanceId": s(&w, "algorithm_instance_id"),
                    "executionOrder": i(&w, "execution_order"),
                }));
            }
        }

        result.push(json!({
            "id": action_id,
            "actionCode": s(&a, "action_code"),
            "scope": s(&a, "scope"),
            "displayName": s(&a, "display_name"),
            "description": s(&a, "description"),
            "displayCategory": s(&a, "display_category"),
            "displayOrder": i(&a, "display_order"),
            "managedWith": s(&a, "managed_with"),
            "handlerInstanceId": s(&a, "handler_instance_id"),
            "parameters": action_params,
            "requiredPermissions": required_perms,
            "guards": action_guards,
            "wrappers": action_wrappers,
        }));
    }
    Ok(result)
}

async fn build_algorithms(pool: &PgPool, svc: Option<&str>) -> ApiResult<Vec<Value>> {
    let algorithms = fetch_scoped(
        pool,
        "SELECT * FROM algorithm",
        "SELECT * FROM algorithm WHERE service_code = $1",
        svc,
    )
    .await?;
    let params = fetch_scoped(
        pool,
        "SELECT * FROM algorithm_parameter",
        "SELECT ap.* FROM algorithm_parameter ap JOIN algorithm a ON a.id = ap.algorithm_id WHERE a.service_code = $1",
        svc,
    )
    .await?;
    let instances = fetch_scoped(
        pool,
        "SELECT * FROM algorithm_instance",
        "SELECT * FROM algorithm_instance WHERE service_code = $1",
        svc,
    )
    .await?;
    let param_values = fetch_scoped(
        pool,
        "SELECT * FROM algorithm_instance_param_value",
        "SELECT pv.* FROM algorithm_instance_param_value pv JOIN algorithm_instance ai ON ai.id = pv.algorithm_instance_id WHERE ai.service_code = $1",
        svc,
    )
    .await?;

    let params_by = group_by(&params, "algorithm_id");
    let inst_by = group_by(&instances, "algorithm_id");

    // paramName by parameter id
    let mut param_name_by_id: BTreeMap<String, String> = BTreeMap::new();
    for p in &params {
        let o = row_to_object(p);
        if let (Some(id), Some(name)) = (s(&o, "id"), s(&o, "param_name")) {
            param_name_by_id.insert(id, name);
        }
    }

    // paramValues grouped by instance: { paramName -> value }
    let mut pv_by_instance: BTreeMap<String, Map<String, Value>> = BTreeMap::new();
    for pv in &param_values {
        let o = row_to_object(pv);
        let inst_id = s(&o, "algorithm_instance_id").unwrap_or_default();
        let pid = s(&o, "algorithm_parameter_id").unwrap_or_default();
        let pname = param_name_by_id.get(&pid).cloned().unwrap_or(pid);
        let val = s(&o, "value").unwrap_or_default();
        pv_by_instance
            .entry(inst_id)
            .or_default()
            .insert(pname, json!(val));
    }

    let mut result = Vec::new();
    for alg in &algorithms {
        let alg = row_to_object(alg);
        let alg_id = s(&alg, "id").unwrap_or_default();

        let mut alg_params = Vec::new();
        if let Some(ps) = params_by.get(&alg_id) {
            for p in ps {
                let p = row_to_object(p);
                alg_params.push(json!({
                    "id": s(&p, "id"),
                    "algorithmId": alg_id,
                    "paramName": s(&p, "param_name"),
                    "paramLabel": s(&p, "param_label"),
                    "dataType": s(&p, "data_type"),
                    "required": b(&p, "required"),
                    "defaultValue": s(&p, "default_value"),
                    "displayOrder": i(&p, "display_order"),
                }));
            }
        }

        let mut alg_instances = Vec::new();
        if let Some(insts) = inst_by.get(&alg_id) {
            for inst in insts {
                let inst = row_to_object(inst);
                let inst_id = s(&inst, "id").unwrap_or_default();
                let pv = pv_by_instance
                    .get(&inst_id)
                    .cloned()
                    .unwrap_or_default();
                alg_instances.push(json!({
                    "id": inst_id,
                    "algorithmId": alg_id,
                    "name": s(&inst, "name"),
                    "paramValues": Value::Object(pv),
                }));
            }
        }

        result.push(json!({
            "id": alg_id,
            "algorithmTypeId": s(&alg, "algorithm_type_id"),
            "code": s(&alg, "code"),
            "name": s(&alg, "name"),
            "description": s(&alg, "description"),
            "handlerRef": s(&alg, "handler_ref"),
            "parameters": alg_params,
            "instances": alg_instances,
        }));
    }
    Ok(result)
}

/// PermissionConfig list, fetched S2S from pno `/internal/authorization/snapshot`.
async fn build_permissions(state: &AppState) -> Vec<Value> {
    let snapshot: Result<Value, _> = state
        .client
        .get_json("pno", "/internal/authorization/snapshot")
        .await;
    let snapshot = match snapshot {
        Ok(v) => v,
        Err(e) => {
            tracing::warn!("Failed to fetch permissions from pno-api: {e}");
            return vec![];
        }
    };
    let rows = match snapshot.get("permissions").and_then(|p| p.as_array()) {
        Some(r) => r,
        None => return vec![],
    };
    // pno-api emits the snapshot in camelCase (permissionCode/displayName/
    // displayOrder). Reading snake_case here yielded null codes → psm's
    // PlmPermissionAspect treated every code as unknown and skipped the check
    // (fail-open: all actions authorized). Match pno's actual contract.
    rows.iter()
        .map(|r| {
            json!({
                "permissionCode": r.get("permissionCode"),
                "scope": r.get("scope"),
                "displayName": r.get("displayName"),
                "description": r.get("description"),
                "displayOrder": r.get("displayOrder").and_then(|v| v.as_i64()).unwrap_or(0),
            })
        })
        .collect()
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Algorithm + Action list endpoints (camelize)
// ═══════════════════════════════════════════════════════════════════════════

async fn list_types(
    State(state): State<AppState>,
    Query(q): Query<ServiceCodeQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    let svc = blank_to_none(q.service_code);
    let rows = match svc {
        Some(s) => sqlx::query("SELECT * FROM algorithm_type WHERE service_code = $1 ORDER BY name")
            .bind(s)
            .fetch_all(&state.db)
            .await?,
        None => sqlx::query("SELECT * FROM algorithm_type ORDER BY service_code, name")
            .fetch_all(&state.db)
            .await?,
    };
    // Java listAlgorithmTypes does NOT camelize types (intoMaps only).
    Ok(Json(
        rows.iter().map(|r| Value::Object(row_to_object(r))).collect(),
    ))
}

async fn list_algorithms(
    State(state): State<AppState>,
    Query(q): Query<ServiceCodeQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    let base = "SELECT a.*, t.name AS type_name FROM algorithm a JOIN algorithm_type t ON t.id = a.algorithm_type_id";
    let svc = blank_to_none(q.service_code);
    let rows = match svc {
        Some(s) => sqlx::query(&format!("{base} WHERE a.service_code = $1 ORDER BY a.code"))
            .bind(s)
            .fetch_all(&state.db)
            .await?,
        None => sqlx::query(&format!("{base} ORDER BY a.service_code, a.code"))
            .fetch_all(&state.db)
            .await?,
    };
    Ok(Json(rows_to_camel(&rows)))
}

async fn list_algorithm_services(State(state): State<AppState>) -> ApiResult<Json<Vec<String>>> {
    let rows =
        sqlx::query("SELECT DISTINCT service_code FROM algorithm_type ORDER BY service_code")
            .fetch_all(&state.db)
            .await?;
    Ok(Json(rows.iter().map(|r| r.get("service_code")).collect()))
}

async fn list_by_type(
    State(state): State<AppState>,
    Path(type_id): Path<String>,
) -> ApiResult<Json<Vec<Value>>> {
    let rows = sqlx::query(
        "SELECT a.*, t.name AS type_name FROM algorithm a JOIN algorithm_type t ON t.id = a.algorithm_type_id \
         WHERE a.algorithm_type_id = $1 ORDER BY a.code",
    )
    .bind(type_id)
    .fetch_all(&state.db)
    .await?;
    Ok(Json(rows_to_camel(&rows)))
}

async fn list_algorithm_parameters(
    State(state): State<AppState>,
    Path(algorithm_id): Path<String>,
) -> ApiResult<Json<Vec<Value>>> {
    let rows = sqlx::query(
        "SELECT * FROM algorithm_parameter WHERE algorithm_id = $1 ORDER BY display_order",
    )
    .bind(algorithm_id)
    .fetch_all(&state.db)
    .await?;
    Ok(Json(rows_to_camel(&rows)))
}

async fn list_all_instances(
    State(state): State<AppState>,
    Query(q): Query<ServiceCodeQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    let base = "SELECT ai.*, a.code AS algorithm_code, a.name AS algorithm_name, \
        a.module_name AS module_name, t.name AS type_name, t.id AS algorithm_type_id \
        FROM algorithm_instance ai \
        JOIN algorithm a ON a.id = ai.algorithm_id \
        JOIN algorithm_type t ON t.id = a.algorithm_type_id";
    let svc = blank_to_none(q.service_code);
    let rows = match svc {
        Some(s) => sqlx::query(&format!("{base} WHERE ai.service_code = $1 ORDER BY ai.name"))
            .bind(s)
            .fetch_all(&state.db)
            .await?,
        None => sqlx::query(&format!("{base} ORDER BY ai.service_code, ai.name"))
            .fetch_all(&state.db)
            .await?,
    };
    Ok(Json(rows_to_camel(&rows)))
}

async fn list_instances(
    State(state): State<AppState>,
    Path(algorithm_id): Path<String>,
) -> ApiResult<Json<Vec<Value>>> {
    let rows = sqlx::query("SELECT * FROM algorithm_instance WHERE algorithm_id = $1 ORDER BY name")
        .bind(algorithm_id)
        .fetch_all(&state.db)
        .await?;
    Ok(Json(rows_to_camel(&rows)))
}

async fn get_instance_params(
    State(state): State<AppState>,
    Path(instance_id): Path<String>,
) -> ApiResult<Json<Vec<Value>>> {
    let rows = sqlx::query(
        "SELECT aipv.*, ap.param_name, ap.param_label, ap.data_type \
         FROM algorithm_instance_param_value aipv \
         JOIN algorithm_parameter ap ON ap.id = aipv.algorithm_parameter_id \
         WHERE aipv.algorithm_instance_id = $1",
    )
    .bind(instance_id)
    .fetch_all(&state.db)
    .await?;
    Ok(Json(rows_to_camel(&rows)))
}

// Internal (S2S)
async fn internal_list_instances(
    State(state): State<AppState>,
    Query(q): Query<ServiceCodeQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    list_all_instances(State(state), Query(q)).await
}

async fn internal_list_by_type(
    State(state): State<AppState>,
    Query(q): Query<TypeIdQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    list_by_type(State(state), Path(q.type_id)).await
}

// ── Actions ──────────────────────────────────────────────────────────────

async fn list_action_services(State(state): State<AppState>) -> ApiResult<Json<Vec<String>>> {
    let rows = sqlx::query("SELECT DISTINCT service_code FROM action ORDER BY service_code")
        .fetch_all(&state.db)
        .await?;
    Ok(Json(rows.iter().map(|r| r.get("service_code")).collect()))
}

async fn list_actions(
    State(state): State<AppState>,
    Query(q): Query<ServiceCodeQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    let base = "SELECT a.*, ai.name AS handler_instance_name, alg.code AS handler_code, alg.module_name AS handler_module_name \
        FROM action a \
        LEFT JOIN algorithm_instance ai ON ai.id = a.handler_instance_id \
        LEFT JOIN algorithm alg ON alg.id = ai.algorithm_id";
    let svc = blank_to_none(q.service_code);
    let rows = match svc {
        Some(s) => sqlx::query(&format!(
            "{base} WHERE a.service_code = $1 ORDER BY a.display_order, a.action_code"
        ))
        .bind(s)
        .fetch_all(&state.db)
        .await?,
        None => sqlx::query(&format!(
            "{base} ORDER BY a.service_code, a.display_order, a.action_code"
        ))
        .fetch_all(&state.db)
        .await?,
    };
    Ok(Json(rows_to_camel(&rows)))
}

async fn get_action(
    State(state): State<AppState>,
    Path(action_id): Path<String>,
) -> ApiResult<Json<Value>> {
    let row = sqlx::query(
        "SELECT a.*, ai.name AS handler_instance_name, alg.code AS handler_code \
         FROM action a \
         LEFT JOIN algorithm_instance ai ON ai.id = a.handler_instance_id \
         LEFT JOIN algorithm alg ON alg.id = ai.algorithm_id \
         WHERE a.id = $1",
    )
    .bind(action_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| ApiError::NotFound("action not found".into()))?;
    Ok(Json(row_to_camel(&row)))
}

async fn list_action_parameters(
    State(state): State<AppState>,
    Path(action_id): Path<String>,
) -> ApiResult<Json<Vec<Value>>> {
    let rows =
        sqlx::query("SELECT * FROM action_parameter WHERE action_id = $1 ORDER BY display_order")
            .bind(action_id)
            .fetch_all(&state.db)
            .await?;
    Ok(Json(rows_to_camel(&rows)))
}

async fn list_action_guards(
    State(state): State<AppState>,
    Path(action_id): Path<String>,
) -> ApiResult<Json<Vec<Value>>> {
    let rows = sqlx::query(
        "SELECT ag.*, ai.name AS instance_name, alg.code AS algorithm_code, alg.name AS algorithm_name, alg.module_name AS algorithm_module_name \
         FROM action_guard ag \
         LEFT JOIN algorithm_instance ai ON ai.id = ag.algorithm_instance_id \
         LEFT JOIN algorithm alg ON alg.id = ai.algorithm_id \
         WHERE ag.action_id = $1 ORDER BY ag.display_order",
    )
    .bind(action_id)
    .fetch_all(&state.db)
    .await?;
    Ok(Json(rows_to_camel(&rows)))
}

async fn list_action_wrappers(
    State(state): State<AppState>,
    Path(action_id): Path<String>,
) -> ApiResult<Json<Vec<Value>>> {
    let rows = sqlx::query(
        "SELECT aw.*, ai.name AS instance_name, a.code AS algorithm_code, a.name AS algorithm_name, t.name AS type_name \
         FROM action_wrapper aw \
         LEFT JOIN algorithm_instance ai ON ai.id = aw.algorithm_instance_id \
         LEFT JOIN algorithm a ON a.id = ai.algorithm_id \
         LEFT JOIN algorithm_type t ON t.id = a.algorithm_type_id \
         WHERE aw.action_id = $1 ORDER BY aw.execution_order",
    )
    .bind(action_id)
    .fetch_all(&state.db)
    .await?;
    Ok(Json(rows_to_camel(&rows)))
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Stats
// ═══════════════════════════════════════════════════════════════════════════

async fn get_stats(
    State(state): State<AppState>,
    Query(q): Query<ServiceCodeQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    let svc = blank_to_none(q.service_code);
    let rows = match svc {
        Some(s) => sqlx::query(
            "SELECT s.algorithm_code, s.call_count, s.total_ns, s.min_ns, s.max_ns, s.last_flushed \
             FROM algorithm_stat s \
             WHERE EXISTS (SELECT 1 FROM algorithm a WHERE a.code = s.algorithm_code AND a.service_code = $1) \
             ORDER BY s.call_count DESC",
        )
        .bind(s)
        .fetch_all(&state.db)
        .await?,
        None => sqlx::query("SELECT * FROM algorithm_stat ORDER BY call_count DESC")
            .fetch_all(&state.db)
            .await?,
    };
    let out = rows
        .iter()
        .map(|r| {
            let code: String = r.get("algorithm_code");
            let count: i64 = r.get("call_count");
            let total_ns: i64 = r.get("total_ns");
            let min_ns: i64 = r.get("min_ns");
            let max_ns: i64 = r.get("max_ns");
            let last_flushed: Option<NaiveDateTime> = r.try_get("last_flushed").ok().flatten();
            json!({
                "algorithmCode": code,
                "callCount": count,
                "minMs": min_ns as f64 / 1_000_000.0,
                "avgMs": if count > 0 { total_ns as f64 / 1_000_000.0 / count as f64 } else { 0.0 },
                "maxMs": max_ns as f64 / 1_000_000.0,
                "totalMs": total_ns as f64 / 1_000_000.0,
                "lastFlushed": last_flushed.map(|d| d.to_string()).unwrap_or_default(),
            })
        })
        .collect();
    Ok(Json(out))
}

async fn get_timeseries(
    State(state): State<AppState>,
    Query(q): Query<TimeseriesQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    let svc = blank_to_none(q.service_code);
    let since = Utc::now().naive_utc() - ChronoDuration::hours(q.hours);
    let rows = match svc {
        Some(s) => sqlx::query(
            "SELECT w.algorithm_code, w.window_start, w.call_count, w.total_ns, w.min_ns, w.max_ns \
             FROM algorithm_stat_window w \
             WHERE w.window_start >= $1 AND EXISTS ( \
                SELECT 1 FROM algorithm a WHERE a.code = w.algorithm_code AND a.service_code = $2 \
             ) ORDER BY w.window_start, w.algorithm_code",
        )
        .bind(since)
        .bind(s)
        .fetch_all(&state.db)
        .await?,
        None => sqlx::query(
            "SELECT * FROM algorithm_stat_window WHERE window_start >= $1 \
             ORDER BY window_start, algorithm_code",
        )
        .bind(since)
        .fetch_all(&state.db)
        .await?,
    };
    let out = rows
        .iter()
        .map(|r| {
            let code: String = r.get("algorithm_code");
            let window_start: Option<NaiveDateTime> = r.try_get("window_start").ok().flatten();
            let count: i64 = r.get("call_count");
            let total_ns: i64 = r.get("total_ns");
            json!({
                "algorithmCode": code,
                "windowStart": window_start.map(|d| d.to_string()).unwrap_or_default(),
                "callCount": count,
                "totalMs": total_ns as f64 / 1_000_000.0,
            })
        })
        .collect();
    Ok(Json(out))
}

async fn reset_stats(
    State(state): State<AppState>,
    Query(q): Query<ServiceCodeQuery>,
) -> ApiResult<StatusCode> {
    let svc = blank_to_none(q.service_code);
    match svc {
        Some(s) => {
            sqlx::query("DELETE FROM algorithm_stat_window WHERE algorithm_code IN (SELECT code FROM algorithm WHERE service_code = $1)")
                .bind(&s).execute(&state.db).await?;
            sqlx::query("DELETE FROM algorithm_stat WHERE algorithm_code IN (SELECT code FROM algorithm WHERE service_code = $1)")
                .bind(&s).execute(&state.db).await?;
        }
        None => {
            sqlx::query("DELETE FROM algorithm_stat_window").execute(&state.db).await?;
            sqlx::query("DELETE FROM algorithm_stat").execute(&state.db).await?;
        }
    }
    Ok(StatusCode::NO_CONTENT)
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. CRUD: algorithm instances, actions, guards, wrappers
// ═══════════════════════════════════════════════════════════════════════════

fn jstr(body: &Value, key: &str) -> Option<String> {
    body.get(key).and_then(|v| v.as_str()).map(String::from)
}
fn jstr_or(body: &Value, key: &str, default: &str) -> String {
    body.get(key)
        .and_then(|v| v.as_str())
        .map(String::from)
        .unwrap_or_else(|| default.to_string())
}
fn jint_or(body: &Value, key: &str, default: i64) -> i64 {
    match body.get(key) {
        Some(Value::Number(n)) => n.as_i64().unwrap_or(default),
        Some(Value::String(s)) => s.parse().unwrap_or(default),
        _ => default,
    }
}

// --- instances ---

async fn create_instance(
    State(state): State<AppState>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let algorithm_id =
        jstr(&body, "algorithmId").ok_or_else(|| ApiError::BadRequest("algorithmId required".into()))?;
    let name = jstr(&body, "name").ok_or_else(|| ApiError::BadRequest("name required".into()))?;
    let service_code = jstr(&body, "serviceCode");
    let id = uuid_v4_like();
    sqlx::query(
        "INSERT INTO algorithm_instance (id, service_code, algorithm_id, name, created_at) VALUES ($1,$2,$3,$4,$5)",
    )
    .bind(&id)
    .bind(&service_code)
    .bind(&algorithm_id)
    .bind(&name)
    .bind(Utc::now().naive_utc())
    .execute(&state.db)
    .await?;
    publish_config_changed(&state, "CREATE", "ALGORITHM_INSTANCE", &id).await;
    Ok(Json(json!({ "id": id })))
}

async fn update_instance(
    State(state): State<AppState>,
    Path(instance_id): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<StatusCode> {
    let name = jstr(&body, "name");
    // `IS DISTINCT FROM` → 0 rows affected when the value is unchanged, so we
    // emit CONFIG_CHANGED only on a real change (idempotent).
    let res = sqlx::query(
        "UPDATE algorithm_instance SET name = $1 WHERE id = $2 AND name IS DISTINCT FROM $1",
    )
        .bind(&name)
        .bind(&instance_id)
        .execute(&state.db)
        .await?;
    if res.rows_affected() > 0 {
        publish_config_changed(&state, "UPDATE", "ALGORITHM_INSTANCE", &instance_id).await;
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn delete_instance(
    State(state): State<AppState>,
    Path(instance_id): Path<String>,
) -> ApiResult<StatusCode> {
    // lifecycle_transition_guard moved to psm-admin (V11) — not in this schema, skipped.
    sqlx::query("DELETE FROM algorithm_instance_param_value WHERE algorithm_instance_id = $1")
        .bind(&instance_id).execute(&state.db).await?;
    sqlx::query("DELETE FROM action_guard WHERE algorithm_instance_id = $1")
        .bind(&instance_id).execute(&state.db).await?;
    sqlx::query("DELETE FROM action_wrapper WHERE algorithm_instance_id = $1")
        .bind(&instance_id).execute(&state.db).await?;
    let res = sqlx::query("DELETE FROM algorithm_instance WHERE id = $1")
        .bind(&instance_id).execute(&state.db).await?;
    if res.rows_affected() > 0 {
        publish_config_changed(&state, "DELETE", "ALGORITHM_INSTANCE", &instance_id).await;
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn set_instance_param(
    State(state): State<AppState>,
    Path((instance_id, parameter_id)): Path<(String, String)>,
    Json(body): Json<Value>,
) -> ApiResult<StatusCode> {
    let value = jstr(&body, "value").unwrap_or_default();
    // Idempotent: skip the rewrite + event when the stored value is unchanged.
    let current: Option<String> = sqlx::query_scalar(
        "SELECT value FROM algorithm_instance_param_value WHERE algorithm_instance_id = $1 AND algorithm_parameter_id = $2",
    )
        .bind(&instance_id).bind(&parameter_id).fetch_optional(&state.db).await?;
    if current.as_deref() == Some(value.as_str()) {
        return Ok(StatusCode::OK);
    }
    sqlx::query("DELETE FROM algorithm_instance_param_value WHERE algorithm_instance_id = $1 AND algorithm_parameter_id = $2")
        .bind(&instance_id).bind(&parameter_id).execute(&state.db).await?;
    sqlx::query("INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value) VALUES ($1,$2,$3,$4)")
        .bind(uuid_v4_like()).bind(&instance_id).bind(&parameter_id).bind(&value).execute(&state.db).await?;
    publish_config_changed(&state, "UPDATE", "ALGORITHM_INSTANCE", &instance_id).await;
    Ok(StatusCode::OK)
}

// --- actions ---

async fn create_action(
    State(state): State<AppState>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let code = jstr(&body, "actionCode")
        .filter(|c| !c.is_empty())
        .ok_or_else(|| ApiError::BadRequest("actionCode required".into()))?;
    let service_code = jstr(&body, "serviceCode")
        .filter(|c| !c.is_empty())
        .ok_or_else(|| ApiError::BadRequest("serviceCode required".into()))?;
    let id = jstr(&body, "id")
        .unwrap_or_else(|| format!("act-{}", &uuid_v4_like()[..8]));
    sqlx::query(
        "INSERT INTO action (id, service_code, action_code, scope, display_name, description, display_category, display_order, managed_with, handler_instance_id, created_at) \
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
    )
    .bind(&id)
    .bind(&service_code)
    .bind(&code)
    .bind(jstr_or(&body, "scope", "NODE"))
    .bind(jstr(&body, "displayName").unwrap_or_else(|| code.clone()))
    .bind(jstr(&body, "description"))
    .bind(jstr_or(&body, "displayCategory", "PRIMARY"))
    .bind(jint_or(&body, "displayOrder", 0) as i32)
    .bind(jstr(&body, "managedWith"))
    .bind(jstr(&body, "handlerInstanceId"))
    .bind(Utc::now().naive_utc())
    .execute(&state.db)
    .await?;
    publish_config_changed(&state, "CREATE", "ACTION", &id).await;
    Ok(Json(json!({ "id": id })))
}

async fn update_action(
    State(state): State<AppState>,
    Path(action_id): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<StatusCode> {
    // Row-comparison `IS DISTINCT FROM` → 0 rows affected when nothing changed,
    // so CONFIG_CHANGED fires only on a real edit.
    let res = sqlx::query(
        "UPDATE action SET display_name = $1, description = $2, scope = $3, display_category = $4, display_order = $5, handler_instance_id = $6 \
         WHERE id = $7 AND (display_name, description, scope, display_category, display_order, handler_instance_id) IS DISTINCT FROM ($1, $2, $3, $4, $5, $6)",
    )
    .bind(jstr(&body, "displayName"))
    .bind(jstr(&body, "description"))
    .bind(jstr_or(&body, "scope", "NODE"))
    .bind(jstr_or(&body, "displayCategory", "PRIMARY"))
    .bind(jint_or(&body, "displayOrder", 0) as i32)
    .bind(jstr(&body, "handlerInstanceId"))
    .bind(&action_id)
    .execute(&state.db)
    .await?;
    if res.rows_affected() > 0 {
        publish_config_changed(&state, "UPDATE", "ACTION", &action_id).await;
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn delete_action(
    State(state): State<AppState>,
    Path(action_id): Path<String>,
) -> ApiResult<StatusCode> {
    let mut action_removed = 0;
    for sql in [
        "DELETE FROM action_guard WHERE action_id = $1",
        "DELETE FROM action_wrapper WHERE action_id = $1",
        "DELETE FROM action_required_permission WHERE action_id = $1",
        "DELETE FROM action_parameter WHERE action_id = $1",
        "DELETE FROM action WHERE id = $1",
    ] {
        let res = sqlx::query(sql).bind(&action_id).execute(&state.db).await?;
        action_removed = res.rows_affected(); // last stmt = DELETE FROM action
    }
    if action_removed > 0 {
        publish_config_changed(&state, "DELETE", "ACTION", &action_id).await;
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn add_action_parameter(
    State(state): State<AppState>,
    Path(action_id): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let id = format!("aparam-{}", &uuid_v4_like()[..8]);
    sqlx::query(
        "INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, default_value, allowed_values, widget_type, validation_regex, visibility, display_order, tooltip) \
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)",
    )
    .bind(&id)
    .bind(&action_id)
    .bind(jstr(&body, "paramName"))
    .bind(jstr(&body, "paramLabel"))
    .bind(jstr_or(&body, "dataType", "STRING"))
    .bind(jint_or(&body, "required", 0) as i16)
    .bind(jstr(&body, "defaultValue"))
    .bind(jstr(&body, "allowedValues"))
    .bind(jstr_or(&body, "widgetType", "TEXT"))
    .bind(jstr(&body, "validationRegex"))
    .bind(jstr_or(&body, "visibility", "UI_VISIBLE"))
    .bind(jint_or(&body, "displayOrder", 0) as i32)
    .bind(jstr(&body, "tooltip"))
    .execute(&state.db)
    .await?;
    publish_config_changed(&state, "UPDATE", "ACTION", &action_id).await;
    Ok(Json(json!({ "id": id })))
}

// --- action guards ---

async fn attach_action_guard(
    State(state): State<AppState>,
    Path(action_id): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let instance_id = jstr(&body, "instanceId");
    let effect = jstr_or(&body, "effect", "HIDE");
    let display_order = jint_or(&body, "displayOrder", 0) as i32;
    let id = uuid_v4_like();
    sqlx::query(
        "INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES ($1,$2,$3,$4,$5)",
    )
    .bind(&id)
    .bind(&action_id)
    .bind(&instance_id)
    .bind(&effect)
    .bind(display_order)
    .execute(&state.db)
    .await?;
    publish_config_changed(&state, "UPDATE", "ACTION_GUARD", &id).await;
    Ok(Json(json!({ "id": id })))
}

async fn update_action_guard(
    State(state): State<AppState>,
    Path((_action_id, guard_id)): Path<(String, String)>,
    Json(body): Json<Value>,
) -> ApiResult<StatusCode> {
    let effect = jstr(&body, "effect");
    match effect.as_deref() {
        Some("HIDE") | Some("BLOCK") => {}
        _ => return Err(ApiError::BadRequest("effect must be HIDE or BLOCK".into())),
    }
    let res = sqlx::query("UPDATE action_guard SET effect = $1 WHERE id = $2 AND effect IS DISTINCT FROM $1")
        .bind(&effect)
        .bind(&guard_id)
        .execute(&state.db)
        .await?;
    if res.rows_affected() > 0 {
        publish_config_changed(&state, "UPDATE", "ACTION_GUARD", &guard_id).await;
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn detach_action_guard(
    State(state): State<AppState>,
    Path((_action_id, guard_id)): Path<(String, String)>,
) -> ApiResult<StatusCode> {
    let res = sqlx::query("DELETE FROM action_guard WHERE id = $1")
        .bind(&guard_id)
        .execute(&state.db)
        .await?;
    if res.rows_affected() > 0 {
        publish_config_changed(&state, "DELETE", "ACTION_GUARD", &guard_id).await;
    }
    Ok(StatusCode::NO_CONTENT)
}

// algorithms/actions/... aliases (delegate to the same handlers)
async fn list_action_guards_alias(
    state: State<AppState>,
    path: Path<String>,
) -> ApiResult<Json<Vec<Value>>> {
    list_action_guards(state, path).await
}
async fn attach_action_guard_alias(
    state: State<AppState>,
    path: Path<String>,
    body: Json<Value>,
) -> ApiResult<Json<Value>> {
    attach_action_guard(state, path, body).await
}
async fn update_action_guard_alias(
    state: State<AppState>,
    path: Path<(String, String)>,
    body: Json<Value>,
) -> ApiResult<StatusCode> {
    update_action_guard(state, path, body).await
}
async fn detach_action_guard_alias(
    state: State<AppState>,
    path: Path<(String, String)>,
) -> ApiResult<StatusCode> {
    detach_action_guard(state, path).await
}

// --- wrappers ---

async fn attach_action_wrapper(
    State(state): State<AppState>,
    Path(action_id): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let instance_id = jstr(&body, "instanceId");
    let execution_order = jint_or(&body, "executionOrder", 0) as i32;
    let service_code = jstr(&body, "serviceCode");
    let id = uuid_v4_like();
    sqlx::query(
        "INSERT INTO action_wrapper (id, service_code, action_id, algorithm_instance_id, execution_order) VALUES ($1,$2,$3,$4,$5)",
    )
    .bind(&id)
    .bind(&service_code)
    .bind(&action_id)
    .bind(&instance_id)
    .bind(execution_order)
    .execute(&state.db)
    .await?;
    publish_config_changed(&state, "CREATE", "ACTION_WRAPPER", &id).await;
    Ok(Json(json!({ "id": id })))
}

async fn detach_action_wrapper(
    State(state): State<AppState>,
    Path((_action_id, wrapper_id)): Path<(String, String)>,
) -> ApiResult<StatusCode> {
    let res = sqlx::query("DELETE FROM action_wrapper WHERE id = $1")
        .bind(&wrapper_id)
        .execute(&state.db)
        .await?;
    if res.rows_affected() > 0 {
        publish_config_changed(&state, "DELETE", "ACTION_WRAPPER", &wrapper_id).await;
    }
    Ok(StatusCode::NO_CONTENT)
}

// --- transition guards (stubs: table moved to psm-admin, V11) ---

async fn list_transition_guards(
    Path(_transition_id): Path<String>,
    Query(_q): Query<ServiceCodeQuery>,
) -> Json<Vec<Value>> {
    Json(vec![])
}
async fn attach_transition_guard(
    Path(_transition_id): Path<String>,
    Json(_body): Json<Value>,
) -> Json<Value> {
    Json(json!({ "id": uuid_v4_like() }))
}
async fn update_transition_guard(
    Path(_guard_id): Path<String>,
    Json(_body): Json<Value>,
) -> StatusCode {
    StatusCode::NO_CONTENT
}
async fn detach_transition_guard(Path(_guard_id): Path<String>) -> StatusCode {
    StatusCode::NO_CONTENT
}

// ═══════════════════════════════════════════════════════════════════════════
// Background: NATS stats aggregation + outbox poller
// ═══════════════════════════════════════════════════════════════════════════

pub fn spawn_background(state: AppState) {
    let nats = match state.nats.clone() {
        Some(n) => n,
        None => {
            tracing::info!("NATS absent — catalog background tasks disabled");
            return;
        }
    };

    // --- stats aggregator (env.service.*.ALGORITHM_STATS) ---
    {
        let pool = state.db.clone();
        let nats = nats.clone();
        tokio::spawn(async move {
            let pool2 = pool.clone();
            let sub = nats
                .subscribe(ALGORITHM_STATS_SUBJECT, move |msg| {
                    let pool = pool2.clone();
                    let data = msg.payload.to_vec();
                    tokio::spawn(async move {
                        if let Err(e) = ingest_stats(&pool, &data).await {
                            tracing::warn!("Failed to ingest algorithm stats payload: {e}");
                        }
                    });
                })
                .await;
            let _sub = match sub {
                Ok(sub) => sub, // held for the lifetime of this task
                Err(e) => {
                    tracing::warn!("stats subscribe failed: {e}");
                    return;
                }
            };
            tracing::info!("Algorithm stats aggregator subscribed: {ALGORITHM_STATS_SUBJECT}");
            // periodic purge of old windows (Java @Scheduled hourly)
            let mut purge = tokio::time::interval(Duration::from_secs(3600));
            loop {
                purge.tick().await;
                let cutoff = Utc::now().naive_utc() - ChronoDuration::hours(STATS_RETENTION_HOURS);
                if let Err(e) = sqlx::query("DELETE FROM algorithm_stat_window WHERE window_start < $1")
                    .bind(cutoff)
                    .execute(&pool)
                    .await
                {
                    tracing::warn!("purge old stat windows failed: {e}");
                }
            }
        });
    }

    // --- outbox poller (every 5s) ---
    {
        let pool = state.db.clone();
        let nats = nats.clone();
        tokio::spawn(async move {
            // initialDelay 10s in Java
            tokio::time::sleep(Duration::from_secs(10)).await;
            let mut tick = tokio::time::interval(Duration::from_secs(5));
            loop {
                tick.tick().await;
                if let Err(e) = poll_outbox(&pool, &nats).await {
                    tracing::warn!("outbox poll failed: {e}");
                }
            }
        });
    }
}

/// Merge one ALGORITHM_STATS payload into algorithm_stat + algorithm_stat_window.
/// Port of `AlgorithmStatsAggregator.handle`.
async fn ingest_stats(pool: &PgPool, data: &[u8]) -> Result<(), sqlx::Error> {
    let root: Value = match serde_json::from_slice(data) {
        Ok(v) => v,
        Err(e) => {
            tracing::warn!("stats payload not JSON: {e}");
            return Ok(());
        }
    };
    let items = match root.get("items").and_then(|i| i.as_array()) {
        Some(a) if !a.is_empty() => a,
        _ => return Ok(()),
    };
    let now = Utc::now().naive_utc();
    let window_start = truncate_to_window(now);

    for item in items {
        let code = item.get("code").and_then(|v| v.as_str()).unwrap_or("");
        let count = item.get("callCount").and_then(|v| v.as_i64()).unwrap_or(0);
        let total_ns = item.get("totalNanos").and_then(|v| v.as_i64()).unwrap_or(0);
        let min_ns = item.get("minNanos").and_then(|v| v.as_i64()).unwrap_or(i64::MAX);
        let max_ns = item.get("maxNanos").and_then(|v| v.as_i64()).unwrap_or(0);
        if code.is_empty() || count == 0 {
            continue;
        }
        merge_all_time(pool, code, count, total_ns, min_ns, max_ns, now).await?;
        merge_window(pool, code, window_start, count, total_ns, min_ns, max_ns).await?;
    }
    Ok(())
}

async fn merge_all_time(
    pool: &PgPool,
    code: &str,
    count: i64,
    total_ns: i64,
    min_ns: i64,
    max_ns: i64,
    now: NaiveDateTime,
) -> Result<(), sqlx::Error> {
    let updated = sqlx::query(
        "UPDATE algorithm_stat SET call_count = call_count + $1, total_ns = total_ns + $2, \
         min_ns = LEAST(min_ns, $3), max_ns = GREATEST(max_ns, $4), last_flushed = $5 \
         WHERE algorithm_code = $6",
    )
    .bind(count).bind(total_ns).bind(min_ns).bind(max_ns).bind(now).bind(code)
    .execute(pool)
    .await?
    .rows_affected();
    if updated == 0 {
        sqlx::query(
            "INSERT INTO algorithm_stat (algorithm_code, call_count, total_ns, min_ns, max_ns, last_flushed) \
             VALUES ($1,$2,$3,$4,$5,$6)",
        )
        .bind(code).bind(count).bind(total_ns).bind(min_ns).bind(max_ns).bind(now)
        .execute(pool)
        .await?;
    }
    Ok(())
}

async fn merge_window(
    pool: &PgPool,
    code: &str,
    window_start: NaiveDateTime,
    count: i64,
    total_ns: i64,
    min_ns: i64,
    max_ns: i64,
) -> Result<(), sqlx::Error> {
    let updated = sqlx::query(
        "UPDATE algorithm_stat_window SET call_count = call_count + $1, total_ns = total_ns + $2, \
         min_ns = LEAST(min_ns, $3), max_ns = GREATEST(max_ns, $4) \
         WHERE algorithm_code = $5 AND window_start = $6",
    )
    .bind(count).bind(total_ns).bind(min_ns).bind(max_ns).bind(code).bind(window_start)
    .execute(pool)
    .await?
    .rows_affected();
    if updated == 0 {
        sqlx::query(
            "INSERT INTO algorithm_stat_window (algorithm_code, window_start, call_count, total_ns, min_ns, max_ns) \
             VALUES ($1,$2,$3,$4,$5,$6)",
        )
        .bind(code).bind(window_start).bind(count).bind(total_ns).bind(min_ns).bind(max_ns)
        .execute(pool)
        .await?;
    }
    Ok(())
}

/// Port of `AlgorithmStatsAggregator.truncateToWindow` (15s buckets).
fn truncate_to_window(dt: NaiveDateTime) -> NaiveDateTime {
    let minute_start = dt.with_second(0).and_then(|d| d.with_nanosecond(0)).unwrap_or(dt);
    let bucket = (dt.second() as i64 / STATS_WINDOW_SECONDS) * STATS_WINDOW_SECONDS;
    minute_start + ChronoDuration::seconds(bucket)
}

/// Port of `OutboxPoller.poll`: drain up to 50 rows, publish raw, delete each.
async fn poll_outbox(
    pool: &PgPool,
    nats: &platform_lib_rs::nats::NatsBus,
) -> Result<(), sqlx::Error> {
    let rows = sqlx::query(
        "SELECT id, destination, payload FROM event_outbox ORDER BY created_at LIMIT 50",
    )
    .fetch_all(pool)
    .await?;
    if rows.is_empty() {
        return Ok(());
    }
    let mut published = 0;
    for row in &rows {
        let id: String = row.get("id");
        let destination: String = row.get("destination");
        let payload: String = row.get("payload");
        match nats.publish(destination, payload.into_bytes()).await {
            Ok(()) => {
                sqlx::query("DELETE FROM event_outbox WHERE id = $1")
                    .bind(&id)
                    .execute(pool)
                    .await?;
                published += 1;
            }
            Err(e) => {
                tracing::warn!("Outbox publish failed for {id} — will retry: {e}");
            }
        }
    }
    if published > 0 {
        tracing::debug!("Outbox: published {published} pending event(s)");
    }
    Ok(())
}
