-- ============================================================
-- MANAGE_SECRETS — gates the Settings → Platform → Secrets UI
-- and all /api/psm/admin/secrets endpoints.
-- ============================================================

INSERT INTO permission (permission_code, scope, display_name, description, display_order) VALUES
  ('MANAGE_SECRETS', 'GLOBAL', 'Manage Secrets', 'Administrate Vault-backed secrets', 0);

INSERT INTO authorization_policy (id, permission_code, scope, role_id, node_type_id, transition_id) VALUES
  ('ap-gl-secrets-admin', 'MANAGE_SECRETS', 'GLOBAL', 'role-admin', NULL, NULL);
