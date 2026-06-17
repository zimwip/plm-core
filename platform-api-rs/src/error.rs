//! Unified API error → axum response. Mirrors the Java `GlobalExceptionHandler`
//! shape: `{ "error": "<message>" }` with an appropriate status.

use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;

#[derive(Debug)]
pub enum ApiError {
    BadRequest(String),
    Unauthorized(String),
    Forbidden(String),
    NotFound(String),
    Upstream(u16, String),
    Internal(String),
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ApiError::BadRequest(m) => write!(f, "{m}"),
            ApiError::Unauthorized(m) => write!(f, "{m}"),
            ApiError::Forbidden(m) => write!(f, "{m}"),
            ApiError::NotFound(m) => write!(f, "{m}"),
            ApiError::Upstream(s, m) => write!(f, "upstream {s}: {m}"),
            ApiError::Internal(m) => write!(f, "{m}"),
        }
    }
}

impl std::error::Error for ApiError {}

impl ApiError {
    fn status(&self) -> StatusCode {
        match self {
            ApiError::BadRequest(_) => StatusCode::BAD_REQUEST,
            ApiError::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            ApiError::Forbidden(_) => StatusCode::FORBIDDEN,
            ApiError::NotFound(_) => StatusCode::NOT_FOUND,
            ApiError::Upstream(s, _) => {
                StatusCode::from_u16(*s).unwrap_or(StatusCode::BAD_GATEWAY)
            }
            ApiError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = self.status();
        (status, Json(json!({ "error": self.to_string() }))).into_response()
    }
}

/// Map sqlx errors to a 500 (or 404 on RowNotFound).
impl From<sqlx::Error> for ApiError {
    fn from(e: sqlx::Error) -> Self {
        match e {
            sqlx::Error::RowNotFound => ApiError::NotFound("not found".to_string()),
            other => ApiError::Internal(format!("db: {other}")),
        }
    }
}

impl From<platform_lib_rs::error::PlatformError> for ApiError {
    fn from(e: platform_lib_rs::error::PlatformError) -> Self {
        use platform_lib_rs::error::PlatformError::*;
        match e {
            UpstreamStatus { status, body } => ApiError::Upstream(status, body),
            NoInstance(c) => ApiError::Upstream(503, format!("no instance for {c}")),
            other => ApiError::Internal(other.to_string()),
        }
    }
}

pub type ApiResult<T> = Result<T, ApiError>;
