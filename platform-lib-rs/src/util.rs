//! Small shared helpers.

use sha1::{Digest, Sha1};

/// Deterministic instance id = first 10 hex chars of SHA-1(base_url).
/// Matches spe-api's `instanceId = SHA-1(baseUrl)[0:10]` so a pod that
/// re-registers replaces its own entry instead of creating a duplicate.
pub fn instance_id(base_url: &str) -> String {
    let digest = Sha1::digest(base_url.as_bytes());
    hex::encode(digest)[..10].to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deterministic_and_10_chars() {
        let a = instance_id("http://spe-api:8082");
        let b = instance_id("http://spe-api:8082");
        assert_eq!(a, b);
        assert_eq!(a.len(), 10);
        assert!(a.chars().all(|c| c.is_ascii_hexdigit()));
        assert_ne!(a, instance_id("http://spe-api:9999"));
    }
}
