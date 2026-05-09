-- V17 — Add splitMode parameter to cad-import action
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, visibility, display_order, tooltip)
VALUES ('ap-cad-import-split', 'act-psm-cad-import', 'splitMode', 'Split Parts', 'BOOLEAN', 0, 'CHECKBOX', 'UI_VISIBLE', 3,
        'Create one node per leaf part and link each to the source file')
ON CONFLICT (id) DO NOTHING;
