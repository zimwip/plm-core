-- ============================================================
-- V3 — link_logical_id support
-- Adds a business identifier field to link instances,
-- with label and pattern validation at link_type level.
-- ============================================================

-- Metadata on link_type: how to label and validate the identifier
ALTER TABLE link_type ADD COLUMN link_logical_id_label   VARCHAR(100) DEFAULT 'Link ID';
ALTER TABLE link_type ADD COLUMN link_logical_id_pattern VARCHAR(500);

-- Instance value on node_version_link
ALTER TABLE node_version_link ADD COLUMN link_logical_id VARCHAR(500);

-- Give the seed link types meaningful labels
UPDATE link_type SET link_logical_id_label = 'Assembly Ref'    WHERE id = 'lt-composed-of';
UPDATE link_type SET link_logical_id_label = 'Doc Ref'         WHERE id = 'lt-doc-part';
UPDATE link_type SET link_logical_id_label = 'Supersession Ref' WHERE id = 'lt-supersedes';
