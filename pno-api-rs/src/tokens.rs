//! Personal access tokens (app passwords) for WebDAV-style Basic auth.
//! Faithful port of the Java `AccessTokenController` + `InternalTokenController`
//! + `AccessTokenService`.
//!
//! WebDAV clients cannot send Bearer tokens, so the Basic-auth password carries
//! one of these `dav_<hex>` tokens instead. Only the SHA-256 hex hash is
//! persisted; the plaintext is returned exactly once at creation.
//!
//! Bare paths (the spe-api gateway strips `/api/pno`):
//!   * `POST   /users/{userId}/tokens`            — create; self-or-admin →
//!     `{id, token, label, expiresAt}` (plaintext shown once)
//!   * `GET    /users/{userId}/tokens`            — list metadata only (never the
//!     hash); self-or-admin → `[{id,label,createdAt,expiresAt,lastUsedAt,revoked}]`
//!   * `DELETE /users/{userId}/tokens/{tokenId}`  — revoke (set `revoked=1`);
//!     self-or-admin → 204 if existed, else 404
//!   * `POST   /internal/tokens/verify`           — S2S secret-path (no
//!     `PnoUserContext`); `{userId, token}` → `{"valid": bool}`. On success the
//!     row's `last_used_at` is touched.
//!
//! The `/internal/tokens/verify` route is reached only after the S2S secret has
//! already been validated by `auth::middleware` (it matches `/internal/**`), so
//! no per-handler secret check is needed here.

use crate::auth::PnoUserContext;
use crate::error::{ApiError, ApiResult};
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{Extension, Json, Router};
use chrono::{Duration, Local, NaiveDateTime};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use uuid::Uuid;

/// `dav_` prefix on every plaintext token (matches the Java `PREFIX`).
const PREFIX: &str = "dav_";
/// Number of random bytes behind a token. The Java service draws 20 random
/// bytes and hex-encodes them → a 40-char hex body (`dav_` + 40 = 44 chars).
const RANDOM_BYTES: usize = 20;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/users/:user_id/tokens",
            axum::routing::post(create).get(list),
        )
        .route(
            "/users/:user_id/tokens/:token_id",
            axum::routing::delete(revoke),
        )
        .route(
            "/internal/tokens/verify",
            axum::routing::post(verify_internal),
        )
}

/// `{label?, ttlDays?}` creation body. Both optional, mirroring the Java
/// `Map.get(...)` reads (which yield `null` when absent).
#[derive(Debug, Default, Deserialize)]
pub struct CreateBody {
    #[serde(default)]
    pub label: Option<String>,
    /// Accept the Java camelCase wire field `ttlDays` (days until expiry).
    #[serde(rename = "ttlDays", default)]
    pub ttl_days: Option<i64>,
}

/// Creation response — the plaintext token is included here and nowhere else.
#[derive(Debug, Serialize)]
pub struct CreateResponse {
    pub id: String,
    pub token: String,
    pub label: String,
    #[serde(rename = "expiresAt")]
    pub expires_at: String,
}

/// One row of token metadata — never includes `token_hash`.
#[derive(Debug, Serialize)]
pub struct TokenMeta {
    pub id: String,
    pub label: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: Option<NaiveDateTime>,
    #[serde(rename = "expiresAt")]
    pub expires_at: Option<NaiveDateTime>,
    #[serde(rename = "lastUsedAt")]
    pub last_used_at: Option<NaiveDateTime>,
    pub revoked: i16,
}

/// `{userId, token}` body for the internal verify endpoint.
#[derive(Debug, Deserialize)]
pub struct VerifyBody {
    #[serde(rename = "userId", default)]
    pub user_id: Option<String>,
    #[serde(default)]
    pub token: Option<String>,
}

/// SHA-256 → lowercase hex, matching Java `HexFormat.of().formatHex(...)`.
fn sha256_hex(value: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(value.as_bytes());
    hex::encode(hasher.finalize())
}

/// Java `LocalDateTime.now()` — a wall-clock timestamp with no zone offset,
/// stored into a PostgreSQL `TIMESTAMP` (without time zone) column.
fn now() -> NaiveDateTime {
    Local::now().naive_local()
}

/// `selfOrAdmin(userId)`: allowed when the caller is an admin or is acting on
/// their own user id. A missing context (`ctx == None`) is never allowed,
/// matching the Java `ctx != null && (...)`.
fn self_or_admin(ctx: &Option<Extension<PnoUserContext>>, user_id: &str) -> bool {
    matches!(ctx, Some(c) if c.is_admin || c.user_id == user_id)
}

fn forbidden() -> ApiError {
    ApiError::Forbidden("Tokens can only be managed by their owner or an admin".to_string())
}

