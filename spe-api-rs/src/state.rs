//! Shared application state + tag-aware instance selection.

use crate::config::Config;
use crate::pno::PnoClients;
use platform_lib_rs::dto::ServiceInstanceInfo;
use platform_lib_rs::{JwtCodec, LocalServiceRegistry};
use std::collections::{HashMap, HashSet};
use std::sync::atomic::{AtomicI64, AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct AppState(pub Arc<Inner>);

pub struct Inner {
    pub config: Config,
    pub codec: JwtCodec,
    pub registry: Arc<LocalServiceRegistry>,
    pub pno: PnoClients,
    pub http: reqwest::Client,
    /// pno's current authorization/identity version, seeded at boot and advanced
    /// by NATS `global.PNO_CHANGED` / `global.AUTHORIZATION_CHANGED`. Tokens are
    /// stamped with it (`pv`); a token whose `pv` is older is revoked.
    pub pno_version: Arc<AtomicI64>,
    /// Per-service round-robin counters for tag-filtered candidate sets
    /// (mirrors `SvcLoadBalancerFilter.counters`).
    counters: Mutex<HashMap<String, AtomicUsize>>,
}

impl std::ops::Deref for AppState {
    type Target = Inner;
    fn deref(&self) -> &Inner {
        &self.0
    }
}

impl AppState {
    pub fn new(
        config: Config,
        codec: JwtCodec,
        registry: Arc<LocalServiceRegistry>,
        pno: PnoClients,
    ) -> Self {
        AppState(Arc::new(Inner {
            config,
            codec,
            registry,
            pno,
            http: reqwest::Client::builder()
                .build()
                .expect("reqwest client"),
            pno_version: Arc::new(AtomicI64::new(0)),
            counters: Mutex::new(HashMap::new()),
        }))
    }

    /// Current tracked pno version.
    pub fn pno_version(&self) -> i64 {
        self.pno_version.load(Ordering::SeqCst)
    }

    fn next_rr(&self, service_code: &str) -> usize {
        let mut map = self.counters.lock().unwrap();
        map.entry(service_code.to_string())
            .or_insert_with(|| AtomicUsize::new(0))
            .fetch_add(1, Ordering::Relaxed)
    }

    /// Tag-aware round-robin pick — direct port of
    /// `SvcLoadBalancerFilter.pickInstanceByTags`. Health-aware first, then
    /// tag affinity, honouring project-space isolation.
    pub fn pick_instance_by_tags(
        &self,
        service_code: &str,
        required_tags: &HashSet<String>,
        isolated: bool,
    ) -> Option<ServiceInstanceInfo> {
        let all = self.registry.instances(service_code);
        let candidates = filter_candidates(&all, required_tags, isolated);
        if candidates.is_empty() {
            return None;
        }
        let idx = self.next_rr(service_code) % candidates.len();
        Some(candidates[idx].clone())
    }
}

/// Pure candidate selection: health filter (with fallback) then tag affinity,
/// honouring isolation. Extracted from `pick_instance_by_tags` so the subtle
/// isolation rules can be unit-tested without a full `AppState`.
fn filter_candidates(
    all: &[ServiceInstanceInfo],
    required_tags: &HashSet<String>,
    isolated: bool,
) -> Vec<ServiceInstanceInfo> {
    if all.is_empty() {
        return vec![];
    }
    let healthy: Vec<ServiceInstanceInfo> = all.iter().filter(|i| i.healthy).cloned().collect();
    let base: Vec<ServiceInstanceInfo> = if healthy.is_empty() { all.to_vec() } else { healthy };

    if required_tags.is_empty() {
        if isolated {
            return vec![];
        }
        let untagged: Vec<ServiceInstanceInfo> =
            base.iter().filter(|i| is_untagged(&i.space_tag)).cloned().collect();
        return if untagged.is_empty() { base } else { untagged };
    }

    let tagged: Vec<ServiceInstanceInfo> = base
        .iter()
        .filter(|i| i.space_tag.as_deref().is_some_and(|t| !t.trim().is_empty() && required_tags.contains(t)))
        .cloned()
        .collect();
    if !tagged.is_empty() {
        return tagged;
    }
    let untagged: Vec<ServiceInstanceInfo> =
        base.iter().filter(|i| is_untagged(&i.space_tag)).cloned().collect();
    if !isolated && !untagged.is_empty() {
        untagged
    } else {
        vec![]
    }
}

fn is_untagged(tag: &Option<String>) -> bool {
    match tag {
        None => true,
        Some(t) => t.trim().is_empty(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn inst(id: &str, tag: Option<&str>, healthy: bool) -> ServiceInstanceInfo {
        ServiceInstanceInfo {
            instance_id: id.into(),
            service_code: "psm".into(),
            base_url: format!("http://{id}:8080"),
            version: None,
            space_tag: tag.map(String::from),
            healthy,
        }
    }

    fn tags(items: &[&str]) -> HashSet<String> {
        items.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn no_tags_not_isolated_prefers_untagged() {
        let all = vec![inst("u", None, true), inst("t", Some("PSM1"), true)];
        let c = filter_candidates(&all, &tags(&[]), false);
        assert_eq!(c.len(), 1);
        assert_eq!(c[0].instance_id, "u");
    }

    #[test]
    fn no_tags_isolated_yields_nothing() {
        let all = vec![inst("u", None, true)];
        assert!(filter_candidates(&all, &tags(&[]), true).is_empty());
    }

    #[test]
    fn required_tag_matches_tagged_instance() {
        let all = vec![inst("u", None, true), inst("t", Some("PSM1"), true)];
        let c = filter_candidates(&all, &tags(&["PSM1"]), true);
        assert_eq!(c.len(), 1);
        assert_eq!(c[0].instance_id, "t");
    }

    #[test]
    fn required_tag_falls_back_to_untagged_when_not_isolated() {
        let all = vec![inst("u", None, true)];
        let c = filter_candidates(&all, &tags(&["PSM1"]), false);
        assert_eq!(c[0].instance_id, "u");
    }

    #[test]
    fn required_tag_isolated_no_match_yields_nothing() {
        let all = vec![inst("u", None, true)];
        assert!(filter_candidates(&all, &tags(&["PSM1"]), true).is_empty());
    }

    #[test]
    fn unhealthy_filtered_unless_none_healthy() {
        let all = vec![inst("dead", None, false), inst("live", None, true)];
        let c = filter_candidates(&all, &tags(&[]), false);
        assert_eq!(c.len(), 1);
        assert_eq!(c[0].instance_id, "live");

        let all_dead = vec![inst("dead", None, false)];
        let c2 = filter_candidates(&all_dead, &tags(&[]), false);
        assert_eq!(c2[0].instance_id, "dead");
    }
}
