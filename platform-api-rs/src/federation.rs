//! Federation subsystems — faithful port of the Java `platform-api` federators:
//!   * transactions  — `transaction/TransactionFederator{Controller,Client}`
//!   * dashboard     — `dashboard/DashboardFederator{Controller,Client}`
//!   * items         — `api/ItemsController`
//!   * ui manifest   — `api/UiManifestController` + `client/UiPluginsClient`
//!
//! All four fan out to backend services via the registry-aware `ServiceClient`.
//! Aggregating endpoints (`/transactions`, `/dashboard/entries`, `/items`,
//! `/ui/manifest`) are resilient: a failing downstream is skipped, not fatal
//! (the Java uses Resilience4j; we collect successes and drop failures).
//!
//! Routing: the gateway strips `/api/platform`, so controllers serve at root.
//! Downstream S2S calls target the BARE internal paths the backends expose —
//! the Java goes through `PlatformPaths.internalPath(code, p)` which prepends
//! `/internal` (e.g. `/internal/transactions`), so we do the same here.

use crate::auth::SettingsUserContext;
use crate::error::{ApiError, ApiResult};
use crate::state::AppState;
use axum::{
    extract::{Path, Query, State},
    routing::{get, post},
    Extension, Json, Router,
};
use platform_lib_rs::error::PlatformError;
use reqwest::Method;
use serde::Deserialize;
use serde_json::{json, Value};

// ── routing ──────────────────────────────────────────────────────────────────

pub fn routes() -> Router<AppState> {
    Router::new()
        // transactions
        .route("/transactions", get(list_transactions))
        .route("/transactions/:service_code", post(open_transaction))
        .route("/transactions/:service_code/:tx_id", get(get_transaction))
        .route("/transactions/:service_code/:tx_id/commit", post(commit))
        .route("/transactions/:service_code/:tx_id/rollback", post(rollback))
        .route(
            "/transactions/:service_code/:tx_id/items",
            post(add_item).delete(remove_items),
        )
        // dashboard
        .route("/dashboard/entries", get(dashboard_entries))
        // items
        .route("/items", get(list_items))
        // ui manifest
        .route("/ui/manifest", get(ui_manifest))
}

// Internal-path helper — mirrors `PlatformPaths.internalPath`: backends serve
// internal endpoints at `/internal/...`, selected by the registry-aware client.
fn internal(path: &str) -> String {
    format!("/internal{path}")
}

/// Render an upstream error the way the Java `upstreamError` does: status code,
/// then the response body when present. Used only for log lines.
fn upstream_detail(e: &PlatformError) -> String {
    match e {
        PlatformError::UpstreamStatus { status, body } if !body.trim().is_empty() => {
            format!("{status} — {body}")
        }
        PlatformError::UpstreamStatus { status, .. } => status.to_string(),
        other => other.to_string(),
    }
}

// ── transactions ───────────────────────────────────────────────────────────
// Java shape: each tx op returns `Map<String,Object>` (opaque) and the list
// returns `List<Map<String,Object>>`. We pass through as `serde_json::Value`.

#[derive(Debug, Deserialize)]
struct StatusQuery {
    // Accepted for wire-compat with the Java `@RequestParam status`; the Java
    // controller ignores it and always queries the downstream with status=OPEN.
    #[allow(dead_code)]
    status: Option<String>,
}

/// `GET /transactions` — aggregate open transactions across every service that
/// declared the `transaction` feature. Down/empty services are skipped.
/// Port of `TransactionFederatorClient.fetchOpenTransactions`.
async fn list_transactions(
    State(state): State<AppState>,
    Query(_q): Query<StatusQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    let mut result: Vec<Value> = Vec::new();
    for code in state.registry.services_with_feature("transaction") {
        let path = internal("/transactions?status=OPEN");
        match state.client.get_json::<Vec<Value>>(&code, &path).await {
            Ok(txs) => result.extend(txs),
            Err(e) => {
                tracing::warn!("Skipping transactions from {code}: {}", upstream_detail(&e))
            }
        }
    }
    Ok(Json(result))
}

/// Wrap a single-service transaction op the way the Java `delegate` does: any
/// failure becomes a 502 carrying `[serviceCode] <detail>`.
fn delegate_err(service_code: &str, e: PlatformError) -> ApiError {
    let detail = upstream_detail(&e);
    tracing::warn!("Transaction op failed on {service_code}: {detail}");
    ApiError::Upstream(502, format!("[{service_code}] {detail}"))
}

