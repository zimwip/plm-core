-- ============================================================
-- SERVICE_ACCESS grants for the webdav service (serviceCode 'dav').
-- Mirrors the V2 SERVICE_ACCESS pattern:
--   fingerprint = SHA-256('service_code=dav')
--   ID pattern:  ap-svc-dav-{role_short}-{ps_id}
-- ============================================================

INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
SELECT 'ap-svc-dav-' || g.role_short || '-' || ps.id,
       'SERVICE_ACCESS', 'SERVICE', g.role_id, ps.id,
       'bf3a44c3ebe6eaa44be3abc21d8c983502e5b5213e55e7567cf9cbf731fbccd6'
FROM project_space ps
CROSS JOIN (VALUES
    ('role-admin',    'admin'),
    ('role-designer', 'designer'),
    ('role-reviewer', 'reviewer'),
    ('role-reader',   'reader')
) AS g(role_id, role_short);

INSERT INTO authorization_policy_key (policy_id, key_name, key_value)
SELECT 'ap-svc-dav-' || g.role_short || '-' || ps.id,
       'service_code', 'dav'
FROM project_space ps
CROSS JOIN (VALUES
    ('admin'), ('designer'), ('reviewer'), ('reader')
) AS g(role_short);
