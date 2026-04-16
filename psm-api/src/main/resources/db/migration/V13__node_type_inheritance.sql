-- Adds node type inheritance support.
-- 1. parent_node_type_id on node_type — FK to self, nullable.
-- 2. node_type_id on attribute_state_rule — scopes rules per node type,
--    allowing child types to override parent state rules.

-- ── node_type parent pointer ───────────────────────────────────────
ALTER TABLE node_type
    ADD COLUMN parent_node_type_id VARCHAR(36)
    REFERENCES node_type(id);

-- ── scope attribute_state_rule by node_type ────────────────────────
ALTER TABLE attribute_state_rule
    ADD COLUMN node_type_id VARCHAR(36);

-- Backfill: every existing rule belongs to the attribute's own node type.
UPDATE attribute_state_rule
SET node_type_id = (
    SELECT ad.node_type_id
    FROM attribute_definition ad
    WHERE ad.id = attribute_state_rule.attribute_definition_id
);

-- Unique constraint now includes node_type_id so children can add their own rules.
ALTER TABLE attribute_state_rule
    ADD CONSTRAINT uq_attr_state_rule
    UNIQUE (node_type_id, attribute_definition_id, lifecycle_state_id);
