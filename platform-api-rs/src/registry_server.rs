//! Environment registry SERVER — the mesh source of truth. Port of
//! `com.plm.platform.api.environment.{EnvironmentRegistry,
//! EnvironmentRegistryController, EnvironmentHeartbeatScheduler}`.
//!
//! Holds the live set of registered service instances, derives a monotonic
//! revision on every mutation, mirrors itself into the local `ServiceClient`
//! registry, publishes `env.global.ENVIRONMENT_CHANGED` on NATS, and probes
//! each instance's health URL on a schedule (evicting after N failures).

use crate::state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use chrono::Utc;
use dashmap::DashMap;
use platform_lib_rs::dto::{RegisterRequest, RegisterResponse, RegistrySnapshot, ServiceInstanceInfo};
use platform_lib_rs::nats::NatsBus;
use platform_lib_rs::registry::LocalServiceRegistry;
use platform_lib_rs::util::instance_id;
use serde::Serialize;
use std::collections::HashMap;
use std::sync::atomic::{AtomicI64, Ordering};
use std::sync::Arc;
use std::time::Duration;

const ENV_CHANGED_SUBJECT: &str = "env.global.ENVIRONMENT_CHANGED";

/// One stored registration — the full Java `ServiceRegistration` field set.
#[derive(Debug, Clone)]
pub struct Registration {
    pub instance_id: String,
    pub service_code: String,
    pub base_url: String,
    pub health_url: String,
    pub route_prefix: String,
    pub extra_paths: Vec<String>,
    pub version: Option<String>,
    pub space_tag: Option<String>,
    pub features: Vec<String>,
    pub healthy: bool,
    pub consecutive_failures: u32,
    pub registered_at: i64,
    pub last_heartbeat_ok: Option<i64>,
}

/// Detailed per-instance view for `/status`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstanceStatus {
    pub instance_id: String,
    pub service_code: String,
    pub base_url: String,
    pub healthy: bool,
    pub consecutive_failures: u32,
    pub registered_at: i64,
    pub last_heartbeat_ok: Option<i64>,
    pub space_tag: Option<String>,
    pub version: Option<String>,
    pub route_prefix: String,
}

/// serviceCode → (instanceId → Registration). Mirrors the Java
/// `ConcurrentHashMap<String, ConcurrentHashMap<String, ServiceRegistration>>`.
pub struct EnvironmentRegistry {
    by_service: DashMap<String, DashMap<String, Registration>>,
    revision: AtomicI64,
    /// Mirror kept fresh for our own outbound `ServiceClient` resolution.
    local: Arc<LocalServiceRegistry>,
    nats: Option<Arc<NatsBus>>,
}

impl EnvironmentRegistry {
    pub fn new(local: Arc<LocalServiceRegistry>, nats: Option<Arc<NatsBus>>) -> Self {
        Self {
            by_service: DashMap::new(),
            revision: AtomicI64::new(0),
            local,
            nats,
        }
    }

    fn now_ms() -> i64 {
        Utc::now().timestamp_millis()
    }

    /// Register (or replace) an instance; returns its instanceId. Derives the id
    /// from the baseUrl so a re-registering pod replaces its own entry.
    pub fn register(&self, req: &RegisterRequest) -> String {
        let id = instance_id(&req.base_url);
        let tag = match req.space_tag.trim() {
            "" => None,
            t => Some(t.to_string()),
        };
        let reg = Registration {
            instance_id: id.clone(),
            service_code: req.service_code.clone(),
            base_url: req.base_url.clone(),
            health_url: req.health_url.clone(),
            route_prefix: req.route_prefix.clone(),
            extra_paths: req.extra_paths.clone(),
            version: Some(if req.version.is_empty() {
                "unknown".to_string()
            } else {
                req.version.clone()
            }),
            space_tag: tag,
            features: req.features.clone(),
            healthy: true,
            consecutive_failures: 0,
            registered_at: Self::now_ms(),
            last_heartbeat_ok: None,
        };
        self.by_service
            .entry(req.service_code.clone())
            .or_default()
            .insert(id.clone(), reg);
        self.mutated();
        id
    }

