//! Users: identity CRUD, role assignment, admin flag, default project space,
//! and the high-traffic S2S `/users/{id}/context` endpoint. Faithful port of
//! the Java `UserController` + `UserService`.
//!
//! All paths are bare (the spe-api gateway strips `/api/pno`). `active`/`is_admin`
//! are stored as SMALLINT (1/0) and projected to JSON booleans, matching the
//! Java `Integer.valueOf(1).equals(...)` checks.

use crate::auth::PnoUserContext;
use crate::error::{ApiError, ApiResult};
use crate::events;
use crate::state::AppState;
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::{get, post, put};
use axum::{Extension, Json, Router};
use serde::Deserialize;
use serde_json::{json, Value};
use uuid::Uuid;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/users", get(list_users).post(create_user))
        .route(
            "/users/:user_id",
            get(get_user).put(update_user).delete(deactivate_user),
        )
        .route(
            "/users/:user_id/roles/:role_id",
            post(assign_role).delete(remove_role),
        )
        .route("/users/:user_id/roles", get(get_user_roles))
        .route("/users/:user_id/admin", put(set_admin))
        .route("/users/:user_id/default-space", put(set_default_space))
        .route("/users/:user_id/context", get(get_user_context))
}

// ── helpers ────────────────────────────────────────────────────────────────

/// Acting user id, mirroring the Java `currentUserId()` (falls back to
/// "unknown"). Returned as an owned String so it can feed the events helper.
fn acting_user(ctx: &Option<Extension<PnoUserContext>>) -> Option<String> {
    ctx.as_ref().map(|c| c.user_id.clone())
}

/// SMALLINT (nullable) -> JSON bool, replicating `Integer.valueOf(1).equals(x)`.
fn smallint_bool(v: Option<i16>) -> bool {
    v == Some(1)
}

/// Shape a `pno_user` row into the public user map (insertion-ordered fields
/// matching the Java `LinkedHashMap`).
fn user_json(
    id: &str,
    username: Option<String>,
    display_name: Option<String>,
    email: Option<String>,
    active: Option<i16>,
    is_admin: Option<i16>,
) -> Value {
    json!({
        "id": id,
        "username": username,
        "displayName": display_name,
        "email": email,
        "active": smallint_bool(active),
        "isAdmin": smallint_bool(is_admin),
    })
}

// ── GET /users ───────────────────────────────────────────────────────────--

async fn list_users(State(state): State<AppState>) -> ApiResult<Json<Value>> {
    let rows = sqlx::query_as::<_, (String, Option<String>, Option<String>, Option<String>, Option<i16>, Option<i16>)>(
        "SELECT id, username, display_name, email, active, is_admin FROM pno_user ORDER BY username",
    )
    .fetch_all(&state.db)
    .await?;

    let users: Vec<Value> = rows
        .into_iter()
        .map(|(id, username, dn, email, active, is_admin)| {
            user_json(&id, username, dn, email, active, is_admin)
        })
        .collect();
    Ok(Json(Value::Array(users)))
}

// ── GET /users/{userId} ──────────────────────────────────────────────────--

async fn get_user(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
) -> ApiResult<Json<Value>> {
    let row = sqlx::query_as::<_, (String, Option<String>, Option<String>, Option<String>, Option<i16>, Option<i16>)>(
        "SELECT id, username, display_name, email, active, is_admin FROM pno_user WHERE id = $1",
    )
    .bind(&user_id)
    .fetch_optional(&state.db)
    .await?;

    match row {
        Some((id, username, dn, email, active, is_admin)) => {
            Ok(Json(user_json(&id, username, dn, email, active, is_admin)))
        }
        None => Err(ApiError::NotFound("not found".into())),
    }
}

// ── PUT /users/{userId} ──────────────────────────────────────────────────--

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateUserBody {
    #[serde(default)]
    display_name: Option<String>,
    #[serde(default)]
    email: Option<String>,
}

async fn update_user(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<UpdateUserBody>,
) -> ApiResult<Json<Value>> {
    let updated = sqlx::query(
        "UPDATE pno_user SET display_name = $1, email = $2 WHERE id = $3 AND active = 1",
    )
    .bind(&body.display_name)
    .bind(&body.email)
    .bind(&user_id)
    .execute(&state.db)
    .await?
    .rows_affected();
    if updated == 0 {
        return Err(ApiError::BadRequest(format!("User not found: {user_id}")));
    }

    let by = acting_user(&ctx);
    events::pno_changed(&state, "USER", "UPDATED", "userId", &user_id, by.as_deref()).await;
    Ok(Json(json!({ "status": "updated" })))
}

