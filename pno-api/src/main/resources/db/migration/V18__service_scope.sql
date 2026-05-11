-- ============================================================
-- V18 — SERVICE scope + SERVICE_ACCESS permission (owned by platform)
--
-- SERVICE scope has one key: service_code.
-- Keys fingerprint = SHA-256('service_code=<value>').
--
-- Grandfathers all existing roles for all known services so no
-- existing user loses access on upgrade. New services added later
-- require explicit grants (deny-all default).
-- ============================================================

-- 1. Scope row. Seeded with the canonical hash so runtime registration
--    from platform-api is idempotent (hash matches → no-op).
--    Hash = SHA-256('parent=\nkeys=service_code') = see ScopeDefinitionHasher.
INSERT INTO permission_scope (scope_code, parent_scope_code, description, definition_hash, owner_service)
SELECT 'SERVICE', NULL, 'Controls which users can access each service.',
       '4eb664db49834c2938ef956195b15a13b951e9a4757b9d9d6ebb14de5ebdf7f6', 'platform'
WHERE NOT EXISTS (SELECT 1 FROM permission_scope WHERE scope_code = 'SERVICE');

-- 2. Scope key row (position 1 = primary object identifier).
INSERT INTO permission_scope_key (scope_code, key_position, key_name, description)
SELECT 'SERVICE', 1, 'service_code', 'Service code of the target service (e.g. psm, psa, dst)'
WHERE NOT EXISTS (SELECT 1 FROM permission_scope_key WHERE scope_code = 'SERVICE');

-- 3. Permission catalog row.
INSERT INTO permission (permission_code, scope, display_name, description, display_order, service_code)
VALUES ('SERVICE_ACCESS', 'SERVICE', 'Service Access', 'Grants access to a specific service', 5, 'platform')
ON CONFLICT (permission_code) DO NOTHING;

-- 4. Grandfather grants: all existing roles × all known service codes × all project spaces.
--    Keys fingerprints = SHA-256('service_code=<svc>'):
--      psm      = 3847f92ee1fd659670cafa0def007c8d26e8f43d1cb98ed336f8e879d30e1cdf
--      pno      = 0fb9f0ad68c4e11484b7dc9b92de293fb50003bcc87a96206d425ed38f7a167d
--      psa      = ede10ba26f3cb87a99895621828377edb06c5d249c56e528eeb923c70da10442
--      platform = a351e6f7590f3d56aeb24a0ff802d4bcb15b27bd6acfaa3989f5b24e50524dcf
--      dst      = ba0675434532e4c23219841e1d9688961380dc5422420aa62131b07ec2dc8096
--      ws       = 851fba4a9cfbec989b2e3b9d81d818d4c151bc6e65521d853be0479e20dc5a30
--      cad-api  = 48cc17380692f3757505b832bcfad10f5f257e8e378c8d8fa8b9d9ecdcd452e0
INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
SELECT 'ap-svc-' || g.svc_short || '-' || g.role_short || '-' || ps.id,
       'SERVICE_ACCESS', 'SERVICE', g.role_id, ps.id, g.fingerprint
