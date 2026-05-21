-- Remove node_type_state_action (per-node-type state action overrides).
-- Only lifecycle_state_action (tier 1) remains.
DROP TABLE IF EXISTS node_type_state_action;
