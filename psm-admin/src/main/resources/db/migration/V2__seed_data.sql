-- ============================================================
-- PSM ADMIN CONSOLIDATED SEED DATA
-- Merges V2-V5 + relevant changes from V6-V19
-- ============================================================

-- ============================================================
-- ALGORITHM TYPES (V2)
-- ============================================================

INSERT INTO algorithm_type (id, name, description, java_interface) VALUES
  ('algtype-action-guard',    'Action Guard',    'Checks node/action state preconditions',       'com.plm.domain.guard.Guard'),
  ('algtype-lifecycle-guard', 'Lifecycle Guard', 'Checks lifecycle transition preconditions',    'com.plm.domain.guard.Guard'),
  ('algtype-state-action',    'State Action',    'Actions executed when entering or exiting a lifecycle state', 'com.plm.domain.stateaction.StateAction'),
  ('algtype-action-wrapper',  'Action Wrapper',  'Middleware wrapping action execution',         'com.plm.action.ActionWrapper'),
  ('algtype-action-handler',  'Action Handler',  'Executes a PLM action',                       'com.plm.shared.action.ActionHandler'),
  ('algtype-source-resolver', 'Source Resolver', 'Resolves a (type,key) pair to a target object hosted in a Source', 'com.plm.source.SourceResolver');

-- ============================================================
-- GUARD ALGORITHMS (V2)
-- ============================================================

INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-not-frozen',          'algtype-action-guard', 'not_frozen',                'Not Frozen',                'Node must not be in a frozen lifecycle state',                  'notFrozenGuard'),
  ('alg-not-locked',          'algtype-action-guard', 'not_locked',                'Not Locked',                'Node must not be locked by any user',                           'notLockedGuard'),
  ('alg-lock-owner-required', 'algtype-action-guard', 'lock_owner_required',       'Lock Owner Required',       'Current user must own the lock on this node',                   'lockOwnerRequiredGuard'),
  ('alg-from-state-match',    'algtype-action-guard', 'from_state_match',          'From State Match',          'Node must be in the transition source state',                   'fromStateMatchGuard'),
  ('alg-not-already-signed',  'algtype-action-guard', 'not_already_signed',        'Not Already Signed',        'User must not have already signed current revision.iteration',  'notAlreadySignedGuard'),
  ('alg-has-sig-requirement', 'algtype-action-guard', 'has_signature_requirement', 'Has Signature Requirement', 'At least one outgoing transition requires signatures',          'hasSignatureRequirementGuard'),
  ('alg-fp-unchanged',        'algtype-action-guard', 'fingerprint_unchanged',     'Fingerprint Unchanged',     'Blocks action when version content is identical to previous',   'fingerprintUnchangedGuard'),
  ('alg-transition-lifecycle-guard', 'algtype-action-guard', 'transition_lifecycle_guard', 'Lifecycle Guards',  'Evaluates lifecycle transition guards',                         'transitionLifecycleGuard'),
  ('alg-all-required-filled', 'algtype-lifecycle-guard', 'all_required_filled',     'All Required Filled',     'All required attributes for target state must have values',     'allRequiredFilledGuard'),
  ('alg-all-signatures-done', 'algtype-lifecycle-guard', 'all_signatures_done',     'All Signatures Done',     'All required signatures must be collected',                     'allSignaturesDoneGuard'),
  ('alg-sig-rejection',       'algtype-lifecycle-guard', 'signature_rejection_check','Signature Rejection Check','Checks for rejected signatures on current version',            'signatureRejectionGuard');

-- State Action Algorithms
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-collapse-history', 'algtype-state-action', 'collapse_history', 'Collapse History',
   'Deletes committed versions of current revision iteration history when entering release boundary state', 'collapseHistoryAction');

-- Wrapper Algorithms
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-wrapper-transaction', 'algtype-action-wrapper', 'wrapper-transaction', 'Transaction Wrapper', 'Manages PLM transaction lifecycle around action execution', 'transactionWrapper'),
  ('alg-wrapper-lock',        'algtype-action-wrapper', 'wrapper-lock',        'Lock Wrapper',        'Acquires/releases pessimistic lock around action execution', 'lockWrapper');

-- Handler Algorithms (lowercase codes - V8 applied)
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-handler-checkout',    'algtype-action-handler', 'checkout',    'Checkout Handler',    'Open a node for editing',                           'checkoutActionHandler'),
  ('alg-handler-checkin',     'algtype-action-handler', 'checkin',     'Checkin Handler',     'Commit this node and close its transaction',         'checkinActionHandler'),
  ('alg-handler-update-node', 'algtype-action-handler', 'update_node', 'Update Node Handler', 'Save attribute changes to the open version',         'updateNodeActionHandler'),
  ('alg-handler-transition',  'algtype-action-handler', 'transition',  'Transition Handler',  'Apply a lifecycle state transition',                 'transitionActionHandler'),
  ('alg-handler-sign',        'algtype-action-handler', 'sign',        'Sign Handler',        'Record an electronic signature',                     'signActionHandler'),
  ('alg-handler-create-link', 'algtype-action-handler', 'create_link', 'Create Link Handler', 'Add a link to another node',                        'createLinkActionHandler'),
  ('alg-handler-update-link', 'algtype-action-handler', 'update_link', 'Update Link Handler', 'Modify link attributes',                            'updateLinkActionHandler'),
  ('alg-handler-delete-link', 'algtype-action-handler', 'delete_link', 'Delete Link Handler', 'Remove a link between nodes',                       'deleteLinkActionHandler'),
  ('alg-handler-baseline',    'algtype-action-handler', 'baseline',    'Baseline Handler',    'Tag a frozen tree as a baseline',                   'baselineActionHandler'),
  ('alg-handler-commit',      'algtype-action-handler', 'commit',      'Commit Handler',      'Commit transaction',                                'commitActionHandler'),
  ('alg-handler-rollback',    'algtype-action-handler', 'rollback',    'Rollback Handler',    'Rollback transaction',                              'rollbackActionHandler'),
  ('alg-handler-abort',       'algtype-action-handler', 'abort',       'Abort Handler',       'Abort node editing and release from transaction',   'abortActionHandler'),
  ('alg-handler-create-node', 'algtype-action-handler', 'create_node', 'Create Node Handler', 'Create a new node of a given type',                 'createNodeActionHandler'),
  ('alg-handler-read-node',   'algtype-action-handler', 'read_node',   'READ_NODE Handler',   'Returns the full server-driven UI description of a node', 'com.plm.node.version.internal.handler.ReadNodeActionHandler'),
  ('alg-handler-assign-domain',   'algtype-action-handler', 'assign_domain',   'Assign Domain Handler',   'Attach a domain to a node',   'assignDomainActionHandler'),
  ('alg-handler-unassign-domain', 'algtype-action-handler', 'unassign_domain', 'Unassign Domain Handler', 'Detach a domain from a node', 'unassignDomainActionHandler');

