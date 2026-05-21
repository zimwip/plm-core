-- ============================================================
-- Re-create lifecycle_transition_guard in psm-admin.
-- Previously moved to platform-api in V4; belongs here because
-- it is admin config — it references lifecycle_transition (local FK)
-- and algorithm_instance_id is a soft ref to platform-api rows.
-- ============================================================

CREATE TABLE lifecycle_transition_guard (
    id                      VARCHAR(100) NOT NULL PRIMARY KEY,
    lifecycle_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id) ON DELETE CASCADE,
    algorithm_instance_id   VARCHAR(100) NOT NULL,
    effect                  VARCHAR(20)  NOT NULL DEFAULT 'BLOCK',
    display_order           INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_ltg UNIQUE (lifecycle_transition_id, algorithm_instance_id)
);

-- IDs match what platform-api ActionCatalogRegistryController registers at psm-api startup
-- (contribution path: ainst-psm-c-<safe-code>)
INSERT INTO lifecycle_transition_guard (id, lifecycle_transition_id, algorithm_instance_id, effect, display_order)
VALUES
    ('ltg-release-sig',           'tr-release',  'ainst-psm-c-all-signatures-done', 'BLOCK', 1),
    ('ltg-release-no-rejected',   'tr-release',  'ainst-psm-c-sig-no-rejected',     'BLOCK', 2),
    ('ltg-freeze-required',       'tr-freeze',   'ainst-psm-c-all-required-filled', 'BLOCK', 1),
    ('ltg-unfreeze-has-rejected', 'tr-unfreeze', 'ainst-psm-c-sig-has-rejected',    'BLOCK', 1)
ON CONFLICT DO NOTHING;
