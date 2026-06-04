-- ============================================================
-- PNO SEED DATA
--
-- Net state after all migrations V2–V21:
--   V2:  roles, users, project spaces (default+archive), user roles
--   V5:  military project space + service tags + user roles
--   V6:  service tag codes renamed to short form (psm-api → psm)
--   V10: permission scopes (GLOBAL/NODE/LIFECYCLE) + permission catalog + authorization grants
--   V11: military isolation removed (isolated=0, tag PSM2→PSM1)
--   V12: nt-assembly grants cloned from nt-part + designer tr-release on part+assembly
--   V13: DATA permissions + grants
--   V16: permission.service_code backfill
--   V17: CAD_IMPORT permission + grants
--   V18: SERVICE scope + SERVICE_ACCESS grants
--   V21: search SERVICE_ACCESS grants
--
-- authorization_policy IDs are deterministic: safe to re-seed on a fresh DB.
-- ============================================================

-- ============================================================
-- ROLES
-- ============================================================

INSERT INTO pno_role (id, name, description) VALUES
  ('role-admin',
   'ADMIN',
   'Full access role — assign to admin users alongside is_admin flag.'),
  ('role-designer',
   'DESIGNER',
   'Creates and edits nodes, triggers lifecycle transitions, manages links.'),
  ('role-reviewer',
   'REVIEWER',
   'Reviews and signs nodes. Can trigger Release transition.'),
  ('role-reader',
   'READER',
   'Read-only access across all node types.');

-- ============================================================
-- USERS  (is_admin=1 → unconditional system bypass in psm-api)
-- ============================================================

INSERT INTO pno_user (id, username, display_name, email, active, is_admin) VALUES
  ('user-admin',   'admin',   'PLM Administrator', 'admin@plm.local',   1, 1),
  ('user-alice',   'alice',   'Alice Dupont',       'alice@plm.local',   1, 0),
  ('user-bob',     'bob',     'Bob Martin',         'bob@plm.local',     1, 0),
  ('user-charlie', 'charlie', 'Charlie Leclerc',    'charlie@plm.local', 1, 0);

-- ============================================================
-- PROJECT SPACES
-- V11: ps-military reverts to isolated=0, tag PSM1 (same as default)
-- ============================================================

INSERT INTO project_space (id, name, description, isolated) VALUES
  ('ps-default',  'Default',  'Standard project space.',                              0),
  ('ps-archive',  'Archive',  'Archive project space — no write permissions.',        0),
  ('ps-military', 'Military', 'Military programs — shares PSM1 instance (non-isolated).', 0);

-- ============================================================
-- SERVICE TAGS (V6: short service codes; V11: PSM2→PSM1 for military)
-- ============================================================

INSERT INTO project_space_service_tag (id, project_space_id, service_code, tag_value) VALUES
  ('psst-default-psm',  'ps-default',  'psm', 'PSM1'),
  ('psst-military-psm', 'ps-military', 'psm', 'PSM1');

-- ============================================================
-- USER ROLES (V2 + V5)
-- ============================================================

INSERT INTO user_role (id, user_id, role_id, project_space_id) VALUES
  ('ur-1', 'user-admin',   'role-admin',    'ps-default'),
  ('ur-2', 'user-alice',   'role-designer', 'ps-default'),
  ('ur-3', 'user-bob',     'role-reviewer', 'ps-default'),
  ('ur-4', 'user-charlie', 'role-reader',   'ps-default'),
  ('ur-5', 'user-admin',   'role-admin',    'ps-military'),
  ('ur-6', 'user-alice',   'role-designer', 'ps-military'),
  ('ur-7', 'user-bob',     'role-reviewer', 'ps-military');

-- ============================================================
-- PERMISSION SCOPES (V10: GLOBAL/NODE/LIFECYCLE; V13: DATA; V18: SERVICE)
--
-- definition_hash is a backfill marker for GLOBAL/NODE/LIFECYCLE/DATA;
-- runtime registration from the owning service overwrites it.
-- SERVICE hash is canonical so platform-api registration is idempotent.
-- ============================================================

INSERT INTO permission_scope (scope_code, parent_scope_code, description, definition_hash, owner_service) VALUES
  ('GLOBAL',    NULL,     'Role-only check; no context keys.',           repeat('0', 64), 'pno'),
  ('NODE',      NULL,     'Role + nodeType.',                            repeat('0', 64), 'psa'),
  ('LIFECYCLE', 'NODE',   'Role + nodeType + transition.',               repeat('0', 64), 'psa'),
  ('DATA',      NULL,     'Role-only check on data store entries.',      repeat('0', 64), 'dst'),
  ('SERVICE',   NULL,     'Controls which users can access each service.',
   '4eb664db49834c2938ef956195b15a13b951e9a4757b9d9d6ebb14de5ebdf7f6', 'platform');

