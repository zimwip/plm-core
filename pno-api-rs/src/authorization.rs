//! Authorization model — permission catalog, scope-aware grants, snapshot &
//! version, and the access-rights tree. Faithful port of the Java
//! `AuthorizationService` + `DynamicAuthorizationService` +
//! `AuthorizationController` + `InternalAuthorizationController` +
//! `AccessRightsController` + `AccessRightsTreeService` +
//! `AuthorizationKeysFingerprint`.
//!
//! Bare paths (the spe-api gateway strips `/api/pno`):
//!
//! Catalog / role grants (AuthorizationController):
//!   * `GET    /global-actions`
//!   * `GET    /permissions?scope=&serviceCode=`
//!   * `POST   /permissions`
//!   * `PUT    /permissions/{permissionCode}`
//!   * `GET    /my-global-permissions`
//!   * `GET    /roles/{roleId}/policies`
//!   * `GET    /roles/{roleId}/global-permissions`
//!   * `POST   /roles/{roleId}/global-permissions`
//!   * `DELETE /roles/{roleId}/global-permissions/{permissionCode}`
//!   * `GET    /roles/{roleId}/scope-permissions/{scopeCode}`
//!   * `POST   /roles/{roleId}/scope-permissions/{scopeCode}`
//!   * `DELETE /roles/{roleId}/scope-permissions/{scopeCode}/{permissionCode}`
//!   * `GET    /nodetypes/{nodeTypeId}/permissions/{permissionCode}?transitionId=`
//!   * `POST   /nodetypes/{nodeTypeId}/permissions/{permissionCode}`
//!   * `DELETE /nodetypes/{nodeTypeId}/permissions/{permissionCode}`
//!
//! Access-rights (AccessRightsController):
//!   * `GET    /access-rights/tree?projectSpaceId=`
//!   * `GET    /access-rights/roles/{roleId}/grants?scopeCode=`
//!   * `POST   /access-rights/grants`
//!   * `DELETE /access-rights/grants`
//!
//! Internal snapshot (InternalAuthorizationController):
//!   * `GET    /internal/authorization/snapshot`
//!   * `GET    /internal/authorization/version`
//!
//! Every grant / permission / scope mutation calls
//! `crate::events::authorization_changed` which bumps the monotonic version
//! (gateway revocation) AND publishes NATS `global.AUTHORIZATION_CHANGED`.
//!
//! The scope shape (effective key list, parent chain, owner/hash) is read from
//! the in-memory `state.scopes` registry (`PermissionScopeRegistry` port) — the
//! authoritative shape descriptor — which `scopes.rs` keeps fresh on every
//! registration. Two pieces of presentation-only metadata that `ScopeInfo`
//! omits — the scope `description` and per-key descriptions, used only by the
//! access-rights tree — are read from the backing `permission_scope` /
//! `permission_scope_key` tables. Value-source endpoints are likewise read from
//! `permission_scope_value_source`.

use crate::auth::PnoUserContext;
use crate::error::{ApiError, ApiResult};
use crate::events;
use crate::state::AppState;
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Extension, Json, Router};
use serde::Deserialize;
use serde_json::{json, Map, Value};
use sha2::{Digest, Sha256};
use std::collections::BTreeMap;
use uuid::Uuid;

pub fn routes() -> Router<AppState> {
    Router::new()
        // ── AuthorizationController (catalog + role/node-type grants) ──
        .route("/global-actions", get(list_global_actions))
        .route("/permissions", get(list_permissions).post(create_permission))
        .route("/permissions/:permission_code", axum::routing::put(update_permission))
        .route("/my-global-permissions", get(my_global_permissions))
        .route("/roles/:role_id/policies", get(get_role_policies))
        .route(
            "/roles/:role_id/global-permissions",
            get(get_role_global_permissions).post(add_role_global_permission),
        )
        .route(
            "/roles/:role_id/global-permissions/:permission_code",
            axum::routing::delete(remove_role_global_permission),
        )
        .route(
            "/roles/:role_id/scope-permissions/:scope_code",
            get(get_role_scope_permissions).post(add_role_scope_permission),
        )
        .route(
            "/roles/:role_id/scope-permissions/:scope_code/:permission_code",
            axum::routing::delete(remove_role_scope_permission),
        )
        .route(
            "/nodetypes/:node_type_id/permissions/:permission_code",
            get(list_node_type_grants)
                .post(add_node_type_grant)
                .delete(remove_node_type_grant),
        )
        // ── AccessRightsController (shape-agnostic) ──
        .route("/access-rights/tree", get(access_rights_tree))
        .route("/access-rights/roles/:role_id/grants", get(grants_for_role))
        .route(
            "/access-rights/grants",
            post(add_grant_endpoint).delete(remove_grant_endpoint),
        )
        // ── InternalAuthorizationController (S2S snapshot) ──
        .route("/internal/authorization/snapshot", get(snapshot))
        .route("/internal/authorization/version", get(version))
}

/// `currentUserId()`: prefer the authenticated principal, else `None`.
fn by_user(ctx: &Option<Extension<PnoUserContext>>) -> Option<&str> {
    ctx.as_ref().map(|e| e.user_id.as_str())
}

// ============================================================================
// Scope presentation metadata — descriptions that `ScopeInfo` does not carry.
// Effective keys / parent chain / owner / hash come from `state.scopes`.
// ============================================================================

