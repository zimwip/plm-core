//! WebSocket upgrade proxy. The buffered HTTP forward in [`crate::proxy`]
//! cannot carry an `Upgrade` handshake, so WS requests take this path: open a
//! raw HTTP/1 connection to the chosen upstream instance, replay the upgrade
//! request (the auth middleware already swapped in the forward JWT on the
//! `Authorization` header), and once both sides return `101 Switching
//! Protocols`, splice the two upgraded byte streams together.

use axum::{
    body::Body,
    http::{HeaderName, Request, Response, StatusCode},
    response::IntoResponse,
    Json,
};
use bytes::Bytes;
use http_body_util::Empty;
use hyper_util::rt::TokioIo;
use serde_json::json;
use tokio::net::TcpStream;
use tracing_opentelemetry::OpenTelemetrySpanExt;

/// Headers replayed verbatim to the upstream upgrade request. `Host` is set
/// separately; everything else here is the WS handshake plus the forward JWT.
const FORWARD_HEADERS: &[&str] = &[
    "connection",
    "upgrade",
    "sec-websocket-key",
    "sec-websocket-version",
    "sec-websocket-protocol",
    "sec-websocket-extensions",
    "authorization",
    "x-plm-projectspace",
];

pub async fn upgrade(mut req: Request<Body>, base_url: &str, path_q: &str) -> Response<Body> {
    let authority = base_url
        .trim_start_matches("http://")
        .trim_start_matches("https://")
        .split('/')
        .next()
        .unwrap_or("")
        .to_string();
    if authority.is_empty() {
        return err(StatusCode::BAD_GATEWAY, "bad upstream authority");
    }

    let tcp = match TcpStream::connect(&authority).await {
        Ok(s) => s,
        Err(e) => {
            tracing::warn!("ws upstream connect {authority} failed: {e}");
            return err(StatusCode::BAD_GATEWAY, "upstream connect failed");
        }
    };
    let (mut sender, conn) = match hyper::client::conn::http1::handshake(TokioIo::new(tcp)).await {
        Ok(pair) => pair,
        Err(e) => {
            tracing::warn!("ws upstream handshake failed: {e}");
            return err(StatusCode::BAD_GATEWAY, "upstream handshake failed");
        }
    };
    // Drive the connection (with upgrade support) for its lifetime.
    tokio::spawn(async move {
        let _ = conn.with_upgrades().await;
    });

    // Build the upstream upgrade request.
    let mut builder = hyper::Request::builder().method(req.method().clone()).uri(path_q);
    if let Some(h) = builder.headers_mut() {
        if let Ok(host) = authority.parse() {
            h.insert(hyper::header::HOST, host);
        }
        for name in FORWARD_HEADERS {
            if let Some(v) = req.headers().get(*name) {
                h.insert(HeaderName::from_static(name), v.clone());
            }
        }
        // Continue the distributed trace into the ws-gateway upstream.
        platform_lib_rs::telemetry::inject(&tracing::Span::current().context(), h);
    }
    let upreq = match builder.body(Empty::<Bytes>::new()) {
        Ok(r) => r,
        Err(e) => return err(StatusCode::INTERNAL_SERVER_ERROR, &format!("build upstream req: {e}")),
    };

    let mut upstream_resp = match sender.send_request(upreq).await {
        Ok(r) => r,
        Err(e) => {
            tracing::warn!("ws upstream request failed: {e}");
            return err(StatusCode::BAD_GATEWAY, "upstream request failed");
        }
    };

    if upstream_resp.status() != StatusCode::SWITCHING_PROTOCOLS {
        let status = upstream_resp.status();
        tracing::warn!("ws upstream did not upgrade: status {status}");
        return Response::builder()
            .status(status)
            .body(Body::empty())
            .unwrap_or_else(|_| StatusCode::BAD_GATEWAY.into_response());
    }

    // Splice the upgraded streams once both ends complete the handshake.
    let client_on = hyper::upgrade::on(&mut req);
    let upstream_on = hyper::upgrade::on(&mut upstream_resp);
    tokio::spawn(async move {
        match tokio::try_join!(client_on, upstream_on) {
            Ok((client_up, upstream_up)) => {
                let mut c = TokioIo::new(client_up);
                let mut u = TokioIo::new(upstream_up);
                if let Err(e) = tokio::io::copy_bidirectional(&mut c, &mut u).await {
                    tracing::debug!("ws bridge closed: {e}");
                }
            }
            Err(e) => tracing::warn!("ws upgrade join failed: {e}"),
        }
    });

    // Return 101 + the upstream handshake headers so axum upgrades the client.
    let mut out = Response::builder().status(StatusCode::SWITCHING_PROTOCOLS);
    if let Some(hdrs) = out.headers_mut() {
        for (k, v) in upstream_resp.headers() {
            hdrs.insert(k, v.clone());
        }
    }
    out.body(Body::empty())
        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}

fn err(status: StatusCode, message: &str) -> Response<Body> {
    (status, Json(json!({ "error": message }))).into_response()
}