-- ============================================================
-- PERMISSION SCOPE KEYS (V10: NODE/LIFECYCLE; V18: SERVICE)
-- LIFECYCLE inherits the nodeType key through its parent (NODE);
-- the V10 seed registers only the transition key for LIFECYCLE.
-- ============================================================

INSERT INTO permission_scope_key (scope_code, key_position, key_name, description) VALUES
  ('NODE',      1, 'nodeType',    'Node type id'),
  ('LIFECYCLE', 1, 'transition',  'Lifecycle transition id'),
  ('SERVICE',   1, 'service_code','Service code of the target service (e.g. psm, psa, dst)');

-- ============================================================
-- PERMISSION CATALOG (V7 + V13 + V16 + V17 + V18)
-- service_code backfilled from V16 (all originally from V7).
-- ============================================================

INSERT INTO permission (permission_code, scope, display_name, description, display_order, service_code) VALUES
  ('READ',             'GLOBAL',    'Read',             'Global read access to views and lists',                    -30, 'psm'),
  ('READ_NODE',        'NODE',      'Read Node',        'Per-node-type read access',                                -20, 'psm'),
  ('UPDATE',           'GLOBAL',    'Update',           'Commit/rollback transactions',                            -25, 'psm'),
  ('CREATE_NODE',      'NODE',      'Create Node',      'Create new nodes of this type',                             5, 'psm'),
  ('UPDATE_NODE',      'NODE',      'Update Node',      'Modify node content',                                      50, 'psm'),
  ('TRANSITION',       'LIFECYCLE', 'Transition',       'Apply a lifecycle state transition',                       10, 'psm'),
  ('SIGN',             'NODE',      'Sign',             'Record an electronic signature',                          200, 'psm'),
  ('MANAGE_BASELINES', 'GLOBAL',    'Manage Baselines', 'Create baselines',                                          0, 'psm'),
  ('MANAGE_PSM',       'GLOBAL',    'Manage PSM',       'Access application settings',                               0, 'psm'),
  ('MANAGE_PNO',       'GLOBAL',    'Manage PnO',       'Access People & Organisation settings',                     0, 'pno'),
  ('MANAGE_PLATFORM',  'GLOBAL',    'Manage Platform',  'Access platform configuration settings',                    0, 'platform'),
  ('MANAGE_SECRETS',   'GLOBAL',    'Manage Secrets',   'Administrate Vault-backed secrets',                         0, 'platform'),
  ('READ_DATA',        'DATA',      'Read Data',        'Download stored data and read metadata',                  210, 'dst'),
  ('WRITE_DATA',       'DATA',      'Write Data',       'Upload new data into the data store',                     220, 'dst'),
  ('MANAGE_DATA',      'DATA',      'Manage Data',      'Administer data store entries (delete, purge)',           230, 'dst'),
  ('CAD_IMPORT',       'GLOBAL',    'CAD Import',       'Trigger CAD file import and create PSM nodes',           160, 'psm'),
  ('SERVICE_ACCESS',   'SERVICE',   'Service Access',   'Grants access to a specific service',                       5, 'platform');

-- ============================================================
-- AUTHORIZATION POLICY — GLOBAL grants (no key rows needed)
-- fingerprint = repeat('0',64)  (GLOBAL sentinel = empty key set)
-- V10 cross-joined the V7 seed grants over every project space.
-- ID pattern: ap-{perm_short}-{role_short}-{ps_id}
-- ============================================================

INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
SELECT 'ap-' || g.perm_short || '-' || g.role_short || '-' || ps.id,
       g.permission_code, 'GLOBAL', g.role_id, ps.id, repeat('0', 64)
FROM project_space ps
CROSS JOIN (VALUES
    ('read',             'READ',             'role-designer', 'designer'),
    ('read',             'READ',             'role-reviewer', 'reviewer'),
    ('read',             'READ',             'role-reader',   'reader'),
    ('update',           'UPDATE',           'role-designer', 'designer'),
    ('update',           'UPDATE',           'role-reviewer', 'reviewer'),
    ('manage-baselines', 'MANAGE_BASELINES', 'role-admin',    'admin'),
    ('manage-pno',       'MANAGE_PNO',       'role-admin',    'admin'),
    ('manage-platform',  'MANAGE_PLATFORM',  'role-admin',    'admin'),
    ('manage-psm',       'MANAGE_PSM',       'role-admin',    'admin'),
    ('manage-secrets',   'MANAGE_SECRETS',   'role-admin',    'admin'),
    ('cad-import',       'CAD_IMPORT',       'role-admin',    'admin'),
    ('cad-import',       'CAD_IMPORT',       'role-designer', 'designer')
) AS g(perm_short, permission_code, role_id, role_short);

