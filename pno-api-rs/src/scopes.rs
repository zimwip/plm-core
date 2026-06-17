//! Permission-scope registry + scope registration endpoints.
//!
//! Faithful port of `PermissionScopeRegistry` + `ScopeRegistrationService` +
//! `ScopeRegistrationController`, backed by the `permission_scope`,
//! `permission_scope_key` and `permission_scope_value_source` tables.
//!
//! Bare paths (the spe-api gateway strips `/api/pno`; these live under
//! `/internal/**` so the S2S `X-Service-Secret` guard — not `PnoUserContext` —
//! protects them):
//!   * `POST /internal/scopes/register` — validate + topo-sort + upsert a batch,
//!     409 on a definition-hash conflict, then reload the in-memory registry.
//!   * `GET  /internal/scopes`          — current catalog as `{scopes: [...]}`.
//!
//! `pno-api` has no `/internal/scope-values/{scope}/{key}` endpoint on this
//! controller (value enumeration lives in the access-rights tree service), so
//! none is ported here.

use crate::error::{ApiError, ApiResult};
use crate::events;
use crate::state::AppState;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sha2::{Digest, Sha256};
use sqlx::PgPool;
use std::collections::HashSet;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Public registry API (consumed by authorization.rs — must match exactly).
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
pub struct ScopeInfo {
    pub code: String,
    pub parent: Option<String>,
    pub owner_service: String,
    pub definition_hash: String,
    /// This scope's own keys, in `key_position` order (no inherited keys).
    pub keys: Vec<String>,
}

/// Internal mirror row: `ScopeInfo` plus the bits needed to faithfully rebuild
/// the on-the-wire `ScopeRegistration` (description, full key definitions,
/// value sources). Port of `PermissionScopeRegistry.ScopeRecord`.
#[derive(Clone, Debug)]
struct ScopeRecord {
    code: String,
    parent: Option<String>,
    description: Option<String>,
    definition_hash: String,
    owner_service: String,
    keys: Vec<ScopeKeyDefinition>,
    value_sources: Vec<ValueSourceRecord>,
}

impl ScopeRecord {
    fn to_info(&self) -> ScopeInfo {
        ScopeInfo {
            code: self.code.clone(),
            parent: self.parent.clone(),
            owner_service: self.owner_service.clone(),
            definition_hash: self.definition_hash.clone(),
            keys: self.keys.iter().map(|k| k.name.clone()).collect(),
        }
    }

    /// `toRegistration`: collapse value sources back to the `(key, endpoint)`
    /// wire shape (service_code is dropped — it is implied by the registrant).
    fn to_registration(&self) -> ScopeRegistration {
        ScopeRegistration {
            scope_code: self.code.clone(),
            parent_scope_code: self.parent.clone(),
            description: self.description.clone(),
            keys: self.keys.clone(),
            value_sources: self
                .value_sources
                .iter()
                .map(|v| ScopeValueSourceDefinition {
                    key_name: v.key_name.clone(),
                    endpoint_path: v.endpoint_path.clone(),
                })
                .collect(),
        }
    }
}

#[derive(Clone, Debug)]
struct ValueSourceRecord {
    key_name: String,
    #[allow(dead_code)]
    service_code: String,
    endpoint_path: String,
}

/// In-memory mirror of the scope catalog. Loaded at boot, reloaded after every
/// successful registration so concurrent read paths always see the freshest
/// shape without an extra DB hit. Port of `PermissionScopeRegistry`.
pub struct ScopeRegistry {
    scopes_by_code: DashMap<String, ScopeRecord>,
}

impl Default for ScopeRegistry {
    fn default() -> Self {
        Self::new()
    }
}

impl ScopeRegistry {
    pub fn new() -> Self {
        Self {
            scopes_by_code: DashMap::new(),
        }
    }

