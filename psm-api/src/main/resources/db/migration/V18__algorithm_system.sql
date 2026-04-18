-- V18: Algorithm system + Guard framework
-- Introduces a generic algorithm registry where guards are a specific algorithm type.
-- Guards replace hardcoded checks in ActionService and the old TransitionGuard system.

-- ============================================================
-- ALGORITHM FRAMEWORK (generic, reusable for future types)
-- ============================================================

CREATE TABLE algorithm_type (
    id              VARCHAR(100)  NOT NULL PRIMARY KEY,
    name            VARCHAR(200)  NOT NULL,
    description     VARCHAR(1000),
    java_interface  VARCHAR(500)  NOT NULL
);

CREATE TABLE algorithm (
    id                VARCHAR(100)  NOT NULL PRIMARY KEY,
    algorithm_type_id VARCHAR(100)  NOT NULL REFERENCES algorithm_type(id),
    code              VARCHAR(100)  NOT NULL,
    name              VARCHAR(200)  NOT NULL,
    description       VARCHAR(1000),
    handler_ref       VARCHAR(500)  NOT NULL,
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_algorithm_code UNIQUE (code)
);

CREATE TABLE algorithm_parameter (
    id            VARCHAR(100)  NOT NULL PRIMARY KEY,
    algorithm_id  VARCHAR(100)  NOT NULL REFERENCES algorithm(id),
    param_name    VARCHAR(100)  NOT NULL,
    param_label   VARCHAR(200)  NOT NULL,
    data_type     VARCHAR(50)   NOT NULL DEFAULT 'STRING',
    required      SMALLINT      NOT NULL DEFAULT 0,
    default_value VARCHAR(1000),
    display_order INT           NOT NULL DEFAULT 0,
    CONSTRAINT uq_algo_param UNIQUE (algorithm_id, param_name)
);

