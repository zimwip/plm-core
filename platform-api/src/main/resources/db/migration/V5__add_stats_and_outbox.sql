-- ============================================================
-- Algorithm statistics (moved from psm-admin — cross-cutting concern)
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
-- Event outbox — reliable CONFIG_CHANGED delivery to NATS
-- Rows written transactionally with config mutations; OutboxPoller
-- reads + publishes + deletes. Direct NATS publish runs in parallel
-- as best-effort; outbox is the backstop when NATS is unavailable.
-- ============================================================

CREATE TABLE event_outbox (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    payload     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_outbox_ts ON event_outbox(created_at);
