//! Reverse-proxy fallback handler — ports `GatewayRouteConfig` +
//! `SvcLoadBalancerFilter`. Resolves `/api/<serviceCode>/...` to a live
//! instance (tag-aware round-robin) and forwards the request verbatim,
//! streaming both the request and response bodies.
//!
//! WebSocket upgrades (`/api/ws`) are NOT yet proxied here — see the TODO
//! below. The Java gateway relies on Spring Cloud Gateway's WS routing; the
//! Rust equivalent needs a hyper/axum upgrade bridge and is tracked as a
//! follow-up so large-CAD HTTP traffic can land first.

use crate::auth::AuthedContext;
use crate::state::AppState;
use axum::{
    body::Body,
    extract::State,
    http::{header, HeaderMap, Request, StatusCode},
    response::{IntoResponse, Response},
    Extension, Json,
};
use futures::TryStreamExt;
use serde_json::json;
use tracing_opentelemetry::OpenTelemetrySpanExt;

/// Hop-by-hop headers that must not be forwarded (RFC 7230 §6.1) plus `host`.
const HOP_BY_HOP: &[&str] = &[
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
];

pub async fn proxy(
    State(state): State<AppState>,
    ext: Option<Extension<AuthedContext>>,
    req: Request<Body>,
) -> Response {
    let path = req.uri().path().to_string();

    let service_code = match extract_service_code(&path) {
        Some(c) => c,
        None => return error(StatusCode::NOT_FOUND, "No route"),
    };

    // Project space drives tag affinity: prefer the authenticated context,
    // fall back to the header (mirrors SvcLoadBalancerFilter).
    let ps = ext
        .as_ref()
        .and_then(|e| e.project_space.clone())
        .or_else(|| header_str(req.headers(), "X-PLM-ProjectSpace"));

    let tag_config = state.pno.get_tag_config(ps.as_deref()).await;
    let required_tags = tag_config.tags_for_service(&service_code);

    let instance = match state.pick_instance_by_tags(&service_code, &required_tags, tag_config.isolated) {
        Some(i) => i,
        None => {
            tracing::warn!(
                "no instance for {service_code} (ps={:?}, tags={:?}, isolated={})",
                ps, required_tags, tag_config.isolated
            );
            return error(
                StatusCode::SERVICE_UNAVAILABLE,
                &format!("No instance available for service {service_code}"),
            );
        }
    };

    // Strip the /api/<code> prefix: the gateway owns route segregation, the
    // backend serves at root. /api/psm/nodes -> /nodes ; /api/psm -> /
    let stripped = strip_service_prefix(&path, &service_code);
    let query = req.uri().query().map(|q| format!("?{q}")).unwrap_or_default();
    let path_q = format!("{stripped}{query}");

    // WebSocket upgrades (e.g. /api/ws -> svc://ws) need a raw byte bridge, not
    // the buffered/streamed HTTP forward below.
    if is_websocket_upgrade(req.headers()) {
        return crate::ws::upgrade(req, &instance.base_url, &path_q).await;
    }

    let target = format!("{}{}", instance.base_url.trim_end_matches('/'), path_q);

    let (parts, body) = req.into_parts();

    // Forward all headers except hop-by-hop; Authorization already holds the
    // forward JWT (swapped by the auth middleware).
    let mut headers = parts.headers.clone();
    for h in HOP_BY_HOP {
        headers.remove(*h);
    }
    headers.insert("X-PLM-Service-Code", service_code.parse().expect("valid header value"));
    // Propagate the trace: inject the current span's W3C context so the
    // backend continues the same distributed trace.
    platform_lib_rs::telemetry::inject(&tracing::Span::current().context(), &mut headers);

    let upstream_body = reqwest::Body::wrap_stream(body.into_data_stream());

    let resp = state
        .http
        .request(parts.method, &target)
        .headers(headers)
        .body(upstream_body)
        .send()
        .await;

    match resp {
        Ok(upstream) => build_response(upstream),
        Err(e) => {
            tracing::warn!("upstream {service_code} error: {e}");
            error(StatusCode::BAD_GATEWAY, "Upstream request failed")
        }
    }
}

fn build_response(upstream: reqwest::Response) -> Response {
    let status = upstream.status();
    let mut builder = Response::builder().status(status);
    if let Some(hdrs) = builder.headers_mut() {
        for (k, v) in upstream.headers() {
            if HOP_BY_HOP.contains(&k.as_str()) {
                continue;
            }
            hdrs.insert(k, v.clone());
        }
    }
    let stream = upstream.bytes_stream().map_err(std::io::Error::other);
    builder
        .body(Body::from_stream(stream))
        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}

fn extract_service_code(path: &str) -> Option<String> {
    let rest = path.strip_prefix("/api/")?;
    let code = rest.split('/').next().unwrap_or("");
    if code.is_empty() || code == "spe" {
        None
    } else {
        Some(code.to_string())
    }
}

/// Remove the leading `/api/<code>` segment so the backend receives a root path.
/// `/api/psm/nodes` -> `/nodes`, `/api/psm` -> `/`.
fn strip_service_prefix(path: &str, service_code: &str) -> String {
    let prefix = format!("/api/{service_code}");
    match path.strip_prefix(&prefix) {
        Some("") | None => "/".to_string(),
        Some(rest) => rest.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_service_prefix() {
        assert_eq!(strip_service_prefix("/api/psm/nodes", "psm"), "/nodes");
        assert_eq!(strip_service_prefix("/api/psm", "psm"), "/");
        assert_eq!(strip_service_prefix("/api/psm/", "psm"), "/");
        assert_eq!(strip_service_prefix("/api/dav/a/b", "dav"), "/a/b");
        assert_eq!(strip_service_prefix("/api/psm/internal/x", "psm"), "/internal/x");
    }
}

/// True for a WebSocket upgrade request: `Connection: Upgrade` (token list)
/// plus `Upgrade: websocket`.
fn is_websocket_upgrade(headers: &HeaderMap) -> bool {
    let conn_upgrade = headers
        .get(header::CONNECTION)
        .and_then(|v| v.to_str().ok())
        .is_some_and(|v| v.split(',').any(|p| p.trim().eq_ignore_ascii_case("upgrade")));
    let ws = headers
        .get(header::UPGRADE)
        .and_then(|v| v.to_str().ok())
        .is_some_and(|v| v.eq_ignore_ascii_case("websocket"));
    conn_upgrade && ws
}

fn header_str(headers: &HeaderMap, name: &str) -> Option<String> {
    headers
        .get(name)
        .and_then(|v| v.to_str().ok())
        .filter(|s| !s.is_empty())
        .map(str::to_string)
}

fn error(status: StatusCode, message: &str) -> Response {
    (status, Json(json!({ "error": message }))).into_response()
}
