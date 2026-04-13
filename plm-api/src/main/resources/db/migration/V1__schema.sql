-- ============================================================
-- PLM CORE SCHEMA — Consolidated final schema
-- Covers: core model, signatures, roles/views, project space,
--         fingerprint, lock-on-version, link attributes,
--         link cascades, numbering scheme, state colors.
-- ============================================================

-- ============================================================
-- PROJECT SPACE
-- Segregation context — every node belongs to one project space.
-- ============================================================

CREATE TABLE project_space (
    id          VARCHAR(36)   NOT NULL PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    description VARCHAR(1000),
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active      INTEGER       NOT NULL DEFAULT 1,
    CONSTRAINT uq_project_space_name UNIQUE (name)
);

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
    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle(id),
    name          VARCHAR(100) NOT NULL,
    is_initial    SMALLINT     NOT NULL DEFAULT 0,
    is_frozen     SMALLINT     NOT NULL DEFAULT 0,  -- lock cascade applies
    is_released   SMALLINT     NOT NULL DEFAULT 0,  -- triggers new revision on next checkout
    display_order INT          NOT NULL DEFAULT 0,
    color         VARCHAR(20)                       -- hex color for UI (e.g. '#5b9cf6'), NULL = default
);

CREATE TABLE lifecycle_transition (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_id     VARCHAR(36)  NOT NULL REFERENCES lifecycle(id),
    name             VARCHAR(100) NOT NULL,
    from_state_id    VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    to_state_id      VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    guard_expr       VARCHAR(1000),               -- 'all_required_filled', 'all_signatures_done', ...
    action_type      VARCHAR(100),               -- 'CASCADE_FROZEN', ...
    version_strategy VARCHAR(20)  NOT NULL DEFAULT 'NONE'  -- NONE | ITERATE | REVISE
);

-- ============================================================
-- NODE TYPE META-MODEL
-- ============================================================

