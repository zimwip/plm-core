-- ============================================================
-- PSM ADMIN SEED DATA
-- Net state after all migrations (V2-V16 consolidated).
-- Algorithm/action/permission catalog removed (lives in platform-api).
-- ============================================================

-- ============================================================
-- LIFECYCLE "Standard"
-- ============================================================

INSERT INTO lifecycle (id, name, description) VALUES
  ('lc-standard', 'Standard', 'Standard PLM lifecycle');

INSERT INTO lifecycle_state (id, lifecycle_id, name, is_initial, display_order, color) VALUES
  ('st-inwork',   'lc-standard', 'In Work',  1, 1, '#5b9cf6'),
  ('st-frozen',   'lc-standard', 'Frozen',   0, 2, '#a78bfa'),
  ('st-released', 'lc-standard', 'Released', 0, 3, '#34d399'),
  ('st-obsolete', 'lc-standard', 'Obsolete', 0, 4, '#94a3b8');

INSERT INTO lifecycle_transition (id, lifecycle_id, name, from_state_id, to_state_id, guard_expr, action_type, version_strategy) VALUES
  ('tr-freeze',   'lc-standard', 'Freeze',        'st-inwork',   'st-frozen',   NULL, 'CASCADE_FROZEN', 'NONE'),
  ('tr-unfreeze', 'lc-standard', 'Unfreeze',      'st-frozen',   'st-inwork',   NULL, NULL,             'NONE'),
  ('tr-release',  'lc-standard', 'Release',       'st-frozen',   'st-released', NULL, NULL,             'NONE'),
  ('tr-revise',   'lc-standard', 'Revise',        'st-released', 'st-inwork',   NULL, NULL,             'REVISE'),
  ('tr-obsolete', 'lc-standard', 'Make Obsolete', 'st-released', 'st-obsolete', NULL, NULL,             'NONE');

-- Functional PK: (lifecycle_transition_id, role_required)
INSERT INTO signature_requirement (lifecycle_transition_id, role_required, display_order) VALUES
  ('tr-release', 'role-reviewer', 10),
  ('tr-release', 'role-designer', 20);

INSERT INTO entity_metadata (id, target_type, target_id, meta_key, meta_value) VALUES
  ('em-st-frozen-frozen',     'LIFECYCLE_STATE', 'st-frozen',   'frozen',   'true'),
  ('em-st-released-frozen',   'LIFECYCLE_STATE', 'st-released', 'frozen',   'true'),
  ('em-st-released-released', 'LIFECYCLE_STATE', 'st-released', 'released', 'true'),
  ('em-st-obsolete-frozen',   'LIFECYCLE_STATE', 'st-obsolete', 'frozen',   'true');

-- ============================================================
-- NODE TYPES
-- logical_id_pattern for nt-part/nt-assembly relaxed (V13)
-- ============================================================

INSERT INTO node_type (id, name, description, lifecycle_id, logical_id_label, logical_id_pattern, color, icon, parent_node_type_id) VALUES
  ('nt-document', 'Document', 'Technical PLM document',                                       'lc-standard', 'Document Number', '[A-Z]{3}-\d{4}',              '#6366f1', 'FileText', NULL),
  ('nt-part',     'Part',     'Mechanical part',                                              'lc-standard', 'Part Number',     '[A-Za-z0-9][A-Za-z0-9 \-_.]*', '#10b981', 'Cog',      NULL),
  ('nt-assembly', 'Assembly', 'Composed assembly of Parts and sub-Assemblies (inherits Part)','lc-standard', 'Assembly Number', '[A-Za-z0-9][A-Za-z0-9 \-_.]*', '#f97316', 'Blocks',   'nt-part');

-- ============================================================
-- ATTRIBUTE DEFINITIONS
-- ============================================================

INSERT INTO attribute_definition
  (id, node_type_id, name, label, data_type, required, widget_type, display_order, display_section) VALUES
  ('ad-doc-title',   'nt-document', 'title',       'Title',       'STRING', 1, 'TEXT',     1, 'Identity'),
  ('ad-doc-version', 'nt-document', 'version',     'Version',     'STRING', 0, 'TEXT',     2, 'Identity'),
  ('ad-doc-desc',    'nt-document', 'description', 'Description', 'STRING', 0, 'TEXTAREA', 3, 'General'),
  ('ad-doc-cat',     'nt-document', 'category',    'Category',    'ENUM',   1, 'DROPDOWN', 4, 'General'),
  ('ad-doc-author',  'nt-document', 'author',      'Author',      'STRING', 1, 'TEXT',     5, 'General'),
  ('ad-doc-review',  'nt-document', 'reviewNote',  'Review Note', 'STRING', 0, 'TEXTAREA', 6, 'Review');

