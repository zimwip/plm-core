-- ============================================================
-- Per-user DEFAULT project space.
-- The gateway (spe) reads this at login to pick the active
-- project space bound to the issued token.
-- ============================================================

ALTER TABLE pno_user ADD COLUMN default_project_space_id VARCHAR(36) REFERENCES project_space(id);

-- Seed defaults for the V2 seed users.
-- All seed users default to ps-default (charlie only has a role there).
UPDATE pno_user SET default_project_space_id = 'ps-default'
    WHERE id = 'user-admin'   AND default_project_space_id IS NULL;
UPDATE pno_user SET default_project_space_id = 'ps-default'
    WHERE id = 'user-alice'   AND default_project_space_id IS NULL;
UPDATE pno_user SET default_project_space_id = 'ps-default'
    WHERE id = 'user-bob'     AND default_project_space_id IS NULL;
UPDATE pno_user SET default_project_space_id = 'ps-default'
    WHERE id = 'user-charlie' AND default_project_space_id IS NULL;
