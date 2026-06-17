//! Registry server unit test — drives `EnvironmentRegistry` directly (no DB,
//! no router). Asserts monotonic revision, deterministic instanceId, camelCase
//! wire shape, serviceCode grouping, and deregister semantics.

use platform_api_rs::registry_server::EnvironmentRegistry;
use platform_lib_rs::dto::RegisterRequest;
use platform_lib_rs::registry::LocalServiceRegistry;
use platform_lib_rs::util::instance_id;
use std::sync::Arc;

fn req(service: &str, base: &str) -> RegisterRequest {
    RegisterRequest {
        service_code: service.into(),
        base_url: base.into(),
        health_url: format!("{base}/actuator/health"),
        route_prefix: format!("/api/{service}/**"),
        extra_paths: vec![],
        version: "1.0".into(),
        space_tag: String::new(),
        features: vec![],
    }
}

fn registry() -> EnvironmentRegistry {
    EnvironmentRegistry::new(Arc::new(LocalServiceRegistry::new()), None)
}

#[test]
fn register_groups_and_bumps_revision() {
    let r = registry();
    assert_eq!(r.revision(), 0);
    r.register(&req("psm", "http://psm-1:8080"));
    r.register(&req("psm", "http://psm-2:8080"));
    r.register(&req("pno", "http://pno:8081"));
    assert_eq!(r.revision(), 3, "revision bumps once per mutation");

    let snap = r.build_snapshot();
    assert_eq!(snap.version, 3);
    assert_eq!(snap.services.get("psm").unwrap().len(), 2);
    assert_eq!(snap.services.get("pno").unwrap().len(), 1);

    // deterministic instance id
    let id = instance_id("http://pno:8081");
    assert_eq!(snap.services.get("pno").unwrap()[0].instance_id, id);
}

#[test]
fn snapshot_serializes_camelcase() {
    let r = registry();
    r.register(&req("psm", "http://psm-1:8080"));
    let snap = r.build_snapshot();
    let inst = &snap.services.get("psm").unwrap()[0];
    let json = serde_json::to_string(inst).unwrap();
    assert!(json.contains("\"instanceId\""), "json={json}");
    assert!(json.contains("\"serviceCode\""));
    assert!(json.contains("\"baseUrl\""));
    assert!(json.contains("\"healthy\":true"));
    assert!(!json.contains("instance_id"), "no snake_case leak: {json}");
}

#[test]
fn reregister_replaces_same_baseurl() {
    let r = registry();
    r.register(&req("psm", "http://psm-1:8080"));
    r.register(&req("psm", "http://psm-1:8080"));
    assert_eq!(r.build_snapshot().services.get("psm").unwrap().len(), 1);
}

#[test]
fn deregister_instance_and_service() {
    let r = registry();
    let id = r.register(&req("psm", "http://psm-1:8080"));
    r.register(&req("psm", "http://psm-2:8080"));
    assert!(r.deregister_instance("psm", &id));
    assert_eq!(r.build_snapshot().services.get("psm").unwrap().len(), 1);
    assert!(r.deregister_service("psm"));
    assert!(r.build_snapshot().services.get("psm").is_none());
    assert!(!r.deregister_service("psm"), "second deregister is a no-op");
}

#[test]
fn services_with_feature() {
    let r = registry();
    let mut tx = req("psm", "http://psm-1:8080");
    tx.features = vec!["transaction".into()];
    r.register(&tx);
    r.register(&req("pno", "http://pno:8081"));
    let feat = r.services_with_feature("transaction");
    assert_eq!(feat, vec!["psm".to_string()]);
}
