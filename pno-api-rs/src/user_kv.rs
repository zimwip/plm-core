//! Per-user key/value store (UI preferences). Faithful port of the Java
//! `UserKvController` + `UserKvService`.
//!
//! Table `user_kv` has set semantics: `(user_id, ps_id, group_name, kv_key,
//! kv_value)` is UNIQUE — one key may hold many values. The project space comes
//! from the `x-plm-projectspace` header (absent/blank => `""`, the user-global
//! scope used by `UI_PREF`). All routes are bare (the spe-api gateway strips
//! `/api/pno`). Self-or-admin is enforced on every route.
//!
//! KV is plain user data: it neither publishes NATS events nor bumps the
//! authorization version.

use crate::auth::PnoUserContext;
use crate::error::{ApiError, ApiResult};
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::IntoResponse;
use axum::routing::get;
use axum::{Extension, Json, Router};
use serde_json::{json, Value};
use uuid::Uuid;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/users/:user_id/kv/:group",
            get(list_group).delete(delete_group),
        )
        .route(
            "/users/:user_id/kv/:group/single/:key",
            get(get_single),
        )
        .route(
            "/users/:user_id/kv/:group/single/:key/:value",
            axum::routing::put(set_single),
        )
        .route(
            "/users/:user_id/kv/:group/:key/:value",
            axum::routing::put(put_entry).delete(delete_entry),
        )
}

// ── helpers ────────────────────────────────────────────────────────────────

/// Project-space id from the `x-plm-projectspace` header; absent/blank => "".
fn ps_id(headers: &HeaderMap) -> String {
    headers
        .get("x-plm-projectspace")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .unwrap_or_default()
}

/// Enforce self-or-admin, replicating `requireSelfOrAdmin`.
fn require_self_or_admin(ctx: &Option<Extension<PnoUserContext>>, user_id: &str) -> ApiResult<()> {
    match ctx {
        Some(c) if c.is_admin || c.user_id == user_id => Ok(()),
        _ => Err(ApiError::Forbidden("Access denied".into())),
    }
}

/// Values stored under a specific key in a group, oldest first. Port of
/// `UserKvService.listValues`.
async fn list_values(
    state: &AppState,
    user_id: &str,
    ps_id: &str,
    group: &str,
    key: &str,
) -> ApiResult<Vec<String>> {
    let rows: Vec<(String,)> = sqlx::query_as(
        "SELECT kv_value FROM user_kv \
         WHERE user_id = $1 AND ps_id = $2 AND group_name = $3 AND kv_key = $4 ORDER BY created_at",
    )
    .bind(user_id)
    .bind(ps_id)
    .bind(group)
    .bind(key)
    .fetch_all(&state.db)
    .await?;
    Ok(rows.into_iter().map(|(v,)| v).collect())
}

// ── GET /users/{userId}/kv/{group} ──────────────────────────────────────────

