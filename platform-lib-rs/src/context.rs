//! Per-request propagation context — the Rust analogue of
//! `ServiceClientTokenContext` / `OperationTokenContext` ThreadLocals.
//!
//! Carries the inbound user JWT, project space, job id and W3C trace headers
//! so that outbound S2S calls re-attach them. Uses a `tokio` task-local; set
//! it with [`RequestContext::scope`] around the handling of a request.

use http::HeaderMap;
use std::future::Future;

#[derive(Debug, Clone, Default)]
pub struct RequestContext {
    /// Bearer JWT of the inbound caller (forwarded on S2S calls).
    pub bearer: Option<String>,
    /// `X-PLM-ProjectSpace` value.
    pub project_space: Option<String>,
    /// `X-Job-Id` value (operation/job token flows).
    pub job_id: Option<String>,
    /// W3C `traceparent` header for trace continuity.
    pub traceparent: Option<String>,
    /// W3C `tracestate` header.
    pub tracestate: Option<String>,
}

tokio::task_local! {
    static CURRENT: RequestContext;
}

impl RequestContext {
    /// Run `fut` with `self` installed as the current request context.
    pub async fn scope<F: Future>(self, fut: F) -> F::Output {
        CURRENT.scope(self, fut).await
    }

    /// Current context for this task, if one is in scope.
    pub fn current() -> Option<RequestContext> {
        CURRENT.try_with(|c| c.clone()).ok()
    }

    /// Build a context from inbound request headers — the Authorization bearer,
    /// `X-PLM-ProjectSpace`, `X-Job-Id` and the W3C trace headers. Framework
    /// agnostic (takes a raw `http::HeaderMap`): a service captures it at the
    /// request boundary, then wraps the handler future in [`RequestContext::scope`]
    /// so outbound [`crate::client::ServiceClient`] calls re-attach the state.
    pub fn from_headers(headers: &HeaderMap) -> Self {
        let get = |k: &str| {
            headers
                .get(k)
                .and_then(|v| v.to_str().ok())
                .map(str::to_owned)
        };
        let bearer = get("authorization")
            .and_then(|a| a.strip_prefix("Bearer ").map(|s| s.trim().to_owned()));
        Self {
            bearer,
            project_space: get("x-plm-projectspace"),
            job_id: get("x-job-id"),
            traceparent: get("traceparent"),
            tracestate: get("tracestate"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn from_headers_extracts_all() {
        let mut h = HeaderMap::new();
        h.insert("authorization", "Bearer jwt-abc".parse().unwrap());
        h.insert("x-plm-projectspace", "ps-9".parse().unwrap());
        h.insert("x-job-id", "job-7".parse().unwrap());
        h.insert("traceparent", "00-trace-span-01".parse().unwrap());

        let rc = RequestContext::from_headers(&h);
        assert_eq!(rc.bearer.as_deref(), Some("jwt-abc"));
        assert_eq!(rc.project_space.as_deref(), Some("ps-9"));
        assert_eq!(rc.job_id.as_deref(), Some("job-7"));
        assert_eq!(rc.traceparent.as_deref(), Some("00-trace-span-01"));
        assert!(rc.tracestate.is_none());
    }

    #[test]
    fn from_headers_ignores_non_bearer_auth() {
        let mut h = HeaderMap::new();
        h.insert("authorization", "Basic abc".parse().unwrap());
        assert!(RequestContext::from_headers(&h).bearer.is_none());
    }

    #[tokio::test]
    async fn scope_makes_context_current() {
        let rc = RequestContext {
            bearer: Some("t".into()),
            ..Default::default()
        };
        rc.scope(async {
            assert_eq!(RequestContext::current().unwrap().bearer.as_deref(), Some("t"));
        })
        .await;
    }
}