-- ============================================================
-- AUTHORIZATION POLICY — NODE grants
-- V10 cross-joined V7 nt-doc + nt-part grants over all project spaces.
-- V12 cloned all nt-part grants to nt-assembly.
-- fingerprint = SHA-256('nodeType=<nt>')
-- ID pattern: ap-{perm_short}-{nt_short}-{role_short}-{ps_id}
-- ============================================================

INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
SELECT 'ap-' || g.perm_short || '-' || g.nt_short || '-' || g.role_short || '-' || ps.id,
       g.permission_code, 'NODE', g.role_id, ps.id, g.fingerprint
FROM project_space ps
CROSS JOIN (VALUES
    -- READ_NODE: designer, reviewer, reader × doc, prt, asm
    ('rn', 'READ_NODE',   'role-designer', 'designer', 'nt-document', 'doc', '08bb36899b0e396bf032850e5ea6037ea39bb3387277291f8a2808fd1cc2a2ad'),
    ('rn', 'READ_NODE',   'role-designer', 'designer', 'nt-part',     'prt', '6a2f21f2fddbe5a73815c152d9949d99fc6e675a989802912e548621afe8c966'),
    ('rn', 'READ_NODE',   'role-designer', 'designer', 'nt-assembly', 'asm', 'fcf19d59645e284875447977e8e736b1c81c20ee189b1f39fcdc4d0ac0ab5053'),
    ('rn', 'READ_NODE',   'role-reviewer', 'reviewer', 'nt-document', 'doc', '08bb36899b0e396bf032850e5ea6037ea39bb3387277291f8a2808fd1cc2a2ad'),
    ('rn', 'READ_NODE',   'role-reviewer', 'reviewer', 'nt-part',     'prt', '6a2f21f2fddbe5a73815c152d9949d99fc6e675a989802912e548621afe8c966'),
    ('rn', 'READ_NODE',   'role-reviewer', 'reviewer', 'nt-assembly', 'asm', 'fcf19d59645e284875447977e8e736b1c81c20ee189b1f39fcdc4d0ac0ab5053'),
    ('rn', 'READ_NODE',   'role-reader',   'reader',   'nt-document', 'doc', '08bb36899b0e396bf032850e5ea6037ea39bb3387277291f8a2808fd1cc2a2ad'),
    ('rn', 'READ_NODE',   'role-reader',   'reader',   'nt-part',     'prt', '6a2f21f2fddbe5a73815c152d9949d99fc6e675a989802912e548621afe8c966'),
    ('rn', 'READ_NODE',   'role-reader',   'reader',   'nt-assembly', 'asm', 'fcf19d59645e284875447977e8e736b1c81c20ee189b1f39fcdc4d0ac0ab5053'),
    -- CREATE_NODE: designer × doc, prt, asm
    ('cn', 'CREATE_NODE', 'role-designer', 'designer', 'nt-document', 'doc', '08bb36899b0e396bf032850e5ea6037ea39bb3387277291f8a2808fd1cc2a2ad'),
    ('cn', 'CREATE_NODE', 'role-designer', 'designer', 'nt-part',     'prt', '6a2f21f2fddbe5a73815c152d9949d99fc6e675a989802912e548621afe8c966'),
    ('cn', 'CREATE_NODE', 'role-designer', 'designer', 'nt-assembly', 'asm', 'fcf19d59645e284875447977e8e736b1c81c20ee189b1f39fcdc4d0ac0ab5053'),
    -- UPDATE_NODE: designer × doc, prt, asm
    ('un', 'UPDATE_NODE', 'role-designer', 'designer', 'nt-document', 'doc', '08bb36899b0e396bf032850e5ea6037ea39bb3387277291f8a2808fd1cc2a2ad'),
    ('un', 'UPDATE_NODE', 'role-designer', 'designer', 'nt-part',     'prt', '6a2f21f2fddbe5a73815c152d9949d99fc6e675a989802912e548621afe8c966'),
    ('un', 'UPDATE_NODE', 'role-designer', 'designer', 'nt-assembly', 'asm', 'fcf19d59645e284875447977e8e736b1c81c20ee189b1f39fcdc4d0ac0ab5053'),
    -- SIGN: reviewer × doc, prt, asm
    ('sg', 'SIGN',        'role-reviewer', 'reviewer', 'nt-document', 'doc', '08bb36899b0e396bf032850e5ea6037ea39bb3387277291f8a2808fd1cc2a2ad'),
    ('sg', 'SIGN',        'role-reviewer', 'reviewer', 'nt-part',     'prt', '6a2f21f2fddbe5a73815c152d9949d99fc6e675a989802912e548621afe8c966'),
    ('sg', 'SIGN',        'role-reviewer', 'reviewer', 'nt-assembly', 'asm', 'fcf19d59645e284875447977e8e736b1c81c20ee189b1f39fcdc4d0ac0ab5053')
) AS g(perm_short, permission_code, role_id, role_short, node_type_id, nt_short, fingerprint);

