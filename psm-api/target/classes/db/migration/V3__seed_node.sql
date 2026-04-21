-- ============================================================
-- NODE MODULE SEED
-- Lifecycle, node types, attributes, views, link types,
-- cascades, signatures, entity metadata, state actions
-- ============================================================

-- ============================================================
-- LIFECYCLE "Standard"
-- In Work -> Frozen -> Released -> Obsolete
--
-- Version strategy: REVISE on Revise (Released -> In Work),
-- creates new revision. Release itself is NONE.
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

-- Signature requirements for Release
INSERT INTO signature_requirement (id, lifecycle_transition_id, role_required, display_order) VALUES
  ('sr-rel-01', 'tr-release', 'role-reviewer', 10),
  ('sr-rel-02', 'tr-release', 'role-admin',    20);

-- ============================================================
-- ENTITY METADATA (replaces is_frozen / is_released columns)
-- ============================================================

INSERT INTO entity_metadata (id, target_type, target_id, meta_key, meta_value) VALUES
  ('em-st-frozen-frozen',     'LIFECYCLE_STATE', 'st-frozen',   'frozen',   'true'),
  ('em-st-released-frozen',   'LIFECYCLE_STATE', 'st-released', 'frozen',   'true'),
  ('em-st-released-released', 'LIFECYCLE_STATE', 'st-released', 'released', 'true'),
  ('em-st-obsolete-frozen',   'LIFECYCLE_STATE', 'st-obsolete', 'frozen',   'true');

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
  ('lt-composed-of', 'composed_of',   'Part -> Part composition',      'nt-part', 'nt-part',     'VERSION_TO_MASTER',  'Assembly Ref'),
  ('lt-doc-part',    'documented_by', 'Document references a Part',   'nt-part', 'nt-document', 'VERSION_TO_VERSION', 'Doc Ref'),
  ('lt-supersedes',  'supersedes',    'Part supersedes another Part', 'nt-part', 'nt-part',     'VERSION_TO_VERSION', 'Supersession Ref');

INSERT INTO link_type_cascade (id, link_type_id, parent_transition_id, child_from_state_id, child_transition_id) VALUES
  ('ltc-composed-freeze', 'lt-composed-of', 'tr-freeze', 'st-inwork', 'tr-freeze');

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
-- LIFECYCLE STATE ACTIONS
-- ============================================================

-- Collapse history fires ON_ENTER Released (cleans up iteration history)
INSERT INTO lifecycle_state_action (id, lifecycle_state_id, algorithm_instance_id, trigger, execution_mode, display_order) VALUES
  ('lsa-released-collapse', 'st-released', 'si-collapse-history', 'ON_ENTER', 'TRANSACTIONAL', 10);

-- ============================================================
-- LIFECYCLE TRANSITION GUARDS (tier 2)
-- ============================================================

INSERT INTO lifecycle_transition_guard (id, lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES
  -- tr-release: all signatures must be done, no rejected signatures
  ('ltg-release-sig',         'tr-release',  'gi-all-signatures',   'BLOCK', 1),
  ('ltg-release-no-rejected', 'tr-release',  'gi-sig-no-rejected',  'BLOCK', 2),
  -- tr-freeze: all required attributes must be filled
  ('ltg-freeze-required',     'tr-freeze',   'gi-all-required',     'BLOCK', 1),
  -- tr-unfreeze: only available when a signature was rejected
  ('ltg-unfreeze-has-rejected','tr-unfreeze', 'gi-sig-has-rejected', 'BLOCK', 1);
