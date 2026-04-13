-- ============================================================
-- PNO (People & Organisation) SCHEMA
-- Tables: pno_role, pno_user, user_role, project_space
--
-- In PostgreSQL these live in the 'pno' schema (Flyway sets search_path).
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

CREATE INDEX idx_user_role_user  ON user_role(user_id);
CREATE INDEX idx_user_role_role  ON user_role(role_id);
CREATE INDEX idx_user_role_space ON user_role(project_space_id);
