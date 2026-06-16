//! Registry-aware service-to-service HTTP client — port of
//! `com.plm.platform.client.ServiceClient`.
//!
//! Resolves a target `serviceCode` to a live instance via the
//! [`LocalServiceRegistry`], attaches the S2S headers (service secret + the
//! forwarded auth/trace context), and retries on 5xx/transport errors only.
//! 4xx responses are terminal and returned as-is — they will not recover and
//! must not trip a retry (matches the Java resilience policy).

use crate::context::RequestContext;
use crate::error::{PlatformError, Result};
use crate::registry::LocalServiceRegistry;
use reqwest::Method;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::sync::Arc;
use std::time::Duration;

const DEFAULT_MAX_RETRIES: u32 = 3;
const REGISTRY_WAIT: Duration = Duration::from_secs(15);

#[derive(Clone)]
pub struct ServiceClient {
    http: reqwest::Client,
    registry: Arc<LocalServiceRegistry>,
    service_secret: String,
    max_retries: u32,
}

/// Outcome of a raw S2S call.
pub struct RawResponse {
    pub status: u16,
    pub body: Vec<u8>,
}

impl ServiceClient {
    pub fn new(registry: Arc<LocalServiceRegistry>, service_secret: impl Into<String>) -> Self {
        Self {
            http: reqwest::Client::new(),
            registry,
            service_secret: service_secret.into(),
            max_retries: DEFAULT_MAX_RETRIES,
        }
    }

    /// Call `serviceCode` at `path`. `path` is a BARE, root-relative path
    /// (e.g. `/internal/...` or `/nodes`) — the registry selects the target
    /// instance and the backend serves at root (gateway-strip routing). Do NOT
    /// include the `/api/<code>` prefix; that belongs only to gateway-facing URLs.
    pub async fn request_raw(
        &self,
        method: Method,
        service_code: &str,
        path: &str,
        body: Option<&[u8]>,
        content_type: Option<&str>,
    ) -> Result<RawResponse> {
        if !self.registry.is_populated() {
            self.registry.await_populated(REGISTRY_WAIT).await;
        }

        let mut attempt = 0u32;
        loop {
            let instance = self
                .registry
                .pick_instance(service_code)
                .ok_or_else(|| PlatformError::NoInstance(service_code.to_string()))?;
            let url = format!("{}{}", instance.base_url.trim_end_matches('/'), path);

            let result = self
                .send_once(method.clone(), &url, body, content_type)
                .await;

            match result {
                Ok(resp) => return Ok(resp),
                Err(e) if e.is_retryable() && attempt < self.max_retries => {
                    let backoff = 100u64 * 2u64.pow(attempt);
                    tracing::warn!("S2S {service_code} attempt {} failed: {e}; retrying", attempt + 1);
                    tokio::time::sleep(Duration::from_millis(backoff)).await;
                    attempt += 1;
                }
                Err(e) => return Err(e),
            }
        }
    }

    async fn send_once(
        &self,
        method: Method,
        url: &str,
        body: Option<&[u8]>,
        content_type: Option<&str>,
    ) -> Result<RawResponse> {
        let mut req = self.http.request(method, url);
        req = req.header("X-Service-Secret", &self.service_secret);

        if let Some(ctx) = RequestContext::current() {
            if let Some(bearer) = ctx.bearer {
                req = req.header("Authorization", format!("Bearer {bearer}"));
            }
            if let Some(ps) = ctx.project_space {
                req = req.header("X-PLM-ProjectSpace", ps);
            }
            if let Some(jid) = ctx.job_id {
                req = req.header("X-Job-Id", jid);
            }
            if let Some(tp) = ctx.traceparent {
                req = req.header("traceparent", tp);
            }
            if let Some(ts) = ctx.tracestate {
                req = req.header("tracestate", ts);
            }
        }

        if let Some(b) = body {
            req = req.header("Content-Type", content_type.unwrap_or("application/json"));
            req = req.body(b.to_vec());
        }

        let resp = req.send().await?;
        let status = resp.status().as_u16();
        let bytes = resp.bytes().await?.to_vec();

        // 4xx/5xx are surfaced as UpstreamStatus so retry classification can
        // act on them; only 5xx is retryable (see PlatformError::is_retryable).
        if status >= 400 {
            return Err(PlatformError::UpstreamStatus {
                status,
                body: String::from_utf8_lossy(&bytes).into_owned(),
            });
        }
        Ok(RawResponse { status, body: bytes })
    }

    /// GET `path` on `service_code`, deserializing the JSON body into `T`.
    pub async fn get_json<T: DeserializeOwned>(&self, service_code: &str, path: &str) -> Result<T> {
        let resp = self
            .request_raw(Method::GET, service_code, path, None, None)
            .await?;
        serde_json::from_slice(&resp.body)
            .map_err(|e| PlatformError::Config(format!("decode {path}: {e}")))
    }

    /// POST a JSON `body` to `path` on `service_code`, deserializing the reply.
    pub async fn post_json<B: Serialize, T: DeserializeOwned>(
        &self,
        service_code: &str,
        path: &str,
        body: &B,
    ) -> Result<T> {
        let payload = serde_json::to_vec(body)
            .map_err(|e| PlatformError::Config(format!("encode body: {e}")))?;
        let resp = self
            .request_raw(Method::POST, service_code, path, Some(&payload), None)
            .await?;
        serde_json::from_slice(&resp.body)
            .map_err(|e| PlatformError::Config(format!("decode {path}: {e}")))
    }
}
