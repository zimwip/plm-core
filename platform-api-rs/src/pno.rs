//! Cached pno-api client — user context (roles, isAdmin, global permissions).
//! Port of `PnoApiClient` (Caffeine → moka, 30s TTL). Used by the settings
//! aggregator and UI/items federators for permission filtering. On pno failure
//! it returns an empty context (degraded mode), matching the Java fallback.

use moka::future::Cache;
use platform_lib_rs::client::ServiceClient;
use serde::Deserialize;
use std::sync::Arc;
use std::time::Duration;

/// Subset of pno's user-context response needed for permission filtering.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserCtx {
    #[serde(default)]
    pub user_id: String,
    #[serde(default)]
    pub is_admin: bool,
    /// Global (scope-less) permission codes the user holds.
    #[serde(default)]
    pub global_permissions: Vec<String>,
    /// Role ids the user holds (authoritative — the forward JWT may omit them).
    #[serde(default)]
    pub role_ids: Vec<String>,
}

#[derive(Clone)]
pub struct PnoClient {
    client: Arc<ServiceClient>,
    cache: Cache<String, UserCtx>,
}

impl PnoClient {
    pub fn new(client: Arc<ServiceClient>) -> Self {
        Self {
            client,
            cache: Cache::builder()
                .max_capacity(500)
                .time_to_live(Duration::from_secs(30))
                .build(),
        }
    }

    /// Resolve a user's global permission context, cached 30s. Returns an empty
    /// context (no grants, not admin) if pno is unreachable — degraded mode.
    pub async fn user_context(&self, user_id: &str) -> UserCtx {
        if let Some(c) = self.cache.get(user_id).await {
            return c;
        }
        let path = format!("/users/{user_id}/context");
        let ctx: UserCtx = match self.client.get_json("pno", &path).await {
            Ok(c) => c,
            Err(e) => {
                tracing::warn!("pno user-context for {user_id} failed: {e}; degraded mode");
                UserCtx::default()
            }
        };
        self.cache.insert(user_id.to_string(), ctx.clone()).await;
        ctx
    }
}
