//! In-memory mirror of the platform registry — port of
//! `com.plm.platform.registry.LocalServiceRegistry`.
//!
//! Holds the latest snapshot, rejects stale updates (monotonic `version`),
//! and selects instances round-robin with a health-aware fallback. Callers
//! that need project-space tag isolation use [`LocalServiceRegistry::pick_filtered`].

use crate::dto::{RegistrySnapshot, ServiceInstanceInfo};
use arc_swap::ArcSwap;
use std::collections::HashMap;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::sync::Notify;

#[derive(Default)]
struct State {
    version: i64,
    services: HashMap<String, Vec<ServiceInstanceInfo>>,
    populated: bool,
}

pub struct LocalServiceRegistry {
    state: ArcSwap<State>,
    rr: Mutex<HashMap<String, AtomicUsize>>,
    notify: Notify,
}

impl Default for LocalServiceRegistry {
    fn default() -> Self {
        Self::new()
    }
}

impl LocalServiceRegistry {
    pub fn new() -> Self {
        Self {
            state: ArcSwap::from_pointee(State::default()),
            rr: Mutex::new(HashMap::new()),
            notify: Notify::new(),
        }
    }

    /// Apply a snapshot. Stale snapshots (version ≤ current, once populated)
    /// are ignored, matching the Java monotonic guard.
    pub fn update_from_snapshot(&self, snapshot: RegistrySnapshot) {
        let current = self.state.load();
        if current.populated && snapshot.version <= current.version {
            tracing::debug!(
                "ignoring stale snapshot v{} (current v{})",
                snapshot.version,
                current.version
            );
            return;
        }
        self.state.store(Arc::new(State {
            version: snapshot.version,
            services: snapshot.services,
            populated: true,
        }));
        self.notify.notify_waiters();
    }

    /// Reset the monotonic version baseline so the NEXT snapshot is accepted
    /// regardless of its version. Used on `PLATFORM_RESTARTED`: platform-api's
    /// in-memory registry version resets when it restarts, so a fresh (often
    /// lower-versioned) snapshot would otherwise be rejected as stale, leaving
    /// this registry permanently out of date. Current services are kept until
    /// the next snapshot replaces them (no routing gap).
    pub fn reset_version(&self) {
        let cur = self.state.load();
        self.state.store(Arc::new(State {
            version: i64::MIN,
            services: cur.services.clone(),
            populated: cur.populated,
        }));
    }

    pub fn is_populated(&self) -> bool {
        self.state.load().populated
    }

    pub fn version(&self) -> i64 {
        self.state.load().version
    }

    pub fn all_service_codes(&self) -> Vec<String> {
        self.state.load().services.keys().cloned().collect()
    }

    pub fn instances(&self, service_code: &str) -> Vec<ServiceInstanceInfo> {
        self.state
            .load()
            .services
            .get(service_code)
            .cloned()
            .unwrap_or_default()
    }

    /// Round-robin pick, preferring healthy instances; falls back to the full
    /// list if none are healthy (matches Java behaviour).
    pub fn pick_instance(&self, service_code: &str) -> Option<ServiceInstanceInfo> {
        self.pick_filtered(service_code, |_| true)
    }

    /// Round-robin pick among instances passing `predicate` (used for
    /// tag-aware project-space isolation in spe-api). Health fallback applies
    /// only within the filtered set.
    pub fn pick_filtered<F>(&self, service_code: &str, predicate: F) -> Option<ServiceInstanceInfo>
    where
        F: Fn(&ServiceInstanceInfo) -> bool,
    {
        let state = self.state.load();
        let all = state.services.get(service_code)?;
        let candidates: Vec<&ServiceInstanceInfo> = all.iter().filter(|i| predicate(i)).collect();
        if candidates.is_empty() {
            return None;
        }
        let healthy: Vec<&ServiceInstanceInfo> =
            candidates.iter().copied().filter(|i| i.healthy).collect();
        let pool = if healthy.is_empty() { &candidates } else { &healthy };

        let idx = self.next_rr(service_code) % pool.len();
        Some(pool[idx].clone())
    }

