-- ============================================================
-- PLM SEED DATA — Consolidated final seed
-- Covers: project space, roles/users, lifecycle (Standard v2),
--         node types (Document + Part), link types,
--         node type permissions, attribute views.
-- ============================================================

-- ============================================================
-- PROJECT SPACE
-- ============================================================

INSERT INTO project_space (id, name, description, created_at) VALUES
  ('ps-default', 'Default', 'Default project space', CURRENT_TIMESTAMP);

-- ============================================================
-- ROLES & USERS
-- ============================================================

INSERT INTO plm_role (id, name, description, is_admin) VALUES
  ('role-admin',    'ADMIN',    'Administrateur PLM - accès total',           1),
  ('role-designer', 'DESIGNER', 'Concepteur - crée et modifie les documents', 0),
  ('role-reviewer', 'REVIEWER', 'Relecteur - consulte et signe',              0),
  ('role-reader',   'READER',   'Lecteur - consultation seule',               0);

INSERT INTO plm_user (id, username, display_name, email, active) VALUES
  ('user-admin',   'admin',   'PLM Administrator', 'admin@plm.local',   1),
  ('user-alice',   'alice',   'Alice Dupont',       'alice@plm.local',   1),
  ('user-bob',     'bob',     'Bob Martin',         'bob@plm.local',     1),
  ('user-charlie', 'charlie', 'Charlie Leclerc',    'charlie@plm.local', 1);

INSERT INTO user_role (id, user_id, role_id) VALUES
  ('ur-1', 'user-admin',   'role-admin'),
  ('ur-2', 'user-alice',   'role-designer'),
  ('ur-3', 'user-bob',     'role-reviewer'),
  ('ur-4', 'user-charlie', 'role-reader');

-- ============================================================
-- LIFECYCLE "Standard" — In Work → Frozen → Released → Obsolete
-- ============================================================

INSERT INTO lifecycle (id, name, description) VALUES
  ('lc-standard', 'Standard', 'Lifecycle PLM standard');

INSERT INTO lifecycle_state (id, lifecycle_id, name, is_initial, is_frozen, is_released, display_order) VALUES
  ('st-inwork',   'lc-standard', 'In Work',  1, 0, 0, 1),
  ('st-frozen',   'lc-standard', 'Frozen',   0, 1, 0, 2),
  ('st-released', 'lc-standard', 'Released', 0, 1, 1, 3),
  ('st-obsolete', 'lc-standard', 'Obsolete', 0, 1, 0, 4);

-- version_strategy: NONE = traceability only, REVISE = new revision (A.x → B.1)
INSERT INTO lifecycle_transition (id, lifecycle_id, name, from_state_id, to_state_id, guard_expr, action_type, version_strategy) VALUES
  ('tr-freeze',   'lc-standard', 'Freeze',       'st-inwork',   'st-frozen',   NULL,                  'CASCADE_FROZEN', 'NONE'),
  ('tr-unfreeze', 'lc-standard', 'Unfreeze',     'st-frozen',   'st-inwork',   NULL,                  NULL,             'NONE'),
  ('tr-release',  'lc-standard', 'Release',      'st-frozen',   'st-released', 'all_signatures_done', NULL,             'REVISE'),
  ('tr-revise',   'lc-standard', 'Revise',       'st-released', 'st-inwork',   NULL,                  NULL,             'NONE'),
  ('tr-obsolete', 'lc-standard', 'Make Obsolete','st-released', 'st-obsolete', NULL,                  NULL,             'NONE');

INSERT INTO transition_permission (id, transition_id, role_id) VALUES
  -- freeze : DESIGNER + ADMIN
  ('tp-f1',  'tr-freeze',   'role-designer'),
  ('tp-f2',  'tr-freeze',   'role-admin'),
  -- unfreeze : DESIGNER + ADMIN
  ('tp-uf1', 'tr-unfreeze', 'role-designer'),
  ('tp-uf2', 'tr-unfreeze', 'role-admin'),
  -- release : REVIEWER + ADMIN (requires all signatures)
  ('tp-rl1', 'tr-release',  'role-reviewer'),
  ('tp-rl2', 'tr-release',  'role-admin'),
  -- revise : DESIGNER + ADMIN
  ('tp-rv1', 'tr-revise',   'role-designer'),
  ('tp-rv2', 'tr-revise',   'role-admin'),
  -- obsolete : ADMIN only
  ('tp-ob1', 'tr-obsolete', 'role-admin');

-- ============================================================
-- NODE TYPE "Document"
-- ============================================================

INSERT INTO node_type (id, name, description, lifecycle_id, logical_id_label, logical_id_pattern) VALUES
  ('nt-document', 'Document', 'Document technique PLM', 'lc-standard', 'Document Number', '[A-Z]{3}-\d{4}');

