-- ============================================================
-- PLM SCHEMA - V4 : Données initiales (seed)
-- ============================================================

-- ============================================================
-- ROLES DE BASE
-- ============================================================

INSERT INTO PLM_ROLE (ID, NAME, DESCRIPTION, IS_ADMIN) VALUES
  ('role-admin',    'ADMIN',    'Administrateur PLM - accès total',           1),
  ('role-designer', 'DESIGNER', 'Concepteur - crée et modifie les documents', 0),
  ('role-reviewer', 'REVIEWER', 'Relecteur - consulte et signe',              0),
  ('role-reader',   'READER',   'Lecteur - consultation seule',               0);

-- ============================================================
-- UTILISATEURS DE BASE
-- ============================================================

INSERT INTO PLM_USER (ID, USERNAME, DISPLAY_NAME, EMAIL, ACTIVE) VALUES
  ('user-admin',   'admin',   'PLM Administrator', 'admin@plm.local',   1),
  ('user-alice',   'alice',   'Alice Dupont',       'alice@plm.local',   1),
  ('user-bob',     'bob',     'Bob Martin',         'bob@plm.local',     1),
  ('user-charlie', 'charlie', 'Charlie Leclerc',    'charlie@plm.local', 1);

-- Assignation des rôles
INSERT INTO USER_ROLE (ID, USER_ID, ROLE_ID) VALUES
  ('ur-1', 'user-admin',   'role-admin'),
  ('ur-2', 'user-alice',   'role-designer'),
  ('ur-3', 'user-bob',     'role-reviewer'),
  ('ur-4', 'user-charlie', 'role-reader');

-- ============================================================
-- LIFECYCLE "STANDARD" (Draft → InReview → Released / Frozen)
-- ============================================================

INSERT INTO LIFECYCLE (ID, NAME, DESCRIPTION) VALUES
  ('lc-standard', 'Standard', 'Lifecycle PLM standard');

INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER) VALUES
  ('st-draft',     'lc-standard', 'Draft',     1, 0, 0, 1),
  ('st-inreview',  'lc-standard', 'InReview',  0, 0, 0, 2),
  ('st-released',  'lc-standard', 'Released',  0, 0, 1, 3),
  ('st-frozen',    'lc-standard', 'Frozen',    0, 1, 0, 4),
  ('st-obsolete',  'lc-standard', 'Obsolete',  0, 0, 0, 5);

INSERT INTO LIFECYCLE_TRANSITION (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, GUARD_EXPR, ACTION_TYPE) VALUES
  ('tr-submit',    'lc-standard', 'Submit for Review', 'st-draft',    'st-inreview', 'all_required_filled', NULL),
  ('tr-approve',   'lc-standard', 'Approve',           'st-inreview', 'st-released', 'all_signatures_done', NULL),
  ('tr-reject',    'lc-standard', 'Reject',            'st-inreview', 'st-draft',    NULL,                  NULL),
  ('tr-freeze',    'lc-standard', 'Freeze',            'st-released', 'st-frozen',   NULL,                  'CASCADE_FROZEN'),
  ('tr-obsolete',  'lc-standard', 'Make Obsolete',     'st-released', 'st-obsolete', NULL,                  NULL),
  ('tr-revise',    'lc-standard', 'Revise',            'st-released', 'st-draft',    NULL,                  NULL);

-- Permissions sur les transitions :
-- Seul DESIGNER peut soumettre
-- Seul REVIEWER peut approuver/rejeter
-- ADMIN peut tout

INSERT INTO TRANSITION_PERMISSION (ID, TRANSITION_ID, ROLE_ID) VALUES
  ('tp-1', 'tr-submit',   'role-designer'),
  ('tp-2', 'tr-submit',   'role-admin'),
  ('tp-3', 'tr-approve',  'role-reviewer'),
  ('tp-4', 'tr-approve',  'role-admin'),
  ('tp-5', 'tr-reject',   'role-reviewer'),
  ('tp-6', 'tr-reject',   'role-admin'),
  ('tp-7', 'tr-freeze',   'role-admin'),
  ('tp-8', 'tr-obsolete', 'role-admin'),
  ('tp-9', 'tr-revise',   'role-designer'),
  ('tp-10','tr-revise',   'role-admin');

