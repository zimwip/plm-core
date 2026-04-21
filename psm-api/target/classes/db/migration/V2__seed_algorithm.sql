-- ============================================================
-- ALGORITHM MODULE SEED
-- Types, algorithms, parameters, instances, param values
-- ============================================================

-- ============================================================
-- ALGORITHM TYPES
-- ============================================================

INSERT INTO algorithm_type (id, name, description, java_interface) VALUES
  ('algtype-action-guard',    'Action Guard',    'Checks node/action state preconditions (frozen, locked, ownership)',       'com.plm.domain.guard.Guard'),
  ('algtype-lifecycle-guard', 'Lifecycle Guard', 'Checks lifecycle transition preconditions (required fields, signatures)', 'com.plm.domain.guard.Guard'),
  ('algtype-state-action',    'State Action',    'Actions executed when entering or exiting a lifecycle state',             'com.plm.domain.stateaction.StateAction'),
  ('algtype-action-wrapper',  'Action Wrapper',  'Middleware wrapping action execution (transaction, lock, etc.)',          'com.plm.action.ActionWrapper'),
  ('algtype-action-handler',  'Action Handler',  'Executes a PLM action (checkout, transition, sign, etc.)',               'com.plm.shared.action.ActionHandler');

-- ============================================================
-- GUARD ALGORITHMS
-- ============================================================

INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  -- Action Guards
  ('alg-not-frozen',          'algtype-action-guard', 'not_frozen',                'Not Frozen',                'Node must not be in a frozen lifecycle state',                  'notFrozenGuard'),
  ('alg-not-locked',          'algtype-action-guard', 'not_locked',                'Not Locked',                'Node must not be locked by any user',                           'notLockedGuard'),
  ('alg-lock-owner-required', 'algtype-action-guard', 'lock_owner_required',       'Lock Owner Required',       'Current user must own the lock on this node',                   'lockOwnerRequiredGuard'),
  ('alg-from-state-match',    'algtype-action-guard', 'from_state_match',          'From State Match',          'Node must be in the transition source state',                   'fromStateMatchGuard'),
  ('alg-not-already-signed',  'algtype-action-guard', 'not_already_signed',        'Not Already Signed',        'User must not have already signed current revision.iteration',  'notAlreadySignedGuard'),
  ('alg-has-sig-requirement', 'algtype-action-guard', 'has_signature_requirement', 'Has Signature Requirement', 'At least one outgoing transition requires signatures',          'hasSignatureRequirementGuard'),
  ('alg-fp-unchanged',        'algtype-action-guard', 'fingerprint_unchanged',     'Fingerprint Unchanged',     'Blocks action when version content is identical to previous',   'fingerprintUnchangedGuard'),
  ('alg-transition-lifecycle-guard', 'algtype-action-guard', 'transition_lifecycle_guard', 'Lifecycle Guards',  'Evaluates lifecycle transition guards (signatures, required)',   'transitionLifecycleGuard'),
  -- Lifecycle Guards
  ('alg-all-required-filled', 'algtype-lifecycle-guard', 'all_required_filled',     'All Required Filled',     'All required attributes for target state must have values',     'allRequiredFilledGuard'),
  ('alg-all-signatures-done', 'algtype-lifecycle-guard', 'all_signatures_done',     'All Signatures Done',     'All required signatures must be collected',                     'allSignaturesDoneGuard'),
  ('alg-sig-rejection',       'algtype-lifecycle-guard', 'signature_rejection_check','Signature Rejection Check','Checks for rejected signatures on current version',            'signatureRejectionGuard');

-- ============================================================
-- STATE ACTION ALGORITHMS
-- ============================================================

INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-collapse-history', 'algtype-state-action', 'collapse_history',
   'Collapse History',
   'Deletes committed versions of current revision iteration history when entering release boundary state',
   'collapseHistoryAction');

-- ============================================================
-- WRAPPER ALGORITHMS
-- ============================================================

INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-wrapper-transaction', 'algtype-action-wrapper', 'wrapper-transaction', 'Transaction Wrapper', 'Manages PLM transaction lifecycle around action execution', 'transactionWrapper'),
  ('alg-wrapper-lock',        'algtype-action-wrapper', 'wrapper-lock',        'Lock Wrapper',        'Acquires/releases pessimistic lock around action execution', 'lockWrapper');

-- ============================================================
-- HANDLER ALGORITHMS (one per built-in action)
-- ============================================================

INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-handler-checkout',    'algtype-action-handler', 'CHECKOUT',    'Checkout Handler',    'Open a node for editing',                           'checkoutActionHandler'),
  ('alg-handler-checkin',     'algtype-action-handler', 'CHECKIN',     'Checkin Handler',     'Commit this node and close its transaction',         'checkinActionHandler'),
  ('alg-handler-update-node', 'algtype-action-handler', 'UPDATE_NODE', 'Update Node Handler', 'Save attribute changes to the open version',         'updateNodeActionHandler'),
  ('alg-handler-transition',  'algtype-action-handler', 'TRANSITION',  'Transition Handler',  'Apply a lifecycle state transition',                 'transitionActionHandler'),
  ('alg-handler-sign',        'algtype-action-handler', 'SIGN',        'Sign Handler',        'Record an electronic signature',                     'signActionHandler'),
  ('alg-handler-create-link', 'algtype-action-handler', 'CREATE_LINK', 'Create Link Handler', 'Add a link to another node',                        'createLinkActionHandler'),
  ('alg-handler-update-link', 'algtype-action-handler', 'UPDATE_LINK', 'Update Link Handler', 'Modify link attributes',                            'updateLinkActionHandler'),
  ('alg-handler-delete-link', 'algtype-action-handler', 'DELETE_LINK', 'Delete Link Handler', 'Remove a link between nodes',                       'deleteLinkActionHandler'),
  ('alg-handler-baseline',    'algtype-action-handler', 'BASELINE',    'Baseline Handler',    'Tag a frozen tree as a baseline',                   'baselineActionHandler'),
  ('alg-handler-commit',      'algtype-action-handler', 'COMMIT',      'Commit Handler',      'Commit transaction',                                'commitActionHandler'),
  ('alg-handler-rollback',    'algtype-action-handler', 'ROLLBACK',    'Rollback Handler',    'Rollback transaction',                              'rollbackActionHandler'),
  ('alg-handler-abort',       'algtype-action-handler', 'ABORT',       'Abort Handler',       'Abort node editing and release from transaction',   'abortActionHandler');

-- ============================================================
-- ALGORITHM PARAMETERS
-- ============================================================

INSERT INTO algorithm_parameter (id, algorithm_id, param_name, param_label, data_type, required, default_value, display_order) VALUES
  -- NotFrozenGuard: meta_key (default "frozen")
  ('ap-not-frozen-metakey', 'alg-not-frozen', 'meta_key', 'Metadata Key', 'STRING', 1, 'frozen', 1),
  -- CollapseHistoryAction: meta_key (default "released")
  ('ap-collapse-metakey', 'alg-collapse-history', 'meta_key', 'Boundary Metadata Key', 'STRING', 0, NULL, 1),
  -- TransactionWrapper: tx_mode
  ('ap-tx-mode', 'alg-wrapper-transaction', 'tx_mode', 'Transaction Mode', 'STRING', 1, 'REQUIRED', 1),
  -- SignatureRejectionCheck: mode
  ('ap-sig-rejection-mode', 'alg-sig-rejection', 'mode', 'Rejection Check Mode', 'STRING', 1, NULL, 1);

-- ============================================================
-- GUARD ALGORITHM INSTANCES
-- ============================================================

INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('gi-not-frozen',                    'alg-not-frozen',                'Not Frozen'),
  ('gi-not-locked',                    'alg-not-locked',                'Not Locked'),
  ('gi-lock-owner',                    'alg-lock-owner-required',       'Lock Owner Required'),
  ('gi-from-state',                    'alg-from-state-match',          'From State Match'),
  ('gi-not-already-signed',            'alg-not-already-signed',        'Not Already Signed'),
  ('gi-has-sig-req',                   'alg-has-sig-requirement',       'Has Signature Requirement'),
  ('gi-fp-unchanged',                  'alg-fp-unchanged',              'Fingerprint Unchanged'),
  ('alginst-transition-lifecycle-guard','alg-transition-lifecycle-guard','transition_lifecycle_guard'),
  ('gi-all-required',                  'alg-all-required-filled',       'All Required Filled'),
  ('gi-all-signatures',                'alg-all-signatures-done',       'All Signatures Done'),
  ('gi-sig-no-rejected',               'alg-sig-rejection',             'No Rejected Signatures'),
  ('gi-sig-has-rejected',              'alg-sig-rejection',             'Has Rejected Signature');

-- ============================================================
-- STATE ACTION INSTANCES
-- ============================================================

INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('si-collapse-history', 'alg-collapse-history', 'Collapse History');

-- ============================================================
-- WRAPPER INSTANCES (per tx_mode)
-- ============================================================

INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('wi-lock',        'alg-wrapper-lock',        'Lock Wrapper'),
  ('wi-tx-none',     'alg-wrapper-transaction', 'Transaction: NONE'),
  ('wi-tx-required', 'alg-wrapper-transaction', 'Transaction: REQUIRED'),
  ('wi-tx-auto-open','alg-wrapper-transaction', 'Transaction: AUTO_OPEN'),
  ('wi-tx-isolated', 'alg-wrapper-transaction', 'Transaction: ISOLATED');

-- ============================================================
-- HANDLER INSTANCES (one per handler)
-- ============================================================

INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('hi-checkout',    'alg-handler-checkout',    'Checkout'),
  ('hi-checkin',     'alg-handler-checkin',     'Checkin'),
  ('hi-update-node', 'alg-handler-update-node', 'Update Node'),
  ('hi-transition',  'alg-handler-transition',  'Transition'),
  ('hi-sign',        'alg-handler-sign',        'Sign'),
  ('hi-create-link', 'alg-handler-create-link', 'Create Link'),
  ('hi-update-link', 'alg-handler-update-link', 'Update Link'),
  ('hi-delete-link', 'alg-handler-delete-link', 'Delete Link'),
  ('hi-baseline',    'alg-handler-baseline',    'Baseline'),
  ('hi-commit',      'alg-handler-commit',      'Commit'),
  ('hi-rollback',    'alg-handler-rollback',    'Rollback'),
  ('hi-abort',       'alg-handler-abort',       'Abort');

-- ============================================================
-- ALGORITHM INSTANCE PARAM VALUES
-- ============================================================

INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value) VALUES
  -- NotFrozenGuard: meta_key = frozen
  ('aipv-not-frozen-metakey', 'gi-not-frozen', 'ap-not-frozen-metakey', 'frozen'),
  -- CollapseHistory: meta_key = released
  ('aipv-collapse-metakey', 'si-collapse-history', 'ap-collapse-metakey', 'released'),
  -- TransactionWrapper tx_mode per instance
  ('pv-tx-none',      'wi-tx-none',      'ap-tx-mode', 'NONE'),
  ('pv-tx-required',  'wi-tx-required',  'ap-tx-mode', 'REQUIRED'),
  ('pv-tx-auto-open', 'wi-tx-auto-open', 'ap-tx-mode', 'AUTO_OPEN'),
  ('pv-tx-isolated',  'wi-tx-isolated',  'ap-tx-mode', 'ISOLATED'),
  -- SignatureRejectionCheck modes
  ('pv-sig-no-rejected',  'gi-sig-no-rejected',  'ap-sig-rejection-mode', 'NO_REJECTED'),
  ('pv-sig-has-rejected', 'gi-sig-has-rejected', 'ap-sig-rejection-mode', 'HAS_REJECTED');