async fn list_group(
    State(state): State<AppState>,
    Path((user_id, group)): Path<(String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    headers: HeaderMap,
) -> ApiResult<Json<Value>> {
    require_self_or_admin(&ctx, &user_id)?;
    let ps = ps_id(&headers);

    let rows: Vec<(String, String)> = sqlx::query_as(
        "SELECT kv_key, kv_value FROM user_kv \
         WHERE user_id = $1 AND ps_id = $2 AND group_name = $3 ORDER BY kv_key, created_at",
    )
    .bind(&user_id)
    .bind(&ps)
    .bind(&group)
    .fetch_all(&state.db)
    .await?;

    let out: Vec<Value> = rows
        .into_iter()
        .map(|(key, value)| json!({ "key": key, "value": value }))
        .collect();
    Ok(Json(Value::Array(out)))
}

// ── PUT /users/{userId}/kv/{group}/{key}/{value} ────────────────────────────

async fn put_entry(
    State(state): State<AppState>,
    Path((user_id, group, key, value)): Path<(String, String, String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    headers: HeaderMap,
) -> ApiResult<Json<Value>> {
    require_self_or_admin(&ctx, &user_id)?;
    let ps = ps_id(&headers);

    sqlx::query(
        "INSERT INTO user_kv (id, user_id, ps_id, group_name, kv_key, kv_value, created_at) \
         VALUES ($1, $2, $3, $4, $5, $6, $7) \
         ON CONFLICT (user_id, ps_id, group_name, kv_key, kv_value) DO NOTHING",
    )
    .bind(Uuid::new_v4().to_string())
    .bind(&user_id)
    .bind(&ps)
    .bind(&group)
    .bind(&key)
    .bind(&value)
    .bind(chrono::Utc::now().naive_utc())
    .execute(&state.db)
    .await?;

    Ok(Json(json!({ "status": "ok" })))
}

// ── DELETE /users/{userId}/kv/{group}/{key}/{value} ─────────────────────────

async fn delete_entry(
    State(state): State<AppState>,
    Path((user_id, group, key, value)): Path<(String, String, String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    headers: HeaderMap,
) -> ApiResult<impl IntoResponse> {
    require_self_or_admin(&ctx, &user_id)?;
    let ps = ps_id(&headers);

    sqlx::query(
        "DELETE FROM user_kv \
         WHERE user_id = $1 AND ps_id = $2 AND group_name = $3 AND kv_key = $4 AND kv_value = $5",
    )
    .bind(&user_id)
    .bind(&ps)
    .bind(&group)
    .bind(&key)
    .bind(&value)
    .execute(&state.db)
    .await?;

    Ok(StatusCode::NO_CONTENT)
}

// ── DELETE /users/{userId}/kv/{group} ───────────────────────────────────────

async fn delete_group(
    State(state): State<AppState>,
    Path((user_id, group)): Path<(String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    headers: HeaderMap,
) -> ApiResult<impl IntoResponse> {
    require_self_or_admin(&ctx, &user_id)?;
    let ps = ps_id(&headers);

    sqlx::query("DELETE FROM user_kv WHERE user_id = $1 AND ps_id = $2 AND group_name = $3")
        .bind(&user_id)
        .bind(&ps)
        .bind(&group)
        .execute(&state.db)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

// ── GET /users/{userId}/kv/{group}/single/{key} ─────────────────────────────

async fn get_single(
    State(state): State<AppState>,
    Path((user_id, group, key)): Path<(String, String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    headers: HeaderMap,
) -> ApiResult<Json<Value>> {
    require_self_or_admin(&ctx, &user_id)?;
    let ps = ps_id(&headers);

    let value = list_values(&state, &user_id, &ps, &group, &key)
        .await?
        .into_iter()
        .next();
    // Always returns {key, value} with value possibly null (Java behaviour).
    Ok(Json(json!({ "key": key, "value": value })))
}

// ── PUT /users/{userId}/kv/{group}/single/{key}/{value} ─────────────────────

async fn set_single(
    State(state): State<AppState>,
    Path((user_id, group, key, value)): Path<(String, String, String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    headers: HeaderMap,
) -> ApiResult<Json<Value>> {
    require_self_or_admin(&ctx, &user_id)?;
    let ps = ps_id(&headers);

    // Replace semantics: drop any existing rows for this key, then insert.
    sqlx::query("DELETE FROM user_kv WHERE user_id = $1 AND ps_id = $2 AND group_name = $3 AND kv_key = $4")
        .bind(&user_id)
        .bind(&ps)
        .bind(&group)
        .bind(&key)
        .execute(&state.db)
        .await?;

    sqlx::query(
        "INSERT INTO user_kv (id, user_id, ps_id, group_name, kv_key, kv_value, created_at) \
         VALUES ($1, $2, $3, $4, $5, $6, $7)",
    )
    .bind(Uuid::new_v4().to_string())
    .bind(&user_id)
    .bind(&ps)
    .bind(&group)
    .bind(&key)
    .bind(&value)
    .bind(chrono::Utc::now().naive_utc())
    .execute(&state.db)
    .await?;

    Ok(Json(json!({ "status": "ok" })))
}
