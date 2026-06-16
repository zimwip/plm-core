use thiserror::Error;

/// Errors surfaced by platform-lib-rs. S2S-call failures distinguish 4xx
/// (terminal — never retried, mirrors the Java ServiceClient policy) from
/// 5xx/transport (retryable).
#[derive(Debug, Error)]
pub enum PlatformError {
    #[error("jwt error: {0}")]
    Jwt(#[from] jsonwebtoken::errors::Error),

    #[error("wrong token type: expected {expected}, got {got}")]
    WrongTokenType { expected: String, got: String },

    #[error("http transport error: {0}")]
    Transport(#[from] reqwest::Error),

    #[error("upstream returned {status}: {body}")]
    UpstreamStatus { status: u16, body: String },

    #[error("no healthy instance for service '{0}'")]
    NoInstance(String),

    #[error("registry not populated within timeout")]
    RegistryNotReady,

    #[error("nats error: {0}")]
    Nats(String),

    #[error("config error: {0}")]
    Config(String),
}

impl PlatformError {
    /// 5xx and transport errors are retryable; 4xx are terminal.
    pub fn is_retryable(&self) -> bool {
        match self {
            PlatformError::Transport(_) => true,
            PlatformError::UpstreamStatus { status, .. } => *status >= 500,
            _ => false,
        }
    }
}

pub type Result<T> = std::result::Result<T, PlatformError>;