-- Source Resolver Algorithms
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-self-node-resolver', 'algtype-source-resolver', 'self_node_resolver', 'SELF Node Resolver',
   'Resolves links targeting nodes inside this PLM instance (logical_id[@version])', 'selfNodeResolver'),
  ('alg-data-resolver',      'algtype-source-resolver', 'data_resolver',      'DST Data Resolver',
   'Resolves links targeting binary data objects hosted in the dst service',           'dataResolver');

-- ============================================================
-- ALGORITHM PARAMETERS (V2)
-- ============================================================

INSERT INTO algorithm_parameter (id, algorithm_id, param_name, param_label, data_type, required, default_value, display_order) VALUES
  ('ap-not-frozen-metakey', 'alg-not-frozen', 'meta_key', 'Metadata Key', 'STRING', 1, 'frozen', 1),
  ('ap-collapse-metakey', 'alg-collapse-history', 'meta_key', 'Boundary Metadata Key', 'STRING', 0, NULL, 1),
  ('ap-tx-mode', 'alg-wrapper-transaction', 'tx_mode', 'Transaction Mode', 'STRING', 1, 'REQUIRED', 1),
  ('ap-sig-rejection-mode', 'alg-sig-rejection', 'mode', 'Rejection Check Mode', 'STRING', 1, NULL, 1);

-- ============================================================
-- ALGORITHM INSTANCES (V2 + V7)
-- ============================================================

-- Guard instances
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

-- State Action instances
INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('si-collapse-history', 'alg-collapse-history', 'Collapse History');

-- Wrapper instances
INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('wi-lock',        'alg-wrapper-lock',        'Lock Wrapper'),
  ('wi-tx-none',     'alg-wrapper-transaction', 'Transaction: NONE'),
  ('wi-tx-required', 'alg-wrapper-transaction', 'Transaction: REQUIRED'),
  ('wi-tx-auto-open','alg-wrapper-transaction', 'Transaction: AUTO_OPEN'),
  ('wi-tx-isolated', 'alg-wrapper-transaction', 'Transaction: ISOLATED');

-- Source Resolver instances
INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('ri-self-node',  'alg-self-node-resolver', 'SELF Node Resolver'),
  ('ri-data-local', 'alg-data-resolver',      'DST Data Resolver (default)');

-- Built-in SELF Source — represents the local PLM node store, immutable from UI.
-- is_versioned governs whether the source's objects support a version axis: SELF=1
-- (PSM nodes carry version_number), DATA_LOCAL=0 (dst data objects are immutable).
-- Admin link-type validation rejects VERSION_TO_VERSION on a non-versioned source.
INSERT INTO source (id, name, description, resolver_instance_id, is_builtin, is_versioned) VALUES
  ('SELF',       'Self', 'The local PLM node store. Targets are nodes referenced by their logical_id, optionally pinned with @versionNumber.', 'ri-self-node', 1, 1),
  ('DATA_LOCAL', 'Data Store', 'Binary data objects hosted in the dst service. Target type is filetype; key is the data UUID returned at upload.', 'ri-data-local', 0, 0);

-- Handler instances
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
  ('hi-abort',       'alg-handler-abort',       'Abort'),
  ('hi-create-node', 'alg-handler-create-node', 'Create Node'),
  ('hi-read-node',   'alg-handler-read-node',   'default-read-node'),
  ('hi-assign-domain',   'alg-handler-assign-domain',   'Assign Domain'),
  ('hi-unassign-domain', 'alg-handler-unassign-domain', 'Unassign Domain');

-- ============================================================
-- ALGORITHM INSTANCE PARAM VALUES (V2)
-- ============================================================

INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value) VALUES
  ('aipv-not-frozen-metakey', 'gi-not-frozen', 'ap-not-frozen-metakey', 'frozen'),
  ('aipv-collapse-metakey', 'si-collapse-history', 'ap-collapse-metakey', 'released'),
  ('pv-tx-none',      'wi-tx-none',      'ap-tx-mode', 'NONE'),
  ('pv-tx-required',  'wi-tx-required',  'ap-tx-mode', 'REQUIRED'),
  ('pv-tx-auto-open', 'wi-tx-auto-open', 'ap-tx-mode', 'AUTO_OPEN'),
  ('pv-tx-isolated',  'wi-tx-isolated',  'ap-tx-mode', 'ISOLATED'),
  ('pv-sig-no-rejected',  'gi-sig-no-rejected',  'ap-sig-rejection-mode', 'NO_REJECTED'),
  ('pv-sig-has-rejected', 'gi-sig-has-rejected', 'ap-sig-rejection-mode', 'HAS_REJECTED');

-- ============================================================
-- LIFECYCLE "Standard" (V3)
-- ============================================================

INSERT INTO lifecycle (id, name, description) VALUES
  ('lc-standard', 'Standard', 'Standard PLM lifecycle');

INSERT INTO lifecycle_state (id, lifecycle_id, name, is_initial, display_order, color) VALUES
  ('st-inwork',   'lc-standard', 'In Work',  1, 1, '#5b9cf6'),
  ('st-frozen',   'lc-standard', 'Frozen',   0, 2, '#a78bfa'),
  ('st-released', 'lc-standard', 'Released', 0, 3, '#34d399'),
  ('st-obsolete', 'lc-standard', 'Obsolete', 0, 4, '#94a3b8');