/// Own-key `(name, description)` pairs for a single scope, ordered by
/// `key_position`. `ScopeInfo` (the in-memory registry) only carries key names,
/// not descriptions, so the access-rights tree (which renders descriptions)
/// reads them from the backing table.
async fn own_keys(
    db: &sqlx::PgPool,
    scope_code: &str,
) -> Result<Vec<(String, Option<String>)>, sqlx::Error> {
    let rows = sqlx::query_as::<_, (String, Option<String>)>(
        "SELECT key_name, description FROM permission_scope_key \
         WHERE scope_code = $1 ORDER BY key_position",
    )
    .bind(scope_code)
    .fetch_all(db)
    .await?;
    Ok(rows)
}

/// Scope `description` from the backing table (`ScopeInfo` omits it).
async fn scope_description(
    db: &sqlx::PgPool,
    scope_code: &str,
) -> Result<Option<String>, sqlx::Error> {
    let row = sqlx::query_as::<_, (Option<String>,)>(
        "SELECT description FROM permission_scope WHERE scope_code = $1",
    )
    .bind(scope_code)
    .fetch_optional(db)
    .await?;
    Ok(row.and_then(|(d,)| d))
}

// ============================================================================
// Keys fingerprint — port of AuthorizationKeysFingerprint.compute.
// `key1=val1|key2=val2` in effective-key order; empty key list → 64 zeros.
// Effective key order comes from the in-memory registry (`effective_keys`).
// ============================================================================

/// Canonical fingerprint of the ordered key list for one grant. The empty-key
/// case returns the fixed 64-zero sentinel (one stable fingerprint for every
/// GLOBAL/role-only grant), matching the V10 backfill marker.
fn compute_fingerprint(state: &AppState, scope_code: &str, keys: &BTreeMap<String, String>) -> String {
    let ordered = state.scopes.effective_keys(scope_code);
    if ordered.is_empty() {
        return "0".repeat(64);
    }
    let mut sb = String::new();
    for (i, name) in ordered.iter().enumerate() {
        if i > 0 {
            sb.push('|');
        }
        let value = keys.get(name).map(String::as_str).unwrap_or("");
        sb.push_str(name);
        sb.push('=');
        sb.push_str(value);
    }
    sha256_hex(&sb)
}

fn sha256_hex(s: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(s.as_bytes());
    hex::encode(hasher.finalize())
}

// ============================================================================
// Validation — port of DynamicAuthorizationService.validate.
// Validates submitted key names against the scope's effective keys via the
// in-memory registry (`state.scopes`).
// ============================================================================

/// Validate the submitted keys against the scope's effective key list. On any
/// mismatch (unknown scope, wrong cardinality, missing/blank value) returns
/// `ApiError::BadRequest` (the Java throws `IllegalArgumentException`, which the
/// global handler maps to 400).
fn validate(state: &AppState, scope_code: &str, keys: &BTreeMap<String, String>) -> ApiResult<()> {
    if state.scopes.get(scope_code).is_none() {
        return Err(ApiError::BadRequest(format!("Unknown scope: {scope_code}")));
    }
    let expected = state.scopes.effective_keys(scope_code);
    if expected.len() != keys.len() {
        return Err(ApiError::BadRequest(format!(
            "Scope {scope_code} expects keys {:?} but got {:?}",
            expected,
            keys.keys().collect::<Vec<_>>()
        )));
    }
    for name in &expected {
        match keys.get(name) {
            Some(v) if !v.trim().is_empty() => {}
            _ => {
                return Err(ApiError::BadRequest(format!(
                    "Scope {scope_code} key '{name}' missing"
                )))
            }
        }
    }
    Ok(())
}

// ============================================================================
// Permission catalog — port of AuthorizationService permission methods.
// ============================================================================

/// Map a `permission` table row to the camelCase snapshot/catalog shape:
/// `{permissionCode, scope, displayName, description, displayOrder, serviceCode}`.
fn permission_json(
    permission_code: String,
    scope: String,
    display_name: String,
    description: Option<String>,
    display_order: i32,
    service_code: Option<String>,
) -> Value {
    json!({
        "permissionCode": permission_code,
        "scope": scope,
        "displayName": display_name,
        "description": description,
        "displayOrder": display_order,
        "serviceCode": service_code,
    })
}

type PermissionRow = (String, String, String, Option<String>, i32, Option<String>);

/// `listPermissions()` — full catalog ordered by (display_order, permission_code).
async fn fetch_all_permissions(db: &sqlx::PgPool) -> Result<Vec<Value>, sqlx::Error> {
    let rows = sqlx::query_as::<_, PermissionRow>(
        "SELECT permission_code, scope, display_name, description, display_order, service_code \
         FROM permission ORDER BY display_order, permission_code",
    )
    .fetch_all(db)
    .await?;
    Ok(rows
        .into_iter()
        .map(|(c, s, dn, d, o, sc)| permission_json(c, s, dn, d, o, sc))
        .collect())
}

/// `GET /global-actions` — `listGlobalPermissions()`.
async fn list_global_actions(State(state): State<AppState>) -> ApiResult<Json<Vec<Value>>> {
    let rows = sqlx::query_as::<_, PermissionRow>(
        "SELECT permission_code, scope, display_name, description, display_order, service_code \
         FROM permission WHERE scope = 'GLOBAL' ORDER BY display_order, permission_code",
    )
    .fetch_all(&state.db)
    .await?;
    Ok(Json(
        rows.into_iter()
            .map(|(c, s, dn, d, o, sc)| permission_json(c, s, dn, d, o, sc))
            .collect(),
    ))
}

#[derive(Debug, Default, Deserialize)]
struct PermissionFilter {
    #[serde(default)]
    scope: Option<String>,
    #[serde(default, rename = "serviceCode")]
    service_code: Option<String>,
}

