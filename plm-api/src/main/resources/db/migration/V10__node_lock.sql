-- ============================================================
-- V9 — Lock moved from node_version to node
--
-- A lock is a runtime mutex on a node, not historical version
-- data. Moving it to the node table:
--   • decouples locking from the versioning system
--   • removes the dependency on an open transaction
--   • simplifies lock queries (direct column vs subquery)
-- ============================================================

ALTER TABLE node ADD COLUMN locked_by VARCHAR(100);
ALTER TABLE node ADD COLUMN locked_at TIMESTAMP;

ALTER TABLE node_version DROP COLUMN locked_by;
ALTER TABLE node_version DROP COLUMN locked_at;
