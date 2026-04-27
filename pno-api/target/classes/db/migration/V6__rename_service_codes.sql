-- ============================================================
-- Rename service codes to short form aligned with gateway URL segment.
-- psm-api → psm, pno-api → pno. (psm-admin/settings-api/ws-gateway
-- are renamed when those services land the convention.)
-- ============================================================

UPDATE project_space_service_tag SET service_code = 'psm' WHERE service_code = 'psm-api';
UPDATE project_space_service_tag SET service_code = 'pno' WHERE service_code = 'pno-api';
