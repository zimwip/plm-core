-- ImportContext: links a logical import context code to algorithm instances
-- for import processing (cad-api) and node validation (psm-api).
CREATE TABLE psa_import_context (
    id                                    VARCHAR(36)  PRIMARY KEY,
    code                                  VARCHAR(100) UNIQUE NOT NULL,
    label                                 VARCHAR(255) NOT NULL,
    allowed_root_node_types               TEXT,        -- JSON array of nodeTypeId strings
    accepted_formats                      TEXT,        -- JSON array: ["STEP","CATIA_V5"]
    import_context_algorithm_instance_id  VARCHAR(36), -- algorithm instance in cad-api
    node_validation_algorithm_instance_id VARCHAR(36), -- algorithm instance in psm-api
    created_at                            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at                            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
