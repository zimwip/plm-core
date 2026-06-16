//! OpenTelemetry tracing — OTLP/HTTP export + W3C trace-context propagation.
//!
//! Replaces the Micrometer/OTel bridge the Java services use, so Rust services
//! emit spans to the same Jaeger collector and keep the distributed trace
//! continuous across the Java↔Rust boundary.
//!
//! - [`init_tracer`] builds an OTLP exporter (batched), installs the global
//!   tracer provider and the W3C `TraceContextPropagator`, and returns the
//!   `Tracer` to attach to a `tracing` subscriber layer.
//! - [`extract`] / [`inject`] move the trace context in/out of HTTP headers so
//!   inbound requests continue an existing trace and outbound calls carry it.

use opentelemetry::global;
use opentelemetry::propagation::{Extractor, Injector};
use opentelemetry::trace::TracerProvider as _;
use opentelemetry::{Context, KeyValue};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::propagation::TraceContextPropagator;
use opentelemetry_sdk::trace::{Tracer, TracerProvider as SdkTracerProvider};
use opentelemetry_sdk::Resource;

/// Build the OTLP pipeline and install global state. `otlp_endpoint` is the
/// collector base (e.g. `http://jaeger:4318`); `/v1/traces` is appended.
/// Returns the tracer to wire into a `tracing_opentelemetry` layer.
pub fn init_tracer(service_name: &str, otlp_endpoint: &str) -> Tracer {
    global::set_text_map_propagator(TraceContextPropagator::new());

    let endpoint = format!("{}/v1/traces", otlp_endpoint.trim_end_matches('/'));
    let exporter = opentelemetry_otlp::SpanExporter::builder()
        .with_http()
        .with_endpoint(endpoint)
        .build()
        .expect("build OTLP span exporter");

    let provider = SdkTracerProvider::builder()
        .with_batch_exporter(exporter, opentelemetry_sdk::runtime::Tokio)
        .with_resource(Resource::new([KeyValue::new(
            "service.name",
            service_name.to_string(),
        )]))
        .build();

    let tracer = provider.tracer(service_name.to_string());
    global::set_tracer_provider(provider);
    tracer
}

struct HeaderExtractor<'a>(&'a http::HeaderMap);

impl Extractor for HeaderExtractor<'_> {
    fn get(&self, key: &str) -> Option<&str> {
        self.0.get(key).and_then(|v| v.to_str().ok())
    }
    fn keys(&self) -> Vec<&str> {
        self.0.keys().map(|k| k.as_str()).collect()
    }
}

struct HeaderInjector<'a>(&'a mut http::HeaderMap);

impl Injector for HeaderInjector<'_> {
    fn set(&mut self, key: &str, value: String) {
        if let (Ok(name), Ok(val)) = (
            http::header::HeaderName::from_bytes(key.as_bytes()),
            http::HeaderValue::from_str(&value),
        ) {
            self.0.insert(name, val);
        }
    }
}

/// Extract the W3C trace context from inbound request headers.
pub fn extract(headers: &http::HeaderMap) -> Context {
    global::get_text_map_propagator(|p| p.extract(&HeaderExtractor(headers)))
}

/// Inject the given context as `traceparent`/`tracestate` into outbound headers.
pub fn inject(cx: &Context, headers: &mut http::HeaderMap) {
    global::get_text_map_propagator(|p| p.inject_context(cx, &mut HeaderInjector(headers)));
}
