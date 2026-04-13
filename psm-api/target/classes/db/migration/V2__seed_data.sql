-- ============================================================
-- PSM SEED DATA
-- Covers: lifecycle, node types, link types, attribute views,
--         action catalog, and permissions for ps-default.
-- ============================================================

-- ============================================================
-- LIFECYCLE "Standard"
-- In Work → Frozen → Released → Obsolete
-- ============================================================

INSERT INTO lifecycle (id, name, description) VALUES
  ('lc-standard', 'Standard', 'Standard PLM lifecycle');

INSERT INTO lifecycle_state (id, lifecycle_id, name, is_initial, is_frozen, is_released, display_order) VALUES
  ('st-inwork',   'lc-standard', 'In Work',  1, 0, 0, 1),
  ('st-frozen',   'lc-standard', 'Frozen',   0, 1, 0, 2),
  ('st-released', 'lc-standard', 'Released', 0, 1, 1, 3),
  ('st-obsolete', 'lc-standard', 'Obsolete', 0, 1, 0, 4);

INSERT INTO lifecycle_transition (id, lifecycle_id, name, from_state_id, to_state_id, guard_expr, action_type, version_strategy) VALUES
  ('tr-freeze',   'lc-standard', 'Freeze',        'st-inwork',   'st-frozen',   NULL,                  'CASCADE_FROZEN', 'NONE'),
  ('tr-unfreeze', 'lc-standard', 'Unfreeze',      'st-frozen',   'st-inwork',   NULL,                  NULL,             'NONE'),
  ('tr-release',  'lc-standard', 'Release',       'st-frozen',   'st-released', 'all_signatures_done', NULL,             'REVISE'),
  ('tr-revise',   'lc-standard', 'Revise',        'st-released', 'st-inwork',   NULL,                  NULL,             'NONE'),
  ('tr-obsolete', 'lc-standard', 'Make Obsolete', 'st-released', 'st-obsolete', NULL,                  NULL,             'NONE');

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

INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible) VALUES
  -- In Work: reviewNote hidden
  ('asr-iw-01',  'ad-doc-review',  'st-inwork',   0, 0, 0),
  -- Frozen: all locked except reviewNote
  ('asr-fz-01',  'ad-doc-title',   'st-frozen',   1, 0, 1),
  ('asr-fz-02',  'ad-doc-version', 'st-frozen',   0, 0, 1),
  ('asr-fz-03',  'ad-doc-desc',    'st-frozen',   0, 0, 1),
  ('asr-fz-04',  'ad-doc-cat',     'st-frozen',   1, 0, 1),
  ('asr-fz-05',  'ad-doc-author',  'st-frozen',   1, 0, 1),
  ('asr-fz-06',  'ad-doc-review',  'st-frozen',   0, 1, 1),
  -- Released: all locked
  ('asr-rl-01',  'ad-doc-title',   'st-released', 1, 0, 1),
  ('asr-rl-02',  'ad-doc-version', 'st-released', 0, 0, 1),
  ('asr-rl-03',  'ad-doc-desc',    'st-released', 0, 0, 1),
  ('asr-rl-04',  'ad-doc-cat',     'st-released', 1, 0, 1),
  ('asr-rl-05',  'ad-doc-author',  'st-released', 1, 0, 1),
  ('asr-rl-06',  'ad-doc-review',  'st-released', 0, 0, 1),
  -- Obsolete: all locked, reviewNote hidden
  ('asr-ob-01',  'ad-doc-title',   'st-obsolete', 1, 0, 1),
  ('asr-ob-02',  'ad-doc-version', 'st-obsolete', 0, 0, 1),
  ('asr-ob-03',  'ad-doc-desc',    'st-obsolete', 0, 0, 1),
  ('asr-ob-04',  'ad-doc-cat',     'st-obsolete', 1, 0, 1),
  ('asr-ob-05',  'ad-doc-author',  'st-obsolete', 1, 0, 1),
  ('asr-ob-06',  'ad-doc-review',  'st-obsolete', 0, 0, 0);

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

INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible) VALUES
  -- Frozen
  ('asr-pfz-01', 'ad-part-name',     'st-frozen',   1, 0, 1),
  ('asr-pfz-02', 'ad-part-material', 'st-frozen',   0, 0, 1),
  ('asr-pfz-03', 'ad-part-weight',   'st-frozen',   0, 0, 1),
  ('asr-pfz-04', 'ad-part-drawing',  'st-frozen',   0, 0, 1),
  -- Released
  ('asr-prl-01', 'ad-part-name',     'st-released', 1, 0, 1),
  ('asr-prl-02', 'ad-part-material', 'st-released', 0, 0, 1),
  ('asr-prl-03', 'ad-part-weight',   'st-released', 0, 0, 1),
  ('asr-prl-04', 'ad-part-drawing',  'st-released', 0, 0, 1),
  -- Obsolete
  ('asr-pob-01', 'ad-part-name',     'st-obsolete', 1, 0, 1),
  ('asr-pob-02', 'ad-part-material', 'st-obsolete', 0, 0, 1),
  ('asr-pob-03', 'ad-part-weight',   'st-obsolete', 0, 0, 1),
  ('asr-pob-04', 'ad-part-drawing',  'st-obsolete', 0, 0, 1);

-- ============================================================
-- LINK TYPES
-- ============================================================

INSERT INTO link_type (id, name, description, source_node_type_id, target_node_type_id, link_policy, link_logical_id_label) VALUES
  ('lt-composed-of', 'composed_of',   'Part → Part composition',     'nt-part', 'nt-part',     'VERSION_TO_MASTER',  'Assembly Ref'),
  ('lt-doc-part',    'documented_by', 'Document references a Part',  'nt-part', 'nt-document', 'VERSION_TO_VERSION', 'Doc Ref'),
  ('lt-supersedes',  'supersedes',    'Part supersedes another Part', 'nt-part', 'nt-part',     'VERSION_TO_VERSION', 'Supersession Ref');

-- Cascade: freezing a composed_of parent cascades tr-freeze to In-Work children
INSERT INTO link_type_cascade (id, link_type_id, parent_transition_id, child_from_state_id, child_transition_id) VALUES
  ('ltc-composed-freeze', 'lt-composed-of', 'tr-freeze', 'st-inwork', 'tr-freeze');

-- ============================================================
-- ACTION CATALOG
-- ============================================================

INSERT INTO node_action (id, action_code, action_kind, display_name, description, handler_ref, display_category, requires_tx, is_default) VALUES
  -- Structural permission anchor (hidden from UI action list)
  ('act-read',        'READ',        'BUILTIN', 'Read',           'Read access to nodes of this type',           'noopActionHandler',       'STRUCTURAL', 0, 0),
  -- Operational actions
  ('act-checkout',    'CHECKOUT',    'BUILTIN', 'Checkout',       'Open a node for editing',                     'checkoutActionHandler',   'SECONDARY',  0, 1),
  ('act-checkin',     'CHECKIN',     'BUILTIN', 'Check In',       'Commit this node and close its transaction',  'checkinActionHandler',    'SECONDARY',  1, 1),
  ('act-update-node', 'UPDATE_NODE', 'BUILTIN', 'Update Node',    'Save attribute changes to the open version',  'updateNodeActionHandler', 'SECONDARY',  1, 1),
  ('act-transition',  'TRANSITION',  'BUILTIN', 'Transition',     'Apply a lifecycle state transition',          'transitionActionHandler', 'PRIMARY',    1, 0),
  ('act-sign',        'SIGN',        'BUILTIN', 'Sign',           'Record an electronic signature',              'signActionHandler',       'PRIMARY',    1, 1),
  ('act-create-link', 'CREATE_LINK', 'BUILTIN', 'Create Link',    'Add a link to another node',                  'createLinkActionHandler', 'SECONDARY',  1, 1),
  ('act-update-link', 'UPDATE_LINK', 'BUILTIN', 'Update Link',    'Modify link attributes',                      'updateLinkActionHandler', 'SECONDARY',  1, 1),
  ('act-delete-link', 'DELETE_LINK', 'BUILTIN', 'Delete Link',    'Remove a link between nodes',                 'deleteLinkActionHandler', 'DANGEROUS',  1, 1),
  ('act-baseline',    'BASELINE',    'BUILTIN', 'Create Baseline','Tag a frozen tree as a baseline',             'baselineActionHandler',   'SECONDARY',  0, 1);

