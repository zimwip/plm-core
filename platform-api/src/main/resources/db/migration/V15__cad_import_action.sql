-- ============================================================
-- V15 — CAD Import action (psm-api, com.plm.cad module)
--
-- Seeds the cad-import ActionHandler algorithm + instance,
-- the ACTION row, lock-owner guard, and permission link.
-- ON CONFLICT guards make this idempotent against psm-api
-- auto-registration via ActionCatalogRegistryController.
-- ============================================================

-- Handler algorithm
INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES ('alg-psm-cad-import', 'psm', 'sys-handler-psm', 'cad-import', 'CAD Import Handler', 'cad-import', 'cad')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name;

-- Handler instance
INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES ('ainst-psm-cad-import', 'psm', 'alg-psm-cad-import', 'CAD Import Handler')
ON CONFLICT (id) DO NOTHING;

-- Action
INSERT INTO action (id, service_code, action_code, scope, display_name, description, display_category, display_order, handler_instance_id)
VALUES ('act-psm-cad-import', 'psm', 'cad-import', 'NODE', 'Import CAD',
        'Import a CAD file and create PSM nodes', 'PRIMARY', 150, 'ainst-psm-cad-import')
ON CONFLICT (service_code, action_code) DO NOTHING;

-- Guard: hide when node not locked by current user
INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order)
VALUES ('ag-psm-cad-import-lock-owner', 'act-psm-cad-import', 'ainst-psm-g-lock-owner-required', 'HIDE', 1)
ON CONFLICT (action_id, algorithm_instance_id) DO NOTHING;

-- Permission link (soft ref — permission lives in pno-api, FK dropped in V7)
INSERT INTO action_required_permission (id, action_id, permission_code)
VALUES ('arp-psm-cad-import', 'act-psm-cad-import', 'CAD_IMPORT')
ON CONFLICT (id) DO NOTHING;

-- Wrapper: require an open transaction (node must be checked out before importing)
INSERT INTO action_wrapper (id, service_code, action_id, algorithm_instance_id, execution_order)
VALUES ('aw-psm-cad-import-tx', 'psm', 'act-psm-cad-import', 'ainst-psm-wi-tx-required', 10)
ON CONFLICT (id) DO NOTHING;

-- Action parameters (UI-visible; contextCode allowedValues overridden at runtime by handler)
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, visibility, display_order, tooltip)
VALUES
  ('ap-cad-import-file', 'act-psm-cad-import', 'file', 'CAD File', 'FILE', 1, 'FILE', 'UI_VISIBLE', 1, 'STEP (.step/.stp), CATIA V5 (.CATProduct/.CATPart), or ZIP'),
  ('ap-cad-import-ctx',  'act-psm-cad-import', 'contextCode', 'Import Context', 'STRING', 0, 'DROPDOWN', 'UI_VISIBLE', 2, 'Select the import context to apply')
ON CONFLICT (id) DO NOTHING;
