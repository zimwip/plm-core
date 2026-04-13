-- V9 — Scope action permissions per project space
--
-- Previously, node_action_permission rows were global.
-- Each project space can now define its own permission rules for actions.
-- Existing rows are migrated to the default project space.

-- Step 1: add nullable column
ALTER TABLE node_action_permission ADD COLUMN project_space_id VARCHAR(36) REFERENCES project_space(id);

-- Step 2: backfill existing rows to the default project space
UPDATE node_action_permission SET project_space_id = 'ps-default';

-- Step 3: enforce NOT NULL
ALTER TABLE node_action_permission ALTER COLUMN project_space_id SET NOT NULL;

-- Step 4: replace unique constraint to include project_space_id
ALTER TABLE node_action_permission DROP CONSTRAINT uq_nap;
ALTER TABLE node_action_permission ADD CONSTRAINT uq_nap
    UNIQUE (node_type_action_id, role_id, lifecycle_state_id, project_space_id);

CREATE INDEX idx_nap_ps ON node_action_permission(project_space_id);
