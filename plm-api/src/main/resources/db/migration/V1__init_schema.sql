-- ============================================================
-- PLM CORE SCHEMA - V1
-- ============================================================

-- ============================================================
-- LIFECYCLE META-MODEL
-- ============================================================

CREATE TABLE lifecycle (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lifecycle_state (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_id VARCHAR(36)  NOT NULL REFERENCES lifecycle(id),
    name         VARCHAR(100) NOT NULL,
    is_initial   SMALLINT     NOT NULL DEFAULT 0,
    is_frozen    SMALLINT     NOT NULL DEFAULT 0,  -- frozen = lock cascade
    is_released  SMALLINT     NOT NULL DEFAULT 0,  -- released = nouvelle revision
    display_order INT         NOT NULL DEFAULT 0
);

CREATE TABLE lifecycle_transition (
    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle(id),
    name          VARCHAR(100) NOT NULL,
    from_state_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    to_state_id   VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    guard_expr    VARCHAR(1000),   -- expression de garde (ex: "all_required_filled")
    action_type   VARCHAR(100)     -- CASCADE_FROZEN, REQUIRE_SIGNATURE, etc.
);

-- ============================================================
-- NODE TYPE META-MODEL
-- ============================================================

CREATE TABLE node_type (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    description  VARCHAR(1000),
    lifecycle_id VARCHAR(36)  REFERENCES lifecycle(id),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attribute_definition (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id    VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    name            VARCHAR(100) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    data_type       VARCHAR(50)  NOT NULL, -- STRING, NUMBER, DATE, BOOLEAN, ENUM
    required        SMALLINT     NOT NULL DEFAULT 0,
    default_value   VARCHAR(1000),
    naming_regex    VARCHAR(500),          -- validation naming rule
    allowed_values  VARCHAR(2000),         -- JSON array for ENUM type
    widget_type     VARCHAR(50),           -- TEXT, DROPDOWN, DATE_PICKER, etc.
    display_order   INT          NOT NULL DEFAULT 0,
    display_section VARCHAR(100),
    tooltip         VARCHAR(500),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Règles attribut x état (required/editable selon l'état lifecycle)
CREATE TABLE attribute_state_rule (
    id                    VARCHAR(36) NOT NULL PRIMARY KEY,
    attribute_definition_id VARCHAR(36) NOT NULL REFERENCES attribute_definition(id),
    lifecycle_state_id    VARCHAR(36) NOT NULL REFERENCES lifecycle_state(id),
    required              SMALLINT    NOT NULL DEFAULT 0,
    editable              SMALLINT    NOT NULL DEFAULT 1,
    visible               SMALLINT    NOT NULL DEFAULT 1
);

-- ============================================================
-- LINK TYPE META-MODEL
-- ============================================================

CREATE TABLE link_type (
    id                   VARCHAR(36)  NOT NULL PRIMARY KEY,
    name                 VARCHAR(255) NOT NULL,
    description          VARCHAR(1000),
    source_node_type_id  VARCHAR(36)  REFERENCES node_type(id),  -- NULL = any
    target_node_type_id  VARCHAR(36)  REFERENCES node_type(id),  -- NULL = any
    link_policy          VARCHAR(20)  NOT NULL DEFAULT 'VERSION_TO_MASTER', -- VERSION_TO_MASTER | VERSION_TO_VERSION
    min_cardinality      INT          NOT NULL DEFAULT 0,
    max_cardinality      INT,                                     -- NULL = unbounded
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- NODE MODEL
-- ============================================================

CREATE TABLE node (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by   VARCHAR(100) NOT NULL
);

-- Chaque version capture l'état global du noeud
CREATE TABLE node_version (
    id                  VARCHAR(36)   NOT NULL PRIMARY KEY,
    node_id             VARCHAR(36)   NOT NULL REFERENCES node(id),
    -- Identité technique
    version_number      INT           NOT NULL,                   -- auto-increment par node
    -- Identité métier
    revision            VARCHAR(10)   NOT NULL DEFAULT 'A',       -- A, B, C...
    iteration           INT           NOT NULL DEFAULT 1,         -- 1, 2, 3...
    -- Lifecycle
    lifecycle_state_id  VARCHAR(36)   REFERENCES lifecycle_state(id),
    -- Changement type (pour distinguer contenu vs lifecycle vs signature)
    change_type         VARCHAR(50)   NOT NULL DEFAULT 'CONTENT', -- CONTENT | LIFECYCLE | SIGNATURE
    change_description  VARCHAR(1000),
    -- Audit
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(100)  NOT NULL,
    CONSTRAINT uq_node_version UNIQUE (node_id, version_number)
);

-- Valeurs des attributs custom par version
CREATE TABLE node_version_attribute (
    id              VARCHAR(36)   NOT NULL PRIMARY KEY,
    node_version_id VARCHAR(36)   NOT NULL REFERENCES node_version(id),
    attribute_def_id VARCHAR(36)  NOT NULL REFERENCES attribute_definition(id),
    value           VARCHAR(4000),
    CONSTRAINT uq_node_version_attr UNIQUE (node_version_id, attribute_def_id)
);

-- ============================================================
-- LINK MODEL
-- ============================================================

CREATE TABLE node_link (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    link_type_id     VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    source_node_id   VARCHAR(36)  NOT NULL REFERENCES node(id),
    target_node_id   VARCHAR(36)  NOT NULL REFERENCES node(id),
    -- VERSION_TO_VERSION: pointe une version précise (immuable)
    -- VERSION_TO_MASTER: pinned_version_id est NULL, résolu dynamiquement
    pinned_version_id VARCHAR(36) REFERENCES node_version(id),
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL
);

-- ============================================================
-- LOCK / TRANSACTION
-- ============================================================

CREATE TABLE plm_lock (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_id     VARCHAR(36)  NOT NULL REFERENCES node(id),
    locked_by   VARCHAR(100) NOT NULL,
    locked_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP    NOT NULL,
    tx_id       VARCHAR(36)  NOT NULL,   -- identifiant de la transaction PLM
    CONSTRAINT uq_node_lock UNIQUE (node_id)
);

-- Transaction PLM (regroupe un ensemble de modifications atomiques)
CREATE TABLE plm_transaction (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    initiated_by VARCHAR(100) NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'OPEN',  -- OPEN | COMMITTED | ROLLEDBACK
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at   TIMESTAMP
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

-- Résolution des liens version_to_master au moment du tag
CREATE TABLE baseline_entry (
    id                VARCHAR(36) NOT NULL PRIMARY KEY,
    baseline_id       VARCHAR(36) NOT NULL REFERENCES baseline(id),
    node_link_id      VARCHAR(36) NOT NULL REFERENCES node_link(id),
    resolved_version_id VARCHAR(36) NOT NULL REFERENCES node_version(id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_node_version_node    ON node_version(node_id);
CREATE INDEX idx_node_version_state   ON node_version(lifecycle_state_id);
CREATE INDEX idx_lock_node            ON plm_lock(node_id);
CREATE INDEX idx_lock_tx              ON plm_lock(tx_id);
CREATE INDEX idx_link_source          ON node_link(source_node_id);
CREATE INDEX idx_link_target          ON node_link(target_node_id);
CREATE INDEX idx_attr_def_nodetype    ON attribute_definition(node_type_id);
CREATE INDEX idx_attr_state_rule_attr ON attribute_state_rule(attribute_definition_id);
CREATE INDEX idx_baseline_entry_bl    ON baseline_entry(baseline_id);
