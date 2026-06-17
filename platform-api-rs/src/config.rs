//! Environment-driven config — mirrors the relevant keys of platform-api's
//! `application.properties`. Secrets come from the env (`PLM_SERVICE_SECRET`),
//! not Vault, matching the other polyglot services (spe-api-rs, *-go).

use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub service_code: String,
    pub port: u16,
    pub self_base_url: String,
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

    pub pno_url: String,
    pub nats_monitoring_url: String,

    pub heartbeat_interval_ms: u64,
    pub heartbeat_failure_threshold: u32,
    pub heartbeat_timeout_ms: u64,
    pub expected_services: Vec<String>,

    // Vault admin (orthogonal to the rest; only the /admin/secrets endpoints use it).
    pub vault_addr: String,
    pub vault_token: String,
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
        let port: u16 = env_or("PLATFORM_PORT", "8084").parse().unwrap_or(8084);
        let expected = env_or("PLATFORM_EXPECTED_SERVICES", "psm,pno,psa,platform,ws,spe,dst")
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();
        Config {
            service_code: "platform".to_string(),
            port,
            self_base_url: env_or("SPE_SELF_BASE_URL", "http://platform-api:8084"),
            service_secret,
            clock_skew_seconds: env_or("PLM_JWT_CLOCK_SKEW_SECONDS", "5").parse().unwrap_or(5),
            // Discrete fields (NOT a URL) so a password with URL-special
            // characters never breaks connection-string parsing.
            db_host: env_or("PG_HOST", "postgres"),
            db_port: env_or("PG_PORT", "5432").parse().unwrap_or(5432),
            db_user: env_or("PG_USER", "plm"),
            db_password: env_or("PG_PASSWORD", "plm"),
            db_name: env_or("PG_DB", "plmdb"),
            db_schema: env_or("PLATFORM_DB_SCHEMA", "platform"),
            nats_enabled: env_or("PLM_NATS_ENABLED", "true") == "true",
            nats_url: env_or("NATS_URL", "nats://nats:4222"),
            otlp_endpoint: env_or("OTEL_EXPORTER_OTLP_ENDPOINT", "http://jaeger:4318"),
            pno_url: env_or("PNO_API_URL", "http://pno-api:8081"),
            nats_monitoring_url: env_or("NATS_MONITORING_URL", "http://nats:8222"),
            heartbeat_interval_ms: env_or("PLATFORM_HEARTBEAT_INTERVAL_MS", "10000")
                .parse()
                .unwrap_or(10000),
            heartbeat_failure_threshold: env_or("PLATFORM_HEARTBEAT_FAILURE_THRESHOLD", "3")
                .parse()
                .unwrap_or(3),
            heartbeat_timeout_ms: env_or("PLATFORM_HEARTBEAT_TIMEOUT_MS", "3000")
                .parse()
                .unwrap_or(3000),
            expected_services: expected,
            vault_addr: env_or("VAULT_ADDR", "http://vault:8200"),
            vault_token: env_or("VAULT_TOKEN", "plm-demo-services"),
        }
    }
}
