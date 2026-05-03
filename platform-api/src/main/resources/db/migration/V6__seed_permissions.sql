-- ============================================================
-- Permission catalog (moved from psm-admin, scoped by service_code)
-- ============================================================

INSERT INTO permission (permission_code, service_code, scope, display_name, description, display_order) VALUES
  ('READ',             'psm',      'GLOBAL',    'Read',              'Global read access to views and lists',                      -30),
  ('READ_NODE',        'psm',      'NODE',      'Read Node',         'Per-node-type read access to nodes',                         -20),
  ('UPDATE',           'psm',      'GLOBAL',    'Update',            'Global update access — commit, rollback transactions',       -25),
  ('CREATE_NODE',      'psm',      'NODE',      'Create Node',       'Create new nodes of this type',                                5),
  ('UPDATE_NODE',      'psm',      'NODE',      'Update Node',       'Modify node content (checkout, checkin, links, attributes)',   50),
  ('TRANSITION',       'psm',      'LIFECYCLE', 'Transition',        'Apply a lifecycle state transition',                          10),
  ('SIGN',             'psm',      'NODE',      'Sign',              'Record an electronic signature',                             200),
  ('MANAGE_BASELINES', 'psm',      'GLOBAL',    'Manage Baselines',  'Create baselines',                                             0),
  ('MANAGE_PSM',       'psm',      'GLOBAL',    'Manage PSM',        'Access application settings',                                  0),
  ('MANAGE_PNO',       'pno',      'GLOBAL',    'Manage PnO',        'Access People & Organisation settings',                        0),
  ('MANAGE_PLATFORM',  'platform', 'GLOBAL',    'Manage Platform',   'Access platform configuration settings',                       0),
  ('MANAGE_SECRETS',   'platform', 'GLOBAL',    'Manage Secrets',    'Administrate Vault-backed secrets',                            0),
  ('READ_DATA',        'dst',      'DATA',      'Read Data',         'Download stored data and read metadata',                     210),
  ('WRITE_DATA',       'dst',      'DATA',      'Write Data',        'Upload new data into the data store',                        220),
  ('MANAGE_DATA',      'dst',      'DATA',      'Manage Data',       'Administer data store entries (delete, purge)',               230)
ON CONFLICT (permission_code) DO NOTHING;

-- ============================================================
-- Action → permission mappings (using platform-api action IDs)
-- ============================================================

INSERT INTO action_required_permission (id, action_id, permission_code) VALUES
  ('arp-psm-checkout',             'act-psm-checkout',        'UPDATE_NODE'),
  ('arp-psm-checkin',              'act-psm-checkin',         'UPDATE_NODE'),
  ('arp-psm-update-node',          'act-psm-update-node',     'UPDATE_NODE'),
  ('arp-psm-create-link',          'act-psm-create-link',     'UPDATE_NODE'),
  ('arp-psm-update-link',          'act-psm-update-link',     'UPDATE_NODE'),
  ('arp-psm-delete-link',          'act-psm-delete-link',     'UPDATE_NODE'),
  ('arp-psm-abort',                'act-psm-abort',           'UPDATE_NODE'),
  ('arp-psm-transition',           'act-psm-transition',      'TRANSITION'),
  ('arp-psm-sign',                 'act-psm-sign',            'SIGN'),
  ('arp-psm-commit',               'act-psm-commit',          'UPDATE'),
  ('arp-psm-rollback',             'act-psm-rollback',        'UPDATE'),
  ('arp-psm-baseline',             'act-psm-baseline',        'MANAGE_BASELINES'),
  ('arp-psm-create-node-update',   'act-psm-create-node',     'UPDATE'),
  ('arp-psm-create-node-create',   'act-psm-create-node',     'CREATE_NODE'),
  ('arp-psm-assign-domain',        'act-psm-assign-domain',   'UPDATE_NODE'),
  ('arp-psm-unassign-domain',      'act-psm-unassign-domain', 'UPDATE_NODE')
ON CONFLICT (id) DO NOTHING;
