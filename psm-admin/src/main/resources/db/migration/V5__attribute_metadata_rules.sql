-- ============================================================
-- Attribute validation rework: dedicated storage + drop legacy columns
--
-- Validation of attributes is now driven by pluggable AttributeValidator
-- algorithms (required / regex / editable). Two dedicated psa tables replace
-- the legacy columns and the attribute_state_rule table:
--
--   attribute_metadata        — per-attribute key/value (regex pattern, hidden-in-state)
--   attribute_validation_rule — explicit validator attachment (replaces the opaque
--                               ATTR_VALIDATOR entity_metadata encoding AND the
--                               required/editable columns of attribute_state_rule)
--
-- The runtime transport to psm-api is unchanged: ConfigSnapshotBuilder serialises
-- these tables into the same generic entityMetadata keys psm-api already parses.
--
-- Algorithm instance ids reference the deterministic instances created by
-- psm-api auto-registration (ainst-psm-c-<safe-code>). They are soft references.
-- ============================================================

-- ---- New tables -------------------------------------------------------------

CREATE TABLE attribute_metadata (
    attribute_definition_id VARCHAR(36)  NOT NULL REFERENCES attribute_definition(id),
    meta_key                VARCHAR(100) NOT NULL,
    meta_value              VARCHAR(1000),
    PRIMARY KEY (attribute_definition_id, meta_key)
);

CREATE TABLE attribute_validation_rule (
    id                      VARCHAR(64)  NOT NULL PRIMARY KEY,
    node_type_id            VARCHAR(36),                          -- NULL = applies to every node type (domain attrs)
    attribute_definition_id VARCHAR(36)  NOT NULL REFERENCES attribute_definition(id),
    lifecycle_state_id      VARCHAR(36),                          -- NULL = all states
    algorithm_instance_id   VARCHAR(100) NOT NULL,                -- soft ref to platform-api algorithm_instance
    effect                  VARCHAR(20)  NOT NULL DEFAULT 'BLOCK'
);

CREATE INDEX idx_attr_meta_attr      ON attribute_metadata(attribute_definition_id);
CREATE INDEX idx_attr_val_rule_attr  ON attribute_validation_rule(attribute_definition_id);
CREATE INDEX idx_attr_val_rule_nt    ON attribute_validation_rule(node_type_id, attribute_definition_id);

-- ---- Enum definitions for ENUM attrs that only had inline allowed_values -----
-- (allowed_values is being removed; ENUM membership now comes from enum tables.)

INSERT INTO enum_definition (id, name, description) VALUES
  ('enum-ssi-clearance', 'Clearance Required', 'Whether access clearance must be maintained'),
  ('enum-ssi-envrating', 'Environment Ratings', 'Environmental operating conditions');

INSERT INTO enum_value (enum_definition_id, value, display_order) VALUES
  ('enum-ssi-clearance', 'Yes', 0),
  ('enum-ssi-clearance', 'No',  1),
  ('enum-ssi-envrating', 'Standard',       0),
  ('enum-ssi-envrating', 'Pressurized',    1),
  ('enum-ssi-envrating', 'Unpressurized',  2),
  ('enum-ssi-envrating', 'High Temp',      3),
  ('enum-ssi-envrating', 'Corrosive',      4),
  ('enum-ssi-envrating', 'Wet',            5);

UPDATE attribute_definition SET enum_definition_id = 'enum-ssi-clearance'
  WHERE id = 'ad-ssi-clearance' AND enum_definition_id IS NULL;
UPDATE attribute_definition SET enum_definition_id = 'enum-ssi-envrating'
  WHERE id = 'ad-ssi-envRating' AND enum_definition_id IS NULL;

-- Link-type ENUM attributes (kind / layer) also relied on inline allowed_values.
INSERT INTO enum_definition (id, name, description) VALUES
  ('enum-link-kind',  'Representation Kinds', 'CAD representation kinds'),
  ('enum-link-layer', 'Representation Layers', 'CAD representation layers');

INSERT INTO enum_value (enum_definition_id, value, display_order) VALUES
  ('enum-link-kind',  'design',     0),
  ('enum-link-kind',  'simplified', 1),
  ('enum-link-kind',  'original',   2),
  ('enum-link-layer', 'main',       0),
  ('enum-link-layer', 'pmi',        1),
  ('enum-link-layer', 'space',      2);

UPDATE link_type_attribute SET enum_definition_id = 'enum-link-kind'
  WHERE link_type_id = 'lt-part-data' AND name = 'kind'  AND enum_definition_id IS NULL;
UPDATE link_type_attribute SET enum_definition_id = 'enum-link-layer'
  WHERE link_type_id = 'lt-part-data' AND name = 'layer' AND enum_definition_id IS NULL;

-- ---- Migrate required: attribute_definition.required -> all-states rule ------
-- Every state-scoped required=1 attribute in the seed is also globally required,
-- so a single all-states (lifecycle_state_id = NULL) rule per attribute suffices.
-- Node-type attrs carry their node_type_id; domain attrs use NULL (any node type).

INSERT INTO attribute_validation_rule (id, node_type_id, attribute_definition_id, lifecycle_state_id, algorithm_instance_id, effect)
SELECT 'avr-req-' || ad.id, ad.node_type_id, ad.id, NULL,
       'ainst-psm-c-required-attribute-validator', 'BLOCK'
FROM attribute_definition ad
WHERE ad.required = 1;

-- ---- Migrate editability: attribute_state_rule.editable=0 -> per-state lock --
-- Presence of an editable-validator rule for a state means "locked in that state".

INSERT INTO attribute_validation_rule (id, node_type_id, attribute_definition_id, lifecycle_state_id, algorithm_instance_id, effect)
SELECT 'avr-edit-' || asr.id, asr.node_type_id, asr.attribute_definition_id, asr.lifecycle_state_id,
       'ainst-psm-c-editable-attribute-validator', 'BLOCK'
FROM attribute_state_rule asr
WHERE asr.editable = 0;

-- ---- Migrate visibility: attribute_state_rule.visible=0 -> metadata ----------
-- visible is a display concern (not validation). Default = visible; store only
-- the per-state hidden exceptions.

INSERT INTO attribute_metadata (attribute_definition_id, meta_key, meta_value)
SELECT asr.attribute_definition_id, 'visibility.hidden.' || asr.lifecycle_state_id, 'true'
FROM attribute_state_rule asr
WHERE asr.visible = 0;

-- ---- Migrate any legacy regex stored on the column --------------------------
-- (No seed attribute sets naming_regex, but preserve any runtime value.)

INSERT INTO attribute_metadata (attribute_definition_id, meta_key, meta_value)
SELECT ad.id, 'validation.regex', ad.naming_regex
FROM attribute_definition ad
WHERE ad.naming_regex IS NOT NULL AND ad.naming_regex <> '';

INSERT INTO attribute_validation_rule (id, node_type_id, attribute_definition_id, lifecycle_state_id, algorithm_instance_id, effect)
SELECT 'avr-regex-' || ad.id, ad.node_type_id, ad.id, NULL,
       'ainst-psm-c-regex-attribute-validator', 'BLOCK'
FROM attribute_definition ad
WHERE ad.naming_regex IS NOT NULL AND ad.naming_regex <> '';

-- ---- Drop legacy schema -----------------------------------------------------

DROP TABLE attribute_state_rule;

ALTER TABLE attribute_definition DROP COLUMN required;
ALTER TABLE attribute_definition DROP COLUMN naming_regex;
ALTER TABLE attribute_definition DROP COLUMN allowed_values;

ALTER TABLE link_type_attribute DROP COLUMN allowed_values;
