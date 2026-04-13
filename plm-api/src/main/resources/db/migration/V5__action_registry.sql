-- ============================================================
-- V5 — Action Registry
-- Actions as first-class citizens: catalogued, parametrized,
-- permission-controlled, and extensible without code changes.
--
-- Design:
--   node_action             = global catalog (built-in + custom)
--   node_action_parameter   = parameter schema per action
--   node_type_action        = which actions are enabled per node type
--                             (TRANSITION rows have a transition_id FK)
--   node_action_permission  = role-based access per node_type_action
--                             (replaces can_sign / can_create_link /
--                              can_baseline / can_transition flags)
--   node_action_param_override = per-node-type param customization
-- ============================================================

-- ============================================================
-- DDL
-- ============================================================

CREATE TABLE node_action (
    id               VARCHAR(100)  NOT NULL PRIMARY KEY,
    -- Stable machine code — used in handler dispatch and serialization
    action_code      VARCHAR(100)  NOT NULL,
    -- BUILTIN = platform handler; CUSTOM = developer-registered bean
    action_kind      VARCHAR(20)   NOT NULL DEFAULT 'BUILTIN',
    display_name     VARCHAR(200)  NOT NULL,
    description      VARCHAR(1000),
    -- Spring bean name implementing ActionHandler
    handler_ref      VARCHAR(200)  NOT NULL,
    -- PRIMARY | SECONDARY | DANGEROUS
    display_category VARCHAR(20)   NOT NULL DEFAULT 'PRIMARY',
    -- 1 = action requires an open PLM transaction
    requires_tx      SMALLINT      NOT NULL DEFAULT 0,
    -- 1 = auto-enabled for every node type (BUILTIN only)
    is_default       SMALLINT      NOT NULL DEFAULT 0,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_action_code UNIQUE (action_code)
);

CREATE TABLE node_action_parameter (
    id               VARCHAR(100)  NOT NULL PRIMARY KEY,
    action_id        VARCHAR(100)  NOT NULL REFERENCES node_action(id),
    param_name       VARCHAR(100)  NOT NULL,   -- machine key (JSON body key)
    param_label      VARCHAR(200)  NOT NULL,   -- UI label
    -- STRING | NUMBER | BOOLEAN | ENUM | NODE_REF
    data_type        VARCHAR(50)   NOT NULL DEFAULT 'STRING',
    required         SMALLINT      NOT NULL DEFAULT 0,
    default_value    VARCHAR(1000),
    allowed_values   VARCHAR(2000),            -- JSON array for ENUM
    -- TEXT | TEXTAREA | DROPDOWN | CHECKBOX
    widget_type      VARCHAR(50)   NOT NULL DEFAULT 'TEXT',
    validation_regex VARCHAR(500),
    min_value        VARCHAR(50),
    max_value        VARCHAR(50),
    -- UI_VISIBLE | HIDDEN
    visibility       VARCHAR(20)   NOT NULL DEFAULT 'UI_VISIBLE',
    display_order    INT           NOT NULL DEFAULT 0,
    tooltip          VARCHAR(500),
    CONSTRAINT uq_action_param UNIQUE (action_id, param_name)
);

-- Bridge: enabled actions per node type.
-- For TRANSITION actions, transition_id is non-null and identifies the specific transition.
-- For all other built-in actions, transition_id is null.
CREATE TABLE node_type_action (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_id          VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    action_id             VARCHAR(100) NOT NULL REFERENCES node_action(id),
    -- ENABLED | DISABLED
    status                VARCHAR(20)  NOT NULL DEFAULT 'ENABLED',
    -- Optional per-node-type display name override
    display_name_override VARCHAR(200),
    -- Non-null only for TRANSITION actions
    transition_id         VARCHAR(36)  REFERENCES lifecycle_transition(id),
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_nodetype_action UNIQUE (node_type_id, action_id, transition_id)
);

