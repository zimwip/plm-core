//! Thin NATS wrapper — analogue of `NatsListenerFactory` / `PlmMessageBus`.
//!
//! `subscribe` spawns a task that invokes `handler` per message and returns a
//! [`Subscription`] handle; dropping it (or calling `close`) drains the
//! subscription — the equivalent of closing a Java `Dispatcher`.

use crate::error::{PlatformError, Result};
use futures::StreamExt;
pub use async_nats::Message;

#[derive(Clone)]
pub struct NatsBus {
    client: async_nats::Client,
}

/// Handle to a running subscription. Drop or `close()` to stop it.
pub struct Subscription {
    handle: tokio::task::JoinHandle<()>,
}

impl Subscription {
    pub fn close(self) {
        self.handle.abort();
    }
}

impl Drop for Subscription {
    fn drop(&mut self) {
        self.handle.abort();
    }
}

impl NatsBus {
    pub async fn connect(url: &str) -> Result<Self> {
        let client = async_nats::connect(url)
            .await
            .map_err(|e| PlatformError::Nats(e.to_string()))?;
        Ok(Self { client })
    }

    pub async fn publish(&self, subject: impl Into<String>, payload: Vec<u8>) -> Result<()> {
        self.client
            .publish(subject.into(), payload.into())
            .await
            .map_err(|e| PlatformError::Nats(e.to_string()))
    }

    /// Subscribe to `subject`; `handler` runs for every message until the
    /// returned [`Subscription`] is dropped.
    pub async fn subscribe<F>(&self, subject: impl Into<String>, handler: F) -> Result<Subscription>
    where
        F: Fn(Message) + Send + 'static,
    {
        let mut sub = self
            .client
            .subscribe(subject.into())
            .await
            .map_err(|e| PlatformError::Nats(e.to_string()))?;
        let handle = tokio::spawn(async move {
            while let Some(msg) = sub.next().await {
                handler(msg);
            }
        });
        Ok(Subscription { handle })
    }
}
