//! DB-backed idempotent fingerprinted catalog registration.
//!
//! Port of the handler/contribution slice of
//! `com.plm.platform.api.registry.ActionCatalogPersistenceService.persistToDB`.
//! Remaining loops (guards/wrappers/actions/params) are structurally identical.
//!
//! Key properties preserved:
//!   * RUNTIME sqlx queries (`sqlx::query`), NOT the compile-time `query!`
//!     macros, so the crate builds with NO live database.
//!   * Deterministic ids: `alg-<svc>-<safe>`, `ainst-<svc>-<safe>`;
//!     safe = lowercase, '_' -> '-'.
//!   * Fingerprint short-circuit: if every incoming line is already stored,
//!     write nothing and return `false` (a second identical call is a no-op).
//!   * `ON CONFLICT (service_code, code)` / `(service_code, name)` upserts
//!     targeting the real unique constraints, so repeats never raise
//!     duplicate-key errors even against differently-IDed seed rows.
//!
//! Covered: handler, guard AND contribution loops — the full
//! `persistToDB` port. Guards use id prefix `alg-<svc>-g-` / type
//! `sys-guard-<svc>`; contributions use `alg-<svc>-c-` and a caller-supplied
//! custom algorithm type.

use sqlx::{PgPool, Row};
use std::collections::BTreeSet;

/// One incoming handler from the auto-registration payload. Mirrors
/// `ActionCatalogRegistry.HandlerEntry` (code / label / module).
#[derive(Debug, Clone)]
pub struct HandlerEntry {
    pub code: String,
    pub label: Option<String>,
    pub module: Option<String>,
}

impl HandlerEntry {
    fn label_or_code(&self) -> &str {
        self.label.as_deref().unwrap_or(&self.code)
    }
}

/// One incoming guard. Mirrors `ActionCatalogRegistry.GuardEntry`.
#[derive(Debug, Clone)]
pub struct GuardEntry {
    pub code: String,
    pub label: Option<String>,
    pub module: Option<String>,
}

impl GuardEntry {
    fn label_or_code(&self) -> &str {
        self.label.as_deref().unwrap_or(&self.code)
    }
}

/// One algorithm inside a contribution. Mirrors `ActionCatalogRegistryController.AlgorithmInput`.
#[derive(Debug, Clone)]
pub struct AlgorithmInput {
    pub code: String,
    pub label: Option<String>,
    pub module: Option<String>,
}

impl AlgorithmInput {
    fn label_or_code(&self) -> &str {
        self.label.as_deref().unwrap_or(&self.code)
    }
}

/// A contribution: a custom algorithm type plus its algorithms.
/// Mirrors `ActionCatalogRegistryController.ContributionInput`.
#[derive(Debug, Clone)]
pub struct ContributionInput {
    pub type_id: String,
    pub type_name: String,
    pub java_interface: Option<String>,
    pub algorithms: Vec<AlgorithmInput>,
}

/// `code.toLowerCase().replace('_', '-')` — the Java `safe-code` rule.
fn safe_code(code: &str) -> String {
    code.to_lowercase().replace('_', "-")
}

fn nz(s: &Option<String>) -> &str {
    s.as_deref().unwrap_or("")
}

/// Canonical lines this payload WOULD write (Java `incomingFingerprint`),
/// covering handlers, guards AND contributions. BTreeSet = stable ordering;
/// equality is set-containment.
fn incoming_fingerprint(
    handler_type_id: &str,
    guard_type_id: &str,
    handlers: &[HandlerEntry],
    guards: &[GuardEntry],
    contributions: &[ContributionInput],
) -> BTreeSet<String> {
    let mut lines = BTreeSet::new();
    // Type lines only when the corresponding artefact class is non-empty, so a
    // handler-only payload does not phantom-create an empty `sys-guard-*` type
    // (and the legacy handler-only `persist_handlers` stays a 1-type write).
    if !handlers.is_empty() {
        lines.insert(format!("type|{handler_type_id}|Action Handler"));
    }
    if !guards.is_empty() {
        lines.insert(format!("type|{guard_type_id}|Action Guard"));
    }
    for h in handlers {
        let lbl = h.label_or_code();
        lines.insert(format!(
            "alg|{}|{}|{}|{}",
            h.code,
            lbl,
            nz(&h.module),
            handler_type_id
        ));
        lines.insert(format!("inst|{lbl}"));
    }
    for g in guards {
        let lbl = g.label_or_code();
        lines.insert(format!(
            "alg|{}|{}|{}|{}",
            g.code,
            lbl,
            nz(&g.module),
            guard_type_id
        ));
        lines.insert(format!("inst|{lbl}"));
    }
    for c in contributions {
        if c.algorithms.is_empty() {
            continue;
        }
        lines.insert(format!("type|{}|{}", c.type_id, c.type_name));
        for a in &c.algorithms {
            let lbl = a.label_or_code();
            lines.insert(format!(
                "alg|{}|{}|{}|{}",
                a.code,
                lbl,
                nz(&a.module),
                c.type_id
            ));
            lines.insert(format!("inst|{lbl}"));
        }
    }
    lines
}

