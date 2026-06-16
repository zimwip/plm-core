//! platform-lib-rs — minimal Rust port of the PLM Core `platform-lib`.
//!
//! Implements only the subset needed by thin I/O services (the spe-api
//! gateway): JWT mint/verify, the local service registry, self-registration
//! with platform-api, a NATS wrapper, and a registry-aware S2S HTTP client.
//! It deliberately omits the Casbin authz, action, algorithm, settings and
//! config-snapshot frameworks — those are unused by gateway-class services.
//!
//! Every wire contract (JWT claims, register/snapshot DTOs, instance-id
//! derivation, NATS subjects, S2S headers) matches the Java implementation so
//! Rust and Java services interoperate transparently.

pub mod client;
pub mod context;
pub mod dto;
pub mod error;
pub mod jwt;
pub mod nats;
pub mod registration;
pub mod registry;
pub mod telemetry;
pub mod util;

pub use client::{RawResponse, ServiceClient};
pub use context::RequestContext;
pub use error::{PlatformError, Result};
pub use jwt::{JwtCodec, MintedSession, SessionClaims, UserContext};
pub use registry::LocalServiceRegistry;
