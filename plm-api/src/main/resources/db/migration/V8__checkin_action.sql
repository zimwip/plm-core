-- ============================================================
-- V8 — CHECKIN action
-- Commits a single node out of the current transaction.
-- If other nodes share the transaction, they are moved to a
-- new continuation transaction automatically.
-- ============================================================

INSERT INTO node_action (id, action_code, action_kind, display_name, description, handler_ref, display_category, requires_tx, is_default) VALUES
  ('act-checkin', 'CHECKIN', 'BUILTIN', 'Check In', 'Commit this node and close its transaction (other nodes in the same transaction are moved to a new one)', 'checkinActionHandler', 'SECONDARY', 1, 1);

-- Register for all existing node types
INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order)
SELECT 'nta-ci-' || id, id, 'act-checkin', 'ENABLED', 110 FROM node_type;

-- No node_action_permission rows → zero-rows = open to all.
-- Access is gated by transaction ownership (commitTransaction verifies userId).
