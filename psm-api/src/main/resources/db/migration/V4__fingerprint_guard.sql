-- V4: Fingerprint-unchanged guard for CHECKIN
-- Blocks checkin when the open version has no real changes compared to previous version.

-- Algorithm definition
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-fp-unchanged', 'algtype-action-guard', 'fingerprint_unchanged',
   'Fingerprint Unchanged',
   'Blocks action when version content is identical to the previous version',
   'fingerprintUnchangedGuard');

-- Algorithm instance
INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('gi-fp-unchanged', 'alg-fp-unchanged', 'Fingerprint Unchanged');

-- Attach to CHECKIN as BLOCK guard
INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES
  ('ag-checkin-fp', 'act-checkin', 'gi-fp-unchanged', 'BLOCK', 10);
