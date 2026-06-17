//! Shared application state, cloned into every handler.

use crate::config::Config;
use crate::scopes::ScopeRegistry;
use platform_lib_rs::client::ServiceClient;
use platform_lib_rs::jwt::JwtCodec;
use platform_lib_rs::nats::NatsBus;
use platform_lib_rs::registry::LocalServiceRegistry;
use sqlx::PgPool;
use std::sync::atomic::AtomicI64;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub db: PgPool,
    /// Mirror consumed by `ServiceClient` for our own outbound S2S resolution
    /// and kept fresh by the platform-api registration lifecycle.
    pub local_registry: Arc<LocalServiceRegistry>,
    pub nats: Option<Arc<NatsBus>>,
    pub client: Arc<ServiceClient>,
    pub jwt: Arc<JwtCodec>,
    /// In-memory permission-scope registry (loaded from DB at boot, reloaded
    /// after scope registration). Port of `PermissionScopeRegistry`.
    pub scopes: Arc<ScopeRegistry>,
    /// Monotonic authorization/identity version (`AuthorizationSnapshotVersion`).
    /// Seeded from epoch-millis at boot so a restart never moves it backwards;
    /// bumped on every identity/grant mutation. The gateway reads it via
    /// `/internal/authorization/version` and through NATS `version` fields to
    /// revoke stale tokens.
    pub version: Arc<AtomicI64>,
}

impl AppState {
    /// Current monotonic authorization version.
    pub fn version(&self) -> i64 {
        self.version.load(std::sync::atomic::Ordering::SeqCst)
    }
}
