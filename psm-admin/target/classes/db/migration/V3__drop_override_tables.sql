-- Remove per-node-type action guard overrides and parameter overrides.
-- These features are not part of the simplified action model.
DROP TABLE IF EXISTS node_action_guard;
DROP TABLE IF EXISTS action_param_override;
