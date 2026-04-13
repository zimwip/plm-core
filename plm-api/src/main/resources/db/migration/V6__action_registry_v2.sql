-- ============================================================
-- V6 — Action Registry v2
-- 1. Fix BASELINE permissions: ADMIN bypasses code-level checks
--    so V5 left zero node_action_permission rows for BASELINE
--    → open to all. Seed explicit ADMIN-only permission rows.
-- 2. Add UPDATE_LINK and DELETE_LINK to the action catalog.
-- ============================================================

-- ============================================================
-- 1. Fix BASELINE permissions
--    Only admin roles should be able to baseline.
--    Seed allowlist rows for each existing node_type_action.
-- ============================================================

INSERT INTO node_action_permission (id, node_type_action_id, role_id, lifecycle_state_id)
SELECT
    'nap-bl-admin-' || nta.id || '-' || r.id,
    nta.id,
    r.id,
    NULL
FROM node_type_action nta
JOIN node_action na ON na.id = nta.action_id AND na.action_code = 'BASELINE'
CROSS JOIN plm_role r
WHERE r.is_admin = 1
  AND NOT EXISTS (
      SELECT 1 FROM node_action_permission nap
      WHERE nap.node_type_action_id = nta.id
        AND nap.role_id = r.id
        AND nap.lifecycle_state_id IS NULL
  );

-- ============================================================
-- 2. Add UPDATE_LINK and DELETE_LINK actions
-- ============================================================

INSERT INTO node_action (id, action_code, action_kind, display_name, description, handler_ref, display_category, requires_tx, is_default) VALUES
  ('act-update-link', 'UPDATE_LINK', 'BUILTIN', 'Update Link', 'Modify link attributes',       'updateLinkActionHandler', 'SECONDARY', 1, 1),
  ('act-delete-link', 'DELETE_LINK', 'BUILTIN', 'Delete Link', 'Remove a link between nodes',  'deleteLinkActionHandler', 'DANGEROUS', 1, 1);

-- Parameters for UPDATE_LINK
INSERT INTO node_action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-ul-linkid',  'act-update-link', 'linkId',     'Link ID',         'STRING', 1, 'TEXT',     1),
  ('nap-ul-logid',   'act-update-link', 'logicalId',  'Link Logical ID', 'STRING', 0, 'TEXT',     2);

-- Parameters for DELETE_LINK
INSERT INTO node_action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-dl-linkid',  'act-delete-link', 'linkId',     'Link ID',         'STRING', 1, 'TEXT',     1);

-- Register for all existing node types
INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order)
SELECT 'nta-ul-' || id, id, 'act-update-link', 'ENABLED', 350 FROM node_type;

INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order)
SELECT 'nta-dl-' || id, id, 'act-delete-link', 'ENABLED', 360 FROM node_type;

-- ============================================================
-- Permissions for UPDATE_LINK and DELETE_LINK:
-- Same as CREATE_LINK — DESIGNER can update/delete links.
-- Migrate from can_create_link flag (proxy for link management).
-- ============================================================

INSERT INTO node_action_permission (id, node_type_action_id, role_id, lifecycle_state_id)
SELECT
    'nap-ul-' || ntp.id,
    nta.id,
    ntp.role_id,
    NULL
FROM node_type_permission ntp
JOIN node_type_action nta ON nta.node_type_id = ntp.node_type_id
                          AND nta.action_id = 'act-update-link'
WHERE ntp.can_create_link = 1;

INSERT INTO node_action_permission (id, node_type_action_id, role_id, lifecycle_state_id)
SELECT
    'nap-dl-' || ntp.id,
    nta.id,
    ntp.role_id,
    NULL
FROM node_type_permission ntp
JOIN node_type_action nta ON nta.node_type_id = ntp.node_type_id
                          AND nta.action_id = 'act-delete-link'
WHERE ntp.can_create_link = 1;

