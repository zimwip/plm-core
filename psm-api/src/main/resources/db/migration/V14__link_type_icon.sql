-- Adds icon field to link_type (same set as node_type.icon).
ALTER TABLE link_type ADD COLUMN icon VARCHAR(50);
