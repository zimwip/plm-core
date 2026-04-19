-- Action handlers are now algorithm beans. Remove legacy columns from action table.
-- Wrapper pipeline replaces tx_mode/requires_tx. AlgorithmRegistry replaces handler_ref.

-- ============================================================
-- ACTION HANDLER ALGORITHM TYPE
-- ============================================================

INSERT INTO algorithm_type (id, name, description, java_interface) VALUES
  ('algtype-action-handler', 'Action Handler', 'Executes a PLM action (checkout, transition, sign, etc.)', 'com.plm.shared.action.ActionHandler');

-- ============================================================
-- ACTION HANDLER ALGORITHMS (one per built-in action)
-- ============================================================

INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-handler-checkout',    'algtype-action-handler', 'CHECKOUT',    'Checkout Handler',    'Open a node for editing',                           'checkoutActionHandler'),
  ('alg-handler-checkin',     'algtype-action-handler', 'CHECKIN',     'Checkin Handler',     'Commit this node and close its transaction',         'checkinActionHandler'),
  ('alg-handler-update-node', 'algtype-action-handler', 'UPDATE_NODE', 'Update Node Handler', 'Save attribute changes to the open version',         'updateNodeActionHandler'),
  ('alg-handler-transition',  'algtype-action-handler', 'TRANSITION',  'Transition Handler',  'Apply a lifecycle state transition',                 'transitionActionHandler'),
  ('alg-handler-sign',        'algtype-action-handler', 'SIGN',        'Sign Handler',        'Record an electronic signature',                    'signActionHandler'),
  ('alg-handler-create-link', 'algtype-action-handler', 'CREATE_LINK', 'Create Link Handler', 'Add a link to another node',                        'createLinkActionHandler'),
  ('alg-handler-update-link', 'algtype-action-handler', 'UPDATE_LINK', 'Update Link Handler', 'Modify link attributes',                            'updateLinkActionHandler'),
  ('alg-handler-delete-link', 'algtype-action-handler', 'DELETE_LINK', 'Delete Link Handler', 'Remove a link between nodes',                       'deleteLinkActionHandler'),
  ('alg-handler-baseline',    'algtype-action-handler', 'BASELINE',    'Baseline Handler',    'Tag a frozen tree as a baseline',                   'baselineActionHandler'),
  ('alg-handler-commit',      'algtype-action-handler', 'COMMIT',      'Commit Handler',      'Commit transaction',                                'commitActionHandler'),
  ('alg-handler-rollback',    'algtype-action-handler', 'ROLLBACK',    'Rollback Handler',    'Rollback transaction',                              'rollbackActionHandler'),
  ('alg-handler-cancel',      'algtype-action-handler', 'CANCEL',      'Cancel Handler',      'Release node from transaction',                     'cancelActionHandler');

-- ============================================================
-- WRAPPER INSTANCE PARAMETERS
-- Configure tx_mode per wrapper instance attachment.
-- Create separate TransactionWrapper instances per tx_mode.
-- ============================================================

-- Register the tx_mode parameter for the TransactionWrapper algorithm
INSERT INTO algorithm_parameter (id, algorithm_id, param_name, param_label, data_type, required, default_value, display_order) VALUES
  ('ap-tx-mode', 'alg-wrapper-transaction', 'tx_mode', 'Transaction Mode', 'STRING', 1, 'REQUIRED', 1);

-- Create wrapper instances per tx_mode
INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('wi-tx-none',      'alg-wrapper-transaction', 'Transaction: NONE'),
  ('wi-tx-required',  'alg-wrapper-transaction', 'Transaction: REQUIRED'),
  ('wi-tx-auto-open', 'alg-wrapper-transaction', 'Transaction: AUTO_OPEN'),
  ('wi-tx-isolated',  'alg-wrapper-transaction', 'Transaction: ISOLATED');

-- Set tx_mode param on each instance
INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value) VALUES
  ('pv-tx-none',      'wi-tx-none',      'ap-tx-mode', 'NONE'),
  ('pv-tx-required',  'wi-tx-required',  'ap-tx-mode', 'REQUIRED'),
  ('pv-tx-auto-open', 'wi-tx-auto-open', 'ap-tx-mode', 'AUTO_OPEN'),
  ('pv-tx-isolated',  'wi-tx-isolated',  'ap-tx-mode', 'ISOLATED');

-- ============================================================
-- UPDATE WRAPPER ATTACHMENTS to use typed instances
-- Replace the generic "wi-transaction" with the correct tx_mode instance
-- ============================================================

-- AUTO_OPEN actions
UPDATE action_wrapper SET algorithm_instance_id = 'wi-tx-auto-open' WHERE id IN ('aw-checkout-tx', 'aw-create-link-tx', 'aw-update-link-tx', 'aw-delete-link-tx');

-- REQUIRED actions
UPDATE action_wrapper SET algorithm_instance_id = 'wi-tx-required' WHERE id IN ('aw-checkin-tx', 'aw-update-node-tx', 'aw-commit-tx', 'aw-rollback-tx', 'aw-cancel-tx');

-- ISOLATED actions
UPDATE action_wrapper SET algorithm_instance_id = 'wi-tx-isolated' WHERE id IN ('aw-transition-tx', 'aw-sign-tx');

-- Remove the old generic instance (no longer used)
DELETE FROM algorithm_instance WHERE id = 'wi-transaction';

-- ============================================================
-- DROP LEGACY COLUMNS
-- ============================================================

ALTER TABLE action DROP COLUMN IF EXISTS tx_mode;
ALTER TABLE action DROP COLUMN IF EXISTS requires_tx;
ALTER TABLE action DROP COLUMN IF EXISTS handler_ref;
ALTER TABLE action DROP COLUMN IF EXISTS action_kind;
