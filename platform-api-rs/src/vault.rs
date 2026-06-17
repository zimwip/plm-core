//! Vault-backed secret administration. Port of the Java
//! `com.plm.platform.api.secrets.SecretsAdminController` +
//! `com.plm.platform.vault.VaultAdminClient`.
//!
//! Admin-only (platform-api enforces via the JWT `isAdmin` flag — no
//! per-permission grants in this service). The Java gate is labelled
//! `MANAGE_SECRETS` but only ever checks `isAdmin`; we mirror that with the
//! `SettingsUserContext.is_admin` flag bound by the auth middleware.
//! TODO(permission-parity): wire a real `MANAGE_SECRETS` permission check if/when
//! platform-api gains a permission catalog, instead of the bare admin flag.
//!
//! Storage layout (KV v2, demo setup) — matches `VaultAdminClient` exactly:
//! ALL secrets live as fields of a SINGLE KV v2 entry at `secret/data/plm`
//! (logical path `secret/plm`, backend `secret`, context `plm`). There is NOT
//! one KV path per key. Therefore every mutation is read-modify-write of the
//! whole map, preserving the other keys — identical to the Java semantics.
//!
//!   read map : GET    {vault_addr}/v1/secret/data/plm      -> data.data.{k: v}
//!   write map: POST   {vault_addr}/v1/secret/data/plm      body {"data": {k: v}}
//!
//! Values are NEVER returned from the list endpoint — reveal is a separate
//! per-key GET, so the UI masks by default.

use crate::auth::SettingsUserContext;
use crate::error::{ApiError, ApiResult};
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::get;
use axum::{Extension, Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};

const VAULT_TOKEN_HEADER: &str = "X-Vault-Token";
/// Logical KV v2 path: backend `secret`, context `plm`. The data API inserts
/// the `data/` segment between backend and context.
const KV_READ_PATH: &str = "/v1/secret/data/plm";
const KV_WRITE_PATH: &str = "/v1/secret/data/plm";

// ── DTOs (JSON field names byte-for-byte vs the Java records) ────────────────

/// `record SecretKeyDto(String key)` — list element.
#[derive(Debug, Serialize)]
struct SecretKeyDto {
    key: String,
}

/// `record SecretDto(String key, String value)` — reveal response.
#[derive(Debug, Serialize)]
struct SecretDto {
    key: String,
    value: String,
}

/// `record CreateRequest(String key, String value)`.
#[derive(Debug, Deserialize)]
struct CreateRequest {
    #[serde(default)]
    key: Option<String>,
    #[serde(default)]
    value: Option<String>,
}

/// `record UpdateRequest(String value)`.
#[derive(Debug, Deserialize)]
struct UpdateRequest {
    #[serde(default)]
    value: Option<String>,
}

// ── axum wiring ─────────────────────────────────────────────────────────────
// Java controller is @RequestMapping("/admin/secrets"); the gateway strips
// /api/platform so we serve the bare /admin/secrets paths.

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/admin/secrets", get(list).post(create))
        .route(
            "/admin/secrets/:key",
            get(reveal).put(update).delete(delete_key),
        )
}

// ── handlers ────────────────────────────────────────────────────────────────

/// `GET /admin/secrets` — list keys (no values; the UI masks).
async fn list(
    State(state): State<AppState>,
    Extension(user): Extension<SettingsUserContext>,
) -> ApiResult<Json<Vec<SecretKeyDto>>> {
    require_admin(&user)?;
    let map = read_all(&state).await?;
    // Preserve insertion order, mirroring Java's LinkedHashMap-backed keySet.
    let out = map
        .keys()
        .map(|k| SecretKeyDto { key: k.clone() })
        .collect();
    Ok(Json(out))
}

/// `GET /admin/secrets/{key}` — reveal one value.
async fn reveal(
    State(state): State<AppState>,
    Extension(user): Extension<SettingsUserContext>,
    Path(key): Path<String>,
) -> ApiResult<Json<SecretDto>> {
    require_admin(&user)?;
    let map = read_all(&state).await?;
    match map.get(&key) {
        // Java does `String.valueOf(v)` — stringify whatever type Vault holds.
        Some(v) => Ok(Json(SecretDto {
            key,
            value: stringify(v),
        })),
        None => Err(ApiError::NotFound("secret not found".to_string())),
    }
}

/// `POST /admin/secrets` — create (409 if the key already exists).
async fn create(
    State(state): State<AppState>,
    Extension(user): Extension<SettingsUserContext>,
    Json(req): Json<CreateRequest>,
) -> ApiResult<StatusCode> {
    require_admin(&user)?;
    let key = match req.key {
        Some(k) if !k.trim().is_empty() => k,
        _ => return Err(ApiError::BadRequest("key is required".to_string())),
    };
    let value = req.value.unwrap_or_default();

    let mut map = read_all(&state).await?;
    if map.contains_key(&key) {
        // Java translates IllegalStateException("already exists") to HTTP 409.
        return Err(ApiError::Upstream(
            409,
            format!("Secret key already exists: {key}"),
        ));
    }
    map.insert(key, Value::String(value));
    write_all(&state, map).await?;
    Ok(StatusCode::CREATED)
}