INSERT INTO lifecycle_transition (id, lifecycle_id, name, from_state_id, to_state_id, guard_expr, action_type, version_strategy) VALUES
  ('tr-freeze',   'lc-standard', 'Freeze',        'st-inwork',   'st-frozen',   NULL, 'CASCADE_FROZEN', 'NONE'),
  ('tr-unfreeze', 'lc-standard', 'Unfreeze',      'st-frozen',   'st-inwork',   NULL, NULL,             'NONE'),
  ('tr-release',  'lc-standard', 'Release',       'st-frozen',   'st-released', NULL, NULL,             'NONE'),
  ('tr-revise',   'lc-standard', 'Revise',        'st-released', 'st-inwork',   NULL, NULL,             'REVISE'),
  ('tr-obsolete', 'lc-standard', 'Make Obsolete', 'st-released', 'st-obsolete', NULL, NULL,             'NONE');

INSERT INTO signature_requirement (id, lifecycle_transition_id, role_required, display_order) VALUES
  ('sr-rel-01', 'tr-release', 'role-reviewer', 10),
  ('sr-rel-02', 'tr-release', 'role-designer', 20);

-- Entity Metadata
INSERT INTO entity_metadata (id, target_type, target_id, meta_key, meta_value) VALUES
  ('em-st-frozen-frozen',     'LIFECYCLE_STATE', 'st-frozen',   'frozen',   'true'),
  ('em-st-released-frozen',   'LIFECYCLE_STATE', 'st-released', 'frozen',   'true'),
  ('em-st-released-released', 'LIFECYCLE_STATE', 'st-released', 'released', 'true'),
  ('em-st-obsolete-frozen',   'LIFECYCLE_STATE', 'st-obsolete', 'frozen',   'true');

-- ============================================================
-- NODE TYPES + ATTRIBUTES (V3)
-- ============================================================

INSERT INTO node_type (id, name, description, lifecycle_id, logical_id_label, logical_id_pattern, color, icon, parent_node_type_id) VALUES
  ('nt-document', 'Document', 'Technical PLM document',                                       'lc-standard', 'Document Number', '[A-Z]{3}-\d{4}', '#6366f1', 'FileText', NULL),
  ('nt-part',     'Part',     'Mechanical part',                                              'lc-standard', 'Part Number',     'P-\d{6}',        '#10b981', 'Cog',      NULL),
  ('nt-assembly', 'Assembly', 'Composed assembly of Parts and sub-Assemblies (inherits Part)','lc-standard', 'Assembly Number', 'P-\d{6}',        '#f97316', 'Blocks',   'nt-part');

INSERT INTO attribute_definition
  (id, node_type_id, name, label, data_type, required, widget_type, display_order, display_section) VALUES
  ('ad-doc-title',   'nt-document', 'title',       'Title',       'STRING', 1, 'TEXT',     1, 'Identity'),
  ('ad-doc-version', 'nt-document', 'version',     'Version',     'STRING', 0, 'TEXT',     2, 'Identity'),
  ('ad-doc-desc',    'nt-document', 'description', 'Description', 'STRING', 0, 'TEXTAREA', 3, 'General'),
  ('ad-doc-cat',     'nt-document', 'category',    'Category',    'ENUM',   1, 'DROPDOWN', 4, 'General'),
  ('ad-doc-author',  'nt-document', 'author',      'Author',      'STRING', 1, 'TEXT',     5, 'General'),
  ('ad-doc-review',  'nt-document', 'reviewNote',  'Review Note', 'STRING', 0, 'TEXTAREA', 6, 'Review');

UPDATE attribute_definition SET allowed_values = '["Design","Test","Spec","Procedure","Report"]' WHERE id = 'ad-doc-cat';

INSERT INTO attribute_definition
  (id, node_type_id, name, label, data_type, required, widget_type, display_order, display_section) VALUES
  ('ad-part-name',     'nt-part', 'name',       'Name',        'STRING', 1, 'TEXT',     1, 'Identity'),
  ('ad-part-material', 'nt-part', 'material',   'Material',    'ENUM',   0, 'DROPDOWN', 2, 'Technical'),
  ('ad-part-weight',   'nt-part', 'weight',     'Weight (kg)', 'NUMBER', 0, 'TEXT',     3, 'Technical'),
  ('ad-part-drawing',  'nt-part', 'drawingRef', 'Drawing Ref', 'STRING', 0, 'TEXT',     4, 'Technical');

UPDATE attribute_definition SET allowed_values = '["Steel","Aluminum","Titanium","Composite","Plastic"]' WHERE id = 'ad-part-material';

