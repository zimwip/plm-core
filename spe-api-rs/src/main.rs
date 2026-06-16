//! spe-api gateway (Rust). Entry point: load config, build the JWT codec +
//! registry, self-register with platform-api, seed the synthetic `platform`
//! route to avoid cold-start deadlock, then serve the auth endpoints + the
//! reverse-proxy fallback behind the pre-routing auth middleware.

mod auth;
mod config;
mod endpoints;
mod pno;
mod proxy;
mod state;
mod trace;
mod ws;

use axum::{
    middleware,
    routing::{get, post},
    Json, Router,
};
use config::Config;
use platform_lib_rs::dto::{RegistrySnapshot, ServiceInstanceInfo};
use platform_lib_rs::nats::NatsBus;
use platform_lib_rs::registration::{RegistrationConfig, Registrar};
use platform_lib_rs::util::instance_id;
use platform_lib_rs::{JwtCodec, LocalServiceRegistry};
use pno::PnoClients;
use state::AppState;
use std::collections::HashMap;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    let config = match Config::from_env() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("config error: {e}");
            std::process::exit(1);
        }
    };
    init_telemetry(&config);

    let codec = JwtCodec::new(
        &config.service_secret,
        config.forward_ttl,
        config.session_ttl,
        config.operation_max_ttl,
        config.clock_skew_seconds,
    )
    .expect("invalid plm.service.secret");

    let registry = Arc::new(LocalServiceRegistry::new());
    seed_platform_route(&registry, &config.platform_url);

    let pno = PnoClients::new(config.pno_api_url.clone(), config.service_secret.clone());

    // Self-register with platform-api in the background.
    let registrar = Registrar::new(
        RegistrationConfig {
            service_code: "spe".into(),
            self_base_url: config.self_base_url.clone(),
            platform_url: config.platform_url.clone(),
            service_secret: config.service_secret.clone(),
            space_tag: config.space_tag.clone(),
            version: env!("CARGO_PKG_VERSION").into(),
            extra_paths: vec![],
            features: vec![],
        },
        Arc::clone(&registry),
    );
    spawn_registration(Arc::clone(&registrar), &config).await;

    let state = AppState::new(config.clone(), codec, Arc::clone(&registry), pno);

    let app = Router::new()
        .route("/actuator/health", get(health))
        .route("/api/spe/actuator/health", get(health))
        .route("/api/spe/auth/login", post(endpoints::login))
        .route("/api/spe/auth/operation-token", post(endpoints::operation_token))
        .route("/api/spe/auth/logout", post(endpoints::logout))
        .route("/api/spe/auth/me", get(endpoints::me))
        .fallback(proxy::proxy)
        .layer(middleware::from_fn_with_state(state.clone(), auth::auth_mw))
        // Outermost: open a server span from the inbound W3C context so the
        // whole request (auth + proxy) is traced and propagated.
        .layer(middleware::from_fn(trace::trace_mw))
        .with_state(state);

    let addr = format!("0.0.0.0:{}", config.port);
    let listener = tokio::net::TcpListener::bind(&addr).await.expect("bind");
    tracing::info!("spe-api (rust) listening on {addr}");
    axum::serve(listener, app).await.expect("serve");
}

/// Build the OTLP tracer + install the tracing subscriber (fmt logs + OTel
/// export to Jaeger).
fn init_telemetry(config: &Config) {
    use tracing_subscriber::prelude::*;
    let tracer = platform_lib_rs::telemetry::init_tracer("spe-api", &config.otlp_endpoint);
    let otel_layer = tracing_opentelemetry::layer().with_tracer(tracer);
    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "info,spe_api=debug".into());
    tracing_subscriber::registry()
        .with(filter)
        .with(tracing_subscriber::fmt::layer())
        .with(otel_layer)
        .init();
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "UP" }))
}

/// Seed a synthetic `platform` instance so the gateway can route to
/// platform-api before the first registry snapshot arrives (port of
/// `PlatformBootstrapSeed`). Version 0 — any real snapshot supersedes it.
fn seed_platform_route(registry: &LocalServiceRegistry, platform_url: &str) {
    let mut services = HashMap::new();
    services.insert(
        "platform".to_string(),
        vec![ServiceInstanceInfo {
            instance_id: instance_id(platform_url),
            service_code: "platform".into(),
            base_url: platform_url.to_string(),
            version: None,
            space_tag: None,
            healthy: true,
        }],
    );
    registry.update_from_snapshot(RegistrySnapshot { version: 0, services });
}

async fn spawn_registration(registrar: Arc<Registrar>, config: &Config) {
    let nats = if config.nats_enabled {
        match NatsBus::connect(&config.nats_url).await {
            Ok(bus) => Some(bus),
            Err(e) => {
                tracing::warn!("NATS connect failed: {e}; continuing without push refresh");
                None
            }
        }
    } else {
        None
    };

    tokio::spawn(async move {
        registrar.register_with_backoff().await;
        // Keep the NATS subscriptions alive for the process lifetime.
        let subs = registrar.spawn_lifecycle(nats).await;
        std::mem::forget(subs);
    });
}
