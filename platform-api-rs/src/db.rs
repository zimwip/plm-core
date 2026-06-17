//! Postgres pool + migrations. The schema is ported verbatim from the Java
//! Flyway migrations (`platform-api/.../db/migration/V1–V3`) into `migrations/`.
//!
//! Connection params come as discrete fields (host/port/user/password/db),
//! built via `PgConnectOptions` — never a URL — so a password containing
//! URL-special characters can't corrupt parsing.

use crate::config::Config;
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use sqlx::PgPool;
use std::time::Duration;

/// Build the pool (search_path = the owned schema) and run migrations.
pub async fn init(cfg: &Config) -> Result<PgPool, sqlx::Error> {
    let connect = PgConnectOptions::new()
        .host(&cfg.db_host)
        .port(cfg.db_port)
        .username(&cfg.db_user)
        .password(&cfg.db_password)
        .database(&cfg.db_name)
        // Applies `search_path` per connection so unqualified table names hit
        // the platform schema.
        .options([("search_path", cfg.db_schema.as_str())]);

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(10))
        .connect_with(connect)
        .await?;

    // Ensure the schema exists, then apply migrations into it.
    let create = format!("CREATE SCHEMA IF NOT EXISTS {}", cfg.db_schema);
    sqlx::query(&create).execute(&pool).await?;
    sqlx::migrate!("./migrations").run(&pool).await?;
    Ok(pool)
}
