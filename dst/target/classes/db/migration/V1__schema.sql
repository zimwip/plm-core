-- ============================================================
-- DST (Data Store) SCHEMA
--
-- One row per stored binary. The file itself lives outside the
-- database on a local volume (or future S3 bucket) at the path
-- recorded in `location`. UUIDs are minted by the service.
-- ============================================================

CREATE TABLE data_object (
    id               VARCHAR(36)   NOT NULL PRIMARY KEY,
    sha256           VARCHAR(64)   NOT NULL,
    size_bytes       BIGINT        NOT NULL,
    content_type     VARCHAR(255),
    original_name    VARCHAR(500),
    location         VARCHAR(1000) NOT NULL,
    project_space_id VARCHAR(36),
    ref_count        INTEGER       NOT NULL DEFAULT 1,
    created_by       VARCHAR(100)  NOT NULL,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed    TIMESTAMP,
    CONSTRAINT uq_data_object_sha_ps UNIQUE (sha256, project_space_id)
);

CREATE INDEX idx_data_object_sha    ON data_object(sha256);
CREATE INDEX idx_data_object_author ON data_object(created_by);
CREATE INDEX idx_data_object_ps     ON data_object(project_space_id);

CREATE TABLE event_outbox (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    payload     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_outbox_ts ON event_outbox(created_at);
