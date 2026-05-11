-- Generic per-user key/value store.
-- ps_id = '' for user-global entries (e.g. UI_PREF), project-space id for scoped entries (e.g. BASKET).
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

CREATE INDEX idx_user_kv_lookup ON user_kv (user_id, ps_id, group_name, kv_key);
