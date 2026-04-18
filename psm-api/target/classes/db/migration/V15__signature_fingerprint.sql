-- Capture the fingerprint of the version being signed.
-- Allows verifying that a signature was applied to a specific content state.
ALTER TABLE node_signature ADD COLUMN signed_version_fingerprint VARCHAR(64);
