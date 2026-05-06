-- ============================================================
-- Seed PSM action handler and guard algorithm types, algorithms,
-- and instances so the config snapshot is complete even before
-- psm-api registers at startup.
--
-- IDs match ActionCatalogRegistryController.persistToDB() naming:
--   handler: sys-handler-psm type, alg-psm-{safe}, ainst-psm-{safe}
--   guard:   sys-guard-psm type,   alg-psm-g-{safe}, ainst-psm-g-{safe}
--   where safe = code.toLowerCase().replace('_', '-')
--
-- ON CONFLICT clauses are no-ops when psm-api auto-registration
-- has already run.
-- ============================================================

-- Algorithm types
INSERT INTO algorithm_type (id, service_code, name, java_interface)
VALUES
  ('sys-handler-psm', 'psm', 'Action Handler', 'ActionHandler'),
  ('sys-guard-psm',   'psm', 'Action Guard',   'ActionGuard')
ON CONFLICT (id) DO NOTHING;

-- Handler algorithms
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
  ('alg-psm-rollback',        'psm', 'sys-handler-psm', 'rollback',        'Rollback Handler',        'rollback',        'node')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name;

-- Guard algorithms
INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES
  ('alg-psm-g-not-frozen',                 'psm', 'sys-guard-psm', 'not_frozen',                 'Not Frozen',                 'not_frozen',                 'node'),
  ('alg-psm-g-not-locked',                 'psm', 'sys-guard-psm', 'not_locked',                 'Not Locked',                 'not_locked',                 'node'),
  ('alg-psm-g-from-state-match',           'psm', 'sys-guard-psm', 'from_state_match',           'From State Match',           'from_state_match',           'node'),
  ('alg-psm-g-transition-lifecycle-guard', 'psm', 'sys-guard-psm', 'transition_lifecycle_guard', 'Lifecycle Guards',           'transition_lifecycle_guard', 'node'),
  ('alg-psm-g-has-signature-requirement',  'psm', 'sys-guard-psm', 'has_signature_requirement',  'Has Signature Requirement',  'has_signature_requirement',  'node'),
  ('alg-psm-g-not-already-signed',         'psm', 'sys-guard-psm', 'not_already_signed',         'Not Already Signed',         'not_already_signed',         'node'),
  ('alg-psm-g-lock-owner-required',        'psm', 'sys-guard-psm', 'lock_owner_required',        'Lock Owner Required',        'lock_owner_required',        'node'),
  ('alg-psm-g-fingerprint-unchanged',      'psm', 'sys-guard-psm', 'fingerprint_unchanged',      'Fingerprint Unchanged',      'fingerprint_unchanged',      'node')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name;

-- Handler instances
INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES
  ('ainst-psm-create-node',     'psm', 'alg-psm-create-node',     'Create Node Handler'),
  ('ainst-psm-read-node',       'psm', 'alg-psm-read-node',       'Read Node Handler'),
  ('ainst-psm-transition',      'psm', 'alg-psm-transition',      'Transition Handler'),
  ('ainst-psm-update-node',     'psm', 'alg-psm-update-node',     'Update Node Handler'),
  ('ainst-psm-checkout',        'psm', 'alg-psm-checkout',        'Checkout Handler'),
  ('ainst-psm-checkin',         'psm', 'alg-psm-checkin',         'Checkin Handler'),
  ('ainst-psm-sign',            'psm', 'alg-psm-sign',            'Sign Handler'),
  ('ainst-psm-create-link',     'psm', 'alg-psm-create-link',     'Create Link Handler'),
  ('ainst-psm-update-link',     'psm', 'alg-psm-update-link',     'Update Link Handler'),
  ('ainst-psm-delete-link',     'psm', 'alg-psm-delete-link',     'Delete Link Handler'),
  ('ainst-psm-baseline',        'psm', 'alg-psm-baseline',        'Baseline Handler'),
  ('ainst-psm-assign-domain',   'psm', 'alg-psm-assign-domain',   'Assign Domain Handler'),
  ('ainst-psm-unassign-domain', 'psm', 'alg-psm-unassign-domain', 'Unassign Domain Handler'),
  ('ainst-psm-abort',           'psm', 'alg-psm-abort',           'Abort Handler'),
  ('ainst-psm-commit',          'psm', 'alg-psm-commit',          'Commit Handler'),
  ('ainst-psm-rollback',        'psm', 'alg-psm-rollback',        'Rollback Handler')
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