-- Attribute State Rules (V3)
INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible, node_type_id) VALUES
  ('asr-iw-01',  'ad-doc-review',  'st-inwork',   0, 0, 0, 'nt-document'),
  ('asr-fz-01',  'ad-doc-title',   'st-frozen',   1, 0, 1, 'nt-document'),
  ('asr-fz-02',  'ad-doc-version', 'st-frozen',   0, 0, 1, 'nt-document'),
  ('asr-fz-03',  'ad-doc-desc',    'st-frozen',   0, 0, 1, 'nt-document'),
  ('asr-fz-04',  'ad-doc-cat',     'st-frozen',   1, 0, 1, 'nt-document'),
  ('asr-fz-05',  'ad-doc-author',  'st-frozen',   1, 0, 1, 'nt-document'),
  ('asr-fz-06',  'ad-doc-review',  'st-frozen',   0, 1, 1, 'nt-document'),
  ('asr-rl-01',  'ad-doc-title',   'st-released', 1, 0, 1, 'nt-document'),
  ('asr-rl-02',  'ad-doc-version', 'st-released', 0, 0, 1, 'nt-document'),
  ('asr-rl-03',  'ad-doc-desc',    'st-released', 0, 0, 1, 'nt-document'),
  ('asr-rl-04',  'ad-doc-cat',     'st-released', 1, 0, 1, 'nt-document'),
  ('asr-rl-05',  'ad-doc-author',  'st-released', 1, 0, 1, 'nt-document'),
  ('asr-rl-06',  'ad-doc-review',  'st-released', 0, 0, 1, 'nt-document'),
  ('asr-ob-01',  'ad-doc-title',   'st-obsolete', 1, 0, 1, 'nt-document'),
  ('asr-ob-02',  'ad-doc-version', 'st-obsolete', 0, 0, 1, 'nt-document'),
  ('asr-ob-03',  'ad-doc-desc',    'st-obsolete', 0, 0, 1, 'nt-document'),
  ('asr-ob-04',  'ad-doc-cat',     'st-obsolete', 1, 0, 1, 'nt-document'),
  ('asr-ob-05',  'ad-doc-author',  'st-obsolete', 1, 0, 1, 'nt-document'),
  ('asr-ob-06',  'ad-doc-review',  'st-obsolete', 0, 0, 0, 'nt-document'),
  ('asr-pfz-01', 'ad-part-name',     'st-frozen',   1, 0, 1, 'nt-part'),
  ('asr-pfz-02', 'ad-part-material', 'st-frozen',   0, 0, 1, 'nt-part'),
  ('asr-pfz-03', 'ad-part-weight',   'st-frozen',   0, 0, 1, 'nt-part'),
  ('asr-pfz-04', 'ad-part-drawing',  'st-frozen',   0, 0, 1, 'nt-part'),
  ('asr-prl-01', 'ad-part-name',     'st-released', 1, 0, 1, 'nt-part'),
  ('asr-prl-02', 'ad-part-material', 'st-released', 0, 0, 1, 'nt-part'),
  ('asr-prl-03', 'ad-part-weight',   'st-released', 0, 0, 1, 'nt-part'),
  ('asr-prl-04', 'ad-part-drawing',  'st-released', 0, 0, 1, 'nt-part'),
  ('asr-pob-01', 'ad-part-name',     'st-obsolete', 1, 0, 1, 'nt-part'),
  ('asr-pob-02', 'ad-part-material', 'st-obsolete', 0, 0, 1, 'nt-part'),
  ('asr-pob-03', 'ad-part-weight',   'st-obsolete', 0, 0, 1, 'nt-part'),
  ('asr-pob-04', 'ad-part-drawing',  'st-obsolete', 0, 0, 1, 'nt-part');

-- ============================================================
-- LINK TYPES + CASCADES (V3)
-- ============================================================

INSERT INTO link_type (id, name, description, source_node_type_id, target_source_id, target_type, link_policy, link_logical_id_label) VALUES
  ('lt-composed-of', 'composed_of',   'Assembly -> Assembly composition', 'nt-assembly', 'SELF', 'nt-assembly', 'VERSION_TO_MASTER',  'Assembly Ref'),
  ('lt-doc-part',    'documented_by', 'Document references a Part',   'nt-part',     'SELF', 'nt-document', 'VERSION_TO_VERSION', 'Doc Ref'),
  ('lt-supersedes',  'supersedes',    'Part supersedes another Part', 'nt-part',     'SELF',       'nt-part',     'VERSION_TO_VERSION', 'Supersession Ref'),
  ('lt-part-data',   'represented_by','Part represented by a binary data object hosted in DST', 'nt-part', 'DATA_LOCAL', 'filetype', 'VERSION_TO_MASTER', 'File Ref');

INSERT INTO link_type_cascade (id, link_type_id, parent_transition_id, child_from_state_id, child_transition_id) VALUES
  ('ltc-composed-freeze', 'lt-composed-of', 'tr-freeze', 'st-inwork', 'tr-freeze');

-- ============================================================
-- ATTRIBUTE VIEWS (V3)
-- ============================================================

INSERT INTO attribute_view (id, node_type_id, name, description, eligible_role_id, eligible_state_id, priority) VALUES
  ('view-reviewer-frozen', 'nt-document', 'Reviewer Frozen View', 'Optimised for reviewer during Frozen phase', 'role-reviewer', 'st-frozen', 10),
  ('view-reader-all',      'nt-document', 'Reader View',          'Simplified view for readers',                'role-reader',   NULL,        5);

INSERT INTO view_attribute_override (id, view_id, attribute_def_id, visible, editable, display_order, display_section) VALUES
  ('vao-f1', 'view-reviewer-frozen', 'ad-doc-review', 1, 1, 1, 'Review'),
  ('vao-f2', 'view-reviewer-frozen', 'ad-doc-title',  1, 0, 2, 'Identity'),
  ('vao-f3', 'view-reviewer-frozen', 'ad-doc-desc',   1, 0, 3, 'General'),
  ('vao-r1', 'view-reader-all',      'ad-doc-review', 0, 0, NULL, NULL);

-- Lifecycle state actions (V3)
INSERT INTO lifecycle_state_action (id, lifecycle_state_id, algorithm_instance_id, trigger, execution_mode, display_order) VALUES
  ('lsa-released-collapse', 'st-released', 'si-collapse-history', 'ON_ENTER', 'TRANSACTIONAL', 10);

