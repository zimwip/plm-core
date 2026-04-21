-- ============================================================
-- PERMISSION MODULE SEED
-- Permission catalog, action→permission mappings,
-- authorization policies (grants)
-- ============================================================

-- ============================================================
-- PERMISSION CATALOG
-- ============================================================

INSERT INTO permission (permission_code, scope, display_name, description, display_order) VALUES
  ('READ',             'GLOBAL',    'Read',                       'Global read access to views and lists',                           -30),
  ('READ_NODE',        'NODE',      'Read Node',                  'Per-node-type read access to nodes',                              -20),
  ('CREATE_NODE',      'NODE',      'Create Node',                'Create new nodes of this type',                                     5),
  ('UPDATE_NODE',      'NODE',      'Update Node',                'Modify node content (checkout, checkin, links, attributes)',        50),
  ('TRANSITION',       'LIFECYCLE', 'Transition',                 'Apply a lifecycle state transition',                                10),
  ('SIGN',             'NODE',      'Sign',                       'Record an electronic signature',                                   200),
  ('COMMIT',           'TX',        'Commit',                     'Commit transaction',                                               900),
  ('ROLLBACK',         'TX',        'Rollback',                   'Rollback transaction',                                             910),
  ('MANAGE_METAMODEL', 'GLOBAL',    'Manage Metamodel',           'Create/update/delete lifecycle, node types, link types',              0),
  ('MANAGE_ROLES',     'GLOBAL',    'Manage Roles & Permissions', 'Configure action permissions, views, and view overrides',             0),
  ('MANAGE_BASELINES', 'GLOBAL',    'Manage Baselines',           'Create baselines',                                                   0),
  ('MANAGE_LIFECYCLE', 'GLOBAL',    'Manage Lifecycle',           'Create/update/delete lifecycles, states, transitions',                0);

-- ============================================================
-- ACTION → PERMISSION MAPPINGS
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
  ('arp-commit',      'act-commit',      'COMMIT'),
  ('arp-rollback',    'act-rollback',    'ROLLBACK'),
  ('arp-baseline',    'act-baseline',    'MANAGE_BASELINES');

-- ============================================================
-- AUTHORIZATION POLICIES (grants for ps-default)
-- ============================================================

