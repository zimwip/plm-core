-- ============================================================
-- PNO (People & Organisation) SCHEMA
--
-- Net state after all migrations V1–V21:
--   V3:  project_space.parent_id
--   V4:  project_space_service_tag, project_space.isolated
--   V7:  permission, old authorization_policy (renamed + dropped in V9/V14 — not here)
--   V8:  permission_scope, permission_scope_key, permission_scope_value_source, event_outbox
--   V9:  authorization_policy (new shape), authorization_policy_key
--   V16: permission.service_code
--   V19: user_kv
--   V20: basket_item
--
-- In PostgreSQL these live in the 'pno' schema.
-- In H2 dev mode they live in the default PUBLIC schema.
-- ============================================================

CREATE TABLE pno_role (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pno_role_name UNIQUE (name)
);

CREATE TABLE pno_user (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    username     VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    email        VARCHAR(255),
    active       SMALLINT     NOT NULL DEFAULT 1,
    is_admin     SMALLINT     NOT NULL DEFAULT 0,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pno_username UNIQUE (username)
);

CREATE TABLE project_space (
    id          VARCHAR(36)   NOT NULL PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    description VARCHAR(1000),
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active      SMALLINT      NOT NULL DEFAULT 1,
    parent_id   VARCHAR(36)   REFERENCES project_space(id),
    isolated    SMALLINT               DEFAULT 0,
    CONSTRAINT uq_project_space_name UNIQUE (name)
);

-- Roles are scoped to a project space.
CREATE TABLE user_role (
    id               VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id          VARCHAR(36) NOT NULL REFERENCES pno_user(id),
    role_id          VARCHAR(36) NOT NULL REFERENCES pno_role(id),
    project_space_id VARCHAR(36) NOT NULL REFERENCES project_space(id),
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id, project_space_id)
);

-- Maps a project space to a service routing tag: "for service X, use instances tagged Y".
CREATE TABLE project_space_service_tag (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    project_space_id VARCHAR(36)  NOT NULL,
    service_code     VARCHAR(100) NOT NULL,
    tag_value        VARCHAR(100) NOT NULL,
    CONSTRAINT psst_project_space_fkey FOREIGN KEY (project_space_id) REFERENCES project_space(id),
    CONSTRAINT psst_unique UNIQUE (project_space_id, service_code, tag_value)
);

-- ============================================================
-- PERMISSION CATALOG
-- service_code: which service owns/enforces this permission.
-- ============================================================

CREATE TABLE permission (
    permission_code  VARCHAR(100) NOT NULL PRIMARY KEY,
    scope            VARCHAR(20)  NOT NULL,
    display_name     VARCHAR(200) NOT NULL,
    description      VARCHAR(1000),
    display_order    INT          NOT NULL DEFAULT 0,
    service_code     VARCHAR(50)
);

-- ============================================================
-- DYNAMIC PERMISSION SCOPE REGISTRY (V8)
-- ============================================================

CREATE TABLE permission_scope (
    scope_code        VARCHAR(64)  NOT NULL PRIMARY KEY,
    parent_scope_code VARCHAR(64)  REFERENCES permission_scope(scope_code),
    description       VARCHAR(500),
    -- SHA-256 of canonical scope shape; runtime registration overwrites backfill markers.
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

-- ============================================================
-- EVENT OUTBOX (V8)
-- ============================================================

CREATE TABLE event_outbox (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    payload     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- AUTHORIZATION POLICY (shape-agnostic, V9)
-- Old authorization_policy (V7) was renamed in V9 and dropped in V14 — excluded.
-- ============================================================

CREATE TABLE authorization_policy (
    id               VARCHAR(100) NOT NULL PRIMARY KEY,
    permission_code  VARCHAR(100) NOT NULL REFERENCES permission(permission_code),
    scope_code       VARCHAR(64)  NOT NULL REFERENCES permission_scope(scope_code),
    role_id          VARCHAR(36)  NOT NULL REFERENCES pno_role(id),
    project_space_id VARCHAR(36)  NOT NULL REFERENCES project_space(id),
    keys_fingerprint CHAR(64)     NOT NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_authorization_policy UNIQUE (permission_code, scope_code, role_id, project_space_id, keys_fingerprint)
);

CREATE TABLE authorization_policy_key (
    policy_id  VARCHAR(100) NOT NULL REFERENCES authorization_policy(id) ON DELETE CASCADE,
    key_name   VARCHAR(64)  NOT NULL,
    key_value  VARCHAR(255) NOT NULL,
    PRIMARY KEY (policy_id, key_name)
);

-- ============================================================
-- USER KEY-VALUE STORE (V19)
-- ps_id='' for user-global entries; project-space id for scoped entries.
-- ============================================================

CREATE TABLE user_kv (
    id          VARCHAR(36)   NOT NULL,
    user_id     VARCHAR(36)   NOT NULL REFERENCES pno_user(id),
    ps_id       VARCHAR(36)   NOT NULL DEFAULT '',
    group_name  VARCHAR(64)   NOT NULL,
    kv_key      VARCHAR(256)  NOT NULL,
    kv_value    VARCHAR(1024) NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_kv_pkey PRIMARY KEY (id),
    CONSTRAINT user_kv_unique UNIQUE (user_id, ps_id, group_name, kv_key, kv_value)
);

-- ============================================================
-- BASKET (V20)
-- ============================================================

CREATE TABLE basket_item (
    id          VARCHAR(36)   NOT NULL,
    user_id     VARCHAR(36)   NOT NULL REFERENCES pno_user(id),
    ps_id       VARCHAR(36)   NOT NULL,
    source      VARCHAR(64)   NOT NULL,
    type_code   VARCHAR(256)  NOT NULL,
    item_id     VARCHAR(1024) NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT basket_item_pkey PRIMARY KEY (id),
    CONSTRAINT basket_item_unique UNIQUE (user_id, ps_id, source, type_code, item_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_user_role_user         ON user_role(user_id);
CREATE INDEX idx_user_role_role         ON user_role(role_id);
CREATE INDEX idx_user_role_space        ON user_role(project_space_id);
CREATE INDEX idx_project_space_parent   ON project_space(parent_id);
CREATE INDEX idx_psst_project_space     ON project_space_service_tag(project_space_id);
CREATE INDEX idx_pvs_scope_key          ON permission_scope_value_source(scope_code, key_name);
CREATE INDEX idx_event_outbox_ts        ON event_outbox(created_at);
CREATE INDEX idx_apk_kv                 ON authorization_policy_key(key_name, key_value);
CREATE INDEX idx_ap_role_perm           ON authorization_policy(role_id, permission_code);
CREATE INDEX idx_ap_ps_role             ON authorization_policy(project_space_id, role_id);
CREATE INDEX idx_ap_scope               ON authorization_policy(scope_code);
CREATE INDEX idx_user_kv_lookup         ON user_kv(user_id, ps_id, group_name, kv_key);
CREATE INDEX idx_basket_item_lookup     ON basket_item(user_id, ps_id);
