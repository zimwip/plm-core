//! Project spaces — identity/organization hierarchy + per-space service routing
//! tags. Faithful port of Java `ProjectSpaceController` + `ProjectSpaceService`.
//!
//! Routes are mounted at BARE paths (the spe-api gateway strips `/api/pno`):
//!   GET    /project-spaces?userId=                       list (admin = all)
//!   POST   /project-spaces                               create
//!   GET    /project-spaces/{id}/descendants              BFS descendant ids
//!   DELETE /project-spaces/{id}                          soft-deactivate
//!   GET    /project-spaces/{id}/service-tags             { code: [tags] }
//!   GET    /project-spaces/{id}/effective-service-tags   inherited (S2S secret)
//!   PUT    /project-spaces/{id}/service-tags/{code}      replace tags
//!   PUT    /project-spaces/{id}/isolated                 set isolated flag
//!
//! `active`/`isolated`/`is_admin` are SMALLINT (1/0) in the schema; we compare
//! against 1 exactly, matching the Java `Integer.valueOf(1).equals(...)`.
//! Service-tag maps are keyed by service code and the SQL already orders by
//! code, so the on-the-wire key order is stable for consumers reading by key.

use crate::auth::PnoUserContext;
use crate::error::{ApiError, ApiResult};
use crate::events;
use crate::state::AppState;
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::{delete, get, put};
use axum::{Extension, Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};
use std::collections::{HashSet, VecDeque};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/project-spaces", get(list).post(create))
        .route("/project-spaces/:id", delete(deactivate))
        .route("/project-spaces/:id/descendants", get(descendants))
        .route("/project-spaces/:id/service-tags", get(service_tags))
        .route(
            "/project-spaces/:id/effective-service-tags",
            get(effective_service_tags),
        )
        .route(
            "/project-spaces/:id/service-tags/:service_code",
            put(set_service_tags),
        )
        .route("/project-spaces/:id/isolated", put(set_isolated))
}

/// `currentUserId()` from the controller: the bound principal, or `"unknown"`.
fn current_user(ctx: Option<&PnoUserContext>) -> &str {
    ctx.map(|c| c.user_id.as_str()).unwrap_or("unknown")
}

fn flag(v: Option<i16>) -> bool {
    v == Some(1)
}

// ── project_space row → JSON (port of `ProjectSpaceService.toMap`) ──────────

/// Raw row as fetched from `project_space`. SMALLINT flags arrive as `i16`.
type SpaceTuple = (
    String,                          // id
    String,                          // name
    Option<String>,                  // description
    Option<String>,                  // parent_id
    Option<chrono::NaiveDateTime>,   // created_at
    Option<i16>,                     // active
    Option<i16>,                     // isolated
);

/// Wire shape matching the Java `toMap` keys/order. `createdAt` is rendered as
/// an ISO-8601 string (closest faithful render of the raw JOOQ timestamp).
/// NOTE: the `id` field is load-bearing — spe reads it on the S2S list call.
#[derive(Serialize)]
struct SpaceView {
    id: String,
    name: String,
    description: Option<String>,
    #[serde(rename = "parentId")]
    parent_id: Option<String>,
    #[serde(rename = "createdAt")]
    created_at: Option<String>,
    active: bool,
    isolated: bool,
}

impl From<SpaceTuple> for SpaceView {
    fn from(t: SpaceTuple) -> Self {
        let (id, name, description, parent_id, created_at, active, isolated) = t;
        SpaceView {
            id,
            name,
            description,
            parent_id,
            created_at: created_at.map(|ts| ts.and_utc().to_rfc3339()),
            active: flag(active),
            isolated: flag(isolated),
        }
    }
}

const SPACE_COLUMNS: &str =
    "id, name, description, parent_id, created_at, active, isolated";

// ── GET /project-spaces ─────────────────────────────────────────────────────

#[derive(Deserialize)]
struct ListQuery {
    #[serde(rename = "userId")]
    user_id: Option<String>,
}

