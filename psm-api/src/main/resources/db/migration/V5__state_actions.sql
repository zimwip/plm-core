-- ============================================================
-- V5: Lifecycle State Actions
--
-- Extensible, administrable actions attached to lifecycle states.
-- Two execution modes: TRANSACTIONAL (errors abort transition)
-- and POST_COMMIT (errors logged, never block).
-- ============================================================

-- New algorithm type for state actions
INSERT INTO algorithm_type (id, name, description, java_interface) VALUES
  ('algtype-state-action', 'State Action',
   'Actions executed when entering or exiting a lifecycle state',
   'com.plm.domain.stateaction.StateAction');

-- Collapse History algorithm
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-collapse-history', 'algtype-state-action', 'collapse_history',
   'Collapse History',
   'Deletes committed versions of previous revision when entering Released state; sets iteration to 0',
   'collapseHistoryAction');

-- Default instance (no parameters)
INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('si-collapse-history', 'alg-collapse-history', 'Collapse History');

-- ============================================================
-- TIER 1: lifecycle_state_action
-- Attached to a lifecycle state, shared across all node types
-- using that lifecycle.
-- ============================================================

CREATE TABLE lifecycle_state_action (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    lifecycle_state_id    VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    trigger               VARCHAR(20)  NOT NULL DEFAULT 'ON_ENTER',
    execution_mode        VARCHAR(20)  NOT NULL DEFAULT 'TRANSACTIONAL',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT chk_lsa_trigger CHECK (trigger IN ('ON_ENTER', 'ON_EXIT')),
    CONSTRAINT chk_lsa_mode CHECK (execution_mode IN ('TRANSACTIONAL', 'POST_COMMIT')),
    CONSTRAINT uq_lsa UNIQUE (lifecycle_state_id, algorithm_instance_id, trigger)
);

CREATE INDEX idx_lsa_state ON lifecycle_state_action(lifecycle_state_id);

-- ============================================================
-- TIER 2: node_type_state_action
-- Per-node-type override (ADD or DISABLE), same pattern as
-- node_action_guard.
-- ============================================================

CREATE TABLE node_type_state_action (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_id          VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    lifecycle_state_id    VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    trigger               VARCHAR(20)  NOT NULL DEFAULT 'ON_ENTER',
    execution_mode        VARCHAR(20)  NOT NULL DEFAULT 'TRANSACTIONAL',
    override_action       VARCHAR(20)  NOT NULL DEFAULT 'ADD',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT chk_ntsa_trigger CHECK (trigger IN ('ON_ENTER', 'ON_EXIT')),
    CONSTRAINT chk_ntsa_mode CHECK (execution_mode IN ('TRANSACTIONAL', 'POST_COMMIT')),
    CONSTRAINT uq_ntsa UNIQUE (node_type_id, lifecycle_state_id, algorithm_instance_id, trigger)
);

CREATE INDEX idx_ntsa_key ON node_type_state_action(node_type_id, lifecycle_state_id);

-- ============================================================
-- Attach collapse_history to Released state (ON_ENTER, TRANSACTIONAL)
-- ============================================================

INSERT INTO lifecycle_state_action (id, lifecycle_state_id, algorithm_instance_id, trigger, execution_mode, display_order) VALUES
  ('lsa-released-collapse', 'st-released', 'si-collapse-history', 'ON_ENTER', 'TRANSACTIONAL', 10);

-- ============================================================
-- Migrate existing collapse_history=false node_types to DISABLE
-- overrides. Node types that already have collapse_history=true
-- (or don't exist yet) inherit the lifecycle-level attachment.
-- ============================================================

INSERT INTO node_type_state_action (id, node_type_id, lifecycle_state_id, algorithm_instance_id, trigger, execution_mode, override_action, display_order)
SELECT
  CONCAT('ntsa-disable-collapse-', nt.id),
  nt.id,
  'st-released',
  'si-collapse-history',
  'ON_ENTER',
  'TRANSACTIONAL',
  'DISABLE',
  10
FROM node_type nt
WHERE nt.lifecycle_id = 'lc-standard'
  AND (nt.collapse_history = FALSE OR nt.collapse_history IS NULL);
