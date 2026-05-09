-- Link instance attribute values (mirrors link_type_attribute definitions from psm-admin)
CREATE TABLE node_version_link_attribute (
    id           VARCHAR(36)   NOT NULL PRIMARY KEY,
    node_link_id VARCHAR(36)   NOT NULL REFERENCES node_version_link(id) ON DELETE CASCADE,
    attribute_id VARCHAR(36)   NOT NULL,
    value        VARCHAR(4000),
    CONSTRAINT uq_nvla UNIQUE (node_link_id, attribute_id)
);

CREATE INDEX idx_nvla_link ON node_version_link_attribute(node_link_id);