UPDATE attribute_definition SET allowed_values = '["Design","Test","Spec","Procedure","Report"]' WHERE id = 'ad-doc-cat';

INSERT INTO attribute_definition
  (id, node_type_id, name, label, data_type, required, widget_type, display_order, display_section) VALUES
  ('ad-part-name',     'nt-part', 'name',        'Name',        'STRING', 1, 'TEXT',     1, 'Identity'),
  ('ad-part-material', 'nt-part', 'material',    'Material',    'ENUM',   0, 'DROPDOWN', 2, 'Technical'),
  ('ad-part-weight',   'nt-part', 'weight',      'Weight (kg)', 'NUMBER', 0, 'TEXT',     3, 'Technical'),
  ('ad-part-drawing',  'nt-part', 'drawingRef',  'Drawing Ref', 'STRING', 0, 'TEXT',     4, 'Technical'),
  ('ad-part-desc',     'nt-part', 'description', 'Description', 'STRING', 0, 'TEXT',     5, 'Identity');

UPDATE attribute_definition SET allowed_values = '["Steel","Aluminum","Titanium","Composite","Plastic"]' WHERE id = 'ad-part-material';

-- ============================================================
-- ATTRIBUTE STATE RULES
-- ============================================================

INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible, node_type_id) VALUES
  -- Document inwork
  ('asr-iw-01',  'ad-doc-review',  'st-inwork',   0, 0, 0, 'nt-document'),
  -- Document frozen
  ('asr-fz-01',  'ad-doc-title',   'st-frozen',   1, 0, 1, 'nt-document'),
  ('asr-fz-02',  'ad-doc-version', 'st-frozen',   0, 0, 1, 'nt-document'),
  ('asr-fz-03',  'ad-doc-desc',    'st-frozen',   0, 0, 1, 'nt-document'),
  ('asr-fz-04',  'ad-doc-cat',     'st-frozen',   1, 0, 1, 'nt-document'),
  ('asr-fz-05',  'ad-doc-author',  'st-frozen',   1, 0, 1, 'nt-document'),
  ('asr-fz-06',  'ad-doc-review',  'st-frozen',   0, 1, 1, 'nt-document'),
  -- Document released
  ('asr-rl-01',  'ad-doc-title',   'st-released', 1, 0, 1, 'nt-document'),
  ('asr-rl-02',  'ad-doc-version', 'st-released', 0, 0, 1, 'nt-document'),
  ('asr-rl-03',  'ad-doc-desc',    'st-released', 0, 0, 1, 'nt-document'),
  ('asr-rl-04',  'ad-doc-cat',     'st-released', 1, 0, 1, 'nt-document'),
  ('asr-rl-05',  'ad-doc-author',  'st-released', 1, 0, 1, 'nt-document'),
  ('asr-rl-06',  'ad-doc-review',  'st-released', 0, 0, 1, 'nt-document'),
  -- Document obsolete
  ('asr-ob-01',  'ad-doc-title',   'st-obsolete', 1, 0, 1, 'nt-document'),
  ('asr-ob-02',  'ad-doc-version', 'st-obsolete', 0, 0, 1, 'nt-document'),
  ('asr-ob-03',  'ad-doc-desc',    'st-obsolete', 0, 0, 1, 'nt-document'),
  ('asr-ob-04',  'ad-doc-cat',     'st-obsolete', 1, 0, 1, 'nt-document'),
  ('asr-ob-05',  'ad-doc-author',  'st-obsolete', 1, 0, 1, 'nt-document'),
  ('asr-ob-06',  'ad-doc-review',  'st-obsolete', 0, 0, 0, 'nt-document'),
  -- Part inwork (V15)
  ('asr-piw-01', 'ad-part-name',     'st-inwork', 1, 1, 1, 'nt-part'),
  ('asr-piw-02', 'ad-part-material', 'st-inwork', 0, 1, 1, 'nt-part'),
  ('asr-piw-03', 'ad-part-weight',   'st-inwork', 0, 1, 1, 'nt-part'),
  ('asr-piw-04', 'ad-part-drawing',  'st-inwork', 0, 1, 1, 'nt-part'),
  ('asr-piw-05', 'ad-part-desc',     'st-inwork', 0, 1, 1, 'nt-part'),
  -- Part frozen
  ('asr-pfz-01', 'ad-part-name',     'st-frozen',   1, 0, 1, 'nt-part'),
  ('asr-pfz-02', 'ad-part-material', 'st-frozen',   0, 0, 1, 'nt-part'),
  ('asr-pfz-03', 'ad-part-weight',   'st-frozen',   0, 0, 1, 'nt-part'),
  ('asr-pfz-04', 'ad-part-drawing',  'st-frozen',   0, 0, 1, 'nt-part'),
  -- Part released
  ('asr-prl-01', 'ad-part-name',     'st-released', 1, 0, 1, 'nt-part'),
  ('asr-prl-02', 'ad-part-material', 'st-released', 0, 0, 1, 'nt-part'),
  ('asr-prl-03', 'ad-part-weight',   'st-released', 0, 0, 1, 'nt-part'),
  ('asr-prl-04', 'ad-part-drawing',  'st-released', 0, 0, 1, 'nt-part'),
  -- Part obsolete
  ('asr-pob-01', 'ad-part-name',     'st-obsolete', 1, 0, 1, 'nt-part'),
  ('asr-pob-02', 'ad-part-material', 'st-obsolete', 0, 0, 1, 'nt-part'),
  ('asr-pob-03', 'ad-part-weight',   'st-obsolete', 0, 0, 1, 'nt-part'),
  ('asr-pob-04', 'ad-part-drawing',  'st-obsolete', 0, 0, 1, 'nt-part'),
  -- Part description frozen/released/obsolete (V12)
  ('asr-pd-fz-01', 'ad-part-desc', 'st-frozen',   0, 0, 1, 'nt-part'),
  ('asr-pd-rl-01', 'ad-part-desc', 'st-released', 0, 0, 1, 'nt-part'),
  ('asr-pd-ob-01', 'ad-part-desc', 'st-obsolete', 0, 0, 1, 'nt-part');

