//! Self-registration with platform-api — port of
//! `com.plm.platform.environment.PlatformRegistrationClient`.
//!
//! On start: POST a [`RegisterRequest`] to
//! `/api/platform/internal/environment/register` (retry with backoff), pull
//! the registry snapshot to bootstrap [`LocalServiceRegistry`], then keep it
//! fresh via a 5-minute periodic re-register plus NATS events
//! (`PLATFORM_RESTARTED` → re-register, `ENVIRONMENT_CHANGED` → pull). On
//! shutdown: best-effort DELETE by instance id.

use crate::dto::{RegisterRequest, RegisterResponse, RegistrySnapshot};
use crate::error::{PlatformError, Result};
use crate::nats::NatsBus;
use crate::registry::LocalServiceRegistry;
use crate::util::instance_id;
use std::sync::{Arc, Mutex};
use std::time::Duration;

// Bare paths — direct S2S calls bypass the gateway; platform-api serves
// internal endpoints at root (gateway-strip routing).
const REGISTER_PATH: &str = "/internal/environment/register";
const SNAPSHOT_PATH: &str = "/internal/environment/snapshot";
const RE_REGISTER_PERIOD: Duration = Duration::from_secs(300);

#[derive(Debug, Clone)]
pub struct RegistrationConfig {
    pub service_code: String,
    pub self_base_url: String,
    pub platform_url: String,
    pub service_secret: String,
    pub space_tag: String,
    pub version: String,
    pub extra_paths: Vec<String>,
    pub features: Vec<String>,
}

impl RegistrationConfig {
    fn route_prefix(&self) -> String {
        // Gateway-facing: the prefix spe-api matches before stripping.
        format!("/api/{}/**", self.service_code)
    }
    fn health_url(&self) -> String {
        // Bare — health checks hit the instance directly, which serves
        // actuator at root (gateway-strip routing).
        format!("{}/actuator/health", self.self_base_url.trim_end_matches('/'))
    }
    fn to_request(&self) -> RegisterRequest {
        RegisterRequest {
            service_code: self.service_code.clone(),
            base_url: self.self_base_url.clone(),
            health_url: self.health_url(),
            route_prefix: self.route_prefix(),
            extra_paths: self.extra_paths.clone(),
            version: self.version.clone(),
            space_tag: self.space_tag.clone(),
            features: self.features.clone(),
        }
    }
}

pub struct Registrar {
    http: reqwest::Client,
    registry: Arc<LocalServiceRegistry>,
    config: RegistrationConfig,
    instance_id: Mutex<String>,
}

impl Registrar {
    pub fn new(config: RegistrationConfig, registry: Arc<LocalServiceRegistry>) -> Arc<Self> {
        // Deterministic fallback id (server echoes the same value).
        let id = instance_id(&config.self_base_url);
        Arc::new(Self {
            http: reqwest::Client::new(),
            registry,
            config,
            instance_id: Mutex::new(id),
        })
    }

    pub fn instance_id(&self) -> String {
        self.instance_id.lock().unwrap().clone()
    }

    /// POST registration, then pull the snapshot. Returns Ok only if the POST
    /// succeeds.
    pub async fn register_once(&self) -> Result<()> {
        let url = format!("{}{}", self.config.platform_url, REGISTER_PATH);
        let resp = self
            .http
            .post(&url)
            .header("X-Service-Secret", &self.config.service_secret)
            .json(&self.config.to_request())
            .send()
            .await?;
        let status = resp.status().as_u16();
        if status >= 400 {
            let body = resp.text().await.unwrap_or_default();
            return Err(PlatformError::UpstreamStatus { status, body });
        }
        if let Ok(parsed) = resp.json::<RegisterResponse>().await {
            if let Some(id) = parsed.instance_id {
                *self.instance_id.lock().unwrap() = id;
            }
        }
        self.pull_snapshot().await;
        Ok(())
    }

