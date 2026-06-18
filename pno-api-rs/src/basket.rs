//! Basket: per-user pinned items scoped by project space. Faithful port of the
//! Java `BasketController` + `BasketService` + `BasketPublisher` +
//! `BasketEventSubscriber`.
//!
//! Table `basket_item` carries a UNIQUE `(user_id, ps_id, source, type_code,
//! item_id)`; inserts are idempotent via `ON CONFLICT DO NOTHING`. All routes
//! are bare (the spe-api gateway strips `/api/pno`). The project space comes
//! from the `x-plm-projectspace` header — absent/blank means the user-global
//! scope (`""`).
//!
//! Unlike identity/grant mutations (see `events.rs`), basket changes do NOT bump
//! the authorization version: this is user data, not authz. Mutations instead
//! publish per-user NATS events on `project.{psId}.users.{userId}.{EVENT}`,
//! mirroring `BasketPublisher.sendToUser`.

use crate::auth::PnoUserContext;
use crate::error::{ApiError, ApiResult};
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::IntoResponse;
use axum::routing::{delete, get};
use axum::{Extension, Json, Router};
use platform_lib_rs::nats::Subscription;
use serde_json::{json, Value};
use uuid::Uuid;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/users/:user_id/basket",
            get(list).delete(clear),
        )
        .route(
            "/users/:user_id/basket/:source/:type_code/:item_id",
            // PUT add, DELETE remove
            delete(remove).put(add),
        )
}

// ── helpers ────────────────────────────────────────────────────────────────

/// Project-space id from the `x-plm-projectspace` header; absent/blank => "".
/// Mirrors the Java `psId(request)` helper.
fn ps_id(headers: &HeaderMap) -> String {
    headers
        .get("x-plm-projectspace")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .unwrap_or_default()
}

/// Active project space for an HTTP basket op. The token context (`ps` claim)
/// is authoritative: spe strips the `X-PLM-ProjectSpace` header (the forward
/// JWT is the sole source of the active project), so `ps_id(headers)` is blank
/// for session requests. Reading the header here scoped manual ops to "" while
/// the NATS auto-add/remove path uses the real `projectSpaceId` from the event
/// payload — the mismatch made the basket appear to empty itself. Fall back to
/// the header only when the context carries no project (non-spe callers).
fn active_ps(ctx: &Option<Extension<PnoUserContext>>, headers: &HeaderMap) -> String {
    ctx.as_ref()
        .and_then(|c| c.project_space.clone())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| ps_id(headers))
}

/// Enforce self-or-admin, replicating `requireSelfOrAdmin`. The context is
/// present for any Bearer-authenticated request (S2S secret paths don't hit
/// these routes). Absent context => forbidden.
fn require_self_or_admin(ctx: &Option<Extension<PnoUserContext>>, user_id: &str) -> ApiResult<()> {
    match ctx {
        Some(c) if c.is_admin || c.user_id == user_id => Ok(()),
        _ => Err(ApiError::Forbidden("Access denied".into())),
    }
}

// ── NATS per-user publishing (port of BasketPublisher) ──────────────────────

/// Build the user-scoped envelope, matching the Java `BasketPublisher`
/// byte-for-byte: `{event, at, id, userId, projectSpaceId, key, value}` for
/// ADDED/REMOVED, or `{event, at, id, userId, projectSpaceId}` for CLEARED.
/// The frontend (`syncBasketAdd/Remove/Clear`) reads `projectSpaceId`.
fn user_envelope(
    event: &str,
    user_id: &str,
    ps_id: &str,
    key: Option<&str>,
    value: Option<&str>,
) -> Vec<u8> {
    let mut m = serde_json::Map::new();
    m.insert("event".into(), json!(event));
    m.insert("at".into(), json!(chrono::Utc::now().to_rfc3339()));
    m.insert("id".into(), json!(uuid::Uuid::new_v4().to_string()));
    m.insert("userId".into(), json!(user_id));
    m.insert("projectSpaceId".into(), json!(ps_id));
    if let Some(k) = key {
        m.insert("key".into(), json!(k));
    }
    if let Some(v) = value {
        m.insert("value".into(), json!(v));
    }
    serde_json::to_vec(&Value::Object(m)).unwrap_or_default()
}

/// Publish a basket event to the specific user via NATS. Skips when NATS is
/// absent or the project space is blank (`BasketPublisher.send` guard).
/// Subject: `project.{psId}.users.{userId}.{EVENT}`.
async fn publish_user_event(
    state: &AppState,
    event: &str,
    user_id: &str,
    ps_id: &str,
    key: Option<&str>,
    value: Option<&str>,
) {
    if ps_id.is_empty() {
        return;
    }
    if let Some(nats) = &state.nats {
        let subject = format!("project.{ps_id}.users.{user_id}.{event}");
        let payload = user_envelope(event, user_id, ps_id, key, value);
        if let Err(e) = nats.publish(subject, payload).await {
            tracing::warn!("Failed to publish basket event {event} for user={user_id}: {e}");
        }
    }
}

