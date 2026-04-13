-- ============================================================
-- PNO SEED DATA
--
-- Roles, users, project spaces, and role assignments.
-- IDs are stable so that psm-api can reference them as plain
-- VARCHAR strings without FK constraints.
-- ============================================================

-- ============================================================
-- ROLES
-- ============================================================

INSERT INTO pno_role (id, name, description) VALUES
  ('role-admin',
   'ADMIN',
   'Full access role — assign to admin users alongside is_admin flag.'),
  ('role-designer',
   'DESIGNER',
   'Creates and edits nodes, triggers lifecycle transitions, manages links.'),
  ('role-reviewer',
   'REVIEWER',
   'Reviews and signs nodes. Can trigger Release transition.'),
  ('role-reader',
   'READER',
   'Read-only access across all node types.');

-- ============================================================
-- USERS
--   is_admin = 1 → unconditional system bypass in psm-api
-- ============================================================

INSERT INTO pno_user (id, username, display_name, email, active, is_admin) VALUES
  ('user-admin',   'admin',   'PLM Administrator', 'admin@plm.local',   1, 1),
  ('user-alice',   'alice',   'Alice Dupont',       'alice@plm.local',   1, 0),
  ('user-bob',     'bob',     'Bob Martin',         'bob@plm.local',     1, 0),
  ('user-charlie', 'charlie', 'Charlie Leclerc',    'charlie@plm.local', 1, 0);

-- ============================================================
-- PROJECT SPACES
-- ============================================================

INSERT INTO project_space (id, name, description) VALUES
  ('ps-default', 'Default',
   'Standard project space — fully seeded with action and lifecycle permissions.'),
  ('ps-archive', 'Archive',
   'Archive project space — no write permissions by default.');

-- ============================================================
-- USER → ROLE ASSIGNMENTS (scoped to project space)
-- ============================================================

INSERT INTO user_role (id, user_id, role_id, project_space_id) VALUES
  ('ur-1', 'user-admin',   'role-admin',    'ps-default'),
  ('ur-2', 'user-alice',   'role-designer', 'ps-default'),
  ('ur-3', 'user-bob',     'role-reviewer', 'ps-default'),
  ('ur-4', 'user-charlie', 'role-reader',   'ps-default');