INSERT INTO authorization_policy_key (policy_id, key_name, key_value)
SELECT 'ap-' || g.perm_short || '-' || g.nt_short || '-' || g.role_short || '-' || ps.id,
       'nodeType', g.node_type_id
FROM project_space ps
CROSS JOIN (VALUES
    ('rn', 'READ_NODE',   'role-designer', 'designer', 'nt-document', 'doc'),
    ('rn', 'READ_NODE',   'role-designer', 'designer', 'nt-part',     'prt'),
    ('rn', 'READ_NODE',   'role-designer', 'designer', 'nt-assembly', 'asm'),
    ('rn', 'READ_NODE',   'role-reviewer', 'reviewer', 'nt-document', 'doc'),
    ('rn', 'READ_NODE',   'role-reviewer', 'reviewer', 'nt-part',     'prt'),
    ('rn', 'READ_NODE',   'role-reviewer', 'reviewer', 'nt-assembly', 'asm'),
    ('rn', 'READ_NODE',   'role-reader',   'reader',   'nt-document', 'doc'),
    ('rn', 'READ_NODE',   'role-reader',   'reader',   'nt-part',     'prt'),
    ('rn', 'READ_NODE',   'role-reader',   'reader',   'nt-assembly', 'asm'),
    ('cn', 'CREATE_NODE', 'role-designer', 'designer', 'nt-document', 'doc'),
    ('cn', 'CREATE_NODE', 'role-designer', 'designer', 'nt-part',     'prt'),
    ('cn', 'CREATE_NODE', 'role-designer', 'designer', 'nt-assembly', 'asm'),
    ('un', 'UPDATE_NODE', 'role-designer', 'designer', 'nt-document', 'doc'),
    ('un', 'UPDATE_NODE', 'role-designer', 'designer', 'nt-part',     'prt'),
    ('un', 'UPDATE_NODE', 'role-designer', 'designer', 'nt-assembly', 'asm'),
    ('sg', 'SIGN',        'role-reviewer', 'reviewer', 'nt-document', 'doc'),
    ('sg', 'SIGN',        'role-reviewer', 'reviewer', 'nt-part',     'prt'),
    ('sg', 'SIGN',        'role-reviewer', 'reviewer', 'nt-assembly', 'asm')
) AS g(perm_short, permission_code, role_id, role_short, node_type_id, nt_short);

-- ============================================================
-- AUTHORIZATION POLICY — LIFECYCLE grants
-- V10 cross-joined V7 nt-doc + nt-part transitions over all project spaces.
-- V12: cloned nt-part grants to nt-assembly + designer tr-release on prt+asm.
-- fingerprint = SHA-256('nodeType=<nt>|transition=<tr>')
-- ID pattern: ap-tr-{nt_short}-{tr_short}-{role_short}-{ps_id}
-- ============================================================

INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
SELECT 'ap-tr-' || g.nt_short || '-' || g.tr_short || '-' || g.role_short || '-' || ps.id,
       'TRANSITION', 'LIFECYCLE', g.role_id, ps.id, g.fingerprint