/// `PUT /admin/secrets/{key}` — upsert value (preserves all other keys).
async fn update(
    State(state): State<AppState>,
    Extension(user): Extension<SettingsUserContext>,
    Path(key): Path<String>,
    Json(req): Json<UpdateRequest>,
) -> ApiResult<StatusCode> {
    require_admin(&user)?;
    let value = req.value.unwrap_or_default();
    let mut map = read_all(&state).await?;
    map.insert(key, Value::String(value));
    write_all(&state, map).await?;
    Ok(StatusCode::NO_CONTENT)
}

/// `DELETE /admin/secrets/{key}` — remove one key (no-op if absent).
async fn delete_key(
    State(state): State<AppState>,
    Extension(user): Extension<SettingsUserContext>,
    Path(key): Path<String>,
) -> ApiResult<StatusCode> {
    require_admin(&user)?;
    let mut map = read_all(&state).await?;
    // Java only rewrites when the key was present; match that to avoid a
    // needless Vault version bump.
    if map.remove(&key).is_some() {
        write_all(&state, map).await?;
    }
    Ok(StatusCode::NO_CONTENT)
}

// ── admin gate ──────────────────────────────────────────────────────────────

fn require_admin(user: &SettingsUserContext) -> ApiResult<()> {
    if user.is_admin {
        Ok(())
    } else {
        Err(ApiError::Forbidden(
            "MANAGE_SECRETS requires admin".to_string(),
        ))
    }
}

// ── Vault KV v2 access (read-modify-write of the single secret/plm entry) ─────

/// Full `key -> value` map under `secret/plm`. Empty map if the path is absent
/// (Vault 404), mirroring `VaultAdminClient.readAll` returning emptyMap.
async fn read_all(state: &AppState) -> ApiResult<Map<String, Value>> {
    let url = format!("{}{}", state.config.vault_addr, KV_READ_PATH);
    let resp = state
        .http
        .get(&url)
        .header(VAULT_TOKEN_HEADER, &state.config.vault_token)
        .send()
        .await
        .map_err(|e| ApiError::Upstream(502, format!("vault unreachable: {e}")))?;

    let status = resp.status();
    if status == StatusCode::NOT_FOUND {
        return Ok(Map::new());
    }
    if !status.is_success() {
        let body = resp.text().await.unwrap_or_default();
        return Err(ApiError::Upstream(status.as_u16(), vault_err(&body)));
    }

    let body: Value = resp
        .json()
        .await
        .map_err(|e| ApiError::Internal(format!("vault response parse: {e}")))?;

    // KV v2 read shape: { "data": { "data": { ...secrets... }, "metadata": {...} } }
    match body.pointer("/data/data") {
        Some(Value::Object(m)) => Ok(m.clone()),
        // Path exists but empty / null data -> empty map.
        _ => Ok(Map::new()),
    }
}

/// Overwrite the whole `secret/plm` map (KV v2 write wraps it in `{"data": ...}`).
async fn write_all(state: &AppState, map: Map<String, Value>) -> ApiResult<()> {
    let url = format!("{}{}", state.config.vault_addr, KV_WRITE_PATH);
    let resp = state
        .http
        .post(&url)
        .header(VAULT_TOKEN_HEADER, &state.config.vault_token)
        .json(&json!({ "data": Value::Object(map) }))
        .send()
        .await
        .map_err(|e| ApiError::Upstream(502, format!("vault unreachable: {e}")))?;

    let status = resp.status();
    if !status.is_success() {
        let body = resp.text().await.unwrap_or_default();
        return Err(ApiError::Upstream(status.as_u16(), vault_err(&body)));
    }
    Ok(())
}

/// Mirror Java `String.valueOf(v)` — primitives stringify to their literal,
/// objects/arrays fall back to their JSON encoding.
fn stringify(v: &Value) -> String {
    match v {
        Value::String(s) => s.clone(),
        Value::Null => "null".to_string(),
        other => other.to_string(),
    }
}

/// Pull a human-readable message out of a Vault error body
/// (`{"errors":["..."]}`), falling back to the raw body.
fn vault_err(body: &str) -> String {
    serde_json::from_str::<Value>(body)
        .ok()
        .and_then(|v| {
            v.get("errors")
                .and_then(|e| e.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|e| e.as_str())
                        .collect::<Vec<_>>()
                        .join("; ")
                })
                .filter(|s| !s.is_empty())
        })
        .unwrap_or_else(|| {
            if body.is_empty() {
                "vault request failed".to_string()
            } else {
                body.to_string()
            }
        })
}
