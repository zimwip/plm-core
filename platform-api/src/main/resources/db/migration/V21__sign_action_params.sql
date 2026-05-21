-- Add meaning (required) and comment (optional) parameters to the sign action.
-- Without these rows resolveParameters() returns empty → frontend skips dialog → POST sends null meaning → DB constraint fails.
INSERT INTO action_parameter
    (id, action_id, param_name, param_label, data_type, required, allowed_values, widget_type, visibility, display_order, tooltip)
VALUES
    ('ap-psm-sign-meaning', 'act-psm-sign', 'meaning', 'Decision', 'STRING', 1,
     '[{"value":"APPROVED","label":"Approve"},{"value":"REJECTED","label":"Reject"}]',
     'DROPDOWN', 'UI_VISIBLE', 0, 'Approve or reject this version'),
    ('ap-psm-sign-comment', 'act-psm-sign', 'comment', 'Comment', 'STRING', 0,
     NULL, 'TEXTAREA', 'UI_VISIBLE', 1, 'Optional justification for your decision')
ON CONFLICT (id) DO NOTHING;