/// Returns spaces visible to a user. Admin (or no/blank userId) sees all active
/// spaces; a non-admin sees only spaces where they hold at least one role.
async fn list(
    State(state): State<AppState>,
    Query(q): Query<ListQuery>,
) -> ApiResult<Json<Vec<SpaceView>>> {
    let user_id = q.user_id.filter(|u| !u.trim().is_empty());

    if let Some(uid) = user_id.as_deref() {
        let admin_flag: Option<i16> = sqlx::query_scalar(
            "SELECT is_admin FROM pno_user WHERE id = $1 AND active = 1",
        )
        .bind(uid)
        .fetch_optional(&state.db)
        .await?;

        if admin_flag != Some(1) {
            // Non-admin: only spaces where the user holds a role.
            let sql = format!(
                "SELECT {SPACE_COLUMNS} FROM project_space ps \
                 WHERE ps.active = 1 \
                   AND EXISTS (SELECT 1 FROM user_role ur \
                               WHERE ur.user_id = $1 \
                                 AND ur.project_space_id = ps.id) \
                 ORDER BY name"
            );
            let rows: Vec<SpaceTuple> = sqlx::query_as(&sql)
                .bind(uid)
                .fetch_all(&state.db)
                .await?;
            return Ok(Json(rows.into_iter().map(SpaceView::from).collect()));
        }
    }

    // Admin or no filter: all active spaces.
    let sql = format!(
        "SELECT {SPACE_COLUMNS} FROM project_space WHERE active = 1 ORDER BY name"
    );
    let rows: Vec<SpaceTuple> = sqlx::query_as(&sql).fetch_all(&state.db).await?;
    Ok(Json(rows.into_iter().map(SpaceView::from).collect()))
}

// ── POST /project-spaces ────────────────────────────────────────────────────

#[derive(Deserialize)]
struct CreateBody {
    name: Option<String>,
    description: Option<String>,
    #[serde(rename = "parentId")]
    parent_id: Option<String>,
}

/// Response of `createProjectSpace`: id, name, description (""-coalesced),
/// parentId, active=true. No createdAt/isolated (matches Java exactly).
#[derive(Serialize)]
struct CreatedView {
    id: String,
    name: String,
    description: String,
    #[serde(rename = "parentId")]
    parent_id: Option<String>,
    active: bool,
}

async fn create(
    State(state): State<AppState>,
    ctx: Option<Extension<PnoUserContext>>,
    Json(body): Json<CreateBody>,
) -> ApiResult<Json<CreatedView>> {
    let name = body.name.unwrap_or_default();
    let description = body.description;
    let parent_id = body.parent_id;

    let id = format!("ps-{}", &uuid::Uuid::new_v4().to_string()[..8]);

    sqlx::query(
        "INSERT INTO project_space (id, name, description, parent_id) VALUES ($1, $2, $3, $4)",
    )
    .bind(&id)
    .bind(&name)
    .bind(&description)
    .bind(&parent_id)
    .execute(&state.db)
    .await?;

    let view = CreatedView {
        id: id.clone(),
        name,
        description: description.unwrap_or_default(),
        parent_id,
        active: true,
    };

    let by = current_user(ctx.as_deref()).to_string();
    events::pno_changed(
        &state,
        "PROJECT_SPACE",
        "CREATED",
        "projectSpaceId",
        &id,
        Some(&by),
    )
    .await;

    Ok(Json(view))
}

// ── GET /project-spaces/{id}/descendants ────────────────────────────────────