// ── POST /users ──────────────────────────────────────────────────────────--

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateUserBody {
    #[serde(default)]
    username: Option<String>,
    #[serde(default)]
    display_name: Option<String>,
    #[serde(default)]
    email: Option<String>,
}

async fn create_user(
    State(state): State<AppState>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<CreateUserBody>,
) -> ApiResult<Json<Value>> {
    let id = format!("user-{}", &Uuid::new_v4().to_string()[..8]);
    sqlx::query(
        "INSERT INTO pno_user (id, username, display_name, email, active) VALUES ($1, $2, $3, $4, 1)",
    )
    .bind(&id)
    .bind(&body.username)
    .bind(&body.display_name)
    .bind(&body.email)
    .execute(&state.db)
    .await?;

    let by = acting_user(&ctx);
    events::pno_changed(&state, "USER", "CREATED", "userId", &id, by.as_deref()).await;

    Ok(Json(json!({
        "id": id,
        "username": body.username,
        "displayName": body.display_name,
        "email": body.email,
        "active": true,
    })))
}

// ── DELETE /users/{userId} ─────────────────────────────────────────────────

async fn deactivate_user(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
) -> ApiResult<impl IntoResponse> {
    let updated = sqlx::query("UPDATE pno_user SET active = 0 WHERE id = $1")
        .bind(&user_id)
        .execute(&state.db)
        .await?
        .rows_affected();
    if updated == 0 {
        return Err(ApiError::BadRequest(format!("User not found: {user_id}")));
    }

    let by = acting_user(&ctx);
    events::pno_changed(&state, "USER", "DEACTIVATED", "userId", &user_id, by.as_deref()).await;
    Ok(StatusCode::NO_CONTENT)
}

// ── role assignment ──────────────────────────────────────────────────────--

#[derive(Deserialize)]
struct ProjectSpaceRequired {
    #[serde(rename = "projectSpaceId")]
    project_space_id: String,
}

async fn assign_role(
    State(state): State<AppState>,
    Path((user_id, role_id)): Path<(String, String)>,
    Query(q): Query<ProjectSpaceRequired>,
    ctx: Option<Extension<PnoUserContext>>,
) -> ApiResult<Json<Value>> {
    let id = format!("ur-{}", &Uuid::new_v4().to_string()[..8]);
    sqlx::query(
        "INSERT INTO user_role (id, user_id, role_id, project_space_id) VALUES ($1, $2, $3, $4)",
    )
    .bind(&id)
    .bind(&user_id)
    .bind(&role_id)
    .bind(&q.project_space_id)
    .execute(&state.db)
    .await?;

    let by = acting_user(&ctx);
    events::pno_changed(&state, "USER", "ROLE_ASSIGNED", "userId", &user_id, by.as_deref()).await;
    Ok(Json(json!({ "status": "assigned" })))
}

async fn remove_role(
    State(state): State<AppState>,
    Path((user_id, role_id)): Path<(String, String)>,
    Query(q): Query<ProjectSpaceRequired>,
    ctx: Option<Extension<PnoUserContext>>,
) -> ApiResult<impl IntoResponse> {
    sqlx::query("DELETE FROM user_role WHERE user_id = $1 AND role_id = $2 AND project_space_id = $3")
        .bind(&user_id)
        .bind(&role_id)
        .bind(&q.project_space_id)
        .execute(&state.db)
        .await?;

    let by = acting_user(&ctx);
    events::pno_changed(&state, "USER", "ROLE_REMOVED", "userId", &user_id, by.as_deref()).await;
    Ok(StatusCode::NO_CONTENT)
}

// ── GET /users/{userId}/roles ──────────────────────────────────────────────

#[derive(Deserialize)]
struct ProjectSpaceOptional {
    #[serde(default, rename = "projectSpaceId")]
    project_space_id: Option<String>,
}

fn is_blank(s: &Option<String>) -> bool {
    s.as_ref().map(|v| v.trim().is_empty()).unwrap_or(true)
}

