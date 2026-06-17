-- ============================================================
-- Platform-API consolidated seed data
-- Net state after all migrations (V4-V21, excluding dropped tables).
-- All ON CONFLICT clauses are idempotent for auto-registration.
-- ============================================================

-- ============================================================
-- ALGORITHM TYPES
-- ============================================================

INSERT INTO algorithm_type (id, service_code, name, java_interface)
VALUES
  ('sys-handler-psm',        'psm',      'Action Handler',   'ActionHandler'),
  ('sys-guard-psm',          'psm',      'Action Guard',     'ActionGuard'),
  ('sys-wrapper-psm',        'psm',      'Action Wrapper',   'ActionWrapper'),
  ('algtype-lifecycle-guard','psm',      'Lifecycle Guard',  'LifecycleGuard'),
  ('algtype-source-resolver','psm',      'Source Resolver',  'SourceResolver')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ALGORITHMS — PSM handlers
-- ============================================================

INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES
  ('alg-psm-create-node',     'psm', 'sys-handler-psm', 'create_node',     'Create Node Handler',     'create_node',     'node'),
  ('alg-psm-read-node',       'psm', 'sys-handler-psm', 'read_node',       'Read Node Handler',       'read_node',       'node'),
  ('alg-psm-transition',      'psm', 'sys-handler-psm', 'transition',      'Transition Handler',      'transition',      'node'),
  ('alg-psm-update-node',     'psm', 'sys-handler-psm', 'update_node',     'Update Node Handler',     'update_node',     'node'),
  ('alg-psm-checkout',        'psm', 'sys-handler-psm', 'checkout',        'Checkout Handler',        'checkout',        'node'),
  ('alg-psm-checkin',         'psm', 'sys-handler-psm', 'checkin',         'Checkin Handler',         'checkin',         'node'),
  ('alg-psm-sign',            'psm', 'sys-handler-psm', 'sign',            'Sign Handler',            'sign',            'node'),
  ('alg-psm-create-link',     'psm', 'sys-handler-psm', 'create_link',     'Create Link Handler',     'create_link',     'node'),
  ('alg-psm-update-link',     'psm', 'sys-handler-psm', 'update_link',     'Update Link Handler',     'update_link',     'node'),
  ('alg-psm-delete-link',     'psm', 'sys-handler-psm', 'delete_link',     'Delete Link Handler',     'delete_link',     'node'),
  ('alg-psm-baseline',        'psm', 'sys-handler-psm', 'baseline',        'Baseline Handler',        'baseline',        'node'),
  ('alg-psm-assign-domain',   'psm', 'sys-handler-psm', 'assign_domain',   'Assign Domain Handler',   'assign_domain',   'node'),
  ('alg-psm-unassign-domain', 'psm', 'sys-handler-psm', 'unassign_domain', 'Unassign Domain Handler', 'unassign_domain', 'node'),
  ('alg-psm-abort',           'psm', 'sys-handler-psm', 'abort',           'Abort Handler',           'abort',           'node'),
  ('alg-psm-commit',          'psm', 'sys-handler-psm', 'commit',          'Commit Handler',          'commit',          'node'),
  ('alg-psm-rollback',        'psm', 'sys-handler-psm', 'rollback',        'Rollback Handler',        'rollback',        'node'),
  ('alg-psm-cad-import',      'psm', 'sys-handler-psm', 'cad-import',      'CAD Import Handler',      'cad-import',      'cad'),
  ('alg-psm-cad-import-create','psm','sys-handler-psm', 'cad-import-create','CAD Import — Create',    'cad-import-create','cad')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name;

-- PSM action guards
INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES
  ('alg-psm-g-not-frozen',                 'psm', 'sys-guard-psm', 'not_frozen',                 'Not Frozen',                'not_frozen',                 'node'),
  ('alg-psm-g-not-locked',                 'psm', 'sys-guard-psm', 'not_locked',                 'Not Locked',                'not_locked',                 'node'),
  ('alg-psm-g-from-state-match',           'psm', 'sys-guard-psm', 'from_state_match',           'From State Match',          'from_state_match',           'node'),
  ('alg-psm-g-transition-lifecycle-guard', 'psm', 'sys-guard-psm', 'transition_lifecycle_guard', 'Lifecycle Guards',          'transition_lifecycle_guard', 'node'),
  ('alg-psm-g-has-signature-requirement',  'psm', 'sys-guard-psm', 'has_signature_requirement',  'Has Signature Requirement', 'has_signature_requirement',  'node'),
  ('alg-psm-g-not-already-signed',         'psm', 'sys-guard-psm', 'not_already_signed',         'Not Already Signed',        'not_already_signed',         'node'),
  ('alg-psm-g-lock-owner-required',        'psm', 'sys-guard-psm', 'lock_owner_required',        'Lock Owner Required',       'lock_owner_required',        'node'),
  ('alg-psm-g-fingerprint-unchanged',      'psm', 'sys-guard-psm', 'fingerprint_unchanged',      'Fingerprint Unchanged',     'fingerprint_unchanged',      'node')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name;

