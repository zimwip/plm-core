-- ============================================================
-- Consolidate MANAGE_METAMODEL + MANAGE_LIFECYCLE → MANAGE_PSM
--                MANAGE_ROLES                     → MANAGE_PNO
--
-- MANAGE_PSM and MANAGE_PNO already exist (V9). This migration
-- migrates existing grants and removes the old permissions.
-- ============================================================

-- 1. Migrate authorization_policy rows: old → new permission codes
--    For each old grant, insert an equivalent new grant if not already present.
INSERT INTO authorization_policy (id, permission_code, scope, role_id, node_type_id, transition_id)
  SELECT CONCAT('ap-mig-', SUBSTRING(CAST(RANDOM() AS VARCHAR), 3, 8)),
         'MANAGE_PSM', 'GLOBAL', role_id, NULL, NULL
  FROM authorization_policy
  WHERE permission_code IN ('MANAGE_METAMODEL', 'MANAGE_LIFECYCLE')
    AND role_id NOT IN (
      SELECT role_id FROM authorization_policy WHERE permission_code = 'MANAGE_PSM'
    )
  GROUP BY role_id;

INSERT INTO authorization_policy (id, permission_code, scope, role_id, node_type_id, transition_id)
  SELECT CONCAT('ap-mig-', SUBSTRING(CAST(RANDOM() AS VARCHAR), 3, 8)),
         'MANAGE_PNO', 'GLOBAL', role_id, NULL, NULL
  FROM authorization_policy
  WHERE permission_code = 'MANAGE_ROLES'
    AND role_id NOT IN (
      SELECT role_id FROM authorization_policy WHERE permission_code = 'MANAGE_PNO'
    )
  GROUP BY role_id;

-- 2. Delete old authorization_policy rows
DELETE FROM authorization_policy WHERE permission_code IN ('MANAGE_METAMODEL', 'MANAGE_LIFECYCLE', 'MANAGE_ROLES');

-- 3. Delete old permission catalog entries
DELETE FROM permission WHERE permission_code IN ('MANAGE_METAMODEL', 'MANAGE_LIFECYCLE', 'MANAGE_ROLES');
