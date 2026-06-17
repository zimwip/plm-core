//! Public platform status subsystem — port of
//! `com.plm.platform.api.status.{PlatformStatusController, NatsStatusService}`.
//!
//! `/status` and `/status/**` are PUBLIC (the auth middleware bypasses them).
//!
//! ## `overall` semantics (matches Java `PlatformStatusController`)
//! - `up`       — every expected service has at least one healthy instance.
//! - `degraded` — some expected services are missing or unhealthy.
//! - `down`     — no expected service has any healthy instance.
//!
//! If `platform` itself is not in the registry we synthesise a self-entry with
//! status `up` (we are responding). Failures inside sub-fetches are caught so a
//! transient NATS/registry hiccup never breaks the whole status call.
//!
//! ## Field-set caveat vs the Java original
//! The Java controller reads the full `ServiceRegistration` (version,
//! routePrefix → `path`, `ageSeconds`, `untagged`). The Rust foundation's
//! `EnvironmentRegistry::status_instances()` projects a narrower `InstanceStatus`
//! (no version / routePrefix / untagged). We emit every field the Java response
//! has, using the registry data available and `null` where the projection does
//! not carry it (per-service `version`/`path`, per-instance `version`).
//! `ageSeconds` is derived from `lastHeartbeatOk` (ms epoch) vs now.

use crate::state::AppState;
use axum::{extract::State, routing::get, Json, Router};
use serde_json::{json, Value};
use std::collections::BTreeMap;
use std::time::{SystemTime, UNIX_EPOCH};

const PLATFORM_CODE: &str = "platform";

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/status", get(status))
        .route("/status/nats", get(nats))
}

/// Process boot time (ms epoch), captured once. Mirrors the Java `bootTime`.
fn boot_time_ms() -> i64 {
    use std::sync::OnceLock;
    static BOOT: OnceLock<i64> = OnceLock::new();
    *BOOT.get_or_init(now_ms)
}

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

/// ms epoch → RFC3339 string (matches Java `Instant.toString()` shape closely).
fn instant_to_string(ms: i64) -> String {
    use chrono::{TimeZone, Utc};
    Utc.timestamp_millis_opt(ms)
        .single()
        .map(|dt| dt.to_rfc3339_opts(chrono::SecondsFormat::Millis, true))
        .unwrap_or_default()
}

// ── GET /status ──────────────────────────────────────────────────────────────

async fn status(State(state): State<AppState>) -> Json<Value> {
    let now = now_ms();
    let mut out = serde_json::Map::new();
    out.insert("timestamp".into(), json!(instant_to_string(now)));
    // No BuildProperties equivalent in the Rust crate → matches the Java
    // fallback when buildProperties is absent.
    out.insert("platformVersion".into(), json!("unknown"));
    out.insert(
        "platformUptimeSeconds".into(),
        json!((now - boot_time_ms()) / 1000),
    );

    // Group the flat instance projection by serviceCode (Java works from
    // `allInstancesByService()` directly). BTreeMap → stable ordering.
    let mut by_service: BTreeMap<String, Vec<crate::registry_server::InstanceStatus>> =
        BTreeMap::new();
    for inst in state.registry.status_instances() {
        by_service
            .entry(inst.service_code.clone())
            .or_default()
            .push(inst);
    }

    // Expected list (mutable, admin-editable); fall back to dynamic discovery
    // when left empty.
    let mut expected: Vec<String> = state.expected.read().await.clone();
    if expected.is_empty() {
        expected = by_service.keys().cloned().collect();
    }

    let mut services: Vec<Value> = Vec::new();
    let mut total_instances = 0i64;
    let mut total_healthy = 0i64;
    let mut total_failing = 0i64;
    let mut services_with_healthy = 0i64;
    let mut services_missing = 0i64;
    let mut emitted: Vec<String> = Vec::new();

    for code in &expected {
        emitted.push(code.clone());
        let mut entry = serde_json::Map::new();
        entry.insert("serviceCode".into(), json!(code));

        let instances = by_service.get(code).map(|v| v.as_slice()).unwrap_or(&[]);

        if code == PLATFORM_CODE {
            if instances.is_empty() {
                // Platform must be self-registered; if not, synthesise.
                append_platform_self(&mut entry);
                total_instances += 1;
                total_healthy += 1;
                services_with_healthy += 1;
            } else {
                let c = append_instances(&mut entry, instances, now);
                total_instances += c.0;
                total_healthy += c.1;
                total_failing += c.2;
                if c.1 > 0 {
                    services_with_healthy += 1;
                }
            }
            services.push(Value::Object(entry));
            continue;
        }

        if instances.is_empty() {
            entry.insert("registered".into(), json!(false));
            entry.insert("healthy".into(), json!(false));
            entry.insert("status".into(), json!("missing"));
            entry.insert("instanceCount".into(), json!(0));
            entry.insert("healthyInstances".into(), json!(0));
            entry.insert("instances".into(), json!([]));
            entry.insert("version".into(), Value::Null);
            services_missing += 1;
        } else {
            let c = append_instances(&mut entry, instances, now);
            total_instances += c.0;
            total_healthy += c.1;
            total_failing += c.2;
            if c.1 > 0 {
                services_with_healthy += 1;
            }
        }
        services.push(Value::Object(entry));
    }

    // Registered-but-not-expected services surfaced as informational ("extra").
    for (code, instances) in &by_service {
        if emitted.contains(code) {
            continue;
        }
        let mut entry = serde_json::Map::new();
        entry.insert("serviceCode".into(), json!(code));
        entry.insert("expected".into(), json!(false));
        let c = append_instances(&mut entry, instances, now);
        total_instances += c.0;
        total_healthy += c.1;
        total_failing += c.2;
        if c.1 > 0 {
            services_with_healthy += 1;
        }
        services.push(Value::Object(entry));
    }

    let expected_size = expected.len() as i64;
    let overall = if expected_size == 0 {
        "up"
    } else if services_with_healthy == 0 {
        "down"
    } else if services_with_healthy < expected_size {
        "degraded"
    } else {
        "up"
    };

    out.insert("overall".into(), json!(overall));
    out.insert("expectedServices".into(), json!(expected));
    out.insert("missingServices".into(), json!(services_missing));
    out.insert("totalInstances".into(), json!(total_instances));
    out.insert("totalHealthyInstances".into(), json!(total_healthy));
    out.insert("totalFailingInstances".into(), json!(total_failing));
    out.insert("registryRevision".into(), json!(safe_revision(&state)));
    out.insert("services".into(), json!(services));
    Json(Value::Object(out))
}