-- ============================================================
-- LINK TYPES
-- lt-part-data uses VERSION_TO_MASTER (fixed in V7)
-- ============================================================

INSERT INTO link_type (id, name, description, source_node_type_id, target_source_id, target_type, link_policy, link_logical_id_label) VALUES
  ('lt-composed-of', 'composed_of',    'Assembly -> Part/Assembly composition',                               'nt-assembly', 'SELF',       'nt-part',    'VERSION_TO_MASTER',  'Part Ref'),
  ('lt-doc-part',    'documented_by',  'Document references a Part',                                          'nt-part',     'SELF',       'nt-document','VERSION_TO_VERSION',  'Doc Ref'),
  ('lt-supersedes',  'supersedes',     'Part supersedes another Part',                                        'nt-part',     'SELF',       'nt-part',    'VERSION_TO_VERSION',  'Supersession Ref'),
  ('lt-part-data',   'represented_by', 'Part represented by a binary data object hosted in DST',             'nt-part',     'DATA_LOCAL', 'filetype',   'VERSION_TO_MASTER',   'File Ref');

-- Functional PK: (link_type_id, name)
INSERT INTO link_type_attribute (link_type_id, name, label, data_type, required, widget_type, display_order, display_section, tooltip) VALUES
  -- lt-composed-of: position for 3D placement (V11)
  ('lt-composed-of', 'position', 'Position in Assembly', 'POSITION', 0, 'TEXT', 1, 'Positioning',
   '4x4 transformation matrix (row-major, 16 comma-separated doubles)'),
  -- lt-part-data: representation kind + layer (V14)
  ('lt-part-data', 'kind',  'Representation Kind', 'ENUM', 0, 'DROPDOWN', 1, 'Metadata', NULL),
  ('lt-part-data', 'layer', 'Layer',               'ENUM', 0, 'DROPDOWN', 2, 'Metadata', NULL);

UPDATE link_type_attribute SET default_value = 'design', allowed_values = '["design","simplified","original"]'
  WHERE link_type_id = 'lt-part-data' AND name = 'kind';
UPDATE link_type_attribute SET default_value = 'main', allowed_values = '["main","pmi","space"]'
  WHERE link_type_id = 'lt-part-data' AND name = 'layer';

-- Functional PK: (link_type_id, parent_transition_id, child_from_state_id)
INSERT INTO link_type_cascade (link_type_id, parent_transition_id, child_from_state_id, child_transition_id) VALUES
  ('lt-composed-of', 'tr-freeze', 'st-inwork', 'tr-freeze');