/// `GET /permissions?scope=&serviceCode=` — `listPermissions(scope, serviceCode)`.
/// Optional filters; ordered by (service_code, display_order, permission_code).
async fn list_permissions(
    State(state): State<AppState>,
    Query(filter): Query<PermissionFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let scope = filter.scope.filter(|s| !s.trim().is_empty());
    let service_code = filter.service_code.filter(|s| !s.trim().is_empty());

    // Build the dynamic WHERE the same way the Java does, but with positional
    // params resolved at query-build time (no plain-SQL bind threading needed).
    let mut sql = String::from(
        "SELECT permission_code, scope, display_name, description, display_order, service_code \
         FROM permission",
    );
    let mut clauses: Vec<String> = Vec::new();
    let mut idx = 1;
    if scope.is_some() {
        clauses.push(format!("scope = ${idx}"));
        idx += 1;
    }
    if service_code.is_some() {
        clauses.push(format!("service_code = ${idx}"));
    }
    if !clauses.is_empty() {
        sql.push_str(" WHERE ");
        sql.push_str(&clauses.join(" AND "));
    }
    sql.push_str(" ORDER BY service_code, display_order, permission_code");

    let mut q = sqlx::query_as::<_, PermissionRow>(&sql);
    if let Some(s) = &scope {
        q = q.bind(s);
    }
    if let Some(sc) = &service_code {
        q = q.bind(sc);
    }
    let rows = q.fetch_all(&state.db).await?;
    Ok(Json(
        rows.into_iter()
            .map(|(c, s, dn, d, o, sc)| permission_json(c, s, dn, d, o, sc))
            .collect(),
    ))
}

/// `POST /permissions` body — all camelCase, with Java defaults applied.
#[derive(Debug, Default, Deserialize)]
struct CreatePermissionBody {
    #[serde(default, rename = "permissionCode")]
    permission_code: Option<String>,
    #[serde(default, rename = "serviceCode")]
    service_code: Option<String>,
    #[serde(default)]
    scope: Option<String>,
    #[serde(default, rename = "displayName")]
    display_name: Option<String>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default, rename = "displayOrder")]
    display_order: Option<i32>,
}

/// `POST /permissions` — idempotent create (`ON CONFLICT DO NOTHING`), then bump
/// + publish. Returns `{permissionCode}`.
async fn create_permission(
    State(state): State<AppState>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<CreatePermissionBody>,
) -> ApiResult<Json<Value>> {
    let code = body.permission_code.clone().unwrap_or_default();
    if code.trim().is_empty() {
        return Err(ApiError::BadRequest("permissionCode required".to_string()));
    }
    let service_code = body.service_code.unwrap_or_else(|| "platform".to_string());
    let scope = body.scope.unwrap_or_else(|| "GLOBAL".to_string());
    // getOrDefault("displayName", permissionCode): null displayName falls back to code.
    let display_name = body.display_name.unwrap_or_else(|| code.clone());
    let display_order = body.display_order.unwrap_or(0);

    sqlx::query(
        "INSERT INTO permission (permission_code, service_code, scope, display_name, description, display_order) \
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (permission_code) DO NOTHING",
    )
    .bind(&code)
    .bind(&service_code)
    .bind(&scope)
    .bind(&display_name)
    .bind(&body.description)
    .bind(display_order)
    .execute(&state.db)
    .await?;

    events::authorization_changed(&state, "PERMISSION_CREATED", by_user(&ctx)).await;
    Ok(Json(json!({ "permissionCode": code })))
}

/// `PUT /permissions/{permissionCode}` body.
#[derive(Debug, Default, Deserialize)]
struct UpdatePermissionBody {
    #[serde(default, rename = "displayName")]
    display_name: Option<String>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default, rename = "displayOrder")]
    display_order: Option<i32>,
}

/// `PUT /permissions/{permissionCode}` — update name/description/order → 204.
async fn update_permission(
    State(state): State<AppState>,
    Path(permission_code): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<UpdatePermissionBody>,
) -> ApiResult<impl IntoResponse> {
    sqlx::query(
        "UPDATE permission SET display_name = $1, description = $2, display_order = $3 \
         WHERE permission_code = $4",
    )
    .bind(&body.display_name)
    .bind(&body.description)
    .bind(body.display_order.unwrap_or(0))
    .bind(&permission_code)
    .execute(&state.db)
    .await?;

    events::authorization_changed(&state, "PERMISSION_UPDATED", by_user(&ctx)).await;
    Ok(StatusCode::NO_CONTENT)
}

/// `GET /my-global-permissions` — codes available to the caller's roles.
/// Admin → every GLOBAL permission code; otherwise the distinct codes granted
/// to the caller's roles in the GLOBAL scope. No principal → `[]`.
async fn my_global_permissions(
    State(state): State<AppState>,
    ctx: Option<Extension<PnoUserContext>>,
) -> ApiResult<Json<Vec<String>>> {
    let u = match ctx {
        Some(Extension(u)) => u,
        None => return Ok(Json(Vec::new())),
    };

    if u.is_admin {
        let codes = sqlx::query_as::<_, (String,)>(
            "SELECT permission_code FROM permission WHERE scope = 'GLOBAL' ORDER BY permission_code",
        )
        .fetch_all(&state.db)
        .await?
        .into_iter()
        .map(|(c,)| c)
        .collect();
        return Ok(Json(codes));
    }

    if u.role_ids.is_empty() {
        return Ok(Json(Vec::new()));
    }
    let placeholders: Vec<String> = (0..u.role_ids.len()).map(|i| format!("${}", i + 1)).collect();
    let sql = format!(
        "SELECT DISTINCT permission_code FROM authorization_policy \
         WHERE scope_code = 'GLOBAL' AND role_id IN ({}) ORDER BY permission_code",
        placeholders.join(",")
    );
    let mut q = sqlx::query_as::<_, (String,)>(&sql);
    for r in &u.role_ids {
        q = q.bind(r);
    }
    let codes = q.fetch_all(&state.db).await?.into_iter().map(|(c,)| c).collect();
    Ok(Json(codes))
}

