-- ============================================================
-- ACTION MODULE SEED
-- Actions, parameters, guards (tier 1), wrappers
-- ============================================================

-- ============================================================
-- ACTION CATALOG
-- ============================================================

INSERT INTO action (id, action_code, scope, display_name, description, display_category, display_order, handler_instance_id) VALUES
  -- Structural permission anchors (hidden from UI)
  ('act-read',             'READ_NODE',        'NODE',      'Read Node',                    'Per-node-type read access to nodes',                                             'STRUCTURAL', -20, NULL),
  ('act-read-global',      'READ',             'GLOBAL',    'Read',                         'Global read access to views and lists',                                          'STRUCTURAL', -30, NULL),
  ('act-manage-metamodel', 'MANAGE_METAMODEL', 'GLOBAL',    'Manage Metamodel',             'Create/update/delete lifecycle, node types, link types, attribute definitions',   'STRUCTURAL',   0, NULL),
  ('act-manage-roles',     'MANAGE_ROLES',     'GLOBAL',    'Manage Roles & Permissions',   'Configure action permissions, views, and view overrides',                        'STRUCTURAL',   0, NULL),
  ('act-manage-baselines', 'MANAGE_BASELINES', 'GLOBAL',    'Manage Baselines',             'Create baselines (service-level, outside action dispatch)',                      'STRUCTURAL',   0, NULL),
  ('act-manage-lifecycle', 'MANAGE_LIFECYCLE', 'GLOBAL',    'Manage Lifecycle',             'Create/update/delete lifecycles, states, transitions, signature requirements',   'STRUCTURAL',   0, NULL),
  -- Operational actions
  ('act-checkout',    'CHECKOUT',    'NODE',      'Checkout',        'Open a node for editing',                    'SECONDARY',  100, 'hi-checkout'),
  ('act-checkin',     'CHECKIN',     'NODE',      'Check In',        'Commit this node and close its transaction', 'SECONDARY',  110, 'hi-checkin'),
  ('act-update-node', 'UPDATE_NODE', 'NODE',      'Update Node',     'Save attribute changes to the open version', 'SECONDARY',   50, 'hi-update-node'),
  ('act-transition',  'TRANSITION',  'LIFECYCLE', 'Transition',      'Apply a lifecycle state transition',         'PRIMARY',     10, 'hi-transition'),
  ('act-sign',        'SIGN',        'NODE',      'Sign',            'Record an electronic signature',             'PRIMARY',    200, 'hi-sign'),
  ('act-create-link', 'CREATE_LINK', 'NODE',      'Create Link',     'Add a link to another node',                 'SECONDARY',  300, 'hi-create-link'),
  ('act-update-link', 'UPDATE_LINK', 'NODE',      'Update Link',     'Modify link attributes',                     'SECONDARY',  350, 'hi-update-link'),
  ('act-delete-link', 'DELETE_LINK', 'NODE',      'Delete Link',     'Remove a link between nodes',                'DANGEROUS',  360, 'hi-delete-link'),
  ('act-baseline',    'BASELINE',    'NODE',      'Create Baseline', 'Tag a frozen tree as a baseline',            'SECONDARY',  400, 'hi-baseline'),
  -- TX-scope actions
  ('act-commit',      'COMMIT',      'TX',        'Commit',          'Commit transaction',                         'STRUCTURAL', 900, 'hi-commit'),
  ('act-rollback',    'ROLLBACK',    'TX',        'Rollback',        'Rollback transaction',                       'STRUCTURAL', 910, 'hi-rollback'),
  -- NODE-scope abort
  ('act-abort',       'ABORT',       'NODE',      'Abort',           'Abort node editing and release from tx',     'DANGEROUS',  800, 'hi-abort');

-- ============================================================
-- ACTION PARAMETERS
-- ============================================================

-- SIGN
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, default_value, allowed_values, widget_type, display_order) VALUES
  ('nap-sign-meaning', 'act-sign', 'meaning', 'Meaning', 'ENUM',   1, 'Approved', '["Approved","Rejected"]', 'DROPDOWN', 1),
  ('nap-sign-comment', 'act-sign', 'comment', 'Comment', 'STRING', 0, NULL,       NULL,                      'TEXTAREA', 2);

-- BASELINE
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-bl-name', 'act-baseline', 'name',        'Baseline Name', 'STRING', 1, 'TEXT',     1),
  ('nap-bl-desc', 'act-baseline', 'description', 'Description',   'STRING', 0, 'TEXTAREA', 2);

