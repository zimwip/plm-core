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

    // Pick the active project: the user's default space, else their first
    // accessible space. The session token is then minted pinned to it, carrying
    // the project-scoped roles + perms.
    let active_ps = match state.pno.resolve_default_space(user_id).await {
        Some(ps) => Some(ps),
        None => state.pno.accessible_spaces(user_id).await.into_iter().next(),
    };

    match state.pno.get_user_context(user_id, active_ps.as_deref()).await {
        Some(mut ctx) => {
            ctx.pv = Some(state.pno_version()); // revocation watermark
            let session = match state.codec.mint_session(&ctx) {
                Ok(s) => s,
                Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
            };
            Json(json!({
                "token": session.token,
                "expiresAt": rfc3339(session.expires_at),
                "userId": ctx.user_id,
                "username": ctx.username,
                "isAdmin": ctx.is_admin,
                "projectSpaceId": ctx.project_space_id,
            }))
            .into_response()
        }
        None => (StatusCode::UNAUTHORIZED, Json(json!({ "error": "Unknown user" }))).into_response(),
    }
}

fn rfc3339(epoch_secs: i64) -> String {
    Utc.timestamp_opt(epoch_secs, 0)
        .single()
        .map(|dt| dt.to_rfc3339())
        .unwrap_or_default()
}

#[derive(Deserialize)]
pub struct SwitchProjectRequest {
    #[serde(rename = "projectSpaceId")]
    project_space_id: String,
}

/// `POST /api/spe/auth/switch-project` — re-mint the session token pinned to a
/// different project space. The caller's current session is verified by the auth
/// middleware (AuthedContext); access to the target space is validated against
/// pno (a role there, or admin), then a fresh full-context session is minted.
pub async fn switch_project(
    State(state): State<AppState>,
    ext: Option<Extension<AuthedContext>>,
    Json(req): Json<SwitchProjectRequest>,
) -> Response {
    let user_id = match ext {
        Some(Extension(a)) => a.user.user_id,
        None => return (StatusCode::UNAUTHORIZED, Json(json!({ "error": "No authenticated context" }))).into_response(),
    };
    let target = req.project_space_id.trim().to_string();
    if target.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({ "error": "projectSpaceId required" }))).into_response();
    }
    match state.pno.get_user_context(&user_id, Some(&target)).await {
        Some(mut ctx) if ctx.is_admin || !ctx.role_ids.is_empty() => {
            ctx.pv = Some(state.pno_version()); // revocation watermark
            let session = match state.codec.mint_session(&ctx) {
                Ok(s) => s,
                Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
            };
            Json(json!({
                "token": session.token,
                "expiresAt": rfc3339(session.expires_at),
                "projectSpaceId": ctx.project_space_id,
            }))
            .into_response()
        }
        Some(_) => (StatusCode::FORBIDDEN, Json(json!({ "error": "No access to project space" }))).into_response(),
        None => (StatusCode::UNAUTHORIZED, Json(json!({ "error": "User no longer resolvable" }))).into_response(),
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