/// Same-shape lines for rows already stored for `svc` (Java
/// `currentFingerprint`). Runtime queries -> `Row::get` by column name.
async fn current_fingerprint(pool: &PgPool, svc: &str) -> Result<BTreeSet<String>, sqlx::Error> {
    let mut lines = BTreeSet::new();

    let types = sqlx::query("SELECT id, name FROM algorithm_type WHERE service_code = $1")
        .bind(svc)
        .fetch_all(pool)
        .await?;
    for r in types {
        let id: String = r.get("id");
        let name: String = r.get("name");
        lines.insert(format!("type|{id}|{name}"));
    }

    let algs = sqlx::query(
        "SELECT code, name, module_name, algorithm_type_id FROM algorithm WHERE service_code = $1",
    )
    .bind(svc)
    .fetch_all(pool)
    .await?;
    for r in algs {
        let code: String = r.get("code");
        let name: String = r.get("name");
        let module: Option<String> = r.get("module_name");
        let type_id: String = r.get("algorithm_type_id");
        lines.insert(format!(
            "alg|{code}|{name}|{}|{type_id}",
            module.as_deref().unwrap_or("")
        ));
    }

    let insts = sqlx::query("SELECT name FROM algorithm_instance WHERE service_code = $1")
        .bind(svc)
        .fetch_all(pool)
        .await?;
    for r in insts {
        let name: String = r.get("name");
        lines.insert(format!("inst|{name}"));
    }

    Ok(lines)
}

/// Back-compat shim for the original handler-only entrypoint (used by the
/// `catalog_db` integration test). Delegates to [`persist_to_db`] with no
/// guards or contributions.
pub async fn persist_handlers(
    pool: &PgPool,
    svc: &str,
    handlers: &[HandlerEntry],
) -> Result<bool, sqlx::Error> {
    persist_to_db(pool, svc, handlers, &[], &[]).await
}

/// Upsert one algorithm + its default instance. Shared by the three loops;
/// `alg_id`/`inst_id` carry the deterministic-id prefix per artefact class
/// (handler: `alg-<svc>-<safe>`, guard: `alg-<svc>-g-<safe>`,
/// contribution: `alg-<svc>-c-<safe>`). The instance is linked to the
/// *resolved* algorithm id (which may differ if the (service_code, code)
/// conflict fired against a differently-IDed seed row).
async fn upsert_algorithm_with_instance(
    pool: &PgPool,
    svc: &str,
    type_id: &str,
    alg_id: &str,
    inst_id: &str,
    code: &str,
    label: &str,
    module: &Option<String>,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO algorithm \
         (id, service_code, algorithm_type_id, code, name, handler_ref, module_name) \
         VALUES ($1, $2, $3, $4, $5, $6, $7) \
         ON CONFLICT (service_code, code) \
         DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name",
    )
    .bind(alg_id)
    .bind(svc)
    .bind(type_id)
    .bind(code)
    .bind(label)
    .bind(code) // handler_ref = code (matches Java)
    .bind(module)
    .execute(pool)
    .await?;

    // Resolve actual algorithm id (may differ from alg_id if conflict fired).
    let resolved: String =
        sqlx::query("SELECT id FROM algorithm WHERE service_code = $1 AND code = $2")
            .bind(svc)
            .bind(code)
            .fetch_optional(pool)
            .await?
            .map(|r| r.get("id"))
            .unwrap_or_else(|| alg_id.to_string());

    // Platform crystallizes whatever services (re-)register: accept every call,
    // update only what changed, skip what already exists, never throw — so two
    // psm replicas both registering at boot both succeed. Two unique constraints
    // guard algorithm_instance: PRIMARY KEY (id) and uq (service_code, name).
    //   - same id            → ON CONFLICT (id) DO UPDATE (idempotent; replica race-safe)
    //   - name owned by a     → SKIP: the instance is already crystallized under a
    //     different id           different id (e.g. a seed row). Inserting would hit
    //                            uq_algorithm_instance_name and abort the whole
    //                            registration (the boot-convergence bug).
    let name_owner: Option<String> = sqlx::query_scalar(
        "SELECT id FROM algorithm_instance WHERE service_code = $1 AND name = $2",
    )
    .bind(svc)
    .bind(label)
    .fetch_optional(pool)
    .await?;
    if name_owner.as_deref().map_or(true, |owner| owner == inst_id) {
        sqlx::query(
            "INSERT INTO algorithm_instance (id, service_code, algorithm_id, name) \
             VALUES ($1, $2, $3, $4) \
             ON CONFLICT (id) DO UPDATE SET algorithm_id = EXCLUDED.algorithm_id, name = EXCLUDED.name",
        )
        .bind(inst_id)
        .bind(svc)
        .bind(&resolved)
        .bind(label)
        .execute(pool)
        .await?;
    }
    Ok(())
}