-- Lifecycle transition guards (V3)
INSERT INTO lifecycle_transition_guard (id, lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES
  ('ltg-release-sig',          'tr-release',  'gi-all-signatures',   'BLOCK', 1),
  ('ltg-release-no-rejected',  'tr-release',  'gi-sig-no-rejected',  'BLOCK', 2),
  ('ltg-freeze-required',      'tr-freeze',   'gi-all-required',     'BLOCK', 1),
  ('ltg-unfreeze-has-rejected','tr-unfreeze', 'gi-sig-has-rejected', 'BLOCK', 1);

-- ============================================================
-- ACTION CATALOG (V4, with lowercase codes from V8, and V7 CREATE_NODE,
-- V10 assign/unassign domain, V14 read_node handler, V17 PROPERTY category)
-- ============================================================

INSERT INTO action (id, action_code, scope, display_name, description, display_category, display_order, handler_instance_id) VALUES
  ('act-read',             'read_node',        'NODE',      'Read Node',                    'Per-node-type read access to nodes',                    'STRUCTURAL', -20, 'hi-read-node'),
  ('act-read-global',      'read',             'GLOBAL',    'Read',                         'Global read access to views and lists',                 'STRUCTURAL', -30, NULL),
  ('act-checkout',    'checkout',    'NODE',      'Checkout',        'Open a node for editing',                    'SECONDARY',  100, 'hi-checkout'),
  ('act-checkin',     'checkin',     'NODE',      'Check In',        'Commit this node and close its transaction', 'SECONDARY',  110, 'hi-checkin'),
  ('act-update-node', 'update_node', 'NODE',      'Update Node',     'Save attribute changes to the open version', 'SECONDARY',   50, 'hi-update-node'),
  ('act-transition',  'transition',  'LIFECYCLE', 'Transition',      'Apply a lifecycle state transition',         'PRIMARY',     10, 'hi-transition'),
  ('act-sign',        'sign',        'NODE',      'Sign',            'Record an electronic signature',             'PRIMARY',    200, 'hi-sign'),
  ('act-create-link', 'create_link', 'NODE',      'Create Link',     'Add a link to another node',                 'SECONDARY',  300, 'hi-create-link'),
  ('act-update-link', 'update_link', 'NODE',      'Update Link',     'Modify link attributes',                     'SECONDARY',  350, 'hi-update-link'),
  ('act-delete-link', 'delete_link', 'NODE',      'Delete Link',     'Remove a link between nodes',                'DANGEROUS',  360, 'hi-delete-link'),
  ('act-baseline',    'baseline',    'NODE',      'Create Baseline', 'Tag a frozen tree as a baseline',            'SECONDARY',  400, 'hi-baseline'),
  ('act-commit',      'commit',      'TX',        'Commit',          'Commit transaction',                         'STRUCTURAL', 900, 'hi-commit'),
  ('act-rollback',    'rollback',    'TX',        'Rollback',        'Rollback transaction',                       'STRUCTURAL', 910, 'hi-rollback'),
  ('act-abort',       'abort',       'NODE',      'Abort',           'Abort node editing and release from tx',     'DANGEROUS',  800, 'hi-abort'),
  ('act-create-node', 'create_node', 'NODE_TYPE', 'Create Node',    'Create a new node of a given type',          'PRIMARY',      5, 'hi-create-node'),
  ('act-assign-domain',   'assign_domain',   'NODE', 'Assign Domain',   'Attach a domain to a node',   'PROPERTY', 500, 'hi-assign-domain'),
  ('act-unassign-domain', 'unassign_domain', 'NODE', 'Unassign Domain', 'Detach a domain from a node', 'PROPERTY', 510, 'hi-unassign-domain');

-- ============================================================
-- ACTION PARAMETERS (V4 + V7 + V10)
-- ============================================================

INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, default_value, allowed_values, widget_type, display_order) VALUES
  ('nap-sign-meaning', 'act-sign', 'meaning', 'Meaning', 'ENUM',   1, 'Approved', '["Approved","Rejected"]', 'DROPDOWN', 1),
  ('nap-sign-comment', 'act-sign', 'comment', 'Comment', 'STRING', 0, NULL,       NULL,                      'TEXTAREA', 2);

INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-bl-name', 'act-baseline', 'name',        'Baseline Name', 'STRING', 1, 'TEXT',     1),
  ('nap-bl-desc', 'act-baseline', 'description', 'Description',   'STRING', 0, 'TEXTAREA', 2),
  ('nap-lnk-type',    'act-create-link', 'linkTypeId',        'Link Type',    'ENUM',   1, 'DROPDOWN', 1),
  ('nap-lnk-src',     'act-create-link', 'targetSourceCode',  'Target Source','STRING', 1, 'DROPDOWN', 2),
  ('nap-lnk-ttype',   'act-create-link', 'targetType',        'Target Type',  'STRING', 1, 'DROPDOWN', 3),
  ('nap-lnk-tkey',    'act-create-link', 'targetKey',         'Target Key',   'STRING', 1, 'TEXT',     4),
  ('nap-lnk-lid',     'act-create-link', 'linkLogicalId',     'Link ID',      'STRING', 1, 'TEXT',     5),
  ('nap-ul-linkid',   'act-update-link', 'linkId',            'Link ID',      'STRING', 1, 'TEXT', 1),
  ('nap-ul-src',      'act-update-link', 'targetSourceCode',  'Target Source','STRING', 0, 'DROPDOWN', 2),
  ('nap-ul-ttype',    'act-update-link', 'targetType',        'Target Type',  'STRING', 0, 'DROPDOWN', 3),
  ('nap-ul-tkey',     'act-update-link', 'targetKey',         'Target Key',   'STRING', 0, 'TEXT', 4),
  ('nap-ul-logid',    'act-update-link', 'logicalId',         'Link Logical ID','STRING', 0, 'TEXT', 5),
  ('nap-dl-linkid',  'act-delete-link', 'linkId', 'Link ID', 'STRING', 1, 'TEXT', 1),
  ('nap-ad-domain',  'act-assign-domain',   'domainId', 'Domain', 'ENUM', 1, 'DROPDOWN', 1),
  ('nap-ud-domain',  'act-unassign-domain', 'domainId', 'Domain', 'ENUM', 1, 'DROPDOWN', 1);

INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order, visibility) VALUES
  ('ap-commit-comment',  'act-commit',      'comment', 'Commit message', 'STRING', 1, 'TEXT', 1, 'UI_VISIBLE'),
  ('ap-checkin-comment', 'act-checkin',     'comment', 'Commit message', 'STRING', 1, 'TEXT', 1, 'UI_VISIBLE'),
  ('ap-cn-logicalid',   'act-create-node', '_logicalId',  'Logical ID',  'STRING', 0, 'TEXT', 1, 'UI_VISIBLE'),
  ('ap-cn-externalid',  'act-create-node', '_externalId', 'External ID', 'STRING', 0, 'TEXT', 2, 'UI_VISIBLE');

