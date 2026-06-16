//! Tracing middleware: open a server span for each request, parented to the
//! inbound W3C trace context so the gateway continues (never breaks) the
//! distributed trace. The span is current for the whole request, so outbound
//! calls (proxy, pno, ws) inject it via `telemetry::inject`.

use axum::{body::Body, http::Request, middleware::Next, response::Response};
use platform_lib_rs::telemetry;
use tracing::Instrument;
use tracing_opentelemetry::OpenTelemetrySpanExt;

pub async fn trace_mw(req: Request<Body>, next: Next) -> Response {
    let parent = telemetry::extract(req.headers());
    let method = req.method().clone();
    let path = req.uri().path().to_string();

    let span = tracing::info_span!(
        "http.request",
        otel.name = tracing::field::Empty,
        http.request.method = %method,
        url.path = %path,
    );
    span.record("otel.name", format!("{method} {path}"));
    span.set_parent(parent);

    next.run(req).instrument(span).await
}