-- Parameters for SIGN
INSERT INTO node_action_parameter (id, action_id, param_name, param_label, data_type, required, default_value, allowed_values, widget_type, display_order) VALUES
  ('nap-sign-meaning', 'act-sign', 'meaning', 'Meaning', 'ENUM',   1, 'Reviewed', '["Reviewed","Approved","Verified","Acknowledged"]', 'DROPDOWN', 1),
  ('nap-sign-comment', 'act-sign', 'comment', 'Comment', 'STRING', 0, NULL,       NULL,                                                 'TEXTAREA', 2);

-- Parameters for BASELINE
INSERT INTO node_action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-bl-name', 'act-baseline', 'name',        'Baseline Name', 'STRING', 1, 'TEXT',     1),
  ('nap-bl-desc', 'act-baseline', 'description', 'Description',   'STRING', 0, 'TEXTAREA', 2);

-- Parameters for CREATE_LINK
INSERT INTO node_action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-lnk-type',   'act-create-link', 'linkTypeId',    'Link Type',    'ENUM',     1, 'DROPDOWN', 1),
  ('nap-lnk-target', 'act-create-link', 'targetNodeId',  'Target Node',  'NODE_REF', 1, 'DROPDOWN', 2),
  ('nap-lnk-lid',    'act-create-link', 'linkLogicalId', 'Link ID',      'STRING',   1, 'TEXT',     3);

-- Parameters for UPDATE_LINK
INSERT INTO node_action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-ul-linkid', 'act-update-link', 'linkId',    'Link ID',         'STRING', 1, 'TEXT', 1),
  ('nap-ul-logid',  'act-update-link', 'logicalId', 'Link Logical ID', 'STRING', 0, 'TEXT', 2);

-- Parameters for DELETE_LINK
INSERT INTO node_action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-dl-linkid', 'act-delete-link', 'linkId', 'Link ID', 'STRING', 1, 'TEXT', 1);

-- ============================================================
-- NODE TYPE ACTIONS (node_type_action)
-- One row per (node_type, action[, transition]).
-- ============================================================

-- ── Document ────────────────────────────────────────────────
INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order) VALUES
  ('nta-rd-doc',  'nt-document', 'act-read',        'ENABLED', -20),
  ('nta-co-doc',  'nt-document', 'act-checkout',    'ENABLED', 100),
  ('nta-ci-doc',  'nt-document', 'act-checkin',     'ENABLED', 110),
  ('nta-un-doc',  'nt-document', 'act-update-node', 'ENABLED',  50),
  ('nta-sg-doc',  'nt-document', 'act-sign',        'ENABLED', 200),
  ('nta-cl-doc',  'nt-document', 'act-create-link', 'ENABLED', 300),
  ('nta-ul-doc',  'nt-document', 'act-update-link', 'ENABLED', 350),
  ('nta-dl-doc',  'nt-document', 'act-delete-link', 'ENABLED', 360),
  ('nta-bl-doc',  'nt-document', 'act-baseline',    'ENABLED', 400);

