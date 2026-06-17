-- ============================================================
-- Personal access tokens (app passwords) — used as the Basic-auth
-- password by WebDAV clients on /api/dav. Only the SHA-256 hash of
-- the token is stored; the plaintext is shown once at creation.
-- ============================================================

CREATE TABLE user_access_token (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    user_id      VARCHAR(36)  NOT NULL,
    token_hash   VARCHAR(64)  NOT NULL,
    label        VARCHAR(100),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at   TIMESTAMP,
    last_used_at TIMESTAMP,
    revoked      SMALLINT     NOT NULL DEFAULT 0,
    CONSTRAINT user_access_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES pno_user(id),
    CONSTRAINT uq_user_access_token_hash UNIQUE (token_hash)
);

CREATE INDEX idx_user_access_token_user ON user_access_token(user_id);
