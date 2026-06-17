//! Inbound auth middleware. Mirrors the platform-lib `PlmAuthFilter` policy:
//!   * public paths (actuator, docs, /status) bypass entirely;
//!   * `/internal/*` requires the shared `X-Service-Secret` (S2S);
//!   * everything else requires a Bearer JWT (session or forward), whose
//!     identity is bound into request extensions as `SettingsUserContext`.

use crate::state::AppState;
use axum::extract::{Request, State};
use axum::http::StatusCode;
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;

/// Identity of the authenticated caller, bound into request extensions.
#[derive(Debug, Clone)]
pub struct SettingsUserContext {
    pub user_id: String,
    pub username: Option<String>,
    pub is_admin: bool,
    pub role_ids: Vec<String>,
    /// Active project space from the token (`ps` claim) — sole source.
    pub project_space: Option<String>,
    /// Effective global permission codes from the token.
    pub perms: Vec<String>,
}

const PUBLIC_PREFIXES: &[&str] = &["/actuator", "/v3/api-docs", "/swagger-ui", "/status"];

fn is_public(path: &str) -> bool {
    PUBLIC_PREFIXES.iter().any(|p| path.starts_with(p))
}

fn unauthorized(msg: &str) -> Response {
    (StatusCode::UNAUTHORIZED, Json(json!({ "error": msg }))).into_response()
}

pub async fn middleware(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Response {
    let path = req.uri().path().to_string();

    if is_public(&path) {
        return next.run(req).await;
    }

    // Capture the inbound propagation context (Bearer forward-JWT,
    // X-PLM-ProjectSpace, X-Job-Id, W3C trace) BEFORE consuming the request, and
    // install it as the task-local for the whole handler. Without this, our S2S
    // ServiceClient calls forward only X-Service-Secret — downstream services
    // (psa/psm/dst/pno) then can't resolve the calling user, so non-admin
    // visibility (e.g. /items) collapses to empty. Mirrors the Java
    // ServiceClient forwarding the bearer via ServiceClientTokenContext.
    let rc = platform_lib_rs::RequestContext::from_headers(req.headers());

    // S2S internal endpoints: shared secret.
    if path.contains("/internal/") {
        let ok = req
            .headers()
            .get("X-Service-Secret")
            .and_then(|v| v.to_str().ok())
            .map(|s| s == state.config.service_secret)
            .unwrap_or(false);
        if !ok {
            return unauthorized("Invalid or missing X-Service-Secret");
        }
        return rc.scope(next.run(req)).await;
    }

    // User endpoints: Bearer JWT (session or forward).
    let token = req
        .headers()
        .get(http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|a| a.strip_prefix("Bearer "))
        .map(|s| s.trim().to_string());
    let token = match token {
        Some(t) if !t.is_empty() => t,
        _ => return unauthorized("Missing Bearer token"),
    };
    let user = match state.jwt.verify_any(&token) {
        Ok(u) => u,
        Err(_) => return unauthorized("Invalid or expired token"),
    };
    req.extensions_mut().insert(SettingsUserContext {
        user_id: user.user_id,
        username: user.username,
        is_admin: user.is_admin,
        role_ids: user.role_ids,
        project_space: user.project_space_id,
        perms: user.perms,
    });
    rc.scope(next.run(req)).await
}
