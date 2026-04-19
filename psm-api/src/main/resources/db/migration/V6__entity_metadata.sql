-- ============================================================
-- V6: Entity Metadata
--
-- Generic key/value metadata attached to any entity via
-- target_type + target_id. Replaces hardcoded is_frozen /
-- is_released columns on lifecycle_state.
-- ============================================================

CREATE TABLE entity_metadata (
    id          VARCHAR(100)  NOT NULL PRIMARY KEY,
    target_type VARCHAR(50)   NOT NULL,
    target_id   VARCHAR(100)  NOT NULL,
    meta_key    VARCHAR(100)  NOT NULL,
    meta_value  VARCHAR(1000),
    CONSTRAINT uq_entity_metadata UNIQUE (target_type, target_id, meta_key)
);

CREATE INDEX idx_entity_metadata_target ON entity_metadata(target_type, target_id);

-- ============================================================
-- Migrate is_frozen / is_released to entity_metadata
-- ============================================================

INSERT INTO entity_metadata (id, target_type, target_id, meta_key, meta_value)
SELECT
  CONCAT('em-', ls.id, '-frozen'),
  'LIFECYCLE_STATE',
  ls.id,
  'frozen',
  'true'
FROM lifecycle_state ls
WHERE ls.is_frozen = 1;

INSERT INTO entity_metadata (id, target_type, target_id, meta_key, meta_value)
SELECT
  CONCAT('em-', ls.id, '-released'),
  'LIFECYCLE_STATE',
  ls.id,
  'released',
  'true'
FROM lifecycle_state ls
WHERE ls.is_released = 1;

-- ============================================================
-- Algorithm parameters for NotFrozenGuard and CollapseHistory
-- ============================================================

-- NotFrozenGuard: meta_key parameter (default: "frozen")
INSERT INTO algorithm_parameter (id, algorithm_id, param_name, param_label, data_type, required, default_value, display_order) VALUES
  ('ap-not-frozen-metakey', 'alg-not-frozen', 'meta_key', 'Metadata Key', 'STRING', 1, 'frozen', 1);

-- Set default value on existing instance
INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value) VALUES
  ('aipv-not-frozen-metakey', 'gi-not-frozen', 'ap-not-frozen-metakey', 'frozen');

-- CollapseHistoryAction: meta_key parameter (default: "released")
INSERT INTO algorithm_parameter (id, algorithm_id, param_name, param_label, data_type, required, default_value, display_order) VALUES
  ('ap-collapse-metakey', 'alg-collapse-history', 'meta_key', 'Boundary Metadata Key', 'STRING', 0, NULL, 1);

-- ============================================================
-- Drop is_frozen / is_released columns
-- (H2 and PostgreSQL both support ALTER TABLE DROP COLUMN)
-- ============================================================

ALTER TABLE lifecycle_state DROP COLUMN is_frozen;
ALTER TABLE lifecycle_state DROP COLUMN is_released;
