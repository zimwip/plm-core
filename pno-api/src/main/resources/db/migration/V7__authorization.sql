-- ============================================================
-- V7 — Authorization center
-- ============================================================
--
-- pno-api becomes the single source of truth for role × permission grants.
-- psm-admin keeps the permission + action catalog definitions (metamodel).
-- Enforcing services (psm-api) pull grants from /api/pno/internal/authorization/snapshot.
--
-- node_type_id and transition_id are stored as opaque VARCHARs (no FK) since
-- those catalogs live in psm-admin. Consistency is maintained eventually via
-- cascading deletes triggered when psm-admin publishes CONFIG_CHANGED events.
-- ============================================================

CREATE TABLE permission (
    permission_code  VARCHAR(100) NOT NULL PRIMARY KEY,
    scope            VARCHAR(20)  NOT NULL,
    display_name     VARCHAR(200) NOT NULL,
    description      VARCHAR(1000),
    display_order    INT          NOT NULL DEFAULT 0
);

CREATE TABLE authorization_policy (
    id               VARCHAR(100) NOT NULL PRIMARY KEY,
    permission_code  VARCHAR(100) NOT NULL REFERENCES permission(permission_code),
    scope            VARCHAR(20)  NOT NULL,
    role_id          VARCHAR(36)  NOT NULL REFERENCES pno_role(id),
    node_type_id     VARCHAR(36),
    transition_id    VARCHAR(36),
    CONSTRAINT uq_authorization_policy UNIQUE (permission_code, role_id, node_type_id, transition_id)
);

CREATE INDEX idx_ap_role ON authorization_policy (role_id);
CREATE INDEX idx_ap_scope ON authorization_policy (scope);
CREATE INDEX idx_ap_nodetype ON authorization_policy (node_type_id);
CREATE INDEX idx_ap_transition ON authorization_policy (transition_id);

-- ============================================================
-- PERMISSION CATALOG SEED — mirrors psm-admin/V2__seed_data.sql
-- (psm-admin remains the catalog editor; pno-api seeds an initial copy.
--  An internal HTTP sync endpoint can refresh this at runtime later.)
-- ============================================================
INSERT INTO permission (permission_code, scope, display_name, description, display_order) VALUES
  ('READ',             'GLOBAL',    'Read',             'Global read access to views and lists',                     -30),
  ('READ_NODE',        'NODE',      'Read Node',        'Per-node-type read access to nodes',                        -20),
  ('UPDATE',           'GLOBAL',    'Update',           'Global update access -- commit, rollback transactions',     -25),
  ('CREATE_NODE',      'NODE',      'Create Node',      'Create new nodes of this type',                               5),
  ('UPDATE_NODE',      'NODE',      'Update Node',      'Modify node content',                                        50),
  ('TRANSITION',       'LIFECYCLE', 'Transition',       'Apply a lifecycle state transition',                         10),
  ('SIGN',             'NODE',      'Sign',             'Record an electronic signature',                            200),
  ('MANAGE_BASELINES', 'GLOBAL',    'Manage Baselines', 'Create baselines',                                            0),
  ('MANAGE_PNO',       'GLOBAL',    'Manage PnO',       'Access People & Organisation settings',                       0),
  ('MANAGE_PLATFORM',  'GLOBAL',    'Manage Platform',  'Access platform configuration settings',                      0),
  ('MANAGE_PSM',       'GLOBAL',    'Manage PSM',       'Access application settings',                                 0),
  ('MANAGE_SECRETS',   'GLOBAL',    'Manage Secrets',   'Administrate Vault-backed secrets',                           0);