/// `POST /transactions/{serviceCode}` — open a transaction on one service.
async fn open_transaction(
    State(state): State<AppState>,
    Path(service_code): Path<String>,
) -> ApiResult<Json<Value>> {
    let path = internal("/transactions");
    let body = state
        .client
        .post_json::<Value, Value>(&service_code, &path, &Value::Null)
        .await
        .map_err(|e| delegate_err(&service_code, e))?;
    Ok(Json(body))
}

/// `GET /transactions/{serviceCode}/{txId}` — fetch one transaction.
async fn get_transaction(
    State(state): State<AppState>,
    Path((service_code, tx_id)): Path<(String, String)>,
) -> ApiResult<Json<Value>> {
    let path = internal(&format!("/transactions/{tx_id}"));
    let body = state
        .client
        .get_json::<Value>(&service_code, &path)
        .await
        .map_err(|e| delegate_err(&service_code, e))?;
    Ok(Json(body))
}

/// `POST /transactions/{serviceCode}/{txId}/commit` — forwards the body.
async fn commit(
    State(state): State<AppState>,
    Path((service_code, tx_id)): Path<(String, String)>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let path = internal(&format!("/transactions/{tx_id}/commit"));
    let out = state
        .client
        .post_json::<Value, Value>(&service_code, &path, &body)
        .await
        .map_err(|e| delegate_err(&service_code, e))?;
    Ok(Json(out))
}

/// `POST /transactions/{serviceCode}/{txId}/rollback` — no body.
async fn rollback(
    State(state): State<AppState>,
    Path((service_code, tx_id)): Path<(String, String)>,
) -> ApiResult<Json<Value>> {
    let path = internal(&format!("/transactions/{tx_id}/rollback"));
    let out = state
        .client
        .post_json::<Value, Value>(&service_code, &path, &Value::Null)
        .await
        .map_err(|e| delegate_err(&service_code, e))?;
    Ok(Json(out))
}

/// `POST /transactions/{serviceCode}/{txId}/items` — add an item; forwards body.
async fn add_item(
    State(state): State<AppState>,
    Path((service_code, tx_id)): Path<(String, String)>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let path = internal(&format!("/transactions/{tx_id}/items"));
    let out = state
        .client
        .post_json::<Value, Value>(&service_code, &path, &body)
        .await
        .map_err(|e| delegate_err(&service_code, e))?;
    Ok(Json(out))
}

/// `DELETE /transactions/{serviceCode}/{txId}/items` — remove items; forwards
/// a JSON body on a DELETE (Java `exchangeParameterized(..., DELETE, body)`).
async fn remove_items(
    State(state): State<AppState>,
    Path((service_code, tx_id)): Path<(String, String)>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let path = internal(&format!("/transactions/{tx_id}/items"));
    let payload = serde_json::to_vec(&body)
        .map_err(|e| ApiError::Internal(format!("encode body: {e}")))?;
    let resp = state
        .client
        .request_raw(
            Method::DELETE,
            &service_code,
            &path,
            Some(&payload),
            Some("application/json"),
        )
        .await
        .map_err(|e| delegate_err(&service_code, e))?;
    let out: Value = serde_json::from_slice(&resp.body)
        .map_err(|e| ApiError::Internal(format!("decode response: {e}")))?;
    Ok(Json(out))
}

// ── dashboard ────────────────────────────────────────────────────────────────
// Java shape: `List<Map<String,Object>>` — opaque sections concatenated across
// every `dashboard`-feature service. Failing services skipped.

/// `GET /dashboard/entries` — port of `DashboardFederatorClient.fetchEntries`.
async fn dashboard_entries(State(state): State<AppState>) -> ApiResult<Json<Vec<Value>>> {
    let mut result: Vec<Value> = Vec::new();
    for code in state.registry.services_with_feature("dashboard") {
        let path = internal("/dashboard/entries");
        match state.client.get_json::<Vec<Value>>(&code, &path).await {
            Ok(sections) => result.extend(sections),
            Err(e) => tracing::warn!(
                "Skipping dashboard entries from {code}: {}",
                upstream_detail(&e)
            ),
        }
    }
    Ok(Json(result))
}

