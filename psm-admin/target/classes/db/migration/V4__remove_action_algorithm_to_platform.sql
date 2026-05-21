-- ============================================================
-- Remove action/algorithm/permission tables from psm-admin.
-- These are owned by platform-api (service_code-scoped).
-- V3 already dropped node_action_guard and action_param_override.
-- ============================================================

-- Drop action pipeline tables first (child deps on action + algorithm_instance)
DROP TABLE IF EXISTS action_wrapper;
DROP TABLE IF EXISTS action_guard;
DROP TABLE IF EXISTS action_required_permission;

-- lifecycle_transition_guard moves to platform-api
DROP TABLE IF EXISTS lifecycle_transition_guard;

-- Drop action parameter + action
DROP TABLE IF EXISTS action_parameter;
DROP TABLE IF EXISTS action;

-- Drop permission catalog
DROP TABLE IF EXISTS permission;

-- Drop algorithm instance values before instance
DROP TABLE IF EXISTS algorithm_instance_param_value;

-- Drop algorithm_instance WITH CASCADE to remove the FK on source.resolver_instance_id.
-- The source table stays; resolver_instance_id becomes a soft (untyped) reference.
DROP TABLE IF EXISTS algorithm_instance CASCADE;

-- Drop stats tables (moved to platform-api)
DROP TABLE IF EXISTS algorithm_stat_window;
DROP TABLE IF EXISTS algorithm_stat;

-- Drop algorithm framework
DROP TABLE IF EXISTS algorithm_parameter;
DROP TABLE IF EXISTS algorithm;
DROP TABLE IF EXISTS algorithm_type;
