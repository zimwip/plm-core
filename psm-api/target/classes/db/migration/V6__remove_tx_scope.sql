-- ============================================================
-- Remove TX scope: COMMIT/ROLLBACK now require GLOBAL UPDATE
-- ============================================================

-- Add GLOBAL UPDATE permission (parallel to READ)
INSERT INTO permission (permission_code, scope, display_name, description, display_order) VALUES
  ('UPDATE', 'GLOBAL', 'Update', 'Global update access — commit, rollback transactions', -25);

-- Remove old TX-scoped permissions
DELETE FROM authorization_policy WHERE permission_code IN ('COMMIT', 'ROLLBACK');
DELETE FROM action_required_permission WHERE permission_code IN ('COMMIT', 'ROLLBACK');
DELETE FROM permission WHERE permission_code IN ('COMMIT', 'ROLLBACK');

-- Remap COMMIT and ROLLBACK actions to require UPDATE (GLOBAL)
INSERT INTO action_required_permission (id, action_id, permission_code) VALUES
  ('arp-commit',   'act-commit',   'UPDATE'),
  ('arp-rollback', 'act-rollback', 'UPDATE');

-- Grant UPDATE to designer + reviewer (same roles that had COMMIT/ROLLBACK)
INSERT INTO authorization_policy (id, permission_code, scope, project_space_id, role_id, node_type_id, transition_id) VALUES
  ('ap-update-designer', 'UPDATE', 'GLOBAL', 'ps-default', 'role-designer', NULL, NULL),
  ('ap-update-reviewer', 'UPDATE', 'GLOBAL', 'ps-default', 'role-reviewer', NULL, NULL);
