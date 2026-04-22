-- ============================================================
-- DOMAIN CONCEPT
-- Reusable attribute groups that can be dynamically attached
-- to nodes after creation. A node can have multiple domains.
-- ============================================================

-- ============================================================
-- DOMAIN TABLE
-- ============================================================

CREATE TABLE domain (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    color       VARCHAR(20),
    icon        VARCHAR(50),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- NODE VERSION ↔ DOMAIN (versioned assignment)
-- ============================================================

CREATE TABLE node_version_domain (
    id              VARCHAR(36) NOT NULL PRIMARY KEY,
    node_version_id VARCHAR(36) NOT NULL REFERENCES node_version(id),
    domain_id       VARCHAR(36) NOT NULL REFERENCES domain(id),
    CONSTRAINT uq_nvd UNIQUE (node_version_id, domain_id)
);

CREATE INDEX idx_nvd_version ON node_version_domain(node_version_id);
CREATE INDEX idx_nvd_domain  ON node_version_domain(domain_id);

-- ============================================================
-- ATTRIBUTE DEFINITION: dual ownership (node_type OR domain)
-- ============================================================

ALTER TABLE attribute_definition ALTER COLUMN node_type_id DROP NOT NULL;
ALTER TABLE attribute_definition ADD COLUMN domain_id VARCHAR(36) REFERENCES domain(id);
ALTER TABLE attribute_definition ADD CONSTRAINT chk_attr_def_owner
    CHECK ((node_type_id IS NOT NULL AND domain_id IS NULL)
        OR (node_type_id IS NULL AND domain_id IS NOT NULL));

CREATE INDEX idx_attr_def_domain ON attribute_definition(domain_id);

-- ============================================================
-- ALGORITHM + ACTION entries for assign_domain / unassign_domain
-- ============================================================

INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-handler-assign-domain',   'algtype-action-handler', 'assign_domain',   'Assign Domain Handler',   'Attach a domain to a node',      'assignDomainActionHandler'),
  ('alg-handler-unassign-domain', 'algtype-action-handler', 'unassign_domain', 'Unassign Domain Handler', 'Detach a domain from a node',    'unassignDomainActionHandler');

INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('hi-assign-domain',   'alg-handler-assign-domain',   'Assign Domain'),
  ('hi-unassign-domain', 'alg-handler-unassign-domain', 'Unassign Domain');

INSERT INTO action (id, action_code, scope, display_name, description, display_category, display_order, handler_instance_id) VALUES
  ('act-assign-domain',   'assign_domain',   'NODE', 'Assign Domain',   'Attach a domain to a node',   'SECONDARY', 500, 'hi-assign-domain'),
  ('act-unassign-domain', 'unassign_domain', 'NODE', 'Unassign Domain', 'Detach a domain from a node', 'SECONDARY', 510, 'hi-unassign-domain');

-- Parameters
INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-ad-domain',  'act-assign-domain',   'domainId', 'Domain', 'ENUM', 1, 'DROPDOWN', 1),
  ('nap-ud-domain',  'act-unassign-domain', 'domainId', 'Domain', 'ENUM', 1, 'DROPDOWN', 1);

-- Permission: assign/unassign require UPDATE_NODE
INSERT INTO action_required_permission (id, action_id, permission_code) VALUES
  ('arp-assign-domain',   'act-assign-domain',   'UPDATE_NODE'),
  ('arp-unassign-domain', 'act-unassign-domain', 'UPDATE_NODE');

-- Guards: lock_owner_required
INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES
  ('ag-assign-domain-owner',   'act-assign-domain',   'gi-lock-owner', 'HIDE', 1),
  ('ag-unassign-domain-owner', 'act-unassign-domain', 'gi-lock-owner', 'HIDE', 1);

-- Wrappers: REQUIRED tx mode (node must already be checked out)
INSERT INTO action_wrapper (id, action_id, algorithm_instance_id, execution_order) VALUES
  ('aw-assign-domain-tx',   'act-assign-domain',   'wi-tx-required', 10),
  ('aw-unassign-domain-tx', 'act-unassign-domain', 'wi-tx-required', 10);
