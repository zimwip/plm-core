-- ============================================================
-- V11 — Remove dedicated PSM2 routing for ps-military.
--
-- Both ps-default and ps-military now share psm-api-1 + the psm1
-- schema. The PSM2 instance stays running but no project space
-- routes to it; isolation is gone.
-- ============================================================

UPDATE project_space SET isolated = 0 WHERE id = 'ps-military';

UPDATE project_space_service_tag
   SET tag_value = 'PSM1'
 WHERE project_space_id = 'ps-military'
   AND service_code     = 'psm';