-- ============================================================
-- ACTION GUARDS (V4 + V10)
-- ============================================================

INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES
  ('ag-checkout-frozen',     'act-checkout',    'gi-not-frozen',                     'HIDE',  1),
  ('ag-checkout-locked',     'act-checkout',    'gi-not-locked',                     'HIDE',  2),
  ('ag-checkin-owner',       'act-checkin',     'gi-lock-owner',                     'HIDE',  1),
  ('ag-checkin-fp',          'act-checkin',     'gi-fp-unchanged',                   'BLOCK', 10),
  ('ag-update-owner',        'act-update-node', 'gi-lock-owner',                     'HIDE',  1),
  ('ag-clink-owner',         'act-create-link', 'gi-lock-owner',                     'HIDE',  1),
  ('ag-ulink-owner',         'act-update-link', 'gi-lock-owner',                     'HIDE',  1),
  ('ag-dlink-owner',         'act-delete-link', 'gi-lock-owner',                     'HIDE',  1),
  ('ag-trans-state',         'act-transition',  'gi-from-state',                     'HIDE',  1),
  ('ag-trans-locked',        'act-transition',  'gi-not-locked',                     'HIDE',  2),
  ('ag-transition-lifecycle','act-transition',  'alginst-transition-lifecycle-guard', 'BLOCK', 100),
  ('ag-sign-req',            'act-sign',        'gi-has-sig-req',                    'HIDE',  1),
  ('ag-sign-already',        'act-sign',        'gi-not-already-signed',             'HIDE',  2),
  ('ag-abort-lock-owner',    'act-abort',       'gi-lock-owner',                     'HIDE',  1),
  ('ag-assign-domain-owner',   'act-assign-domain',   'gi-lock-owner', 'HIDE', 1),
  ('ag-unassign-domain-owner', 'act-unassign-domain', 'gi-lock-owner', 'HIDE', 1);

-- ============================================================
-- ACTION WRAPPERS (V4 + V7 + V10)
-- ============================================================

INSERT INTO action_wrapper (id, action_id, algorithm_instance_id, execution_order) VALUES
  ('aw-transition-lock', 'act-transition', 'wi-lock',        10),
  ('aw-transition-tx',   'act-transition', 'wi-tx-isolated', 20),
  ('aw-checkout-tx',     'act-checkout',    'wi-tx-auto-open', 10),
  ('aw-create-link-tx',  'act-create-link', 'wi-tx-auto-open', 10),
  ('aw-update-link-tx',  'act-update-link', 'wi-tx-auto-open', 10),
  ('aw-delete-link-tx',  'act-delete-link', 'wi-tx-auto-open', 10),
  ('aw-checkin-tx',      'act-checkin',     'wi-tx-required', 10),
  ('aw-update-node-tx',  'act-update-node', 'wi-tx-required', 10),
  ('aw-commit-tx',       'act-commit',      'wi-tx-required', 10),
  ('aw-rollback-tx',     'act-rollback',    'wi-tx-required', 10),
  ('aw-abort-tx',        'act-abort',       'wi-tx-required', 10),
  ('aw-create-node-tx',  'act-create-node', 'wi-tx-auto-open', 10),
  ('aw-assign-domain-tx',   'act-assign-domain',   'wi-tx-required', 10),
  ('aw-unassign-domain-tx', 'act-unassign-domain', 'wi-tx-required', 10);

-- ============================================================
-- PERMISSION CATALOG (V5 + V6 + V9 + V16 + V19 consolidated)
-- ============================================================

INSERT INTO permission (permission_code, scope, display_name, description, display_order) VALUES
  ('READ',             'GLOBAL',    'Read',                       'Global read access to views and lists',                           -30),
  ('READ_NODE',        'NODE',      'Read Node',                  'Per-node-type read access to nodes',                              -20),
  ('UPDATE',           'GLOBAL',    'Update',                     'Global update access -- commit, rollback transactions',           -25),
  ('CREATE_NODE',      'NODE',      'Create Node',                'Create new nodes of this type',                                     5),
  ('UPDATE_NODE',      'NODE',      'Update Node',                'Modify node content (checkout, checkin, links, attributes)',        50),
  ('TRANSITION',       'LIFECYCLE', 'Transition',                 'Apply a lifecycle state transition',                                10),
  ('SIGN',             'NODE',      'Sign',                       'Record an electronic signature',                                   200),
  ('MANAGE_BASELINES', 'GLOBAL',    'Manage Baselines',           'Create baselines',                                                   0),
  ('MANAGE_PNO',       'GLOBAL',    'Manage PnO',                 'Access People & Organisation settings',                              0),
  ('MANAGE_PLATFORM',  'GLOBAL',    'Manage Platform',            'Access platform configuration settings',                             0),
  ('MANAGE_PSM',       'GLOBAL',    'Manage PSM',                 'Access application settings',                                        0),
  ('MANAGE_SECRETS',   'GLOBAL',    'Manage Secrets',             'Administrate Vault-backed secrets',                                  0),
  ('READ_DATA',        'DATA',      'Read Data',                  'Download stored data and read metadata',                            210),
  ('WRITE_DATA',       'DATA',      'Write Data',                 'Upload new data into the data store',                               220),
  ('MANAGE_DATA',      'DATA',      'Manage Data',                'Administer data store entries (delete, purge)',                     230);

-- ============================================================
-- ACTION -> PERMISSION MAPPINGS (V5 + V6 + V7 + V10)
-- ============================================================

