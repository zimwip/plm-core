-- Wire the read_node action to its handler bean.
-- AlgorithmStartupValidator may have already auto-registered the algorithm row
-- at a previous startup with an ID it picked. Look it up by code so we attach
-- to whatever row exists (or create one).

INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref)
SELECT 'alg-handler-read-node', 'algtype-action-handler', 'read_node', 'READ_NODE Handler',
       'Returns the full server-driven UI description of a node',
       'com.plm.node.version.internal.handler.ReadNodeActionHandler'
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'read_node');

INSERT INTO algorithm_instance (id, algorithm_id, name)
SELECT 'hi-read-node', a.id, 'default-read-node'
FROM algorithm a
WHERE a.code = 'read_node'
  AND NOT EXISTS (SELECT 1 FROM algorithm_instance WHERE id = 'hi-read-node');

UPDATE action SET handler_instance_id = 'hi-read-node' WHERE id = 'act-read';