-- ============================================================
-- NODE TYPE "Document"
-- ============================================================

INSERT INTO NODE_TYPE (ID, NAME, DESCRIPTION, LIFECYCLE_ID) VALUES
  ('nt-document', 'Document', 'Document technique PLM', 'lc-standard');

INSERT INTO ATTRIBUTE_DEFINITION
  (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, NAMING_REGEX, WIDGET_TYPE, DISPLAY_ORDER, DISPLAY_SECTION) VALUES
  ('ad-doc-number',  'nt-document', 'number',      'Number',      'STRING',  1, '[A-Z]{3}-\d{4}', 'TEXT',     1, 'Identity'),
  ('ad-doc-title',   'nt-document', 'title',       'Title',       'STRING',  1, NULL,              'TEXT',     2, 'Identity'),
  ('ad-doc-version', 'nt-document', 'version',     'Version',     'STRING',  0, NULL,              'TEXT',     3, 'Identity'),
  ('ad-doc-desc',    'nt-document', 'description', 'Description', 'STRING',  0, NULL,              'TEXTAREA', 4, 'General'),
  ('ad-doc-cat',     'nt-document', 'category',    'Category',    'ENUM',    1, NULL,              'DROPDOWN', 5, 'General'),
  ('ad-doc-author',  'nt-document', 'author',      'Author',      'STRING',  1, NULL,              'TEXT',     6, 'General'),
  ('ad-doc-review',  'nt-document', 'reviewNote',  'Review Note', 'STRING',  0, NULL,              'TEXTAREA', 7, 'Review');

-- Valeurs autorisées pour category
UPDATE ATTRIBUTE_DEFINITION SET ALLOWED_VALUES = '["Design","Test","Spec","Procedure","Report"]'
WHERE ID = 'ad-doc-cat';

-- Règles attribut × état
-- InReview : reviewNote éditable, description non-required
-- Released : tout non-éditable sauf rien
-- Frozen   : tout non-éditable

INSERT INTO ATTRIBUTE_STATE_RULE (ID, ATTRIBUTE_DEFINITION_ID, LIFECYCLE_STATE_ID, REQUIRED, EDITABLE, VISIBLE) VALUES
  -- Draft : tout éditable, number+title+author requis (global), reviewNote invisible
  ('asr-01', 'ad-doc-review',  'st-draft',     0, 0, 0),
  -- InReview : tout non-éditable sauf reviewNote
  ('asr-02', 'ad-doc-number',  'st-inreview',  1, 0, 1),
  ('asr-03', 'ad-doc-title',   'st-inreview',  1, 0, 1),
  ('asr-04', 'ad-doc-version', 'st-inreview',  0, 0, 1),
  ('asr-05', 'ad-doc-desc',    'st-inreview',  0, 0, 1),
  ('asr-06', 'ad-doc-cat',     'st-inreview',  1, 0, 1),
  ('asr-07', 'ad-doc-author',  'st-inreview',  1, 0, 1),
  ('asr-08', 'ad-doc-review',  'st-inreview',  0, 1, 1),
  -- Released : tout non-éditable
  ('asr-09', 'ad-doc-number',  'st-released',  1, 0, 1),
  ('asr-10', 'ad-doc-title',   'st-released',  1, 0, 1),
  ('asr-11', 'ad-doc-version', 'st-released',  0, 0, 1),
  ('asr-12', 'ad-doc-desc',    'st-released',  0, 0, 1),
  ('asr-13', 'ad-doc-cat',     'st-released',  1, 0, 1),
  ('asr-14', 'ad-doc-author',  'st-released',  1, 0, 1),
  ('asr-15', 'ad-doc-review',  'st-released',  0, 0, 1),
  -- Frozen : tout non-éditable, reviewNote invisible
  ('asr-16', 'ad-doc-number',  'st-frozen',    1, 0, 1),
  ('asr-17', 'ad-doc-title',   'st-frozen',    1, 0, 1),
  ('asr-18', 'ad-doc-version', 'st-frozen',    0, 0, 1),
  ('asr-19', 'ad-doc-desc',    'st-frozen',    0, 0, 1),
  ('asr-20', 'ad-doc-cat',     'st-frozen',    1, 0, 1),
  ('asr-21', 'ad-doc-author',  'st-frozen',    1, 0, 1),
  ('asr-22', 'ad-doc-review',  'st-frozen',    0, 0, 0);

