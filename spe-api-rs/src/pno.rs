//! pno-api clients — ports of `PnoContextClient`, `PnoTokenClient`,
//! `ProjectSpaceTagClient`. All calls authenticate with `X-Service-Secret`
//! and cache with the same TTL/size budgets as the Java Caffeine caches.

use moka::future::Cache;
use platform_lib_rs::jwt::UserContext;
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::collections::{HashMap, HashSet};
use std::time::Duration;
use tracing_opentelemetry::OpenTelemetrySpanExt;

/// Headers carrying the injected W3C trace context for an S2S call.
fn trace_headers() -> http::HeaderMap {
    let mut h = http::HeaderMap::new();
    platform_lib_rs::telemetry::inject(&tracing::Span::current().context(), &mut h);
    h
}

/// Effective project-space tag config (port of `ProjectSpaceTagConfig`).
#[derive(Debug, Clone, Default)]
pub struct TagConfig {
    pub isolated: bool,
    pub service_tags: HashMap<String, HashSet<String>>,
}

impl TagConfig {
    pub fn tags_for_service(&self, service_code: &str) -> HashSet<String> {
        self.service_tags.get(service_code).cloned().unwrap_or_default()
    }
}

#[derive(Clone)]
pub struct PnoClients {
    http: reqwest::Client,
    base: String,
    secret: String,
    ctx_cache: Cache<String, UserContext>,
    token_cache: Cache<String, bool>, // positive only
    tag_cache: Cache<String, TagConfig>,
}

impl PnoClients {
    pub fn new(base: impl Into<String>, secret: impl Into<String>) -> Self {
        Self {
            http: reqwest::Client::builder()
                .timeout(Duration::from_secs(3))
                .build()
                .expect("reqwest client"),
            base: base.into(),
            secret: secret.into(),
            ctx_cache: Cache::builder()
                .time_to_live(Duration::from_secs(10))
                .max_capacity(500)
                .build(),
            token_cache: Cache::builder()
                .time_to_live(Duration::from_secs(60))
                .max_capacity(1000)
                .build(),
            tag_cache: Cache::builder()
                .time_to_live(Duration::from_secs(60))
                .max_capacity(200)
                .build(),
        }
    }

    /// Resolve user context. `None` on unknown user or pno error (matches the
    /// Java `Mono.empty()` path, which the filter treats as 401).
    pub async fn get_user_context(&self, user_id: &str, ps: Option<&str>) -> Option<UserContext> {
        if user_id.is_empty() {
            return None;
        }
        let key = format!("{user_id}:{}", ps.unwrap_or(""));
        if let Some(hit) = self.ctx_cache.get(&key).await {
            return Some(hit);
        }
        let mut url = format!("{}/users/{}/context", self.base, user_id);
        if let Some(p) = ps.filter(|p| !p.is_empty()) {
            url.push_str(&format!("?projectSpaceId={p}"));
        }
        let body: Value = self
            .http
            .get(&url)
            .headers(trace_headers())
            .header("X-Service-Secret", &self.secret)
            .send()
            .await
            .ok()?
            .error_for_status()
            .ok()?
            .json()
            .await
            .ok()?;

        let ctx = UserContext {
            user_id: user_id.to_string(),
            username: body.get("username").and_then(|v| v.as_str()).map(String::from),
            role_ids: str_vec(&body, "roleIds"),
            is_admin: body.get("isAdmin").and_then(|v| v.as_bool()).unwrap_or(false),
            project_space_id: ps.map(String::from),
            allowed_service_codes: str_vec(&body, "allowedServiceCodes"),
            perms: str_vec(&body, "globalPermissions"),
            pv: None, // stamped by the caller from the tracked pno version
        };
        self.ctx_cache.insert(key, ctx.clone()).await;
        Some(ctx)
    }

    /// Fetch pno's current authorization/identity version (light endpoint).
    /// Used to seed the gateway's tracked version at boot.
    pub async fn fetch_authz_version(&self) -> Option<i64> {
        let url = format!("{}/internal/authorization/version", self.base);
        let body: Value = self
            .http
            .get(&url)
            .headers(trace_headers())
            .header("X-Service-Secret", &self.secret)
            .send()
            .await
            .ok()?
            .error_for_status()
            .ok()?
            .json()
            .await
            .ok()?;
        body.get("version").and_then(|v| v.as_i64())
    }

