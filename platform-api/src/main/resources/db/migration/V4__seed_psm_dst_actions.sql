-- ============================================================
-- PSM Action Catalog seed
-- Algorithms/instances (handlers + guards) are auto-seeded on
-- service startup. This migration adds:
--   - Wrapper algorithm type + algorithms + instances
--   - Actions with proper scope/displayCategory/displayOrder
--   - action_guard attachments
--   - action_wrapper attachments
--
-- FK constraints on algorithm_instance_id / handler_instance_id are
-- dropped here because these IDs are auto-registered at service startup
-- (after Flyway runs) — a DB-level FK cannot be enforced at migration time.
-- These become soft references (opaque VARCHAR, validated at runtime).
-- ============================================================

-- Drop FKs referencing auto-registered algorithm instances
ALTER TABLE action                    DROP CONSTRAINT IF EXISTS action_handler_instance_id_fkey;
ALTER TABLE action_guard              DROP CONSTRAINT IF EXISTS action_guard_algorithm_instance_id_fkey;
ALTER TABLE lifecycle_transition_guard DROP CONSTRAINT IF EXISTS lifecycle_transition_guard_algorithm_instance_id_fkey;
ALTER TABLE action_wrapper            DROP CONSTRAINT IF EXISTS action_wrapper_algorithm_instance_id_fkey;

-- === WRAPPER ALGORITHM TYPE ===
INSERT INTO algorithm_type (id, service_code, name, java_interface)
VALUES ('sys-wrapper-psm', 'psm', 'Action Wrapper', 'ActionWrapper')
ON CONFLICT (id) DO NOTHING;

-- === WRAPPER ALGORITHMS ===
INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES
  ('alg-psm-wrapper-lock',        'psm', 'sys-wrapper-psm', 'wrapper-lock',        'Lock Wrapper',        'wrapper-lock',        'node'),
  ('alg-psm-wrapper-transaction', 'psm', 'sys-wrapper-psm', 'wrapper-transaction', 'Transaction Wrapper', 'wrapper-transaction', 'node')
ON CONFLICT (id) DO NOTHING;

-- === WRAPPER INSTANCES ===
INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES
  ('ainst-psm-wi-lock',         'psm', 'alg-psm-wrapper-lock',        'Lock Wrapper'),
  ('ainst-psm-wi-tx-auto-open', 'psm', 'alg-psm-wrapper-transaction', 'Transaction: AUTO_OPEN'),
  ('ainst-psm-wi-tx-isolated',  'psm', 'alg-psm-wrapper-transaction', 'Transaction: ISOLATED'),
  ('ainst-psm-wi-tx-required',  'psm', 'alg-psm-wrapper-transaction', 'Transaction: REQUIRED'),
  ('ainst-psm-wi-tx-none',      'psm', 'alg-psm-wrapper-transaction', 'Transaction: NONE')
ON CONFLICT (id) DO NOTHING;

-- === PSM ACTIONS ===
-- handler_instance_id → algorithm_instance auto-created on service startup
INSERT INTO action (id, service_code, action_code, scope, display_name, display_category, display_order, handler_instance_id)
VALUES
  ('act-psm-read',            'psm', 'read',            'GLOBAL',    'Read',            'STRUCTURAL', -30, NULL),
  ('act-psm-read-node',       'psm', 'read_node',       'NODE',      'Read Node',       'STRUCTURAL', -20, 'ainst-psm-read-node'),
  ('act-psm-create-node',     'psm', 'create_node',     'NODE_TYPE', 'Create Node',     'PRIMARY',      5, 'ainst-psm-create-node'),
  ('act-psm-transition',      'psm', 'transition',      'LIFECYCLE', 'Transition',      'PRIMARY',     10, 'ainst-psm-transition'),
  ('act-psm-update-node',     'psm', 'update_node',     'NODE',      'Update Node',     'SECONDARY',   50, 'ainst-psm-update-node'),
  ('act-psm-checkout',        'psm', 'checkout',        'NODE',      'Checkout',        'SECONDARY',  100, 'ainst-psm-checkout'),
  ('act-psm-checkin',         'psm', 'checkin',         'NODE',      'Checkin',         'SECONDARY',  110, 'ainst-psm-checkin'),
  ('act-psm-sign',            'psm', 'sign',            'NODE',      'Sign',            'PRIMARY',    200, 'ainst-psm-sign'),
  ('act-psm-create-link',     'psm', 'create_link',     'NODE',      'Create Link',     'SECONDARY',  300, 'ainst-psm-create-link'),
  ('act-psm-update-link',     'psm', 'update_link',     'NODE',      'Update Link',     'SECONDARY',  350, 'ainst-psm-update-link'),
  ('act-psm-delete-link',     'psm', 'delete_link',     'NODE',      'Delete Link',     'DANGEROUS',  360, 'ainst-psm-delete-link'),
  ('act-psm-baseline',        'psm', 'baseline',        'NODE',      'Baseline',        'SECONDARY',  400, 'ainst-psm-baseline'),
  ('act-psm-assign-domain',   'psm', 'assign_domain',   'NODE',      'Assign Domain',   'PROPERTY',   500, 'ainst-psm-assign-domain'),
  ('act-psm-unassign-domain', 'psm', 'unassign_domain', 'NODE',      'Unassign Domain', 'PROPERTY',   510, 'ainst-psm-unassign-domain'),
  ('act-psm-abort',           'psm', 'abort',           'NODE',      'Abort',           'DANGEROUS',  800, 'ainst-psm-abort'),
  ('act-psm-commit',          'psm', 'commit',          'TX',        'Commit',          'STRUCTURAL', 900, 'ainst-psm-commit'),
  ('act-psm-rollback',        'psm', 'rollback',        'TX',        'Rollback',        'STRUCTURAL', 910, 'ainst-psm-rollback')
