-- ============================================================
-- PSM SEED DATA — Collapsed
-- Covers: lifecycle, node types, link types, attribute views,
--         action catalog, guards, and permissions for ps-default.
-- ============================================================

-- ============================================================
-- LIFECYCLE "Standard"
-- In Work → Frozen → Released → Obsolete
-- ============================================================

INSERT INTO lifecycle (id, name, description) VALUES
  ('lc-standard', 'Standard', 'Standard PLM lifecycle');

INSERT INTO lifecycle_state (id, lifecycle_id, name, is_initial, is_frozen, is_released, display_order, color) VALUES
  ('st-inwork',   'lc-standard', 'In Work',  1, 0, 0, 1, '#5b9cf6'),
  ('st-frozen',   'lc-standard', 'Frozen',   0, 1, 0, 2, '#a78bfa'),
  ('st-released', 'lc-standard', 'Released', 0, 1, 1, 3, '#34d399'),
  ('st-obsolete', 'lc-standard', 'Obsolete', 0, 1, 0, 4, '#94a3b8');

INSERT INTO lifecycle_transition (id, lifecycle_id, name, from_state_id, to_state_id, guard_expr, action_type, version_strategy) VALUES
  ('tr-freeze',   'lc-standard', 'Freeze',        'st-inwork',   'st-frozen',   NULL, 'CASCADE_FROZEN', 'NONE'),
  ('tr-unfreeze', 'lc-standard', 'Unfreeze',      'st-frozen',   'st-inwork',   NULL, NULL,             'NONE'),
  ('tr-release',  'lc-standard', 'Release',       'st-frozen',   'st-released', NULL, NULL,             'REVISE'),
  ('tr-revise',   'lc-standard', 'Revise',        'st-released', 'st-inwork',   NULL, NULL,             'NONE'),
  ('tr-obsolete', 'lc-standard', 'Make Obsolete', 'st-released', 'st-obsolete', NULL, NULL,             'NONE');

-- Signature requirements (replaces old guard_expr='all_signatures_done')
INSERT INTO signature_requirement (id, lifecycle_transition_id, role_required, display_order) VALUES
  ('sr-rel-01', 'tr-release', 'role-reviewer', 10),
  ('sr-rel-02', 'tr-release', 'role-admin',    20);

-- ============================================================
-- NODE TYPE "Document"
-- ============================================================

INSERT INTO node_type (id, name, description, lifecycle_id, logical_id_label, logical_id_pattern) VALUES
  ('nt-document', 'Document', 'Technical PLM document', 'lc-standard', 'Document Number', '[A-Z]{3}-\d{4}');

INSERT INTO attribute_definition
  (id, node_type_id, name, label, data_type, required, widget_type, display_order, display_section) VALUES
  ('ad-doc-title',   'nt-document', 'title',       'Title',       'STRING', 1, 'TEXT',     1, 'Identity'),
  ('ad-doc-version', 'nt-document', 'version',     'Version',     'STRING', 0, 'TEXT',     2, 'Identity'),
  ('ad-doc-desc',    'nt-document', 'description', 'Description', 'STRING', 0, 'TEXTAREA', 3, 'General'),
  ('ad-doc-cat',     'nt-document', 'category',    'Category',    'ENUM',   1, 'DROPDOWN', 4, 'General'),
  ('ad-doc-author',  'nt-document', 'author',      'Author',      'STRING', 1, 'TEXT',     5, 'General'),
  ('ad-doc-review',  'nt-document', 'reviewNote',  'Review Note', 'STRING', 0, 'TEXTAREA', 6, 'Review');

UPDATE attribute_definition SET allowed_values = '["Design","Test","Spec","Procedure","Report"]'
WHERE id = 'ad-doc-cat';

INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible, node_type_id) VALUES
  -- In Work: reviewNote hidden
  ('asr-iw-01',  'ad-doc-review',  'st-inwork',   0, 0, 0, 'nt-document'),
  -- Frozen: all locked except reviewNote
  ('asr-fz-01',  'ad-doc-title',   'st-frozen',   1, 0, 1, 'nt-document'),
  ('asr-fz-02',  'ad-doc-version', 'st-frozen',   0, 0, 1, 'nt-document'),
  ('asr-fz-03',  'ad-doc-desc',    'st-frozen',   0, 0, 1, 'nt-document'),
  ('asr-fz-04',  'ad-doc-cat',     'st-frozen',   1, 0, 1, 'nt-document'),
  ('asr-fz-05',  'ad-doc-author',  'st-frozen',   1, 0, 1, 'nt-document'),
  ('asr-fz-06',  'ad-doc-review',  'st-frozen',   0, 1, 1, 'nt-document'),
  -- Released: all locked
  ('asr-rl-01',  'ad-doc-title',   'st-released', 1, 0, 1, 'nt-document'),
  ('asr-rl-02',  'ad-doc-version', 'st-released', 0, 0, 1, 'nt-document'),
  ('asr-rl-03',  'ad-doc-desc',    'st-released', 0, 0, 1, 'nt-document'),
  ('asr-rl-04',  'ad-doc-cat',     'st-released', 1, 0, 1, 'nt-document'),
  ('asr-rl-05',  'ad-doc-author',  'st-released', 1, 0, 1, 'nt-document'),
  ('asr-rl-06',  'ad-doc-review',  'st-released', 0, 0, 1, 'nt-document'),
  -- Obsolete: all locked, reviewNote hidden
  ('asr-ob-01',  'ad-doc-title',   'st-obsolete', 1, 0, 1, 'nt-document'),
  ('asr-ob-02',  'ad-doc-version', 'st-obsolete', 0, 0, 1, 'nt-document'),
  ('asr-ob-03',  'ad-doc-desc',    'st-obsolete', 0, 0, 1, 'nt-document'),
  ('asr-ob-04',  'ad-doc-cat',     'st-obsolete', 1, 0, 1, 'nt-document'),
  ('asr-ob-05',  'ad-doc-author',  'st-obsolete', 1, 0, 1, 'nt-document'),
  ('asr-ob-06',  'ad-doc-review',  'st-obsolete', 0, 0, 0, 'nt-document');

-- ============================================================
-- NODE TYPE "Part"
-- ============================================================

INSERT INTO node_type (id, name, description, lifecycle_id, logical_id_label, logical_id_pattern) VALUES
  ('nt-part', 'Part', 'Mechanical part or assembly', 'lc-standard', 'Part Number', 'P-\d{6}');

INSERT INTO attribute_definition
  (id, node_type_id, name, label, data_type, required, widget_type, display_order, display_section) VALUES
  ('ad-part-name',     'nt-part', 'name',       'Name',        'STRING', 1, 'TEXT',     1, 'Identity'),
  ('ad-part-material', 'nt-part', 'material',   'Material',    'ENUM',   0, 'DROPDOWN', 2, 'Technical'),
  ('ad-part-weight',   'nt-part', 'weight',     'Weight (kg)', 'NUMBER', 0, 'TEXT',     3, 'Technical'),
  ('ad-part-drawing',  'nt-part', 'drawingRef', 'Drawing Ref', 'STRING', 0, 'TEXT',     4, 'Technical');

UPDATE attribute_definition SET allowed_values = '["Steel","Aluminum","Titanium","Composite","Plastic"]'
WHERE id = 'ad-part-material';

INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible, node_type_id) VALUES
  -- Frozen
  ('asr-pfz-01', 'ad-part-name',     'st-frozen',   1, 0, 1, 'nt-part'),
  ('asr-pfz-02', 'ad-part-material', 'st-frozen',   0, 0, 1, 'nt-part'),
  ('asr-pfz-03', 'ad-part-weight',   'st-frozen',   0, 0, 1, 'nt-part'),
  ('asr-pfz-04', 'ad-part-drawing',  'st-frozen',   0, 0, 1, 'nt-part'),
  -- Released
  ('asr-prl-01', 'ad-part-name',     'st-released', 1, 0, 1, 'nt-part'),
  ('asr-prl-02', 'ad-part-material', 'st-released', 0, 0, 1, 'nt-part'),
  ('asr-prl-03', 'ad-part-weight',   'st-released', 0, 0, 1, 'nt-part'),
  ('asr-prl-04', 'ad-part-drawing',  'st-released', 0, 0, 1, 'nt-part'),
  -- Obsolete
  ('asr-pob-01', 'ad-part-name',     'st-obsolete', 1, 0, 1, 'nt-part'),
  ('asr-pob-02', 'ad-part-material', 'st-obsolete', 0, 0, 1, 'nt-part'),
  ('asr-pob-03', 'ad-part-weight',   'st-obsolete', 0, 0, 1, 'nt-part'),
  ('asr-pob-04', 'ad-part-drawing',  'st-obsolete', 0, 0, 1, 'nt-part');

-- ============================================================
-- LINK TYPES
-- ============================================================

INSERT INTO link_type (id, name, description, source_node_type_id, target_node_type_id, link_policy, link_logical_id_label) VALUES
  ('lt-composed-of', 'composed_of',   'Part → Part composition',      'nt-part', 'nt-part',     'VERSION_TO_MASTER',  'Assembly Ref'),
  ('lt-doc-part',    'documented_by', 'Document references a Part',   'nt-part', 'nt-document', 'VERSION_TO_VERSION', 'Doc Ref'),
  ('lt-supersedes',  'supersedes',    'Part supersedes another Part', 'nt-part', 'nt-part',     'VERSION_TO_VERSION', 'Supersession Ref');

INSERT INTO link_type_cascade (id, link_type_id, parent_transition_id, child_from_state_id, child_transition_id) VALUES
  ('ltc-composed-freeze', 'lt-composed-of', 'tr-freeze', 'st-inwork', 'tr-freeze');

-- ============================================================
-- ACTION CATALOG
-- ============================================================

