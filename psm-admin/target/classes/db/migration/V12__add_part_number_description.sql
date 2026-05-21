-- V12: Add description attribute to nt-part (mapped from STEP import)

INSERT INTO attribute_definition (id, node_type_id, name, label, data_type, required, widget_type, display_order, display_section) VALUES
  ('ad-part-desc', 'nt-part', 'description', 'Description', 'STRING', 0, 'TEXT', 5, 'Identity');

-- Frozen / Released / Obsolete → read-only but visible
INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id, required, editable, visible, node_type_id) VALUES
  ('asr-pd-fz-01', 'ad-part-desc', 'st-frozen',   0, 0, 1, 'nt-part'),
  ('asr-pd-rl-01', 'ad-part-desc', 'st-released', 0, 0, 1, 'nt-part'),
  ('asr-pd-ob-01', 'ad-part-desc', 'st-obsolete', 0, 0, 1, 'nt-part');