FROM project_space ps
CROSS JOIN (VALUES
    -- nt-document (from V7 via V10)
    ('doc', 'nt-document', 'freeze',   'role-designer', 'designer', '49a11aef41dbef66987a1a2936a1404f4fe3ae93ae595a421b80315dfe7b1901'),
    ('doc', 'nt-document', 'freeze',   'role-admin',    'admin',    '49a11aef41dbef66987a1a2936a1404f4fe3ae93ae595a421b80315dfe7b1901'),
    ('doc', 'nt-document', 'unfreeze', 'role-admin',    'admin',    'fb9eb511a20a938f3310f8f5c65b86a6e3874f9766801228f01f2cebe7150e2e'),
    ('doc', 'nt-document', 'release',  'role-reviewer', 'reviewer', '92148cd37bea417691c3491e53f46b05ee70d1bea0fc64be4e7cbe705ac8cf33'),
    ('doc', 'nt-document', 'release',  'role-admin',    'admin',    '92148cd37bea417691c3491e53f46b05ee70d1bea0fc64be4e7cbe705ac8cf33'),
    ('doc', 'nt-document', 'revise',   'role-designer', 'designer', 'ea910aef58c188ca7d19c145ce0fd61b99bbf2ba8e002b1c2d363efdc08d2d04'),
    ('doc', 'nt-document', 'revise',   'role-admin',    'admin',    'ea910aef58c188ca7d19c145ce0fd61b99bbf2ba8e002b1c2d363efdc08d2d04'),
    ('doc', 'nt-document', 'obsolete', 'role-admin',    'admin',    '7cc077e8b8f050e2c799e216ecd11a4e283510de6b9c511e616bef6231689c77'),
    -- nt-part (from V7 via V10; designer release added by V12)
    ('prt', 'nt-part', 'freeze',   'role-designer', 'designer', 'd4f3e68bc68fc767947bf9b37e99ea8f3d987e9c934420b3d1eb348ddbeb10bf'),
    ('prt', 'nt-part', 'freeze',   'role-admin',    'admin',    'd4f3e68bc68fc767947bf9b37e99ea8f3d987e9c934420b3d1eb348ddbeb10bf'),
    ('prt', 'nt-part', 'unfreeze', 'role-admin',    'admin',    '27711ffb52a43c175ba0d16e91704c402f3ebb9ed1209a32e38692bd043c3f55'),
    ('prt', 'nt-part', 'release',  'role-reviewer', 'reviewer', 'fc4132b48f0c2bc1f5f6bd2e37d82fcac0199073ac4493c598a6d4b851fcaf6c'),
    ('prt', 'nt-part', 'release',  'role-admin',    'admin',    'fc4132b48f0c2bc1f5f6bd2e37d82fcac0199073ac4493c598a6d4b851fcaf6c'),
    ('prt', 'nt-part', 'release',  'role-designer', 'designer', 'fc4132b48f0c2bc1f5f6bd2e37d82fcac0199073ac4493c598a6d4b851fcaf6c'),
    ('prt', 'nt-part', 'revise',   'role-designer', 'designer', '57f17bf4fe7bfc7dd0a67b335beaace674bb49b4c6ed806a6b81632acc1805b8'),
    ('prt', 'nt-part', 'revise',   'role-admin',    'admin',    '57f17bf4fe7bfc7dd0a67b335beaace674bb49b4c6ed806a6b81632acc1805b8'),
    ('prt', 'nt-part', 'obsolete', 'role-admin',    'admin',    '0de0f1e5705a13da39e9375c2eb47efd223c1eca36e936698552a2f715381110'),
    -- nt-assembly (V12: cloned from nt-part + designer release)
    ('asm', 'nt-assembly', 'freeze',   'role-designer', 'designer', '4665f18cef18a07a040f5c837d55e328970bcd6c087b586ecdade49721ab06c8'),
    ('asm', 'nt-assembly', 'freeze',   'role-admin',    'admin',    '4665f18cef18a07a040f5c837d55e328970bcd6c087b586ecdade49721ab06c8'),
    ('asm', 'nt-assembly', 'unfreeze', 'role-admin',    'admin',    'a46f43e7ac59cae342d4552193ecf71c2e0c19267de8f4e33aada4fa17c2312f'),
    ('asm', 'nt-assembly', 'release',  'role-reviewer', 'reviewer', 'd159d68bf7cfe951a222fbb6269cfa4637ae8e0734986939f022af855a31ce52'),
    ('asm', 'nt-assembly', 'release',  'role-admin',    'admin',    'd159d68bf7cfe951a222fbb6269cfa4637ae8e0734986939f022af855a31ce52'),
    ('asm', 'nt-assembly', 'release',  'role-designer', 'designer', 'd159d68bf7cfe951a222fbb6269cfa4637ae8e0734986939f022af855a31ce52'),
    ('asm', 'nt-assembly', 'revise',   'role-designer', 'designer', '988568c02924dc2932854e7cd8bd70eeb2e2f06bbbef79e57d1ff4aa57b816ce'),
    ('asm', 'nt-assembly', 'revise',   'role-admin',    'admin',    '988568c02924dc2932854e7cd8bd70eeb2e2f06bbbef79e57d1ff4aa57b816ce'),
    ('asm', 'nt-assembly', 'obsolete', 'role-admin',    'admin',    'acac27a4784ca606cc2de5af20fe5924d2af3050eae43166ea3b9064ca28d728')
) AS g(nt_short, node_type_id, tr_short, role_id, role_short, fingerprint);

