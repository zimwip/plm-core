-- ============================================================
-- PSM (Product Structure Management) SCHEMA
--
-- In PostgreSQL these live in the 'psm' schema.
-- In H2 dev/test mode they live in the default PUBLIC schema.
--
-- Cross-service references (role_id, project_space_id, user IDs)
-- are plain VARCHAR — no FK constraints across service boundaries.
-- ============================================================

-- ============================================================
-- LIFECYCLE META-MODEL
-- ============================================================

CREATE TABLE lifecycle (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lifecycle_state (
    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle(id),
    name          VARCHAR(100) NOT NULL,
    is_initial    SMALLINT     NOT NULL DEFAULT 0,
    is_frozen     SMALLINT     NOT NULL DEFAULT 0,
    is_released   SMALLINT     NOT NULL DEFAULT 0,
    display_order INT          NOT NULL DEFAULT 0,
    color         VARCHAR(20)            -- hex color for UI (e.g. '#5b9cf6'), NULL = default
);

CREATE TABLE lifecycle_transition (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_id     VARCHAR(36)  NOT NULL REFERENCES lifecycle(id),
    name             VARCHAR(100) NOT NULL,
    from_state_id    VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    to_state_id      VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    guard_expr       VARCHAR(1000),
    action_type      VARCHAR(100),
    version_strategy VARCHAR(20)  NOT NULL DEFAULT 'NONE'  -- NONE | ITERATE | REVISE
);

-- ============================================================
-- NODE TYPE META-MODEL
-- ============================================================

CREATE TABLE node_type (
    id                 VARCHAR(36)  NOT NULL PRIMARY KEY,
    name               VARCHAR(255) NOT NULL,
    description        VARCHAR(1000),
    lifecycle_id       VARCHAR(36)  REFERENCES lifecycle(id),
    logical_id_label   VARCHAR(100) DEFAULT 'Identifier',
    logical_id_pattern VARCHAR(500),
    numbering_scheme   VARCHAR(50)  NOT NULL DEFAULT 'ALPHA_NUMERIC',
    version_policy     VARCHAR(20)  NOT NULL DEFAULT 'ITERATE',  -- NONE | ITERATE | RELEASE
    color              VARCHAR(20),
    icon               VARCHAR(50),
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attribute_definition (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id    VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    name            VARCHAR(100) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    data_type       VARCHAR(50)  NOT NULL,  -- STRING | NUMBER | DATE | BOOLEAN | ENUM
    required        SMALLINT     NOT NULL DEFAULT 0,
    default_value   VARCHAR(1000),
    naming_regex    VARCHAR(500),
    allowed_values  VARCHAR(2000),
    widget_type     VARCHAR(50),
    display_order   INT          NOT NULL DEFAULT 0,
    display_section VARCHAR(100),
    tooltip         VARCHAR(500),
    as_name         INTEGER      NOT NULL DEFAULT 0,  -- only one per node_type; enforced at app level
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attribute_state_rule (
    id                      VARCHAR(36) NOT NULL PRIMARY KEY,
    attribute_definition_id VARCHAR(36) NOT NULL REFERENCES attribute_definition(id),
    lifecycle_state_id      VARCHAR(36) NOT NULL REFERENCES lifecycle_state(id),
    required                SMALLINT    NOT NULL DEFAULT 0,
    editable                SMALLINT    NOT NULL DEFAULT 1,
    visible                 SMALLINT    NOT NULL DEFAULT 1
);

-- ============================================================
-- LINK TYPE META-MODEL
-- ============================================================

CREATE TABLE link_type (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    description             VARCHAR(1000),
    source_node_type_id     VARCHAR(36)  REFERENCES node_type(id),
    target_node_type_id     VARCHAR(36)  REFERENCES node_type(id),
    link_policy             VARCHAR(20)  NOT NULL DEFAULT 'VERSION_TO_MASTER',
    min_cardinality         INT          NOT NULL DEFAULT 0,
    max_cardinality         INT,
    link_logical_id_label   VARCHAR(100) DEFAULT 'Link ID',
    link_logical_id_pattern VARCHAR(500),
    color                   VARCHAR(20),
    created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE link_type_attribute (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    link_type_id    VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    name            VARCHAR(100) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    data_type       VARCHAR(50)  NOT NULL DEFAULT 'STRING',
    required        SMALLINT     NOT NULL DEFAULT 0,
    default_value   VARCHAR(1000),
    naming_regex    VARCHAR(500),
    allowed_values  VARCHAR(2000),
    widget_type     VARCHAR(50)  DEFAULT 'TEXT',
    display_order   INT          NOT NULL DEFAULT 0,
    display_section VARCHAR(100),
    tooltip         VARCHAR(500),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cascade rules: when parent node fires parent_transition_id,
-- children in child_from_state_id are pushed via child_transition_id.
CREATE TABLE link_type_cascade (
    id                   VARCHAR(36)  NOT NULL PRIMARY KEY,
    link_type_id         VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    parent_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    child_from_state_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    child_transition_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    UNIQUE (link_type_id, parent_transition_id, child_from_state_id)
);

-- ============================================================
-- TRANSACTION
-- OPEN  → visible to owner + admins only
-- COMMITTED → visible to everyone
-- ============================================================

CREATE TABLE plm_transaction (
    id             VARCHAR(36)   NOT NULL PRIMARY KEY,
    owner_id       VARCHAR(100)  NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'OPEN',  -- OPEN | COMMITTED
    commit_comment VARCHAR(2000),
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    committed_at   TIMESTAMP,
    CONSTRAINT chk_tx_status CHECK (status IN ('OPEN', 'COMMITTED'))
);

-- ============================================================
-- NODE MODEL
-- ============================================================

CREATE TABLE node (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id     VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    project_space_id VARCHAR(36),           -- plain ref, no FK (cross-service)
    logical_id       VARCHAR(500),
    external_id      VARCHAR(255),
    locked_by        VARCHAR(100),          -- non-null = node is locked
    locked_at        TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL
);

CREATE TABLE node_version (
    id                  VARCHAR(36)   NOT NULL PRIMARY KEY,
    node_id             VARCHAR(36)   NOT NULL REFERENCES node(id),
    version_number      INT           NOT NULL,
    revision            VARCHAR(10)   NOT NULL DEFAULT 'A',
    iteration           INT           NOT NULL DEFAULT 1,
    lifecycle_state_id  VARCHAR(36)   REFERENCES lifecycle_state(id),
    change_type         VARCHAR(50)   NOT NULL DEFAULT 'CONTENT',  -- CONTENT | LIFECYCLE | SIGNATURE
    change_description  VARCHAR(1000),
    tx_id               VARCHAR(36)   NOT NULL REFERENCES plm_transaction(id),
    previous_version_id VARCHAR(36)   REFERENCES node_version(id),
    version_reason      VARCHAR(20)   DEFAULT 'REVISE',
    fingerprint         VARCHAR(64),
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(100)  NOT NULL,
    CONSTRAINT uq_node_version UNIQUE (node_id, version_number)
);

CREATE TABLE node_version_attribute (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_version_id  VARCHAR(36)  NOT NULL REFERENCES node_version(id),
    attribute_def_id VARCHAR(36)  NOT NULL REFERENCES attribute_definition(id),
    value            VARCHAR(4000),
    CONSTRAINT uq_node_version_attr UNIQUE (node_version_id, attribute_def_id)
);

-- VERSION_TO_MASTER: pinned_version_id IS NULL  → resolves to latest committed version
-- VERSION_TO_VERSION: pinned_version_id NOT NULL → frozen pointer to a specific version
CREATE TABLE node_version_link (
    id                     VARCHAR(36)  NOT NULL PRIMARY KEY,
    link_type_id           VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    source_node_version_id VARCHAR(36)  NOT NULL REFERENCES node_version(id),
    target_node_id         VARCHAR(36)  NOT NULL REFERENCES node(id),
    pinned_version_id      VARCHAR(36)  REFERENCES node_version(id),
    link_logical_id        VARCHAR(500),
    created_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by             VARCHAR(100) NOT NULL
);

-- ============================================================
-- SIGNATURES
-- ============================================================

CREATE TABLE node_signature (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_id         VARCHAR(36)  NOT NULL REFERENCES node(id),
    node_version_id VARCHAR(36)  NOT NULL REFERENCES node_version(id),
    signed_by       VARCHAR(100) NOT NULL,
    signed_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    meaning         VARCHAR(100) NOT NULL,
    comment         VARCHAR(1000)
);

CREATE TABLE signature_requirement (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    role_required           VARCHAR(100) NOT NULL,
    display_order           INT          NOT NULL DEFAULT 0
);

-- ============================================================
-- BASELINE
-- ============================================================

CREATE TABLE baseline (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  VARCHAR(100) NOT NULL
);

CREATE TABLE baseline_entry (
    id                  VARCHAR(36) NOT NULL PRIMARY KEY,
    baseline_id         VARCHAR(36) NOT NULL REFERENCES baseline(id),
    node_link_id        VARCHAR(36) NOT NULL REFERENCES node_version_link(id),
    resolved_version_id VARCHAR(36) NOT NULL REFERENCES node_version(id)
);

-- ============================================================
-- ATTRIBUTE VIEWS
-- Restrict (never expand) attribute rights per role x state.
-- eligible_role_id is a plain VARCHAR ref (cross-service).
-- ============================================================

CREATE TABLE attribute_view (
    id                VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id      VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    name              VARCHAR(100) NOT NULL,
    description       VARCHAR(500),
    eligible_role_id  VARCHAR(36),                                   -- NULL = all roles
    eligible_state_id VARCHAR(36)  REFERENCES lifecycle_state(id),  -- NULL = all states
    priority          INT          NOT NULL DEFAULT 0
);

CREATE TABLE view_attribute_override (
    id               VARCHAR(36) NOT NULL PRIMARY KEY,
    view_id          VARCHAR(36) NOT NULL REFERENCES attribute_view(id),
    attribute_def_id VARCHAR(36) NOT NULL REFERENCES attribute_definition(id),
    visible          SMALLINT,
    editable         SMALLINT,
    display_order    INT,
    display_section  VARCHAR(100),
    CONSTRAINT uq_view_attr UNIQUE (view_id, attribute_def_id)
);

-- ============================================================
-- ACTION REGISTRY
--
-- action               = global catalog (built-in + custom)
-- action_parameter     = parameter schema per action
-- node_type_action     = enabled actions per node type
-- action_param_override= per node-type-action parameter overrides
-- action_permission    = flat allowlist:
--   action x project_space x role [x node_type] [x transition]
--
--   scope = NODE     → permission by (action, node_type, project_space, role)
--   scope = LIFECYCLE→ permission by (action, node_type, transition, project_space, role)
--   scope = GLOBAL   → permission by (action, project_space, role); node_type/transition NULL
--
-- Zero rows for (action, project_space) = open to all.
-- One or more rows = explicit allowlist.
-- Admins bypass all checks via isAdmin flag.
-- display_category = STRUCTURAL hides an action from the UI action list.
-- ============================================================

CREATE TABLE action (
    id               VARCHAR(100)  NOT NULL PRIMARY KEY,
    action_code      VARCHAR(100)  NOT NULL,
    action_kind      VARCHAR(20)   NOT NULL DEFAULT 'BUILTIN',
    scope            VARCHAR(20)   NOT NULL DEFAULT 'NODE',   -- NODE | LIFECYCLE | GLOBAL
    display_name     VARCHAR(200)  NOT NULL,
    description      VARCHAR(1000),
    handler_ref      VARCHAR(200)  NOT NULL,
    display_category VARCHAR(20)   NOT NULL DEFAULT 'PRIMARY',
    requires_tx      SMALLINT      NOT NULL DEFAULT 0,
    is_default       SMALLINT      NOT NULL DEFAULT 0,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_action_code UNIQUE (action_code)
);

CREATE TABLE action_parameter (
    id               VARCHAR(100)  NOT NULL PRIMARY KEY,
    action_id        VARCHAR(100)  NOT NULL REFERENCES action(id),
    param_name       VARCHAR(100)  NOT NULL,
    param_label      VARCHAR(200)  NOT NULL,
    data_type        VARCHAR(50)   NOT NULL DEFAULT 'STRING',
    required         SMALLINT      NOT NULL DEFAULT 0,
    default_value    VARCHAR(1000),
    allowed_values   VARCHAR(2000),
    widget_type      VARCHAR(50)   NOT NULL DEFAULT 'TEXT',
    validation_regex VARCHAR(500),
    min_value        VARCHAR(50),
    max_value        VARCHAR(50),
    visibility       VARCHAR(20)   NOT NULL DEFAULT 'UI_VISIBLE',
    display_order    INT           NOT NULL DEFAULT 0,
    tooltip          VARCHAR(500),
    CONSTRAINT uq_action_param UNIQUE (action_id, param_name)
);

CREATE TABLE node_type_action (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_id          VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    action_id             VARCHAR(100) NOT NULL REFERENCES action(id),
    status                VARCHAR(20)  NOT NULL DEFAULT 'ENABLED',
    display_name_override VARCHAR(200),
    transition_id         VARCHAR(36)  REFERENCES lifecycle_transition(id),
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_nodetype_action UNIQUE (node_type_id, action_id, transition_id)
);

CREATE TABLE action_param_override (
    id                  VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_action_id VARCHAR(100) NOT NULL REFERENCES node_type_action(id),
    parameter_id        VARCHAR(100) NOT NULL REFERENCES action_parameter(id),
    default_value       VARCHAR(1000),
    allowed_values      VARCHAR(2000),
    required            SMALLINT,
    CONSTRAINT uq_napo UNIQUE (node_type_action_id, parameter_id)
);

CREATE TABLE action_permission (
    id               VARCHAR(100) NOT NULL PRIMARY KEY,
    action_id        VARCHAR(100) NOT NULL REFERENCES action(id),
    project_space_id VARCHAR(36)  NOT NULL,
    role_id          VARCHAR(36)  NOT NULL,
    node_type_id     VARCHAR(36),   -- NULL for GLOBAL-scope actions
    transition_id    VARCHAR(36),   -- NULL for NODE-scope; specific transition for LIFECYCLE-scope
    CONSTRAINT uq_action_permission UNIQUE (action_id, project_space_id, role_id,
                                            node_type_id, transition_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_tx_owner_status    ON plm_transaction(owner_id, status);
CREATE INDEX idx_node_project_space ON node(project_space_id);
CREATE INDEX idx_node_version_node  ON node_version(node_id);
CREATE INDEX idx_node_version_state ON node_version(lifecycle_state_id);
CREATE INDEX idx_node_version_tx    ON node_version(tx_id);
CREATE INDEX idx_node_version_fp    ON node_version(fingerprint);
CREATE INDEX idx_link_source        ON node_version_link(source_node_version_id);
CREATE INDEX idx_link_target        ON node_version_link(target_node_id);
CREATE INDEX idx_attr_def_nodetype  ON attribute_definition(node_type_id);
CREATE INDEX idx_attr_state_rule    ON attribute_state_rule(attribute_definition_id);
CREATE INDEX idx_baseline_entry     ON baseline_entry(baseline_id);
CREATE INDEX idx_signature_node     ON node_signature(node_id);
CREATE INDEX idx_signature_version  ON node_signature(node_version_id);
CREATE INDEX idx_sigreq_transition  ON signature_requirement(lifecycle_transition_id);
CREATE INDEX idx_view_nodetype      ON attribute_view(node_type_id);
CREATE INDEX idx_view_role          ON attribute_view(eligible_role_id);
CREATE INDEX idx_vao_view           ON view_attribute_override(view_id);
CREATE INDEX idx_lta_link_type      ON link_type_attribute(link_type_id);
CREATE INDEX idx_ltc_link_type      ON link_type_cascade(link_type_id);
CREATE INDEX idx_ltc_parent_trans   ON link_type_cascade(parent_transition_id);
CREATE INDEX idx_ltc_child_state    ON link_type_cascade(child_from_state_id);
CREATE INDEX idx_nta_nodetype       ON node_type_action(node_type_id);
CREATE INDEX idx_nta_action         ON node_type_action(action_id);
CREATE INDEX idx_nta_transition     ON node_type_action(transition_id);
CREATE INDEX idx_napar_action       ON action_parameter(action_id);
CREATE INDEX idx_napov_nta          ON action_param_override(node_type_action_id);
CREATE INDEX idx_ap_action          ON action_permission(action_id);
CREATE INDEX idx_ap_nodetype        ON action_permission(node_type_id);
CREATE INDEX idx_ap_role            ON action_permission(role_id);