-- ============================================================
-- NODE TYPE "Part" (pièce mécanique)
-- ============================================================

INSERT INTO NODE_TYPE (ID, NAME, DESCRIPTION, LIFECYCLE_ID) VALUES
  ('nt-part', 'Part', 'Pièce ou assemblage mécanique', 'lc-standard');

INSERT INTO ATTRIBUTE_DEFINITION
  (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, NAMING_REGEX, WIDGET_TYPE, DISPLAY_ORDER, DISPLAY_SECTION) VALUES
  ('ad-part-number',   'nt-part', 'partNumber', 'Part Number', 'STRING', 1, 'P-\d{6}',    'TEXT',     1, 'Identity'),
  ('ad-part-name',     'nt-part', 'name',       'Name',        'STRING', 1, NULL,          'TEXT',     2, 'Identity'),
  ('ad-part-material', 'nt-part', 'material',   'Material',    'ENUM',   0, NULL,          'DROPDOWN', 3, 'Technical'),
  ('ad-part-weight',   'nt-part', 'weight',     'Weight (kg)', 'NUMBER', 0, NULL,          'TEXT',     4, 'Technical'),
  ('ad-part-drawing',  'nt-part', 'drawingRef', 'Drawing Ref', 'STRING', 0, NULL,          'TEXT',     5, 'Technical');

UPDATE ATTRIBUTE_DEFINITION SET ALLOWED_VALUES = '["Steel","Aluminum","Titanium","Composite","Plastic"]'
WHERE ID = 'ad-part-material';

-- Released/Frozen → non-éditable
INSERT INTO ATTRIBUTE_STATE_RULE (ID, ATTRIBUTE_DEFINITION_ID, LIFECYCLE_STATE_ID, REQUIRED, EDITABLE, VISIBLE) VALUES
  ('asr-p01', 'ad-part-number',   'st-released', 1, 0, 1),
  ('asr-p02', 'ad-part-name',     'st-released', 1, 0, 1),
  ('asr-p03', 'ad-part-material', 'st-released', 0, 0, 1),
  ('asr-p04', 'ad-part-weight',   'st-released', 0, 0, 1),
  ('asr-p05', 'ad-part-drawing',  'st-released', 0, 0, 1),
  ('asr-p06', 'ad-part-number',   'st-frozen',   1, 0, 1),
  ('asr-p07', 'ad-part-name',     'st-frozen',   1, 0, 1),
  ('asr-p08', 'ad-part-material', 'st-frozen',   0, 0, 1),
  ('asr-p09', 'ad-part-weight',   'st-frozen',   0, 0, 1),
  ('asr-p10', 'ad-part-drawing',  'st-frozen',   0, 0, 1);

-- ============================================================
-- LINK TYPES
-- ============================================================

INSERT INTO LINK_TYPE (ID, NAME, DESCRIPTION, SOURCE_NODE_TYPE_ID, TARGET_NODE_TYPE_ID, LINK_POLICY, MIN_CARDINALITY, MAX_CARDINALITY) VALUES
  ('lt-composed-of', 'composed_of', 'Composition Part → Part',        'nt-part', 'nt-part',     'VERSION_TO_MASTER',  0, NULL),
  ('lt-doc-part',    'documented_by','Document référence une Part',    'nt-part', 'nt-document', 'VERSION_TO_VERSION', 0, NULL),
  ('lt-supersedes',  'supersedes',  'Remplacement Part → Part',        'nt-part', 'nt-part',     'VERSION_TO_VERSION', 0, 1);