-- nodeType key for each LIFECYCLE grant
INSERT INTO authorization_policy_key (policy_id, key_name, key_value)
SELECT 'ap-tr-' || g.nt_short || '-' || g.tr_short || '-' || g.role_short || '-' || ps.id,
       'nodeType', g.node_type_id
FROM project_space ps
CROSS JOIN (VALUES
    ('doc', 'nt-document', 'freeze',   'admin'),    ('doc', 'nt-document', 'freeze',   'designer'),
    ('doc', 'nt-document', 'unfreeze', 'admin'),
    ('doc', 'nt-document', 'release',  'reviewer'), ('doc', 'nt-document', 'release',  'admin'),
    ('doc', 'nt-document', 'revise',   'designer'), ('doc', 'nt-document', 'revise',   'admin'),
    ('doc', 'nt-document', 'obsolete', 'admin'),
    ('prt', 'nt-part', 'freeze',   'designer'),     ('prt', 'nt-part', 'freeze',   'admin'),
    ('prt', 'nt-part', 'unfreeze', 'admin'),
    ('prt', 'nt-part', 'release',  'reviewer'),     ('prt', 'nt-part', 'release',  'admin'),     ('prt', 'nt-part', 'release',  'designer'),
    ('prt', 'nt-part', 'revise',   'designer'),     ('prt', 'nt-part', 'revise',   'admin'),
    ('prt', 'nt-part', 'obsolete', 'admin'),
    ('asm', 'nt-assembly', 'freeze',   'designer'), ('asm', 'nt-assembly', 'freeze',   'admin'),
    ('asm', 'nt-assembly', 'unfreeze', 'admin'),
    ('asm', 'nt-assembly', 'release',  'reviewer'), ('asm', 'nt-assembly', 'release',  'admin'), ('asm', 'nt-assembly', 'release',  'designer'),
    ('asm', 'nt-assembly', 'revise',   'designer'), ('asm', 'nt-assembly', 'revise',   'admin'),
    ('asm', 'nt-assembly', 'obsolete', 'admin')
) AS g(nt_short, node_type_id, tr_short, role_short);

-- transition key for each LIFECYCLE grant
INSERT INTO authorization_policy_key (policy_id, key_name, key_value)
SELECT 'ap-tr-' || g.nt_short || '-' || g.tr_short || '-' || g.role_short || '-' || ps.id,
       'transition', 'tr-' || g.tr_short
FROM project_space ps
CROSS JOIN (VALUES
    ('doc', 'freeze',   'admin'),    ('doc', 'freeze',   'designer'),
    ('doc', 'unfreeze', 'admin'),
    ('doc', 'release',  'reviewer'), ('doc', 'release',  'admin'),
    ('doc', 'revise',   'designer'), ('doc', 'revise',   'admin'),
    ('doc', 'obsolete', 'admin'),
    ('prt', 'freeze',   'designer'), ('prt', 'freeze',   'admin'),
    ('prt', 'unfreeze', 'admin'),
    ('prt', 'release',  'reviewer'), ('prt', 'release',  'admin'), ('prt', 'release',  'designer'),
    ('prt', 'revise',   'designer'), ('prt', 'revise',   'admin'),
    ('prt', 'obsolete', 'admin'),
    ('asm', 'freeze',   'designer'), ('asm', 'freeze',   'admin'),
    ('asm', 'unfreeze', 'admin'),
    ('asm', 'release',  'reviewer'), ('asm', 'release',  'admin'), ('asm', 'release',  'designer'),
    ('asm', 'revise',   'designer'), ('asm', 'revise',   'admin'),
    ('asm', 'obsolete', 'admin')
) AS g(nt_short, tr_short, role_short);

-- ============================================================
-- AUTHORIZATION POLICY — DATA grants (V13)
-- fingerprint = repeat('0',64)  (role-only, no context keys)
-- ID pattern: ap-data-{perm_short}-{role_short}-{ps_id}
-- ============================================================

INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
SELECT 'ap-data-' || g.perm_short || '-' || g.role_short || '-' || ps.id,
       g.permission_code, 'DATA', g.role_id, ps.id, repeat('0', 64)
FROM project_space ps
CROSS JOIN (VALUES
    ('read',   'READ_DATA',   'role-admin',    'admin'),
    ('read',   'READ_DATA',   'role-designer', 'designer'),
    ('read',   'READ_DATA',   'role-reviewer', 'reviewer'),
    ('read',   'READ_DATA',   'role-reader',   'reader'),
    ('write',  'WRITE_DATA',  'role-admin',    'admin'),
    ('write',  'WRITE_DATA',  'role-designer', 'designer'),
    ('write',  'WRITE_DATA',  'role-reviewer', 'reviewer'),
    ('manage', 'MANAGE_DATA', 'role-admin',    'admin')
) AS g(perm_short, permission_code, role_id, role_short);

-- ============================================================
-- AUTHORIZATION POLICY — SERVICE_ACCESS grants (V18 + V21)
-- fingerprint = SHA-256('service_code=<svc>')
-- ID pattern: ap-svc-{svc_short}-{role_short}-{ps_id}
-- Includes all 8 services (psm, pno, psa, platform, dst, ws, cad-api, search).
-- ============================================================

INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
SELECT 'ap-svc-' || g.svc_short || '-' || g.role_short || '-' || ps.id,
       'SERVICE_ACCESS', 'SERVICE', g.role_id, ps.id, g.fingerprint
FROM project_space ps
CROSS JOIN (VALUES
    ('psm',     'psm',  'role-admin',    'admin',    '3847f92ee1fd659670cafa0def007c8d26e8f43d1cb98ed336f8e879d30e1cdf'),
    ('psm',     'psm',  'role-designer', 'designer', '3847f92ee1fd659670cafa0def007c8d26e8f43d1cb98ed336f8e879d30e1cdf'),
    ('psm',     'psm',  'role-reviewer', 'reviewer', '3847f92ee1fd659670cafa0def007c8d26e8f43d1cb98ed336f8e879d30e1cdf'),
    ('psm',     'psm',  'role-reader',   'reader',   '3847f92ee1fd659670cafa0def007c8d26e8f43d1cb98ed336f8e879d30e1cdf'),
    ('pno',     'pno',  'role-admin',    'admin',    '0fb9f0ad68c4e11484b7dc9b92de293fb50003bcc87a96206d425ed38f7a167d'),
    ('pno',     'pno',  'role-designer', 'designer', '0fb9f0ad68c4e11484b7dc9b92de293fb50003bcc87a96206d425ed38f7a167d'),
    ('pno',     'pno',  'role-reviewer', 'reviewer', '0fb9f0ad68c4e11484b7dc9b92de293fb50003bcc87a96206d425ed38f7a167d'),
    ('pno',     'pno',  'role-reader',   'reader',   '0fb9f0ad68c4e11484b7dc9b92de293fb50003bcc87a96206d425ed38f7a167d'),
    ('psa',     'psa',  'role-admin',    'admin',    'ede10ba26f3cb87a99895621828377edb06c5d249c56e528eeb923c70da10442'),
    ('psa',     'psa',  'role-designer', 'designer', 'ede10ba26f3cb87a99895621828377edb06c5d249c56e528eeb923c70da10442'),
    ('psa',     'psa',  'role-reviewer', 'reviewer', 'ede10ba26f3cb87a99895621828377edb06c5d249c56e528eeb923c70da10442'),
    ('psa',     'psa',  'role-reader',   'reader',   'ede10ba26f3cb87a99895621828377edb06c5d249c56e528eeb923c70da10442'),
    ('platform','plt',  'role-admin',    'admin',    'a351e6f7590f3d56aeb24a0ff802d4bcb15b27bd6acfaa3989f5b24e50524dcf'),
    ('platform','plt',  'role-designer', 'designer', 'a351e6f7590f3d56aeb24a0ff802d4bcb15b27bd6acfaa3989f5b24e50524dcf'),
    ('platform','plt',  'role-reviewer', 'reviewer', 'a351e6f7590f3d56aeb24a0ff802d4bcb15b27bd6acfaa3989f5b24e50524dcf'),
    ('platform','plt',  'role-reader',   'reader',   'a351e6f7590f3d56aeb24a0ff802d4bcb15b27bd6acfaa3989f5b24e50524dcf'),
    ('dst',     'dst',  'role-admin',    'admin',    'ba0675434532e4c23219841e1d9688961380dc5422420aa62131b07ec2dc8096'),
    ('dst',     'dst',  'role-designer', 'designer', 'ba0675434532e4c23219841e1d9688961380dc5422420aa62131b07ec2dc8096'),
    ('dst',     'dst',  'role-reviewer', 'reviewer', 'ba0675434532e4c23219841e1d9688961380dc5422420aa62131b07ec2dc8096'),
    ('dst',     'dst',  'role-reader',   'reader',   'ba0675434532e4c23219841e1d9688961380dc5422420aa62131b07ec2dc8096'),
    ('ws',      'ws',   'role-admin',    'admin',    '851fba4a9cfbec989b2e3b9d81d818d4c151bc6e65521d853be0479e20dc5a30'),
    ('ws',      'ws',   'role-designer', 'designer', '851fba4a9cfbec989b2e3b9d81d818d4c151bc6e65521d853be0479e20dc5a30'),
    ('ws',      'ws',   'role-reviewer', 'reviewer', '851fba4a9cfbec989b2e3b9d81d818d4c151bc6e65521d853be0479e20dc5a30'),
    ('ws',      'ws',   'role-reader',   'reader',   '851fba4a9cfbec989b2e3b9d81d818d4c151bc6e65521d853be0479e20dc5a30'),
    ('cad-api', 'cad',  'role-admin',    'admin',    '48cc17380692f3757505b832bcfad10f5f257e8e378c8d8fa8b9d9ecdcd452e0'),
    ('cad-api', 'cad',  'role-designer', 'designer', '48cc17380692f3757505b832bcfad10f5f257e8e378c8d8fa8b9d9ecdcd452e0'),
    ('cad-api', 'cad',  'role-reviewer', 'reviewer', '48cc17380692f3757505b832bcfad10f5f257e8e378c8d8fa8b9d9ecdcd452e0'),
    ('cad-api', 'cad',  'role-reader',   'reader',   '48cc17380692f3757505b832bcfad10f5f257e8e378c8d8fa8b9d9ecdcd452e0'),
    ('search',  'search','role-admin',   'admin',    'f26718743d3220aea6e6e1d5c982d96d18567e7258d03333fe679941fcd27815'),
    ('search',  'search','role-designer','designer', 'f26718743d3220aea6e6e1d5c982d96d18567e7258d03333fe679941fcd27815'),
    ('search',  'search','role-reviewer','reviewer', 'f26718743d3220aea6e6e1d5c982d96d18567e7258d03333fe679941fcd27815'),
    ('search',  'search','role-reader',  'reader',   'f26718743d3220aea6e6e1d5c982d96d18567e7258d03333fe679941fcd27815')
) AS g(service_code, svc_short, role_id, role_short, fingerprint);