/// Idempotent upsert of handler/guard/contribution catalog metadata for `svc`.
///
/// Returns `Ok(true)` if rows were written (catalog changed), `Ok(false)` if
/// the stored catalog already covered the payload (no-op) — exactly the Java
/// contract that lets the caller skip the CONFIG_CHANGED broadcast.
///
/// Like the Java service, intentionally NOT wrapped in a single transaction:
/// each statement auto-commits so a conflict on one row can't abort the rest.
///
/// Port of `ActionCatalogPersistenceService.persistToDB`.
pub async fn persist_to_db(
    pool: &PgPool,
    svc: &str,
    handlers: &[HandlerEntry],
    guards: &[GuardEntry],
    contributions: &[ContributionInput],
) -> Result<bool, sqlx::Error> {
    let handler_type_id = format!("sys-handler-{svc}");
    let guard_type_id = format!("sys-guard-{svc}");

    let incoming =
        incoming_fingerprint(&handler_type_id, &guard_type_id, handlers, guards, contributions);
    let current = current_fingerprint(pool, svc).await?;
    // Java: current.containsAll(incoming) -> no-op.
    if incoming.is_subset(&current) {
        tracing::debug!("Action catalog unchanged for service {svc} — skipping persist");
        return Ok(false);
    }

    if !handlers.is_empty() {
        sqlx::query(
            "INSERT INTO algorithm_type (id, service_code, name, java_interface) \
             VALUES ($1, $2, 'Action Handler', 'ActionHandler') \
             ON CONFLICT (id) DO NOTHING",
        )
        .bind(&handler_type_id)
        .bind(svc)
        .execute(pool)
        .await?;
    }
    if !guards.is_empty() {
        sqlx::query(
            "INSERT INTO algorithm_type (id, service_code, name, java_interface) \
             VALUES ($1, $2, 'Action Guard', 'ActionGuard') \
             ON CONFLICT (id) DO NOTHING",
        )
        .bind(&guard_type_id)
        .bind(svc)
        .execute(pool)
        .await?;
    }

    for h in handlers {
        let safe = safe_code(&h.code);
        upsert_algorithm_with_instance(
            pool,
            svc,
            &handler_type_id,
            &format!("alg-{svc}-{safe}"),
            &format!("ainst-{svc}-{safe}"),
            &h.code,
            h.label_or_code(),
            &h.module,
        )
        .await?;
    }

    for g in guards {
        let safe = safe_code(&g.code);
        upsert_algorithm_with_instance(
            pool,
            svc,
            &guard_type_id,
            &format!("alg-{svc}-g-{safe}"),
            &format!("ainst-{svc}-g-{safe}"),
            &g.code,
            g.label_or_code(),
            &g.module,
        )
        .await?;
    }

    for c in contributions {
        if c.algorithms.is_empty() {
            continue;
        }
        let java_iface = c.java_interface.as_deref().unwrap_or(&c.type_name);
        sqlx::query(
            "INSERT INTO algorithm_type (id, service_code, name, java_interface) \
             VALUES ($1, $2, $3, $4) \
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name",
        )
        .bind(&c.type_id)
        .bind(svc)
        .bind(&c.type_name)
        .bind(java_iface)
        .execute(pool)
        .await?;

        for a in &c.algorithms {
            let safe = safe_code(&a.code);
            upsert_algorithm_with_instance(
                pool,
                svc,
                &c.type_id,
                &format!("alg-{svc}-c-{safe}"),
                &format!("ainst-{svc}-c-{safe}"),
                &a.code,
                a.label_or_code(),
                &a.module,
            )
            .await?;
        }
    }

    let alg_contrib_count: usize = contributions.iter().map(|c| c.algorithms.len()).sum();
    tracing::debug!(
        "Persisted {} handlers + {} guards + {} contribution algorithms to platform DB for service {svc}",
        handlers.len(),
        guards.len(),
        alg_contrib_count
    );
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn safe_code_lowercases_and_dashes() {
        assert_eq!(safe_code("CHECK_OUT"), "check-out");
        assert_eq!(safe_code("Lock"), "lock");
    }

    #[test]
    fn deterministic_ids() {
        let safe = safe_code("CHECK_OUT");
        assert_eq!(format!("alg-psm-{safe}"), "alg-psm-check-out");
        assert_eq!(format!("ainst-psm-{safe}"), "ainst-psm-check-out");
    }

    #[test]
    fn incoming_fingerprint_shape() {
        let handlers = vec![HandlerEntry {
            code: "CHECK_OUT".into(),
            label: Some("Check Out".into()),
            module: Some("nodes".into()),
        }];
        let fp = incoming_fingerprint("sys-handler-psm", "sys-guard-psm", &handlers, &[], &[]);
        assert!(fp.contains("type|sys-handler-psm|Action Handler"));
        // handler-only payload => no guard type line
        assert!(!fp.contains("type|sys-guard-psm|Action Guard"));
        assert!(fp.contains("alg|CHECK_OUT|Check Out|nodes|sys-handler-psm"));
        assert!(fp.contains("inst|Check Out"));
        assert_eq!(fp.len(), 3);
    }

    #[test]
    fn guard_and_contribution_fingerprint_shape() {
        let guards = vec![GuardEntry {
            code: "IS_OWNER".into(),
            label: None,
            module: Some("authz".into()),
        }];
        let contribs = vec![ContributionInput {
            type_id: "type-wrapper-psm".into(),
            type_name: "Wrapper".into(),
            java_interface: None,
            algorithms: vec![AlgorithmInput {
                code: "WRAP_LOCK".into(),
                label: Some("Wrap Lock".into()),
                module: None,
            }],
        }];
        let fp =
            incoming_fingerprint("sys-handler-psm", "sys-guard-psm", &[], &guards, &contribs);
        assert!(fp.contains("alg|IS_OWNER|IS_OWNER|authz|sys-guard-psm"));
        assert!(fp.contains("inst|IS_OWNER"));
        assert!(fp.contains("type|type-wrapper-psm|Wrapper"));
        assert!(fp.contains("alg|WRAP_LOCK|Wrap Lock||type-wrapper-psm"));
        assert!(fp.contains("inst|Wrap Lock"));
    }

    #[test]
    fn subset_check_makes_identical_payload_a_noop() {
        let handlers = vec![HandlerEntry {
            code: "LOCK".into(),
            label: None,
            module: None,
        }];
        let fp = incoming_fingerprint("sys-handler-psm", "sys-guard-psm", &handlers, &[], &[]);
        // Identical "stored" set => subset => no-op.
        assert!(fp.is_subset(&fp.clone()));
        // A superset of stored rows (new handler added) is NOT a subset.
        let mut stored = fp.clone();
        let bigger = {
            let extra = vec![
                HandlerEntry { code: "LOCK".into(), label: None, module: None },
                HandlerEntry { code: "UNLOCK".into(), label: None, module: None },
            ];
            incoming_fingerprint("sys-handler-psm", "sys-guard-psm", &extra, &[], &[])
        };
        assert!(!bigger.is_subset(&stored));
        stored.extend(bigger.iter().cloned());
        assert!(bigger.is_subset(&stored));
    }
}