-- CREATE_LINK
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-lnk-type',   'act-create-link', 'linkTypeId',    'Link Type',   'ENUM',     1, 'DROPDOWN', 1),
  ('nap-lnk-target', 'act-create-link', 'targetNodeId',  'Target Node', 'NODE_REF', 1, 'DROPDOWN', 2),
  ('nap-lnk-lid',    'act-create-link', 'linkLogicalId', 'Link ID',     'STRING',   1, 'TEXT',     3);

-- UPDATE_LINK
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-ul-linkid', 'act-update-link', 'linkId',    'Link ID',         'STRING', 1, 'TEXT', 1),
  ('nap-ul-logid',  'act-update-link', 'logicalId', 'Link Logical ID', 'STRING', 0, 'TEXT', 2);

-- DELETE_LINK
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-dl-linkid', 'act-delete-link', 'linkId', 'Link ID', 'STRING', 1, 'TEXT', 1);

-- COMMIT
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order, visibility) VALUES
  ('ap-commit-comment', 'act-commit', 'comment', 'Commit message', 'STRING', 1, 'TEXT', 1, 'UI_VISIBLE');

-- CHECKIN
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order, visibility) VALUES
  ('ap-checkin-comment', 'act-checkin', 'comment', 'Commit message', 'STRING', 1, 'TEXT', 1, 'UI_VISIBLE');

-- ============================================================
-- ACTION-LEVEL GUARDS (tier 1)
-- ============================================================

INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES
  -- CHECKOUT: not_frozen, not_locked
  ('ag-checkout-frozen',     'act-checkout',    'gi-not-frozen',                     'HIDE',  1),
  ('ag-checkout-locked',     'act-checkout',    'gi-not-locked',                     'HIDE',  2),
  -- CHECKIN: lock_owner_required, fingerprint_unchanged
  ('ag-checkin-owner',       'act-checkin',     'gi-lock-owner',                     'HIDE',  1),
  ('ag-checkin-fp',          'act-checkin',     'gi-fp-unchanged',                   'BLOCK', 10),
  -- UPDATE_NODE, CREATE_LINK, UPDATE_LINK, DELETE_LINK: lock_owner_required
  ('ag-update-owner',        'act-update-node', 'gi-lock-owner',                     'HIDE',  1),
  ('ag-clink-owner',         'act-create-link', 'gi-lock-owner',                     'HIDE',  1),
  ('ag-ulink-owner',         'act-update-link', 'gi-lock-owner',                     'HIDE',  1),
  ('ag-dlink-owner',         'act-delete-link', 'gi-lock-owner',                     'HIDE',  1),
  -- TRANSITION: from_state_match, not_locked, lifecycle_guards
  ('ag-trans-state',         'act-transition',  'gi-from-state',                     'HIDE',  1),
  ('ag-trans-locked',        'act-transition',  'gi-not-locked',                     'HIDE',  2),
  ('ag-transition-lifecycle','act-transition',  'alginst-transition-lifecycle-guard', 'BLOCK', 100),
  -- SIGN: has_signature_requirement, not_already_signed
  ('ag-sign-req',            'act-sign',        'gi-has-sig-req',                    'HIDE',  1),
  ('ag-sign-already',        'act-sign',        'gi-not-already-signed',             'HIDE',  2),
  -- ABORT: lock_owner_required
  ('ag-abort-lock-owner',    'act-abort',       'gi-lock-owner',                     'HIDE',  1);

-- ============================================================
-- ACTION WRAPPERS
-- ============================================================

INSERT INTO action_wrapper (id, action_id, algorithm_instance_id, execution_order) VALUES
  -- ISOLATED: lock first, then transaction
  ('aw-transition-lock', 'act-transition', 'wi-lock',        10),
  ('aw-transition-tx',   'act-transition', 'wi-tx-isolated', 20),
  -- SIGN: no wrappers (lightweight per-version operation)
  -- AUTO_OPEN: transaction only
  ('aw-checkout-tx',     'act-checkout',    'wi-tx-auto-open', 10),
  ('aw-create-link-tx',  'act-create-link', 'wi-tx-auto-open', 10),
  ('aw-update-link-tx',  'act-update-link', 'wi-tx-auto-open', 10),
  ('aw-delete-link-tx',  'act-delete-link', 'wi-tx-auto-open', 10),
  -- REQUIRED: transaction only
  ('aw-checkin-tx',      'act-checkin',     'wi-tx-required', 10),
  ('aw-update-node-tx',  'act-update-node', 'wi-tx-required', 10),
  ('aw-commit-tx',       'act-commit',      'wi-tx-required', 10),
  ('aw-rollback-tx',     'act-rollback',    'wi-tx-required', 10),
  ('aw-abort-tx',        'act-abort',       'wi-tx-required', 10);