// ============================================================================
// Grant read — port of DynamicAuthorizationService listAllGrants / projectFlat.
// Flat shape: {id, permission_code, scope, role_id, project_space_id,
//              keys:{k:v}, node_type_id, transition_id}.
// ============================================================================

/// Read grants (optionally filtered) and fold their key rows into the flat
/// per-policy shape. `where_clause` is appended verbatim after the base FROM and
/// must reference `ap` (e.g. `"WHERE ap.role_id = $1"`); `binds` are bound in
/// order.
async fn list_grants_filtered(
    db: &sqlx::PgPool,
    where_clause: &str,
    binds: &[&str],
) -> Result<Vec<Value>, sqlx::Error> {
    let sql = format!(
        "SELECT ap.id, ap.permission_code, ap.scope_code AS scope, ap.role_id, \
                ap.project_space_id, k.key_name, k.key_value \
         FROM authorization_policy ap \
         LEFT JOIN authorization_policy_key k ON k.policy_id = ap.id {where_clause}"
    );
    let mut q = sqlx::query_as::<
        _,
        (
            String,
            String,
            String,
            String,
            String,
            Option<String>,
            Option<String>,
        ),
    >(&sql);
    for b in binds {
        q = q.bind(*b);
    }
    let rows = q.fetch_all(db).await?;

    // Preserve first-seen policy order (LinkedHashMap in the Java).
    let mut order: Vec<String> = Vec::new();
    let mut by_id: std::collections::HashMap<String, Value> = std::collections::HashMap::new();
    for (id, permission_code, scope, role_id, project_space_id, key_name, key_value) in rows {
        let entry = by_id.entry(id.clone()).or_insert_with(|| {
            order.push(id.clone());
            json!({
                "id": id,
                "permission_code": permission_code,
                "scope": scope,
                "role_id": role_id,
                "project_space_id": project_space_id,
                "keys": Map::new(),
            })
        });
        if let Some(kn) = key_name {
            if let Some(keys) = entry.get_mut("keys").and_then(|v| v.as_object_mut()) {
                keys.insert(kn, json!(key_value.unwrap_or_default()));
            }
        }
    }

    // Project the legacy back-compat columns (node_type_id, transition_id) from
    // the keys map, exactly like projectFlat does for the Casbin snapshot.
    let mut out = Vec::with_capacity(order.len());
    for id in order {
        let mut row = by_id.remove(&id).unwrap();
        let (node_type_id, transition_id) = {
            let keys = row.get("keys").and_then(|v| v.as_object());
            (
                keys.and_then(|k| k.get("nodeType")).cloned(),
                keys.and_then(|k| k.get("transition")).cloned(),
            )
        };
        if let Some(obj) = row.as_object_mut() {
            obj.insert("node_type_id".into(), node_type_id.unwrap_or(Value::Null));
            obj.insert("transition_id".into(), transition_id.unwrap_or(Value::Null));
        }
        out.push(row);
    }
    Ok(out)
}

async fn list_all_grants(db: &sqlx::PgPool) -> Result<Vec<Value>, sqlx::Error> {
    list_grants_filtered(db, "", &[]).await
}

async fn list_grants_for_role(db: &sqlx::PgPool, role_id: &str) -> Result<Vec<Value>, sqlx::Error> {
    list_grants_filtered(db, "WHERE ap.role_id = $1", &[role_id]).await
}

async fn list_grants_for_role_and_scope(
    db: &sqlx::PgPool,
    role_id: &str,
    scope_code: &str,
) -> Result<Vec<Value>, sqlx::Error> {
    list_grants_filtered(
        db,
        "WHERE ap.role_id = $1 AND ap.scope_code = $2",
        &[role_id, scope_code],
    )
    .await
}

// ============================================================================
// Grant write — port of DynamicAuthorizationService addGrant / removeGrant.
// ============================================================================

/// Idempotent insert. Validates keys, computes the fingerprint, inserts the
/// policy + key rows (skipping if an identical row exists), and returns the row
/// id (existing or new). Does NOT publish — callers fire the event so legacy
/// "all-spaces" loops publish once.
async fn add_grant(
    state: &AppState,
    permission_code: &str,
    scope_code: &str,
    role_id: &str,
    project_space_id: &str,
    keys: &BTreeMap<String, String>,
) -> ApiResult<String> {
    validate(state, scope_code, keys)?;
    let fingerprint = compute_fingerprint(state, scope_code, keys);
    let db = &state.db;

    let existing = sqlx::query_as::<_, (String,)>(
        "SELECT id FROM authorization_policy \
         WHERE permission_code=$1 AND scope_code=$2 AND role_id=$3 \
           AND project_space_id=$4 AND keys_fingerprint=$5",
    )
    .bind(permission_code)
    .bind(scope_code)
    .bind(role_id)
    .bind(project_space_id)
    .bind(&fingerprint)
    .fetch_optional(db)
    .await?;
    if let Some((id,)) = existing {
        return Ok(id);
    }

    let id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO authorization_policy \
         (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint) \
         VALUES ($1,$2,$3,$4,$5,$6)",
    )
    .bind(&id)
    .bind(permission_code)
    .bind(scope_code)
    .bind(role_id)
    .bind(project_space_id)
    .bind(&fingerprint)
    .execute(db)
    .await?;
    for (k, v) in keys {
        sqlx::query(
            "INSERT INTO authorization_policy_key (policy_id, key_name, key_value) VALUES ($1,$2,$3)",
        )
        .bind(&id)
        .bind(k)
        .bind(v)
        .execute(db)
        .await?;
    }
    Ok(id)
}

