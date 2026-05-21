-- V15: Add missing st-inwork state rules for nt-part attributes
-- V2/V12 only defined frozen/released/obsolete rules; update_node in st-inwork
-- state rejected all part attributes as UNKNOWN_ATTRIBUTE.

INSERT INTO attribute_state_rule
    (id, attribute_definition_id, lifecycle_state_id, required, editable, visible, node_type_id)
VALUES
    ('asr-piw-01', 'ad-part-name',     'st-inwork', 1, 1, 1, 'nt-part'),
    ('asr-piw-02', 'ad-part-material', 'st-inwork', 0, 1, 1, 'nt-part'),
    ('asr-piw-03', 'ad-part-weight',   'st-inwork', 0, 1, 1, 'nt-part'),
    ('asr-piw-04', 'ad-part-drawing',  'st-inwork', 0, 1, 1, 'nt-part'),
    ('asr-piw-05', 'ad-part-desc',     'st-inwork', 0, 1, 1, 'nt-part');
