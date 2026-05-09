-- ============================================================
-- V17 — CAD_IMPORT permission (owned by psm service)
--
-- GLOBAL scope (role-only): keys_fingerprint = repeat('0', 64),
-- no authorization_policy_key rows needed.
-- Grants: admin (full) + designer (can import).
-- ============================================================

-- Permission catalog row
INSERT INTO permission (permission_code, scope, display_name, description, display_order, service_code)
VALUES ('CAD_IMPORT', 'GLOBAL', 'CAD Import', 'Trigger CAD file import and create PSM nodes', 160, 'psm')
ON CONFLICT (permission_code) DO NOTHING;

-- Default grants — cross-joined over every project_space
INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
SELECT 'ap-cad-import-' || g.role_short || '-' || ps.id,
       'CAD_IMPORT', 'GLOBAL', g.role_id, ps.id, repeat('0', 64)
FROM project_space ps
CROSS JOIN (VALUES
    ('role-admin',    'admin'),
    ('role-designer', 'designer')
) AS g(role_id, role_short)
ON CONFLICT (permission_code, scope_code, role_id, project_space_id, keys_fingerprint) DO NOTHING;