    /// The user's configured default project space (`defaultProjectSpaceId`),
    /// used at login to pin the active project. `None` if unset/unknown.
    pub async fn resolve_default_space(&self, user_id: &str) -> Option<String> {
        if user_id.is_empty() {
            return None;
        }
        let url = format!("{}/users/{}/context", self.base, user_id);
        let body: Value = self
            .http
            .get(&url)
            .headers(trace_headers())
            .header("X-Service-Secret", &self.secret)
            .send()
            .await
            .ok()?
            .error_for_status()
            .ok()?
            .json()
            .await
            .ok()?;
        body.get("defaultProjectSpaceId")
            .and_then(|v| v.as_str())
            .filter(|s| !s.is_empty())
            .map(String::from)
    }

    /// Project-space ids the user can access (`GET /project-spaces?userId=`).
    /// Used as the login fallback when no default is set, and to validate a
    /// project switch.
    pub async fn accessible_spaces(&self, user_id: &str) -> Vec<String> {
        if user_id.is_empty() {
            return vec![];
        }
        let url = format!("{}/project-spaces?userId={}", self.base, user_id);
        match self
            .http
            .get(&url)
            .headers(trace_headers())
            .header("X-Service-Secret", &self.secret)
            .send()
            .await
            .ok()
            .and_then(|r| r.error_for_status().ok())
        {
            Some(resp) => match resp.json::<Value>().await {
                Ok(b) => b
                    .as_array()
                    .map(|a| {
                        a.iter()
                            .filter_map(|x| x.get("id").and_then(|v| v.as_str()).map(String::from))
                            .collect()
                    })
                    .unwrap_or_default(),
                Err(_) => vec![],
            },
            None => vec![],
        }
    }

    /// Verify a personal access token (Basic-auth password on /api/dav).
    /// Positive results cached; negatives never (fast revocation).
    pub async fn verify_token(&self, user_id: &str, token: &str) -> bool {
        if user_id.is_empty() || token.is_empty() {
            return false;
        }
        let key = format!("{user_id}:{}", sha256_hex(token));
        if self.token_cache.get(&key).await == Some(true) {
            return true;
        }
        let url = format!("{}/internal/tokens/verify", self.base);
        let valid = self
            .http
            .post(&url)
            .headers(trace_headers())
            .header("X-Service-Secret", &self.secret)
            .json(&serde_json::json!({ "userId": user_id, "token": token }))
            .send()
            .await
            .ok()
            .and_then(|r| r.error_for_status().ok());
        let valid = match valid {
            Some(resp) => resp
                .json::<Value>()
                .await
                .ok()
                .and_then(|b| b.get("valid").and_then(|v| v.as_bool()))
                .unwrap_or(false),
            None => false,
        };
        if valid {
            self.token_cache.insert(key, true).await;
        }
        valid
    }

    /// Effective tag config for a project space. Empty config on error/missing.
    pub async fn get_tag_config(&self, ps: Option<&str>) -> TagConfig {
        let ps = match ps.filter(|p| !p.is_empty()) {
            Some(p) => p,
            None => return TagConfig::default(),
        };
        if let Some(hit) = self.tag_cache.get(ps).await {
            return hit;
        }
        let url = format!("{}/project-spaces/{}/effective-service-tags", self.base, ps);
        let cfg = match self
            .http
            .get(&url)
            .headers(trace_headers())
            .header("X-Service-Secret", &self.secret)
            .send()
            .await
            .ok()
            .and_then(|r| r.error_for_status().ok())
        {
            Some(resp) => match resp.json::<Value>().await {
                Ok(body) => parse_tag_config(&body),
                Err(_) => TagConfig::default(),
            },
            None => TagConfig::default(),
        };
        self.tag_cache.insert(ps.to_string(), cfg.clone()).await;
        cfg
    }
}

fn str_vec(body: &Value, key: &str) -> Vec<String> {
    body.get(key)
        .and_then(|v| v.as_array())
        .map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect())
        .unwrap_or_default()
}

fn parse_tag_config(body: &Value) -> TagConfig {
    let isolated = body.get("isolated").and_then(|v| v.as_bool()).unwrap_or(false);
    let mut service_tags = HashMap::new();
    if let Some(map) = body.get("serviceTags").and_then(|v| v.as_object()) {
        for (svc, tags) in map {
            let set: HashSet<String> = tags
                .as_array()
                .map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect())
                .unwrap_or_default();
            service_tags.insert(svc.clone(), set);
        }
    }
    TagConfig { isolated, service_tags }
}

fn sha256_hex(value: &str) -> String {
    hex::encode(Sha256::digest(value.as_bytes()))
}
