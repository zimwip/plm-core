-- ============================================================
-- Platform-API schema — centralized action & guard catalog
-- service_code scopes all rows to the owning service (psm, dst, …)
-- ============================================================

CREATE TABLE algorithm_type (
    id              VARCHAR(100) NOT NULL PRIMARY KEY,
    service_code    VARCHAR(50)  NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    java_interface  VARCHAR(500) NOT NULL
);

CREATE TABLE algorithm (
    id                VARCHAR(100) NOT NULL PRIMARY KEY,
    service_code      VARCHAR(50)  NOT NULL,
    algorithm_type_id VARCHAR(100) NOT NULL REFERENCES algorithm_type(id),
    code              VARCHAR(100) NOT NULL,
    name              VARCHAR(200) NOT NULL,
    description       VARCHAR(1000),
    handler_ref       VARCHAR(500) NOT NULL,
    module_name       VARCHAR(100),
    domain_name       VARCHAR(100),
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_algorithm_code UNIQUE (service_code, code)
);

CREATE TABLE algorithm_parameter (
    id            VARCHAR(100) NOT NULL PRIMARY KEY,
    algorithm_id  VARCHAR(100) NOT NULL REFERENCES algorithm(id),
    param_name    VARCHAR(100) NOT NULL,
    param_label   VARCHAR(200) NOT NULL,
    data_type     VARCHAR(50)  NOT NULL DEFAULT 'STRING',
    required      SMALLINT     NOT NULL DEFAULT 0,
    default_value VARCHAR(1000),
    display_order INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_algo_param UNIQUE (algorithm_id, param_name)
);

CREATE TABLE algorithm_instance (
    id           VARCHAR(100) NOT NULL PRIMARY KEY,
    service_code VARCHAR(50)  NOT NULL,
    algorithm_id VARCHAR(100) NOT NULL REFERENCES algorithm(id),
    name         VARCHAR(200) NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_algorithm_instance_name UNIQUE (service_code, name)
);

CREATE TABLE algorithm_instance_param_value (
    id                     VARCHAR(100)  NOT NULL PRIMARY KEY,
    algorithm_instance_id  VARCHAR(100)  NOT NULL REFERENCES algorithm_instance(id),
    algorithm_parameter_id VARCHAR(100)  NOT NULL REFERENCES algorithm_parameter(id),
    value                  VARCHAR(2000) NOT NULL,
    CONSTRAINT uq_aipv UNIQUE (algorithm_instance_id, algorithm_parameter_id)
);

-- ============================================================
-- PERMISSIONS
-- ============================================================

CREATE TABLE permission (
    permission_code VARCHAR(100) NOT NULL PRIMARY KEY,
    service_code    VARCHAR(50)  NOT NULL,
    scope           VARCHAR(20)  NOT NULL,
    display_name    VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    display_order   INT          DEFAULT 0
);

-- ============================================================
-- ACTION REGISTRY
-- ============================================================

CREATE TABLE action (
    id                  VARCHAR(100) NOT NULL PRIMARY KEY,
    service_code        VARCHAR(50)  NOT NULL,
    action_code         VARCHAR(100) NOT NULL,
    scope               VARCHAR(20)  NOT NULL DEFAULT 'NODE',
    display_name        VARCHAR(200) NOT NULL,
    description         VARCHAR(1000),
    display_category    VARCHAR(20)  NOT NULL DEFAULT 'PRIMARY',
    display_order       INT          NOT NULL DEFAULT 0,
    managed_with        VARCHAR(100) REFERENCES action(id),
    handler_instance_id VARCHAR(100) REFERENCES algorithm_instance(id),
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_action_code UNIQUE (service_code, action_code)
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

CREATE TABLE action_required_permission (
    id              VARCHAR(100) NOT NULL PRIMARY KEY,
    action_id       VARCHAR(100) NOT NULL REFERENCES action(id),
    permission_code VARCHAR(100) NOT NULL REFERENCES permission(permission_code),
    CONSTRAINT uq_action_required_permission UNIQUE (action_id, permission_code)
);

-- ============================================================
-- GUARD ATTACHMENT TABLES
-- node_type_id and transition_id are soft references (no FK to metamodel)
-- ============================================================

CREATE TABLE action_guard (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    action_id             VARCHAR(100) NOT NULL REFERENCES action(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    effect                VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_action_guard UNIQUE (action_id, algorithm_instance_id)
);

CREATE TABLE node_action_guard (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    service_code          VARCHAR(50)  NOT NULL,
    node_type_id          VARCHAR(100) NOT NULL,
    action_id             VARCHAR(100) NOT NULL REFERENCES action(id),
    transition_id         VARCHAR(100),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    effect                VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    override_action       VARCHAR(20)  NOT NULL DEFAULT 'ADD',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_nag UNIQUE (service_code, node_type_id, action_id, transition_id, algorithm_instance_id)
);

CREATE TABLE lifecycle_transition_guard (
    id                      VARCHAR(100) NOT NULL PRIMARY KEY,
    service_code            VARCHAR(50)  NOT NULL,
    lifecycle_transition_id VARCHAR(100) NOT NULL,
    algorithm_instance_id   VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    effect                  VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    display_order           INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_ltg UNIQUE (service_code, lifecycle_transition_id, algorithm_instance_id)
);

-- ============================================================
-- ACTION WRAPPER PIPELINE
-- ============================================================

CREATE TABLE action_wrapper (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    service_code          VARCHAR(50)  NOT NULL,
    action_id             VARCHAR(100) NOT NULL REFERENCES action(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    execution_order       INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_action_wrapper UNIQUE (action_id, algorithm_instance_id)
);

-- ============================================================
-- NODE-TYPE PARAMETER OVERRIDES
-- node_type_id is a soft reference (no FK to metamodel)
-- ============================================================

CREATE TABLE action_param_override (
    id             VARCHAR(100)  NOT NULL PRIMARY KEY,
    service_code   VARCHAR(50)   NOT NULL,
    node_type_id   VARCHAR(100)  NOT NULL,
    action_id      VARCHAR(100)  NOT NULL REFERENCES action(id),
    parameter_id   VARCHAR(100)  NOT NULL REFERENCES action_parameter(id),
    default_value  VARCHAR(1000),
    allowed_values VARCHAR(2000),
    required       SMALLINT,
    CONSTRAINT uq_apo UNIQUE (service_code, node_type_id, action_id, parameter_id)
);