CREATE TABLE algorithm_instance (
    id           VARCHAR(100) NOT NULL PRIMARY KEY,
    algorithm_id VARCHAR(100) NOT NULL REFERENCES algorithm(id),
    name         VARCHAR(200),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE algorithm_instance_param_value (
    id                     VARCHAR(100)  NOT NULL PRIMARY KEY,
    algorithm_instance_id  VARCHAR(100)  NOT NULL REFERENCES algorithm_instance(id),
    algorithm_parameter_id VARCHAR(100)  NOT NULL REFERENCES algorithm_parameter(id),
    value                  VARCHAR(2000) NOT NULL,
    CONSTRAINT uq_aipv UNIQUE (algorithm_instance_id, algorithm_parameter_id)
);

-- ============================================================
-- GUARD ATTACHMENT TABLES
-- ============================================================

-- Guards attached to action (global level — all node types)
CREATE TABLE action_guard (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    action_id             VARCHAR(100) NOT NULL REFERENCES action(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    effect                VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_action_guard UNIQUE (action_id, algorithm_instance_id)
);

-- Guards attached to node_type_action (per node type — inherit + override)
CREATE TABLE node_type_action_guard (
    id                    VARCHAR(100) NOT NULL PRIMARY KEY,
    node_type_action_id   VARCHAR(100) NOT NULL REFERENCES node_type_action(id),
    algorithm_instance_id VARCHAR(100) NOT NULL REFERENCES algorithm_instance(id),
    effect                VARCHAR(20)  NOT NULL DEFAULT 'HIDE',
    override_action       VARCHAR(20)  NOT NULL DEFAULT 'ADD',
    display_order         INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_nta_guard UNIQUE (node_type_action_id, algorithm_instance_id)
);

-- Indexes for guard resolution
CREATE INDEX idx_action_guard_action     ON action_guard(action_id);
CREATE INDEX idx_nta_guard_nta           ON node_type_action_guard(node_type_action_id);
CREATE INDEX idx_algo_instance_algo      ON algorithm_instance(algorithm_id);

-- ============================================================
-- SEED: Algorithm types
-- ============================================================

INSERT INTO algorithm_type (id, name, description, java_interface) VALUES
  ('algtype-action-guard',    'Action Guard',    'Checks node/action state preconditions (frozen, locked, ownership)',       'com.plm.domain.guard.Guard'),
  ('algtype-lifecycle-guard', 'Lifecycle Guard', 'Checks lifecycle transition preconditions (required fields, signatures)', 'com.plm.domain.guard.Guard');

-- ============================================================
-- SEED: Guard algorithms
-- ============================================================

-- Action Guards (node/action state checks)
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-not-frozen',          'algtype-action-guard', 'not_frozen',               'Not Frozen',               'Node must not be in a frozen lifecycle state',                'notFrozenGuard'),
  ('alg-not-locked',          'algtype-action-guard', 'not_locked',               'Not Locked',               'Node must not be locked by any user',                         'notLockedGuard'),
  ('alg-lock-owner-required', 'algtype-action-guard', 'lock_owner_required',      'Lock Owner Required',      'Current user must own the lock on this node',                 'lockOwnerRequiredGuard'),
  ('alg-from-state-match',    'algtype-action-guard', 'from_state_match',         'From State Match',         'Node must be in the transition source state',                 'fromStateMatchGuard'),
  ('alg-not-already-signed',  'algtype-action-guard', 'not_already_signed',       'Not Already Signed',       'User must not have already signed current revision.iteration','notAlreadySignedGuard'),
  ('alg-has-sig-requirement', 'algtype-action-guard', 'has_signature_requirement','Has Signature Requirement','At least one outgoing transition requires signatures',        'hasSignatureRequirementGuard');

-- Lifecycle Guards (transition precondition checks)
INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES
  ('alg-all-required-filled', 'algtype-lifecycle-guard', 'all_required_filled', 'All Required Filled', 'All required attributes for target state must have values', 'allRequiredFilledGuard'),
  ('alg-all-signatures-done', 'algtype-lifecycle-guard', 'all_signatures_done', 'All Signatures Done', 'All required signatures must be collected',                 'allSignaturesDoneGuard');

-- ============================================================
-- SEED: Algorithm instances (one per guard, no parameters yet)
-- ============================================================

INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES
  ('gi-not-frozen',         'alg-not-frozen',          'Not Frozen'),
  ('gi-not-locked',         'alg-not-locked',          'Not Locked'),
  ('gi-lock-owner',         'alg-lock-owner-required', 'Lock Owner Required'),
  ('gi-from-state',         'alg-from-state-match',    'From State Match'),
  ('gi-not-already-signed', 'alg-not-already-signed',  'Not Already Signed'),
  ('gi-has-sig-req',        'alg-has-sig-requirement', 'Has Signature Requirement'),
  ('gi-all-required',       'alg-all-required-filled', 'All Required Filled'),
  ('gi-all-signatures',     'alg-all-signatures-done', 'All Signatures Done');

-- ============================================================
-- SEED: Action-level guard attachments
-- ============================================================

-- CHECKOUT: not_frozen, not_locked
INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES
  ('ag-checkout-frozen', 'act-checkout', 'gi-not-frozen', 'HIDE', 1),
  ('ag-checkout-locked', 'act-checkout', 'gi-not-locked', 'HIDE', 2);

-- CHECKIN, UPDATE_NODE, CREATE_LINK, UPDATE_LINK, DELETE_LINK: lock_owner_required
INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES
  ('ag-checkin-owner',  'act-checkin',     'gi-lock-owner', 'HIDE', 1),
  ('ag-update-owner',   'act-update-node', 'gi-lock-owner', 'HIDE', 1),
  ('ag-clink-owner',    'act-create-link', 'gi-lock-owner', 'HIDE', 1),
  ('ag-ulink-owner',    'act-update-link', 'gi-lock-owner', 'HIDE', 1),
  ('ag-dlink-owner',    'act-delete-link', 'gi-lock-owner', 'HIDE', 1);

-- TRANSITION: from_state_match, not_locked
INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES
  ('ag-trans-state',  'act-transition', 'gi-from-state', 'HIDE', 1),
  ('ag-trans-locked', 'act-transition', 'gi-not-locked', 'HIDE', 2);

-- SIGN: has_signature_requirement, not_already_signed
INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES
  ('ag-sign-req',     'act-sign', 'gi-has-sig-req',        'HIDE', 1),
  ('ag-sign-already', 'act-sign', 'gi-not-already-signed', 'HIDE', 2);

-- ============================================================
-- SEED: NTA-level guard attachments (lifecycle guards on transitions)
-- ============================================================

-- tr-release (Document + Part): all_signatures_done (BLOCK)
INSERT INTO node_type_action_guard (id, node_type_action_id, algorithm_instance_id, effect, override_action, display_order) VALUES
  ('ntag-release-sig-doc', 'nta-tr-release-doc', 'gi-all-signatures', 'BLOCK', 'ADD', 1),
  ('ntag-release-sig-prt', 'nta-tr-release-prt', 'gi-all-signatures', 'BLOCK', 'ADD', 1);

-- tr-freeze (Document + Part): all_required_filled (BLOCK)
-- Only if the transition had guard_expr='all_required_filled' in the original seed
-- Check: V2 seed has guard_expr=NULL for tr-freeze, so no lifecycle guard here
-- But tests in PlmIntegrationTest use guard_expr='all_required_filled' on their own transitions
