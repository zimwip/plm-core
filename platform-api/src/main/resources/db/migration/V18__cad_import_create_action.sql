-- ============================================================
-- V18 — CAD Import Create action (psm-api, com.plm.cad module)
--
-- Standalone import: creates PSM nodes from a CAD file without
-- requiring an existing root node. Scope = GLOBAL (no nodeId).
-- AUTO_OPEN transaction: user reviews imported nodes then
-- commits or rolls back manually (same pattern as create_node).
-- ============================================================

-- Handler algorithm
INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES ('alg-psm-cad-import-create', 'psm', 'sys-handler-psm', 'cad-import-create', 'CAD Import — Create', 'cad-import-create', 'cad')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name;

-- Handler instance
INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES ('ainst-psm-cad-import-create', 'psm', 'alg-psm-cad-import-create', 'CAD Import — Create')
ON CONFLICT (id) DO NOTHING;

-- Action (GLOBAL scope — no existing node required)
INSERT INTO action (id, service_code, action_code, scope, display_name, description, display_category, display_order, handler_instance_id)
VALUES ('act-psm-cad-import-create', 'psm', 'cad-import-create', 'GLOBAL', 'Import from CAD',
        'Import a CAD file and create PSM nodes without an existing root node', 'PRIMARY', 160, 'ainst-psm-cad-import-create')
ON CONFLICT (service_code, action_code) DO NOTHING;

-- Permission link (same permission as node-attached import)
INSERT INTO action_required_permission (id, action_id, permission_code)
VALUES ('arp-psm-cad-import-create', 'act-psm-cad-import-create', 'CAD_IMPORT')
ON CONFLICT (id) DO NOTHING;

-- Wrapper: AUTO_OPEN — opens a tx if none active; user commits/rolls back after review
INSERT INTO action_wrapper (id, service_code, action_id, algorithm_instance_id, execution_order)
VALUES ('aw-psm-cad-import-create-tx', 'psm', 'act-psm-cad-import-create', 'ainst-psm-wi-tx-auto-open', 10)
ON CONFLICT (id) DO NOTHING;

-- Action parameters
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, visibility, display_order, tooltip)
VALUES
  ('ap-cad-import-create-file', 'act-psm-cad-import-create', 'file', 'CAD File', 'FILE', 1, 'FILE', 'UI_VISIBLE', 1,
   'STEP (.step/.stp) or CATIA V5 (.CATProduct/.CATPart)'),
  ('ap-cad-import-create-ctx',  'act-psm-cad-import-create', 'contextCode', 'Import Context', 'STRING', 0, 'DROPDOWN', 'UI_VISIBLE', 2,
   'Select the import context to apply')
ON CONFLICT (id) DO NOTHING;