    /// Deregister one instance. Returns true if it existed.
    pub fn deregister_instance(&self, service_code: &str, instance_id: &str) -> bool {
        let removed = match self.by_service.get(service_code) {
            None => return false,
            Some(pool) => pool.remove(instance_id).is_some(),
        };
        if !removed {
            return false;
        }
        self.by_service.remove_if(service_code, |_, p| p.is_empty());
        self.mutated();
        true
    }

    /// Deregister an entire service (all its instances).
    pub fn deregister_service(&self, service_code: &str) -> bool {
        let existed = self.by_service.remove(service_code).is_some();
        if existed {
            self.mutated();
        }
        existed
    }

    pub fn build_snapshot(&self) -> RegistrySnapshot {
        let mut services: HashMap<String, Vec<ServiceInstanceInfo>> = HashMap::new();
        for entry in self.by_service.iter() {
            let infos = entry
                .value()
                .iter()
                .map(|r| ServiceInstanceInfo {
                    instance_id: r.instance_id.clone(),
                    service_code: r.service_code.clone(),
                    base_url: r.base_url.clone(),
                    version: r.version.clone(),
                    space_tag: r.space_tag.clone(),
                    healthy: r.healthy,
                })
                .collect();
            services.insert(entry.key().clone(), infos);
        }
        RegistrySnapshot {
            version: self.revision(),
            services,
        }
    }

    /// Detailed per-instance projection for `/status`.
    pub fn status_instances(&self) -> Vec<InstanceStatus> {
        let mut out = Vec::new();
        for entry in self.by_service.iter() {
            for r in entry.value().iter() {
                out.push(InstanceStatus {
                    instance_id: r.instance_id.clone(),
                    service_code: r.service_code.clone(),
                    base_url: r.base_url.clone(),
                    healthy: r.healthy,
                    consecutive_failures: r.consecutive_failures,
                    registered_at: r.registered_at,
                    last_heartbeat_ok: r.last_heartbeat_ok,
                    space_tag: r.space_tag.clone(),
                    version: r.version.clone(),
                    route_prefix: r.route_prefix.clone(),
                });
            }
        }
        out
    }

    /// Service codes that declared `feature` on any instance (for federation).
    pub fn services_with_feature(&self, feature: &str) -> Vec<String> {
        self.by_service
            .iter()
            .filter(|e| {
                e.value()
                    .iter()
                    .any(|r| r.features.iter().any(|f| f == feature))
            })
            .map(|e| e.key().clone())
            .collect()
    }

    pub fn all_service_codes(&self) -> Vec<String> {
        self.by_service.iter().map(|e| e.key().clone()).collect()
    }

    pub fn revision(&self) -> i64 {
        self.revision.load(Ordering::SeqCst)
    }

    /// Bump revision + refresh the local mirror. Call after every mutation.
    fn mutated(&self) {
        self.revision.fetch_add(1, Ordering::SeqCst);
        self.local.update_from_snapshot(self.build_snapshot());
    }

    /// Publish `ENVIRONMENT_CHANGED` so consumers re-pull. Async (NATS publish);
    /// call from handlers/scheduler after a `mutated()`.
    pub async fn publish_changed(&self) {
        if let Some(nats) = &self.nats {
            let payload = serde_json::to_vec(&serde_json::json!({ "revision": self.revision() }))
                .unwrap_or_default();
            if let Err(e) = nats.publish(ENV_CHANGED_SUBJECT, payload).await {
                tracing::warn!("publish ENVIRONMENT_CHANGED failed: {e}");
            }
        }
    }

