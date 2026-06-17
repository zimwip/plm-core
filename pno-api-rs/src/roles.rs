//! Role CRUD. Faithful port of the Java `RoleController` + `RoleService`.
//!
//! Bare paths (the spe-api gateway strips `/api/pno`):
//!   * `GET    /roles`           — list, ordered by name → `[{id,name,description}]`
//!   * `POST   /roles`           — `{name,description}` → `{id,name,description}`
//!   * `PUT    /roles/{roleId}`  — `{name,description}` → `{status:"updated"}` (404 if missing)
//!   * `DELETE /roles/{roleId}`  — cascade-delete `user_role` rows first, then role → 204
//!
//! Every mutation bumps the authorization version and publishes a `PNO_CHANGED`
//! event (`entity = "ROLE"`, action `CREATED|UPDATED|DELETED`) via
//! `crate::events::pno_changed`. The acting user is taken from the
//! `PnoUserContext` request extension when present, else `None` (the Java
//! `currentUserId()` falls back to `"unknown"`, which `pno_changed` also does).

use crate::auth::PnoUserContext;
use crate::error::{ApiError, ApiResult};
use crate::events;
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::get;
use axum::{Extension, Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct RoleDto {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
}

/// `{name, description}` body. Both optional, mirroring the Java `Map.get(...)`
/// reads (which yield `null` when absent).
#[derive(Debug, Default, Deserialize)]
pub struct RoleBody {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/roles", get(list_roles).post(create_role))
        .route(
            "/roles/:role_id",
            axum::routing::put(update_role).delete(delete_role),
        )
}

/// `currentUserId()`: prefer the authenticated principal, else `None`.
fn by_user(ctx: &Option<Extension<PnoUserContext>>) -> Option<&str> {
    ctx.as_ref().map(|e| e.user_id.as_str())
}

/// `GET /roles` — list ordered by name.
async fn list_roles(State(state): State<AppState>) -> ApiResult<Json<Vec<RoleDto>>> {
    let rows = sqlx::query_as::<_, (String, Option<String>, Option<String>)>(
        "SELECT id, name, description FROM pno_role ORDER BY name",
    )
    .fetch_all(&state.db)
    .await?;

    let roles = rows
        .into_iter()
        .map(|(id, name, description)| RoleDto {
            id,
            name,
            description,
        })
        .collect();
    Ok(Json(roles))
}

/// `POST /roles` — create with a `role-<8 hex>` id, then publish `CREATED`.
async fn create_role(
    State(state): State<AppState>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<RoleBody>,
) -> ApiResult<Json<RoleDto>> {
    let id = format!("role-{}", &Uuid::new_v4().simple().to_string()[..8]);

    sqlx::query("INSERT INTO pno_role (id, name, description) VALUES ($1, $2, $3)")
        .bind(&id)
        .bind(&body.name)
        .bind(&body.description)
        .execute(&state.db)
        .await?;

    events::pno_changed(&state, "ROLE", "CREATED", "roleId", &id, by_user(&ctx)).await;

    // The Java response body coerces a null description to "".
    Ok(Json(RoleDto {
        id,
        name: body.name,
        description: Some(body.description.unwrap_or_default()),
    }))
}

/// `PUT /roles/{roleId}` — update name+description; 404 when no row matched.
async fn update_role(
    State(state): State<AppState>,
    Path(role_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<RoleBody>,
) -> ApiResult<Json<Value>> {
    let updated = sqlx::query("UPDATE pno_role SET name = $1, description = $2 WHERE id = $3")
        .bind(&body.name)
        .bind(&body.description)
        .bind(&role_id)
        .execute(&state.db)
        .await?
        .rows_affected();

    if updated == 0 {
        return Err(ApiError::NotFound(format!("Role not found: {role_id}")));
    }

    events::pno_changed(&state, "ROLE", "UPDATED", "roleId", &role_id, by_user(&ctx)).await;
    Ok(Json(json!({ "status": "updated" })))
}

/// `DELETE /roles/{roleId}` — remove `user_role` assignments first, then the
/// role itself (404 when absent), then publish `DELETED`. Returns 204.
async fn delete_role(
    State(state): State<AppState>,
    Path(role_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
) -> ApiResult<impl IntoResponse> {
    sqlx::query("DELETE FROM user_role WHERE role_id = $1")
        .bind(&role_id)
        .execute(&state.db)
        .await?;

    let deleted = sqlx::query("DELETE FROM pno_role WHERE id = $1")
        .bind(&role_id)
        .execute(&state.db)
        .await?
        .rows_affected();

    if deleted == 0 {
        return Err(ApiError::NotFound(format!("Role not found: {role_id}")));
    }

    events::pno_changed(&state, "ROLE", "DELETED", "roleId", &role_id, by_user(&ctx)).await;
    Ok(StatusCode::NO_CONTENT)
}
