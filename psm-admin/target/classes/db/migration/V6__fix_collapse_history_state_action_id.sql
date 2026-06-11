-- ============================================================
-- Repair stale lifecycle_state_action instance id.
--
-- Leftover from the settings-uuid -> code migration. The seed referenced
-- 'si-collapse-history', but the collapse_history StateAction is auto-registered
-- by psm-api as a contribution, so platform-api assigns the deterministic id
-- 'ainst-psm-c-collapse-history' ('-c-' infix, see ActionCatalogPersistenceService).
--
-- Consequence of the mismatch (psm-api StateActionService.rebuildCache):
-- instanceToCode lookup misses -> "no algorithm mapping - skipping" -> the
-- action never runs and the UI shows no algorithm name. Users who re-added the
-- action by hand ended up with a second, semantically-duplicate row carrying the
-- correct id (the PK includes algorithm_instance_id, so it did not collide).
-- ============================================================

-- If a correct row already exists (added via UI), drop the stale one.
DELETE FROM lifecycle_state_action
 WHERE lifecycle_state_id = 'st-released'
   AND algorithm_instance_id = 'si-collapse-history'
   AND EXISTS (
       SELECT 1 FROM lifecycle_state_action
        WHERE lifecycle_state_id = 'st-released'
          AND algorithm_instance_id = 'ainst-psm-c-collapse-history'
          AND trigger = 'ON_ENTER');

-- Otherwise rename the stale id to the correct one.
UPDATE lifecycle_state_action
   SET algorithm_instance_id = 'ainst-psm-c-collapse-history'
 WHERE lifecycle_state_id = 'st-released'
   AND algorithm_instance_id = 'si-collapse-history';
