CREATE TABLE event_outbox (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    payload     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_outbox_ts ON event_outbox(created_at);