INSERT INTO action (id, action_code, action_kind, scope, display_name, description, handler_ref, display_category, requires_tx, tx_mode, display_order) VALUES
  -- Structural permission anchors (hidden from UI)
  ('act-read',             'READ',             'BUILTIN', 'NODE',      'Read',                      'Read access to nodes of this type',                                             'noopActionHandler',       'STRUCTURAL', 0, 'NONE',     -20),
  ('act-manage-metamodel', 'MANAGE_METAMODEL', 'BUILTIN', 'GLOBAL',    'Manage Metamodel',          'Create/update/delete lifecycle, node types, link types, attribute definitions',   '_global',                 'STRUCTURAL', 0, 'NONE',       0),
  ('act-manage-roles',     'MANAGE_ROLES',     'BUILTIN', 'GLOBAL',    'Manage Roles & Permissions','Configure action permissions, views, and view overrides',                        '_global',                 'STRUCTURAL', 0, 'NONE',       0),
  ('act-manage-baselines', 'MANAGE_BASELINES', 'BUILTIN', 'GLOBAL',    'Manage Baselines',          'Create baselines (service-level, outside action dispatch)',                      '_global',                 'STRUCTURAL', 0, 'NONE',       0),
  ('act-manage-lifecycle', 'MANAGE_LIFECYCLE', 'BUILTIN', 'GLOBAL',    'Manage Lifecycle',          'Create/update/delete lifecycles, states, transitions, signature requirements',   '_global',                 'STRUCTURAL', 0, 'NONE',       0),
  -- Operational actions
  ('act-checkout',    'CHECKOUT',    'BUILTIN', 'NODE',      'Checkout',        'Open a node for editing',                    'checkoutActionHandler',   'SECONDARY',  0, 'AUTO_OPEN', 100),
  ('act-checkin',     'CHECKIN',     'BUILTIN', 'NODE',      'Check In',        'Commit this node and close its transaction', 'checkinActionHandler',    'SECONDARY',  1, 'REQUIRED',  110),
  ('act-update-node', 'UPDATE_NODE', 'BUILTIN', 'NODE',      'Update Node',     'Save attribute changes to the open version', 'updateNodeActionHandler', 'SECONDARY',  1, 'REQUIRED',   50),
  ('act-transition',  'TRANSITION',  'BUILTIN', 'LIFECYCLE', 'Transition',      'Apply a lifecycle state transition',         'transitionActionHandler', 'PRIMARY',    1, 'ISOLATED',   10),
  ('act-sign',        'SIGN',        'BUILTIN', 'NODE',      'Sign',            'Record an electronic signature',             'signActionHandler',       'PRIMARY',    1, 'ISOLATED',  200),
  ('act-create-link', 'CREATE_LINK', 'BUILTIN', 'NODE',      'Create Link',     'Add a link to another node',                 'createLinkActionHandler', 'SECONDARY',  1, 'AUTO_OPEN', 300),
  ('act-update-link', 'UPDATE_LINK', 'BUILTIN', 'NODE',      'Update Link',     'Modify link attributes',                     'updateLinkActionHandler', 'SECONDARY',  1, 'AUTO_OPEN', 350),
  ('act-delete-link', 'DELETE_LINK', 'BUILTIN', 'NODE',      'Delete Link',     'Remove a link between nodes',                'deleteLinkActionHandler', 'DANGEROUS',  1, 'AUTO_OPEN', 360),
  ('act-baseline',    'BASELINE',    'BUILTIN', 'NODE',      'Create Baseline', 'Tag a frozen tree as a baseline',            'baselineActionHandler',   'SECONDARY',  0, 'NONE',      400),
  -- TX-scope actions
  ('act-commit',      'COMMIT',      'BUILTIN', 'TX',        'Commit',          'Commit transaction',                         'commitActionHandler',     'STRUCTURAL', 1, 'REQUIRED',  900),
  ('act-rollback',    'ROLLBACK',    'BUILTIN', 'TX',        'Rollback',        'Rollback transaction',                       'rollbackActionHandler',   'STRUCTURAL', 1, 'REQUIRED',  910),
  -- NODE-scope cancel
  ('act-cancel',      'CANCEL',      'BUILTIN', 'NODE',      'Cancel',          'Release node from transaction',              'cancelActionHandler',     'DANGEROUS',  1, 'REQUIRED',  800);

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

-- ============================================================
-- ACTION PERMISSIONS (for ps-default)
-- ============================================================

