//! JWT mint/verify — direct port of `com.spe.auth.JwtService` and
//! `com.plm.platform.auth.JwtVerifier`.
//!
//! HMAC HS256, key = `plm.service.secret` (≥32 UTF-8 bytes). Three token
//! types share the key and are disambiguated by the `typ` claim:
//!   - `fwd`     : short TTL (60s), spe → downstream, full identity.
//!   - `session` : longer TTL (3600s), spe → frontend, minimal claims.
//!   - `op`      : job-scoped, carries a `jid` claim.
//!
//! Verification filters on `typ` so a session token can never be used as a
//! forward token and vice-versa.

use crate::error::{PlatformError, Result};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

pub const TYP_FORWARD: &str = "fwd";
pub const TYP_SESSION: &str = "session";
pub const TYP_OPERATION: &str = "op";
const ISSUER: &str = "spe-api";

/// Normalized identity, mirror of `com.spe.auth.SpeUserContext`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UserContext {
    pub user_id: String,
    pub username: Option<String>,
    pub role_ids: Vec<String>,
    pub is_admin: bool,
    pub project_space_id: Option<String>,
    pub allowed_service_codes: Vec<String>,
    /// Effective (global) permission codes for the active project space.
    pub perms: Vec<String>,
    /// pno authorization/identity version at mint time. The gateway revokes a
    /// token whose `pv` is older than pno's current version (role/perm change).
    pub pv: Option<i64>,
}

/// Raw JWT claim set. Field names match the Java token byte-for-byte.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub iss: String,
    pub sub: String,
    pub typ: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(rename = "isAdmin", skip_serializing_if = "Option::is_none")]
    pub is_admin: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ps: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub jid: Option<String>,
    #[serde(rename = "roleIds", skip_serializing_if = "Option::is_none")]
    pub role_ids: Option<Vec<String>>,
    #[serde(rename = "svcCodes", skip_serializing_if = "Option::is_none")]
    pub svc_codes: Option<Vec<String>>,
    /// Effective global permission codes for the active project space.
    #[serde(rename = "perms", skip_serializing_if = "Option::is_none")]
    pub perms: Option<Vec<String>>,
    /// pno authorization/identity version at mint time (revocation check).
    #[serde(rename = "pv", skip_serializing_if = "Option::is_none")]
    pub pv: Option<i64>,
    pub jti: String,
    pub iat: i64,
    pub exp: i64,
}

impl Claims {
    fn into_user_context(self) -> UserContext {
        UserContext {
            user_id: self.sub,
            username: self.username,
            role_ids: self.role_ids.unwrap_or_default(),
            is_admin: self.is_admin.unwrap_or(false),
            project_space_id: self.ps,
            allowed_service_codes: self.svc_codes.unwrap_or_default(),
            perms: self.perms.unwrap_or_default(),
            pv: self.pv,
        }
    }
}

/// Result of a session-token mint: the token plus its absolute expiry (epoch s).
#[derive(Debug, Clone)]
pub struct MintedSession {
    pub token: String,
    pub expires_at: i64,
}

/// Minimal session claims, mirror of `JwtService.SessionClaims`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SessionClaims {
    pub user_id: String,
    pub project_space_id: Option<String>,
}

/// HMAC HS256 codec configured from `plm.service.secret` + TTLs.
#[derive(Clone)]
pub struct JwtCodec {
    enc: EncodingKey,
    dec: DecodingKey,
    pub forward_ttl: i64,
    pub session_ttl: i64,
    pub operation_max_ttl: i64,
    pub clock_skew_seconds: u64,
}

impl JwtCodec {
    /// Build a codec. Fails if the secret is shorter than 32 bytes (HS256
    /// minimum — same guard as `JwtService.init`).
    pub fn new(
        secret: &str,
        forward_ttl: i64,
        session_ttl: i64,
        operation_max_ttl: i64,
        clock_skew_seconds: u64,
    ) -> Result<Self> {
        let bytes = secret.as_bytes();
        if bytes.len() < 32 {
            return Err(PlatformError::Config(format!(
                "plm.service.secret must be at least 32 bytes for HS256 (got {})",
                bytes.len()
            )));
        }
        Ok(Self {
            enc: EncodingKey::from_secret(bytes),
            dec: DecodingKey::from_secret(bytes),
            forward_ttl,
            session_ttl,
            operation_max_ttl,
            clock_skew_seconds,
        })
    }