/// Delete the grant identified by (perm, scope, role, ps, fingerprint). Returns
/// the number of rows removed (key rows cascade via FK). Does NOT publish.
async fn remove_grant(
    state: &AppState,
    permission_code: &str,
    scope_code: &str,
    role_id: &str,
    project_space_id: &str,
    keys: &BTreeMap<String, String>,
) -> ApiResult<u64> {
    validate(state, scope_code, keys)?;
    let fingerprint = compute_fingerprint(state, scope_code, keys);
    let n = sqlx::query(
        "DELETE FROM authorization_policy \
         WHERE permission_code=$1 AND scope_code=$2 AND role_id=$3 \
           AND project_space_id=$4 AND keys_fingerprint=$5",
    )
    .bind(permission_code)
    .bind(scope_code)
    .bind(role_id)
    .bind(project_space_id)
    .bind(&fingerprint)
    .execute(&state.db)
    .await?
    .rows_affected();
    Ok(n)
}

/// All project_space ids (`allProjectSpaceIds`).
async fn all_project_space_ids(db: &sqlx::PgPool) -> Result<Vec<String>, sqlx::Error> {
    Ok(sqlx::query_as::<_, (String,)>("SELECT id FROM project_space")
        .fetch_all(db)
        .await?
        .into_iter()
        .map(|(id,)| id)
        .collect())
}

/// `addGrantAllSpaces` — apply the same grant in every project space.
async fn add_grant_all_spaces(
    state: &AppState,
    permission_code: &str,
    scope_code: &str,
    role_id: &str,
    keys: &BTreeMap<String, String>,
) -> ApiResult<()> {
    for space in all_project_space_ids(&state.db).await? {
        add_grant(state, permission_code, scope_code, role_id, &space, keys).await?;
    }
    Ok(())
}

/// `removeGrantAllSpaces` — remove the grant from every project space.
async fn remove_grant_all_spaces(
    state: &AppState,
    permission_code: &str,
    scope_code: &str,
    role_id: &str,
    keys: &BTreeMap<String, String>,
) -> ApiResult<u64> {
    let mut total = 0;
    for space in all_project_space_ids(&state.db).await? {
        total += remove_grant(state, permission_code, scope_code, role_id, &space, keys).await?;
    }
    Ok(total)
}

/// `resolveScope` — scope of a permission code, defaulting to `NODE`.
async fn resolve_scope(db: &sqlx::PgPool, permission_code: &str) -> Result<String, sqlx::Error> {
    let row = sqlx::query_as::<_, (String,)>("SELECT scope FROM permission WHERE permission_code = $1")
        .bind(permission_code)
        .fetch_optional(db)
        .await?;
    Ok(row.map(|(s,)| s).unwrap_or_else(|| "NODE".to_string()))
}

// ============================================================================
// AuthorizationController — role grants.
// ============================================================================

/// `GET /roles/{roleId}/policies` — `getRolePolicies`.
async fn get_role_policies(
    State(state): State<AppState>,
    Path(role_id): Path<String>,
) -> ApiResult<Json<Vec<Value>>> {
    Ok(Json(list_grants_for_role(&state.db, &role_id).await?))
}

/// `GET /roles/{roleId}/global-permissions` — grants in the GLOBAL scope.
async fn get_role_global_permissions(
    State(state): State<AppState>,
    Path(role_id): Path<String>,
) -> ApiResult<Json<Vec<Value>>> {
    Ok(Json(
        list_grants_for_role_and_scope(&state.db, &role_id, "GLOBAL").await?,
    ))
}

/// `POST /roles/{roleId}/global-permissions` body: `{permissionCode | actionId}`.
#[derive(Debug, Default, Deserialize)]
struct GlobalPermBody {
    #[serde(default, rename = "permissionCode")]
    permission_code: Option<String>,
    #[serde(default, rename = "actionId")]
    action_id: Option<String>,
}

