//! Pre-routing auth middleware — port of `com.spe.auth.AuthenticationFilter`.
//!
//! Runs on every request. Exempts public paths; on `/api/dav` accepts Basic
//! (personal access token verified S2S); elsewhere requires a Bearer session
//! token (or `?token=` for `/api/ws`). Resolves the user via pno, gates on
//! `allowedServiceCodes`, mints a short-lived forward JWT and swaps it into the
//! `Authorization` header before the request is proxied.

use crate::state::AppState;
use axum::{
    body::Body,
    extract::State,
    http::{header, Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use base64::Engine;
use platform_lib_rs::jwt::UserContext;
use serde_json::json;

/// Stashed in request extensions after successful auth; read by the proxy
/// (for tag-aware routing) and by the local auth endpoints (`/me`, etc.).
#[derive(Clone)]
pub struct AuthedContext {
    pub user: UserContext,
    pub project_space: Option<String>,
}

pub async fn auth_mw(
    State(state): State<AppState>,
    mut req: Request<Body>,
    next: Next,
) -> Response {
    let path = req.uri().path().to_string();

    if is_exempt(&path) {
        return next.run(req).await;
    }

    let authz = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .map(str::to_string);

    // ── /api/dav: Basic auth, password = personal access token ──────────
    if path.starts_with("/api/dav") {
        let creds = authz.as_deref().and_then(decode_basic);
        let creds = match creds {
            Some(c) if !c.password.is_empty() => c,
            _ => return dav_unauthorized("Basic credentials required"),
        };
        let basic_ps = req
            .headers()
            .get("X-PLM-ProjectSpace")
            .and_then(|v| v.to_str().ok())
            .filter(|s| !s.is_empty())
            .map(str::to_string);
        if state.pno.verify_token(&creds.user_id, &creds.password).await {
            return resolve_and_forward(
                state, req, next, &creds.user_id, basic_ps, extract_service_code(&path),
            )
            .await;
        }
        return dav_unauthorized("Invalid access token");
    }

    // ── Bearer (or ?token= on the WS upgrade) ──────────────────────────
    let token = match authz.as_deref() {
        Some(a) if a.starts_with("Bearer ") => Some(a["Bearer ".len()..].trim().to_string()),
        _ if path.starts_with("/api/ws") => query_param(&req, "token"),
        _ => None,
    };
    let token = match token {
        Some(t) if !t.is_empty() => t,
        _ => return error(StatusCode::UNAUTHORIZED, "Missing Bearer session token"),
    };

    // ── operation-token elevation: caller presents a forward JWT ────────
    if path == "/api/spe/auth/operation-token" {
        match state.codec.verify_forward(&token) {
            Ok(ctx) => {
                req.extensions_mut().insert(AuthedContext {
                    user: ctx,
                    project_space: None,
                });
                return next.run(req).await;
            }
            Err(_) => return error(StatusCode::UNAUTHORIZED, "Valid forward JWT required for operation token"),
        }
    }

    // ── normal session path ─────────────────────────────────────────────
    let session = match state.codec.verify_session(&token) {
        Ok(s) => s,
        Err(_) => return error(StatusCode::UNAUTHORIZED, "Invalid or expired session token"),
    };
    let ps_header = req
        .headers()
        .get("X-PLM-ProjectSpace")
        .and_then(|v| v.to_str().ok())
        .filter(|s| !s.is_empty())
        .map(str::to_string);
    let ps = ps_header.or(session.project_space_id);

    resolve_and_forward(state, req, next, &session.user_id, ps, extract_service_code(&path)).await
}

/// Shared tail: resolve user, gate on service code, mint forward JWT, swap header.
async fn resolve_and_forward(
    state: AppState,
    mut req: Request<Body>,
    next: Next,
    user_id: &str,
    ps: Option<String>,
    service_code: Option<String>,
) -> Response {
    let ctx = match state.pno.get_user_context(user_id, ps.as_deref()).await {
        Some(c) => c,
        None => return error(StatusCode::UNAUTHORIZED, "User no longer resolvable"),
    };

    if let Some(code) = &service_code {
        if !ctx.is_admin && !ctx.allowed_service_codes.iter().any(|c| c == code) {
            return error(
                StatusCode::FORBIDDEN,
                &format!("Access to service '{code}' not granted"),
            );
        }
    }

    let fwd = match state.codec.mint_forward(&ctx) {
        Ok(t) => t,
        Err(e) => return error(StatusCode::INTERNAL_SERVER_ERROR, &format!("mint failed: {e}")),
    };

    let headers = req.headers_mut();
    headers.remove("X-PLM-User");
    headers.remove("X-Job-Id"); // internal only — set by S2S services, never accepted from clients
    headers.insert(
        header::AUTHORIZATION,
        format!("Bearer {fwd}").parse().expect("valid header"),
    );

    req.extensions_mut().insert(AuthedContext {
        user: ctx,
        project_space: ps,
    });
    next.run(req).await
}

fn is_exempt(path: &str) -> bool {
    path.starts_with("/actuator")
        || path.starts_with("/api/spe/actuator")
        || path == "/api/spe/auth/login"
        || path == "/api/spe/auth/logout"
        || path == "/api/platform/status"
        || path.starts_with("/api/platform/status/")
        || is_ui_bundle_path(path)
}

/// `/api/<serviceCode>/ui/**` — static plugin bundles loaded via dynamic
/// import(), which cannot attach Authorization headers.
fn is_ui_bundle_path(path: &str) -> bool {
    if !path.starts_with("/api/") {
        return false;
    }
    match path[5..].find('/') {
        Some(rel) => path[5 + rel..].starts_with("/ui/"),
        None => false,
    }
}

/// serviceCode segment of `/api/<code>/...`; None for `/api/spe/...`.
fn extract_service_code(path: &str) -> Option<String> {
    let rest = path.strip_prefix("/api/")?;
    let code = rest.split('/').next().unwrap_or("");
    if code.is_empty() || code == "spe" {
        None
    } else {
        Some(code.to_string())
    }
}

struct BasicCredentials {
    user_id: String,
    password: String,
}

fn decode_basic(authz: &str) -> Option<BasicCredentials> {
    let b64 = authz.strip_prefix("Basic ")?.trim();
    let decoded = base64::engine::general_purpose::STANDARD.decode(b64).ok()?;
    let decoded = String::from_utf8(decoded).ok()?;
    let colon = decoded.find(':')?;
    let user = &decoded[..colon];
    if user.is_empty() {
        return None;
    }
    Some(BasicCredentials {
        user_id: user.to_string(),
        password: decoded[colon + 1..].to_string(),
    })
}

fn query_param(req: &Request<Body>, key: &str) -> Option<String> {
    req.uri().query().and_then(|q| {
        q.split('&').find_map(|pair| {
            let (k, v) = pair.split_once('=')?;
            (k == key).then(|| v.to_string())
        })
    })
}

fn error(status: StatusCode, message: &str) -> Response {
    (status, Json(json!({ "error": message }))).into_response()
}

fn dav_unauthorized(message: &str) -> Response {
    (
        StatusCode::UNAUTHORIZED,
        [("WWW-Authenticate", "Basic realm=\"PLM\"")],
        Json(json!({ "error": message })),
    )
        .into_response()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extract_service_code_cases() {
        assert_eq!(extract_service_code("/api/psm/nodes").as_deref(), Some("psm"));
        assert_eq!(extract_service_code("/api/pno").as_deref(), Some("pno"));
        assert_eq!(extract_service_code("/api/spe/auth/me"), None);
        assert_eq!(extract_service_code("/actuator/health"), None);
        assert_eq!(extract_service_code("/api/"), None);
    }

    #[test]
    fn ui_bundle_paths() {
        assert!(is_ui_bundle_path("/api/psm/ui/widget.js"));
        assert!(!is_ui_bundle_path("/api/psm/nodes"));
        assert!(!is_ui_bundle_path("/api/psm"));
        assert!(!is_ui_bundle_path("/ui/x"));
    }

    #[test]
    fn exemptions() {
        assert!(is_exempt("/actuator/health"));
        assert!(is_exempt("/api/spe/actuator/health"));
        assert!(is_exempt("/api/spe/auth/login"));
        assert!(is_exempt("/api/spe/auth/logout"));
        assert!(is_exempt("/api/platform/status"));
        assert!(is_exempt("/api/platform/status/nats"));
        assert!(!is_exempt("/api/spe/auth/me"));
        assert!(!is_exempt("/api/psm/nodes"));
    }

    #[test]
    fn basic_decode() {
        // base64("alice:tok") = YWxpY2U6dG9r
        let c = decode_basic("Basic YWxpY2U6dG9r").unwrap();
        assert_eq!(c.user_id, "alice");
        assert_eq!(c.password, "tok");
        assert!(decode_basic("Bearer x").is_none());
        // empty user rejected
        assert!(decode_basic("Basic OnBhc3M=").is_none()); // ":pass"
    }
}
