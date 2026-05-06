-- ============================================================
-- Seed source resolver algorithm type, algorithms, and instances
-- in platform-api's registry.
-- IDs match ActionCatalogRegistryController contribution pattern
-- (alg-<svc>-c-<code>, ainst-<svc>-c-<safe-code>) so that
-- runtime auto-registration ON CONFLICT clauses are no-ops.
-- ============================================================

INSERT INTO algorithm_type (id, service_code, name, java_interface)
VALUES ('algtype-source-resolver', 'psm', 'Source Resolver', 'SourceResolver')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES
    ('alg-psm-c-self-node-resolver', 'psm', 'algtype-source-resolver', 'self_node_resolver', 'SELF Node Resolver', 'self_node_resolver', 'node'),
    ('alg-psm-c-data-resolver',      'psm', 'algtype-source-resolver', 'data_resolver',      'DST Data Resolver',  'data_resolver',      'node')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name;

INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES
    ('ri-self-node',  'psm', 'alg-psm-c-self-node-resolver', 'SELF Node Resolver'),
    ('ri-data-local', 'psm', 'alg-psm-c-data-resolver',      'DST Data Resolver')
ON CONFLICT (id) DO NOTHING;