INSERT INTO action_permission (id, action_id, project_space_id, role_id, node_type_id, transition_id) VALUES
  -- act-read: DESIGNER, REVIEWER, READER on both node types
  ('nap-rd-d-doc',  'act-read', 'ps-default', 'role-designer', 'nt-document', NULL),
  ('nap-rd-d-prt',  'act-read', 'ps-default', 'role-designer', 'nt-part',     NULL),
  ('nap-rd-r-doc',  'act-read', 'ps-default', 'role-reviewer', 'nt-document', NULL),
  ('nap-rd-r-prt',  'act-read', 'ps-default', 'role-reviewer', 'nt-part',     NULL),
  ('nap-rd-ro-doc', 'act-read', 'ps-default', 'role-reader',   'nt-document', NULL),
  ('nap-rd-ro-prt', 'act-read', 'ps-default', 'role-reader',   'nt-part',     NULL),

  -- act-checkout: DESIGNER only
  ('nap-co-d-doc',  'act-checkout',    'ps-default', 'role-designer', 'nt-document', NULL),
  ('nap-co-d-prt',  'act-checkout',    'ps-default', 'role-designer', 'nt-part',     NULL),

  -- act-checkin: DESIGNER only
  ('nap-ci-d-doc',  'act-checkin',     'ps-default', 'role-designer', 'nt-document', NULL),
  ('nap-ci-d-prt',  'act-checkin',     'ps-default', 'role-designer', 'nt-part',     NULL),

  -- act-update-node: DESIGNER only
  ('nap-un-d-doc',  'act-update-node', 'ps-default', 'role-designer', 'nt-document', NULL),
  ('nap-un-d-prt',  'act-update-node', 'ps-default', 'role-designer', 'nt-part',     NULL),

  -- act-sign: REVIEWER only
  ('nap-sg-r-doc',  'act-sign',        'ps-default', 'role-reviewer', 'nt-document', NULL),
  ('nap-sg-r-prt',  'act-sign',        'ps-default', 'role-reviewer', 'nt-part',     NULL),

  -- act-create-link: DESIGNER
  ('nap-cl-d-doc',  'act-create-link', 'ps-default', 'role-designer', 'nt-document', NULL),
  ('nap-cl-d-prt',  'act-create-link', 'ps-default', 'role-designer', 'nt-part',     NULL),

  -- act-update-link: DESIGNER
  ('nap-ul-d-doc',  'act-update-link', 'ps-default', 'role-designer', 'nt-document', NULL),
  ('nap-ul-d-prt',  'act-update-link', 'ps-default', 'role-designer', 'nt-part',     NULL),

  -- act-delete-link: DESIGNER
  ('nap-dl-d-doc',  'act-delete-link', 'ps-default', 'role-designer', 'nt-document', NULL),
  ('nap-dl-d-prt',  'act-delete-link', 'ps-default', 'role-designer', 'nt-part',     NULL),

  -- act-baseline: ADMIN only
  ('nap-bl-a-doc',  'act-baseline',    'ps-default', 'role-admin',    'nt-document', NULL),
  ('nap-bl-a-prt',  'act-baseline',    'ps-default', 'role-admin',    'nt-part',     NULL),

  -- act-transition: per transition (LIFECYCLE scope)
  -- tr-freeze: DESIGNER + ADMIN
  ('ap-tr-d-doc-freeze',   'act-transition', 'ps-default', 'role-designer', 'nt-document', 'tr-freeze'),
  ('ap-tr-a-doc-freeze',   'act-transition', 'ps-default', 'role-admin',    'nt-document', 'tr-freeze'),
  ('ap-tr-d-prt-freeze',   'act-transition', 'ps-default', 'role-designer', 'nt-part',     'tr-freeze'),
  ('ap-tr-a-prt-freeze',   'act-transition', 'ps-default', 'role-admin',    'nt-part',     'tr-freeze'),
  -- tr-unfreeze: ADMIN only
  ('ap-tr-a-doc-unfreeze', 'act-transition', 'ps-default', 'role-admin',    'nt-document', 'tr-unfreeze'),
  ('ap-tr-a-prt-unfreeze', 'act-transition', 'ps-default', 'role-admin',    'nt-part',     'tr-unfreeze'),
  -- tr-release: REVIEWER + ADMIN
  ('ap-tr-r-doc-release',  'act-transition', 'ps-default', 'role-reviewer', 'nt-document', 'tr-release'),
  ('ap-tr-a-doc-release',  'act-transition', 'ps-default', 'role-admin',    'nt-document', 'tr-release'),
  ('ap-tr-r-prt-release',  'act-transition', 'ps-default', 'role-reviewer', 'nt-part',     'tr-release'),
  ('ap-tr-a-prt-release',  'act-transition', 'ps-default', 'role-admin',    'nt-part',     'tr-release'),
  -- tr-revise: DESIGNER + ADMIN
  ('ap-tr-d-doc-revise',   'act-transition', 'ps-default', 'role-designer', 'nt-document', 'tr-revise'),
  ('ap-tr-a-doc-revise',   'act-transition', 'ps-default', 'role-admin',    'nt-document', 'tr-revise'),
  ('ap-tr-d-prt-revise',   'act-transition', 'ps-default', 'role-designer', 'nt-part',     'tr-revise'),
  ('ap-tr-a-prt-revise',   'act-transition', 'ps-default', 'role-admin',    'nt-part',     'tr-revise'),
  -- tr-obsolete: ADMIN only
  ('ap-tr-a-doc-obsolete', 'act-transition', 'ps-default', 'role-admin',    'nt-document', 'tr-obsolete'),
  ('ap-tr-a-prt-obsolete', 'act-transition', 'ps-default', 'role-admin',    'nt-part',     'tr-obsolete'),

  -- GLOBAL-scope: ADMIN only
  ('ap-gl-mm-admin',  'act-manage-metamodel',  'ps-default', 'role-admin', NULL, NULL),
  ('ap-gl-rl-admin',  'act-manage-roles',      'ps-default', 'role-admin', NULL, NULL),
  ('ap-gl-bl-admin',  'act-manage-baselines',  'ps-default', 'role-admin', NULL, NULL),
  ('ap-gl-mlc-admin', 'act-manage-lifecycle',  'ps-default', 'role-admin', NULL, NULL);

