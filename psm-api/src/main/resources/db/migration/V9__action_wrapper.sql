-- Action wrapper pipeline: attaches algorithm instances (wrappers) to actions.
-- Wrappers execute in order around the action handler (chain of responsibility).

CREATE TABLE action_wrapper (
    id                    VARCHAR(64)  NOT NULL PRIMARY KEY,
    action_id             VARCHAR(64)  NOT NULL REFERENCES action(id),
    algorithm_instance_id VARCHAR(64)  NOT NULL REFERENCES algorithm_instance(id),
    execution_order       INT          NOT NULL DEFAULT 0,
    UNIQUE (action_id, algorithm_instance_id)
);

CREATE INDEX idx_action_wrapper_action ON action_wrapper(action_id);

-- ============================================================
-- WRAPPER ALGORITHM TYPE
-- ============================================================

INSERT INTO algorithm_type (id, name, description, java_interface) VALUES
  ('algtype-action-wrapper', 'Action Wrapper', 'Middleware wrapping action execution (transaction, lock, etc.)', 'com.plm.action.ActionWrapper');

-- ============================================================
-- WRAPPER ALGORITHMS
-- ============================================================

INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-wrapper-transaction', 'algtype-action-wrapper', 'wrapper-transaction', 'Transaction Wrapper', 'Manages PLM transaction lifecycle around action execution', 'transactionWrapper'),
  ('alg-wrapper-lock',        'algtype-action-wrapper', 'wrapper-lock',        'Lock Wrapper',        'Acquires/releases pessimistic lock around action execution', 'lockWrapper');

-- ============================================================
-- WRAPPER ALGORITHM INSTANCES
-- ============================================================

INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('wi-transaction', 'alg-wrapper-transaction', 'Transaction Wrapper'),
  ('wi-lock',        'alg-wrapper-lock',        'Lock Wrapper');

-- ============================================================
-- DEFAULT WRAPPER CHAINS PER ACTION
-- Maps old tx_mode behavior to wrapper pipeline:
--   NONE     → transaction wrapper only (passes through)
--   REQUIRED → transaction wrapper only
--   AUTO_OPEN → transaction wrapper only
--   ISOLATED → lock wrapper (order 10) + transaction wrapper (order 20)
-- ============================================================

-- ISOLATED actions: lock first, then transaction
-- act-transition (ISOLATED)
INSERT INTO action_wrapper (id, action_id, algorithm_instance_id, execution_order) VALUES
  ('aw-transition-lock', 'act-transition', 'wi-lock',        10),
  ('aw-transition-tx',   'act-transition', 'wi-transaction', 20);
-- act-sign (ISOLATED)
INSERT INTO action_wrapper (id, action_id, algorithm_instance_id, execution_order) VALUES
  ('aw-sign-lock', 'act-sign', 'wi-lock',        10),
  ('aw-sign-tx',   'act-sign', 'wi-transaction', 20);

-- AUTO_OPEN actions: transaction wrapper only
INSERT INTO action_wrapper (id, action_id, algorithm_instance_id, execution_order) VALUES
  ('aw-checkout-tx',    'act-checkout',    'wi-transaction', 10),
  ('aw-create-link-tx', 'act-create-link', 'wi-transaction', 10),
  ('aw-update-link-tx', 'act-update-link', 'wi-transaction', 10),
  ('aw-delete-link-tx', 'act-delete-link', 'wi-transaction', 10);

-- REQUIRED actions: transaction wrapper only
INSERT INTO action_wrapper (id, action_id, algorithm_instance_id, execution_order) VALUES
  ('aw-checkin-tx',     'act-checkin',     'wi-transaction', 10),
  ('aw-update-node-tx', 'act-update-node', 'wi-transaction', 10),
  ('aw-commit-tx',      'act-commit',      'wi-transaction', 10),
  ('aw-rollback-tx',    'act-rollback',    'wi-transaction', 10),
  ('aw-cancel-tx',      'act-cancel',      'wi-transaction', 10);

-- NONE actions: no wrappers (act-read, act-manage-roles, act-manage-baselines, act-baseline)
-- ActionDispatcher defaults to transaction wrapper with NONE mode if no wrappers configured