-- PSM wrappers
INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES
  ('alg-psm-wrapper-lock',        'psm', 'sys-wrapper-psm', 'wrapper-lock',        'Lock Wrapper',        'wrapper-lock',        'node'),
  ('alg-psm-wrapper-transaction', 'psm', 'sys-wrapper-psm', 'wrapper-transaction', 'Transaction Wrapper', 'wrapper-transaction', 'node')
ON CONFLICT (id) DO NOTHING;

-- PSM lifecycle guards
INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES
  ('alg-psm-c-all-required-filled',       'psm', 'algtype-lifecycle-guard', 'all_required_filled',       'All Required Filled',      'all_required_filled',       'node'),
  ('alg-psm-c-all-signatures-done',       'psm', 'algtype-lifecycle-guard', 'all_signatures_done',       'All Signatures Done',      'all_signatures_done',       'node'),
  ('alg-psm-c-signature-rejection-check', 'psm', 'algtype-lifecycle-guard', 'signature_rejection_check', 'Signature Rejection Check','signature_rejection_check', 'node')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name;

-- PSM source resolvers
INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES
  ('alg-psm-c-self-node-resolver', 'psm', 'algtype-source-resolver', 'self_node_resolver', 'SELF Node Resolver', 'self_node_resolver', 'node'),
  ('alg-psm-c-data-resolver',      'psm', 'algtype-source-resolver', 'data_resolver',      'DST Data Resolver',  'data_resolver',      'node')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name;

-- ============================================================
-- ALGORITHM PARAMETERS
-- ============================================================

INSERT INTO algorithm_parameter (id, algorithm_id, param_name, param_label, data_type, required, default_value, display_order)
VALUES
  ('ap-wrapper-tx-mode',       'alg-psm-wrapper-transaction',        'tx_mode', 'Transaction Mode',    'STRING', 1, 'REQUIRED',    1),
  ('ap-psm-sig-rejection-mode','alg-psm-c-signature-rejection-check','mode',    'Rejection Check Mode','STRING', 1, NULL,          1)
ON CONFLICT (algorithm_id, param_name) DO NOTHING;

-- ============================================================
-- ALGORITHM INSTANCES
-- ============================================================

-- Handler instances
INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES
  ('ainst-psm-create-node',        'psm', 'alg-psm-create-node',        'Create Node Handler'),
  ('ainst-psm-read-node',          'psm', 'alg-psm-read-node',          'Read Node Handler'),
  ('ainst-psm-transition',         'psm', 'alg-psm-transition',         'Transition Handler'),
  ('ainst-psm-update-node',        'psm', 'alg-psm-update-node',        'Update Node Handler'),
  ('ainst-psm-checkout',           'psm', 'alg-psm-checkout',           'Checkout Handler'),
  ('ainst-psm-checkin',            'psm', 'alg-psm-checkin',            'Checkin Handler'),
  ('ainst-psm-sign',               'psm', 'alg-psm-sign',               'Sign Handler'),
  ('ainst-psm-create-link',        'psm', 'alg-psm-create-link',        'Create Link Handler'),
  ('ainst-psm-update-link',        'psm', 'alg-psm-update-link',        'Update Link Handler'),
  ('ainst-psm-delete-link',        'psm', 'alg-psm-delete-link',        'Delete Link Handler'),
  ('ainst-psm-baseline',           'psm', 'alg-psm-baseline',           'Baseline Handler'),
  ('ainst-psm-assign-domain',      'psm', 'alg-psm-assign-domain',      'Assign Domain Handler'),
  ('ainst-psm-unassign-domain',    'psm', 'alg-psm-unassign-domain',    'Unassign Domain Handler'),
  ('ainst-psm-abort',              'psm', 'alg-psm-abort',              'Abort Handler'),
  ('ainst-psm-commit',             'psm', 'alg-psm-commit',             'Commit Handler'),
  ('ainst-psm-rollback',           'psm', 'alg-psm-rollback',           'Rollback Handler'),
  ('ainst-psm-cad-import',         'psm', 'alg-psm-cad-import',         'CAD Import Handler'),
  ('ainst-psm-cad-import-create',  'psm', 'alg-psm-cad-import-create',  'CAD Import — Create')
