-- ============================================================
-- Platform-API schema — centralized action & algorithm catalog
--
-- Dropped tables (net zero after all migrations):
--   - permission (moved to pno-api in V7)
--   - node_action_guard (dropped in V2)
--   - action_param_override (dropped in V2)
--   - lifecycle_transition_guard (dropped in V11)
--
-- Soft references (no FK constraint — auto-registered at service startup
-- after Flyway runs, so FK cannot be enforced at migration time):
--   - action.handler_instance_id → algorithm_instance
--   - action_guard.algorithm_instance_id → algorithm_instance
--   - action_wrapper.algorithm_instance_id → algorithm_instance
--   - action_required_permission.permission_code (permission lives in pno-api)
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
    handler_instance_id VARCHAR(100),
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

-- permission_code is a soft reference (FK dropped in V7; permission lives in pno-api)
CREATE TABLE action_required_permission (
    id              VARCHAR(100) NOT NULL PRIMARY KEY,
    action_id       VARCHAR(100) NOT NULL REFERENCES action(id),
    permission_code VARCHAR(100) NOT NULL,
    CONSTRAINT uq_action_required_permission UNIQUE (action_id, permission_code)
);

-- ============================================================
-- GUARD + WRAPPER PIPELINE
-- ============================================================

-- algorithm_instance_id is a soft reference — FK dropped in V4 because instances
-- are auto-registered at service startup after Flyway runs.
CREATE TABLE action_guard (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    action_id             VARCHAR(100) NOT NULL REFERENCES action(id),
    algorithm_instance_id VARCHAR(100) NOT NULL,
    effect                VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_action_guard UNIQUE (action_id, algorithm_instance_id)
);

-- algorithm_instance_id is a soft reference — same reason as action_guard.
CREATE TABLE action_wrapper (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    service_code          VARCHAR(50)  NOT NULL,
    action_id             VARCHAR(100) NOT NULL REFERENCES action(id),
    algorithm_instance_id VARCHAR(100) NOT NULL,
    execution_order       INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_action_wrapper UNIQUE (action_id, algorithm_instance_id)
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

CREATE INDEX idx_algorithm_stat_window_start ON algorithm_stat_window(window_start);

-- ============================================================
-- EVENT OUTBOX
-- ============================================================

CREATE TABLE event_outbox (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    payload     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_outbox_ts ON event_outbox(created_at);