// ── service-layer (port of BasketService) ───────────────────────────────────

/// Insert a basket item idempotently. Returns true iff a new row was inserted.
/// Port of `BasketService.add`.
async fn add_item(
    state: &AppState,
    user_id: &str,
    ps_id: &str,
    source: &str,
    type_code: &str,
    item_id: &str,
) -> ApiResult<bool> {
    let rows = sqlx::query(
        "INSERT INTO basket_item (id, user_id, ps_id, source, type_code, item_id) \
         VALUES ($1, $2, $3, $4, $5, $6) \
         ON CONFLICT (user_id, ps_id, source, type_code, item_id) DO NOTHING",
    )
    .bind(Uuid::new_v4().to_string())
    .bind(user_id)
    .bind(ps_id)
    .bind(source)
    .bind(type_code)
    .bind(item_id)
    .execute(&state.db)
    .await?
    .rows_affected();
    Ok(rows > 0)
}

/// Rows affected by a deletion of a physically-removed item across every user's
/// basket: `(user_id, ps_id, source, type_code)`. Port of
/// `BasketService.removeByItemId` (fetch-then-delete).
async fn remove_by_item_id(
    state: &AppState,
    item_id: &str,
) -> ApiResult<Vec<(String, String, String, String)>> {
    let affected: Vec<(String, String, String, String)> = sqlx::query_as(
        "SELECT user_id, ps_id, source, type_code FROM basket_item WHERE item_id = $1",
    )
    .bind(item_id)
    .fetch_all(&state.db)
    .await?;
    if !affected.is_empty() {
        sqlx::query("DELETE FROM basket_item WHERE item_id = $1")
            .bind(item_id)
            .execute(&state.db)
            .await?;
    }
    Ok(affected)
}

// ── GET /users/{userId}/basket ──────────────────────────────────────────────

async fn list(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
    headers: HeaderMap,
) -> ApiResult<Json<Value>> {
    require_self_or_admin(&ctx, &user_id)?;
    let ps = active_ps(&ctx, &headers);

    let rows: Vec<(String, String, String)> = sqlx::query_as(
        "SELECT source, type_code, item_id FROM basket_item \
         WHERE user_id = $1 AND ps_id = $2 ORDER BY created_at",
    )
    .bind(&user_id)
    .bind(&ps)
    .fetch_all(&state.db)
    .await?;

    let out: Vec<Value> = rows
        .into_iter()
        .map(|(source, type_code, item_id)| {
            json!({ "source": source, "typeCode": type_code, "itemId": item_id })
        })
        .collect();
    Ok(Json(Value::Array(out)))
}

// ── PUT /users/{userId}/basket/{source}/{typeCode}/{itemId} ─────────────────

async fn add(
    State(state): State<AppState>,
    Path((user_id, source, type_code, item_id)): Path<(String, String, String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    headers: HeaderMap,
) -> ApiResult<Json<Value>> {
    require_self_or_admin(&ctx, &user_id)?;
    let ps = active_ps(&ctx, &headers);

    let added = add_item(&state, &user_id, &ps, &source, &type_code, &item_id).await?;
    if added {
        let key = format!("{source}:{type_code}");
        publish_user_event(
            &state,
            "BASKET_ITEM_ADDED",
            &user_id,
            &ps,
            Some(&key),
            Some(&item_id),
        )
        .await;
    }
    Ok(Json(json!({ "status": "ok" })))
}

// ── DELETE /users/{userId}/basket/{source}/{typeCode}/{itemId} ──────────────

async fn remove(
    State(state): State<AppState>,
    Path((user_id, source, type_code, item_id)): Path<(String, String, String, String)>,
    ctx: Option<Extension<PnoUserContext>>,
    headers: HeaderMap,
) -> ApiResult<impl IntoResponse> {
    require_self_or_admin(&ctx, &user_id)?;
    let ps = active_ps(&ctx, &headers);

    sqlx::query(
        "DELETE FROM basket_item \
         WHERE user_id = $1 AND ps_id = $2 AND source = $3 AND type_code = $4 AND item_id = $5",
    )
    .bind(&user_id)
    .bind(&ps)
    .bind(&source)
    .bind(&type_code)
    .bind(&item_id)
    .execute(&state.db)
    .await?;

    let key = format!("{source}:{type_code}");
    publish_user_event(
        &state,
        "BASKET_ITEM_REMOVED",
        &user_id,
        &ps,
        Some(&key),
        Some(&item_id),
    )
    .await;
    Ok(StatusCode::NO_CONTENT)
}

// ── DELETE /users/{userId}/basket ───────────────────────────────────────────

async fn clear(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    ctx: Option<Extension<PnoUserContext>>,
    headers: HeaderMap,
) -> ApiResult<impl IntoResponse> {
    require_self_or_admin(&ctx, &user_id)?;
    let ps = active_ps(&ctx, &headers);

    sqlx::query("DELETE FROM basket_item WHERE user_id = $1 AND ps_id = $2")
        .bind(&user_id)
        .bind(&ps)
        .execute(&state.db)
        .await?;

    publish_user_event(&state, "BASKET_CLEARED", &user_id, &ps, None, None).await;
    Ok(StatusCode::NO_CONTENT)
}

// ── NATS subscribers (port of BasketEventSubscriber) ────────────────────────

/// Subscribe to `global.ITEM_CREATED` (auto-add to basket) and
/// `global.ITEM_DELETED` (auto-remove the deleted item from every user's
/// basket, notifying each affected user). Best-effort: errors are logged and
/// swallowed. The returned subscriptions must be kept alive for the process
/// lifetime (the caller `std::mem::forget`s them).
///
/// `state.nats` is `Some` whenever this is invoked (main.rs guards on it).
pub async fn spawn_event_subscribers(state: AppState) -> Vec<Subscription> {
    let mut subs = Vec::new();
    let nats = match state.nats.as_ref() {
        Some(n) => n.clone(),
        None => return subs,
    };

    // global.ITEM_CREATED → basket auto-add
    {
        let state = state.clone();
        match nats
            .subscribe("global.ITEM_CREATED", move |msg| {
                let state = state.clone();
                tokio::spawn(async move {
                    handle_item_created(&state, &msg.payload).await;
                });
            })
            .await
        {
            Ok(s) => {
                tracing::info!("BasketEventSubscriber: subscribed to global.ITEM_CREATED");
                subs.push(s);
            }
            Err(e) => tracing::warn!("subscribe global.ITEM_CREATED failed: {e}"),
        }
    }

    // global.ITEM_DELETED → basket auto-remove from all users
    {
        let state = state.clone();
        match nats
            .subscribe("global.ITEM_DELETED", move |msg| {
                let state = state.clone();
                tokio::spawn(async move {
                    handle_item_deleted(&state, &msg.payload).await;
                });
            })
            .await
        {
            Ok(s) => {
                tracing::info!("BasketEventSubscriber: subscribed to global.ITEM_DELETED");
                subs.push(s);
            }
            Err(e) => tracing::warn!("subscribe global.ITEM_DELETED failed: {e}"),
        }
    }

    subs
}

/// Extract a string field from a JSON object payload.
fn str_field<'a>(v: &'a Value, key: &str) -> Option<&'a str> {
    v.get(key).and_then(Value::as_str)
}

