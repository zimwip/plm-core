-- ============================================================
-- V3 — Reference counting + deduplication constraint
--
-- ref_count tracks how many holders reference this data object.
-- When it reaches 0, the service GC-deletes the file and row.
-- DEFAULT 1: existing rows each have one implicit holder.
--
-- Unique constraint on (sha256, project_space_id) enforces the
-- dedup invariant at DB level and makes concurrent duplicate
-- uploads safe (second insert loses, is treated as duplicate).
-- ============================================================

ALTER TABLE data_object ADD COLUMN ref_count INTEGER NOT NULL DEFAULT 1;

ALTER TABLE data_object
    ADD CONSTRAINT uq_data_object_sha_ps UNIQUE (sha256, project_space_id);
