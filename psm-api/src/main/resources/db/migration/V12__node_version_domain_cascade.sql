-- ============================================================
-- Cascade node_version_domain on node_version delete
-- Rollback / collapse-history / revise flows delete node_version
-- rows. Without cascade, FK blocks those deletions.
-- ============================================================

ALTER TABLE node_version_domain
    DROP CONSTRAINT IF EXISTS node_version_domain_node_version_id_fkey;

ALTER TABLE node_version_domain
    ADD CONSTRAINT node_version_domain_node_version_id_fkey
    FOREIGN KEY (node_version_id) REFERENCES node_version(id) ON DELETE CASCADE;