    pub async fn pull_snapshot(&self) {
        let url = format!("{}{}", self.config.platform_url, SNAPSHOT_PATH);
        match self
            .http
            .get(&url)
            .header("X-Service-Secret", &self.config.service_secret)
            .send()
            .await
        {
            Ok(resp) if resp.status().is_success() => {
                match resp.json::<RegistrySnapshot>().await {
                    Ok(snapshot) => {
                        let v = snapshot.version;
                        let n = snapshot.services.len();
                        self.registry.update_from_snapshot(snapshot);
                        tracing::debug!("registry refreshed: {n} services (snapshot v{v})");
                    }
                    Err(e) => tracing::warn!("snapshot decode failed: {e}"),
                }
            }
            Ok(resp) => tracing::warn!("snapshot pull status {}", resp.status()),
            Err(e) => tracing::warn!("snapshot pull failed: {e}"),
        }
    }

    pub async fn deregister(&self) {
        let id = self.instance_id();
        let url = format!(
            "{}{}/{}/instances/{}",
            self.config.platform_url, REGISTER_PATH, self.config.service_code, id
        );
        let _ = self
            .http
            .delete(&url)
            .header("X-Service-Secret", &self.config.service_secret)
            .send()
            .await;
        tracing::info!("deregistered instance {id} from platform-api");
    }

    /// Initial registration with exponential backoff, retrying indefinitely
    /// until platform-api answers (mirrors Java sync + background retry).
    pub async fn register_with_backoff(&self) {
        let backoff_ms = [500u64, 1_000, 2_000, 4_000, 8_000, 15_000, 30_000];
        let mut i = 0usize;
        loop {
            match self.register_once().await {
                Ok(()) => {
                    tracing::info!(
                        "registered with platform-api as instance {} (tag: {})",
                        self.instance_id(),
                        if self.config.space_tag.is_empty() { "untagged" } else { &self.config.space_tag }
                    );
                    return;
                }
                Err(e) => {
                    let wait = backoff_ms[i.min(backoff_ms.len() - 1)];
                    tracing::warn!("platform-api registration failed: {e}; retry in {wait}ms");
                    tokio::time::sleep(Duration::from_millis(wait)).await;
                    i += 1;
                }
            }
        }
    }

    /// Spawn background lifecycle: NATS subscriptions + periodic re-register.
    /// Call after [`Registrar::register_with_backoff`]. Returns the NATS
    /// subscriptions (keep them alive for the process lifetime).
    pub async fn spawn_lifecycle(self: &Arc<Self>, nats: Option<NatsBus>) -> Vec<crate::nats::Subscription> {
        let mut subs = Vec::new();

        if let Some(bus) = nats {
            let me = Arc::clone(self);
            if let Ok(sub) = bus
                .subscribe("env.global.PLATFORM_RESTARTED", move |_msg| {
                    let me = Arc::clone(&me);
                    tokio::spawn(async move {
                        tokio::time::sleep(Duration::from_secs(2)).await;
                        // platform-api's registry version reset on restart;
                        // drop our monotonic baseline so the fresh snapshot is
                        // accepted instead of rejected as stale.
                        me.registry.reset_version();
                        if me.register_once().await.is_ok() {
                            tracing::info!("re-registered after PLATFORM_RESTARTED");
                        }
                    });
                })
                .await
            {
                subs.push(sub);
            }

            let me2 = Arc::clone(self);
            if let Ok(sub) = bus
                .subscribe("env.global.ENVIRONMENT_CHANGED", move |_msg| {
                    let me2 = Arc::clone(&me2);
                    tokio::spawn(async move {
                        me2.pull_snapshot().await;
                    });
                })
                .await
            {
                subs.push(sub);
            }
        }

        // Periodic re-register.
        let me = Arc::clone(self);
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(RE_REGISTER_PERIOD).await;
                if me.register_once().await.is_ok() {
                    tracing::debug!("periodic re-register ok");
                }
            }
        });

        subs
    }
}