-- ============================================================
-- PERMISSIONS NODETYPE PAR ROLE
-- ============================================================

-- DESIGNER : lecture + écriture + transition + lien sur tout
INSERT INTO NODE_TYPE_PERMISSION (ID, ROLE_ID, NODE_TYPE_ID, CAN_READ, CAN_WRITE, CAN_TRANSITION, CAN_SIGN, CAN_CREATE_LINK, CAN_BASELINE) VALUES
  ('ntp-1', 'role-designer', 'nt-document', 1, 1, 1, 0, 1, 0),
  ('ntp-2', 'role-designer', 'nt-part',     1, 1, 1, 0, 1, 0);

-- REVIEWER : lecture + transition + signature (pas d'écriture)
INSERT INTO NODE_TYPE_PERMISSION (ID, ROLE_ID, NODE_TYPE_ID, CAN_READ, CAN_WRITE, CAN_TRANSITION, CAN_SIGN, CAN_CREATE_LINK, CAN_BASELINE) VALUES
  ('ntp-3', 'role-reviewer', 'nt-document', 1, 0, 1, 1, 0, 0),
  ('ntp-4', 'role-reviewer', 'nt-part',     1, 0, 1, 1, 0, 0);

-- READER : lecture seule
INSERT INTO NODE_TYPE_PERMISSION (ID, ROLE_ID, NODE_TYPE_ID, CAN_READ, CAN_WRITE, CAN_TRANSITION, CAN_SIGN, CAN_CREATE_LINK, CAN_BASELINE) VALUES
  ('ntp-5', 'role-reader', 'nt-document', 1, 0, 0, 0, 0, 0),
  ('ntp-6', 'role-reader', 'nt-part',     1, 0, 0, 0, 0, 0);

-- ============================================================
-- VUES
-- ============================================================

-- Vue REVIEWER sur Document en InReview : met reviewNote en premier
INSERT INTO ATTRIBUTE_VIEW (ID, NODE_TYPE_ID, NAME, DESCRIPTION, ELIGIBLE_ROLE_ID, ELIGIBLE_STATE_ID, PRIORITY) VALUES
  ('view-reviewer-inreview', 'nt-document', 'Reviewer InReview View',
   'Vue optimisée pour le relecteur en phase de relecture',
   'role-reviewer', 'st-inreview', 10);

INSERT INTO VIEW_ATTRIBUTE_OVERRIDE (ID, VIEW_ID, ATTRIBUTE_DEF_ID, VISIBLE, EDITABLE, DISPLAY_ORDER, DISPLAY_SECTION) VALUES
  ('vao-1', 'view-reviewer-inreview', 'ad-doc-review',  1, 1, 1, 'Review'),
  ('vao-2', 'view-reviewer-inreview', 'ad-doc-number',  1, 0, 2, 'Identity'),
  ('vao-3', 'view-reviewer-inreview', 'ad-doc-title',   1, 0, 3, 'Identity'),
  ('vao-4', 'view-reviewer-inreview', 'ad-doc-desc',    1, 0, 4, 'General');

-- Vue READER : masque les champs techniques internes
INSERT INTO ATTRIBUTE_VIEW (ID, NODE_TYPE_ID, NAME, DESCRIPTION, ELIGIBLE_ROLE_ID, ELIGIBLE_STATE_ID, PRIORITY) VALUES
  ('view-reader-all', 'nt-document', 'Reader View',
   'Vue simplifiée pour les lecteurs - sans champs internes',
   'role-reader', NULL, 5);

INSERT INTO VIEW_ATTRIBUTE_OVERRIDE (ID, VIEW_ID, ATTRIBUTE_DEF_ID, VISIBLE, EDITABLE, DISPLAY_ORDER, DISPLAY_SECTION) VALUES
  ('vao-5', 'view-reader-all', 'ad-doc-review',  0, 0, NULL, NULL);
-- reviewNote masquée pour les lecteurs
