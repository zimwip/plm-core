-- ============================================================
-- CREATE_NODE action: algorithm, instance, action, params,
-- wrapper, permissions
-- ============================================================

-- Algorithm (handler)
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-handler-create-node', 'algtype-action-handler', 'CREATE_NODE', 'Create Node Handler',
   'Create a new node of a given type', 'createNodeActionHandler');

-- Handler instance
INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('hi-create-node', 'alg-handler-create-node', 'Create Node');

-- Action (NODE_TYPE scope)
INSERT INTO action (id, action_code, scope, display_name, description, display_category, display_order, handler_instance_id) VALUES
  ('act-create-node', 'CREATE_NODE', 'NODE_TYPE', 'Create Node', 'Create a new node of a given type', 'PRIMARY', 5, 'hi-create-node');

-- Action parameters
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order, visibility) VALUES
  ('ap-cn-logicalid',  'act-create-node', '_logicalId',  'Logical ID',  'STRING', 0, 'TEXT', 1, 'UI_VISIBLE'),
  ('ap-cn-externalid', 'act-create-node', '_externalId', 'External ID', 'STRING', 0, 'TEXT', 2, 'UI_VISIBLE');

-- Wrapper: AUTO_OPEN (same as CHECKOUT — creation needs open tx)
INSERT INTO action_wrapper (id, action_id, algorithm_instance_id, execution_order) VALUES
  ('aw-create-node-tx', 'act-create-node', 'wi-tx-auto-open', 10);

-- Permissions: CREATE_NODE requires both UPDATE (GLOBAL) and CREATE_NODE (NODE)
INSERT INTO action_required_permission (id, action_id, permission_code) VALUES
  ('arp-create-node-update', 'act-create-node', 'UPDATE'),
  ('arp-create-node-create', 'act-create-node', 'CREATE_NODE');
