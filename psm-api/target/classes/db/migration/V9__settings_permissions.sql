-- ============================================================
-- SETTINGS-SPECIFIC PERMISSIONS
-- Dedicated permissions for settings section visibility
-- ============================================================

INSERT INTO permission (permission_code, scope, display_name, description, display_order) VALUES
  ('MANAGE_PNO',      'GLOBAL', 'Manage PnO',      'Access People & Organisation settings',    0),
  ('MANAGE_PLATFORM', 'GLOBAL', 'Manage Platform',  'Access platform configuration settings',   0),
  ('MANAGE_PSM',      'GLOBAL', 'Manage PSM',       'Access application settings',              0);

-- Grant to admin role in default project space
INSERT INTO authorization_policy (id, permission_code, scope, project_space_id, role_id, node_type_id, transition_id) VALUES
  ('ap-gl-pno-admin',  'MANAGE_PNO',      'GLOBAL', 'ps-default', 'role-admin', NULL, NULL),
  ('ap-gl-plat-admin', 'MANAGE_PLATFORM', 'GLOBAL', 'ps-default', 'role-admin', NULL, NULL),
  ('ap-gl-psm-admin',  'MANAGE_PSM',      'GLOBAL', 'ps-default', 'role-admin', NULL, NULL);