async fn handle_item_created(state: &AppState, payload: &[u8]) {
    let v: Value = match serde_json::from_slice(payload) {
        Ok(v) => v,
        Err(e) => {
            tracing::error!("BasketEventSubscriber: failed to parse ITEM_CREATED: {e}");
            return;
        }
    };

    let source = str_field(&v, "source");
    let type_code = str_field(&v, "typeCode");
    let item_id = str_field(&v, "itemId");
    let user_id = str_field(&v, "userId");
    let project_space_id = str_field(&v, "projectSpaceId");

    let (source, type_code, item_id, user_id) = match (source, type_code, item_id, user_id) {
        (Some(s), Some(t), Some(i), Some(u)) => (s, t, i, u),
        _ => {
            tracing::warn!("BasketEventSubscriber: incomplete ITEM_CREATED payload, skipping");
            return;
        }
    };
    let ps_id = project_space_id.unwrap_or("");
    let key = format!("{source}:{type_code}");

    match add_item(state, user_id, ps_id, source, type_code, item_id).await {
        Ok(added) => {
            if added {
                publish_user_event(
                    state,
                    "BASKET_ITEM_ADDED",
                    user_id,
                    ps_id,
                    Some(&key),
                    Some(item_id),
                )
                .await;
            }
            tracing::debug!(
                "Basket auto-add: user={user_id} ps={ps_id} key={key} item={item_id}"
            );
        }
        Err(e) => {
            tracing::error!("BasketEventSubscriber: failed to process ITEM_CREATED event: {e}");
        }
    }
}

async fn handle_item_deleted(state: &AppState, payload: &[u8]) {
    let v: Value = match serde_json::from_slice(payload) {
        Ok(v) => v,
        Err(e) => {
            tracing::error!("BasketEventSubscriber: failed to parse ITEM_DELETED: {e}");
            return;
        }
    };

    let item_id = match str_field(&v, "itemId") {
        Some(i) => i,
        None => {
            tracing::warn!("BasketEventSubscriber: incomplete ITEM_DELETED payload, skipping");
            return;
        }
    };

    match remove_by_item_id(state, item_id).await {
        Ok(affected) => {
            for (user_id, ps_id, source, type_code) in &affected {
                let key = format!("{source}:{type_code}");
                publish_user_event(
                    state,
                    "BASKET_ITEM_REMOVED",
                    user_id,
                    ps_id,
                    Some(&key),
                    Some(item_id),
                )
                .await;
            }
            if !affected.is_empty() {
                tracing::debug!(
                    "Basket auto-remove: item={item_id} removed from {} basket(s)",
                    affected.len()
                );
            }
        }
        Err(e) => {
            tracing::error!("BasketEventSubscriber: failed to process ITEM_DELETED event: {e}");
        }
    }
}
