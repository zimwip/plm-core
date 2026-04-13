-- V7: Add as_name flag to attribute_definition
-- Only one attribute per node_type may have as_name = 1.
-- Constraint enforced at application level (MetaModelService).
ALTER TABLE attribute_definition ADD COLUMN as_name INTEGER NOT NULL DEFAULT 0;