ON CONFLICT (id) DO NOTHING;

-- Guard instances
INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES
  ('ainst-psm-g-not-frozen',                 'psm', 'alg-psm-g-not-frozen',                 'Not Frozen'),
  ('ainst-psm-g-not-locked',                 'psm', 'alg-psm-g-not-locked',                 'Not Locked'),
  ('ainst-psm-g-from-state-match',           'psm', 'alg-psm-g-from-state-match',           'From State Match'),
  ('ainst-psm-g-transition-lifecycle-guard', 'psm', 'alg-psm-g-transition-lifecycle-guard', 'Lifecycle Guards'),
  ('ainst-psm-g-has-signature-requirement',  'psm', 'alg-psm-g-has-signature-requirement',  'Has Signature Requirement'),
  ('ainst-psm-g-not-already-signed',         'psm', 'alg-psm-g-not-already-signed',         'Not Already Signed'),
  ('ainst-psm-g-lock-owner-required',        'psm', 'alg-psm-g-lock-owner-required',        'Lock Owner Required'),
  ('ainst-psm-g-fingerprint-unchanged',      'psm', 'alg-psm-g-fingerprint-unchanged',      'Fingerprint Unchanged')
ON CONFLICT (id) DO NOTHING;

-- Wrapper instances
INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES
  ('ainst-psm-wi-lock',         'psm', 'alg-psm-wrapper-lock',        'Lock Wrapper'),
  ('ainst-psm-wi-tx-auto-open', 'psm', 'alg-psm-wrapper-transaction', 'Transaction: AUTO_OPEN'),
  ('ainst-psm-wi-tx-isolated',  'psm', 'alg-psm-wrapper-transaction', 'Transaction: ISOLATED'),
  ('ainst-psm-wi-tx-required',  'psm', 'alg-psm-wrapper-transaction', 'Transaction: REQUIRED'),
  ('ainst-psm-wi-tx-none',      'psm', 'alg-psm-wrapper-transaction', 'Transaction: NONE')
ON CONFLICT (id) DO NOTHING;

-- Lifecycle guard instances
INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES
  ('ainst-psm-c-all-required-filled',      'psm', 'alg-psm-c-all-required-filled',       'All Required Filled'),
  ('ainst-psm-c-all-signatures-done',      'psm', 'alg-psm-c-all-signatures-done',        'All Signatures Done'),
  ('ainst-psm-c-sig-no-rejected',          'psm', 'alg-psm-c-signature-rejection-check',  'No Rejected Signatures'),
  ('ainst-psm-c-sig-has-rejected',         'psm', 'alg-psm-c-signature-rejection-check',  'Has Rejected Signature')
ON CONFLICT (id) DO NOTHING;

-- Source resolver instances
INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES
  ('ri-self-node',  'psm', 'alg-psm-c-self-node-resolver', 'SELF Node Resolver'),
  ('ri-data-local', 'psm', 'alg-psm-c-data-resolver',      'DST Data Resolver')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ALGORITHM INSTANCE PARAM VALUES
-- ============================================================

INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value)
VALUES
  ('aipv-tx-auto-open',       'ainst-psm-wi-tx-auto-open', 'ap-wrapper-tx-mode', 'AUTO_OPEN'),
  ('aipv-tx-isolated',        'ainst-psm-wi-tx-isolated',  'ap-wrapper-tx-mode', 'ISOLATED'),
  ('aipv-tx-required',        'ainst-psm-wi-tx-required',  'ap-wrapper-tx-mode', 'REQUIRED'),
  ('aipv-tx-none',            'ainst-psm-wi-tx-none',      'ap-wrapper-tx-mode', 'NONE'),
  ('aipv-psm-sig-no-rejected', 'ainst-psm-c-sig-no-rejected',  'ap-psm-sig-rejection-mode', 'NO_REJECTED'),
  ('aipv-psm-sig-has-rejected','ainst-psm-c-sig-has-rejected', 'ap-psm-sig-rejection-mode', 'HAS_REJECTED')