ON CONFLICT (id) DO NOTHING;

-- === PSM ACTION GUARDS ===
INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order)
VALUES
  -- checkout: must not be frozen, must not be locked
  ('ag-psm-checkout-not-frozen',    'act-psm-checkout',        'ainst-psm-g-not-frozen',                    'HIDE',  0),
  ('ag-psm-checkout-not-locked',    'act-psm-checkout',        'ainst-psm-g-not-locked',                    'HIDE',  1),
  -- transition: state match + not locked + lifecycle-level guard
  ('ag-psm-transition-from-state',  'act-psm-transition',      'ainst-psm-g-from-state-match',              'HIDE',  0),
  ('ag-psm-transition-not-locked',  'act-psm-transition',      'ainst-psm-g-not-locked',                    'HIDE',  1),
  ('ag-psm-transition-lc-guard',    'act-psm-transition',      'ainst-psm-g-transition-lifecycle-guard',    'BLOCK', 2),
  -- sign
  ('ag-psm-sign-has-sig-req',       'act-psm-sign',            'ainst-psm-g-has-signature-requirement',     'HIDE',  0),
  ('ag-psm-sign-not-already-signed','act-psm-sign',            'ainst-psm-g-not-already-signed',            'HIDE',  1),
  -- checkin: lock owner + fingerprint integrity
  ('ag-psm-checkin-lock-owner',     'act-psm-checkin',         'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-checkin-fingerprint',    'act-psm-checkin',         'ainst-psm-g-fingerprint-unchanged',         'BLOCK', 1),
  -- abort / update_node / link ops / domain ops: lock owner required
  ('ag-psm-abort-lock-owner',       'act-psm-abort',           'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-update-node-lock-owner', 'act-psm-update-node',     'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-create-link-lock-owner', 'act-psm-create-link',     'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-update-link-lock-owner', 'act-psm-update-link',     'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-delete-link-lock-owner', 'act-psm-delete-link',     'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-assign-domain-lock',     'act-psm-assign-domain',   'ainst-psm-g-lock-owner-required',           'HIDE',  0),
  ('ag-psm-unassign-domain-lock',   'act-psm-unassign-domain', 'ainst-psm-g-lock-owner-required',           'HIDE',  0)
ON CONFLICT (id) DO NOTHING;

-- === PSM ACTION WRAPPERS ===
INSERT INTO action_wrapper (id, service_code, action_id, algorithm_instance_id, execution_order)
VALUES
  ('aw-psm-checkout-tx',        'psm', 'act-psm-checkout',        'ainst-psm-wi-tx-auto-open', 10),
  ('aw-psm-transition-lock',    'psm', 'act-psm-transition',      'ainst-psm-wi-lock',         10),
  ('aw-psm-transition-tx',      'psm', 'act-psm-transition',      'ainst-psm-wi-tx-isolated',  20),
  ('aw-psm-checkin-tx',         'psm', 'act-psm-checkin',         'ainst-psm-wi-tx-required',  10),
  ('aw-psm-abort-tx',           'psm', 'act-psm-abort',           'ainst-psm-wi-tx-required',  10),
  ('aw-psm-update-node-tx',     'psm', 'act-psm-update-node',     'ainst-psm-wi-tx-required',  10),
  ('aw-psm-create-node-tx',     'psm', 'act-psm-create-node',     'ainst-psm-wi-tx-auto-open', 10),
  ('aw-psm-commit-tx',          'psm', 'act-psm-commit',          'ainst-psm-wi-tx-required',  10),
  ('aw-psm-rollback-tx',        'psm', 'act-psm-rollback',        'ainst-psm-wi-tx-required',  10),
  ('aw-psm-create-link-tx',     'psm', 'act-psm-create-link',     'ainst-psm-wi-tx-auto-open', 10),
  ('aw-psm-update-link-tx',     'psm', 'act-psm-update-link',     'ainst-psm-wi-tx-auto-open', 10),
  ('aw-psm-delete-link-tx',     'psm', 'act-psm-delete-link',     'ainst-psm-wi-tx-auto-open', 10),
  ('aw-psm-assign-domain-tx',   'psm', 'act-psm-assign-domain',   'ainst-psm-wi-tx-required',  10),
  ('aw-psm-unassign-domain-tx', 'psm', 'act-psm-unassign-domain', 'ainst-psm-wi-tx-required',  10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DST Action Catalog seed
-- Algorithms/instances auto-seeded on startup.
-- ============================================================

-- === DST ACTIONS ===
INSERT INTO action (id, service_code, action_code, scope, display_name, display_category, display_order, handler_instance_id)
VALUES
  ('act-dst-download', 'dst', 'DOWNLOAD', 'NODE', 'Download', 'PRIMARY',    50, 'ainst-dst-download'),
  ('act-dst-delete',   'dst', 'DELETE',   'NODE', 'Delete',   'DANGEROUS', 100, 'ainst-dst-delete')
ON CONFLICT (id) DO NOTHING;

-- === DST ACTION GUARDS ===
INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order)
VALUES
  ('ag-dst-download-file-exists', 'act-dst-download', 'ainst-dst-g-dst-file-exists', 'HIDE', 0),
  ('ag-dst-delete-file-exists',   'act-dst-delete',   'ainst-dst-g-dst-file-exists', 'HIDE', 0)
ON CONFLICT (id) DO NOTHING;