-- service_code key for each SERVICE_ACCESS grant
INSERT INTO authorization_policy_key (policy_id, key_name, key_value)
SELECT 'ap-svc-' || g.svc_short || '-' || g.role_short || '-' || ps.id,
       'service_code', g.service_code
FROM project_space ps
CROSS JOIN (VALUES
    ('psm',     'psm',   'admin'),    ('psm',     'psm',   'designer'), ('psm',     'psm',   'reviewer'), ('psm',     'psm',   'reader'),
    ('pno',     'pno',   'admin'),    ('pno',     'pno',   'designer'), ('pno',     'pno',   'reviewer'), ('pno',     'pno',   'reader'),
    ('psa',     'psa',   'admin'),    ('psa',     'psa',   'designer'), ('psa',     'psa',   'reviewer'), ('psa',     'psa',   'reader'),
    ('platform','plt',   'admin'),    ('platform','plt',   'designer'), ('platform','plt',   'reviewer'), ('platform','plt',   'reader'),
    ('dst',     'dst',   'admin'),    ('dst',     'dst',   'designer'), ('dst',     'dst',   'reviewer'), ('dst',     'dst',   'reader'),
    ('ws',      'ws',    'admin'),    ('ws',      'ws',    'designer'), ('ws',      'ws',    'reviewer'), ('ws',      'ws',    'reader'),
    ('cad-api', 'cad',   'admin'),    ('cad-api', 'cad',   'designer'), ('cad-api', 'cad',   'reviewer'), ('cad-api', 'cad',   'reader'),
    ('search',  'search','admin'),    ('search',  'search','designer'), ('search',  'search','reviewer'), ('search',  'search','reader')
) AS g(service_code, svc_short, role_short);
