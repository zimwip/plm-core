-- ============================================================
-- V2 — Add project_space_id to data_object
--
-- Every stored object is owned by a project space. Non-admin users
-- can only list/read/delete objects within their active project space.
-- ============================================================

ALTER TABLE data_object ADD COLUMN project_space_id VARCHAR(36);

CREATE INDEX idx_data_object_ps ON data_object(project_space_id);
