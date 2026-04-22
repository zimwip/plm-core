-- ============================================================
-- Introduce PROJECT_SPACE scope for READ and UPDATE permissions.
--
-- These permissions gate per-project-space access (not per node type).
-- The Casbin policy tuple is unchanged — only the scope metadata
-- and UI grouping are affected.
-- ============================================================

-- Change scope from GLOBAL to PROJECT_SPACE
UPDATE permission SET scope = 'PROJECT_SPACE' WHERE permission_code IN ('READ', 'UPDATE');

-- Align existing authorization_policy rows
UPDATE authorization_policy SET scope = 'PROJECT_SPACE'
WHERE permission_code IN ('READ', 'UPDATE') AND scope = 'GLOBAL';
