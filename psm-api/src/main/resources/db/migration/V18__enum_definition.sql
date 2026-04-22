-- ============================================================
-- Enum definitions: reusable enumerations for ENUM attributes
-- ============================================================

CREATE TABLE enum_definition (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enum_value (
    id                 VARCHAR(36)  NOT NULL PRIMARY KEY,
    enum_definition_id VARCHAR(36)  NOT NULL,
    value              VARCHAR(255) NOT NULL,
    label              VARCHAR(255),
    display_order      INT          NOT NULL DEFAULT 0,
    CONSTRAINT enum_value_enum_def_fkey FOREIGN KEY (enum_definition_id)
        REFERENCES enum_definition(id),
    CONSTRAINT enum_value_unique UNIQUE (enum_definition_id, value)
);

-- Link attribute_definition to a managed enum (optional — NULL = inline allowed_values)
ALTER TABLE attribute_definition ADD COLUMN enum_definition_id VARCHAR(36);
ALTER TABLE attribute_definition ADD CONSTRAINT attribute_definition_enum_def_fkey
    FOREIGN KEY (enum_definition_id) REFERENCES enum_definition(id);

-- Same for link_type_attribute
ALTER TABLE link_type_attribute ADD COLUMN enum_definition_id VARCHAR(36);
ALTER TABLE link_type_attribute ADD CONSTRAINT link_type_attribute_enum_def_fkey
    FOREIGN KEY (enum_definition_id) REFERENCES enum_definition(id);

-- Seed: migrate existing inline ENUM allowed_values into enum_definitions
-- Document Categories
INSERT INTO enum_definition (id, name, description) VALUES
    ('enum-doc-category', 'Document Categories', 'Standard document categories');
INSERT INTO enum_value (id, enum_definition_id, value, display_order) VALUES
    ('ev-doc-1', 'enum-doc-category', 'Design', 0),
    ('ev-doc-2', 'enum-doc-category', 'Test', 1),
    ('ev-doc-3', 'enum-doc-category', 'Spec', 2),
    ('ev-doc-4', 'enum-doc-category', 'Procedure', 3),
    ('ev-doc-5', 'enum-doc-category', 'Report', 4);

-- Materials
INSERT INTO enum_definition (id, name, description) VALUES
    ('enum-materials', 'Materials', 'Standard materials list');
INSERT INTO enum_value (id, enum_definition_id, value, display_order) VALUES
    ('ev-mat-1', 'enum-materials', 'Aluminum', 0),
    ('ev-mat-2', 'enum-materials', 'Steel', 1),
    ('ev-mat-3', 'enum-materials', 'Titanium', 2),
    ('ev-mat-4', 'enum-materials', 'Composite', 3),
    ('ev-mat-5', 'enum-materials', 'Inconel', 4);

-- SSI Installation Zone
INSERT INTO enum_definition (id, name, description) VALUES
    ('enum-ssi-zone', 'Installation Zones', 'Aircraft installation zones');
INSERT INTO enum_value (id, enum_definition_id, value, display_order) VALUES
    ('ev-zone-1', 'enum-ssi-zone', 'Forward', 0),
    ('ev-zone-2', 'enum-ssi-zone', 'Center', 1),
    ('ev-zone-3', 'enum-ssi-zone', 'Aft', 2),
    ('ev-zone-4', 'enum-ssi-zone', 'Wing', 3),
    ('ev-zone-5', 'enum-ssi-zone', 'Empennage', 4),
    ('ev-zone-6', 'enum-ssi-zone', 'Nacelle', 5),
    ('ev-zone-7', 'enum-ssi-zone', 'Landing Gear Bay', 6);

-- SSI Mounting Type
INSERT INTO enum_definition (id, name, description) VALUES
    ('enum-ssi-mount', 'Mounting Types', 'Mounting methods');
INSERT INTO enum_value (id, enum_definition_id, value, display_order) VALUES
    ('ev-mnt-1', 'enum-ssi-mount', 'Bolted', 0),
    ('ev-mnt-2', 'enum-ssi-mount', 'Riveted', 1),
    ('ev-mnt-3', 'enum-ssi-mount', 'Bonded', 2),
    ('ev-mnt-4', 'enum-ssi-mount', 'Clamp', 3),
    ('ev-mnt-5', 'enum-ssi-mount', 'Rail', 4),
    ('ev-mnt-6', 'enum-ssi-mount', 'Welded', 5);

-- ELEC Circuit Type
INSERT INTO enum_definition (id, name, description) VALUES
    ('enum-elec-circuit', 'Circuit Types', 'Electrical circuit types');
INSERT INTO enum_value (id, enum_definition_id, value, display_order) VALUES
    ('ev-cir-1', 'enum-elec-circuit', 'AC', 0),
    ('ev-cir-2', 'enum-elec-circuit', 'DC', 1),
    ('ev-cir-3', 'enum-elec-circuit', 'AC/DC', 2),
    ('ev-cir-4', 'enum-elec-circuit', 'Signal', 3),
    ('ev-cir-5', 'enum-elec-circuit', 'Data', 4);

-- ELEC Wire Type
INSERT INTO enum_definition (id, name, description) VALUES
    ('enum-elec-wire', 'Wire Types', 'Electrical wire types');
INSERT INTO enum_value (id, enum_definition_id, value, display_order) VALUES
    ('ev-wir-1', 'enum-elec-wire', 'Shielded', 0),
    ('ev-wir-2', 'enum-elec-wire', 'Unshielded', 1),
    ('ev-wir-3', 'enum-elec-wire', 'Twisted Pair', 2),
    ('ev-wir-4', 'enum-elec-wire', 'Coaxial', 3),
    ('ev-wir-5', 'enum-elec-wire', 'Fiber Optic', 4);

-- ELEC Insulation Class
INSERT INTO enum_definition (id, name, description) VALUES
    ('enum-elec-insulation', 'Insulation Classes', 'Wire insulation classes');
INSERT INTO enum_value (id, enum_definition_id, value, display_order) VALUES
    ('ev-ins-1', 'enum-elec-insulation', 'A', 0),
    ('ev-ins-2', 'enum-elec-insulation', 'B', 1),
    ('ev-ins-3', 'enum-elec-insulation', 'F', 2),
    ('ev-ins-4', 'enum-elec-insulation', 'H', 3),
    ('ev-ins-5', 'enum-elec-insulation', 'C', 4);

-- ELEC EMC Class
INSERT INTO enum_definition (id, name, description) VALUES
    ('enum-elec-emc', 'EMC Classes', 'Electromagnetic compatibility classes');
INSERT INTO enum_value (id, enum_definition_id, value, display_order) VALUES
    ('ev-emc-1', 'enum-elec-emc', 'Class I', 0),
    ('ev-emc-2', 'enum-elec-emc', 'Class II', 1),
    ('ev-emc-3', 'enum-elec-emc', 'Class III', 2);

-- Link existing ENUM attributes to their enum_definitions
UPDATE attribute_definition SET enum_definition_id = 'enum-doc-category'
    WHERE name = 'category' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-materials'
    WHERE name = 'material' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-ssi-zone'
    WHERE name = 'installZone' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-ssi-mount'
    WHERE name = 'mountingType' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-circuit'
    WHERE name = 'circuitType' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-wire'
    WHERE name = 'wireType' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-insulation'
    WHERE name = 'insulationClass' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-emc'
    WHERE name = 'emcClass' AND data_type = 'ENUM';