async fn get_user_roles(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    Query(q): Query<ProjectSpaceOptional>,
) -> ApiResult<Json<Value>> {
    let base = "SELECT r.id AS role_id, r.name AS role_name, \
                ps.id AS project_space_id, ps.name AS project_space_name \
                FROM user_role ur \
                JOIN pno_role r ON ur.role_id = r.id \
                JOIN project_space ps ON ur.project_space_id = ps.id \
                WHERE ur.user_id = $1";

    let rows: Vec<(Option<String>, Option<String>, Option<String>, Option<String>)> =
        if is_blank(&q.project_space_id) {
            sqlx::query_as(base).bind(&user_id).fetch_all(&state.db).await?
        } else {
            let sql = format!("{base} AND ur.project_space_id = $2");
            sqlx::query_as(&sql)
                .bind(&user_id)
                .bind(q.project_space_id.as_ref().unwrap())
                .fetch_all(&state.db)
                .await?
        };

    let out: Vec<Value> = rows
        .into_iter()
        .map(|(rid, rname, psid, psname)| {
            json!({
                "id": rid,
                "name": rname,
                "projectSpaceId": psid,
                "projectSpaceName": psname,
            })
        })
        .collect();
    Ok(Json(Value::Array(out)))
}

// ── PUT /users/{userId}/admin ──────────────────────────────────────────────

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetAdminBody {
    #[serde(default)]
    is_admin: Option<bool>,
}

async fn set_admin(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<SetAdminBody>,
) -> ApiResult<Json<Value>> {
    let admin = match body.is_admin {
        Some(b) => b,
        None => return Err(ApiError::BadRequest("isAdmin required".into())),
    };

    if !admin {
        // Guard: at least one other active admin must remain.
        let others: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM pno_user WHERE active = 1 AND is_admin = 1 AND id != $1",
        )
        .bind(&user_id)
        .fetch_one(&state.db)
        .await?;
        if others == 0 {
            // Java throws IllegalStateException → GlobalExceptionHandler maps to 400.
            return Err(ApiError::BadRequest(
                "Cannot remove the last admin — at least one active admin must remain.".into(),
            ));
        }
    }

    let updated = sqlx::query("UPDATE pno_user SET is_admin = $1 WHERE id = $2")
        .bind(if admin { 1i16 } else { 0i16 })
        .bind(&user_id)
        .execute(&state.db)
        .await?
        .rows_affected();
    if updated == 0 {
        return Err(ApiError::BadRequest(format!("User not found: {user_id}")));
    }

    let by = acting_user(&ctx);
    events::pno_changed(&state, "USER", "ADMIN_CHANGED", "userId", &user_id, by.as_deref()).await;
    Ok(Json(json!({ "status": "updated" })))
}

// ── PUT /users/{userId}/default-space ──────────────────────────────────────

#[derive(Deserialize)]
struct DefaultSpaceBody {
    #[serde(default, rename = "projectSpaceId")]
    project_space_id: Option<String>,
}

async fn set_default_space(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<DefaultSpaceBody>,
) -> ApiResult<Json<Value>> {
    // Admin-only (403 otherwise), replicating the controller guard.
    let is_admin = ctx.as_ref().map(|c| c.is_admin).unwrap_or(false);
    if !is_admin {
        return Err(ApiError::Forbidden(
            "Default project space can only be set by an admin".into(),
        ));
    }

    if is_blank(&body.project_space_id) {
        return Err(ApiError::BadRequest("projectSpaceId required".into()));
    }
    let project_space_id = body.project_space_id.unwrap();

    // Validate the project space exists; 400 otherwise (IllegalArgumentException).
    let exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM project_space WHERE id = $1")
        .bind(&project_space_id)
        .fetch_one(&state.db)
        .await?;
    if exists == 0 {
        return Err(ApiError::BadRequest(format!(
            "Project space not found: {project_space_id}"
        )));
    }

    let updated = sqlx::query("UPDATE pno_user SET default_project_space_id = $1 WHERE id = $2")
        .bind(&project_space_id)
        .bind(&user_id)
        .execute(&state.db)
        .await?
        .rows_affected();
    if updated == 0 {
        return Err(ApiError::BadRequest(format!("User not found: {user_id}")));
    }

    let by = acting_user(&ctx);
    events::pno_changed(
        &state,
        "USER",
        "DEFAULT_SPACE_CHANGED",
        "userId",
        &user_id,
        by.as_deref(),
    )
    .await;
    Ok(Json(json!({ "defaultProjectSpaceId": project_space_id })))
}

// ── GET /users/{userId}/context (S2S — secret path) ────────────────────────--