    /// (Re)load all scopes + keys + value sources from the DB into the mirror.
    /// Port of `PermissionScopeRegistry.load()`.
    pub async fn load(&self, db: &PgPool) -> Result<(), sqlx::Error> {
        let mut next: std::collections::HashMap<String, ScopeRecord> =
            std::collections::HashMap::new();

        let scopes = sqlx::query_as::<_, (String, Option<String>, Option<String>, String, String)>(
            "SELECT scope_code, parent_scope_code, description, definition_hash, owner_service \
             FROM permission_scope",
        )
        .fetch_all(db)
        .await?;
        for (code, parent, description, definition_hash, owner_service) in scopes {
            next.insert(
                code.clone(),
                ScopeRecord {
                    code,
                    parent,
                    description,
                    definition_hash,
                    owner_service,
                    keys: Vec::new(),
                    value_sources: Vec::new(),
                },
            );
        }

        let keys = sqlx::query_as::<_, (String, String, Option<String>)>(
            "SELECT scope_code, key_name, description FROM permission_scope_key \
             ORDER BY scope_code, key_position",
        )
        .fetch_all(db)
        .await?;
        for (code, key_name, description) in keys {
            if let Some(rec) = next.get_mut(&code) {
                rec.keys.push(ScopeKeyDefinition {
                    name: key_name,
                    description,
                });
            }
        }

        let sources = sqlx::query_as::<_, (String, String, String, String)>(
            "SELECT scope_code, key_name, service_code, endpoint_path \
             FROM permission_scope_value_source ORDER BY scope_code, key_name, service_code",
        )
        .fetch_all(db)
        .await?;
        for (code, key_name, service_code, endpoint_path) in sources {
            if let Some(rec) = next.get_mut(&code) {
                rec.value_sources.push(ValueSourceRecord {
                    key_name,
                    service_code,
                    endpoint_path,
                });
            }
        }

        let count = next.len();
        self.scopes_by_code.clear();
        for (code, rec) in next {
            self.scopes_by_code.insert(code, rec);
        }
        tracing::info!("PermissionScopeRegistry loaded: {count} scope(s)");
        Ok(())
    }

    /// All scopes (no ordering guarantee — mirrors the Java map snapshot).
    pub fn snapshot(&self) -> Vec<ScopeInfo> {
        self.scopes_by_code
            .iter()
            .map(|e| e.value().to_info())
            .collect()
    }

    pub fn get(&self, code: &str) -> Option<ScopeInfo> {
        self.scopes_by_code.get(code).map(|e| e.value().to_info())
    }

    /// Ordered key list for a scope including inherited keys from its parent
    /// chain (parent keys first). Port of `effectiveKeys`/`collectKeys`.
    pub fn effective_keys(&self, code: &str) -> Vec<String> {
        let mut out = Vec::new();
        self.collect_keys(code, &mut out);
        out
    }

    fn collect_keys(&self, code: &str, out: &mut Vec<String>) {
        let rec = match self.scopes_by_code.get(code) {
            Some(r) => r,
            None => return,
        };
        let parent = rec.parent.clone();
        let own: Vec<String> = rec.keys.iter().map(|k| k.name.clone()).collect();
        // Drop the borrow before recursing to avoid a DashMap re-entrant lock.
        drop(rec);
        if let Some(p) = parent {
            self.collect_keys(&p, out);
        }
        out.extend(own);
    }

    /// All scopes as on-the-wire registrations (`GET /internal/scopes`).
    fn registrations(&self) -> Vec<ScopeRegistration> {
        self.scopes_by_code
            .iter()
            .map(|e| e.value().to_registration())
            .collect()
    }
}