INSERT INTO attribute_definition
  (id, node_type_id, name, label, data_type, required, naming_regex, widget_type, display_order, display_section) VALUES
  ('ad-doc-title',   'nt-document', 'title',       'Title',       'STRING', 1, NULL, 'TEXT',     1, 'Identity'),
  ('ad-doc-version', 'nt-document', 'version',     'Version',     'STRING', 0, NULL, 'TEXT',     2, 'Identity'),
  ('ad-doc-desc',    'nt-document', 'description', 'Description', 'STRING', 0, NULL, 'TEXTAREA', 3, 'General'),
  ('ad-doc-cat',     'nt-document', 'category',    'Category',    'ENUM',   1, NULL, 'DROPDOWN', 4, 'General'),
  ('ad-doc-author',  'nt-document', 'author',      'Author',      'STRING', 1, NULL, 'TEXT',     5, 'General'),
  ('ad-doc-review',  'nt-document', 'reviewNote',  'Review Note', 'STRING', 0, NULL, 'TEXTAREA', 6, 'Review');

UPDATE attribute_definition SET allowed_values = '["Design","Test","Spec","Procedure","Report"]'
WHERE id = 'ad-doc-cat';

-- Document × state rules (final state after all lifecycle iterations)
-- In Work   : reviewNote hidden + locked (no review context yet)
-- Frozen    : everything locked except reviewNote (open for reviewer)
-- Released  : everything locked, reviewNote visible but locked
-- Obsolete  : everything locked, reviewNote hidden
INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible) VALUES
  -- In Work
  ('asr-iw-01', 'ad-doc-review', 'st-inwork', 0, 0, 0),
  -- Frozen
  ('asr-17', 'ad-doc-title',   'st-frozen', 1, 0, 1),
  ('asr-18', 'ad-doc-version', 'st-frozen', 0, 0, 1),
  ('asr-19', 'ad-doc-desc',    'st-frozen', 0, 0, 1),
  ('asr-20', 'ad-doc-cat',     'st-frozen', 1, 0, 1),
  ('asr-21', 'ad-doc-author',  'st-frozen', 1, 0, 1),
  ('asr-22', 'ad-doc-review',  'st-frozen', 0, 1, 1),
  -- Released
  ('asr-10', 'ad-doc-title',   'st-released', 1, 0, 1),
  ('asr-11', 'ad-doc-version', 'st-released', 0, 0, 1),
  ('asr-12', 'ad-doc-desc',    'st-released', 0, 0, 1),
  ('asr-13', 'ad-doc-cat',     'st-released', 1, 0, 1),
  ('asr-14', 'ad-doc-author',  'st-released', 1, 0, 1),
  ('asr-15', 'ad-doc-review',  'st-released', 0, 0, 1),
  -- Obsolete
  ('asr-ob-01', 'ad-doc-title',   'st-obsolete', 1, 0, 1),
  ('asr-ob-02', 'ad-doc-version', 'st-obsolete', 0, 0, 1),
  ('asr-ob-03', 'ad-doc-desc',    'st-obsolete', 0, 0, 1),
  ('asr-ob-04', 'ad-doc-cat',     'st-obsolete', 1, 0, 1),
  ('asr-ob-05', 'ad-doc-author',  'st-obsolete', 1, 0, 1),
  ('asr-ob-06', 'ad-doc-review',  'st-obsolete', 0, 0, 0);

-- ============================================================
-- NODE TYPE "Part"
-- ============================================================

INSERT INTO node_type (id, name, description, lifecycle_id, logical_id_label, logical_id_pattern) VALUES
  ('nt-part', 'Part', 'Pièce ou assemblage mécanique', 'lc-standard', 'Part Number', 'P-\d{6}');

INSERT INTO attribute_definition
  (id, node_type_id, name, label, data_type, required, naming_regex, widget_type, display_order, display_section) VALUES
  ('ad-part-name',     'nt-part', 'name',       'Name',        'STRING', 1, NULL, 'TEXT',     1, 'Identity'),
  ('ad-part-material', 'nt-part', 'material',   'Material',    'ENUM',   0, NULL, 'DROPDOWN', 2, 'Technical'),
  ('ad-part-weight',   'nt-part', 'weight',     'Weight (kg)', 'NUMBER', 0, NULL, 'TEXT',     3, 'Technical'),
  ('ad-part-drawing',  'nt-part', 'drawingRef', 'Drawing Ref', 'STRING', 0, NULL, 'TEXT',     4, 'Technical');

UPDATE attribute_definition SET allowed_values = '["Steel","Aluminum","Titanium","Composite","Plastic"]'
WHERE id = 'ad-part-material';