INSERT INTO node_type_action (id, node_type_id, action_id, status, transition_id, display_order) VALUES
  ('nta-tr-freeze-doc',   'nt-document', 'act-transition', 'ENABLED', 'tr-freeze',   10),
  ('nta-tr-unfreeze-doc', 'nt-document', 'act-transition', 'ENABLED', 'tr-unfreeze', 20),
  ('nta-tr-release-doc',  'nt-document', 'act-transition', 'ENABLED', 'tr-release',  30),
  ('nta-tr-revise-doc',   'nt-document', 'act-transition', 'ENABLED', 'tr-revise',   40),
  ('nta-tr-obsolete-doc', 'nt-document', 'act-transition', 'ENABLED', 'tr-obsolete', 50);

-- ── Part ────────────────────────────────────────────────────
INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order) VALUES
  ('nta-rd-prt',  'nt-part', 'act-read',        'ENABLED', -20),
  ('nta-co-prt',  'nt-part', 'act-checkout',    'ENABLED', 100),
  ('nta-ci-prt',  'nt-part', 'act-checkin',     'ENABLED', 110),
  ('nta-un-prt',  'nt-part', 'act-update-node', 'ENABLED',  50),
  ('nta-sg-prt',  'nt-part', 'act-sign',        'ENABLED', 200),
  ('nta-cl-prt',  'nt-part', 'act-create-link', 'ENABLED', 300),
  ('nta-ul-prt',  'nt-part', 'act-update-link', 'ENABLED', 350),
  ('nta-dl-prt',  'nt-part', 'act-delete-link', 'ENABLED', 360),
  ('nta-bl-prt',  'nt-part', 'act-baseline',    'ENABLED', 400);

INSERT INTO node_type_action (id, node_type_id, action_id, status, transition_id, display_order) VALUES
  ('nta-tr-freeze-prt',   'nt-part', 'act-transition', 'ENABLED', 'tr-freeze',   10),
  ('nta-tr-unfreeze-prt', 'nt-part', 'act-transition', 'ENABLED', 'tr-unfreeze', 20),
  ('nta-tr-release-prt',  'nt-part', 'act-transition', 'ENABLED', 'tr-release',  30),
  ('nta-tr-revise-prt',   'nt-part', 'act-transition', 'ENABLED', 'tr-revise',   40),
  ('nta-tr-obsolete-prt', 'nt-part', 'act-transition', 'ENABLED', 'tr-obsolete', 50);

-- ============================================================
-- NODE ACTION PERMISSIONS (for ps-default)
--
-- Each action carries its own explicit allowlist. Zero rows = open to all,
-- so every action that should be restricted must have at least one row.
-- Admins bypass all checks via isAdmin flag.
--
-- act-read              : DESIGNER + REVIEWER + READER
-- act-checkout          : DESIGNER
-- act-checkin           : DESIGNER
-- act-update-node       : DESIGNER
-- act-sign              : REVIEWER
-- act-create/update/delete-link: DESIGNER
-- act-baseline          : ADMIN only
-- act-transition        : state-scoped rows below
-- ============================================================

