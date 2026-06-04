-- ============================================================
-- PSM ADMIN SCHEMA — Config/metamodel tables only
--
-- Algorithm/action/permission catalog lives in platform-api.
-- Lifecycle transition guards live here (soft ref to platform-api
-- algorithm instances via algorithm_instance_id VARCHAR).
--
-- In PostgreSQL these live in the 'psm_admin' schema.
-- In H2 dev/test mode they live in the default PUBLIC schema.
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
    display_order INT          NOT NULL DEFAULT 0,
    color         VARCHAR(20)
);

CREATE TABLE lifecycle_transition (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_id     VARCHAR(36)  NOT NULL REFERENCES lifecycle(id),
    name             VARCHAR(100) NOT NULL,
    from_state_id    VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    to_state_id      VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    guard_expr       VARCHAR(1000),
    action_type      VARCHAR(100),
    version_strategy VARCHAR(20)  NOT NULL DEFAULT 'NONE'
);

-- ============================================================
-- NODE TYPE META-MODEL
-- ============================================================

CREATE TABLE node_type (
    id                  VARCHAR(36)  NOT NULL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    description         VARCHAR(1000),
    lifecycle_id        VARCHAR(36)  REFERENCES lifecycle(id),
    logical_id_label    VARCHAR(100) DEFAULT 'Identifier',
    logical_id_pattern  VARCHAR(500),
    numbering_scheme    VARCHAR(50)  NOT NULL DEFAULT 'ALPHA_NUMERIC',
    version_policy      VARCHAR(20)  NOT NULL DEFAULT 'ITERATE',
    color               VARCHAR(20),
    icon                VARCHAR(50),
    collapse_history    BOOLEAN      NOT NULL DEFAULT FALSE,
    parent_node_type_id VARCHAR(36)  REFERENCES node_type(id),
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DOMAIN
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
-- ENUM DEFINITIONS
-- ============================================================

CREATE TABLE enum_definition (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Functional PK: (enum_definition_id, value) — id column removed (V16)
CREATE TABLE enum_value (
    enum_definition_id VARCHAR(36)  NOT NULL REFERENCES enum_definition(id),
    value              VARCHAR(255) NOT NULL,
    label              VARCHAR(255),
    display_order      INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (enum_definition_id, value)
);

-- ============================================================
-- ATTRIBUTE DEFINITIONS
-- ============================================================

CREATE TABLE attribute_definition (
    id                 VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id       VARCHAR(36)  REFERENCES node_type(id),
    domain_id          VARCHAR(36)  REFERENCES domain(id),
    name               VARCHAR(100) NOT NULL,
    label              VARCHAR(255) NOT NULL,
    data_type          VARCHAR(50)  NOT NULL,
    required           SMALLINT     NOT NULL DEFAULT 0,
    default_value      VARCHAR(1000),
    naming_regex       VARCHAR(500),
    allowed_values     VARCHAR(2000),
    widget_type        VARCHAR(50),
    display_order      INT          NOT NULL DEFAULT 0,
    display_section    VARCHAR(100),
    tooltip            VARCHAR(500),
    as_name            INTEGER      NOT NULL DEFAULT 0,
    enum_definition_id VARCHAR(36)  REFERENCES enum_definition(id),
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_attr_def_owner CHECK (
        (node_type_id IS NOT NULL AND domain_id IS NULL)
        OR (node_type_id IS NULL AND domain_id IS NOT NULL)
    )
);

CREATE TABLE attribute_state_rule (
    id                      VARCHAR(36) NOT NULL PRIMARY KEY,
    attribute_definition_id VARCHAR(36) NOT NULL REFERENCES attribute_definition(id),
    lifecycle_state_id      VARCHAR(36) NOT NULL REFERENCES lifecycle_state(id),
    required                SMALLINT    NOT NULL DEFAULT 0,
    editable                SMALLINT    NOT NULL DEFAULT 1,
    visible                 SMALLINT    NOT NULL DEFAULT 1,
    node_type_id            VARCHAR(36),
    CONSTRAINT uq_attr_state_rule UNIQUE (node_type_id, attribute_definition_id, lifecycle_state_id)
);

-- ============================================================
-- LINK TYPE META-MODEL
-- ============================================================

CREATE TABLE link_type (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    description             VARCHAR(1000),
    source_node_type_id     VARCHAR(36)  REFERENCES node_type(id),
    target_source_id        VARCHAR(64)  NOT NULL DEFAULT 'SELF',
    target_type             VARCHAR(100) NOT NULL,
    link_policy             VARCHAR(20)  NOT NULL DEFAULT 'VERSION_TO_MASTER',
    min_cardinality         INT          NOT NULL DEFAULT 0,
    max_cardinality         INT,
    link_logical_id_label   VARCHAR(100) DEFAULT 'Link ID',
    link_logical_id_pattern VARCHAR(500),
    color                   VARCHAR(20),
    icon                    VARCHAR(50),
    created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Functional PK: (link_type_id, name) — id column removed (V16)
CREATE TABLE link_type_attribute (
    link_type_id       VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    name               VARCHAR(100) NOT NULL,
    label              VARCHAR(255) NOT NULL,
    data_type          VARCHAR(50)  NOT NULL DEFAULT 'STRING',
    required           SMALLINT     NOT NULL DEFAULT 0,
    default_value      VARCHAR(1000),
    naming_regex       VARCHAR(500),
    allowed_values     VARCHAR(2000),
    widget_type        VARCHAR(50)  DEFAULT 'TEXT',
    display_order      INT          NOT NULL DEFAULT 0,
    display_section    VARCHAR(100),
    tooltip            VARCHAR(500),
    enum_definition_id VARCHAR(36)  REFERENCES enum_definition(id),
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (link_type_id, name)
);

-- Functional PK: (link_type_id, parent_transition_id, child_from_state_id) — id column removed (V16)
CREATE TABLE link_type_cascade (
    link_type_id         VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    parent_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    child_from_state_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    child_transition_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    PRIMARY KEY (link_type_id, parent_transition_id, child_from_state_id)
);

-- ============================================================
-- SOURCE REGISTRY
-- resolver_instance_id is a soft reference to platform-api
-- algorithm_instance rows (no FK constraint across services).
-- ============================================================

CREATE TABLE source (
    id                   VARCHAR(64)  NOT NULL PRIMARY KEY,
    name                 VARCHAR(200) NOT NULL,
    description          VARCHAR(1000),
    resolver_instance_id VARCHAR(100) NOT NULL,
    is_builtin           SMALLINT     NOT NULL DEFAULT 0,
    is_versioned         SMALLINT     NOT NULL DEFAULT 0,
    color                VARCHAR(20),
    icon                 VARCHAR(50),
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_source_name UNIQUE (name)
);

-- ============================================================
-- ENTITY METADATA
-- ============================================================

CREATE TABLE entity_metadata (
    id          VARCHAR(100)  NOT NULL PRIMARY KEY,
    target_type VARCHAR(50)   NOT NULL,
    target_id   VARCHAR(100)  NOT NULL,
    meta_key    VARCHAR(100)  NOT NULL,
    meta_value  VARCHAR(1000),
    CONSTRAINT uq_entity_metadata UNIQUE (target_type, target_id, meta_key)
);

-- ============================================================
-- ATTRIBUTE VIEWS
-- ============================================================

CREATE TABLE attribute_view (
    id                VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id      VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    name              VARCHAR(100) NOT NULL,
    description       VARCHAR(500),
    eligible_role_id  VARCHAR(36),
    eligible_state_id VARCHAR(36)  REFERENCES lifecycle_state(id),
    priority          INT          NOT NULL DEFAULT 0
);

-- Functional PK: (view_id, attribute_def_id) — id column removed (V16)
CREATE TABLE view_attribute_override (
    view_id          VARCHAR(36) NOT NULL REFERENCES attribute_view(id),
    attribute_def_id VARCHAR(36) NOT NULL REFERENCES attribute_definition(id),
    visible          SMALLINT,
    editable         SMALLINT,
    display_order    INT,
    display_section  VARCHAR(100),
    PRIMARY KEY (view_id, attribute_def_id)
);

-- ============================================================
-- SIGNATURE REQUIREMENTS
-- Functional PK: (lifecycle_transition_id, role_required) — id removed (V16)
-- ============================================================

CREATE TABLE signature_requirement (
    lifecycle_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    role_required           VARCHAR(100) NOT NULL,
    display_order           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (lifecycle_transition_id, role_required)
);

-- ============================================================
-- LIFECYCLE STATE ACTIONS
-- Functional PK: (lifecycle_state_id, algorithm_instance_id, trigger) — id removed (V16)
-- algorithm_instance_id is a soft reference to platform-api.
-- ============================================================

CREATE TABLE lifecycle_state_action (
    lifecycle_state_id    VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    algorithm_instance_id VARCHAR(100) NOT NULL,
    trigger               VARCHAR(20)  NOT NULL DEFAULT 'ON_ENTER',
    execution_mode        VARCHAR(20)  NOT NULL DEFAULT 'TRANSACTIONAL',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT chk_lsa_trigger CHECK (trigger IN ('ON_ENTER', 'ON_EXIT')),
    CONSTRAINT chk_lsa_mode CHECK (execution_mode IN ('TRANSACTIONAL', 'POST_COMMIT')),
    PRIMARY KEY (lifecycle_state_id, algorithm_instance_id, trigger)
);

-- ============================================================
-- LIFECYCLE TRANSITION GUARDS
-- algorithm_instance_id is a soft reference to platform-api instances
-- (ainst-psm-c-<code> pattern). No FK constraint cross-service.
-- Functional PK: (lifecycle_transition_id, algorithm_instance_id) — id removed (V16)
-- ============================================================

CREATE TABLE lifecycle_transition_guard (
    lifecycle_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id) ON DELETE CASCADE,
    algorithm_instance_id   VARCHAR(100) NOT NULL,
    effect                  VARCHAR(20)  NOT NULL DEFAULT 'BLOCK',
    display_order           INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (lifecycle_transition_id, algorithm_instance_id)
);

-- ============================================================
-- IMPORT CONTEXT
-- Functional PK: code — id column removed (V16)
-- ============================================================

CREATE TABLE psa_import_context (
    code                                  VARCHAR(100) NOT NULL PRIMARY KEY,
    label                                 VARCHAR(255) NOT NULL,
    allowed_root_node_types               TEXT,
    accepted_formats                      TEXT,
    import_context_algorithm_instance_id  VARCHAR(36),
    node_validation_algorithm_instance_id VARCHAR(36),
    created_at                            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at                            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- EVENT OUTBOX (for config change events)
-- ============================================================

CREATE TABLE event_outbox (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    payload     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_attr_def_nodetype   ON attribute_definition(node_type_id);
CREATE INDEX idx_attr_def_domain     ON attribute_definition(domain_id);
CREATE INDEX idx_attr_state_rule     ON attribute_state_rule(attribute_definition_id);
CREATE INDEX idx_sigreq_transition   ON signature_requirement(lifecycle_transition_id);
CREATE INDEX idx_view_nodetype       ON attribute_view(node_type_id);
CREATE INDEX idx_view_role           ON attribute_view(eligible_role_id);
CREATE INDEX idx_vao_view            ON view_attribute_override(view_id);
CREATE INDEX idx_lta_link_type       ON link_type_attribute(link_type_id);
CREATE INDEX idx_ltc_link_type       ON link_type_cascade(link_type_id);
CREATE INDEX idx_ltc_parent_trans    ON link_type_cascade(parent_transition_id);
CREATE INDEX idx_ltc_child_state     ON link_type_cascade(child_from_state_id);
CREATE INDEX idx_event_outbox_ts     ON event_outbox(created_at);
CREATE INDEX idx_entity_metadata_target ON entity_metadata(target_type, target_id);
CREATE INDEX idx_lsa_state           ON lifecycle_state_action(lifecycle_state_id);
CREATE INDEX idx_ltg_transition      ON lifecycle_transition_guard(lifecycle_transition_id);

-- Uniqueness guards for main entity scoped names (V16)
CREATE UNIQUE INDEX uq_attr_def_nodetype_name
    ON attribute_definition (node_type_id, name);

CREATE UNIQUE INDEX uq_attr_def_domain_name
    ON attribute_definition (domain_id, name);

CREATE UNIQUE INDEX uq_lifecycle_state_name
    ON lifecycle_state (lifecycle_id, name);

CREATE UNIQUE INDEX uq_lifecycle_transition_name
    ON lifecycle_transition (lifecycle_id, name);