fn safe_revision(state: &AppState) -> i64 {
    state.registry.revision()
}

fn append_platform_self(entry: &mut serde_json::Map<String, Value>) {
    entry.insert("registered".into(), json!(true));
    entry.insert("healthy".into(), json!(true));
    entry.insert("status".into(), json!("up"));
    entry.insert("instanceCount".into(), json!(1));
    entry.insert("healthyInstances".into(), json!(1));
    entry.insert("version".into(), json!("unknown"));
    entry.insert("path".into(), json!("/api/platform/"));
    entry.insert(
        "instances".into(),
        json!([{
            "instanceId": "self",
            "healthy": true,
            "status": "up",
            "synthetic": true,
        }]),
    );
}

/// Returns (total, healthy, failing). Mirrors Java `appendInstances`.
fn append_instances(
    entry: &mut serde_json::Map<String, Value>,
    instances: &[crate::registry_server::InstanceStatus],
    now: i64,
) -> (i64, i64, i64) {
    let total = instances.len() as i64;
    let mut healthy = 0i64;
    let mut failing = 0i64;
    let mut instance_entries: Vec<Value> = Vec::new();

    for r in instances {
        // Java: healthy iff consecutiveFailures() == 0.
        let healthy_flag = r.consecutive_failures == 0;
        if healthy_flag {
            healthy += 1;
        } else {
            failing += 1;
        }
        let age_seconds = r.last_heartbeat_ok.map(|hb| (now - hb) / 1000);
        instance_entries.push(json!({
            "instanceId": r.instance_id,
            "version": r.version,
            "healthy": healthy_flag,
            "status": if healthy_flag { "up" } else { "degraded" },
            "registeredAt": instant_to_string(r.registered_at),
            "lastHeartbeatOk": r.last_heartbeat_ok.map(instant_to_string),
            "consecutiveFailures": r.consecutive_failures,
            "ageSeconds": age_seconds,
            "spaceTag": r.space_tag,
            // Java `isUntagged()` == spaceTag is null/blank.
            "untagged": r.space_tag.as_deref().map(str::trim).unwrap_or("").is_empty(),
        }));
    }

    let any_healthy = healthy > 0;
    let all_healthy = healthy == total;
    entry.insert("registered".into(), json!(true));
    entry.insert("healthy".into(), json!(any_healthy));
    entry.insert(
        "status".into(),
        json!(if !any_healthy {
            "down"
        } else if all_healthy {
            "up"
        } else {
            "degraded"
        }),
    );
    entry.insert("instanceCount".into(), json!(total));
    entry.insert("healthyInstances".into(), json!(healthy));
    entry.insert("instances".into(), json!(instance_entries));
    // Service-level version/path taken from the first instance (Java derives
    // them from any instance's ServiceRegistration). path = routePrefix with the
    // trailing /** collapsed to /.
    let version = instances.first().and_then(|r| r.version.clone());
    let path = instances.first().map(|r| {
        let p = r.route_prefix.trim_end_matches("**");
        if p.ends_with('/') { p.to_string() } else { format!("{p}/") }
    });
    entry.insert("version".into(), json!(version));
    entry.insert("path".into(), json!(path));
    (total, healthy, failing)
}