FROM project_space ps
CROSS JOIN (VALUES
    ('psm',      'psm',  'role-admin',    'admin',    '3847f92ee1fd659670cafa0def007c8d26e8f43d1cb98ed336f8e879d30e1cdf'),
    ('psm',      'psm',  'role-designer', 'designer', '3847f92ee1fd659670cafa0def007c8d26e8f43d1cb98ed336f8e879d30e1cdf'),
    ('psm',      'psm',  'role-reviewer', 'reviewer', '3847f92ee1fd659670cafa0def007c8d26e8f43d1cb98ed336f8e879d30e1cdf'),
    ('psm',      'psm',  'role-reader',   'reader',   '3847f92ee1fd659670cafa0def007c8d26e8f43d1cb98ed336f8e879d30e1cdf'),
    ('pno',      'pno',  'role-admin',    'admin',    '0fb9f0ad68c4e11484b7dc9b92de293fb50003bcc87a96206d425ed38f7a167d'),
    ('pno',      'pno',  'role-designer', 'designer', '0fb9f0ad68c4e11484b7dc9b92de293fb50003bcc87a96206d425ed38f7a167d'),
    ('pno',      'pno',  'role-reviewer', 'reviewer', '0fb9f0ad68c4e11484b7dc9b92de293fb50003bcc87a96206d425ed38f7a167d'),
    ('pno',      'pno',  'role-reader',   'reader',   '0fb9f0ad68c4e11484b7dc9b92de293fb50003bcc87a96206d425ed38f7a167d'),
    ('psa',      'psa',  'role-admin',    'admin',    'ede10ba26f3cb87a99895621828377edb06c5d249c56e528eeb923c70da10442'),
    ('psa',      'psa',  'role-designer', 'designer', 'ede10ba26f3cb87a99895621828377edb06c5d249c56e528eeb923c70da10442'),
    ('psa',      'psa',  'role-reviewer', 'reviewer', 'ede10ba26f3cb87a99895621828377edb06c5d249c56e528eeb923c70da10442'),
    ('psa',      'psa',  'role-reader',   'reader',   'ede10ba26f3cb87a99895621828377edb06c5d249c56e528eeb923c70da10442'),
    ('platform', 'plt',  'role-admin',    'admin',    'a351e6f7590f3d56aeb24a0ff802d4bcb15b27bd6acfaa3989f5b24e50524dcf'),
    ('platform', 'plt',  'role-designer', 'designer', 'a351e6f7590f3d56aeb24a0ff802d4bcb15b27bd6acfaa3989f5b24e50524dcf'),
    ('platform', 'plt',  'role-reviewer', 'reviewer', 'a351e6f7590f3d56aeb24a0ff802d4bcb15b27bd6acfaa3989f5b24e50524dcf'),
    ('platform', 'plt',  'role-reader',   'reader',   'a351e6f7590f3d56aeb24a0ff802d4bcb15b27bd6acfaa3989f5b24e50524dcf'),
    ('dst',      'dst',  'role-admin',    'admin',    'ba0675434532e4c23219841e1d9688961380dc5422420aa62131b07ec2dc8096'),
    ('dst',      'dst',  'role-designer', 'designer', 'ba0675434532e4c23219841e1d9688961380dc5422420aa62131b07ec2dc8096'),
    ('dst',      'dst',  'role-reviewer', 'reviewer', 'ba0675434532e4c23219841e1d9688961380dc5422420aa62131b07ec2dc8096'),
    ('dst',      'dst',  'role-reader',   'reader',   'ba0675434532e4c23219841e1d9688961380dc5422420aa62131b07ec2dc8096'),
    ('ws',       'ws',   'role-admin',    'admin',    '851fba4a9cfbec989b2e3b9d81d818d4c151bc6e65521d853be0479e20dc5a30'),
    ('ws',       'ws',   'role-designer', 'designer', '851fba4a9cfbec989b2e3b9d81d818d4c151bc6e65521d853be0479e20dc5a30'),
    ('ws',       'ws',   'role-reviewer', 'reviewer', '851fba4a9cfbec989b2e3b9d81d818d4c151bc6e65521d853be0479e20dc5a30'),
    ('ws',       'ws',   'role-reader',   'reader',   '851fba4a9cfbec989b2e3b9d81d818d4c151bc6e65521d853be0479e20dc5a30'),
    ('cad-api',  'cad',  'role-admin',    'admin',    '48cc17380692f3757505b832bcfad10f5f257e8e378c8d8fa8b9d9ecdcd452e0'),
    ('cad-api',  'cad',  'role-designer', 'designer', '48cc17380692f3757505b832bcfad10f5f257e8e378c8d8fa8b9d9ecdcd452e0'),
    ('cad-api',  'cad',  'role-reviewer', 'reviewer', '48cc17380692f3757505b832bcfad10f5f257e8e378c8d8fa8b9d9ecdcd452e0'),
    ('cad-api',  'cad',  'role-reader',   'reader',   '48cc17380692f3757505b832bcfad10f5f257e8e378c8d8fa8b9d9ecdcd452e0')
) AS g(service_code, svc_short, role_id, role_short, fingerprint)
ON CONFLICT (permission_code, scope_code, role_id, project_space_id, keys_fingerprint) DO NOTHING;

-- 5. Key rows for all granted policies.
INSERT INTO authorization_policy_key (policy_id, key_name, key_value)
SELECT 'ap-svc-' || g.svc_short || '-' || g.role_short || '-' || ps.id, 'service_code', g.service_code
FROM project_space ps
CROSS JOIN (VALUES
    ('psm',      'psm',  'role-admin',    'admin'),
    ('psm',      'psm',  'role-designer', 'designer'),
    ('psm',      'psm',  'role-reviewer', 'reviewer'),
    ('psm',      'psm',  'role-reader',   'reader'),
    ('pno',      'pno',  'role-admin',    'admin'),
    ('pno',      'pno',  'role-designer', 'designer'),
    ('pno',      'pno',  'role-reviewer', 'reviewer'),
    ('pno',      'pno',  'role-reader',   'reader'),
    ('psa',      'psa',  'role-admin',    'admin'),
    ('psa',      'psa',  'role-designer', 'designer'),
    ('psa',      'psa',  'role-reviewer', 'reviewer'),
    ('psa',      'psa',  'role-reader',   'reader'),
    ('platform', 'plt',  'role-admin',    'admin'),
    ('platform', 'plt',  'role-designer', 'designer'),
    ('platform', 'plt',  'role-reviewer', 'reviewer'),
    ('platform', 'plt',  'role-reader',   'reader'),
    ('dst',      'dst',  'role-admin',    'admin'),
    ('dst',      'dst',  'role-designer', 'designer'),
    ('dst',      'dst',  'role-reviewer', 'reviewer'),
    ('dst',      'dst',  'role-reader',   'reader'),
    ('ws',       'ws',   'role-admin',    'admin'),
    ('ws',       'ws',   'role-designer', 'designer'),
    ('ws',       'ws',   'role-reviewer', 'reviewer'),
    ('ws',       'ws',   'role-reader',   'reader'),
    ('cad-api',  'cad',  'role-admin',    'admin'),
    ('cad-api',  'cad',  'role-designer', 'designer'),
    ('cad-api',  'cad',  'role-reviewer', 'reviewer'),
    ('cad-api',  'cad',  'role-reader',   'reader')
) AS g(service_code, svc_short, role_id, role_short)
WHERE EXISTS (
    SELECT 1 FROM authorization_policy
    WHERE id = 'ap-svc-' || g.svc_short || '-' || g.role_short || '-' || ps.id
)
ON CONFLICT (policy_id, key_name) DO NOTHING;
