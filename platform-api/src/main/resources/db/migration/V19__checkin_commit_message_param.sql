-- Add commit message parameter to the checkin action.
-- CheckinActionHandler reads params.get("_description") / params.get("comment").
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, visibility, display_order, tooltip)
VALUES
  ('ap-psm-checkin-description', 'act-psm-checkin', '_description', 'Commit message', 'STRING', 1, 'TEXTAREA', 'UI_VISIBLE', 1,
   'Describe what changed in this version')
ON CONFLICT (id) DO NOTHING;
