-- ============================================================
-- V3: Scope user_role assignments to a project space
--
-- A user can now hold different roles in different project spaces.
-- Adds project_space_id to user_role and removes ps-archive.
-- ============================================================

-- Step 1: Add column as nullable (required for backfill before NOT NULL)
ALTER TABLE user_role ADD COLUMN project_space_id VARCHAR(36);

-- Step 2: Assign all existing records to ps-default
UPDATE user_role SET project_space_id = 'ps-default';

-- Step 3: Enforce NOT NULL
ALTER TABLE user_role ALTER COLUMN project_space_id SET NOT NULL;

-- Step 4: Foreign key to project_space
ALTER TABLE user_role ADD CONSTRAINT user_role_project_space_id_fkey
    FOREIGN KEY (project_space_id) REFERENCES project_space(id);

-- Step 5: Replace unique constraint — now includes project_space_id
ALTER TABLE user_role DROP CONSTRAINT IF EXISTS uq_user_role;
ALTER TABLE user_role ADD CONSTRAINT uq_user_role UNIQUE (user_id, role_id, project_space_id);

-- Step 6: Index for space-scoped lookups
CREATE INDEX idx_user_role_space ON user_role(project_space_id);

-- Step 7: Remove archive project space (no longer needed)
DELETE FROM project_space WHERE id = 'ps-archive';