-- ============================================================
-- SOURCE REGISTRY
-- ============================================================

INSERT INTO source (id, name, description, resolver_instance_id, is_builtin, is_versioned) VALUES
  ('SELF',       'Self',       'The local PLM node store.',                                                         'ri-self-node',  1, 1),
  ('DATA_LOCAL', 'Data Store', 'Binary data objects hosted in the dst service.',                                    'ri-data-local', 0, 0);

-- ============================================================
-- ATTRIBUTE VIEWS
-- ============================================================

INSERT INTO attribute_view (id, node_type_id, name, description, eligible_role_id, eligible_state_id, priority) VALUES
  ('view-reviewer-frozen', 'nt-document', 'Reviewer Frozen View', 'Optimised for reviewer during Frozen phase', 'role-reviewer', 'st-frozen', 10),
  ('view-reader-all',      'nt-document', 'Reader View',          'Simplified view for readers',                'role-reader',   NULL,        5);

-- Functional PK: (view_id, attribute_def_id)
INSERT INTO view_attribute_override (view_id, attribute_def_id, visible, editable, display_order, display_section) VALUES
  ('view-reviewer-frozen', 'ad-doc-review', 1, 1, 1, 'Review'),
  ('view-reviewer-frozen', 'ad-doc-title',  1, 0, 2, 'Identity'),
  ('view-reviewer-frozen', 'ad-doc-desc',   1, 0, 3, 'General'),
  ('view-reader-all',      'ad-doc-review', 0, 0, NULL, NULL);

-- ============================================================
-- LIFECYCLE STATE ACTIONS
-- Functional PK: (lifecycle_state_id, algorithm_instance_id, trigger)
-- algorithm_instance_id references platform-api ainst-psm-c-* pattern
-- ============================================================

INSERT INTO lifecycle_state_action (lifecycle_state_id, algorithm_instance_id, trigger, execution_mode, display_order) VALUES
  ('st-released', 'ainst-psm-c-collapse-history', 'ON_ENTER', 'TRANSACTIONAL', 10);

-- ============================================================
-- LIFECYCLE TRANSITION GUARDS
-- Functional PK: (lifecycle_transition_id, algorithm_instance_id)
-- IDs match platform-api ActionCatalogRegistryController ainst-psm-c-* pattern
-- ============================================================

