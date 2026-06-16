//! Runtime configuration, read from environment variables. Mirrors the keys
//! used by the Java spe-api `application.properties`. Vault is not wired here —
//! secrets are supplied via env (the compose stack already injects them); a
//! Vault loader can be layered in later behind the same `Config` struct.

use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub port: u16,
    pub service_secret: String,
    pub pno_api_url: String,
    pub platform_url: String,
    pub self_base_url: String,
    pub space_tag: String,
    pub forward_ttl: i64,
    pub session_ttl: i64,
    pub operation_max_ttl: i64,
    pub clock_skew_seconds: u64,
    pub nats_enabled: bool,
    pub nats_url: String,
    pub otlp_endpoint: String,
}

fn env_or(key: &str, default: &str) -> String {
    env::var(key).unwrap_or_else(|_| default.to_string())
}

impl Config {
    /// Load from env. `PLM_SERVICE_SECRET` is required (no default — the JWT
    /// codec rejects anything shorter than 32 bytes anyway).
    pub fn from_env() -> Result<Self, String> {
        let service_secret = env::var("PLM_SERVICE_SECRET")
            .map_err(|_| "PLM_SERVICE_SECRET is required".to_string())?;
        Ok(Self {
            port: env_or("SPE_PORT", "8082").parse().map_err(|e| format!("SPE_PORT: {e}"))?,
            service_secret,
            pno_api_url: env_or("PNO_API_URL", "http://pno-api:8081"),
            platform_url: env_or("PLM_PLATFORM_URL", "http://platform-api:8084"),
            self_base_url: env_or("SPE_SELF_BASE_URL", "http://spe-api:8082"),
            space_tag: env_or("SPE_SPACE_TAG", ""),
            forward_ttl: env_or("PLM_JWT_TTL_SECONDS", "60").parse().unwrap_or(60),
            session_ttl: env_or("PLM_JWT_SESSION_TTL_SECONDS", "3600").parse().unwrap_or(3600),
            operation_max_ttl: env_or("PLM_JWT_OPERATION_MAX_TTL_SECONDS", "3600").parse().unwrap_or(3600),
            clock_skew_seconds: env_or("PLM_JWT_CLOCK_SKEW_SECONDS", "5").parse().unwrap_or(5),
            nats_enabled: env_or("PLM_NATS_ENABLED", "false") == "true",
            nats_url: env_or("NATS_URL", "nats://nats:4222"),
            otlp_endpoint: env_or("OTEL_EXPORTER_OTLP_ENDPOINT", "http://jaeger:4318"),
        })
    }
}