-- ============================================================
-- ATTRIBUTE VIEWS
-- ============================================================

-- Reviewer view on Document when Frozen: surfaces reviewNote first
INSERT INTO attribute_view (id, node_type_id, name, description, eligible_role_id, eligible_state_id, priority) VALUES
  ('view-reviewer-frozen', 'nt-document', 'Reviewer Frozen View',
   'Optimised for reviewer during Frozen phase',
   'role-reviewer', 'st-frozen', 10);

INSERT INTO view_attribute_override (id, view_id, attribute_def_id, visible, editable, display_order, display_section) VALUES
  ('vao-f1', 'view-reviewer-frozen', 'ad-doc-review', 1, 1, 1, 'Review'),
  ('vao-f2', 'view-reviewer-frozen', 'ad-doc-title',  1, 0, 2, 'Identity'),
  ('vao-f3', 'view-reviewer-frozen', 'ad-doc-desc',   1, 0, 3, 'General');

-- Reader view on Document: hides internal review note
INSERT INTO attribute_view (id, node_type_id, name, description, eligible_role_id, eligible_state_id, priority) VALUES
  ('view-reader-all', 'nt-document', 'Reader View',
   'Simplified view for readers — hides internal fields',
   'role-reader', NULL, 5);

INSERT INTO view_attribute_override (id, view_id, attribute_def_id, visible, editable, display_order, display_section) VALUES
  ('vao-r1', 'view-reader-all', 'ad-doc-review', 0, 0, NULL, NULL);

-- ============================================================
-- ALGORITHM TYPES
-- ============================================================

INSERT INTO algorithm_type (id, name, description, java_interface) VALUES
  ('algtype-action-guard',    'Action Guard',    'Checks node/action state preconditions (frozen, locked, ownership)',       'com.plm.domain.guard.Guard'),
  ('algtype-lifecycle-guard', 'Lifecycle Guard', 'Checks lifecycle transition preconditions (required fields, signatures)', 'com.plm.domain.guard.Guard');

-- ============================================================
-- GUARD ALGORITHMS
-- ============================================================

-- Action Guards
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-not-frozen',          'algtype-action-guard', 'not_frozen',               'Not Frozen',               'Node must not be in a frozen lifecycle state',                 'notFrozenGuard'),
  ('alg-not-locked',          'algtype-action-guard', 'not_locked',               'Not Locked',               'Node must not be locked by any user',                          'notLockedGuard'),
  ('alg-lock-owner-required', 'algtype-action-guard', 'lock_owner_required',      'Lock Owner Required',      'Current user must own the lock on this node',                  'lockOwnerRequiredGuard'),
  ('alg-from-state-match',    'algtype-action-guard', 'from_state_match',         'From State Match',         'Node must be in the transition source state',                  'fromStateMatchGuard'),
  ('alg-not-already-signed',  'algtype-action-guard', 'not_already_signed',       'Not Already Signed',       'User must not have already signed current revision.iteration', 'notAlreadySignedGuard'),
  ('alg-has-sig-requirement', 'algtype-action-guard', 'has_signature_requirement','Has Signature Requirement','At least one outgoing transition requires signatures',         'hasSignatureRequirementGuard');

