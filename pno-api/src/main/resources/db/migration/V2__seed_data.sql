-- ============================================================
-- PNO SEED DATA — authoritative bootstrap for the whole system
--
-- This is the single source of truth for:
--   • roles        — referenced by psm permission tables (role_id VARCHAR)
--   • users        — resolved at request-time by plm-api via HTTP
--   • project spaces — the segregation contexts for all psm nodes
--
-- IDs are stable and intentionally short so that psm seed data
-- (node_type_permission, transition_permission, etc.) can reference
-- them as plain VARCHAR strings without FK constraints.
-- ============================================================

-- ============================================================
-- ROLES
--   is_admin = 1 → bypasses all role-based checks in psm
-- ============================================================

INSERT INTO pno_role (id, name, description, is_admin) VALUES
  ('role-admin',
   'ADMIN',
   'Full access — bypasses all permission checks. Reserved for PLM administrators.',
   1),
  ('role-designer',
   'DESIGNER',
   'Creates and edits nodes, triggers lifecycle transitions, manages links. Cannot sign.',
   0),
  ('role-reviewer',
   'REVIEWER',
   'Reviews and signs nodes. Can trigger Release transition. Cannot create or edit nodes.',
   0),
  ('role-reader',
   'READER',
   'Read-only access across all node types. Cannot edit, transition, sign, or create links.',
   0);

-- ============================================================
-- USERS
-- ============================================================

INSERT INTO pno_user (id, username, display_name, email, active) VALUES
  ('user-admin',   'admin',   'PLM Administrator', 'admin@plm.local',   1),
  ('user-alice',   'alice',   'Alice Dupont',       'alice@plm.local',   1),
  ('user-bob',     'bob',     'Bob Martin',         'bob@plm.local',     1),
  ('user-charlie', 'charlie', 'Charlie Leclerc',    'charlie@plm.local', 1);

-- ============================================================
-- USER → ROLE ASSIGNMENTS
-- ============================================================

INSERT INTO user_role (id, user_id, role_id) VALUES
  ('ur-1', 'user-admin',   'role-admin'),
  ('ur-2', 'user-alice',   'role-designer'),
  ('ur-3', 'user-bob',     'role-reviewer'),
  ('ur-4', 'user-charlie', 'role-reader');

-- ============================================================
-- PROJECT SPACES
--
-- ps-default  : the standard working project space, always present.
--               All psm permission seed data (V2) targets this space.
-- ps-archive  : read-only archive space — no write permissions seeded.
--               Useful as a second space for multi-space testing.
-- ============================================================

INSERT INTO project_space (id, name, description, created_at) VALUES
  ('ps-default', 'Default',
   'Standard project space — fully seeded with action and lifecycle permissions.',
   CURRENT_TIMESTAMP),
  ('ps-archive', 'Archive',
   'Archive project space — no write permissions by default. Use for released baselines.',
   CURRENT_TIMESTAMP);
