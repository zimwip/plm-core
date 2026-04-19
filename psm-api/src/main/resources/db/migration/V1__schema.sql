-- ============================================================
-- PSM (Product Structure Management) SCHEMA — Collapsed
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
    id                  VARCHAR(36)  NOT NULL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    description         VARCHAR(1000),
    lifecycle_id        VARCHAR(36)  REFERENCES lifecycle(id),
    logical_id_label    VARCHAR(100) DEFAULT 'Identifier',
    logical_id_pattern  VARCHAR(500),
    numbering_scheme    VARCHAR(50)  NOT NULL DEFAULT 'ALPHA_NUMERIC',
    version_policy      VARCHAR(20)  NOT NULL DEFAULT 'ITERATE',  -- NONE | ITERATE | RELEASE
    color               VARCHAR(20),
    icon                VARCHAR(50),
    collapse_history    BOOLEAN      NOT NULL DEFAULT FALSE,
    parent_node_type_id VARCHAR(36)  REFERENCES node_type(id),
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    as_name         INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
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
-- ============================================================

CREATE TABLE plm_transaction (
    id             VARCHAR(36)   NOT NULL PRIMARY KEY,
    owner_id       VARCHAR(100)  NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'OPEN',
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
    project_space_id VARCHAR(36),
    logical_id       VARCHAR(500),
    external_id      VARCHAR(255),
    locked_by        VARCHAR(100),
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
    change_type         VARCHAR(50)   NOT NULL DEFAULT 'CONTENT',
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
    id                         VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_id                    VARCHAR(36)  NOT NULL REFERENCES node(id),
    node_version_id            VARCHAR(36)  NOT NULL REFERENCES node_version(id),
    signed_by                  VARCHAR(100) NOT NULL,
    signed_at                  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    meaning                    VARCHAR(100) NOT NULL,
    comment                    VARCHAR(1000),
    signed_version_fingerprint VARCHAR(64)
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
-- ACTION REGISTRY
--
-- scope: NODE | LIFECYCLE | GLOBAL | TX
-- tx_mode: NONE | REQUIRED | AUTO_OPEN | ISOLATED
-- display_category: PRIMARY | SECONDARY | DANGEROUS | STRUCTURAL
-- ============================================================

CREATE TABLE action (
    id               VARCHAR(100)  NOT NULL PRIMARY KEY,
    action_code      VARCHAR(100)  NOT NULL,
    action_kind      VARCHAR(20)   NOT NULL DEFAULT 'BUILTIN',
    scope            VARCHAR(20)   NOT NULL DEFAULT 'NODE',
    display_name     VARCHAR(200)  NOT NULL,
    description      VARCHAR(1000),
    handler_ref      VARCHAR(200)  NOT NULL,
    display_category VARCHAR(20)   NOT NULL DEFAULT 'PRIMARY',
    requires_tx      SMALLINT      NOT NULL DEFAULT 0,
    tx_mode          VARCHAR(30)   NOT NULL DEFAULT 'NONE',
    display_order    INT           NOT NULL DEFAULT 0,
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

CREATE TABLE action_permission (
    id               VARCHAR(100) NOT NULL PRIMARY KEY,
    action_id        VARCHAR(100) NOT NULL REFERENCES action(id),
    project_space_id VARCHAR(36)  NOT NULL,
    role_id          VARCHAR(36)  NOT NULL,
    node_type_id     VARCHAR(36),
    transition_id    VARCHAR(36),
    CONSTRAINT uq_action_permission UNIQUE (action_id, project_space_id, role_id,
                                            node_type_id, transition_id)
);

-- ============================================================
-- EVENT OUTBOX
-- ============================================================

CREATE TABLE event_outbox (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    payload     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- COMMENTS
-- ============================================================

CREATE TABLE node_version_comment (
    id                  VARCHAR(36)   NOT NULL PRIMARY KEY,
    node_id             VARCHAR(36)   NOT NULL REFERENCES node(id),
    node_version_id     VARCHAR(36)   NOT NULL REFERENCES node_version(id),
    author              VARCHAR(100)  NOT NULL,
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    text                TEXT          NOT NULL,
    version_fingerprint VARCHAR(64),
    parent_comment_id   VARCHAR(36)   REFERENCES node_version_comment(id),
    attribute_name      VARCHAR(100)
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
    name         VARCHAR(200),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE algorithm_instance_param_value (
    id                     VARCHAR(100)  NOT NULL PRIMARY KEY,
    algorithm_instance_id  VARCHAR(100)  NOT NULL REFERENCES algorithm_instance(id),
    algorithm_parameter_id VARCHAR(100)  NOT NULL REFERENCES algorithm_parameter(id),
    value                  VARCHAR(2000) NOT NULL,
    CONSTRAINT uq_aipv UNIQUE (algorithm_instance_id, algorithm_parameter_id)
);

-- ============================================================
-- GUARD ATTACHMENT TABLES
--
-- Tiers (merge order: generic → specific):
--   1. action_guard               — global, on action.id
--   2. lifecycle_transition_guard  — on lifecycle_transition.id, all node_types
--   3. node_action_guard           — per (node_type, action, transition?), ADD or DISABLE
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

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_tx_owner_status     ON plm_transaction(owner_id, status);
CREATE INDEX idx_node_project_space  ON node(project_space_id);
CREATE INDEX idx_node_version_node   ON node_version(node_id);
CREATE INDEX idx_node_version_state  ON node_version(lifecycle_state_id);
CREATE INDEX idx_node_version_tx     ON node_version(tx_id);
CREATE INDEX idx_node_version_fp     ON node_version(fingerprint);
CREATE INDEX idx_link_source         ON node_version_link(source_node_version_id);
CREATE INDEX idx_link_target         ON node_version_link(target_node_id);
CREATE INDEX idx_attr_def_nodetype   ON attribute_definition(node_type_id);
CREATE INDEX idx_attr_state_rule     ON attribute_state_rule(attribute_definition_id);
CREATE INDEX idx_baseline_entry      ON baseline_entry(baseline_id);
CREATE INDEX idx_signature_node      ON node_signature(node_id);
CREATE INDEX idx_signature_version   ON node_signature(node_version_id);
CREATE INDEX idx_sigreq_transition   ON signature_requirement(lifecycle_transition_id);
CREATE INDEX idx_view_nodetype       ON attribute_view(node_type_id);
CREATE INDEX idx_view_role           ON attribute_view(eligible_role_id);
CREATE INDEX idx_vao_view            ON view_attribute_override(view_id);
CREATE INDEX idx_lta_link_type       ON link_type_attribute(link_type_id);
CREATE INDEX idx_ltc_link_type       ON link_type_cascade(link_type_id);
CREATE INDEX idx_ltc_parent_trans    ON link_type_cascade(parent_transition_id);
CREATE INDEX idx_ltc_child_state     ON link_type_cascade(child_from_state_id);
CREATE INDEX idx_event_outbox_ts     ON event_outbox(created_at);
CREATE INDEX idx_comment_node        ON node_version_comment(node_id);
CREATE INDEX idx_comment_version     ON node_version_comment(node_version_id);
CREATE INDEX idx_napar_action        ON action_parameter(action_id);
CREATE INDEX idx_apo_key             ON action_param_override(node_type_id, action_id);
CREATE INDEX idx_ap_action           ON action_permission(action_id);
CREATE INDEX idx_ap_nodetype         ON action_permission(node_type_id);
CREATE INDEX idx_ap_role             ON action_permission(role_id);
CREATE INDEX idx_action_guard_action ON action_guard(action_id);
CREATE INDEX idx_ltg_transition      ON lifecycle_transition_guard(lifecycle_transition_id);
CREATE INDEX idx_nag_key             ON node_action_guard(node_type_id, action_id, transition_id);
CREATE INDEX idx_algo_instance_algo  ON algorithm_instance(algorithm_id);
