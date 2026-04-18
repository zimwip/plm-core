-- V19: Drop node_type_action (NTA), rekey dependents directly on (node_type_id, action_id).
--
-- Rationale: `action.scope` + `action_permission` already encode which actions are wired
-- per node-type and transition. NTA only added `status`, `display_order`,
-- `display_name_override`, `transition_id`, plus serving as the FK anchor for
-- `action_param_override` and `node_type_action_guard`.
--
-- This migration:
--   1. Moves `display_order` to `action` (global across node types).
--   2. Rekeys `action_param_override` on (node_type_id, action_id, parameter_id).
--   3. Renames `node_type_action_guard` → `node_action_guard`, rekeys on
--      (node_type_id, action_id, transition_id, algorithm_instance_id).
--   4. Drops `node_type_action`.
--
-- Drops `status` (DISABLED semantics replaced by "no action_permission row = open"),
-- and drops `display_name_override` (YAGNI).

-- ============================================================
-- STEP 1: Move display_order from NTA to action (global)
-- ============================================================

ALTER TABLE action ADD COLUMN display_order INT NOT NULL DEFAULT 0;

UPDATE action a SET display_order = COALESCE(
  (SELECT MIN(nta.display_order) FROM node_type_action nta WHERE nta.action_id = a.id),
  0);

-- ============================================================
-- STEP 2: Rekey action_param_override on (node_type_id, action_id, parameter_id)
-- ============================================================

CREATE TABLE action_param_override_new (
    id              VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_id    VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    action_id       VARCHAR(100) NOT NULL REFERENCES action(id),
    parameter_id    VARCHAR(100) NOT NULL REFERENCES action_parameter(id),
    default_value   VARCHAR(1000),
    allowed_values  VARCHAR(2000),
    required        SMALLINT,
    CONSTRAINT uq_apo_new UNIQUE (node_type_id, action_id, parameter_id)
);

INSERT INTO action_param_override_new (id, node_type_id, action_id, parameter_id,
                                       default_value, allowed_values, required)
SELECT apo.id, nta.node_type_id, nta.action_id, apo.parameter_id,
       apo.default_value, apo.allowed_values, apo.required
FROM action_param_override apo
JOIN node_type_action nta ON nta.id = apo.node_type_action_id;

DROP TABLE action_param_override;
ALTER TABLE action_param_override_new RENAME TO action_param_override;
CREATE INDEX idx_apo_key ON action_param_override(node_type_id, action_id);

-- ============================================================
-- STEP 3: Rename node_type_action_guard → node_action_guard, rekey
-- ============================================================

CREATE TABLE node_action_guard (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_id          VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    action_id             VARCHAR(100) NOT NULL REFERENCES action(id),
    transition_id         VARCHAR(36)  REFERENCES lifecycle_transition(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    effect                VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    override_action       VARCHAR(20)  NOT NULL DEFAULT 'ADD',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_nag UNIQUE (node_type_id, action_id, transition_id, algorithm_instance_id)
);

INSERT INTO node_action_guard (id, node_type_id, action_id, transition_id,
                               algorithm_instance_id, effect, override_action, display_order)
SELECT ntag.id, nta.node_type_id, nta.action_id, nta.transition_id,
       ntag.algorithm_instance_id, ntag.effect, ntag.override_action, ntag.display_order
FROM node_type_action_guard ntag
JOIN node_type_action nta ON nta.id = ntag.node_type_action_id;

DROP TABLE node_type_action_guard;
CREATE INDEX idx_nag_key ON node_action_guard(node_type_id, action_id, transition_id);

-- ============================================================
-- STEP 4: Add lifecycle_transition_guard (3rd guard tier)
-- ============================================================
--
-- Guard tiers (merge order: generic → specific):
--   1. action_guard                 — attached to action.id, applies globally
--   2. lifecycle_transition_guard   — attached to lifecycle_transition.id,
--                                     applies across every node_type using that lifecycle
--   3. node_action_guard            — attached to (node_type, action, transition?),
--                                     per-type override (ADD or DISABLE)

CREATE TABLE lifecycle_transition_guard (
    id                      VARCHAR(100) NOT NULL PRIMARY KEY,
    lifecycle_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    algorithm_instance_id   VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    effect                  VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    display_order           INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_ltg UNIQUE (lifecycle_transition_id, algorithm_instance_id)
);
CREATE INDEX idx_ltg_transition ON lifecycle_transition_guard(lifecycle_transition_id);

-- Promote "shared" node-action guards that apply across every node_type using a given
-- transition to lifecycle-level guards, to remove duplication seeded in V18. A guard
-- qualifies when the same (transition, algorithm_instance, effect) exists on every
-- node_type that uses that lifecycle, with override_action='ADD'.
INSERT INTO lifecycle_transition_guard (id, lifecycle_transition_id, algorithm_instance_id, effect, display_order)
SELECT MIN(nag.id) AS id,
       nag.transition_id,
       nag.algorithm_instance_id,
       MIN(nag.effect) AS effect,
       MIN(nag.display_order) AS display_order
FROM node_action_guard nag
JOIN lifecycle_transition lt ON lt.id = nag.transition_id
WHERE nag.override_action = 'ADD'
GROUP BY nag.transition_id, nag.algorithm_instance_id, lt.lifecycle_id
HAVING COUNT(DISTINCT nag.node_type_id)
     = (SELECT COUNT(*) FROM node_type nt WHERE nt.lifecycle_id = lt.lifecycle_id);

-- Remove the per-type duplicates now that they have been promoted.
DELETE FROM node_action_guard nag
WHERE nag.override_action = 'ADD'
  AND EXISTS (
    SELECT 1 FROM lifecycle_transition_guard ltg
    WHERE ltg.lifecycle_transition_id = nag.transition_id
      AND ltg.algorithm_instance_id   = nag.algorithm_instance_id
  );

-- ============================================================
-- STEP 5: Drop node_type_action
-- ============================================================

DROP TABLE node_type_action;
