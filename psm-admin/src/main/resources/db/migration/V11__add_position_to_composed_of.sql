-- Add POSITION-typed attribute to lt-composed-of for 3D placement in assemblies
INSERT INTO link_type_attribute
    (id, link_type_id, name, label, data_type, required,
     widget_type, display_order, display_section, tooltip, created_at)
VALUES
    ('lta-composed-of-position', 'lt-composed-of', 'position', 'Position in Assembly',
     'POSITION', 0,
     'TEXT', 1, 'Positioning',
     '4x4 transformation matrix (row-major, 16 comma-separated doubles)',
     CURRENT_TIMESTAMP);