-- Lifecycle Guards
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-all-required-filled', 'algtype-lifecycle-guard', 'all_required_filled', 'All Required Filled', 'All required attributes for target state must have values', 'allRequiredFilledGuard'),
  ('alg-all-signatures-done', 'algtype-lifecycle-guard', 'all_signatures_done', 'All Signatures Done', 'All required signatures must be collected',                 'allSignaturesDoneGuard');

-- ============================================================
-- ALGORITHM INSTANCES (one per guard, no parameters)
-- ============================================================

INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('gi-not-frozen',         'alg-not-frozen',          'Not Frozen'),
  ('gi-not-locked',         'alg-not-locked',          'Not Locked'),
  ('gi-lock-owner',         'alg-lock-owner-required', 'Lock Owner Required'),
  ('gi-from-state',         'alg-from-state-match',    'From State Match'),
  ('gi-not-already-signed', 'alg-not-already-signed',  'Not Already Signed'),
  ('gi-has-sig-req',        'alg-has-sig-requirement', 'Has Signature Requirement'),
  ('gi-all-required',       'alg-all-required-filled', 'All Required Filled'),
  ('gi-all-signatures',     'alg-all-signatures-done', 'All Signatures Done');

-- ============================================================
-- ACTION-LEVEL GUARDS (tier 1)
-- ============================================================

INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES
  -- CHECKOUT: not_frozen, not_locked
  ('ag-checkout-frozen', 'act-checkout', 'gi-not-frozen', 'HIDE', 1),
  ('ag-checkout-locked', 'act-checkout', 'gi-not-locked', 'HIDE', 2),
  -- CHECKIN, UPDATE_NODE, CREATE_LINK, UPDATE_LINK, DELETE_LINK: lock_owner_required
  ('ag-checkin-owner',   'act-checkin',     'gi-lock-owner', 'HIDE', 1),
  ('ag-update-owner',    'act-update-node', 'gi-lock-owner', 'HIDE', 1),
  ('ag-clink-owner',     'act-create-link', 'gi-lock-owner', 'HIDE', 1),
  ('ag-ulink-owner',     'act-update-link', 'gi-lock-owner', 'HIDE', 1),
  ('ag-dlink-owner',     'act-delete-link', 'gi-lock-owner', 'HIDE', 1),
  -- TRANSITION: from_state_match, not_locked
  ('ag-trans-state',     'act-transition', 'gi-from-state', 'HIDE', 1),
  ('ag-trans-locked',    'act-transition', 'gi-not-locked', 'HIDE', 2),
  -- SIGN: has_signature_requirement, not_already_signed
  ('ag-sign-req',        'act-sign', 'gi-has-sig-req',        'HIDE', 1),
  ('ag-sign-already',    'act-sign', 'gi-not-already-signed', 'HIDE', 2),
  -- CANCEL: lock_owner_required
  ('ag-cancel-owner',    'act-cancel', 'gi-lock-owner', 'HIDE', 1);

-- ============================================================
-- LIFECYCLE TRANSITION GUARDS (tier 2)
-- ============================================================

INSERT INTO lifecycle_transition_guard (id, lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES
  -- tr-release: all signatures must be done (BLOCK)
  ('ltg-release-sig',      'tr-release', 'gi-all-signatures', 'BLOCK', 1),
  -- tr-freeze: all required attributes must be filled (BLOCK)
  ('ltg-freeze-required',  'tr-freeze',  'gi-all-required',   'BLOCK', 1);