CREATE TABLE node_type (
    id                 VARCHAR(36)  NOT NULL PRIMARY KEY,
    name               VARCHAR(255) NOT NULL,
    description        VARCHAR(1000),
    lifecycle_id       VARCHAR(36)  REFERENCES lifecycle(id),
    logical_id_label   VARCHAR(100) DEFAULT 'Identifier',   -- UI label for the logical_id field
    logical_id_pattern VARCHAR(500),                        -- regexp for format validation
    numbering_scheme   VARCHAR(50)  NOT NULL DEFAULT 'ALPHA_NUMERIC',  -- ALPHA_NUMERIC | ...
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attribute_definition (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id    VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    name            VARCHAR(100) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    data_type       VARCHAR(50)  NOT NULL,  -- STRING, NUMBER, DATE, BOOLEAN, ENUM
    required        SMALLINT     NOT NULL DEFAULT 0,
    default_value   VARCHAR(1000),
    naming_regex    VARCHAR(500),
    allowed_values  VARCHAR(2000),          -- JSON array for ENUM
    widget_type     VARCHAR(50),            -- TEXT, TEXTAREA, DROPDOWN, DATE_PICKER, ...
    display_order   INT          NOT NULL DEFAULT 0,
    display_section VARCHAR(100),
    tooltip         VARCHAR(500),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Attribute visibility/editability rules per lifecycle state
CREATE TABLE attribute_state_rule (
    id                      VARCHAR(36) NOT NULL PRIMARY KEY,
    attribute_definition_id VARCHAR(36) NOT NULL REFERENCES attribute_definition(id),
    lifecycle_state_id      VARCHAR(36) NOT NULL REFERENCES lifecycle_state(id),
    required                SMALLINT    NOT NULL DEFAULT 0,
    editable                SMALLINT    NOT NULL DEFAULT 1,
    visible                 SMALLINT    NOT NULL DEFAULT 1
);

-- ============================================================
-- LINK TYPE META-MODEL
-- ============================================================

CREATE TABLE link_type (
    id                  VARCHAR(36)  NOT NULL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    description         VARCHAR(1000),
    source_node_type_id VARCHAR(36)  REFERENCES node_type(id),  -- NULL = any
    target_node_type_id VARCHAR(36)  REFERENCES node_type(id),  -- NULL = any
    link_policy         VARCHAR(20)  NOT NULL DEFAULT 'VERSION_TO_MASTER',  -- VERSION_TO_MASTER | VERSION_TO_VERSION
    min_cardinality     INT          NOT NULL DEFAULT 0,
    max_cardinality     INT,                                     -- NULL = unbounded
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Custom attributes on link instances (e.g. quantity on composed_of)
CREATE TABLE link_type_attribute (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    link_type_id    VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    name            VARCHAR(100) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    data_type       VARCHAR(50)  NOT NULL DEFAULT 'STRING',
    required        SMALLINT     NOT NULL DEFAULT 0,
    default_value   VARCHAR(1000),
    naming_regex    VARCHAR(500),
    allowed_values  VARCHAR(2000),
    widget_type     VARCHAR(50)  DEFAULT 'TEXT',
    display_order   INT          NOT NULL DEFAULT 0,
    display_section VARCHAR(100),
    tooltip         VARCHAR(500),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Per-link-type state cascade rules:
-- when source node enters source_state_id, children are pushed to target_state_id
CREATE TABLE link_type_cascade (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    link_type_id    VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    source_state_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    target_state_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    UNIQUE (link_type_id, source_state_id)
);

-- ============================================================
-- TRANSACTION
-- Every node_version belongs to a transaction.
-- Visibility: OPEN → owner + admins only; COMMITTED → everyone.
-- ============================================================

CREATE TABLE plm_transaction (
    id             VARCHAR(36)   NOT NULL PRIMARY KEY,
    owner_id       VARCHAR(100)  NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'OPEN',  -- OPEN | COMMITTED
    commit_comment VARCHAR(2000),
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    committed_at   TIMESTAMP,
    CONSTRAINT chk_tx_status CHECK (status IN ('OPEN', 'COMMITTED'))
);

CREATE INDEX idx_tx_owner_status ON plm_transaction(owner_id, status);

-- ============================================================
-- NODE MODEL
-- ============================================================

CREATE TABLE node (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id     VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    project_space_id VARCHAR(36)  REFERENCES project_space(id),
    logical_id       VARCHAR(500),          -- stable business identifier (unchanged across revisions)
    external_id      VARCHAR(255),          -- optional external/supplier reference
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL
);

-- Each version captures the full state of a node at a point in time.
-- Lock info (locked_by/locked_at) lives on the OPEN version: non-null = locked.
CREATE TABLE node_version (
    id                  VARCHAR(36)   NOT NULL PRIMARY KEY,
    node_id             VARCHAR(36)   NOT NULL REFERENCES node(id),
    -- Technical identity
    version_number      INT           NOT NULL,
    -- Business identity
    revision            VARCHAR(10)   NOT NULL DEFAULT 'A',   -- A, B, C, ... AA, AB, ...
    iteration           INT           NOT NULL DEFAULT 1,     -- 1, 2, 3, ...
    -- Lifecycle
    lifecycle_state_id  VARCHAR(36)   REFERENCES lifecycle_state(id),
    -- Change classification (audit trail only — does not drive numbering)
    change_type         VARCHAR(50)   NOT NULL DEFAULT 'CONTENT',  -- CONTENT | LIFECYCLE | SIGNATURE
    change_description  VARCHAR(1000),
    -- Transaction (mandatory — no version without a transaction)
    tx_id               VARCHAR(36)   NOT NULL REFERENCES plm_transaction(id),
    -- Version chain
    previous_version_id VARCHAR(36)   REFERENCES node_version(id),
    version_reason      VARCHAR(20)   DEFAULT 'REVISE',        -- DERIVE | REVISE
    -- Content fingerprint (SHA-256 hash of state + attributes + links + signatures)
    fingerprint         VARCHAR(64),
    -- Lock info — non-null means this OPEN version is locked
    locked_by           VARCHAR(100),
    locked_at           TIMESTAMP,
    -- Audit
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(100)  NOT NULL,
    CONSTRAINT uq_node_version UNIQUE (node_id, version_number)
);

CREATE TABLE node_version_attribute (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_version_id  VARCHAR(36)  NOT NULL REFERENCES node_version(id),
    attribute_def_id VARCHAR(36)  NOT NULL REFERENCES attribute_definition(id),
    value            VARCHAR(4000),
    CONSTRAINT uq_node_version_attr UNIQUE (node_version_id, attribute_def_id)
);

-- Links between node versions.
-- The source is always the OPEN node_version that created the link (NOT NULL).
-- The source node is derived via source_node_version_id → node_version.node_id.
-- VERSION_TO_MASTER: pinned_version_id IS NULL — resolves to latest committed version.
-- VERSION_TO_VERSION: pinned_version_id IS NOT NULL — frozen pointer to a specific version.
CREATE TABLE node_version_link (
    id                     VARCHAR(36)  NOT NULL PRIMARY KEY,
    link_type_id           VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    source_node_version_id VARCHAR(36)  NOT NULL REFERENCES node_version(id),
    target_node_id         VARCHAR(36)  NOT NULL REFERENCES node(id),
    pinned_version_id      VARCHAR(36)  REFERENCES node_version(id),   -- non-null = V2V
    created_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by             VARCHAR(100) NOT NULL
);

-- ============================================================
-- SIGNATURES
-- ============================================================

CREATE TABLE node_signature (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_id         VARCHAR(36)  NOT NULL REFERENCES node(id),
    node_version_id VARCHAR(36)  NOT NULL REFERENCES node_version(id),
    signed_by       VARCHAR(100) NOT NULL,
    signed_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    meaning         VARCHAR(100) NOT NULL,  -- Approved, Reviewed, Verified, ...
    comment         VARCHAR(1000)
);

-- Required signatories for a transition guard (all_signatures_done)
CREATE TABLE signature_requirement (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_transition_id VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    role_required           VARCHAR(100) NOT NULL,
    display_order           INT          NOT NULL DEFAULT 0
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

-- Resolves VERSION_TO_MASTER links at baseline tag time → long-term stability
CREATE TABLE baseline_entry (
    id                  VARCHAR(36) NOT NULL PRIMARY KEY,
    baseline_id         VARCHAR(36) NOT NULL REFERENCES baseline(id),
    node_link_id        VARCHAR(36) NOT NULL REFERENCES node_version_link(id),
    resolved_version_id VARCHAR(36) NOT NULL REFERENCES node_version(id)
);

-- ============================================================
-- SECURITY — Roles, Users, Permissions, Views
-- ============================================================

CREATE TABLE plm_role (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_admin    SMALLINT     NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_role_name UNIQUE (name)
);

CREATE TABLE plm_user (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    username     VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    email        VARCHAR(255),
    active       SMALLINT     NOT NULL DEFAULT 1,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_username UNIQUE (username)
);

CREATE TABLE user_role (
    id      VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES plm_user(id),
    role_id VARCHAR(36) NOT NULL REFERENCES plm_role(id),
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

-- What a role can do on a given node type
CREATE TABLE node_type_permission (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    role_id         VARCHAR(36)  NOT NULL REFERENCES plm_role(id),
    node_type_id    VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    can_read        SMALLINT     NOT NULL DEFAULT 1,
    can_write       SMALLINT     NOT NULL DEFAULT 0,
    can_transition  SMALLINT     NOT NULL DEFAULT 0,
    can_sign        SMALLINT     NOT NULL DEFAULT 0,
    can_create_link SMALLINT     NOT NULL DEFAULT 0,
    can_baseline    SMALLINT     NOT NULL DEFAULT 0,
    CONSTRAINT uq_role_nodetype UNIQUE (role_id, node_type_id)
);

-- Attribute views — restrict (never expand) attribute rights per role × state
CREATE TABLE attribute_view (
    id                VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id      VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    name              VARCHAR(100) NOT NULL,
    description       VARCHAR(500),
    eligible_role_id  VARCHAR(36)  REFERENCES plm_role(id),          -- NULL = all roles
    eligible_state_id VARCHAR(36)  REFERENCES lifecycle_state(id),   -- NULL = all states
    priority          INT          NOT NULL DEFAULT 0                 -- higher wins
);

CREATE TABLE view_attribute_override (
    id               VARCHAR(36) NOT NULL PRIMARY KEY,
    view_id          VARCHAR(36) NOT NULL REFERENCES attribute_view(id),
    attribute_def_id VARCHAR(36) NOT NULL REFERENCES attribute_definition(id),
    visible          SMALLINT,       -- NULL = inherit from state rule
    editable         SMALLINT,       -- NULL = inherit; can only restrict, never expand
    display_order    INT,
    display_section  VARCHAR(100),
    CONSTRAINT uq_view_attr UNIQUE (view_id, attribute_def_id)
);

-- Which roles can trigger which lifecycle transitions
CREATE TABLE transition_permission (
    id            VARCHAR(36) NOT NULL PRIMARY KEY,
    transition_id VARCHAR(36) NOT NULL REFERENCES lifecycle_transition(id),
    role_id       VARCHAR(36) NOT NULL REFERENCES plm_role(id),
    CONSTRAINT uq_transition_role UNIQUE (transition_id, role_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_node_project_space   ON node(project_space_id);
CREATE INDEX idx_node_version_node    ON node_version(node_id);
CREATE INDEX idx_node_version_state   ON node_version(lifecycle_state_id);
CREATE INDEX idx_node_version_tx      ON node_version(tx_id);
CREATE INDEX idx_node_version_fp      ON node_version(fingerprint);
CREATE INDEX idx_link_source_version  ON node_version_link(source_node_version_id);
CREATE INDEX idx_link_target          ON node_version_link(target_node_id);
CREATE INDEX idx_attr_def_nodetype    ON attribute_definition(node_type_id);
CREATE INDEX idx_attr_state_rule_attr ON attribute_state_rule(attribute_definition_id);
CREATE INDEX idx_baseline_entry_bl    ON baseline_entry(baseline_id);
CREATE INDEX idx_signature_node       ON node_signature(node_id);
CREATE INDEX idx_signature_version    ON node_signature(node_version_id);
CREATE INDEX idx_sigreq_transition    ON signature_requirement(lifecycle_transition_id);
CREATE INDEX idx_user_role_user       ON user_role(user_id);
CREATE INDEX idx_user_role_role       ON user_role(role_id);
CREATE INDEX idx_ntp_role             ON node_type_permission(role_id);
CREATE INDEX idx_ntp_nodetype         ON node_type_permission(node_type_id);
CREATE INDEX idx_view_nodetype        ON attribute_view(node_type_id);
CREATE INDEX idx_view_role            ON attribute_view(eligible_role_id);
CREATE INDEX idx_vao_view             ON view_attribute_override(view_id);
CREATE INDEX idx_tp_transition        ON transition_permission(transition_id);
CREATE INDEX idx_tp_role              ON transition_permission(role_id);
CREATE INDEX idx_lta_link_type        ON link_type_attribute(link_type_id);
CREATE INDEX idx_ltc_link_type        ON link_type_cascade(link_type_id);
CREATE INDEX idx_ltc_source_state     ON link_type_cascade(source_state_id);