INSERT INTO authorization_policy (id, permission_code, scope, project_space_id, role_id, node_type_id, transition_id) VALUES
  -- READ (GLOBAL): all roles
  ('ap-read-g-designer', 'READ', 'GLOBAL', 'ps-default', 'role-designer', NULL, NULL),
  ('ap-read-g-reviewer', 'READ', 'GLOBAL', 'ps-default', 'role-reviewer', NULL, NULL),
  ('ap-read-g-reader',   'READ', 'GLOBAL', 'ps-default', 'role-reader',   NULL, NULL),

  -- READ_NODE: all roles × both node types
  ('ap-rn-d-doc', 'READ_NODE', 'NODE', 'ps-default', 'role-designer', 'nt-document', NULL),
  ('ap-rn-d-prt', 'READ_NODE', 'NODE', 'ps-default', 'role-designer', 'nt-part',     NULL),
  ('ap-rn-r-doc', 'READ_NODE', 'NODE', 'ps-default', 'role-reviewer', 'nt-document', NULL),
  ('ap-rn-r-prt', 'READ_NODE', 'NODE', 'ps-default', 'role-reviewer', 'nt-part',     NULL),
  ('ap-rn-o-doc', 'READ_NODE', 'NODE', 'ps-default', 'role-reader',   'nt-document', NULL),
  ('ap-rn-o-prt', 'READ_NODE', 'NODE', 'ps-default', 'role-reader',   'nt-part',     NULL),

  -- CREATE_NODE: designer
  ('ap-cn-d-doc', 'CREATE_NODE', 'NODE', 'ps-default', 'role-designer', 'nt-document', NULL),
  ('ap-cn-d-prt', 'CREATE_NODE', 'NODE', 'ps-default', 'role-designer', 'nt-part',     NULL),

  -- UPDATE_NODE: designer
  ('ap-un-d-doc', 'UPDATE_NODE', 'NODE', 'ps-default', 'role-designer', 'nt-document', NULL),
  ('ap-un-d-prt', 'UPDATE_NODE', 'NODE', 'ps-default', 'role-designer', 'nt-part',     NULL),

  -- SIGN: reviewer
  ('ap-sg-r-doc', 'SIGN', 'NODE', 'ps-default', 'role-reviewer', 'nt-document', NULL),
  ('ap-sg-r-prt', 'SIGN', 'NODE', 'ps-default', 'role-reviewer', 'nt-part',     NULL),

  -- TRANSITION: per transition
  -- tr-freeze: designer + admin
  ('ap-tr-d-doc-freeze',   'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-designer', 'nt-document', 'tr-freeze'),
  ('ap-tr-a-doc-freeze',   'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-admin',    'nt-document', 'tr-freeze'),
  ('ap-tr-d-prt-freeze',   'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-designer', 'nt-part',     'tr-freeze'),
  ('ap-tr-a-prt-freeze',   'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-admin',    'nt-part',     'tr-freeze'),
  -- tr-unfreeze: admin only
  ('ap-tr-a-doc-unfreeze', 'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-admin',    'nt-document', 'tr-unfreeze'),
  ('ap-tr-a-prt-unfreeze', 'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-admin',    'nt-part',     'tr-unfreeze'),
  -- tr-release: reviewer + admin
  ('ap-tr-r-doc-release',  'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-reviewer', 'nt-document', 'tr-release'),
  ('ap-tr-a-doc-release',  'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-admin',    'nt-document', 'tr-release'),
  ('ap-tr-r-prt-release',  'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-reviewer', 'nt-part',     'tr-release'),
  ('ap-tr-a-prt-release',  'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-admin',    'nt-part',     'tr-release'),
  -- tr-revise: designer + admin
  ('ap-tr-d-doc-revise',   'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-designer', 'nt-document', 'tr-revise'),
  ('ap-tr-a-doc-revise',   'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-admin',    'nt-document', 'tr-revise'),
  ('ap-tr-d-prt-revise',   'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-designer', 'nt-part',     'tr-revise'),
  ('ap-tr-a-prt-revise',   'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-admin',    'nt-part',     'tr-revise'),
  -- tr-obsolete: admin only
  ('ap-tr-a-doc-obsolete', 'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-admin',    'nt-document', 'tr-obsolete'),
  ('ap-tr-a-prt-obsolete', 'TRANSITION', 'LIFECYCLE', 'ps-default', 'role-admin',    'nt-part',     'tr-obsolete'),

  -- COMMIT / ROLLBACK: designer + reviewer (TX scope)
  ('ap-commit-designer',   'COMMIT',   'TX', 'ps-default', 'role-designer', NULL, NULL),
  ('ap-commit-reviewer',   'COMMIT',   'TX', 'ps-default', 'role-reviewer', NULL, NULL),
  ('ap-rollback-designer', 'ROLLBACK', 'TX', 'ps-default', 'role-designer', NULL, NULL),
  ('ap-rollback-reviewer', 'ROLLBACK', 'TX', 'ps-default', 'role-reviewer', NULL, NULL),

  -- GLOBAL: admin only
  ('ap-gl-mm-admin',  'MANAGE_METAMODEL', 'GLOBAL', 'ps-default', 'role-admin', NULL, NULL),
  ('ap-gl-rl-admin',  'MANAGE_ROLES',     'GLOBAL', 'ps-default', 'role-admin', NULL, NULL),
  ('ap-gl-bl-admin',  'MANAGE_BASELINES', 'GLOBAL', 'ps-default', 'role-admin', NULL, NULL),
  ('ap-gl-mlc-admin', 'MANAGE_LIFECYCLE', 'GLOBAL', 'ps-default', 'role-admin', NULL, NULL);
