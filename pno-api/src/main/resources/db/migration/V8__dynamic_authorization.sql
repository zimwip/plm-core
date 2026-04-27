-- ============================================================
-- V8 — Dynamic permission scope registry (PR1 of authz refactor)
-- ============================================================
--
-- Introduces the central registry for scope definitions contributed by services
-- at boot. The legacy authorization_policy table is renamed; PR5 (V9/V10) will
-- replace it with a shape-agnostic schema.
--
-- This migration also adds event_outbox + index so pno-api can publish
-- authorization events with the same at-least-once guarantee psm-api uses.
-- ============================================================

CREATE TABLE permission_scope (
    scope_code        VARCHAR(64)  NOT NULL PRIMARY KEY,
    parent_scope_code VARCHAR(64)  REFERENCES permission_scope(scope_code),
    description       VARCHAR(500),
    -- SHA-256 of canonical scope shape (parent + ordered keys + sorted value sources).
    -- Conflicting redefinition by another service triggers 409 at registration.
    definition_hash   CHAR(64)     NOT NULL,
    owner_service     VARCHAR(64)  NOT NULL,
    registered_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permission_scope_key (
    scope_code   VARCHAR(64) NOT NULL REFERENCES permission_scope(scope_code) ON DELETE CASCADE,
    key_position INT         NOT NULL,
    key_name     VARCHAR(64) NOT NULL,
    description  VARCHAR(500),
    PRIMARY KEY (scope_code, key_position),
    CONSTRAINT uq_permission_scope_key_name UNIQUE (scope_code, key_name)
);

CREATE TABLE permission_scope_value_source (
    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
    scope_code    VARCHAR(64)  NOT NULL REFERENCES permission_scope(scope_code) ON DELETE CASCADE,
    key_name      VARCHAR(64)  NOT NULL,
    service_code  VARCHAR(64)  NOT NULL,
    endpoint_path VARCHAR(500) NOT NULL,
    instance_id   VARCHAR(64),
    last_seen_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pvs_scope_key_svc UNIQUE (scope_code, key_name, service_code)
);

CREATE INDEX idx_pvs_scope_key ON permission_scope_value_source (scope_code, key_name);

-- ============================================================
-- EVENT OUTBOX (mirrors psm-api/V1)
-- ============================================================

CREATE TABLE event_outbox (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    payload     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_outbox_ts ON event_outbox (created_at);

-- The existing authorization_policy table is preserved as-is here.
-- PR5 (V9/V10) renames it to authorization_policy_legacy and migrates rows
-- to the shape-agnostic schema.
