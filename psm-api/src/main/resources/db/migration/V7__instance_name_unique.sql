-- ============================================================
-- V7: Algorithm instance name — NOT NULL + UNIQUE
-- ============================================================

-- Backfill any NULL names with the instance ID
UPDATE algorithm_instance SET name = id WHERE name IS NULL;

ALTER TABLE algorithm_instance ALTER COLUMN name SET NOT NULL;
ALTER TABLE algorithm_instance ADD CONSTRAINT uq_algorithm_instance_name UNIQUE (name);
