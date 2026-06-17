//! Authorization-version bump + NATS domain-event publishing. Port of
//! `PnoEventPublisher` + the `AuthorizationSnapshotVersion` bump done by
//! `DynamicAuthorizationService`.
//!
//! EVERY identity/grant mutation must bump the monotonic version (even when
//! NATS is down) — the gateway reads it via `/internal/authorization/version`
//! and through the `version` field of these events to revoke stale tokens.
//!
//! Wire contract (consumed by spe-api-rs `subscribe_pno_version`): the payload
//! is a JSON object carrying an integer `version` field, published on subjects
//! `global.PNO_CHANGED` / `global.AUTHORIZATION_CHANGED`. The envelope mirrors
//! the Java `PlmEventEnvelope` (`event`, `at`, then named fields).

use crate::state::AppState;
use serde_json::{json, Map, Value};
use std::sync::atomic::Ordering;

/// Seed value for a fresh process — epoch millis, matching the Java
/// `new AtomicLong(System.currentTimeMillis())`.
pub fn seed_version() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

/// Bump the monotonic version and return the new value.
pub fn bump(state: &AppState) -> i64 {
    state.version.fetch_add(1, Ordering::SeqCst) + 1
}

fn envelope(event_code: &str, fields: &[(&str, Value)]) -> Vec<u8> {
    let mut m = Map::new();
    m.insert("event".into(), json!(event_code));
    m.insert("at".into(), json!(chrono::Utc::now().to_rfc3339()));
    for (k, v) in fields {
        m.insert((*k).into(), v.clone());
    }
    serde_json::to_vec(&Value::Object(m)).unwrap_or_default()
}

async fn publish(state: &AppState, subject: &str, payload: Vec<u8>) {
    if let Some(nats) = &state.nats {
        if let Err(e) = nats.publish(subject.to_string(), payload).await {
            tracing::warn!("publish {subject} failed: {e}");
        }
    }
}

/// Bump + publish `global.PNO_CHANGED` for a user/role/project-space mutation.
/// `entity` is `USER|ROLE|PROJECT_SPACE`; `entity_key` is the id field name
/// (`userId`/`roleId`/`projectSpaceId`).
pub async fn pno_changed(
    state: &AppState,
    entity: &str,
    action: &str,
    entity_key: &str,
    entity_id: &str,
    by_user: Option<&str>,
) {
    let version = bump(state);
    let payload = envelope(
        "PNO_CHANGED",
        &[
            ("entity", json!(entity)),
            ("action", json!(action)),
            (entity_key, json!(entity_id)),
            ("version", json!(version)),
            ("byUser", json!(by_user.unwrap_or("unknown"))),
        ],
    );
    publish(state, "global.PNO_CHANGED", payload).await;
    tracing::debug!("PNO event: {entity}.{action} (v{version})");
}

/// Bump + publish `global.AUTHORIZATION_CHANGED` for a grant/scope mutation.
/// Consumers re-pull the authorization snapshot; spe folds in `version`.
pub async fn authorization_changed(state: &AppState, action: &str, by_user: Option<&str>) {
    let version = bump(state);
    let payload = envelope(
        "AUTHORIZATION_CHANGED",
        &[
            ("action", json!(action)),
            ("version", json!(version)),
            ("byUser", json!(by_user.unwrap_or("unknown"))),
        ],
    );
    publish(state, "global.AUTHORIZATION_CHANGED", payload).await;
    tracing::debug!("AUTHORIZATION_CHANGED: {action} (v{version})");
}
