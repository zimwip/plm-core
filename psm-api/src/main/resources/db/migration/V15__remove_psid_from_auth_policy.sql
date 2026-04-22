-- ============================================================
-- Remove project_space_id from authorization_policy.
--
-- Permissions are role-based globally. Project space only matters
-- for user-role assignment (PNO user_role table), not for what
-- a role is allowed to do.
-- ============================================================

-- 1. Revert V13: READ and UPDATE back to GLOBAL scope
UPDATE permission SET scope = 'GLOBAL' WHERE permission_code IN ('READ', 'UPDATE') AND scope = 'PROJECT_SPACE';
UPDATE authorization_policy SET scope = 'GLOBAL' WHERE permission_code IN ('READ', 'UPDATE') AND scope = 'PROJECT_SPACE';

-- 2. Deduplicate rows that differ only by project_space_id
DELETE FROM authorization_policy
WHERE id NOT IN (
  SELECT MIN(id) FROM authorization_policy
  GROUP BY permission_code, role_id,
           COALESCE(node_type_id, '__NULL__'),
           COALESCE(transition_id, '__NULL__')
);

-- 3. Drop old unique constraint
ALTER TABLE authorization_policy DROP CONSTRAINT IF EXISTS uq_authorization_policy;

-- 4. Drop the column
ALTER TABLE authorization_policy DROP COLUMN project_space_id;

-- 5. New unique constraint without project_space_id
ALTER TABLE authorization_policy ADD CONSTRAINT uq_authorization_policy
  UNIQUE (permission_code, role_id, node_type_id, transition_id);