-- Unified action-level access control.
-- Zero rows for a node_type_action_id = open to all roles (consistent with
-- the existing transition_permission open-by-default semantics).
-- One or more rows = explicit allowlist.
CREATE TABLE node_action_permission (
    id                  VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_action_id VARCHAR(100) NOT NULL REFERENCES node_type_action(id),
    role_id             VARCHAR(36)  NOT NULL REFERENCES plm_role(id),
    -- NULL = permission applies regardless of lifecycle state
    lifecycle_state_id  VARCHAR(36)  REFERENCES lifecycle_state(id),
    CONSTRAINT uq_nap UNIQUE (node_type_action_id, role_id, lifecycle_state_id)
);

-- Per-node-type parameter overrides (e.g. restrict SIGN meanings for a node type)
CREATE TABLE node_action_param_override (
    id                  VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_action_id VARCHAR(100) NOT NULL REFERENCES node_type_action(id),
    parameter_id        VARCHAR(100) NOT NULL REFERENCES node_action_parameter(id),
    default_value       VARCHAR(1000),
    allowed_values      VARCHAR(2000),
    required            SMALLINT,
    CONSTRAINT uq_napo UNIQUE (node_type_action_id, parameter_id)
);

CREATE INDEX idx_nta_nodetype    ON node_type_action(node_type_id);
CREATE INDEX idx_nta_action      ON node_type_action(action_id);
CREATE INDEX idx_nta_transition  ON node_type_action(transition_id);
CREATE INDEX idx_nap_nta         ON node_action_permission(node_type_action_id);
CREATE INDEX idx_nap_role        ON node_action_permission(role_id);
CREATE INDEX idx_nap_state       ON node_action_permission(lifecycle_state_id);
CREATE INDEX idx_napar_action    ON node_action_parameter(action_id);
CREATE INDEX idx_napov_nta       ON node_action_param_override(node_type_action_id);

-- ============================================================
-- SEED: built-in action catalog
-- ============================================================

INSERT INTO node_action (id, action_code, action_kind, display_name, description, handler_ref, display_category, requires_tx, is_default) VALUES
  ('act-checkout',    'CHECKOUT',    'BUILTIN', 'Checkout',       'Open a node for editing',             'checkoutActionHandler',    'SECONDARY', 0, 1),
  ('act-transition',  'TRANSITION',  'BUILTIN', 'Transition',     'Apply a lifecycle state transition',  'transitionActionHandler',  'PRIMARY',   1, 0),
  ('act-sign',        'SIGN',        'BUILTIN', 'Sign',           'Record an electronic signature',      'signActionHandler',        'PRIMARY',   1, 1),
  ('act-create-link', 'CREATE_LINK', 'BUILTIN', 'Create Link',    'Add a link to another node',          'createLinkActionHandler',  'SECONDARY', 1, 1),
  ('act-baseline',    'BASELINE',    'BUILTIN', 'Create Baseline','Tag a frozen tree as a baseline',     'baselineActionHandler',    'SECONDARY', 0, 1);

-- Parameters for SIGN
INSERT INTO node_action_parameter (id, action_id, param_name, param_label, data_type, required, default_value, allowed_values, widget_type, display_order) VALUES
  ('nap-sign-meaning', 'act-sign', 'meaning', 'Meaning', 'ENUM',   1, 'Reviewed', '["Reviewed","Approved","Verified","Acknowledged"]', 'DROPDOWN', 1),
  ('nap-sign-comment', 'act-sign', 'comment', 'Comment', 'STRING', 0, NULL,       NULL,                                                 'TEXTAREA', 2);

-- Parameters for BASELINE
INSERT INTO node_action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-bl-name', 'act-baseline', 'name',        'Baseline Name', 'STRING', 1, 'TEXT',     1),
  ('nap-bl-desc', 'act-baseline', 'description', 'Description',   'STRING', 0, 'TEXTAREA', 2);

