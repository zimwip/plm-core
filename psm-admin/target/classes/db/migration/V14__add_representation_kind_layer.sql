-- V14: Add kind + layer attributes to lt-part-data (representation link)
--
-- kind  → what type of representation the file is:
--   design    = fully-defined STEP (engineering data, split per-part)
--   simplified = lightweight glTF pre-converted at import time (fast 3D preview)
--   original  = unsplit STEP as uploaded (stored on root assembly node)
--
-- layer → what purpose / view the file serves:
--   main  = primary 3D geometry
--   pmi   = Product Manufacturing Information (GD&T annotations)
--   space = moveable footprint (opening envelopes, accessibility zones)

INSERT INTO link_type_attribute
    (id, link_type_id, name, label, data_type, required,
     default_value, allowed_values, widget_type, display_order, display_section)
VALUES
    ('lta-part-data-kind',  'lt-part-data', 'kind',  'Representation Kind',
     'ENUM', 0, 'design',
     '["design","simplified","original"]',
     'DROPDOWN', 1, 'Metadata'),

    ('lta-part-data-layer', 'lt-part-data', 'layer', 'Layer',
     'ENUM', 0, 'main',
     '["main","pmi","space"]',
     'DROPDOWN', 2, 'Metadata');