// ---------------------------------------------------------------------------
// Wire DTOs — mirror com.plm.platform.authz.dto.*
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ScopeKeyDefinition {
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScopeValueSourceDefinition {
    pub key_name: String,
    pub endpoint_path: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScopeRegistration {
    pub scope_code: String,
    #[serde(default)]
    pub parent_scope_code: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub keys: Vec<ScopeKeyDefinition>,
    #[serde(default)]
    pub value_sources: Vec<ScopeValueSourceDefinition>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScopeRegistrationRequest {
    pub service_code: String,
    pub instance_id: String,
    #[serde(default)]
    pub scopes: Vec<ScopeRegistration>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScopeConflict {
    pub scope_code: String,
    pub existing_definition_hash: String,
    pub submitted_definition_hash: String,
    pub existing_owner_service: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScopeRegistrationResponse {
    pub instance_id: String,
    pub conflicts: Vec<ScopeConflict>,
}

// ---------------------------------------------------------------------------
// Canonical scope-shape hash. Byte-for-byte port of ScopeDefinitionHasher:
//   "parent=<parent or ''>\nkeys=<k1>,<k2>,..." → lowercase hex SHA-256.
// Value sources and owner service are deliberately excluded.
// ---------------------------------------------------------------------------

fn definition_hash(s: &ScopeRegistration) -> String {
    let mut buf = String::with_capacity(128);
    buf.push_str("parent=");
    buf.push_str(s.parent_scope_code.as_deref().unwrap_or(""));
    buf.push('\n');
    buf.push_str("keys=");
    for (i, k) in s.keys.iter().enumerate() {
        if i > 0 {
            buf.push(',');
        }
        buf.push_str(&k.name);
    }
    let digest = Sha256::digest(buf.as_bytes());
    hex::encode(digest)
}

// ---------------------------------------------------------------------------
// Registration service — port of ScopeRegistrationService.registerAll.
// ---------------------------------------------------------------------------

/// Validate + persist a batch of scope registrations in one transaction.
/// Returns `Ok(true)` when anything changed (so the caller reloads the registry
/// and bumps the authorization version). A definition-hash conflict against a
/// scope owned by another service yields `ApiError::Conflict` (HTTP 409),
/// mirroring `ScopeConflictException → GlobalExceptionHandler`.
async fn register_all(
    db: &PgPool,
    service_code: &str,
    instance_id: &str,
    scopes: &[ScopeRegistration],
) -> ApiResult<bool> {
    let mut tx = db.begin().await.map_err(ApiError::from)?;
    let mut conflicts: Vec<ScopeConflict> = Vec::new();
    let mut any_change = false;

    // Insert parents before children so the parent_scope_code FK resolves.
    let ordered = topological_sort(&mut tx, scopes).await?;

    for s in &ordered {
        let submitted_hash = definition_hash(s);
        let existing_hash: Option<String> =
            sqlx::query_scalar("SELECT definition_hash FROM permission_scope WHERE scope_code = $1")
                .bind(&s.scope_code)
                .fetch_optional(&mut *tx)
                .await
                .map_err(ApiError::from)?;

        match existing_hash {
            None => {
                insert_scope(&mut tx, s, service_code, &submitted_hash).await?;
                any_change = true;
            }
            Some(existing) if existing != submitted_hash => {
                let existing_owner: String = sqlx::query_scalar(
                    "SELECT owner_service FROM permission_scope WHERE scope_code = $1",
                )
                .bind(&s.scope_code)
                .fetch_one(&mut *tx)
                .await
                .map_err(ApiError::from)?;
                if existing_owner == service_code {
                    // Owner re-registering its own scope — overwrite hash + keys.
                    update_scope(&mut tx, s, &submitted_hash).await?;
                    any_change = true;
                } else {
                    conflicts.push(ScopeConflict {
                        scope_code: s.scope_code.clone(),
                        existing_definition_hash: existing,
                        submitted_definition_hash: submitted_hash,
                        existing_owner_service: existing_owner,
                    });
                    continue;
                }
            }
            Some(_) => { /* identical hash — idempotent, fall through to value sources */ }
        }

        // Refresh / upsert value sources contributed by this caller. Keyed by
        // (scope_code, key_name, service_code).
        if !s.value_sources.is_empty() {
            for vs in &s.value_sources {
                upsert_value_source(&mut tx, &s.scope_code, vs, service_code, instance_id).await?;
            }
            any_change = true;
        }
    }

    if !conflicts.is_empty() {
        // Roll back the whole batch; the Java @Transactional method throws,
        // which rolls back the surrounding transaction.
        drop(tx);
        let n = conflicts.len();
        return Err(ApiError::Conflict(format!(
            "Scope registration conflicts: {n}"
        )));
    }

    tx.commit().await.map_err(ApiError::from)?;
    Ok(any_change)
}

/// Sort scopes so any parent referenced within the same batch is processed
/// first. Parents already in the DB count as resolved. Port of the Java
/// `topologicalSort`. A 400 surfaces for unresolved parent dependencies
/// (Java threw `IllegalStateException`).
async fn topological_sort(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    scopes: &[ScopeRegistration],
) -> ApiResult<Vec<ScopeRegistration>> {
    let mut resolved: HashSet<String> = sqlx::query_scalar::<_, String>(
        "SELECT scope_code FROM permission_scope",
    )
    .fetch_all(&mut **tx)
    .await
    .map_err(ApiError::from)?
    .into_iter()
    .collect();

    let mut remaining: Vec<ScopeRegistration> = scopes.to_vec();
    let mut ordered: Vec<ScopeRegistration> = Vec::with_capacity(scopes.len());
    let mut progressed = true;
    while !remaining.is_empty() && progressed {
        progressed = false;
        let mut still: Vec<ScopeRegistration> = Vec::with_capacity(remaining.len());
        for s in remaining.into_iter() {
            let parent_ok = match &s.parent_scope_code {
                None => true,
                Some(p) => resolved.contains(p),
            };
            if parent_ok {
                resolved.insert(s.scope_code.clone());
                ordered.push(s);
                progressed = true;
            } else {
                still.push(s);
            }
        }
        remaining = still;
    }

    if !remaining.is_empty() {
        let missing = remaining
            .iter()
            .map(|s| s.scope_code.clone())
            .collect::<Vec<_>>()
            .join(", ");
        return Err(ApiError::BadRequest(format!(
            "Scope registration: unresolved parent dependencies for {missing}"
        )));
    }
    Ok(ordered)
}

async fn insert_scope(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    s: &ScopeRegistration,
    owner_service: &str,
    hash: &str,
) -> ApiResult<()> {
    sqlx::query(
        "INSERT INTO permission_scope \
         (scope_code, parent_scope_code, description, definition_hash, owner_service, registered_at) \
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)",
    )
    .bind(&s.scope_code)
    .bind(&s.parent_scope_code)
    .bind(&s.description)
    .bind(hash)
    .bind(owner_service)
    .execute(&mut **tx)
    .await
    .map_err(ApiError::from)?;

    for (i, k) in s.keys.iter().enumerate() {
        sqlx::query(
            "INSERT INTO permission_scope_key (scope_code, key_position, key_name, description) \
             VALUES ($1, $2, $3, $4)",
        )
        .bind(&s.scope_code)
        .bind((i + 1) as i32)
        .bind(&k.name)
        .bind(&k.description)
        .execute(&mut **tx)
        .await
        .map_err(ApiError::from)?;
    }

    tracing::info!("Registered scope {} (owner={owner_service})", s.scope_code);
    Ok(())
}

async fn update_scope(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    s: &ScopeRegistration,
    hash: &str,
) -> ApiResult<()> {
    sqlx::query(
        "UPDATE permission_scope SET parent_scope_code = $1, description = $2, definition_hash = $3 \
         WHERE scope_code = $4",
    )
    .bind(&s.parent_scope_code)
    .bind(&s.description)
    .bind(hash)
    .bind(&s.scope_code)
    .execute(&mut **tx)
    .await
    .map_err(ApiError::from)?;

    // Replace keys — owner is authoritative on shape.
    sqlx::query("DELETE FROM permission_scope_key WHERE scope_code = $1")
        .bind(&s.scope_code)
        .execute(&mut **tx)
        .await
        .map_err(ApiError::from)?;

    for (i, k) in s.keys.iter().enumerate() {
        sqlx::query(
            "INSERT INTO permission_scope_key (scope_code, key_position, key_name, description) \
             VALUES ($1, $2, $3, $4)",
        )
        .bind(&s.scope_code)
        .bind((i + 1) as i32)
        .bind(&k.name)
        .bind(&k.description)
        .execute(&mut **tx)
        .await
        .map_err(ApiError::from)?;
    }

    tracing::info!("Updated scope {} (hash refreshed)", s.scope_code);
    Ok(())
}

async fn upsert_value_source(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    scope_code: &str,
    vs: &ScopeValueSourceDefinition,
    service_code: &str,
    instance_id: &str,
) -> ApiResult<()> {
    let updated = sqlx::query(
        "UPDATE permission_scope_value_source \
         SET endpoint_path = $1, instance_id = $2, last_seen_at = CURRENT_TIMESTAMP \
         WHERE scope_code = $3 AND key_name = $4 AND service_code = $5",
    )
    .bind(&vs.endpoint_path)
    .bind(instance_id)
    .bind(scope_code)
    .bind(&vs.key_name)
    .bind(service_code)
    .execute(&mut **tx)
    .await
    .map_err(ApiError::from)?
    .rows_affected();

    if updated == 0 {
        sqlx::query(
            "INSERT INTO permission_scope_value_source \
             (id, scope_code, key_name, service_code, endpoint_path, instance_id, last_seen_at) \
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)",
        )
        .bind(Uuid::new_v4().to_string())
        .bind(scope_code)
        .bind(&vs.key_name)
        .bind(service_code)
        .bind(&vs.endpoint_path)
        .bind(instance_id)
        .execute(&mut **tx)
        .await
        .map_err(ApiError::from)?;
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// HTTP handlers — port of ScopeRegistrationController.
// ---------------------------------------------------------------------------

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/internal/scopes/register", post(register))
        .route("/internal/scopes", get(list))
}

/// `POST /internal/scopes/register` — 204 on an empty batch, else register the
/// batch (409 on conflict via `ApiError::Conflict`), reload the registry and
/// bump the authorization version, then reply `{instanceId, conflicts: []}`.
async fn register(
    State(state): State<AppState>,
    Json(req): Json<ScopeRegistrationRequest>,
) -> ApiResult<Response> {
    if req.scopes.is_empty() {
        return Ok(StatusCode::NO_CONTENT.into_response());
    }

    let changed = register_all(&state.db, &req.service_code, &req.instance_id, &req.scopes).await?;

    if changed {
        // Reload so concurrent read paths see the freshest shape (mirrors the
        // Java `registry.load()` after a successful change).
        if let Err(e) = state.scopes.load(&state.db).await {
            tracing::warn!("scope registry reload failed: {e}");
        }
        // The Java registry bumps the authorization version on any grant/scope
        // mutation; replicate so the gateway can revoke stale tokens.
        events::authorization_changed(&state, "SCOPE_REGISTERED", None).await;
    }

    Ok(Json(ScopeRegistrationResponse {
        instance_id: req.instance_id,
        conflicts: Vec::new(),
    })
    .into_response())
}

/// `GET /internal/scopes` — current catalog as `{scopes: [ScopeRegistration]}`.
async fn list(State(state): State<AppState>) -> ApiResult<Json<serde_json::Value>> {
    let scopes = state.scopes.registrations();
    Ok(Json(json!({ "scopes": scopes })))
}