INSERT INTO node_action_permission (id, node_type_id, action_id, project_space_id, role_id, lifecycle_state_id) VALUES
  -- act-read: DESIGNER, REVIEWER, READER on both node types
  ('nap-rd-d-doc',  'nt-document', 'act-read',  'ps-default', 'role-designer', NULL),
  ('nap-rd-d-prt',  'nt-part',     'act-read',  'ps-default', 'role-designer', NULL),
  ('nap-rd-r-doc',  'nt-document', 'act-read',  'ps-default', 'role-reviewer', NULL),
  ('nap-rd-r-prt',  'nt-part',     'act-read',  'ps-default', 'role-reviewer', NULL),
  ('nap-rd-ro-doc', 'nt-document', 'act-read',  'ps-default', 'role-reader',   NULL),
  ('nap-rd-ro-prt', 'nt-part',     'act-read',  'ps-default', 'role-reader',   NULL),

  -- act-checkout: DESIGNER only
  ('nap-co-d-doc',  'nt-document', 'act-checkout',    'ps-default', 'role-designer', NULL),
  ('nap-co-d-prt',  'nt-part',     'act-checkout',    'ps-default', 'role-designer', NULL),

  -- act-checkin: DESIGNER only
  ('nap-ci-d-doc',  'nt-document', 'act-checkin',     'ps-default', 'role-designer', NULL),
  ('nap-ci-d-prt',  'nt-part',     'act-checkin',     'ps-default', 'role-designer', NULL),

  -- act-update-node: DESIGNER only
  ('nap-un-d-doc',  'nt-document', 'act-update-node', 'ps-default', 'role-designer', NULL),
  ('nap-un-d-prt',  'nt-part',     'act-update-node', 'ps-default', 'role-designer', NULL),

  -- act-sign: REVIEWER only
  ('nap-sg-r-doc',  'nt-document', 'act-sign',  'ps-default', 'role-reviewer', NULL),
  ('nap-sg-r-prt',  'nt-part',     'act-sign',  'ps-default', 'role-reviewer', NULL),

  -- act-create-link: DESIGNER
  ('nap-cl-d-doc',  'nt-document', 'act-create-link', 'ps-default', 'role-designer', NULL),
  ('nap-cl-d-prt',  'nt-part',     'act-create-link', 'ps-default', 'role-designer', NULL),

  -- act-update-link: DESIGNER
  ('nap-ul-d-doc',  'nt-document', 'act-update-link', 'ps-default', 'role-designer', NULL),
  ('nap-ul-d-prt',  'nt-part',     'act-update-link', 'ps-default', 'role-designer', NULL),

  -- act-delete-link: DESIGNER
  ('nap-dl-d-doc',  'nt-document', 'act-delete-link', 'ps-default', 'role-designer', NULL),
  ('nap-dl-d-prt',  'nt-part',     'act-delete-link', 'ps-default', 'role-designer', NULL),

  -- act-baseline: ADMIN only
  ('nap-bl-a-doc',  'nt-document', 'act-baseline', 'ps-default', 'role-admin', NULL),
  ('nap-bl-a-prt',  'nt-part',     'act-baseline', 'ps-default', 'role-admin', NULL),

  -- act-transition: st-inwork (freeze) → DESIGNER + ADMIN
  ('nap-tr-d-doc-iw', 'nt-document', 'act-transition', 'ps-default', 'role-designer', 'st-inwork'),
  ('nap-tr-d-prt-iw', 'nt-part',     'act-transition', 'ps-default', 'role-designer', 'st-inwork'),
  ('nap-tr-a-doc-iw', 'nt-document', 'act-transition', 'ps-default', 'role-admin',    'st-inwork'),
  ('nap-tr-a-prt-iw', 'nt-part',     'act-transition', 'ps-default', 'role-admin',    'st-inwork'),

  -- act-transition: st-frozen (reject/release) → REVIEWER + ADMIN only
  ('nap-tr-r-doc-fz', 'nt-document', 'act-transition', 'ps-default', 'role-reviewer', 'st-frozen'),
  ('nap-tr-r-prt-fz', 'nt-part',     'act-transition', 'ps-default', 'role-reviewer', 'st-frozen'),
  ('nap-tr-a-doc-fz', 'nt-document', 'act-transition', 'ps-default', 'role-admin',    'st-frozen'),
  ('nap-tr-a-prt-fz', 'nt-part',     'act-transition', 'ps-default', 'role-admin',    'st-frozen'),

  -- act-transition: st-released (revise + obsolete) → DESIGNER + ADMIN
  ('nap-tr-d-doc-rl', 'nt-document', 'act-transition', 'ps-default', 'role-designer', 'st-released'),
  ('nap-tr-d-prt-rl', 'nt-part',     'act-transition', 'ps-default', 'role-designer', 'st-released'),
  ('nap-tr-a-doc-rl', 'nt-document', 'act-transition', 'ps-default', 'role-admin',    'st-released'),
  ('nap-tr-a-prt-rl', 'nt-part',     'act-transition', 'ps-default', 'role-admin',    'st-released');

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
