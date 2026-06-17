//! platform-api-rs — Rust port of the Java `platform-api`.
//!
//! Foundation modules live here; each subsystem is its own module exposing
//! `routes() -> Router<AppState>` (and a background-task spawn fn where needed),
//! mounted by `main.rs` behind the auth middleware.

pub mod admin;
pub mod auth;
pub mod catalog;
pub mod catalog_db;
pub mod config;
pub mod db;
pub mod error;
pub mod federation;
pub mod pno;
pub mod registry_server;
pub mod settings;
pub mod settings_registry;
pub mod state;
pub mod status;
pub mod vault;
