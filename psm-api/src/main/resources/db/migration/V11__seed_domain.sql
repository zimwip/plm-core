-- ============================================================
-- DOMAIN SEED DATA
-- Two domains: SSI (System & Structure Installation) and ELEC (Electricity)
-- ============================================================

-- ============================================================
-- DOMAIN "SSI" — System & Structure Installation
-- Structural/mechanical installation properties applicable to
-- parts and assemblies that are physically installed.
-- ============================================================

INSERT INTO domain (id, name, description, color, icon) VALUES
  ('dom-ssi', 'SSI', 'System & Structure Installation — physical mounting, spatial, and structural properties', '#f59e0b', 'box');

INSERT INTO attribute_definition
  (id, node_type_id, domain_id, name, label, data_type, required, default_value, allowed_values, widget_type, display_order, display_section, tooltip, as_name) VALUES
  ('ad-ssi-zone',       NULL, 'dom-ssi', 'installZone',       'Installation Zone',    'ENUM',   1, NULL,  '["Forward","Center","Aft","Wing","Empennage","Nacelle","Landing Gear Bay"]', 'DROPDOWN', 1,  'Installation', 'Physical zone where the item is installed', 0),
  ('ad-ssi-position',   NULL, 'dom-ssi', 'installPosition',   'Position',             'STRING', 0, NULL,  NULL,            'TEXT',     2,  'Installation', 'Exact position reference (e.g. STA 1450, WL 200)',     0),
  ('ad-ssi-mountType',  NULL, 'dom-ssi', 'mountingType',      'Mounting Type',        'ENUM',   0, NULL,  '["Bolted","Riveted","Bonded","Clamp","Rail","Welded"]', 'DROPDOWN', 3,  'Installation', 'How the item is physically attached',                  0),
  ('ad-ssi-orientation',NULL, 'dom-ssi', 'orientation',       'Orientation',          'STRING', 0, NULL,  NULL,            'TEXT',     4,  'Installation', 'Orientation constraints (e.g. arrow up, connector forward)', 0),
  ('ad-ssi-clearance',  NULL, 'dom-ssi', 'clearanceRequired', 'Clearance Required',   'ENUM',   0, 'No',  '["Yes","No"]',  'DROPDOWN', 5,  'Installation', 'Whether access clearance must be maintained',          0),
  ('ad-ssi-ata',        NULL, 'dom-ssi', 'ataChapter',        'ATA Chapter',          'STRING', 0, NULL,  NULL,            'TEXT',     6,  'Classification','ATA 100 chapter reference (e.g. 27, 32-10)',          0),
  ('ad-ssi-envRating',  NULL, 'dom-ssi', 'environmentRating', 'Environment Rating',   'ENUM',   0, NULL,  '["Standard","Pressurized","Unpressurized","High Temp","Corrosive","Wet"]', 'DROPDOWN', 7, 'Classification','Environmental conditions at installation point',      0),
  ('ad-ssi-maxLoad',    NULL, 'dom-ssi', 'maxLoadKg',         'Max Load (kg)',        'NUMBER', 0, NULL,  NULL,            'TEXT',     8,  'Structural',   'Maximum allowable static load at mount point',         0),
  ('ad-ssi-torque',     NULL, 'dom-ssi', 'torqueSpec',        'Torque Spec (Nm)',     'STRING', 0, NULL,  NULL,            'TEXT',     9,  'Structural',   'Required tightening torque for fasteners',             0),
  ('ad-ssi-iiNote',     NULL, 'dom-ssi', 'installInstr',      'Installation Notes',   'STRING', 0, NULL,  NULL,            'TEXTAREA',10, 'Structural',   'Free-text installation instructions or references',    0);