// ── GET /status/nats ─────────────────────────────────────────────────────────

async fn nats(State(state): State<AppState>) -> Json<Value> {
    match fetch_nats_stats(&state).await {
        Ok(v) => Json(v),
        Err(e) => {
            // Match the Java controller catch: { "status": "down", "error": ... }.
            tracing::warn!("NATS status fetch failed: {e}");
            Json(json!({ "status": "down", "error": e }))
        }
    }
}

/// Port of `NatsStatusService.fetchStats()`. Each sub-call is wrapped so a
/// failure of one (connz/subsz) still yields partial results from varz, and a
/// full varz failure yields `status: "down"` rather than an exception.
async fn fetch_nats_stats(state: &AppState) -> Result<Value, String> {
    let base = state.config.nats_monitoring_url.trim_end_matches('/');

    let v = safe_get(state, base, "/varz").await;
    let c = safe_get(state, base, "/connz?subs=true").await;
    let s = safe_get(state, base, "/subsz").await;

    let up = !v.as_object().map(|o| o.is_empty()).unwrap_or(true);

    let mut result = serde_json::Map::new();
    result.insert("status".into(), json!(if up { "up" } else { "down" }));
    result.insert("version".into(), v.get("version").cloned().unwrap_or(Value::Null));
    result.insert("uptime".into(), v.get("uptime").cloned().unwrap_or(Value::Null));
    result.insert("connections".into(), num_or(&v, "connections"));
    result.insert("totalConnections".into(), num_or(&v, "total_connections"));
    result.insert("subscriptions".into(), num_or(&v, "subscriptions"));
    result.insert("inMsgs".into(), num_or(&v, "in_msgs"));
    result.insert("outMsgs".into(), num_or(&v, "out_msgs"));
    result.insert("inBytes".into(), num_or(&v, "in_bytes"));
    result.insert("outBytes".into(), num_or(&v, "out_bytes"));
    result.insert("slowConsumers".into(), num_or(&v, "slow_consumers"));

    result.insert("numConnections".into(), num_or(&c, "num_connections"));
    if let Some(conn_list) = c.get("connections").and_then(Value::as_array) {
        let summaries: Vec<Value> = conn_list
            .iter()
            .filter(|o| o.is_object())
            .map(|conn| {
                json!({
                    "cid": conn.get("cid").cloned().unwrap_or(Value::Null),
                    "name": conn.get("name").cloned().unwrap_or(json!("")),
                    "ip": conn.get("ip").cloned().unwrap_or(Value::Null),
                    "lang": conn.get("lang").cloned().unwrap_or(json!("")),
                    "version": conn.get("version").cloned().unwrap_or(json!("")),
                    "subscriptions": conn
                        .get("subscriptions_list")
                        .or_else(|| conn.get("subscriptions"))
                        .cloned()
                        .unwrap_or(Value::Null),
                    "inMsgs": num_or(conn, "in_msgs"),
                    "outMsgs": num_or(conn, "out_msgs"),
                    "inBytes": num_or(conn, "in_bytes"),
                    "outBytes": num_or(conn, "out_bytes"),
                    "uptime": conn.get("uptime").cloned().unwrap_or(json!("")),
                    "idle": conn.get("idle").cloned().unwrap_or(json!("")),
                })
            })
            .collect();
        result.insert("connectionDetails".into(), json!(summaries));
    }

    result.insert("numSubs".into(), num_or(&s, "num_subscriptions"));
    result.insert("numCache".into(), num_or(&s, "num_cache"));
    result.insert("numInserts".into(), num_or(&s, "num_inserts"));
    result.insert("numMatches".into(), num_or(&s, "num_matches"));

    Ok(Value::Object(result))
}

/// Java `getOrDefault(key, 0)` — return the value or numeric 0.
fn num_or(obj: &Value, key: &str) -> Value {
    obj.get(key).cloned().unwrap_or(json!(0))
}

/// Java `safeGet` — short-timeout GET returning the JSON object or `{}` on any
/// failure (never propagates). The shared `state.http` client supplies tracing;
/// per-request timeout matches the Java read timeout (3s).
async fn safe_get(state: &AppState, base: &str, path: &str) -> Value {
    let url = format!("{base}{path}");
    let res = state
        .http
        .get(&url)
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await;
    match res {
        Ok(resp) if resp.status().is_success() => {
            resp.json::<Value>().await.unwrap_or_else(|_| json!({}))
        }
        Ok(resp) => {
            tracing::debug!("NATS {path} fetch non-2xx: {}", resp.status());
            json!({})
        }
        Err(e) => {
            tracing::debug!("NATS {path} fetch failed: {e}");
            json!({})
        }
    }
}
