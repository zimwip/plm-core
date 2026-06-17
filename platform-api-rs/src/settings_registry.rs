//! In-memory settings-section registry + wire DTOs. Port of
//! `SettingsSectionRegistry` + `SettingSectionDto` / `SettingsRegisterRequest`.
//! Each service POSTs its sections at boot; `/sections` aggregates them.

use dashmap::DashMap;
use serde::{Deserialize, Serialize};

/// One settings-page section. Field names match the Java record (camelCase via
/// plain names here — all already lowercase single words).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SettingSection {
    pub key: String,
    pub label: String,
    pub group: String,
    #[serde(default)]
    pub order: i32,
    /// Required permission to see the section; `null` = visible to all.
    #[serde(default)]
    pub permission: Option<String>,
    #[serde(default)]
    pub icon: Option<String>,
}

/// POST body for `/internal/settings/register`. Mirrors `SettingsRegisterRequest`.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsRegisterRequest {
    pub service_code: String,
    #[serde(default)]
    pub instance_id: Option<String>,
    #[serde(default)]
    pub sections: Vec<SettingSection>,
}

/// Per-(serviceCode, instanceId) registration of sections.
#[derive(Default)]
pub struct SettingsRegistry {
    /// key = "<serviceCode>:<instanceId>" → sections
    by_instance: DashMap<String, Vec<SettingSection>>,
}

impl SettingsRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    fn key(service_code: &str, instance_id: &str) -> String {
        format!("{service_code}:{instance_id}")
    }

    pub fn register(&self, req: &SettingsRegisterRequest) {
        let inst = req.instance_id.clone().unwrap_or_else(|| "default".into());
        self.by_instance
            .insert(Self::key(&req.service_code, &inst), req.sections.clone());
    }

    pub fn deregister_instance(&self, service_code: &str, instance_id: &str) {
        self.by_instance.remove(&Self::key(service_code, instance_id));
    }

    pub fn deregister_service(&self, service_code: &str) {
        let prefix = format!("{service_code}:");
        self.by_instance.retain(|k, _| !k.starts_with(&prefix));
    }

    /// All registered sections, flattened across services/instances. Callers
    /// dedupe by key + apply permission filtering.
    pub fn all_sections(&self) -> Vec<SettingSection> {
        self.by_instance
            .iter()
            .flat_map(|e| e.value().clone())
            .collect()
    }

    /// Sections registered by a given service (across its instances). Port of
    /// `SettingsSectionRegistry.getSectionsForService`.
    pub fn sections_for_service(&self, service_code: &str) -> Vec<SettingSection> {
        let prefix = format!("{service_code}:");
        self.by_instance
            .iter()
            .filter(|e| e.key().starts_with(&prefix))
            .flat_map(|e| e.value().clone())
            .collect()
    }

    /// All registrations as (serviceCode, instanceId, sections). Port of
    /// `SettingsSectionRegistry.allRegistrations`.
    pub fn all_registrations(&self) -> Vec<(String, String, Vec<SettingSection>)> {
        self.by_instance
            .iter()
            .map(|e| {
                let (svc, inst) = e.key().split_once(':').unwrap_or((e.key(), ""));
                (svc.to_string(), inst.to_string(), e.value().clone())
            })
            .collect()
    }
}
