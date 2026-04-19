-- Wire action → handler via algorithm_instance FK.
-- Permission-only actions (READ, MANAGE_*) have NULL handler.

-- ============================================================
-- HANDLER ALGORITHM INSTANCES (one per handler)
-- ============================================================

INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('hi-checkout',    'alg-handler-checkout',    'Checkout'),
  ('hi-checkin',     'alg-handler-checkin',     'Checkin'),
  ('hi-update-node', 'alg-handler-update-node', 'Update Node'),
  ('hi-transition',  'alg-handler-transition',  'Transition'),
  ('hi-sign',        'alg-handler-sign',        'Sign'),
  ('hi-create-link', 'alg-handler-create-link', 'Create Link'),
  ('hi-update-link', 'alg-handler-update-link', 'Update Link'),
  ('hi-delete-link', 'alg-handler-delete-link', 'Delete Link'),
  ('hi-baseline',    'alg-handler-baseline',    'Baseline'),
  ('hi-commit',      'alg-handler-commit',      'Commit'),
  ('hi-rollback',    'alg-handler-rollback',    'Rollback'),
  ('hi-cancel',      'alg-handler-cancel',      'Cancel');

-- ============================================================
-- ADD FK COLUMN
-- ============================================================

ALTER TABLE action ADD COLUMN handler_instance_id VARCHAR(64) REFERENCES algorithm_instance(id);

-- ============================================================
-- WIRE ACTIONS TO HANDLER INSTANCES
-- ============================================================

UPDATE action SET handler_instance_id = 'hi-checkout'    WHERE action_code = 'CHECKOUT';
UPDATE action SET handler_instance_id = 'hi-checkin'     WHERE action_code = 'CHECKIN';
UPDATE action SET handler_instance_id = 'hi-update-node' WHERE action_code = 'UPDATE_NODE';
UPDATE action SET handler_instance_id = 'hi-transition'  WHERE action_code = 'TRANSITION';
UPDATE action SET handler_instance_id = 'hi-sign'        WHERE action_code = 'SIGN';
UPDATE action SET handler_instance_id = 'hi-create-link' WHERE action_code = 'CREATE_LINK';
UPDATE action SET handler_instance_id = 'hi-update-link' WHERE action_code = 'UPDATE_LINK';
UPDATE action SET handler_instance_id = 'hi-delete-link' WHERE action_code = 'DELETE_LINK';
UPDATE action SET handler_instance_id = 'hi-baseline'    WHERE action_code = 'BASELINE';
UPDATE action SET handler_instance_id = 'hi-commit'      WHERE action_code = 'COMMIT';
UPDATE action SET handler_instance_id = 'hi-rollback'    WHERE action_code = 'ROLLBACK';
UPDATE action SET handler_instance_id = 'hi-cancel'      WHERE action_code = 'CANCEL';

-- Permission-only actions: handler_instance_id stays NULL
-- READ, MANAGE_ROLES, MANAGE_BASELINES, MANAGE_LIFECYCLE, MANAGE_METAMODEL