INSERT INTO action_required_permission (id, action_id, permission_code) VALUES
  ('arp-checkout',    'act-checkout',    'UPDATE_NODE'),
  ('arp-checkin',     'act-checkin',     'UPDATE_NODE'),
  ('arp-update-node', 'act-update-node', 'UPDATE_NODE'),
  ('arp-create-link', 'act-create-link', 'UPDATE_NODE'),
  ('arp-update-link', 'act-update-link', 'UPDATE_NODE'),
  ('arp-delete-link', 'act-delete-link', 'UPDATE_NODE'),
  ('arp-abort',       'act-abort',       'UPDATE_NODE'),
  ('arp-transition',  'act-transition',  'TRANSITION'),
  ('arp-sign',        'act-sign',        'SIGN'),
  ('arp-commit',      'act-commit',      'UPDATE'),
  ('arp-rollback',    'act-rollback',    'UPDATE'),
  ('arp-baseline',    'act-baseline',    'MANAGE_BASELINES'),
  ('arp-create-node-update', 'act-create-node', 'UPDATE'),
  ('arp-create-node-create', 'act-create-node', 'CREATE_NODE'),
  ('arp-assign-domain',   'act-assign-domain',   'UPDATE_NODE'),
  ('arp-unassign-domain', 'act-unassign-domain', 'UPDATE_NODE');

-- ============================================================
-- DOMAIN SEED DATA (V11)
-- ============================================================

INSERT INTO domain (id, name, description, color, icon) VALUES
  ('dom-ssi',  'SSI',  'System & Structure Installation', '#f59e0b', 'box'),
  ('dom-elec', 'ELEC', 'Electricity',                     '#3b82f6', 'cpu');

-- SSI domain attributes
INSERT INTO attribute_definition
  (id, node_type_id, domain_id, name, label, data_type, required, default_value, allowed_values, widget_type, display_order, display_section, tooltip, as_name) VALUES
  ('ad-ssi-zone',       NULL, 'dom-ssi', 'installZone',       'Installation Zone',    'ENUM',   1, NULL,  '["Forward","Center","Aft","Wing","Empennage","Nacelle","Landing Gear Bay"]', 'DROPDOWN', 1,  'Installation', 'Physical zone where the item is installed', 0),
  ('ad-ssi-position',   NULL, 'dom-ssi', 'installPosition',   'Position',             'STRING', 0, NULL,  NULL,            'TEXT',     2,  'Installation', 'Exact position reference',     0),
  ('ad-ssi-mountType',  NULL, 'dom-ssi', 'mountingType',      'Mounting Type',        'ENUM',   0, NULL,  '["Bolted","Riveted","Bonded","Clamp","Rail","Welded"]', 'DROPDOWN', 3,  'Installation', 'How the item is physically attached', 0),
  ('ad-ssi-orientation',NULL, 'dom-ssi', 'orientation',       'Orientation',          'STRING', 0, NULL,  NULL,            'TEXT',     4,  'Installation', 'Orientation constraints', 0),
  ('ad-ssi-clearance',  NULL, 'dom-ssi', 'clearanceRequired', 'Clearance Required',   'ENUM',   0, 'No',  '["Yes","No"]',  'DROPDOWN', 5,  'Installation', 'Whether access clearance must be maintained', 0),
  ('ad-ssi-ata',        NULL, 'dom-ssi', 'ataChapter',        'ATA Chapter',          'STRING', 0, NULL,  NULL,            'TEXT',     6,  'Classification','ATA 100 chapter reference', 0),
  ('ad-ssi-envRating',  NULL, 'dom-ssi', 'environmentRating', 'Environment Rating',   'ENUM',   0, NULL,  '["Standard","Pressurized","Unpressurized","High Temp","Corrosive","Wet"]', 'DROPDOWN', 7, 'Classification','Environmental conditions', 0),
  ('ad-ssi-maxLoad',    NULL, 'dom-ssi', 'maxLoadKg',         'Max Load (kg)',        'NUMBER', 0, NULL,  NULL,            'TEXT',     8,  'Structural',   'Maximum allowable static load', 0),
  ('ad-ssi-torque',     NULL, 'dom-ssi', 'torqueSpec',        'Torque Spec (Nm)',     'STRING', 0, NULL,  NULL,            'TEXT',     9,  'Structural',   'Required tightening torque', 0),
  ('ad-ssi-iiNote',     NULL, 'dom-ssi', 'installInstr',      'Installation Notes',   'STRING', 0, NULL,  NULL,            'TEXTAREA',10, 'Structural',   'Free-text installation instructions', 0);

-- ELEC domain attributes
INSERT INTO attribute_definition
  (id, node_type_id, domain_id, name, label, data_type, required, default_value, allowed_values, widget_type, display_order, display_section, tooltip, as_name) VALUES
  ('ad-elec-voltage',   NULL, 'dom-elec', 'ratedVoltage',   'Rated Voltage (V)',     'NUMBER', 0, NULL, NULL,            'TEXT',     1, 'Electrical',  'Nominal operating voltage', 0),
  ('ad-elec-current',   NULL, 'dom-elec', 'ratedCurrent',   'Rated Current (A)',     'NUMBER', 0, NULL, NULL,            'TEXT',     2, 'Electrical',  'Maximum continuous current rating', 0),
  ('ad-elec-power',     NULL, 'dom-elec', 'powerRating',    'Power Rating (W)',      'NUMBER', 0, NULL, NULL,            'TEXT',     3, 'Electrical',  'Maximum power dissipation', 0),
  ('ad-elec-freq',      NULL, 'dom-elec', 'frequency',      'Frequency (Hz)',        'STRING', 0, NULL, NULL,            'TEXT',     4, 'Electrical',  'Operating frequency', 0),
  ('ad-elec-type',      NULL, 'dom-elec', 'circuitType',    'Circuit Type',          'ENUM',   0, NULL, '["AC","DC","AC/DC","Signal","Data"]', 'DROPDOWN', 5, 'Electrical', 'Type of electrical circuit', 0),
  ('ad-elec-wireGauge', NULL, 'dom-elec', 'wireGauge',      'Wire Gauge (AWG)',      'STRING', 0, NULL, NULL,            'TEXT',     6, 'Wiring',      'Wire gauge per AWG standard', 0),
  ('ad-elec-wireType',  NULL, 'dom-elec', 'wireType',       'Wire Type',             'ENUM',   0, NULL, '["Shielded","Unshielded","Twisted Pair","Coaxial","Fiber Optic"]', 'DROPDOWN', 7, 'Wiring', 'Cable type', 0),
  ('ad-elec-connector', NULL, 'dom-elec', 'connectorType',  'Connector Type',        'STRING', 0, NULL, NULL,            'TEXT',     8, 'Wiring',      'Connector part number or standard', 0),
  ('ad-elec-pinCount',  NULL, 'dom-elec', 'pinCount',       'Pin Count',             'NUMBER', 0, NULL, NULL,            'TEXT',     9, 'Wiring',      'Number of pins/contacts', 0),
  ('ad-elec-insClass',  NULL, 'dom-elec', 'insulationClass','Insulation Class',      'ENUM',   0, NULL, '["A","B","F","H","N","R"]', 'DROPDOWN', 10, 'Protection', 'Thermal insulation class', 0),
  ('ad-elec-ipRating',  NULL, 'dom-elec', 'ipRating',       'IP Rating',             'STRING', 0, NULL, NULL,            'TEXT',    11, 'Protection',  'Ingress protection rating', 0),
  ('ad-elec-emcClass',  NULL, 'dom-elec', 'emcClass',       'EMC Class',             'ENUM',   0, NULL, '["Class A","Class B","MIL-STD-461"]', 'DROPDOWN', 12, 'Protection', 'EMC classification', 0);

