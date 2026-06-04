-- Remove the Enum Attribute Validator algorithm from the catalog.
--
-- Enum validation is intrinsic to the attribute (its enum_definition / allowedValues
-- drive the select widget + value check) — it is NOT an external pluggable validator.
-- The `enum_attribute_validator` algorithm has no @AlgorithmBean implementation in
-- psm-api; this row is a stale leftover from a removed bean that auto-registration
-- neither recreates nor prunes. Drop it (and its instance) permanently.
DELETE FROM algorithm_instance WHERE id = 'ainst-psm-c-enum-attribute-validator';
DELETE FROM algorithm WHERE code = 'enum_attribute_validator';
