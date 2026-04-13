-- ============================================================
-- V7 — UPDATE_NODE action
-- Registers the content-update action used by the frontend
-- auto-save. Requires an open transaction (checkout first).
-- ============================================================

INSERT INTO node_action (id, action_code, action_kind, display_name, description, handler_ref, display_category, requires_tx, is_default) VALUES
  ('act-update-node', 'UPDATE_NODE', 'BUILTIN', 'Update Node', 'Save attribute changes to the current open version', 'updateNodeActionHandler', 'SECONDARY', 1, 1);

-- Register for all existing node types
INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order)
SELECT 'nta-un-' || id, id, 'act-update-node', 'ENABLED', 50 FROM node_type;

-- No node_action_permission rows → zero-rows = open to all.
-- Access is naturally gated by the checkout lock (can_write + transaction ownership).
