//! Environment-driven config — mirrors the relevant keys of pno-api's
//! `application.properties`. Secrets come from the env (`PLM_SERVICE_SECRET`),
//! not Vault, matching the other polyglot services (spe-api-rs, platform-api-rs).

use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub service_code: String,
    pub port: u16,
    pub self_base_url: String,
    /// platform-api base URL (where we register ourselves).
    pub platform_url: String,
    pub service_secret: String,
    pub clock_skew_seconds: u64,

    pub db_host: String,
    pub db_port: u16,
    pub db_user: String,
    pub db_password: String,
    pub db_name: String,
    pub db_schema: String,

    pub nats_enabled: bool,
    pub nats_url: String,
    pub otlp_endpoint: String,
}

fn env_or(key: &str, default: &str) -> String {
    env::var(key).unwrap_or_else(|_| default.to_string())
}

impl Config {
    /// Load from the environment, applying the same defaults as the Java
    /// `application.properties`. Panics if `PLM_SERVICE_SECRET` is missing —
    /// the service cannot verify forward JWTs or authenticate S2S without it.
    pub fn from_env() -> Self {
        let service_secret =
            env::var("PLM_SERVICE_SECRET").expect("PLM_SERVICE_SECRET is required (>= 32 bytes)");
        let port: u16 = env_or("PNO_PORT", "8081").parse().unwrap_or(8081);
        Config {
            service_code: "pno".to_string(),
            port,
            // Mesh-wide compose convention: SPE_SELF_BASE_URL / PLM_PLATFORM_URL.
            self_base_url: env_or("SPE_SELF_BASE_URL", "http://pno-api:8081"),
            platform_url: env_or("PLM_PLATFORM_URL", "http://platform-api:8084"),
            service_secret,
            clock_skew_seconds: env_or("PLM_JWT_CLOCK_SKEW_SECONDS", "5").parse().unwrap_or(5),
            // Discrete fields (NOT a URL) so a password with URL-special
            // characters never breaks connection-string parsing.
            db_host: env_or("PG_HOST", "postgres"),
            db_port: env_or("PG_PORT", "5432").parse().unwrap_or(5432),
            db_user: env_or("PG_USER", "plm"),
            db_password: env_or("PG_PASSWORD", "plm"),
            db_name: env_or("PG_DB", "plmdb"),
            db_schema: env_or("PNO_DB_SCHEMA", "pno"),
            nats_enabled: env_or("PLM_NATS_ENABLED", "true") == "true",
            nats_url: env_or("NATS_URL", "nats://nats:4222"),
            otlp_endpoint: env_or("OTEL_EXPORTER_OTLP_ENDPOINT", "http://jaeger:4318"),
        }
    }
}
