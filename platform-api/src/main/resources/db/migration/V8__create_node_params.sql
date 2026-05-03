-- Add _logicalId and _externalId parameters to the create_node action.
-- These were missing from V4; NodeCatalogContribution expects them to
-- build the Identity section of the create-node form.
INSERT INTO platform.action_parameter
    (id, action_id, param_name, param_label, data_type, required, widget_type, validation_regex, display_order, tooltip)
VALUES
    ('ap-create-node-logical-id',  'act-psm-create-node', '_logicalId',  'Identifier', 'STRING', 1, 'TEXT', NULL, 1,
     'Unique identifier for this node (e.g. part number, document code)'),
    ('ap-create-node-external-id', 'act-psm-create-node', '_externalId', 'External ID', 'STRING', 0, 'TEXT', NULL, 2,
     'Optional external reference (ERP code, CAD file path, …)')
ON CONFLICT (action_id, param_name) DO NOTHING;
