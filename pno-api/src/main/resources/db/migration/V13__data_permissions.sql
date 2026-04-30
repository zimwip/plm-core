-- ============================================================
-- V13 — DATA scope permissions (owned by dst service)
--
-- The DATA scope is registered at runtime by dst via
-- /internal/scopes/register; permissions still need to live in the catalog
-- so PlmPermissionAspect can resolve scope from code on enforcing services.
--
-- DATA is role-only (no keys), so keys_fingerprint = '0' * 64 and no
-- authorization_policy_key rows are required. Grants are cross-joined
-- against every project_space (legacy semantics: grant active everywhere).
-- ============================================================

-- 1. Seed the DATA scope row so the FK from authorization_policy.scope_code
--    is satisfied. Use a backfill marker hash; runtime registration from
--    dst will overwrite definition_hash with the real value.
INSERT INTO permission_scope (scope_code, parent_scope_code, description, definition_hash, owner_service)
SELECT 'DATA', NULL, 'Role-only check on data store entries.',
       repeat('0', 64), 'dst'
WHERE NOT EXISTS (SELECT 1 FROM permission_scope WHERE scope_code = 'DATA');

-- 2. Permission catalog rows.
INSERT INTO permission (permission_code, scope, display_name, description, display_order) VALUES
  ('READ_DATA',   'DATA', 'Read Data',   'Download stored data and read metadata',         210),
  ('WRITE_DATA',  'DATA', 'Write Data',  'Upload new data into the data store',            220),
  ('MANAGE_DATA', 'DATA', 'Manage Data', 'Administer data store entries (delete, purge)',  230);

-- 3. Default grants — cross-joined over every project_space.
--    admin: read+write+manage; designer + reviewer: read+write; reader: read-only.
INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
SELECT 'ap-data-' || g.perm_short || '-' || g.role_short || '-' || ps.id,
       g.permission_code, 'DATA', g.role_id, ps.id, repeat('0', 64)
FROM project_space ps
CROSS JOIN (VALUES
    ('READ_DATA',   'read',   'role-admin',    'admin'),
    ('READ_DATA',   'read',   'role-designer', 'designer'),
    ('READ_DATA',   'read',   'role-reviewer', 'reviewer'),
    ('READ_DATA',   'read',   'role-reader',   'reader'),
    ('WRITE_DATA',  'write',  'role-admin',    'admin'),
    ('WRITE_DATA',  'write',  'role-designer', 'designer'),
    ('WRITE_DATA',  'write',  'role-reviewer', 'reviewer'),
    ('MANAGE_DATA', 'manage', 'role-admin',    'admin')
) AS g(permission_code, perm_short, role_id, role_short);
