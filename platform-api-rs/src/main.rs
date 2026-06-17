//! platform-api (Rust) — environment registry, algorithm/action catalog,
//! settings aggregator, status, federation, and Vault admin. Wire-compatible
//! with the Java platform-api; serves at root (gateway strips /api/platform).

use axum::{routing::get, Json, Router};
use platform_api_rs::{
    admin, auth, catalog, config::Config, db, federation, pno::PnoClient,
    registry_server::{self, EnvironmentRegistry},
    settings, settings_registry::SettingsRegistry, state::AppState, status, vault,
};
use platform_lib_rs::client::ServiceClient;
use platform_lib_rs::dto::RegisterRequest;
use platform_lib_rs::nats::NatsBus;
use platform_lib_rs::{JwtCodec, LocalServiceRegistry};
use std::sync::Arc;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,platform_api_rs=debug".into()),
        )
        .init();

    let config = Arc::new(Config::from_env());
    let _tracer = platform_lib_rs::telemetry::init_tracer("platform-api", &config.otlp_endpoint);

    let db = db::init(&config).await.expect("db init/migrate");

    let local = Arc::new(LocalServiceRegistry::new());
    let nats = if config.nats_enabled {
        match NatsBus::connect(&config.nats_url).await {
            Ok(b) => Some(Arc::new(b)),
            Err(e) => {
                tracing::warn!("NATS connect failed: {e}; running without it");
                None
            }
        }
    } else {
        None
    };

    let registry = Arc::new(EnvironmentRegistry::new(local.clone(), nats.clone()));
    let client = Arc::new(ServiceClient::new(local.clone(), config.service_secret.clone()));
    let jwt = Arc::new(JwtCodec::with_defaults(&config.service_secret).expect("jwt codec"));
    let pno = Arc::new(PnoClient::new(client.clone()));
    let settings_reg = Arc::new(SettingsRegistry::new());

    let state = AppState {
        config: config.clone(),
        db,
        registry: registry.clone(),
        local_registry: local,
        nats,
        client,
        jwt,
        pno,
        settings: settings_reg,
        expected: Arc::new(tokio::sync::RwLock::new(config.expected_services.clone())),
        http: reqwest::Client::new(),
    };

    // Self-register platform-api into its own registry (in-process, no HTTP
    // self-call) so it appears in snapshots and our mirror resolves it.
    let base = config.self_base_url.trim_end_matches('/').to_string();
    registry.register(&RegisterRequest {
        service_code: "platform".into(),
        base_url: base.clone(),
        health_url: format!("{base}/actuator/health"),
        route_prefix: "/api/platform/**".into(),
        extra_paths: vec![],
        version: "0.1.0".into(),
        space_tag: String::new(),
        features: vec![],
    });

    // Self-register platform-api's own settings sections (PLATFORM + HELP groups).
    settings::register_own_sections(&state.settings);

    // Announce restart so every service re-registers immediately (environment
    // AND settings sections) rather than waiting for its periodic cycle —
    // mirrors the Java `PlatformStartupNotifier`. Delayed so our HTTP server is
    // accepting the re-registration POSTs by the time they arrive.
    if let Some(nats) = state.nats.clone() {
        tokio::spawn(async move {
            tokio::time::sleep(std::time::Duration::from_millis(1500)).await;
            let payload = serde_json::to_vec(
                &serde_json::json!({ "startedAt": chrono::Utc::now().to_rfc3339() }),
            )
            .unwrap_or_default();
            match nats.publish("env.global.PLATFORM_RESTARTED", payload).await {
                Ok(_) => tracing::info!("PLATFORM_RESTARTED published"),
                Err(e) => tracing::warn!("publish PLATFORM_RESTARTED failed: {e}"),
            }
        });
    }

    // Heartbeat: probe registered instances, evict after N failures.
    registry_server::spawn_heartbeat(
        registry.clone(),
        config.heartbeat_interval_ms,
        config.heartbeat_timeout_ms,
        config.heartbeat_failure_threshold,
    );

    // Catalog stats aggregator (NATS ALGORITHM_STATS_PUBLISHED) + outbox poller.
    catalog::spawn_background(state.clone());

    let app = Router::new()
        .route("/actuator/health", get(health))
        .merge(registry_server::routes())
        .merge(admin::routes())
        .merge(catalog::routes())
        .merge(settings::routes())
        .merge(status::routes())
        .merge(federation::routes())
        .merge(vault::routes())
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth::middleware,
        ))
        .with_state(state);

    let addr = format!("0.0.0.0:{}", config.port);
    let listener = tokio::net::TcpListener::bind(&addr).await.expect("bind");
    tracing::info!("platform-api (rust) listening on {addr}");
    axum::serve(listener, app).await.expect("serve");
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "UP" }))
}
