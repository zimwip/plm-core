-- ============================================================
-- V4: Appearance fields
--
-- link_type.color  — hex color used to visually distinguish link types
--                    in the navigation tree (e.g. '#6aacff')
--
-- node_type.color  — hex color for the node type icon in the tree
-- node_type.icon   — icon name from the platform icon set (e.g. 'Box')
-- ============================================================

ALTER TABLE link_type ADD COLUMN color VARCHAR(20);

ALTER TABLE node_type ADD COLUMN color VARCHAR(20);
ALTER TABLE node_type ADD COLUMN icon  VARCHAR(50);