/// `POST /roles/{roleId}/global-permissions` — add a GLOBAL grant in every space.
async fn add_role_global_permission(
    State(state): State<AppState>,
    Path(role_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<GlobalPermBody>,
) -> ApiResult<impl IntoResponse> {
    let perm = body.permission_code.or(body.action_id).unwrap_or_default();
    if perm.trim().is_empty() {
        return Err(ApiError::BadRequest(
            "permissionCode required in request body".to_string(),
        ));
    }
    add_grant_all_spaces(&state, &perm, "GLOBAL", &role_id, &BTreeMap::new()).await?;
    events::authorization_changed(&state, "GRANT_ADDED", by_user(&ctx)).await;
    Ok(StatusCode::OK)
}

/// `DELETE /roles/{roleId}/global-permissions/{permissionCode}` → 204.
async fn remove_role_global_permission(
    State(state): State<AppState>,
    Path((role_id, permission_code)): Path<(String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
) -> ApiResult<impl IntoResponse> {
    remove_grant_all_spaces(&state, &permission_code, "GLOBAL", &role_id, &BTreeMap::new())
        .await?;
    events::authorization_changed(&state, "GRANT_REMOVED", by_user(&ctx)).await;
    Ok(StatusCode::NO_CONTENT)
}

/// `GET /roles/{roleId}/scope-permissions/{scopeCode}` — grants in any scope.
async fn get_role_scope_permissions(
    State(state): State<AppState>,
    Path((role_id, scope_code)): Path<(String, String)>,
) -> ApiResult<Json<Vec<Value>>> {
    Ok(Json(
        list_grants_for_role_and_scope(&state.db, &role_id, &scope_code).await?,
    ))
}

/// `POST /roles/{roleId}/scope-permissions/{scopeCode}` body: `{permissionCode}`.
#[derive(Debug, Default, Deserialize)]
struct ScopePermBody {
    #[serde(default, rename = "permissionCode")]
    permission_code: Option<String>,
}

/// `POST /roles/{roleId}/scope-permissions/{scopeCode}` — role-only grant in a
/// keyless scope (DATA, GLOBAL, ...). `validate` rejects scopes that need keys.
async fn add_role_scope_permission(
    State(state): State<AppState>,
    Path((role_id, scope_code)): Path<(String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<ScopePermBody>,
) -> ApiResult<impl IntoResponse> {
    let perm = body.permission_code.unwrap_or_default();
    if perm.trim().is_empty() {
        return Err(ApiError::BadRequest(
            "permissionCode required in request body".to_string(),
        ));
    }
    add_grant_all_spaces(&state, &perm, &scope_code, &role_id, &BTreeMap::new()).await?;
    events::authorization_changed(&state, "GRANT_ADDED", by_user(&ctx)).await;
    Ok(StatusCode::OK)
}

/// `DELETE /roles/{roleId}/scope-permissions/{scopeCode}/{permissionCode}` → 204.
async fn remove_role_scope_permission(
    State(state): State<AppState>,
    Path((role_id, scope_code, permission_code)): Path<(String, String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
) -> ApiResult<impl IntoResponse> {
    remove_grant_all_spaces(&state, &permission_code, &scope_code, &role_id, &BTreeMap::new())
        .await?;
    events::authorization_changed(&state, "GRANT_REMOVED", by_user(&ctx)).await;
    Ok(StatusCode::NO_CONTENT)
}

// ============================================================================
// AuthorizationController — node-type scoped grants (legacy facade).
// ============================================================================

#[derive(Debug, Default, Deserialize)]
struct NodeTypeQuery {
    #[serde(default, rename = "transitionId")]
    transition_id: Option<String>,
}

/// `GET /nodetypes/{nodeTypeId}/permissions/{permissionCode}?transitionId=` —
/// filters the full grant set by (permission_code, node_type_id, transition_id),
/// matching the legacy project-space-agnostic semantics.
async fn list_node_type_grants(
    State(state): State<AppState>,
    Path((node_type_id, permission_code)): Path<(String, String)>,
    Query(q): Query<NodeTypeQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    let all = list_all_grants(&state.db).await?;
    let transition_id = q.transition_id.filter(|t| !t.trim().is_empty());
    let filtered: Vec<Value> = all
        .into_iter()
        .filter(|row| {
            if row.get("permission_code").and_then(|v| v.as_str()) != Some(permission_code.as_str())
            {
                return false;
            }
            if row.get("node_type_id").and_then(|v| v.as_str()) != Some(node_type_id.as_str()) {
                return false;
            }
            let tx = row.get("transition_id").and_then(|v| v.as_str());
            match &transition_id {
                Some(t) => tx == Some(t.as_str()),
                None => tx.is_none(),
            }
        })
        .collect();
    Ok(Json(filtered))
}

/// `POST`/`DELETE` body for node-type grants: `{roleId, transitionId?}`.
#[derive(Debug, Default, Deserialize)]
struct NodeTypeGrantBody {
    #[serde(default, rename = "roleId")]
    role_id: Option<String>,
    #[serde(default, rename = "transitionId")]
    transition_id: Option<String>,
}

/// Build the key map for a node-type grant: always `nodeType`, plus `transition`
/// when a non-blank transition id is supplied.
fn node_type_keys(node_type_id: &str, transition_id: &Option<String>) -> BTreeMap<String, String> {
    let mut keys = BTreeMap::new();
    keys.insert("nodeType".to_string(), node_type_id.to_string());
    if let Some(t) = transition_id {
        if !t.trim().is_empty() {
            keys.insert("transition".to_string(), t.clone());
        }
    }
    keys
}

/// `POST /nodetypes/{nodeTypeId}/permissions/{permissionCode}` — add the grant
/// in every project space. Scope resolved from the permission row (default NODE).
async fn add_node_type_grant(
    State(state): State<AppState>,
    Path((node_type_id, permission_code)): Path<(String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<NodeTypeGrantBody>,
) -> ApiResult<impl IntoResponse> {
    let scope = resolve_scope(&state.db, &permission_code).await?;
    let keys = node_type_keys(&node_type_id, &body.transition_id);
    let role_id = body.role_id.unwrap_or_default();
    add_grant_all_spaces(&state, &permission_code, &scope, &role_id, &keys).await?;
    events::authorization_changed(&state, "GRANT_ADDED", by_user(&ctx)).await;
    Ok(StatusCode::OK)
}

/// `DELETE /nodetypes/{nodeTypeId}/permissions/{permissionCode}` → 204.
async fn remove_node_type_grant(
    State(state): State<AppState>,
    Path((node_type_id, permission_code)): Path<(String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<NodeTypeGrantBody>,
) -> ApiResult<impl IntoResponse> {
    let scope = resolve_scope(&state.db, &permission_code).await?;
    let keys = node_type_keys(&node_type_id, &body.transition_id);
    let role_id = body.role_id.unwrap_or_default();
    remove_grant_all_spaces(&state, &permission_code, &scope, &role_id, &keys).await?;
    events::authorization_changed(&state, "GRANT_REMOVED", by_user(&ctx)).await;
    Ok(StatusCode::NO_CONTENT)
}

// ============================================================================
// AccessRightsController — shape-agnostic grant CRUD + tree.
// ============================================================================

#[derive(Debug, Default, Deserialize)]
struct GrantsForRoleQuery {
    #[serde(default, rename = "scopeCode")]
    scope_code: Option<String>,
}

/// `GET /access-rights/roles/{roleId}/grants?scopeCode=` — all role grants, or
/// just one scope's when `scopeCode` is supplied.
async fn grants_for_role(
    State(state): State<AppState>,
    Path(role_id): Path<String>,
    Query(q): Query<GrantsForRoleQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    match q.scope_code.filter(|s| !s.trim().is_empty()) {
        Some(scope) => Ok(Json(
            list_grants_for_role_and_scope(&state.db, &role_id, &scope).await?,
        )),
        None => Ok(Json(list_grants_for_role(&state.db, &role_id).await?)),
    }
}

/// `POST`/`DELETE /access-rights/grants` body (record `GrantRequest`).
#[derive(Debug, Default, Deserialize)]
struct GrantRequest {
    #[serde(default, rename = "permissionCode")]
    permission_code: Option<String>,
    #[serde(default, rename = "scopeCode")]
    scope_code: Option<String>,
    #[serde(default, rename = "roleId")]
    role_id: Option<String>,
    #[serde(default, rename = "projectSpaceId")]
    project_space_id: Option<String>,
    #[serde(default)]
    keys: Option<BTreeMap<String, String>>,
}

/// `POST /access-rights/grants` — single-space dynamic grant. Validates keys
/// against the scope's effective key set, returns `{id}`.
async fn add_grant_endpoint(
    State(state): State<AppState>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(req): Json<GrantRequest>,
) -> ApiResult<Json<Value>> {
    let keys = req.keys.unwrap_or_default();
    let id = add_grant(
        &state,
        &req.permission_code.unwrap_or_default(),
        &req.scope_code.unwrap_or_default(),
        &req.role_id.unwrap_or_default(),
        &req.project_space_id.unwrap_or_default(),
        &keys,
    )
    .await?;
    events::authorization_changed(&state, "GRANT_ADDED", by_user(&ctx)).await;
    Ok(Json(json!({ "id": id })))
}

/// `DELETE /access-rights/grants` — single-space removal, returns `{removed}`.
async fn remove_grant_endpoint(
    State(state): State<AppState>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(req): Json<GrantRequest>,
) -> ApiResult<Json<Value>> {
    let keys = req.keys.unwrap_or_default();
    let n = remove_grant(
        &state,
        &req.permission_code.unwrap_or_default(),
        &req.scope_code.unwrap_or_default(),
        &req.role_id.unwrap_or_default(),
        &req.project_space_id.unwrap_or_default(),
        &keys,
    )
    .await?;
    events::authorization_changed(&state, "GRANT_REMOVED", by_user(&ctx)).await;
    Ok(Json(json!({ "removed": n })))
}

#[derive(Debug, Default, Deserialize)]
struct TreeQuery {
    #[serde(default, rename = "projectSpaceId")]
    project_space_id: Option<String>,
}

/// `GET /access-rights/tree?projectSpaceId=` — the aggregated access-rights
/// model the frontend renders: `{version, permissions, scopes}`. Per scope:
/// `{code, parent, description, keys:[...]}` where each key is either inherited
/// (`{name, inheritedFrom}`) or own (`{name, description, values | valuesByParent}`).
///
/// Value lists are pulled from each contributing service's
/// `/internal/<endpointPath>` (per `permission_scope_value_source`). A failed or
/// absent source contributes an empty list (best-effort, like the Java).
async fn access_rights_tree(
    State(state): State<AppState>,
    Query(q): Query<TreeQuery>,
) -> ApiResult<Json<Value>> {
    let _ = q.project_space_id; // accepted for compat; not used in tree build.
    let mut root = Map::new();
    root.insert("version".into(), json!(state.version()));
    root.insert("permissions".into(), json!(fetch_all_permissions(&state.db).await?));

    // Iterate the in-memory registry, ordered by code for stable output (the
    // Java map snapshot order is unspecified).
    let mut all_scopes = state.scopes.snapshot();
    all_scopes.sort_by(|a, b| a.code.cmp(&b.code));

    let mut scope_out: Vec<Value> = Vec::new();
    for rec in all_scopes {
        let mut sm = Map::new();
        sm.insert("code".into(), json!(rec.code));
        sm.insert("parent".into(), json!(rec.parent));
        sm.insert("description".into(), json!(scope_description(&state.db, &rec.code).await?));

        let own = own_keys(&state.db, &rec.code).await?;
        let parent_keys: Vec<String> = match &rec.parent {
            Some(p) => state.scopes.effective_keys(p),
            None => Vec::new(),
        };

        let mut key_out: Vec<Value> = Vec::new();
        // Inherited (parent) keys first.
        for pk_name in &parent_keys {
            key_out.push(json!({
                "name": pk_name,
                "inheritedFrom": rec.parent,
            }));
        }
        // Own keys, with value lists.
        for (ok_name, ok_desc) in &own {
            let mut km = Map::new();
            km.insert("name".into(), json!(ok_name));
            km.insert("description".into(), json!(ok_desc));
            if parent_keys.is_empty() {
                let vals = fetch_flat_values(&state, &rec.code, ok_name).await;
                km.insert("values".into(), json!(vals));
            } else {
                let by_parent =
                    fetch_values_by_parent(&state, &rec.code, ok_name, &rec.parent, &parent_keys)
                        .await?;
                km.insert("valuesByParent".into(), json!(by_parent));
            }
            key_out.push(Value::Object(km));
        }
        sm.insert("keys".into(), json!(key_out));
        scope_out.push(Value::Object(sm));
    }
    root.insert("scopes".into(), json!(scope_out));
    Ok(Json(Value::Object(root)))
}

/// One `{id, label}` value (port of the `KeyValue` DTO).
fn key_value(id: &str, label: &str) -> Value {
    json!({ "id": id, "label": label })
}

/// Value sources for (scope, key): `(serviceCode, endpointPath)` pairs.
async fn sources_for(
    db: &sqlx::PgPool,
    scope_code: &str,
    key_name: &str,
) -> Result<Vec<(String, String)>, sqlx::Error> {
    Ok(sqlx::query_as::<_, (String, String)>(
        "SELECT service_code, endpoint_path FROM permission_scope_value_source \
         WHERE scope_code = $1 AND key_name = $2 ORDER BY service_code",
    )
    .bind(scope_code)
    .bind(key_name)
    .fetch_all(db)
    .await?)
}

/// Call one value source (best-effort) and map its `[{id,label}]` reply into our
/// `KeyValue` shape. `parent_query` is a raw `key=value` clause (or empty).
/// Failures yield an empty list (logged at warn), matching the Java.
async fn call_value_source(
    state: &AppState,
    service_code: &str,
    endpoint_path: &str,
    parent_query: &str,
) -> Vec<Value> {
    let base_path = format!("/internal{endpoint_path}");
    let path = if parent_query.is_empty() {
        base_path
    } else {
        // RestTemplate raw substitution → the server decodes "key=value".
        // ServiceClient takes a bare path; pass the parent query already
        // URL-encoded so intermediaries don't mangle the '='.
        let encoded = urlencode(parent_query);
        format!("{base_path}?parent={encoded}")
    };
    match state
        .client
        .get_json::<Vec<Map<String, Value>>>(service_code, &path)
        .await
    {
        Ok(raw) => raw
            .into_iter()
            .map(|m| {
                let id = json_to_string(m.get("id"));
                let label = json_to_string(m.get("label"));
                key_value(&id, &label)
            })
            .collect(),
        Err(e) => {
            tracing::warn!("Value source fetch failed: service={service_code} path={path} — {e}");
            Vec::new()
        }
    }
}

/// `fetchFlatValues` — union of every source's values for (scope, key).
async fn fetch_flat_values(state: &AppState, scope_code: &str, key_name: &str) -> Vec<Value> {
    let sources = match sources_for(&state.db, scope_code, key_name).await {
        Ok(s) => s,
        Err(e) => {
            tracing::warn!("value sources lookup failed for {scope_code}/{key_name}: {e}");
            return Vec::new();
        }
    };
    let mut merged = Vec::new();
    for (svc, path) in sources {
        merged.extend(call_value_source(state, &svc, &path, "").await);
    }
    merged
}

/// `fetchValuesByParent` — single-level parent only (LIFECYCLE → NODE today).
/// Returns `{parentValueId: [KeyValue,...]}`.
async fn fetch_values_by_parent(
    state: &AppState,
    scope_code: &str,
    key_name: &str,
    parent_scope_code: &Option<String>,
    parent_keys: &[String],
) -> ApiResult<Map<String, Value>> {
    let mut out = Map::new();
    if parent_keys.len() != 1 {
        return Ok(out);
    }
    let parent_key_name = &parent_keys[0];
    let parent_scope = match parent_scope_code {
        Some(p) => p.clone(),
        None => return Ok(out),
    };
    // Confirm the parent scope exists.
    if state.scopes.get(&parent_scope).is_none() {
        return Ok(out);
    }
    let parent_values = fetch_flat_values(state, &parent_scope, parent_key_name).await;
    for pv in parent_values {
        let pv_id = pv.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let parent_param = format!("{parent_key_name}={pv_id}");
        let sources = sources_for(&state.db, scope_code, key_name).await?;
        let mut sub = Vec::new();
        for (svc, path) in sources {
            sub.extend(call_value_source(state, &svc, &path, &parent_param).await);
        }
        out.insert(pv_id, json!(sub));
    }
    Ok(out)
}

// ============================================================================
// InternalAuthorizationController — S2S snapshot + version.
// ============================================================================

/// `GET /internal/authorization/snapshot` — full authorization model:
/// `{snapshotApiVersion, version, permissions, scopes, policies}`. Field-for-
/// field match with the Java controller. Scope `keys` is the effective key
/// *name* list (own + inherited).
async fn snapshot(State(state): State<AppState>) -> ApiResult<Json<Value>> {
    let policies = list_all_grants(&state.db).await?;
    let permissions = fetch_all_permissions(&state.db).await?;

    // Ordered by code for stable output (the Java map snapshot is unordered).
    let mut all_scopes = state.scopes.snapshot();
    all_scopes.sort_by(|a, b| a.code.cmp(&b.code));
    let mut scopes: Vec<Value> = Vec::new();
    for rec in all_scopes {
        let keys = state.scopes.effective_keys(&rec.code);
        scopes.push(json!({
            "code": rec.code,
            "parent": rec.parent,
            "ownerService": rec.owner_service,
            "definitionHash": rec.definition_hash,
            "keys": keys,
        }));
    }

    Ok(Json(json!({
        "snapshotApiVersion": 2,
        "version": state.version(),
        "permissions": permissions,
        "scopes": scopes,
        "policies": policies,
    })))
}

/// `GET /internal/authorization/version` — lightweight `{version}` probe.
async fn version(State(state): State<AppState>) -> Json<Value> {
    Json(json!({ "version": state.version() }))
}

// ============================================================================
// Small helpers.
// ============================================================================

/// `String.valueOf(map.get(x))` semantics: present JSON value → its string form
/// (strings unquoted, others stringified), absent → "null".
fn json_to_string(v: Option<&Value>) -> String {
    match v {
        None | Some(Value::Null) => "null".to_string(),
        Some(Value::String(s)) => s.clone(),
        Some(other) => other.to_string(),
    }
}

/// Minimal percent-encoding for a `key=value` query parameter value.
fn urlencode(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char)
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}
