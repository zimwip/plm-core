-- V21 — Grant SERVICE_ACCESS for 'search' to all roles × all project spaces
-- SHA-256('service_code=search') = f26718743d3220aea6e6e1d5c982d96d18567e7258d03333fe679941fcd27815

INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
SELECT 'ap-svc-search-' || g.role_short || '-' || ps.id,
       'SERVICE_ACCESS', 'SERVICE', g.role_id, ps.id,
       'f26718743d3220aea6e6e1d5c982d96d18567e7258d03333fe679941fcd27815'
FROM project_space ps
CROSS JOIN (VALUES
    ('role-admin',    'admin'),
    ('role-designer', 'designer'),
    ('role-reviewer', 'reviewer'),
    ('role-reader',   'reader')
) AS g(role_id, role_short)
ON CONFLICT (permission_code, scope_code, role_id, project_space_id, keys_fingerprint) DO NOTHING;

INSERT INTO authorization_policy_key (policy_id, key_name, key_value)
SELECT 'ap-svc-search-' || g.role_short || '-' || ps.id, 'service_code', 'search'
FROM project_space ps
CROSS JOIN (VALUES
    ('role-admin',    'admin'),
    ('role-designer', 'designer'),
    ('role-reviewer', 'reviewer'),
    ('role-reader',   'reader')
) AS g(role_id, role_short)
WHERE EXISTS (
    SELECT 1 FROM authorization_policy
    WHERE id = 'ap-svc-search-' || g.role_short || '-' || ps.id
)
ON CONFLICT (policy_id, key_name) DO NOTHING;
