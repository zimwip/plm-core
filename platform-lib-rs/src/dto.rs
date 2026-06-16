//! Wire DTOs mirroring `com.plm.platform.action.dto.*`. Field names match the
//! Java records exactly (Jackson default = camelCase) so the JSON is
//! byte-compatible in both directions.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Payload POSTed to platform-api `/api/platform/internal/environment/register`.
/// Mirrors `RegisterRequest`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterRequest {
    pub service_code: String,
    pub base_url: String,
    pub health_url: String,
    pub route_prefix: String,
    pub extra_paths: Vec<String>,
    pub version: String,
    pub space_tag: String,
    pub features: Vec<String>,
}

/// Lightweight view of one registered service instance. Mirrors
/// `ServiceInstanceInfo`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceInstanceInfo {
    pub instance_id: String,
    pub service_code: String,
    pub base_url: String,
    #[serde(default)]
    pub version: Option<String>,
    #[serde(default)]
    pub space_tag: Option<String>,
    pub healthy: bool,
}

/// Registry snapshot pulled from platform-api. Mirrors `RegistrySnapshot`.
/// `version` is monotonic; stale snapshots are rejected on apply.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistrySnapshot {
    pub version: i64,
    pub services: HashMap<String, Vec<ServiceInstanceInfo>>,
}

/// Response body of a successful registration (`{"instanceId": "..."}`).
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterResponse {
    pub instance_id: Option<String>,
}
