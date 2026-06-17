//! Catalog DB integration test — DB-gated.
//!
//! Marked `#[ignore]` so the default `cargo test` (no DB) skips it. Run with:
//!
//!   DATABASE_URL=postgres://user:pass@localhost:5432/plm \
//!     cargo test -p platform-api-rs --test catalog_db -- --ignored
//!
//! It runs the migration, then calls `persist_handlers` twice with an
//! identical payload and asserts: first call writes rows + returns true,
//! second call is a no-op + returns false, and row counts stay stable.
//!
//! If DATABASE_URL is unset it logs and returns early (so even when run with
//! --ignored on a machine with no DB it exits cleanly rather than panicking).

use platform_api_rs::catalog_db::{persist_handlers, HandlerEntry};
use sqlx::postgres::PgPoolOptions;
use sqlx::Row;

async fn count(pool: &sqlx::PgPool, table: &str, svc: &str) -> i64 {
    let sql = format!("SELECT COUNT(*) AS c FROM {table} WHERE service_code = $1");
    sqlx::query(&sql)
        .bind(svc)
        .fetch_one(pool)
        .await
        .unwrap()
        .get::<i64, _>("c")
}

#[tokio::test]
#[ignore = "requires DATABASE_URL to a live Postgres"]
async fn idempotent_double_register() {
    let Ok(url) = std::env::var("DATABASE_URL") else {
        eprintln!("DATABASE_URL unset — skipping catalog DB test");
        return;
    };

    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&url)
        .await
        .expect("connect Postgres");

    // Fresh slate for this service code so reruns are deterministic.
    let svc = "cattest";
    for t in ["algorithm_instance", "algorithm", "algorithm_type"] {
        sqlx::query(&format!("DELETE FROM {t} WHERE service_code = $1"))
            .bind(svc)
            .execute(&pool)
            .await
            .ok();
    }

    // Apply the migration (idempotent: CREATE TABLE IF NOT EXISTS).
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("run migrations");

    let handlers = vec![
        HandlerEntry {
            code: "CHECK_OUT".into(),
            label: Some("Check Out".into()),
            module: Some("nodes".into()),
        },
        HandlerEntry {
            code: "LOCK".into(),
            label: None,
            module: None,
        },
    ];

    // First call: catalog changes -> true, rows written.
    let changed1 = persist_handlers(&pool, svc, &handlers).await.unwrap();
    assert!(changed1, "first registration must report a change");
    assert_eq!(count(&pool, "algorithm_type", svc).await, 1);
    assert_eq!(count(&pool, "algorithm", svc).await, 2);
    assert_eq!(count(&pool, "algorithm_instance", svc).await, 2);

    // Second identical call: no-op -> false, row counts stable.
    let changed2 = persist_handlers(&pool, svc, &handlers).await.unwrap();
    assert!(!changed2, "identical re-registration must be a no-op");
    assert_eq!(count(&pool, "algorithm_type", svc).await, 1);
    assert_eq!(count(&pool, "algorithm", svc).await, 2);
    assert_eq!(count(&pool, "algorithm_instance", svc).await, 2);

    // Deterministic ids landed.
    let id: String = sqlx::query("SELECT id FROM algorithm WHERE service_code = $1 AND code = $2")
        .bind(svc)
        .bind("CHECK_OUT")
        .fetch_one(&pool)
        .await
        .unwrap()
        .get("id");
    assert_eq!(id, "alg-cattest-check-out");

    // Adding a handler IS a change -> true, +1 row.
    let mut more = handlers.clone();
    more.push(HandlerEntry {
        code: "UNLOCK".into(),
        label: None,
        module: None,
    });
    let changed3 = persist_handlers(&pool, svc, &more).await.unwrap();
    assert!(changed3, "new handler must report a change");
    assert_eq!(count(&pool, "algorithm", svc).await, 3);
}