-- Parameters for CREATE_LINK
INSERT INTO node_action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-lnk-type',   'act-create-link', 'linkTypeId',   'Link Type',   'ENUM',     1, 'DROPDOWN', 1),
  ('nap-lnk-target', 'act-create-link', 'targetNodeId', 'Target Node', 'NODE_REF', 1, 'DROPDOWN', 2),
  ('nap-lnk-lid',    'act-create-link', 'linkLogicalId','Link ID',     'STRING',   1, 'TEXT',     3);

-- ============================================================
-- DATA MIGRATION: auto-register existing transitions
-- Each lifecycle_transition becomes a node_type_action row
-- for each node type that uses the transition's lifecycle.
-- ============================================================

INSERT INTO node_type_action (id, node_type_id, action_id, status, transition_id, display_order)
SELECT
    'nta-tr-' || lt.id || '-' || nt.id,
    nt.id,
    'act-transition',
    'ENABLED',
    lt.id,
    0
FROM lifecycle_transition lt
JOIN node_type nt ON nt.lifecycle_id = lt.lifecycle_id;

-- ============================================================
-- DATA MIGRATION: register default-on built-in actions
-- for all existing node types
-- ============================================================

INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order)
SELECT 'nta-co-' || id, id, 'act-checkout',    'ENABLED', 100 FROM node_type;

INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order)
SELECT 'nta-sg-' || id, id, 'act-sign',        'ENABLED', 200 FROM node_type;

INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order)
SELECT 'nta-cl-' || id, id, 'act-create-link', 'ENABLED', 300 FROM node_type;

INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order)
SELECT 'nta-bl-' || id, id, 'act-baseline',    'ENABLED', 400 FROM node_type;

-- ============================================================
-- DATA MIGRATION: transition_permission → node_action_permission
-- ============================================================

INSERT INTO node_action_permission (id, node_type_action_id, role_id, lifecycle_state_id)
SELECT
    'nap-migr-' || tp.id || '-' || nta.id,
    nta.id,
    tp.role_id,
    NULL
FROM transition_permission tp
JOIN node_type_action nta ON nta.transition_id = tp.transition_id;

-- ============================================================
-- DATA MIGRATION: can_sign → node_action_permission
-- ============================================================

INSERT INTO node_action_permission (id, node_type_action_id, role_id, lifecycle_state_id)
SELECT
    'nap-sign-' || ntp.id,
    nta.id,
    ntp.role_id,
    NULL
FROM node_type_permission ntp
JOIN node_type_action nta ON nta.node_type_id = ntp.node_type_id
                          AND nta.action_id = 'act-sign'
WHERE ntp.can_sign = 1;

-- DATA MIGRATION: can_create_link → node_action_permission
INSERT INTO node_action_permission (id, node_type_action_id, role_id, lifecycle_state_id)
SELECT
    'nap-link-' || ntp.id,
    nta.id,
    ntp.role_id,
    NULL
FROM node_type_permission ntp
JOIN node_type_action nta ON nta.node_type_id = ntp.node_type_id
                          AND nta.action_id = 'act-create-link'
WHERE ntp.can_create_link = 1;

-- DATA MIGRATION: can_baseline → node_action_permission
INSERT INTO node_action_permission (id, node_type_action_id, role_id, lifecycle_state_id)
SELECT
    'nap-bl-' || ntp.id,
    nta.id,
    ntp.role_id,
    NULL
FROM node_type_permission ntp
JOIN node_type_action nta ON nta.node_type_id = ntp.node_type_id
                          AND nta.action_id = 'act-baseline'
WHERE ntp.can_baseline = 1;

-- ============================================================
-- DEPRECATION NOTE
-- node_type_permission.can_sign / can_create_link / can_baseline / can_transition
-- are superseded by node_action_permission and retained only for backward
-- compatibility. can_read and can_write remain authoritative.
-- Scheduled for removal in a future migration.
-- ============================================================