    /// Convenience constructor with the Java defaults (60 / 3600 / 3600 / 5).
    pub fn with_defaults(secret: &str) -> Result<Self> {
        Self::new(secret, 60, 3600, 3600, 5)
    }

    fn now() -> i64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock before epoch")
            .as_secs() as i64
    }

    fn jti() -> String {
        // Java uses a random UUID; a unique-enough value derived from a
        // high-resolution timestamp is sufficient for the jti claim (it is
        // not security-critical — replay is bounded by the short exp).
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock before epoch")
            .as_nanos();
        format!("{nanos:032x}")
    }

    fn sign(&self, claims: &Claims) -> Result<String> {
        Ok(encode(&Header::new(Algorithm::HS256), claims, &self.enc)?)
    }

    /// Build a full-context claim set for `ctx`. Empty role/svc/perm vectors
    /// serialize to nothing (Option::None) to keep tokens compact.
    fn claims_for(&self, ctx: &UserContext, typ: &str, jid: Option<String>, exp: i64) -> Claims {
        let opt = |v: &Vec<String>| if v.is_empty() { None } else { Some(v.clone()) };
        Claims {
            iss: ISSUER.into(),
            sub: ctx.user_id.clone(),
            typ: typ.into(),
            username: ctx.username.clone(),
            is_admin: Some(ctx.is_admin),
            ps: ctx.project_space_id.clone(),
            jid,
            role_ids: opt(&ctx.role_ids),
            svc_codes: opt(&ctx.allowed_service_codes),
            perms: opt(&ctx.perms),
            pv: ctx.pv,
            jti: Self::jti(),
            iat: Self::now(),
            exp,
        }
    }

    // ── Forward JWT (spe → downstream) — full active-project context ──────
    pub fn mint_forward(&self, ctx: &UserContext) -> Result<String> {
        let claims = self.claims_for(ctx, TYP_FORWARD, None, Self::now() + self.forward_ttl);
        self.sign(&claims)
    }

    // ── Operation JWT (spe → trusted services, job-scoped) ────────────
    pub fn mint_operation(&self, ctx: &UserContext, job_id: &str, ttl_seconds: i64) -> Result<String> {
        let ttl = ttl_seconds.min(self.operation_max_ttl);
        let claims = self.claims_for(ctx, TYP_OPERATION, Some(job_id.to_string()), Self::now() + ttl);
        self.sign(&claims)
    }

    // ── Session JWT (spe → frontend) — full active-project context ────────
    pub fn mint_session(&self, ctx: &UserContext) -> Result<MintedSession> {
        let exp = Self::now() + self.session_ttl;
        let claims = self.claims_for(ctx, TYP_SESSION, None, exp);
        Ok(MintedSession { token: self.sign(&claims)?, expires_at: exp })
    }

    /// Parse + verify signature + exp (with clock skew). Does not filter `typ`.
    pub fn parse(&self, token: &str) -> Result<Claims> {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.leeway = self.clock_skew_seconds;
        validation.validate_exp = true;
        validation.validate_aud = false;
        // Java validates only signature + temporal claims, not iss/aud.
        validation.required_spec_claims.clear();
        validation.required_spec_claims.insert("exp".to_string());
        let data = decode::<Claims>(token, &self.dec, &validation)?;
        Ok(data.claims)
    }

    fn parse_typed(&self, token: &str, expected: &str) -> Result<Claims> {
        let claims = self.parse(token)?;
        if claims.typ != expected {
            return Err(PlatformError::WrongTokenType {
                expected: expected.into(),
                got: claims.typ,
            });
        }
        Ok(claims)
    }

    /// Verify a session token (`typ=session`) → full context. The session token
    /// now carries the active project's roles + perms (resolved at login/switch),
    /// so the gateway derives the forward token from it without a pno round-trip.
    pub fn verify_session(&self, token: &str) -> Result<UserContext> {
        let c = self.parse_typed(token, TYP_SESSION)?;
        Ok(c.into_user_context())
    }

    /// Verify a forward token (`typ=fwd`) → full context (roles + perms + ps).
    pub fn verify_forward(&self, token: &str) -> Result<UserContext> {
        let c = self.parse_typed(token, TYP_FORWARD)?;
        Ok(c.into_user_context())
    }

    /// Full parse to a `UserContext` regardless of type (mirror of
    /// `JwtService.verify` — used by the downstream auth filter).
    pub fn verify_any(&self, token: &str) -> Result<UserContext> {
        Ok(self.parse(token)?.into_user_context())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const SECRET: &str = "test-secret-at-least-32-bytes-long!!";

    fn codec() -> JwtCodec {
        JwtCodec::with_defaults(SECRET).unwrap()
    }

    #[test]
    fn rejects_short_secret() {
        assert!(JwtCodec::with_defaults("too-short").is_err());
    }

    fn ctx() -> UserContext {
        UserContext {
            user_id: "u1".into(),
            username: Some("alice".into()),
            role_ids: vec!["role-designer".into()],
            is_admin: true,
            project_space_id: Some("ps-1".into()),
            allowed_service_codes: vec!["psm".into(), "dst".into()],
            perms: vec!["READ".into(), "UPDATE".into()],
            pv: Some(42),
        }
    }

    #[test]
    fn forward_roundtrip_carries_full_context() {
        let c = codec();
        let tok = c.mint_forward(&ctx()).unwrap();
        let back = c.verify_forward(&tok).unwrap();
        assert_eq!(back.user_id, "u1");
        assert_eq!(back.username.as_deref(), Some("alice"));
        assert!(back.is_admin);
        assert_eq!(back.project_space_id.as_deref(), Some("ps-1"));
        assert_eq!(back.role_ids, vec!["role-designer".to_string()]);
        assert_eq!(back.perms, vec!["READ".to_string(), "UPDATE".to_string()]);
        assert_eq!(back.allowed_service_codes, vec!["psm".to_string(), "dst".to_string()]);
        assert_eq!(back.pv, Some(42));
    }

    #[test]
    fn session_roundtrip_carries_full_context() {
        let c = codec();
        let m = c.mint_session(&ctx()).unwrap();
        let back = c.verify_session(&m.token).unwrap();
        assert_eq!(back.user_id, "u1");
        assert_eq!(back.project_space_id.as_deref(), Some("ps-1"));
        assert_eq!(back.role_ids, vec!["role-designer".to_string()]);
        assert_eq!(back.perms, vec!["READ".to_string(), "UPDATE".to_string()]);
    }

    #[test]
    fn typ_confusion_rejected() {
        let c = codec();
        let m = c.mint_session(&ctx()).unwrap();
        // A session token must not verify as a forward token.
        assert!(matches!(
            c.verify_forward(&m.token),
            Err(PlatformError::WrongTokenType { .. })
        ));
    }

    #[test]
    fn operation_carries_jid_and_caps_ttl() {
        let c = codec();
        let tok = c.mint_operation(&ctx(), "job-9", 999_999).unwrap();
        let claims = c.parse(&tok).unwrap();
        assert_eq!(claims.typ, TYP_OPERATION);
        assert_eq!(claims.jid.as_deref(), Some("job-9"));
        assert!(claims.exp - claims.iat <= 3600);
    }

    #[test]
    fn bad_signature_rejected() {
        let c = codec();
        let other = JwtCodec::with_defaults("another-secret-at-least-32-bytes!!!").unwrap();
        let m = c.mint_session(&ctx()).unwrap();
        assert!(other.verify_session(&m.token).is_err());
    }
}