-- ============================================================
-- AUTHORIZATION POLICY SEED — mirrors psm-admin/V2__seed_data.sql
-- ============================================================
INSERT INTO authorization_policy (id, permission_code, scope, role_id, node_type_id, transition_id) VALUES
  -- READ / UPDATE (GLOBAL)
  ('ap-read-g-designer', 'READ',   'GLOBAL', 'role-designer', NULL, NULL),
  ('ap-read-g-reviewer', 'READ',   'GLOBAL', 'role-reviewer', NULL, NULL),
  ('ap-read-g-reader',   'READ',   'GLOBAL', 'role-reader',   NULL, NULL),
  ('ap-update-designer', 'UPDATE', 'GLOBAL', 'role-designer', NULL, NULL),
  ('ap-update-reviewer', 'UPDATE', 'GLOBAL', 'role-reviewer', NULL, NULL),
  -- READ_NODE
  ('ap-rn-d-doc', 'READ_NODE', 'NODE', 'role-designer', 'nt-document', NULL),
  ('ap-rn-d-prt', 'READ_NODE', 'NODE', 'role-designer', 'nt-part',     NULL),
  ('ap-rn-r-doc', 'READ_NODE', 'NODE', 'role-reviewer', 'nt-document', NULL),
  ('ap-rn-r-prt', 'READ_NODE', 'NODE', 'role-reviewer', 'nt-part',     NULL),
  ('ap-rn-o-doc', 'READ_NODE', 'NODE', 'role-reader',   'nt-document', NULL),
  ('ap-rn-o-prt', 'READ_NODE', 'NODE', 'role-reader',   'nt-part',     NULL),
  -- CREATE_NODE / UPDATE_NODE
  ('ap-cn-d-doc', 'CREATE_NODE', 'NODE', 'role-designer', 'nt-document', NULL),
  ('ap-cn-d-prt', 'CREATE_NODE', 'NODE', 'role-designer', 'nt-part',     NULL),
  ('ap-un-d-doc', 'UPDATE_NODE', 'NODE', 'role-designer', 'nt-document', NULL),
  ('ap-un-d-prt', 'UPDATE_NODE', 'NODE', 'role-designer', 'nt-part',     NULL),
  -- SIGN
  ('ap-sg-r-doc', 'SIGN', 'NODE', 'role-reviewer', 'nt-document', NULL),
  ('ap-sg-r-prt', 'SIGN', 'NODE', 'role-reviewer', 'nt-part',     NULL),
  -- TRANSITION
  ('ap-tr-d-doc-freeze',   'TRANSITION', 'LIFECYCLE', 'role-designer', 'nt-document', 'tr-freeze'),
  ('ap-tr-a-doc-freeze',   'TRANSITION', 'LIFECYCLE', 'role-admin',    'nt-document', 'tr-freeze'),
  ('ap-tr-d-prt-freeze',   'TRANSITION', 'LIFECYCLE', 'role-designer', 'nt-part',     'tr-freeze'),
  ('ap-tr-a-prt-freeze',   'TRANSITION', 'LIFECYCLE', 'role-admin',    'nt-part',     'tr-freeze'),
  ('ap-tr-a-doc-unfreeze', 'TRANSITION', 'LIFECYCLE', 'role-admin',    'nt-document', 'tr-unfreeze'),
  ('ap-tr-a-prt-unfreeze', 'TRANSITION', 'LIFECYCLE', 'role-admin',    'nt-part',     'tr-unfreeze'),
  ('ap-tr-r-doc-release',  'TRANSITION', 'LIFECYCLE', 'role-reviewer', 'nt-document', 'tr-release'),
  ('ap-tr-a-doc-release',  'TRANSITION', 'LIFECYCLE', 'role-admin',    'nt-document', 'tr-release'),
  ('ap-tr-r-prt-release',  'TRANSITION', 'LIFECYCLE', 'role-reviewer', 'nt-part',     'tr-release'),
  ('ap-tr-a-prt-release',  'TRANSITION', 'LIFECYCLE', 'role-admin',    'nt-part',     'tr-release'),
  ('ap-tr-d-doc-revise',   'TRANSITION', 'LIFECYCLE', 'role-designer', 'nt-document', 'tr-revise'),
  ('ap-tr-a-doc-revise',   'TRANSITION', 'LIFECYCLE', 'role-admin',    'nt-document', 'tr-revise'),
  ('ap-tr-d-prt-revise',   'TRANSITION', 'LIFECYCLE', 'role-designer', 'nt-part',     'tr-revise'),
  ('ap-tr-a-prt-revise',   'TRANSITION', 'LIFECYCLE', 'role-admin',    'nt-part',     'tr-revise'),
  ('ap-tr-a-doc-obsolete', 'TRANSITION', 'LIFECYCLE', 'role-admin',    'nt-document', 'tr-obsolete'),
  ('ap-tr-a-prt-obsolete', 'TRANSITION', 'LIFECYCLE', 'role-admin',    'nt-part',     'tr-obsolete'),
  -- GLOBAL admin permissions
  ('ap-gl-bl-admin',      'MANAGE_BASELINES', 'GLOBAL', 'role-admin', NULL, NULL),
  ('ap-gl-pno-admin',     'MANAGE_PNO',       'GLOBAL', 'role-admin', NULL, NULL),
  ('ap-gl-plat-admin',    'MANAGE_PLATFORM',  'GLOBAL', 'role-admin', NULL, NULL),
  ('ap-gl-psm-admin',     'MANAGE_PSM',       'GLOBAL', 'role-admin', NULL, NULL),
  ('ap-gl-secrets-admin', 'MANAGE_SECRETS',   'GLOBAL', 'role-admin', NULL, NULL);