    fn next_rr(&self, service_code: &str) -> usize {
        let mut map = self.rr.lock().unwrap();
        let counter = map
            .entry(service_code.to_string())
            .or_insert_with(|| AtomicUsize::new(0));
        counter.fetch_add(1, Ordering::Relaxed)
    }

    /// Wait until the registry has received its first snapshot, up to `timeout`.
    /// Returns true if populated. Mirrors `awaitPopulated` (~15s in spe-api).
    pub async fn await_populated(&self, timeout: Duration) -> bool {
        if self.is_populated() {
            return true;
        }
        tokio::time::timeout(timeout, async {
            loop {
                let waiter = self.notify.notified();
                if self.is_populated() {
                    return;
                }
                waiter.await;
                if self.is_populated() {
                    return;
                }
            }
        })
        .await
        .is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn inst(id: &str, code: &str, healthy: bool) -> ServiceInstanceInfo {
        ServiceInstanceInfo {
            instance_id: id.into(),
            service_code: code.into(),
            base_url: format!("http://{id}:8080"),
            version: None,
            space_tag: None,
            healthy,
        }
    }

    fn snap(version: i64, code: &str, insts: Vec<ServiceInstanceInfo>) -> RegistrySnapshot {
        let mut services = HashMap::new();
        services.insert(code.to_string(), insts);
        RegistrySnapshot { version, services }
    }

    #[test]
    fn round_robin_spreads() {
        let reg = LocalServiceRegistry::new();
        reg.update_from_snapshot(snap(
            1,
            "psm",
            vec![inst("a", "psm", true), inst("b", "psm", true)],
        ));
        let picks: Vec<String> = (0..4)
            .map(|_| reg.pick_instance("psm").unwrap().instance_id)
            .collect();
        // alternates a,b,a,b (order of first depends on counter start)
        assert_eq!(picks[0], picks[2]);
        assert_eq!(picks[1], picks[3]);
        assert_ne!(picks[0], picks[1]);
    }

    #[test]
    fn prefers_healthy() {
        let reg = LocalServiceRegistry::new();
        reg.update_from_snapshot(snap(
            1,
            "psm",
            vec![inst("dead", "psm", false), inst("live", "psm", true)],
        ));
        for _ in 0..5 {
            assert_eq!(reg.pick_instance("psm").unwrap().instance_id, "live");
        }
    }

    #[test]
    fn falls_back_to_unhealthy_when_none_healthy() {
        let reg = LocalServiceRegistry::new();
        reg.update_from_snapshot(snap(1, "psm", vec![inst("dead", "psm", false)]));
        assert_eq!(reg.pick_instance("psm").unwrap().instance_id, "dead");
    }

    #[test]
    fn rejects_stale_snapshot() {
        let reg = LocalServiceRegistry::new();
        reg.update_from_snapshot(snap(5, "psm", vec![inst("a", "psm", true)]));
        reg.update_from_snapshot(snap(3, "psm", vec![inst("b", "psm", true)]));
        assert_eq!(reg.version(), 5);
        assert_eq!(reg.pick_instance("psm").unwrap().instance_id, "a");
    }

    #[test]
    fn reset_version_accepts_lower_versioned_snapshot() {
        let reg = LocalServiceRegistry::new();
        reg.update_from_snapshot(snap(20, "psm", vec![inst("old", "psm", true)]));
        // Without reset, a v3 snapshot is rejected as stale.
        reg.update_from_snapshot(snap(3, "psm", vec![inst("new", "psm", true)]));
        assert_eq!(reg.pick_instance("psm").unwrap().instance_id, "old");
        // After a platform restart, reset lets the fresh low-versioned snapshot in.
        reg.reset_version();
        reg.update_from_snapshot(snap(3, "psm", vec![inst("new", "psm", true)]));
        assert_eq!(reg.version(), 3);
        assert_eq!(reg.pick_instance("psm").unwrap().instance_id, "new");
    }

    #[test]
    fn unknown_service_is_none() {
        let reg = LocalServiceRegistry::new();
        reg.update_from_snapshot(snap(1, "psm", vec![inst("a", "psm", true)]));
        assert!(reg.pick_instance("nope").is_none());
    }
}
