-- Remove unused is_default column from action table.
-- Action visibility is now fully driven by guards (HIDE) and permissions.
ALTER TABLE action DROP COLUMN is_default;
