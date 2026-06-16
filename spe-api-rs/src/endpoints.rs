//! Local auth endpoints — port of `com.spe.auth.AuthController`
//! (`/api/spe/auth/{login,operation-token,logout,me}`).

use crate::auth::AuthedContext;
use crate::state::AppState;
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Extension, Json,
};
use chrono::{TimeZone, Utc};
use serde::Deserialize;
use serde_json::json;

/// `POST /api/spe/auth/login` — identity asserted via `X-User` (SSO/proxy
/// upstream). No password. Project space is per-request, not part of login.
pub async fn login(State(state): State<AppState>, headers: HeaderMap) -> Response {
    let user_id = headers
        .get("X-User")
        .and_then(|v| v.to_str().ok())
        .filter(|s| !s.is_empty());
    let user_id = match user_id {
        Some(u) => u,
        None => return (StatusCode::BAD_REQUEST, Json(json!({ "error": "X-User header required" }))).into_response(),
    };

    match state.pno.get_user_context(user_id, None).await {
        Some(ctx) => {
            let session = match state.codec.mint_session(&ctx.user_id, None) {
                Ok(s) => s,
                Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
            };
            let expires_at = Utc
                .timestamp_opt(session.expires_at, 0)
                .single()
                .map(|dt| dt.to_rfc3339())
                .unwrap_or_default();
            Json(json!({
                "token": session.token,
                "expiresAt": expires_at,
                "userId": ctx.user_id,
                "username": ctx.username,
                "isAdmin": ctx.is_admin,
            }))
            .into_response()
        }
        None => (StatusCode::UNAUTHORIZED, Json(json!({ "error": "Unknown user" }))).into_response(),
    }
}

#[derive(Deserialize)]
pub struct OperationTokenRequest {
    #[serde(rename = "jobId")]
    job_id: Option<String>,
    #[serde(rename = "ttlSeconds")]
    ttl_seconds: i64,
}

/// `POST /api/spe/auth/operation-token` — elevate a forward JWT to a job-scoped
/// operation token. The forward JWT (verified by the auth middleware) proves
/// identity; `X-Service-Secret` restricts the endpoint to trusted services.
pub async fn operation_token(
    State(state): State<AppState>,
    ext: Option<Extension<AuthedContext>>,
    headers: HeaderMap,
    Json(req): Json<OperationTokenRequest>,
) -> Response {
    let secret = headers.get("X-Service-Secret").and_then(|v| v.to_str().ok()).unwrap_or("");
    if secret != state.config.service_secret {
        return (StatusCode::FORBIDDEN, Json(json!({ "error": "Invalid service secret" }))).into_response();
    }
    let job_id = match req.job_id.as_deref().filter(|s| !s.is_empty()) {
        Some(j) => j,
        None => return (StatusCode::BAD_REQUEST, Json(json!({ "error": "jobId required" }))).into_response(),
    };
    let ctx = match ext {
        Some(Extension(a)) => a.user,
        None => return (StatusCode::UNAUTHORIZED, Json(json!({ "error": "No authenticated context" }))).into_response(),
    };
    match state.codec.mint_operation(&ctx, job_id, req.ttl_seconds) {
        Ok(token) => Json(json!({ "token": token, "jobId": job_id })).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}

/// `POST /api/spe/auth/logout` — stateless; the client drops the token.
pub async fn logout() -> Response {
    Json(json!({ "status": "logged out" })).into_response()
}

/// `GET /api/spe/auth/me` — current user context.
pub async fn me(ext: Option<Extension<AuthedContext>>) -> Response {
    match ext {
        Some(Extension(a)) => Json(json!({
            "userId": a.user.user_id,
            "username": a.user.username,
            "roleIds": a.user.role_ids,
            "isAdmin": a.user.is_admin,
            "projectSpaceId": a.user.project_space_id,
        }))
        .into_response(),
        None => StatusCode::UNAUTHORIZED.into_response(),
    }
}
