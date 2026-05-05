-- Add service_code to permission table so pno-api can serve the full
-- permission catalog scoped per service (pno is now the single source of truth).

ALTER TABLE permission ADD COLUMN IF NOT EXISTS service_code VARCHAR(50);

-- Backfill service_code for all existing rows
UPDATE permission SET service_code = 'psm'      WHERE permission_code IN ('READ','READ_NODE','UPDATE','CREATE_NODE','UPDATE_NODE','TRANSITION','SIGN','MANAGE_BASELINES','MANAGE_PSM');
UPDATE permission SET service_code = 'pno'      WHERE permission_code = 'MANAGE_PNO';
UPDATE permission SET service_code = 'platform' WHERE permission_code IN ('MANAGE_PLATFORM','MANAGE_SECRETS');
UPDATE permission SET service_code = 'dst'      WHERE permission_code IN ('READ_DATA','WRITE_DATA','MANAGE_DATA');

-- Fall back for any unknown rows
UPDATE permission SET service_code = 'platform' WHERE service_code IS NULL;