ON CONFLICT (algorithm_instance_id, algorithm_parameter_id) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- ACTIONS
-- delete_link and update_link use LINK scope (V12)
-- ============================================================

INSERT INTO action (id, service_code, action_code, scope, display_name, display_category, display_order, handler_instance_id)
VALUES
  ('act-psm-read',             'psm', 'read',             'GLOBAL',    'Read',             'STRUCTURAL', -30, NULL),
  ('act-psm-read-node',        'psm', 'read_node',        'NODE',      'Read Node',        'STRUCTURAL', -20, 'ainst-psm-read-node'),
  ('act-psm-create-node',      'psm', 'create_node',      'NODE_TYPE', 'Create Node',      'PRIMARY',      5, 'ainst-psm-create-node'),
  ('act-psm-transition',       'psm', 'transition',       'LIFECYCLE', 'Transition',       'PRIMARY',     10, 'ainst-psm-transition'),
  ('act-psm-update-node',      'psm', 'update_node',      'NODE',      'Update Node',      'SECONDARY',   50, 'ainst-psm-update-node'),
  ('act-psm-checkout',         'psm', 'checkout',         'NODE',      'Checkout',         'SECONDARY',  100, 'ainst-psm-checkout'),
  ('act-psm-checkin',          'psm', 'checkin',          'NODE',      'Checkin',          'SECONDARY',  110, 'ainst-psm-checkin'),
  ('act-psm-sign',             'psm', 'sign',             'NODE',      'Sign',             'PRIMARY',    200, 'ainst-psm-sign'),
  ('act-psm-create-link',      'psm', 'create_link',      'NODE',      'Create Link',      'SECONDARY',  300, 'ainst-psm-create-link'),
  ('act-psm-update-link',      'psm', 'update_link',      'LINK',      'Update Link',      'SECONDARY',  350, 'ainst-psm-update-link'),
  ('act-psm-delete-link',      'psm', 'delete_link',      'LINK',      'Delete Link',      'DANGEROUS',  360, 'ainst-psm-delete-link'),
  ('act-psm-baseline',         'psm', 'baseline',         'NODE',      'Baseline',         'SECONDARY',  400, 'ainst-psm-baseline'),
  ('act-psm-assign-domain',    'psm', 'assign_domain',    'NODE',      'Assign Domain',    'PROPERTY',   500, 'ainst-psm-assign-domain'),
  ('act-psm-unassign-domain',  'psm', 'unassign_domain',  'NODE',      'Unassign Domain',  'PROPERTY',   510, 'ainst-psm-unassign-domain'),
  ('act-psm-abort',            'psm', 'abort',            'NODE',      'Abort',            'DANGEROUS',  800, 'ainst-psm-abort'),
  ('act-psm-commit',           'psm', 'commit',           'TX',        'Commit',           'STRUCTURAL', 900, 'ainst-psm-commit'),
  ('act-psm-rollback',         'psm', 'rollback',         'TX',        'Rollback',         'STRUCTURAL', 910, 'ainst-psm-rollback'),
  ('act-psm-cad-import',       'psm', 'cad-import',       'NODE',      'Import CAD',       'PRIMARY',    150, 'ainst-psm-cad-import'),
  ('act-psm-cad-import-create','psm', 'cad-import-create','GLOBAL',    'Import from CAD',  'PRIMARY',    160, 'ainst-psm-cad-import-create')
ON CONFLICT (id) DO NOTHING;

-- DST actions
INSERT INTO action (id, service_code, action_code, scope, display_name, display_category, display_order, handler_instance_id)
VALUES
  ('act-dst-download', 'dst', 'DOWNLOAD', 'NODE', 'Download', 'PRIMARY',    50, 'ainst-dst-download'),
  ('act-dst-delete',   'dst', 'DELETE',   'NODE', 'Delete',   'DANGEROUS', 100, 'ainst-dst-delete')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ACTION PARAMETERS
-- ============================================================

INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, visibility, display_order, tooltip)
VALUES
  -- create_node (V8)
  ('ap-create-node-logical-id',  'act-psm-create-node', '_logicalId',  'Identifier',  'STRING', 1, 'TEXT', 'UI_VISIBLE', 1, 'Unique identifier for this node'),
  ('ap-create-node-external-id', 'act-psm-create-node', '_externalId', 'External ID', 'STRING', 0, 'TEXT', 'UI_VISIBLE', 2, 'Optional external reference'),
  -- checkin (V19)
  ('ap-psm-checkin-description', 'act-psm-checkin', '_description', 'Commit message', 'STRING', 1, 'TEXTAREA', 'UI_VISIBLE', 1, 'Describe what changed in this version'),
  -- sign (V21)
  ('ap-psm-sign-meaning', 'act-psm-sign', 'meaning', 'Decision', 'STRING', 1, 'DROPDOWN', 'UI_VISIBLE', 0, 'Approve or reject this version'),
  ('ap-psm-sign-comment', 'act-psm-sign', 'comment', 'Comment',  'STRING', 0, 'TEXTAREA', 'UI_VISIBLE', 1, 'Optional justification for your decision'),
  -- assign/unassign domain (V16)
  ('ap-assign-domain-id',   'act-psm-assign-domain',   'domainId', 'Domain', 'STRING', 1, 'DROPDOWN', 'UI_VISIBLE', 0, 'Select the domain to assign to this node'),
  ('ap-unassign-domain-id', 'act-psm-unassign-domain', 'domainId', 'Domain', 'STRING', 1, 'DROPDOWN', 'UI_VISIBLE', 0, 'Select the domain to remove from this node'),
  -- cad-import (V15)
  ('ap-cad-import-file', 'act-psm-cad-import', 'file',        'CAD File',       'FILE',   1, 'FILE',     'UI_VISIBLE', 1, 'STEP (.step/.stp), CATIA V5 (.CATProduct/.CATPart), or ZIP'),
  ('ap-cad-import-ctx',  'act-psm-cad-import', 'contextCode', 'Import Context', 'STRING', 0, 'DROPDOWN', 'UI_VISIBLE', 2, 'Select the import context to apply'),
  -- cad-import-create (V18)
  ('ap-cad-import-create-file', 'act-psm-cad-import-create', 'file',        'CAD File',       'FILE',   1, 'FILE',     'UI_VISIBLE', 1, 'STEP (.step/.stp) or CATIA V5 (.CATProduct/.CATPart)'),
  ('ap-cad-import-create-ctx',  'act-psm-cad-import-create', 'contextCode', 'Import Context', 'STRING', 0, 'DROPDOWN', 'UI_VISIBLE', 2, 'Select the import context to apply')
ON CONFLICT (id) DO NOTHING;

UPDATE action_parameter
SET allowed_values = '[{"value":"APPROVED","label":"Approve"},{"value":"REJECTED","label":"Reject"}]'
WHERE id = 'ap-psm-sign-meaning';

-- ============================================================
-- ACTION REQUIRED PERMISSIONS
-- ============================================================

INSERT INTO action_required_permission (id, action_id, permission_code)
VALUES
  ('arp-psm-checkout',             'act-psm-checkout',        'UPDATE_NODE'),
  ('arp-psm-checkin',              'act-psm-checkin',         'UPDATE_NODE'),
  ('arp-psm-update-node',          'act-psm-update-node',     'UPDATE_NODE'),
  ('arp-psm-create-link',          'act-psm-create-link',     'UPDATE_NODE'),
  ('arp-psm-update-link',          'act-psm-update-link',     'UPDATE_NODE'),
  ('arp-psm-delete-link',          'act-psm-delete-link',     'UPDATE_NODE'),
  ('arp-psm-abort',                'act-psm-abort',           'UPDATE_NODE'),
  ('arp-psm-transition',           'act-psm-transition',      'TRANSITION'),
  ('arp-psm-sign',                 'act-psm-sign',            'SIGN'),
  ('arp-psm-commit',               'act-psm-commit',          'UPDATE'),
  ('arp-psm-rollback',             'act-psm-rollback',        'UPDATE'),
  ('arp-psm-baseline',             'act-psm-baseline',        'MANAGE_BASELINES'),
  ('arp-psm-create-node-update',   'act-psm-create-node',     'UPDATE'),
  ('arp-psm-create-node-create',   'act-psm-create-node',     'CREATE_NODE'),
  ('arp-psm-assign-domain',        'act-psm-assign-domain',   'UPDATE_NODE'),
  ('arp-psm-unassign-domain',      'act-psm-unassign-domain', 'UPDATE_NODE'),
  ('arp-psm-cad-import',           'act-psm-cad-import',      'CAD_IMPORT'),
  ('arp-psm-cad-import-create',    'act-psm-cad-import-create','CAD_IMPORT')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ACTION GUARDS
-- ============================================================

INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order)
VALUES
  ('ag-psm-checkout-not-frozen',    'act-psm-checkout',        'ainst-psm-g-not-frozen',                    'HIDE',  0),
  ('ag-psm-checkout-not-locked',    'act-psm-checkout',        'ainst-psm-g-not-locked',                    'HIDE',  1),
  ('ag-psm-transition-from-state',  'act-psm-transition',      'ainst-psm-g-from-state-match',              'HIDE',  0),
  ('ag-psm-transition-not-locked',  'act-psm-transition',      'ainst-psm-g-not-locked',                    'HIDE',  1),
  ('ag-psm-transition-lc-guard',    'act-psm-transition',      'ainst-psm-g-transition-lifecycle-guard',    'BLOCK', 2),
  ('ag-psm-sign-has-sig-req',       'act-psm-sign',            'ainst-psm-g-has-signature-requirement',     'HIDE',  0),
  ('ag-psm-sign-not-already-signed','act-psm-sign',            'ainst-psm-g-not-already-signed',            'HIDE',  1),
  ('ag-psm-checkin-lock-owner',     'act-psm-checkin',         'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-checkin-fingerprint',    'act-psm-checkin',         'ainst-psm-g-fingerprint-unchanged',         'BLOCK', 1),
  ('ag-psm-abort-lock-owner',       'act-psm-abort',           'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-update-node-lock-owner', 'act-psm-update-node',     'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-create-link-lock-owner', 'act-psm-create-link',     'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-update-link-lock-owner', 'act-psm-update-link',     'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-delete-link-lock-owner', 'act-psm-delete-link',     'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-assign-domain-lock',     'act-psm-assign-domain',   'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-unassign-domain-lock',   'act-psm-unassign-domain', 'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-cad-import-lock-owner',  'act-psm-cad-import',      'ainst-psm-g-lock-owner-required',           'HIDE',  1),
  ('ag-dst-download-file-exists',   'act-dst-download',        'ainst-dst-g-dst-file-exists',               'HIDE',  0),
  ('ag-dst-delete-file-exists',     'act-dst-delete',          'ainst-dst-g-dst-file-exists',               'HIDE',  0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ACTION WRAPPERS
-- ============================================================

INSERT INTO action_wrapper (id, service_code, action_id, algorithm_instance_id, execution_order)
VALUES
  ('aw-psm-checkout-tx',           'psm', 'act-psm-checkout',        'ainst-psm-wi-tx-auto-open', 10),
  ('aw-psm-transition-lock',       'psm', 'act-psm-transition',      'ainst-psm-wi-lock',         10),
  ('aw-psm-transition-tx',         'psm', 'act-psm-transition',      'ainst-psm-wi-tx-isolated',  20),
  ('aw-psm-checkin-tx',            'psm', 'act-psm-checkin',         'ainst-psm-wi-tx-required',  10),
  ('aw-psm-abort-tx',              'psm', 'act-psm-abort',           'ainst-psm-wi-tx-required',  10),
  ('aw-psm-update-node-tx',        'psm', 'act-psm-update-node',     'ainst-psm-wi-tx-required',  10),
  ('aw-psm-create-node-tx',        'psm', 'act-psm-create-node',     'ainst-psm-wi-tx-auto-open', 10),
  ('aw-psm-commit-tx',             'psm', 'act-psm-commit',          'ainst-psm-wi-tx-required',  10),
  ('aw-psm-rollback-tx',           'psm', 'act-psm-rollback',        'ainst-psm-wi-tx-required',  10),
  ('aw-psm-create-link-tx',        'psm', 'act-psm-create-link',     'ainst-psm-wi-tx-auto-open', 10),
  ('aw-psm-update-link-tx',        'psm', 'act-psm-update-link',     'ainst-psm-wi-tx-auto-open', 10),
  ('aw-psm-delete-link-tx',        'psm', 'act-psm-delete-link',     'ainst-psm-wi-tx-auto-open', 10),
  ('aw-psm-assign-domain-tx',      'psm', 'act-psm-assign-domain',   'ainst-psm-wi-tx-required',  10),
  ('aw-psm-unassign-domain-tx',    'psm', 'act-psm-unassign-domain', 'ainst-psm-wi-tx-required',  10),
  ('aw-psm-cad-import-tx',         'psm', 'act-psm-cad-import',      'ainst-psm-wi-tx-required',  10),
  ('aw-psm-cad-import-create-tx',  'psm', 'act-psm-cad-import-create','ainst-psm-wi-tx-auto-open',10)
ON CONFLICT (id) DO NOTHING;
