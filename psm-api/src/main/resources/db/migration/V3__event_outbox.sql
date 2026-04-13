-- Transactional outbox for PLM events.
-- Events are written atomically with the business operation, then
-- picked up by OutboxPoller and sent via WebSocket before being deleted.
CREATE TABLE event_outbox (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    payload     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_outbox_created_at ON event_outbox (created_at);