// ── items ────────────────────────────────────────────────────────────────────
// Java `ItemsController`: resolves the caller's pno context, builds an
// `ItemVisibilityContext`, fans out to every registered service (except self)
// calling `/internal/items/visible` (POST, body = visibility ctx), and merges
// the returned `List<ItemDescriptor>`. Descriptors are opaque pass-through here.
//
// The visibility context shape posted downstream matches the Java record
// `ItemVisibilityContext(userId, projectSpaceId, admin, roleIds, globalPerms)`.

/// `GET /items` — federated, per-user item catalog. Port of `ItemsController`.
async fn list_items(
    State(state): State<AppState>,
    Extension(user): Extension<SettingsUserContext>,
) -> ApiResult<Json<Vec<Value>>> {
    // Identity comes entirely from the token now (roles + perms + active project
    // are resolved at login/switch). No pno round-trip, no header.
    let visibility = json!({
        "userId": user.user_id,
        "projectSpaceId": user.project_space,
        "admin": user.is_admin,
        "roleIds": user.role_ids,
        "globalPerms": user.perms,
    });
    tracing::debug!("items visibility ctx: {visibility}");

    let self_code = "platform";
    let mut merged: Vec<Value> = Vec::new();
    for code in state.registry.all_service_codes() {
        if code == self_code {
            continue; // skip platform-api itself
        }
        let path = internal("/items/visible");
        match state
            .client
            .post_json::<Value, Vec<Value>>(&code, &path, &visibility)
            .await
        {
            Ok(part) => {
                tracing::info!("Item fan-out → {code} returned {} descriptor(s)", part.len());
                merged.extend(part);
            }
            Err(e) => {
                // Fail closed for this source (404 = no contributions; any
                // other error = down/timeout/circuit-open) — others merge on.
                tracing::warn!("Item fan-out → {code} failed: {}", upstream_detail(&e));
            }
        }
    }
    Ok(Json(merged))
}

// ── ui manifest ──────────────────────────────────────────────────────────────
// Java: each service's `/internal/ui/plugins` returns `List<UiPluginDeclaration>`
// `{ pluginId, zone, entryPath, requiredPermission }`. The federator rewrites
// each into a `UiPluginManifestEntry`
// `{ pluginId, serviceCode, zone, url, requiredPermission }` where
// `url = "/api/<serviceCode>/ui/<entryPath>"`. The controller then filters by
// the caller's grants (admin OR no requiredPermission OR grant present).

#[derive(Debug, Deserialize)]
struct UiPluginDeclaration {
    #[serde(rename = "pluginId")]
    plugin_id: Option<String>,
    zone: Option<String>,
    #[serde(rename = "entryPath")]
    entry_path: Option<String>,
    #[serde(rename = "requiredPermission")]
    required_permission: Option<String>,
}

/// `GET /ui/manifest` — merged, permission-filtered UI plugin manifest.
/// Port of `UiManifestController` + `UiPluginsClient`. (No per-user cache here;
/// the Java cache is a latency optimisation, not part of the contract.)
async fn ui_manifest(
    State(state): State<AppState>,
    Extension(user): Extension<SettingsUserContext>,
) -> ApiResult<Json<Vec<Value>>> {
    let pno_ctx = state.pno.user_context(&user.user_id).await;
    let is_admin = user.is_admin || pno_ctx.is_admin;
    let grants = pno_ctx.global_permissions;

    let mut visible: Vec<Value> = Vec::new();
    for code in state.registry.all_service_codes() {
        let path = internal("/ui/plugins");
        let plugins: Vec<UiPluginDeclaration> =
            match state.client.get_json(&code, &path).await {
                Ok(p) => p,
                Err(e) => {
                    // Tolerate per-service failure — skip & continue.
                    tracing::debug!("No UI plugins from {code}: {}", upstream_detail(&e));
                    continue;
                }
            };
        for p in plugins {
            let permitted = is_admin
                || p.required_permission.is_none()
                || p
                    .required_permission
                    .as_ref()
                    .map(|rp| grants.iter().any(|g| g == rp))
                    .unwrap_or(true);
            if !permitted {
                continue;
            }
            let entry_path = p.entry_path.unwrap_or_default();
            visible.push(json!({
                "pluginId": p.plugin_id,
                "serviceCode": code,
                "zone": p.zone,
                "url": format!("/api/{code}/ui/{entry_path}"),
                "requiredPermission": p.required_permission,
            }));
        }
    }
    Ok(Json(visible))
}
