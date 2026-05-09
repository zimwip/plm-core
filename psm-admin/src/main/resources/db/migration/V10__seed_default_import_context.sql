-- Seed the built-in "default" import context.
-- Null algorithm instance IDs = use service-level default algorithms.
INSERT INTO psa_import_context (id, code, label, allowed_root_node_types, accepted_formats,
    import_context_algorithm_instance_id, node_validation_algorithm_instance_id)
VALUES ('00000000-0000-0000-0000-000000000001', 'default', 'Default', null, null, null, null);