-- ============================================================
-- ENUM DEFINITIONS (V18)
-- ============================================================

INSERT INTO enum_definition (id, name, description) VALUES
  ('enum-doc-category',     'Document Categories', 'Standard document categories'),
  ('enum-materials',        'Materials',           'Standard materials list'),
  ('enum-ssi-zone',         'Installation Zones',  'Aircraft installation zones'),
  ('enum-ssi-mount',        'Mounting Types',      'Mounting methods'),
  ('enum-elec-circuit',     'Circuit Types',       'Electrical circuit types'),
  ('enum-elec-wire',        'Wire Types',          'Electrical wire types'),
  ('enum-elec-insulation',  'Insulation Classes',  'Wire insulation classes'),
  ('enum-elec-emc',         'EMC Classes',         'Electromagnetic compatibility classes');

INSERT INTO enum_value (id, enum_definition_id, value, display_order) VALUES
  ('ev-doc-1', 'enum-doc-category', 'Design', 0),
  ('ev-doc-2', 'enum-doc-category', 'Test', 1),
  ('ev-doc-3', 'enum-doc-category', 'Spec', 2),
  ('ev-doc-4', 'enum-doc-category', 'Procedure', 3),
  ('ev-doc-5', 'enum-doc-category', 'Report', 4),
  ('ev-mat-1', 'enum-materials', 'Aluminum', 0),
  ('ev-mat-2', 'enum-materials', 'Steel', 1),
  ('ev-mat-3', 'enum-materials', 'Titanium', 2),
  ('ev-mat-4', 'enum-materials', 'Composite', 3),
  ('ev-mat-5', 'enum-materials', 'Inconel', 4),
  ('ev-zone-1', 'enum-ssi-zone', 'Forward', 0),
  ('ev-zone-2', 'enum-ssi-zone', 'Center', 1),
  ('ev-zone-3', 'enum-ssi-zone', 'Aft', 2),
  ('ev-zone-4', 'enum-ssi-zone', 'Wing', 3),
  ('ev-zone-5', 'enum-ssi-zone', 'Empennage', 4),
  ('ev-zone-6', 'enum-ssi-zone', 'Nacelle', 5),
  ('ev-zone-7', 'enum-ssi-zone', 'Landing Gear Bay', 6),
  ('ev-mnt-1', 'enum-ssi-mount', 'Bolted', 0),
  ('ev-mnt-2', 'enum-ssi-mount', 'Riveted', 1),
  ('ev-mnt-3', 'enum-ssi-mount', 'Bonded', 2),
  ('ev-mnt-4', 'enum-ssi-mount', 'Clamp', 3),
  ('ev-mnt-5', 'enum-ssi-mount', 'Rail', 4),
  ('ev-mnt-6', 'enum-ssi-mount', 'Welded', 5),
  ('ev-cir-1', 'enum-elec-circuit', 'AC', 0),
  ('ev-cir-2', 'enum-elec-circuit', 'DC', 1),
  ('ev-cir-3', 'enum-elec-circuit', 'AC/DC', 2),
  ('ev-cir-4', 'enum-elec-circuit', 'Signal', 3),
  ('ev-cir-5', 'enum-elec-circuit', 'Data', 4),
  ('ev-wir-1', 'enum-elec-wire', 'Shielded', 0),
  ('ev-wir-2', 'enum-elec-wire', 'Unshielded', 1),
  ('ev-wir-3', 'enum-elec-wire', 'Twisted Pair', 2),
  ('ev-wir-4', 'enum-elec-wire', 'Coaxial', 3),
  ('ev-wir-5', 'enum-elec-wire', 'Fiber Optic', 4),
  ('ev-ins-1', 'enum-elec-insulation', 'A', 0),
  ('ev-ins-2', 'enum-elec-insulation', 'B', 1),
  ('ev-ins-3', 'enum-elec-insulation', 'F', 2),
  ('ev-ins-4', 'enum-elec-insulation', 'H', 3),
  ('ev-ins-5', 'enum-elec-insulation', 'C', 4),
  ('ev-emc-1', 'enum-elec-emc', 'Class I', 0),
  ('ev-emc-2', 'enum-elec-emc', 'Class II', 1),
  ('ev-emc-3', 'enum-elec-emc', 'Class III', 2);

-- Link existing ENUM attributes to their enum_definitions
UPDATE attribute_definition SET enum_definition_id = 'enum-doc-category' WHERE name = 'category' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-materials' WHERE name = 'material' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-ssi-zone' WHERE name = 'installZone' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-ssi-mount' WHERE name = 'mountingType' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-circuit' WHERE name = 'circuitType' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-wire' WHERE name = 'wireType' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-insulation' WHERE name = 'insulationClass' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-emc' WHERE name = 'emcClass' AND data_type = 'ENUM';
