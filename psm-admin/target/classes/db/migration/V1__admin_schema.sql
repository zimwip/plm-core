-- ============================================================
-- PSM ADMIN SCHEMA -- Config/metamodel tables only
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

CREATE TABLE enum_value (
    id                 VARCHAR(36)  NOT NULL PRIMARY KEY,
    enum_definition_id VARCHAR(36)  NOT NULL REFERENCES enum_definition(id),
    value              VARCHAR(255) NOT NULL,
    label              VARCHAR(255),
    display_order      INT          NOT NULL DEFAULT 0,
    CONSTRAINT enum_value_unique UNIQUE (enum_definition_id, value)
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
    target_node_type_id     VARCHAR(36)  REFERENCES node_type(id),
    link_policy             VARCHAR(20)  NOT NULL DEFAULT 'VERSION_TO_MASTER',
    min_cardinality         INT          NOT NULL DEFAULT 0,
    max_cardinality         INT,
    link_logical_id_label   VARCHAR(100) DEFAULT 'Link ID',
    link_logical_id_pattern VARCHAR(500),
    color                   VARCHAR(20),
    icon                    VARCHAR(50),
    created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE link_type_attribute (
    id                 VARCHAR(36)  NOT NULL PRIMARY KEY,
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
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE link_type_cascade (
    id                   VARCHAR(36)  NOT NULL PRIMARY KEY,
    link_type_id         VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    parent_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    child_from_state_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    child_transition_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    UNIQUE (link_type_id, parent_transition_id, child_from_state_id)
);

-- ============================================================
-- ALGORITHM FRAMEWORK
-- ============================================================

CREATE TABLE algorithm_type (
    id              VARCHAR(100)  NOT NULL PRIMARY KEY,
    name            VARCHAR(200)  NOT NULL,
    description     VARCHAR(1000),
    java_interface  VARCHAR(500)  NOT NULL
);

CREATE TABLE algorithm (
    id                VARCHAR(100)  NOT NULL PRIMARY KEY,
    algorithm_type_id VARCHAR(100)  NOT NULL REFERENCES algorithm_type(id),
    code              VARCHAR(100)  NOT NULL,
    name              VARCHAR(200)  NOT NULL,
    description       VARCHAR(1000),
    handler_ref       VARCHAR(500)  NOT NULL,
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_algorithm_code UNIQUE (code)
);

CREATE TABLE algorithm_parameter (
    id            VARCHAR(100)  NOT NULL PRIMARY KEY,
    algorithm_id  VARCHAR(100)  NOT NULL REFERENCES algorithm(id),
    param_name    VARCHAR(100)  NOT NULL,
    param_label   VARCHAR(200)  NOT NULL,
    data_type     VARCHAR(50)   NOT NULL DEFAULT 'STRING',
    required      SMALLINT      NOT NULL DEFAULT 0,
    default_value VARCHAR(1000),
    display_order INT           NOT NULL DEFAULT 0,
    CONSTRAINT uq_algo_param UNIQUE (algorithm_id, param_name)
);

CREATE TABLE algorithm_instance (
    id           VARCHAR(100) NOT NULL PRIMARY KEY,
    algorithm_id VARCHAR(100) NOT NULL REFERENCES algorithm(id),
    name         VARCHAR(200) NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_algorithm_instance_name UNIQUE (name)
);

CREATE TABLE algorithm_instance_param_value (
    id                     VARCHAR(100)  NOT NULL PRIMARY KEY,
    algorithm_instance_id  VARCHAR(100)  NOT NULL REFERENCES algorithm_instance(id),
    algorithm_parameter_id VARCHAR(100)  NOT NULL REFERENCES algorithm_parameter(id),
    value                  VARCHAR(2000) NOT NULL,
    CONSTRAINT uq_aipv UNIQUE (algorithm_instance_id, algorithm_parameter_id)
);

-- ============================================================
-- ACTION REGISTRY
-- ============================================================

CREATE TABLE action (
    id                  VARCHAR(100)  NOT NULL PRIMARY KEY,
    action_code         VARCHAR(100)  NOT NULL,
    scope               VARCHAR(20)   NOT NULL DEFAULT 'NODE',
    display_name        VARCHAR(200)  NOT NULL,
    description         VARCHAR(1000),
    display_category    VARCHAR(20)   NOT NULL DEFAULT 'PRIMARY',
    display_order       INT           NOT NULL DEFAULT 0,
    managed_with        VARCHAR(100)  REFERENCES action(id),
    handler_instance_id VARCHAR(64)   REFERENCES algorithm_instance(id),
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

CREATE TABLE action_param_override (
    id              VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_id    VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    action_id       VARCHAR(100) NOT NULL REFERENCES action(id),
    parameter_id    VARCHAR(100) NOT NULL REFERENCES action_parameter(id),
    default_value   VARCHAR(1000),
    allowed_values  VARCHAR(2000),
    required        SMALLINT,
    CONSTRAINT uq_apo UNIQUE (node_type_id, action_id, parameter_id)
);

-- ============================================================
-- PERMISSION
-- ============================================================

CREATE TABLE permission (
    permission_code VARCHAR(100) PRIMARY KEY,
    scope           VARCHAR(20)  NOT NULL,
    display_name    VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    display_order   INT          DEFAULT 0
);

CREATE TABLE action_required_permission (
    id              VARCHAR(100) PRIMARY KEY,
    action_id       VARCHAR(100) NOT NULL REFERENCES action(id),
    permission_code VARCHAR(100) NOT NULL REFERENCES permission(permission_code),
    CONSTRAINT action_required_permission_unique UNIQUE (action_id, permission_code)
);

CREATE TABLE authorization_policy (
    id               VARCHAR(100) NOT NULL PRIMARY KEY,
    permission_code  VARCHAR(100) NOT NULL REFERENCES permission(permission_code),
    scope            VARCHAR(20)  NOT NULL,
    role_id          VARCHAR(36)  NOT NULL,
    node_type_id     VARCHAR(36),
    transition_id    VARCHAR(36),
    CONSTRAINT uq_authorization_policy UNIQUE (permission_code, role_id, node_type_id, transition_id)
);

-- ============================================================
-- GUARD ATTACHMENT TABLES
-- ============================================================

CREATE TABLE action_guard (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    action_id             VARCHAR(100) NOT NULL REFERENCES action(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    effect                VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_action_guard UNIQUE (action_id, algorithm_instance_id)
);

CREATE TABLE lifecycle_transition_guard (
    id                      VARCHAR(100) NOT NULL PRIMARY KEY,
    lifecycle_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    algorithm_instance_id   VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    effect                  VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    display_order           INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_ltg UNIQUE (lifecycle_transition_id, algorithm_instance_id)
);

CREATE TABLE node_action_guard (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_id          VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    action_id             VARCHAR(100) NOT NULL REFERENCES action(id),
    transition_id         VARCHAR(36)  REFERENCES lifecycle_transition(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    effect                VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    override_action       VARCHAR(20)  NOT NULL DEFAULT 'ADD',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_nag UNIQUE (node_type_id, action_id, transition_id, algorithm_instance_id)
);

-- ============================================================
-- ACTION WRAPPER PIPELINE
-- ============================================================

CREATE TABLE action_wrapper (
    id                    VARCHAR(64)  NOT NULL PRIMARY KEY,
    action_id             VARCHAR(64)  NOT NULL REFERENCES action(id),
    algorithm_instance_id VARCHAR(64)  NOT NULL REFERENCES algorithm_instance(id),
    execution_order       INT          NOT NULL DEFAULT 0,
    UNIQUE (action_id, algorithm_instance_id)
);

-- ============================================================
-- ALGORITHM STATISTICS
-- ============================================================

CREATE TABLE algorithm_stat (
    algorithm_code VARCHAR(100) NOT NULL PRIMARY KEY,
    call_count     BIGINT       NOT NULL DEFAULT 0,
    total_ns       BIGINT       NOT NULL DEFAULT 0,
    min_ns         BIGINT       NOT NULL DEFAULT 9223372036854775807,
    max_ns         BIGINT       NOT NULL DEFAULT 0,
    last_flushed   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE algorithm_stat_window (
    algorithm_code VARCHAR(100) NOT NULL,
    window_start   TIMESTAMP    NOT NULL,
    call_count     BIGINT       NOT NULL DEFAULT 0,
    total_ns       BIGINT       NOT NULL DEFAULT 0,
    min_ns         BIGINT       NOT NULL DEFAULT 9223372036854775807,
    max_ns         BIGINT       NOT NULL DEFAULT 0,
    PRIMARY KEY (algorithm_code, window_start)
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
-- SIGNATURE REQUIREMENTS
-- ============================================================

CREATE TABLE signature_requirement (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    role_required           VARCHAR(100) NOT NULL,
    display_order           INT          NOT NULL DEFAULT 0
);

-- ============================================================
-- LIFECYCLE STATE ACTIONS
-- ============================================================

CREATE TABLE lifecycle_state_action (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    lifecycle_state_id    VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    trigger               VARCHAR(20)  NOT NULL DEFAULT 'ON_ENTER',
    execution_mode        VARCHAR(20)  NOT NULL DEFAULT 'TRANSACTIONAL',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT chk_lsa_trigger CHECK (trigger IN ('ON_ENTER', 'ON_EXIT')),
    CONSTRAINT chk_lsa_mode CHECK (execution_mode IN ('TRANSACTIONAL', 'POST_COMMIT')),
    CONSTRAINT uq_lsa UNIQUE (lifecycle_state_id, algorithm_instance_id, trigger)
);

CREATE TABLE node_type_state_action (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_id          VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    lifecycle_state_id    VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    trigger               VARCHAR(20)  NOT NULL DEFAULT 'ON_ENTER',
    execution_mode        VARCHAR(20)  NOT NULL DEFAULT 'TRANSACTIONAL',
    override_action       VARCHAR(20)  NOT NULL DEFAULT 'ADD',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT chk_ntsa_trigger CHECK (trigger IN ('ON_ENTER', 'ON_EXIT')),
    CONSTRAINT chk_ntsa_mode CHECK (execution_mode IN ('TRANSACTIONAL', 'POST_COMMIT')),
    CONSTRAINT uq_ntsa UNIQUE (node_type_id, lifecycle_state_id, algorithm_instance_id, trigger)
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
CREATE INDEX idx_napar_action        ON action_parameter(action_id);
CREATE INDEX idx_apo_key             ON action_param_override(node_type_id, action_id);
CREATE INDEX idx_ap_permission_code  ON authorization_policy(permission_code);
CREATE INDEX idx_ap_nodetype         ON authorization_policy(node_type_id);
CREATE INDEX idx_ap_role             ON authorization_policy(role_id);
CREATE INDEX idx_action_guard_action ON action_guard(action_id);
CREATE INDEX idx_ltg_transition      ON lifecycle_transition_guard(lifecycle_transition_id);
CREATE INDEX idx_nag_key             ON node_action_guard(node_type_id, action_id, transition_id);
CREATE INDEX idx_algo_instance_algo  ON algorithm_instance(algorithm_id);
CREATE INDEX idx_action_wrapper_action ON action_wrapper(action_id);
CREATE INDEX idx_entity_metadata_target ON entity_metadata(target_type, target_id);
CREATE INDEX idx_lsa_state           ON lifecycle_state_action(lifecycle_state_id);
CREATE INDEX idx_ntsa_key            ON node_type_state_action(node_type_id, lifecycle_state_id);
CREATE INDEX idx_algorithm_stat_window_start ON algorithm_stat_window(window_start);
