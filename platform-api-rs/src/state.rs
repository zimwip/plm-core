//! Shared application state, cloned into every handler.

use crate::config::Config;
use crate::pno::PnoClient;
use crate::registry_server::EnvironmentRegistry;
use crate::settings_registry::SettingsRegistry;
use platform_lib_rs::client::ServiceClient;
use platform_lib_rs::jwt::JwtCodec;
use platform_lib_rs::nats::NatsBus;
use platform_lib_rs::registry::LocalServiceRegistry;
use sqlx::PgPool;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub db: PgPool,
    /// The registry SERVER (source of truth: accepts registrations, heartbeats).
    pub registry: Arc<EnvironmentRegistry>,
    /// Mirror consumed by `ServiceClient` for our own outbound S2S resolution.
    pub local_registry: Arc<LocalServiceRegistry>,
    pub nats: Option<Arc<NatsBus>>,
    pub client: Arc<ServiceClient>,
    pub jwt: Arc<JwtCodec>,
    pub pno: Arc<PnoClient>,
    pub settings: Arc<SettingsRegistry>,
    /// Mutable expected-services list (admin CRUD); seeded from config.
    pub expected: Arc<tokio::sync::RwLock<Vec<String>>>,
    /// Shared HTTP client for Vault admin + NATS monitoring (varz).
    pub http: reqwest::Client,
}
