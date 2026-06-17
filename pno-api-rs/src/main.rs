//! pno-api (Rust) — identity & authorization source of truth. Registers WITH
//! platform-api (client-class, like spe-api-rs): no registry server, no token
//! minting. Verifies inbound JWTs / S2S secret, serves the identity + authz
//! model, and publishes change events that drive gateway token revocation.

use axum::{routing::get, Json, Router};
use pno_api_rs::{
    auth, authorization, basket, config::Config, db, events, project_spaces, roles, scopes,
    settings, state::AppState, tokens, user_kv, users,
};
use platform_lib_rs::client::ServiceClient;
use platform_lib_rs::nats::NatsBus;
use platform_lib_rs::registration::{RegistrationConfig, Registrar};
use platform_lib_rs::{JwtCodec, LocalServiceRegistry};
use std::sync::atomic::AtomicI64;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,pno_api_rs=debug".into()),
        )
        .init();

    let config = Arc::new(Config::from_env());
    let _tracer = platform_lib_rs::telemetry::init_tracer("pno-api", &config.otlp_endpoint);

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

    let client = Arc::new(ServiceClient::new(local.clone(), config.service_secret.clone()));
    let jwt = Arc::new(JwtCodec::with_defaults(&config.service_secret).expect("jwt codec"));

    // Load the permission-scope registry from the DB (port of
    // PermissionScopeRegistry.load() at boot).
    let scope_registry = Arc::new(scopes::ScopeRegistry::new());
    if let Err(e) = scope_registry.load(&db).await {
        tracing::warn!("scope registry load failed: {e}");
    }

    let state = AppState {
        config: config.clone(),
        db,
        local_registry: local.clone(),
        nats: nats.clone(),
        client,
        jwt,
        scopes: scope_registry,
        version: Arc::new(AtomicI64::new(events::seed_version())),
    };

    // Subscribe to NATS item events for basket auto-add/remove (port of
    // BasketEventSubscriber). Best-effort; kept alive for the process lifetime.
    if nats.is_some() {
        let subs = basket::spawn_event_subscribers(state.clone()).await;
        std::mem::forget(subs);
    }

    // Register our settings sections with platform-api (Settings page) — boot
    // backoff + re-register on PLATFORM_RESTARTED + periodic.
    settings::spawn(config.clone(), nats.clone());

    // Register WITH platform-api (client-class) + lifecycle (re-register on
    // PLATFORM_RESTARTED, snapshot-pull on ENVIRONMENT_CHANGED).
    let registrar = Registrar::new(
        RegistrationConfig {
            service_code: config.service_code.clone(),
            self_base_url: config.self_base_url.clone(),
            platform_url: config.platform_url.clone(),
            service_secret: config.service_secret.clone(),
            space_tag: String::new(),
            version: "0.1.0".into(),
            extra_paths: vec!["/v3/api-docs/**".into(), "/swagger-ui/**".into()],
            features: vec![],
        },
        local.clone(),
    );
    {
        let registrar = registrar.clone();
        let nats = nats.clone();
        tokio::spawn(async move {
            registrar.register_with_backoff().await;
            let subs = registrar.spawn_lifecycle(nats.map(|n| (*n).clone())).await;
            std::mem::forget(subs);
        });
    }

    let app = Router::new()
        .route("/actuator/health", get(health))
        .merge(users::routes())
        .merge(roles::routes())
        .merge(project_spaces::routes())
        .merge(basket::routes())
        .merge(user_kv::routes())
        .merge(tokens::routes())
        .merge(authorization::routes())
        .merge(scopes::routes())
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth::middleware,
        ))
        .with_state(state);

    let addr = format!("0.0.0.0:{}", config.port);
    let listener = tokio::net::TcpListener::bind(&addr).await.expect("bind");
    tracing::info!("pno-api (rust) listening on {addr}");
    axum::serve(listener, app).await.expect("serve");
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "UP" }))
}