    /// Snapshot of (instanceId, healthUrl) pairs to probe.
    fn probe_targets(&self) -> Vec<(String, String, String)> {
        let mut out = Vec::new();
        for entry in self.by_service.iter() {
            for r in entry.value().iter() {
                out.push((r.service_code.clone(), r.instance_id.clone(), r.health_url.clone()));
            }
        }
        out
    }

    /// Apply a probe outcome. Returns true if the instance's health flipped or
    /// it was evicted (i.e. the registry changed).
    fn record_probe(&self, service_code: &str, instance_id: &str, ok: bool, threshold: u32) -> bool {
        let pool = match self.by_service.get(service_code) {
            Some(p) => p,
            None => return false,
        };
        let mut changed = false;
        let mut evict = false;
        if let Some(mut r) = pool.get_mut(instance_id) {
            if ok {
                if !r.healthy || r.consecutive_failures > 0 {
                    changed = true;
                }
                r.healthy = true;
                r.consecutive_failures = 0;
                r.last_heartbeat_ok = Some(Self::now_ms());
            } else {
                r.consecutive_failures += 1;
                if r.healthy {
                    r.healthy = false;
                    changed = true;
                }
                if r.consecutive_failures >= threshold {
                    evict = true;
                }
            }
        }
        drop(pool);
        if evict {
            return self.deregister_instance(service_code, instance_id);
        }
        if changed {
            self.mutated();
        }
        changed
    }
}

/// Background heartbeat loop: probe every instance's health URL on the interval,
/// evict after `threshold` consecutive failures, publish on any change.
pub fn spawn_heartbeat(
    registry: Arc<EnvironmentRegistry>,
    interval_ms: u64,
    timeout_ms: u64,
    threshold: u32,
) {
    let probe = reqwest::Client::builder()
        .timeout(Duration::from_millis(timeout_ms))
        .build()
        .unwrap_or_default();
    tokio::spawn(async move {
        let mut tick = tokio::time::interval(Duration::from_millis(interval_ms));
        loop {
            tick.tick().await;
            let targets = registry.probe_targets();
            let mut any_change = false;
            for (svc, id, url) in targets {
                let ok = probe
                    .get(&url)
                    .send()
                    .await
                    .map(|r| r.status().is_success())
                    .unwrap_or(false);
                if registry.record_probe(&svc, &id, ok, threshold) {
                    any_change = true;
                }
            }
            if any_change {
                registry.publish_changed().await;
            }
        }
    });
}

// ── axum wiring ────────────────────────────────────────────────────────────
// Java controller is @RequestMapping("/internal/environment"); the gateway
// strips /api/platform so we serve the bare /internal/... paths.

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/internal/environment/register", post(register))
        .route("/internal/environment/snapshot", get(snapshot))
        .route(
            "/internal/environment/register/:service_code/instances/:instance_id",
            axum::routing::delete(deregister_instance),
        )
        .route(
            "/internal/environment/register/:service_code",
            axum::routing::delete(deregister_service),
        )
}

async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> impl IntoResponse {
    if req.service_code.is_empty()
        || req.base_url.is_empty()
        || req.health_url.is_empty()
        || req.route_prefix.is_empty()
    {
        return StatusCode::BAD_REQUEST.into_response();
    }
    let id = state.registry.register(&req);
    state.registry.publish_changed().await;
    (
        StatusCode::OK,
        Json(RegisterResponse {
            instance_id: Some(id),
        }),
    )
        .into_response()
}

async fn snapshot(State(state): State<AppState>) -> Json<RegistrySnapshot> {
    Json(state.registry.build_snapshot())
}

async fn deregister_instance(
    State(state): State<AppState>,
    Path((service_code, instance_id)): Path<(String, String)>,
) -> StatusCode {
    if state.registry.deregister_instance(&service_code, &instance_id) {
        state.registry.publish_changed().await;
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}

async fn deregister_service(
    State(state): State<AppState>,
    Path(service_code): Path<String>,
) -> StatusCode {
    if state.registry.deregister_service(&service_code) {
        state.registry.publish_changed().await;
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}
