-- ============================================================
-- Add hierarchy support to project spaces.
-- Rights assigned at parent level are inherited by children.
-- ============================================================

ALTER TABLE project_space ADD COLUMN parent_id VARCHAR(36) REFERENCES project_space(id);
CREATE INDEX idx_project_space_parent ON project_space(parent_id);
