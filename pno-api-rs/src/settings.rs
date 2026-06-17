//! Settings-section registration with platform-api. Port of platform-lib's
//! `SettingsRegistrationClient` + pno's `PnoSettingSections` /
//! `PnoPermissionSettingSections` beans.
//!
//! On boot, POST our sections to platform-api `/internal/settings/register`
//! (retry with backoff), re-register on NATS `env.global.PLATFORM_RESTARTED`
//! (platform-api's registry is wiped on restart), and re-register periodically
//! so a missed event never leaves the Settings page without pno's sections.
//!
//! Wire contract (consumed by platform-api-rs `settings::register`):
//!   { serviceCode, instanceId, sections: [{key,label,group,order,permission,icon}] }

use crate::config::Config;
use platform_lib_rs::nats::{NatsBus, Subscription};
use serde_json::{json, Value};
use std::sync::Arc;
use std::time::Duration;

const REGISTER_PATH: &str = "/internal/settings/register";
const RE_REGISTER_PERIOD: Duration = Duration::from_secs(300);

/// pno's settings sections — mirror of the Java `@Bean SettingSectionDto`s.
/// `permission: null` ⇒ unrestricted (self-service app-passwords).
fn sections() -> Value {
    json!([
        { "key": "users-roles",   "label": "Users & Roles",   "group": "PNO",     "order": 10, "permission": "MANAGE_PNO", "icon": "users" },
        { "key": "proj-spaces",   "label": "Project Spaces",   "group": "PNO",     "order": 20, "permission": "MANAGE_PNO", "icon": "hexagon" },
        { "key": "app-passwords", "label": "App Passwords",    "group": "GENERAL", "order": 15, "permission": null,         "icon": "key" },
        { "key": "access-rights", "label": "Access Rights",    "group": "PNO",     "order": 30, "permission": "MANAGE_PNO", "icon": "shield" }
    ])
}

fn body(cfg: &Config, instance_id: &str) -> Value {
    json!({
        "serviceCode": cfg.service_code,
        "instanceId": instance_id,
        "sections": sections(),
    })
}

async fn post_once(http: &reqwest::Client, cfg: &Config, instance_id: &str) -> bool {
    let url = format!("{}{}", cfg.platform_url, REGISTER_PATH);
    match http
        .post(&url)
        .header("X-Service-Secret", &cfg.service_secret)
        .json(&body(cfg, instance_id))
        .send()
        .await
    {
        Ok(r) if r.status().is_success() => true,
        Ok(r) => {
            tracing::warn!("settings register status {}", r.status());
            false
        }
        Err(e) => {
            tracing::warn!("settings register failed: {e}");
            false
        }
    }
}

/// Spawn the registration lifecycle: subscribe to `PLATFORM_RESTARTED`, do the
/// initial backoff registration, then re-register every 5 minutes. The NATS
/// subscription is held for the task's lifetime (which never ends).
pub fn spawn(cfg: Arc<Config>, nats: Option<Arc<NatsBus>>) {
    let instance_id = platform_lib_rs::util::instance_id(&cfg.self_base_url);
    let http = reqwest::Client::new();

    tokio::spawn(async move {
        // Re-register on platform-api restart (its registry is wiped). Held
        // alive by `_sub` for the lifetime of this task.
        let _sub: Option<Subscription> = match &nats {
            Some(bus) => {
                let cfg = cfg.clone();
                let http = http.clone();
                let id = instance_id.clone();
                bus.subscribe("env.global.PLATFORM_RESTARTED", move |_msg| {
                    let cfg = cfg.clone();
                    let http = http.clone();
                    let id = id.clone();
                    tokio::spawn(async move {
                        tokio::time::sleep(Duration::from_secs(2)).await;
                        if post_once(&http, &cfg, &id).await {
                            tracing::info!("re-registered settings after PLATFORM_RESTARTED");
                        }
                    });
                })
                .await
                .ok()
            }
            None => None,
        };

        // Initial registration with backoff until platform-api answers.
        let backoff = [1000u64, 2000, 4000, 8000, 15000, 30000];
        let mut i = 0usize;
        while !post_once(&http, &cfg, &instance_id).await {
            let wait = backoff[i.min(backoff.len() - 1)];
            tokio::time::sleep(Duration::from_millis(wait)).await;
            i += 1;
        }
        tracing::info!("registered settings sections with platform-api as {instance_id}");

        // Periodic re-register (keeps `_sub` in scope, so it stays subscribed).
        loop {
            tokio::time::sleep(RE_REGISTER_PERIOD).await;
            post_once(&http, &cfg, &instance_id).await;
        }
    });
}
