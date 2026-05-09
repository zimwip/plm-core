-- Add domainId DROPDOWN parameter to assign_domain and unassign_domain actions.
-- Without these rows resolveParameters() returns empty → frontend skips dialog → POST fails with "domainId required".
-- allowed_values is null here; resolveDynamicAllowedValues() overlays the live domain list at runtime.
INSERT INTO action_parameter
    (id, action_id, param_name, param_label, data_type, required, widget_type, visibility, display_order, tooltip)
VALUES
    ('ap-assign-domain-id',   'act-psm-assign-domain',   'domainId', 'Domain', 'STRING', 1, 'DROPDOWN', 'UI_VISIBLE', 0,
     'Select the domain to assign to this node'),
    ('ap-unassign-domain-id', 'act-psm-unassign-domain', 'domainId', 'Domain', 'STRING', 1, 'DROPDOWN', 'UI_VISIBLE', 0,
     'Select the domain to remove from this node')
ON CONFLICT (action_id, param_name) DO NOTHING;