-- State rules: lock all SSI attributes when Frozen/Released/Obsolete
INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible, node_type_id) VALUES
  -- Frozen
  ('asr-ssi-fz-01', 'ad-ssi-zone',       'st-frozen', 1, 0, 1, NULL),
  ('asr-ssi-fz-02', 'ad-ssi-position',   'st-frozen', 0, 0, 1, NULL),
  ('asr-ssi-fz-03', 'ad-ssi-mountType',  'st-frozen', 0, 0, 1, NULL),
  ('asr-ssi-fz-04', 'ad-ssi-orientation','st-frozen', 0, 0, 1, NULL),
  ('asr-ssi-fz-05', 'ad-ssi-clearance',  'st-frozen', 0, 0, 1, NULL),
  ('asr-ssi-fz-06', 'ad-ssi-ata',        'st-frozen', 0, 0, 1, NULL),
  ('asr-ssi-fz-07', 'ad-ssi-envRating',  'st-frozen', 0, 0, 1, NULL),
  ('asr-ssi-fz-08', 'ad-ssi-maxLoad',    'st-frozen', 0, 0, 1, NULL),
  ('asr-ssi-fz-09', 'ad-ssi-torque',     'st-frozen', 0, 0, 1, NULL),
  ('asr-ssi-fz-10', 'ad-ssi-iiNote',     'st-frozen', 0, 0, 1, NULL),
  -- Released
  ('asr-ssi-rl-01', 'ad-ssi-zone',       'st-released', 1, 0, 1, NULL),
  ('asr-ssi-rl-02', 'ad-ssi-position',   'st-released', 0, 0, 1, NULL),
  ('asr-ssi-rl-03', 'ad-ssi-mountType',  'st-released', 0, 0, 1, NULL),
  ('asr-ssi-rl-04', 'ad-ssi-orientation','st-released', 0, 0, 1, NULL),
  ('asr-ssi-rl-05', 'ad-ssi-clearance',  'st-released', 0, 0, 1, NULL),
  ('asr-ssi-rl-06', 'ad-ssi-ata',        'st-released', 0, 0, 1, NULL),
  ('asr-ssi-rl-07', 'ad-ssi-envRating',  'st-released', 0, 0, 1, NULL),
  ('asr-ssi-rl-08', 'ad-ssi-maxLoad',    'st-released', 0, 0, 1, NULL),
  ('asr-ssi-rl-09', 'ad-ssi-torque',     'st-released', 0, 0, 1, NULL),
  ('asr-ssi-rl-10', 'ad-ssi-iiNote',     'st-released', 0, 0, 1, NULL),
  -- Obsolete
  ('asr-ssi-ob-01', 'ad-ssi-zone',       'st-obsolete', 0, 0, 1, NULL),
  ('asr-ssi-ob-02', 'ad-ssi-position',   'st-obsolete', 0, 0, 1, NULL),
  ('asr-ssi-ob-03', 'ad-ssi-mountType',  'st-obsolete', 0, 0, 1, NULL),
  ('asr-ssi-ob-04', 'ad-ssi-orientation','st-obsolete', 0, 0, 1, NULL),
  ('asr-ssi-ob-05', 'ad-ssi-clearance',  'st-obsolete', 0, 0, 1, NULL),
  ('asr-ssi-ob-06', 'ad-ssi-ata',        'st-obsolete', 0, 0, 1, NULL),
  ('asr-ssi-ob-07', 'ad-ssi-envRating',  'st-obsolete', 0, 0, 1, NULL),
  ('asr-ssi-ob-08', 'ad-ssi-maxLoad',    'st-obsolete', 0, 0, 1, NULL),
  ('asr-ssi-ob-09', 'ad-ssi-torque',     'st-obsolete', 0, 0, 1, NULL),
  ('asr-ssi-ob-10', 'ad-ssi-iiNote',     'st-obsolete', 0, 0, 1, NULL);

-- ============================================================
-- DOMAIN "ELEC" — Electricity
-- Electrical characteristics for components, harnesses,
-- connectors, and any part with electrical properties.
-- ============================================================

INSERT INTO domain (id, name, description, color, icon) VALUES
  ('dom-elec', 'ELEC', 'Electricity — electrical ratings, wiring, and connector properties', '#3b82f6', 'cpu');