/// `POST /users/{userId}/tokens` — create a token. Returns the plaintext once.
async fn create(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
    body: Option<Json<CreateBody>>,
) -> ApiResult<Json<CreateResponse>> {
    if !self_or_admin(&ctx, &user_id) {
        return Err(forbidden());
    }
    let body = body.map(|Json(b)| b).unwrap_or_default();

    // Generate `dav_<40 hex>`: 20 random bytes from a fresh v4 UUID's 16 bytes
    // plus 4 more, hex-encoded. The exact bytes need not match Java, only the
    // `dav_` prefix and that it is a long random hex string of the same length.
    let mut raw = [0u8; RANDOM_BYTES];
    let a = *Uuid::new_v4().as_bytes(); // 16 bytes
    let b = *Uuid::new_v4().as_bytes(); // another 16; take the first 4
    raw[..16].copy_from_slice(&a);
    raw[16..RANDOM_BYTES].copy_from_slice(&b[..RANDOM_BYTES - 16]);
    let token = format!("{PREFIX}{}", hex::encode(raw));

    let id = Uuid::new_v4().to_string();
    let created = now();
    let expires_at: Option<NaiveDateTime> = body.ttl_days.map(|d| created + Duration::days(d));
    let label = body.label;

    sqlx::query(
        "INSERT INTO user_access_token (id, user_id, token_hash, label, created_at, expires_at) \
         VALUES ($1, $2, $3, $4, $5, $6)",
    )
    .bind(&id)
    .bind(&user_id)
    .bind(sha256_hex(&token))
    .bind(&label)
    .bind(created)
    .bind(expires_at)
    .execute(&state.db)
    .await?;

    tracing::info!(
        id = %id,
        user = %user_id,
        label = ?label,
        expires = ?expires_at,
        "TOKEN created"
    );

    // The Java response coerces null label/expiresAt to empty strings.
    Ok(Json(CreateResponse {
        id,
        token,
        label: label.unwrap_or_default(),
        expires_at: expires_at.map(|e| e.to_string()).unwrap_or_default(),
    }))
}

/// `GET /users/{userId}/tokens` — metadata only, newest first.
async fn list(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
) -> ApiResult<Json<Vec<TokenMeta>>> {
    if !self_or_admin(&ctx, &user_id) {
        return Err(forbidden());
    }

    let rows = sqlx::query_as::<
        _,
        (
            String,
            Option<String>,
            Option<NaiveDateTime>,
            Option<NaiveDateTime>,
            Option<NaiveDateTime>,
            i16,
        ),
    >(
        "SELECT id, label, created_at, expires_at, last_used_at, revoked \
         FROM user_access_token WHERE user_id = $1 ORDER BY created_at DESC",
    )
    .bind(&user_id)
    .fetch_all(&state.db)
    .await?;

    let tokens = rows
        .into_iter()
        .map(
            |(id, label, created_at, expires_at, last_used_at, revoked)| TokenMeta {
                id,
                label,
                created_at,
                expires_at,
                last_used_at,
                revoked,
            },
        )
        .collect();
    Ok(Json(tokens))
}

/// `DELETE /users/{userId}/tokens/{tokenId}` — set `revoked = 1`.
/// 204 when a row matched, 404 otherwise.
async fn revoke(
    State(state): State<AppState>,
    Path((user_id, token_id)): Path<(String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
) -> ApiResult<impl IntoResponse> {
    if !self_or_admin(&ctx, &user_id) {
        return Err(forbidden());
    }

    let affected = sqlx::query(
        "UPDATE user_access_token SET revoked = 1 WHERE id = $1 AND user_id = $2",
    )
    .bind(&token_id)
    .bind(&user_id)
    .execute(&state.db)
    .await?
    .rows_affected();

    if affected == 0 {
        return Err(ApiError::NotFound(format!("Token not found: {token_id}")));
    }

    tracing::info!(id = %token_id, user = %user_id, "TOKEN revoked");
    Ok(StatusCode::NO_CONTENT)
}

/// `POST /internal/tokens/verify` — S2S. Body `{userId, token}` → `{"valid": bool}`.
/// The response field is exactly `valid` (consumed by spe-api Basic→JWT).
async fn verify_internal(
    State(state): State<AppState>,
    Json(body): Json<VerifyBody>,
) -> ApiResult<Json<Value>> {
    let valid = verify(&state, body.user_id.as_deref(), body.token.as_deref()).await?;
    Ok(Json(json!({ "valid": valid })))
}

/// Core verification: hash the plaintext, look it up by hash, then check the
/// user matches, it is not revoked, and it is not expired. Touches
/// `last_used_at` on success. Returns `false` (never an error) for any
/// invalid/missing/unknown token, matching the Java `boolean verify(...)`.
async fn verify(state: &AppState, user_id: Option<&str>, token: Option<&str>) -> ApiResult<bool> {
    let (user_id, token) = match (user_id, token) {
        (Some(u), Some(t)) if !t.trim().is_empty() => (u, t),
        _ => return Ok(false),
    };

    let row = sqlx::query_as::<_, (String, String, Option<NaiveDateTime>, i16)>(
        "SELECT id, user_id, expires_at, revoked FROM user_access_token WHERE token_hash = $1",
    )
    .bind(sha256_hex(token))
    .fetch_optional(&state.db)
    .await?;

    let (id, row_user_id, expires_at, revoked) = match row {
        Some(r) => r,
        None => return Ok(false),
    };

    if row_user_id != user_id {
        return Ok(false);
    }
    if revoked != 0 {
        return Ok(false);
    }
    if let Some(exp) = expires_at {
        if exp < now() {
            return Ok(false);
        }
    }

    sqlx::query("UPDATE user_access_token SET last_used_at = $1 WHERE id = $2")
        .bind(now())
        .bind(&id)
        .execute(&state.db)
        .await?;

    Ok(true)
}
