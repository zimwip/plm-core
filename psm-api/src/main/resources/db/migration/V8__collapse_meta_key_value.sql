-- ============================================================
-- V8: Set meta_key parameter value on collapse_history instance
-- ============================================================

-- Upsert: update if exists, insert if not
UPDATE algorithm_instance_param_value
SET value = 'released'
WHERE algorithm_instance_id = 'si-collapse-history'
  AND algorithm_parameter_id = 'ap-collapse-metakey';

INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value)
SELECT 'aipv-collapse-metakey', 'si-collapse-history', 'ap-collapse-metakey', 'released'
WHERE NOT EXISTS (
    SELECT 1 FROM algorithm_instance_param_value
    WHERE algorithm_instance_id = 'si-collapse-history'
      AND algorithm_parameter_id = 'ap-collapse-metakey'
);