async fn get_user_context(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    Query(q): Query<ProjectSpaceOptional>,
) -> ApiResult<Json<Value>> {
    // Active user only (matches `active = 1` in the Java fetch).
    let user = sqlx::query_as::<_, (Option<String>, Option<i16>, Option<String>)>(
        "SELECT username, is_admin, default_project_space_id FROM pno_user WHERE id = $1 AND active = 1",
    )
    .bind(&user_id)
    .fetch_optional(&state.db)
    .await?;

    let (username, is_admin_i, default_ps) = match user {
        Some(t) => t,
        None => return Err(ApiError::NotFound("not found".into())),
    };
    let is_admin = smallint_bool(is_admin_i);

    // Role ids the user holds, scoped to projectSpaceId if given (else union).
    let role_ids: Vec<String> = if is_blank(&q.project_space_id) {
        sqlx::query_scalar("SELECT ur.role_id FROM user_role ur WHERE ur.user_id = $1")
            .bind(&user_id)
            .fetch_all(&state.db)
            .await?
    } else {
        sqlx::query_scalar(
            "SELECT ur.role_id FROM user_role ur WHERE ur.user_id = $1 AND ur.project_space_id = $2",
        )
        .bind(&user_id)
        .bind(q.project_space_id.as_ref().unwrap())
        .fetch_all(&state.db)
        .await?
    };

    let allowed_service_codes =
        resolve_allowed_service_codes(&state, &role_ids, is_admin, &q.project_space_id).await?;

    let global_permissions =
        list_permission_codes_for_roles(&state, &role_ids, is_admin).await?;

    Ok(Json(json!({
        "userId": user_id,
        "username": username,
        "isAdmin": is_admin,
        "roleIds": role_ids,
        "allowedServiceCodes": allowed_service_codes,
        "defaultProjectSpaceId": default_ps,
        "globalPermissions": global_permissions,
    })))
}

/// Port of `UserService.resolveAllowedServiceCodes`: SERVICE-scope grants
/// carrying a `service_code` key for the user's roles. Admin or no roles → empty.
async fn resolve_allowed_service_codes(
    state: &AppState,
    role_ids: &[String],
    is_admin: bool,
    project_space_id: &Option<String>,
) -> ApiResult<Vec<String>> {
    if is_admin || role_ids.is_empty() {
        return Ok(Vec::new());
    }
    let placeholders = bind_placeholders(role_ids.len(), 1);
    let base = format!(
        "SELECT DISTINCT apk.key_value FROM authorization_policy ap \
         JOIN authorization_policy_key apk ON apk.policy_id = ap.id \
         WHERE ap.permission_code = 'SERVICE_ACCESS' \
         AND ap.scope_code = 'SERVICE' \
         AND apk.key_name = 'service_code' \
         AND ap.role_id IN ({placeholders})"
    );

    let codes: Vec<Option<String>> = if is_blank(project_space_id) {
        let mut query = sqlx::query_scalar(&base);
        for r in role_ids {
            query = query.bind(r);
        }
        query.fetch_all(&state.db).await?
    } else {
        let ps_idx = role_ids.len() + 1;
        let sql = format!("{base} AND ap.project_space_id = ${ps_idx}");
        let mut query = sqlx::query_scalar(&sql);
        for r in role_ids {
            query = query.bind(r);
        }
        query = query.bind(project_space_id.as_ref().unwrap());
        query.fetch_all(&state.db).await?
    };
    Ok(codes.into_iter().flatten().collect())
}

/// Port of `AuthorizationService.listPermissionCodesForRoles`:
///   * admin → all GLOBAL-scope permission codes from the `permission` catalog;
///   * otherwise → DISTINCT GLOBAL-scope grant permission codes for the roles.
async fn list_permission_codes_for_roles(
    state: &AppState,
    role_ids: &[String],
    is_admin: bool,
) -> ApiResult<Vec<String>> {
    if is_admin {
        let codes: Vec<String> = sqlx::query_scalar(
            "SELECT permission_code FROM permission WHERE scope = 'GLOBAL' ORDER BY permission_code",
        )
        .fetch_all(&state.db)
        .await?;
        return Ok(codes);
    }
    if role_ids.is_empty() {
        return Ok(Vec::new());
    }
    let placeholders = bind_placeholders(role_ids.len(), 1);
    let sql = format!(
        "SELECT DISTINCT permission_code FROM authorization_policy \
         WHERE scope_code = 'GLOBAL' AND role_id IN ({placeholders}) ORDER BY permission_code"
    );
    let mut query = sqlx::query_scalar(&sql);
    for r in role_ids {
        query = query.bind(r);
    }
    Ok(query.fetch_all(&state.db).await?)
}

/// Build a `$start,$start+1,...` placeholder list for `count` bound params.
fn bind_placeholders(count: usize, start: usize) -> String {
    (start..start + count)
        .map(|i| format!("${i}"))
        .collect::<Vec<_>>()
        .join(",")
}