INSERT INTO lifecycle_transition_guard (lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES
  ('tr-release',  'ainst-psm-c-all-signatures-done',  'BLOCK', 1),
  ('tr-release',  'ainst-psm-c-sig-no-rejected',      'BLOCK', 2),
  ('tr-freeze',   'ainst-psm-c-all-required-filled',  'BLOCK', 1),
  ('tr-unfreeze', 'ainst-psm-c-sig-has-rejected',     'BLOCK', 1);

-- ============================================================
-- DOMAINS + DOMAIN ATTRIBUTES
-- ============================================================

INSERT INTO domain (id, name, description, color, icon) VALUES
  ('dom-ssi',  'SSI',  'System & Structure Installation', '#f59e0b', 'box'),
  ('dom-elec', 'ELEC', 'Electricity',                     '#3b82f6', 'cpu');

INSERT INTO attribute_definition
  (id, node_type_id, domain_id, name, label, data_type, required, default_value, allowed_values, widget_type, display_order, display_section, tooltip, as_name) VALUES
  ('ad-ssi-zone',       NULL, 'dom-ssi', 'installZone',       'Installation Zone',  'ENUM',   1, NULL, '["Forward","Center","Aft","Wing","Empennage","Nacelle","Landing Gear Bay"]', 'DROPDOWN', 1,  'Installation', 'Physical zone where the item is installed', 0),
  ('ad-ssi-position',   NULL, 'dom-ssi', 'installPosition',   'Position',           'STRING', 0, NULL, NULL,            'TEXT',     2,  'Installation', 'Exact position reference',     0),
  ('ad-ssi-mountType',  NULL, 'dom-ssi', 'mountingType',      'Mounting Type',      'ENUM',   0, NULL, '["Bolted","Riveted","Bonded","Clamp","Rail","Welded"]', 'DROPDOWN', 3,  'Installation', 'How the item is physically attached', 0),
  ('ad-ssi-orientation',NULL, 'dom-ssi', 'orientation',       'Orientation',        'STRING', 0, NULL, NULL,            'TEXT',     4,  'Installation', 'Orientation constraints', 0),
  ('ad-ssi-clearance',  NULL, 'dom-ssi', 'clearanceRequired', 'Clearance Required', 'ENUM',   0, 'No', '["Yes","No"]',  'DROPDOWN', 5,  'Installation', 'Whether access clearance must be maintained', 0),
  ('ad-ssi-ata',        NULL, 'dom-ssi', 'ataChapter',        'ATA Chapter',        'STRING', 0, NULL, NULL,            'TEXT',     6,  'Classification','ATA 100 chapter reference', 0),
  ('ad-ssi-envRating',  NULL, 'dom-ssi', 'environmentRating', 'Environment Rating', 'ENUM',   0, NULL, '["Standard","Pressurized","Unpressurized","High Temp","Corrosive","Wet"]', 'DROPDOWN', 7, 'Classification','Environmental conditions', 0),
  ('ad-ssi-maxLoad',    NULL, 'dom-ssi', 'maxLoadKg',         'Max Load (kg)',      'NUMBER', 0, NULL, NULL,            'TEXT',     8,  'Structural',   'Maximum allowable static load', 0),
  ('ad-ssi-torque',     NULL, 'dom-ssi', 'torqueSpec',        'Torque Spec (Nm)',   'STRING', 0, NULL, NULL,            'TEXT',     9,  'Structural',   'Required tightening torque', 0),
  ('ad-ssi-iiNote',     NULL, 'dom-ssi', 'installInstr',      'Installation Notes', 'STRING', 0, NULL, NULL,            'TEXTAREA', 10, 'Structural',   'Free-text installation instructions', 0);

INSERT INTO attribute_definition
  (id, node_type_id, domain_id, name, label, data_type, required, default_value, allowed_values, widget_type, display_order, display_section, tooltip, as_name) VALUES
  ('ad-elec-voltage',   NULL, 'dom-elec', 'ratedVoltage',    'Rated Voltage (V)',  'NUMBER', 0, NULL, NULL,            'TEXT',     1, 'Electrical',  'Nominal operating voltage', 0),
  ('ad-elec-current',   NULL, 'dom-elec', 'ratedCurrent',    'Rated Current (A)',  'NUMBER', 0, NULL, NULL,            'TEXT',     2, 'Electrical',  'Maximum continuous current rating', 0),
  ('ad-elec-power',     NULL, 'dom-elec', 'powerRating',     'Power Rating (W)',   'NUMBER', 0, NULL, NULL,            'TEXT',     3, 'Electrical',  'Maximum power dissipation', 0),
  ('ad-elec-freq',      NULL, 'dom-elec', 'frequency',       'Frequency (Hz)',     'STRING', 0, NULL, NULL,            'TEXT',     4, 'Electrical',  'Operating frequency', 0),
  ('ad-elec-type',      NULL, 'dom-elec', 'circuitType',     'Circuit Type',       'ENUM',   0, NULL, '["AC","DC","AC/DC","Signal","Data"]', 'DROPDOWN', 5, 'Electrical', 'Type of electrical circuit', 0),
  ('ad-elec-wireGauge', NULL, 'dom-elec', 'wireGauge',       'Wire Gauge (AWG)',   'STRING', 0, NULL, NULL,            'TEXT',     6, 'Wiring',      'Wire gauge per AWG standard', 0),
  ('ad-elec-wireType',  NULL, 'dom-elec', 'wireType',        'Wire Type',          'ENUM',   0, NULL, '["Shielded","Unshielded","Twisted Pair","Coaxial","Fiber Optic"]', 'DROPDOWN', 7, 'Wiring', 'Cable type', 0),
  ('ad-elec-connector', NULL, 'dom-elec', 'connectorType',   'Connector Type',     'STRING', 0, NULL, NULL,            'TEXT',     8, 'Wiring',      'Connector part number or standard', 0),
  ('ad-elec-pinCount',  NULL, 'dom-elec', 'pinCount',        'Pin Count',          'NUMBER', 0, NULL, NULL,            'TEXT',     9, 'Wiring',      'Number of pins/contacts', 0),
  ('ad-elec-insClass',  NULL, 'dom-elec', 'insulationClass', 'Insulation Class',   'ENUM',   0, NULL, '["A","B","F","H","N","R"]', 'DROPDOWN', 10, 'Protection', 'Thermal insulation class', 0),
  ('ad-elec-ipRating',  NULL, 'dom-elec', 'ipRating',        'IP Rating',          'STRING', 0, NULL, NULL,            'TEXT',    11, 'Protection',  'Ingress protection rating', 0),
  ('ad-elec-emcClass',  NULL, 'dom-elec', 'emcClass',        'EMC Class',          'ENUM',   0, NULL, '["Class A","Class B","MIL-STD-461"]', 'DROPDOWN', 12, 'Protection', 'EMC classification', 0);

-- ============================================================
-- ENUM DEFINITIONS + VALUES
-- Functional PK on enum_value: (enum_definition_id, value)
-- ============================================================

INSERT INTO enum_definition (id, name, description) VALUES
  ('enum-doc-category',    'Document Categories', 'Standard document categories'),
  ('enum-materials',       'Materials',           'Standard materials list'),
  ('enum-ssi-zone',        'Installation Zones',  'Aircraft installation zones'),
  ('enum-ssi-mount',       'Mounting Types',      'Mounting methods'),
  ('enum-elec-circuit',    'Circuit Types',       'Electrical circuit types'),
  ('enum-elec-wire',       'Wire Types',          'Electrical wire types'),
  ('enum-elec-insulation', 'Insulation Classes',  'Wire insulation classes'),
  ('enum-elec-emc',        'EMC Classes',         'Electromagnetic compatibility classes');

INSERT INTO enum_value (enum_definition_id, value, display_order) VALUES
  ('enum-doc-category', 'Design',     0),
  ('enum-doc-category', 'Test',       1),
  ('enum-doc-category', 'Spec',       2),
  ('enum-doc-category', 'Procedure',  3),
  ('enum-doc-category', 'Report',     4),
  ('enum-materials',    'Aluminum',   0),
  ('enum-materials',    'Steel',      1),
  ('enum-materials',    'Titanium',   2),
  ('enum-materials',    'Composite',  3),
  ('enum-materials',    'Inconel',    4),
  ('enum-ssi-zone',     'Forward',    0),
  ('enum-ssi-zone',     'Center',     1),
  ('enum-ssi-zone',     'Aft',        2),
  ('enum-ssi-zone',     'Wing',       3),
  ('enum-ssi-zone',     'Empennage',  4),
  ('enum-ssi-zone',     'Nacelle',    5),
  ('enum-ssi-zone',     'Landing Gear Bay', 6),
  ('enum-ssi-mount',    'Bolted',     0),
  ('enum-ssi-mount',    'Riveted',    1),
  ('enum-ssi-mount',    'Bonded',     2),
  ('enum-ssi-mount',    'Clamp',      3),
  ('enum-ssi-mount',    'Rail',       4),
  ('enum-ssi-mount',    'Welded',     5),
  ('enum-elec-circuit', 'AC',         0),
  ('enum-elec-circuit', 'DC',         1),
  ('enum-elec-circuit', 'AC/DC',      2),
  ('enum-elec-circuit', 'Signal',     3),
  ('enum-elec-circuit', 'Data',       4),
  ('enum-elec-wire',    'Shielded',   0),
  ('enum-elec-wire',    'Unshielded', 1),
  ('enum-elec-wire',    'Twisted Pair', 2),
  ('enum-elec-wire',    'Coaxial',    3),
  ('enum-elec-wire',    'Fiber Optic', 4),
  ('enum-elec-insulation', 'A', 0),
  ('enum-elec-insulation', 'B', 1),
  ('enum-elec-insulation', 'F', 2),
  ('enum-elec-insulation', 'H', 3),
  ('enum-elec-insulation', 'C', 4),
  ('enum-elec-emc',     'Class I',   0),
  ('enum-elec-emc',     'Class II',  1),
  ('enum-elec-emc',     'Class III', 2);

UPDATE attribute_definition SET enum_definition_id = 'enum-doc-category' WHERE name = 'category'      AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-materials'    WHERE name = 'material'      AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-ssi-zone'     WHERE name = 'installZone'   AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-ssi-mount'    WHERE name = 'mountingType'  AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-circuit' WHERE name = 'circuitType'   AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-wire'    WHERE name = 'wireType'       AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-insulation' WHERE name = 'insulationClass' AND data_type = 'ENUM';
UPDATE attribute_definition SET enum_definition_id = 'enum-elec-emc'     WHERE name = 'emcClass'      AND data_type = 'ENUM';

-- ============================================================
-- IMPORT CONTEXT (default — null algo instances = service defaults)
-- Functional PK: code
-- ============================================================

INSERT INTO psa_import_context (code, label, allowed_root_node_types, accepted_formats,
    import_context_algorithm_instance_id, node_validation_algorithm_instance_id)
VALUES ('default', 'Default', null, null, null, null);