/// Iterative BFS over the active-space tree, including the target itself.
/// Cycle-safe via a visited set, capped at 500 ids (port of `resolveDescendants`).
async fn descendants(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> ApiResult<Json<Vec<String>>> {
    let mut result: Vec<String> = Vec::new();
    let mut visited: HashSet<String> = HashSet::new();
    let mut queue: VecDeque<String> = VecDeque::new();
    queue.push_back(id);

    while let Some(current) = queue.pop_front() {
        if result.len() >= 500 {
            break;
        }
        if !visited.insert(current.clone()) {
            continue;
        }
        result.push(current.clone());

        let children: Vec<String> = sqlx::query_scalar(
            "SELECT id FROM project_space WHERE parent_id = $1 AND active = 1",
        )
        .bind(&current)
        .fetch_all(&state.db)
        .await?;
        for c in children {
            queue.push_back(c);
        }
    }
    Ok(Json(result))
}

// ── DELETE /project-spaces/{id} ─────────────────────────────────────────────

async fn deactivate(
    State(state): State<AppState>,
    ctx: Option<Extension<PnoUserContext>>,
    Path(id): Path<String>,
) -> ApiResult<impl IntoResponse> {
    let res = sqlx::query("UPDATE project_space SET active = 0 WHERE id = $1")
        .bind(&id)
        .execute(&state.db)
        .await?;
    if res.rows_affected() == 0 {
        return Err(ApiError::BadRequest(format!(
            "Project space not found: {id}"
        )));
    }

    let by = current_user(ctx.as_deref()).to_string();
    events::pno_changed(
        &state,
        "PROJECT_SPACE",
        "DELETED",
        "projectSpaceId",
        &id,
        Some(&by),
    )
    .await;

    Ok(StatusCode::NO_CONTENT)
}

// ── Service-tag helpers ─────────────────────────────────────────────────────

/// `getServiceTags`: tags grouped by service code, ordered by code then value.
/// Built into a `serde_json::Map`; the SQL `ORDER BY service_code` keeps the
/// grouping deterministic and consumers read by key.
async fn get_service_tags(
    state: &AppState,
    project_space_id: &str,
) -> ApiResult<Map<String, Value>> {
    let rows: Vec<(String, String)> = sqlx::query_as(
        "SELECT service_code, tag_value \
         FROM project_space_service_tag \
         WHERE project_space_id = $1 \
         ORDER BY service_code, tag_value",
    )
    .bind(project_space_id)
    .fetch_all(&state.db)
    .await?;

    let mut map: Map<String, Value> = Map::new();
    for (service_code, tag_value) in rows {
        match map.get_mut(&service_code) {
            Some(Value::Array(arr)) => arr.push(json!(tag_value)),
            _ => {
                map.insert(service_code, json!([tag_value]));
            }
        }
    }
    Ok(map)
}

async fn is_isolated(state: &AppState, project_space_id: &str) -> ApiResult<bool> {
    let flag: Option<i16> = sqlx::query_scalar(
        "SELECT isolated FROM project_space WHERE id = $1 AND active = 1",
    )
    .bind(project_space_id)
    .fetch_optional(&state.db)
    .await?;
    Ok(flag == Some(1))
}

// ── GET /project-spaces/{id}/service-tags ───────────────────────────────────

async fn service_tags(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> ApiResult<Json<Map<String, Value>>> {
    let tags = get_service_tags(&state, &id).await?;
    Ok(Json(tags))
}

// ── GET /project-spaces/{id}/effective-service-tags (S2S) ───────────────────

/// Walks up the parent chain inheriting per-service tags: the nearest space
/// that defines a service wins (`putIfAbsent`). `isolated` reflects the target
/// space only. Response shape matches Java: { projectSpaceId, isolated,
/// serviceTags }. Port of `getEffectiveServiceTags`.
async fn effective_service_tags(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> ApiResult<Json<Value>> {
    let mut current_id: Option<String> = Some(id.clone());
    let mut visited: HashSet<String> = HashSet::new();
    let mut effective: Map<String, Value> = Map::new();
    let mut isolated = false;

    while let Some(cur) = current_id.clone() {
        if !visited.insert(cur.clone()) {
            break;
        }

        let own = get_service_tags(&state, &cur).await?;

        let rec: Option<(Option<i16>, Option<String>)> = sqlx::query_as(
            "SELECT isolated, parent_id FROM project_space WHERE id = $1 AND active = 1",
        )
        .bind(&cur)
        .fetch_optional(&state.db)
        .await?;

        let (iso, parent) = match rec {
            Some(r) => r,
            None => break,
        };

        if cur == id {
            isolated = iso == Some(1);
        }

        // putIfAbsent: a child-defined service is never overwritten by a parent.
        for (k, v) in own {
            effective.entry(k).or_insert(v);
        }

        current_id = parent;
    }

    Ok(Json(json!({
        "projectSpaceId": id,
        "isolated": isolated,
        "serviceTags": effective,
    })))
}

// ── PUT /project-spaces/{id}/service-tags/{serviceCode} ─────────────────────

#[derive(Deserialize)]
struct TagsBody {
    tags: Option<Vec<String>>,
}

/// Replaces all tags for `service_code` on the space. Enforces isolation:
///  * if THIS space is isolated, no other space may hold the same service+tag;
///  * regardless, no other ISOLATED space may already own the service+tag.
/// Then deletes existing tags for the service and re-inserts the trimmed,
/// non-blank values. Returns the refreshed tag map. Port of `setServiceTags`.
async fn set_service_tags(
    State(state): State<AppState>,
    ctx: Option<Extension<PnoUserContext>>,
    Path((id, service_code)): Path<(String, String)>,
    Json(body): Json<TagsBody>,
) -> ApiResult<Json<Map<String, Value>>> {
    let tags = body.tags;

    // Space must exist (active). NB: Postgres literal `1` is int4 → decode i32.
    let exists: Option<i32> = sqlx::query_scalar(
        "SELECT 1 FROM project_space WHERE id = $1 AND active = 1",
    )
    .bind(&id)
    .fetch_optional(&state.db)
    .await?;
    if exists.is_none() {
        return Err(ApiError::BadRequest(format!(
            "Project space not found: {id}"
        )));
    }

    let has_tags = tags.as_ref().map(|t| !t.is_empty()).unwrap_or(false);

    if has_tags {
        let tag_list = tags.as_ref().unwrap();

        // If this project is isolated: no other project may use the same tag.
        if is_isolated(&state, &id).await? {
            for tag in tag_list {
                let conflict: Option<i32> = sqlx::query_scalar(
                    "SELECT 1 FROM project_space_service_tag \
                     WHERE service_code = $1 AND tag_value = $2 \
                       AND project_space_id <> $3",
                )
                .bind(&service_code)
                .bind(tag)
                .bind(&id)
                .fetch_optional(&state.db)
                .await?;
                if conflict.is_some() {
                    return Err(ApiError::Conflict(format!(
                        "Tag '{tag}' for service '{service_code}' is already used by another project space (isolation conflict)"
                    )));
                }
            }
        }

        // No other ISOLATED project may already own these tags.
        for tag in tag_list {
            let isolated_conflict: Option<i32> = sqlx::query_scalar(
                "SELECT 1 FROM project_space_service_tag psst \
                 INNER JOIN project_space ps ON ps.id = psst.project_space_id \
                 WHERE psst.service_code = $1 AND psst.tag_value = $2 \
                   AND ps.isolated = 1 \
                   AND psst.project_space_id <> $3",
            )
            .bind(&service_code)
            .bind(tag)
            .bind(&id)
            .fetch_optional(&state.db)
            .await?;
            if isolated_conflict.is_some() {
                return Err(ApiError::Conflict(format!(
                    "Tag '{tag}' for service '{service_code}' is exclusively owned by an isolated project space"
                )));
            }
        }
    }

    // Replace: delete then insert non-blank, trimmed tags.
    sqlx::query(
        "DELETE FROM project_space_service_tag WHERE project_space_id = $1 AND service_code = $2",
    )
    .bind(&id)
    .bind(&service_code)
    .execute(&state.db)
    .await?;

    if let Some(tag_list) = &tags {
        for tag in tag_list {
            let trimmed = tag.trim();
            if !trimmed.is_empty() {
                let psst_id = format!("psst-{}", &uuid::Uuid::new_v4().to_string()[..8]);
                sqlx::query(
                    "INSERT INTO project_space_service_tag (id, project_space_id, service_code, tag_value) VALUES ($1, $2, $3, $4)",
                )
                .bind(&psst_id)
                .bind(&id)
                .bind(&service_code)
                .bind(trimmed)
                .execute(&state.db)
                .await?;
            }
        }
    }

    let by = current_user(ctx.as_deref()).to_string();
    events::pno_changed(
        &state,
        "PROJECT_SPACE",
        "UPDATED",
        "projectSpaceId",
        &id,
        Some(&by),
    )
    .await;

    // Controller returns the refreshed tag map.
    let refreshed = get_service_tags(&state, &id).await?;
    Ok(Json(refreshed))
}

// ── PUT /project-spaces/{id}/isolated ───────────────────────────────────────

#[derive(Deserialize)]
struct IsolatedBody {
    #[serde(default)]
    isolated: bool,
}

async fn set_isolated(
    State(state): State<AppState>,
    ctx: Option<Extension<PnoUserContext>>,
    Path(id): Path<String>,
    Json(body): Json<IsolatedBody>,
) -> ApiResult<impl IntoResponse> {
    let flag: i16 = if body.isolated { 1 } else { 0 };
    let res = sqlx::query(
        "UPDATE project_space SET isolated = $1 WHERE id = $2 AND active = 1",
    )
    .bind(flag)
    .bind(&id)
    .execute(&state.db)
    .await?;
    if res.rows_affected() == 0 {
        return Err(ApiError::BadRequest(format!(
            "Project space not found: {id}"
        )));
    }

    let by = current_user(ctx.as_deref()).to_string();
    events::pno_changed(
        &state,
        "PROJECT_SPACE",
        "UPDATED",
        "projectSpaceId",
        &id,
        Some(&by),
    )
    .await;

    Ok(StatusCode::NO_CONTENT)
}
