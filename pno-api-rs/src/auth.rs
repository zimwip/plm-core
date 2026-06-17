//! Inbound auth middleware. Faithful port of the platform-lib `PlmAuthFilter`
//! policy as configured for pno-api:
//!   * public paths (actuator, docs) bypass entirely;
//!   * `secret-paths` (S2S) require the shared `X-Service-Secret` and accept NO
//!     Bearer — these are called before a user token exists (spe login resolves
//!     `/users/{id}/context`, downstream services pull `/internal/...`);
//!   * everything else requires a Bearer JWT (session or forward), whose
//!     identity is bound into request extensions as `PnoUserContext`.
//!
//! Matches pno's `plm.auth.secret-paths`:
//!   `/internal/**, /users/*/context, /project-spaces/*/effective-service-tags`
//! using the Java semantics `AntPathMatcher.match(p, path) || path.startsWith(p)`.

use crate::state::AppState;
use axum::extract::{Request, State};
use axum::http::StatusCode;
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;

/// Identity of the authenticated caller, bound into request extensions for
/// handlers that enforce self-or-admin. Port of `PnoUserContext`/`PlmPrincipal`.
#[derive(Debug, Clone)]
pub struct PnoUserContext {
    pub user_id: String,
    pub username: Option<String>,
    pub is_admin: bool,
    pub role_ids: Vec<String>,
    /// Active project space from the token (`ps` claim).
    pub project_space: Option<String>,
    /// Effective global permission codes from the token.
    pub perms: Vec<String>,
}

const PUBLIC_PREFIXES: &[&str] = &["/actuator", "/v3/api-docs", "/swagger-ui"];

const SECRET_PATTERNS: &[&str] = &[
    "/internal/**",
    "/users/*/context",
    "/project-spaces/*/effective-service-tags",
];

fn is_public(path: &str) -> bool {
    PUBLIC_PREFIXES.iter().any(|p| path.starts_with(p))
}

/// Ant-style match for a single pattern: supports a trailing `/**` (prefix
/// match) and `*` single-segment wildcards, plus the Java `startsWith`
/// fallback (`MATCHER.match(p, path) || path.startsWith(p)`).
fn ant_match(pattern: &str, path: &str) -> bool {
    if path.starts_with(pattern) {
        return true;
    }
    if let Some(prefix) = pattern.strip_suffix("/**") {
        return path == prefix || path.starts_with(&format!("{prefix}/"));
    }
    let pp: Vec<&str> = pattern.split('/').collect();
    let sp: Vec<&str> = path.split('/').collect();
    if pp.len() != sp.len() {
        return false;
    }
    pp.iter().zip(sp.iter()).all(|(p, s)| *p == "*" || p == s)
}

fn is_secret_path(path: &str) -> bool {
    SECRET_PATTERNS.iter().any(|p| ant_match(p, path))
}

fn reject(status: StatusCode, msg: &str) -> Response {
    (status, Json(json!({ "error": msg }))).into_response()
}

pub async fn middleware(State(state): State<AppState>, mut req: Request, next: Next) -> Response {
    let path = req.uri().path().to_string();

    if is_public(&path) {
        return next.run(req).await;
    }

    // Capture the inbound propagation context (Bearer, X-PLM-ProjectSpace,
    // X-Job-Id, W3C trace) BEFORE consuming the request and install it as the
    // task-local so our outbound ServiceClient calls re-attach it.
    let rc = platform_lib_rs::RequestContext::from_headers(req.headers());

    // S2S secret paths: shared secret, no Bearer required.
    if is_secret_path(&path) {
        let ok = req
            .headers()
            .get("X-Service-Secret")
            .and_then(|v| v.to_str().ok())
            .map(|s| s == state.config.service_secret)
            .unwrap_or(false);
        if !ok {
            return reject(StatusCode::FORBIDDEN, "Invalid or missing service secret");
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
        _ => return reject(StatusCode::UNAUTHORIZED, "Missing Bearer token"),
    };
    let user = match state.jwt.verify_any(&token) {
        Ok(u) => u,
        Err(_) => return reject(StatusCode::UNAUTHORIZED, "Invalid or expired token"),
    };
    req.extensions_mut().insert(PnoUserContext {
        user_id: user.user_id,
        username: user.username,
        is_admin: user.is_admin,
        role_ids: user.role_ids,
        project_space: user.project_space_id,
        perms: user.perms,
    });
    rc.scope(next.run(req)).await
}