INSERT INTO attribute_definition
  (id, node_type_id, domain_id, name, label, data_type, required, default_value, allowed_values, widget_type, display_order, display_section, tooltip, as_name) VALUES
  ('ad-elec-voltage',   NULL, 'dom-elec', 'ratedVoltage',   'Rated Voltage (V)',     'NUMBER', 0, NULL, NULL,            'TEXT',     1, 'Electrical',  'Nominal operating voltage',                         0),
  ('ad-elec-current',   NULL, 'dom-elec', 'ratedCurrent',   'Rated Current (A)',     'NUMBER', 0, NULL, NULL,            'TEXT',     2, 'Electrical',  'Maximum continuous current rating',                  0),
  ('ad-elec-power',     NULL, 'dom-elec', 'powerRating',    'Power Rating (W)',      'NUMBER', 0, NULL, NULL,            'TEXT',     3, 'Electrical',  'Maximum power dissipation or consumption',           0),
  ('ad-elec-freq',      NULL, 'dom-elec', 'frequency',      'Frequency (Hz)',        'STRING', 0, NULL, NULL,            'TEXT',     4, 'Electrical',  'Operating frequency or frequency range',             0),
  ('ad-elec-type',      NULL, 'dom-elec', 'circuitType',    'Circuit Type',          'ENUM',   0, NULL, '["AC","DC","AC/DC","Signal","Data"]', 'DROPDOWN', 5, 'Electrical', 'Type of electrical circuit', 0),
  ('ad-elec-wireGauge', NULL, 'dom-elec', 'wireGauge',      'Wire Gauge (AWG)',      'STRING', 0, NULL, NULL,            'TEXT',     6, 'Wiring',      'Wire gauge per AWG standard',                       0),
  ('ad-elec-wireType',  NULL, 'dom-elec', 'wireType',       'Wire Type',             'ENUM',   0, NULL, '["Shielded","Unshielded","Twisted Pair","Coaxial","Fiber Optic"]', 'DROPDOWN', 7, 'Wiring', 'Cable/wire construction type', 0),
  ('ad-elec-connector', NULL, 'dom-elec', 'connectorType',  'Connector Type',        'STRING', 0, NULL, NULL,            'TEXT',     8, 'Wiring',      'Connector part number or standard (e.g. D-Sub 25, MIL-C-38999)', 0),
  ('ad-elec-pinCount',  NULL, 'dom-elec', 'pinCount',       'Pin Count',             'NUMBER', 0, NULL, NULL,            'TEXT',     9, 'Wiring',      'Number of pins/contacts',                           0),
  ('ad-elec-insClass',  NULL, 'dom-elec', 'insulationClass','Insulation Class',      'ENUM',   0, NULL, '["A","B","F","H","N","R"]', 'DROPDOWN', 10, 'Protection', 'Thermal insulation class per IEC 60085', 0),
  ('ad-elec-ipRating',  NULL, 'dom-elec', 'ipRating',       'IP Rating',             'STRING', 0, NULL, NULL,            'TEXT',    11, 'Protection',  'Ingress protection rating (e.g. IP67)',              0),
  ('ad-elec-emcClass',  NULL, 'dom-elec', 'emcClass',       'EMC Class',             'ENUM',   0, NULL, '["Class A","Class B","MIL-STD-461"]', 'DROPDOWN', 12, 'Protection', 'Electromagnetic compatibility classification', 0);

-- State rules: lock all ELEC attributes when Frozen/Released/Obsolete
INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible, node_type_id) VALUES
  -- Frozen
  ('asr-elec-fz-01', 'ad-elec-voltage',   'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-02', 'ad-elec-current',   'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-03', 'ad-elec-power',     'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-04', 'ad-elec-freq',      'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-05', 'ad-elec-type',      'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-06', 'ad-elec-wireGauge', 'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-07', 'ad-elec-wireType',  'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-08', 'ad-elec-connector', 'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-09', 'ad-elec-pinCount',  'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-10', 'ad-elec-insClass',  'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-11', 'ad-elec-ipRating',  'st-frozen', 0, 0, 1, NULL),
  ('asr-elec-fz-12', 'ad-elec-emcClass',  'st-frozen', 0, 0, 1, NULL),
  -- Released
  ('asr-elec-rl-01', 'ad-elec-voltage',   'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-02', 'ad-elec-current',   'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-03', 'ad-elec-power',     'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-04', 'ad-elec-freq',      'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-05', 'ad-elec-type',      'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-06', 'ad-elec-wireGauge', 'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-07', 'ad-elec-wireType',  'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-08', 'ad-elec-connector', 'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-09', 'ad-elec-pinCount',  'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-10', 'ad-elec-insClass',  'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-11', 'ad-elec-ipRating',  'st-released', 0, 0, 1, NULL),
  ('asr-elec-rl-12', 'ad-elec-emcClass',  'st-released', 0, 0, 1, NULL),
  -- Obsolete
  ('asr-elec-ob-01', 'ad-elec-voltage',   'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-02', 'ad-elec-current',   'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-03', 'ad-elec-power',     'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-04', 'ad-elec-freq',      'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-05', 'ad-elec-type',      'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-06', 'ad-elec-wireGauge', 'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-07', 'ad-elec-wireType',  'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-08', 'ad-elec-connector', 'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-09', 'ad-elec-pinCount',  'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-10', 'ad-elec-insClass',  'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-11', 'ad-elec-ipRating',  'st-obsolete', 0, 0, 1, NULL),
  ('asr-elec-ob-12', 'ad-elec-emcClass',  'st-obsolete', 0, 0, 1, NULL);
