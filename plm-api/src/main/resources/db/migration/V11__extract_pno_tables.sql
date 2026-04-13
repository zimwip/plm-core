-- ============================================================
-- V11 — Extract PNO tables from PSM schema
--
-- plm_user, plm_role, user_role, project_space are now owned
-- by pno-api (pno schema). Remove them from the psm schema.
--
-- All columns that previously held FK-enforced references to
-- those tables (role_id, project_space_id) become plain VARCHAR
-- application-level references — no FK constraint, consistent
-- with the cross-service boundary.
--
-- H2 note: H2 2.x in PostgreSQL mode names auto-generated FK
-- constraints {table}_{column}_fkey, identical to PostgreSQL.
-- IF EXISTS guards make each statement a no-op if already gone.
-- ============================================================

-- ── 1. Drop FK constraints from tables we are KEEPING ────────

-- node_type_permission.role_id → plm_role
ALTER TABLE node_type_permission
    DROP CONSTRAINT IF EXISTS node_type_permission_role_id_fkey;

-- attribute_view.eligible_role_id → plm_role (nullable FK)
ALTER TABLE attribute_view
    DROP CONSTRAINT IF EXISTS attribute_view_eligible_role_id_fkey;

-- transition_permission.role_id → plm_role
ALTER TABLE transition_permission
    DROP CONSTRAINT IF EXISTS transition_permission_role_id_fkey;

-- node_action_permission.role_id → plm_role
ALTER TABLE node_action_permission
    DROP CONSTRAINT IF EXISTS node_action_permission_role_id_fkey;

-- node.project_space_id → project_space
ALTER TABLE node
    DROP CONSTRAINT IF EXISTS node_project_space_id_fkey;

-- node_action_permission.project_space_id → project_space (added in V9)
ALTER TABLE node_action_permission
    DROP CONSTRAINT IF EXISTS node_action_permission_project_space_id_fkey;

-- ── 2. Drop the tables (dependency order) ────────────────────

-- user_role first — it has FKs to both plm_user and plm_role
DROP TABLE IF EXISTS user_role;

-- plm_user — no more inbound FKs once user_role is gone
DROP TABLE IF EXISTS plm_user;

-- plm_role — no more inbound FKs once all constraints above removed
DROP TABLE IF EXISTS plm_role;

-- project_space — no more inbound FKs once node and nap constraints removed
DROP TABLE IF EXISTS project_space;