-- Part × state rules
INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible) VALUES
  -- Frozen
  ('asr-p07', 'ad-part-name',     'st-frozen', 1, 0, 1),
  ('asr-p08', 'ad-part-material', 'st-frozen', 0, 0, 1),
  ('asr-p09', 'ad-part-weight',   'st-frozen', 0, 0, 1),
  ('asr-p10', 'ad-part-drawing',  'st-frozen', 0, 0, 1),
  -- Released
  ('asr-p02', 'ad-part-name',     'st-released', 1, 0, 1),
  ('asr-p03', 'ad-part-material', 'st-released', 0, 0, 1),
  ('asr-p04', 'ad-part-weight',   'st-released', 0, 0, 1),
  ('asr-p05', 'ad-part-drawing',  'st-released', 0, 0, 1),
  -- Obsolete
  ('asr-ob-p1', 'ad-part-name',     'st-obsolete', 1, 0, 1),
  ('asr-ob-p2', 'ad-part-material', 'st-obsolete', 0, 0, 1),
  ('asr-ob-p3', 'ad-part-weight',   'st-obsolete', 0, 0, 1),
  ('asr-ob-p4', 'ad-part-drawing',  'st-obsolete', 0, 0, 1);

-- ============================================================
-- LINK TYPES
-- ============================================================

INSERT INTO link_type (id, name, description, source_node_type_id, target_node_type_id, link_policy, min_cardinality, max_cardinality) VALUES
  ('lt-composed-of', 'composed_of',   'Composition Part → Part',     'nt-part', 'nt-part',     'VERSION_TO_MASTER',  0, NULL),
  ('lt-doc-part',    'documented_by', 'Document référence une Part', 'nt-part', 'nt-document', 'VERSION_TO_VERSION', 0, NULL),
  ('lt-supersedes',  'supersedes',    'Remplacement Part → Part',    'nt-part', 'nt-part',     'VERSION_TO_VERSION', 0, 1);

-- ============================================================
-- NODE TYPE PERMISSIONS
-- ============================================================

-- DESIGNER : read + write + transition + link
INSERT INTO node_type_permission (id, role_id, node_type_id, can_read, can_write, can_transition, can_sign, can_create_link, can_baseline) VALUES
  ('ntp-1', 'role-designer', 'nt-document', 1, 1, 1, 0, 1, 0),
  ('ntp-2', 'role-designer', 'nt-part',     1, 1, 1, 0, 1, 0);

-- REVIEWER : read + transition + sign (no write)
INSERT INTO node_type_permission (id, role_id, node_type_id, can_read, can_write, can_transition, can_sign, can_create_link, can_baseline) VALUES
  ('ntp-3', 'role-reviewer', 'nt-document', 1, 0, 1, 1, 0, 0),
  ('ntp-4', 'role-reviewer', 'nt-part',     1, 0, 1, 1, 0, 0);

-- READER : read only
INSERT INTO node_type_permission (id, role_id, node_type_id, can_read, can_write, can_transition, can_sign, can_create_link, can_baseline) VALUES
  ('ntp-5', 'role-reader', 'nt-document', 1, 0, 0, 0, 0, 0),
  ('ntp-6', 'role-reader', 'nt-part',     1, 0, 0, 0, 0, 0);

-- ============================================================
-- ATTRIBUTE VIEWS
-- ============================================================

-- Reviewer view on Document when Frozen: surfaces reviewNote first
INSERT INTO attribute_view (id, node_type_id, name, description, eligible_role_id, eligible_state_id, priority) VALUES
  ('view-reviewer-frozen', 'nt-document', 'Reviewer Frozen View',
   'Vue optimisée pour le relecteur en phase de gel (Frozen)',
   'role-reviewer', 'st-frozen', 10);

INSERT INTO view_attribute_override (id, view_id, attribute_def_id, visible, editable, display_order, display_section) VALUES
  ('vao-f1', 'view-reviewer-frozen', 'ad-doc-review', 1, 1, 1, 'Review'),
  ('vao-f2', 'view-reviewer-frozen', 'ad-doc-title',  1, 0, 2, 'Identity'),
  ('vao-f3', 'view-reviewer-frozen', 'ad-doc-desc',   1, 0, 3, 'General');

-- Reader view on Document: hides internal review note
INSERT INTO attribute_view (id, node_type_id, name, description, eligible_role_id, eligible_state_id, priority) VALUES
  ('view-reader-all', 'nt-document', 'Reader View',
   'Vue simplifiée pour les lecteurs - sans champs internes',
   'role-reader', NULL, 5);

INSERT INTO view_attribute_override (id, view_id, attribute_def_id, visible, editable, display_order, display_section) VALUES
  ('vao-5', 'view-reader-all', 'ad-doc-review', 0, 0, NULL, NULL);
