-- ============================================================
-- PSM (Product Structure Management) SCHEMA
--
-- Business-data tables only. All metamodel/config tables
-- (lifecycle, node_type, action, permission, algorithm, etc.)
-- are owned by psm-admin and served via ConfigCache.
--
-- In PostgreSQL these live in the 'psm' schema.
-- In H2 dev/test mode they live in the default PUBLIC schema.
--
-- Cross-service references (role_id, project_space_id, user IDs,
-- node_type_id, lifecycle_state_id, link_type_id, etc.) are plain
-- VARCHAR — no FK constraints across service boundaries.
-- ============================================================

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
    node_type_id     VARCHAR(36)  NOT NULL,  -- references psm-admin node_type
    project_space_id VARCHAR(36),
    logical_id       VARCHAR(500),
    external_id      VARCHAR(255),
    locked_by        VARCHAR(100),
    locked_at        TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL
);

CREATE TABLE node_version (
    id                             VARCHAR(36)   NOT NULL PRIMARY KEY,
    node_id                        VARCHAR(36)   NOT NULL REFERENCES node(id),
    version_number                 INT           NOT NULL,
    revision                       VARCHAR(10)   NOT NULL DEFAULT 'A',
    iteration                      INT           NOT NULL DEFAULT 1,
    lifecycle_state_id             VARCHAR(36),  -- references psm-admin lifecycle_state
    change_type                    VARCHAR(50)   NOT NULL DEFAULT 'CONTENT',
    change_description             VARCHAR(1000),
    tx_id                          VARCHAR(36)   NOT NULL REFERENCES plm_transaction(id),
    previous_version_id            VARCHAR(36)   REFERENCES node_version(id),
    previous_version_fingerprint   VARCHAR(64),
    version_reason                 VARCHAR(20)   DEFAULT 'REVISE',
    fingerprint                    VARCHAR(64),
    branch                         VARCHAR(100)  NOT NULL DEFAULT 'main',
    created_at                     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by                     VARCHAR(100)  NOT NULL,
    CONSTRAINT uq_node_version UNIQUE (node_id, version_number)
);

CREATE TABLE node_version_attribute (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_version_id  VARCHAR(36)  NOT NULL REFERENCES node_version(id),
    attribute_def_id VARCHAR(36)  NOT NULL,  -- references psm-admin attribute_definition
    value            VARCHAR(4000),
    CONSTRAINT uq_node_version_attr UNIQUE (node_version_id, attribute_def_id)
);

CREATE TABLE node_version_link (
    id                     VARCHAR(36)   NOT NULL PRIMARY KEY,
    link_type_id           VARCHAR(36)   NOT NULL,  -- references psm-admin link_type
    source_node_version_id VARCHAR(36)   NOT NULL REFERENCES node_version(id),
    target_source_id       VARCHAR(64)   NOT NULL,  -- references psm-admin source.id (e.g. 'SELF')
    target_type            VARCHAR(100)  NOT NULL,  -- type within the source (node_type_id for SELF)
    target_key             VARCHAR(1000) NOT NULL,  -- e.g. 'PART-A' (V2M) or 'PART-A@3' (V2V)
    link_logical_id        VARCHAR(500),
    created_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by             VARCHAR(100)  NOT NULL
);

-- ============================================================
-- NODE VERSION ↔ DOMAIN (versioned assignment)
-- ============================================================

CREATE TABLE node_version_domain (
    id              VARCHAR(36) NOT NULL PRIMARY KEY,
    node_version_id VARCHAR(36) NOT NULL REFERENCES node_version(id) ON DELETE CASCADE,
    domain_id       VARCHAR(36) NOT NULL,  -- references psm-admin domain
    CONSTRAINT uq_nvd UNIQUE (node_version_id, domain_id)
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
    id           VARCHAR(36)   NOT NULL PRIMARY KEY,
    baseline_id  VARCHAR(36)   NOT NULL REFERENCES baseline(id),
    node_link_id VARCHAR(36)   NOT NULL REFERENCES node_version_link(id),
    resolved_key VARCHAR(1000) NOT NULL    -- canonical pinned key (e.g. 'PART-A@3' for SELF)
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
-- ALGORITHM STATISTICS (runtime data, not config)
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
-- INDEXES
-- ============================================================

CREATE INDEX idx_tx_owner_status     ON plm_transaction(owner_id, status);
CREATE INDEX idx_node_project_space  ON node(project_space_id);
CREATE INDEX idx_node_version_node   ON node_version(node_id);
CREATE INDEX idx_node_version_state  ON node_version(lifecycle_state_id);
CREATE INDEX idx_node_version_tx     ON node_version(tx_id);
CREATE INDEX idx_node_version_fp     ON node_version(fingerprint);
CREATE INDEX idx_link_source         ON node_version_link(source_node_version_id);
CREATE INDEX idx_link_target_self    ON node_version_link(target_source_id, target_type, target_key);
CREATE INDEX idx_baseline_entry      ON baseline_entry(baseline_id);
CREATE INDEX idx_signature_node      ON node_signature(node_id);
CREATE INDEX idx_signature_version   ON node_signature(node_version_id);
CREATE INDEX idx_event_outbox_ts     ON event_outbox(created_at);
CREATE INDEX idx_comment_node        ON node_version_comment(node_id);
CREATE INDEX idx_comment_version     ON node_version_comment(node_version_id);
CREATE INDEX idx_nvd_version         ON node_version_domain(node_version_id);
CREATE INDEX idx_nvd_domain          ON node_version_domain(domain_id);
CREATE INDEX idx_algorithm_stat_window_start ON algorithm_stat_window(window_start);
