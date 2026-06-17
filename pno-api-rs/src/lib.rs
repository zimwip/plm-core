//! pno-api (Rust) — identity & authorization source of truth. Users, roles,
//! project-spaces, permission scopes, authorization policies, baskets, user-KV,
//! and WebDAV access tokens. Wire-compatible with the Java pno-api; serves at
//! root (the spe-api gateway strips `/api/pno`).

pub mod auth;
pub mod authorization;
pub mod basket;
pub mod config;
pub mod db;
pub mod error;
pub mod events;
pub mod project_spaces;
pub mod roles;
pub mod scopes;
pub mod settings;
pub mod state;
pub mod tokens;
pub mod user_kv;
pub mod users;
