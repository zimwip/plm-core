-- ============================================================
-- V5: Unified action catalog
--
-- DESIGN
--   node_action is the single action catalog for all action types.
--   A new `scope` column drives which context is required for the
--   permission check:
--
--     GLOBAL    — permission by (action_id, project_space_id, role_id)
--                 No node context. Used for admin/config operations
--                 (metamodel, roles, baselines).
--
--     NODE      — permission by (action_id, node_type_id,
--                 project_space_id, role_id).
--                 Standard node-level actions (checkout, update, etc.).
--
--     LIFECYCLE — permission by (action_id, node_type_id,
--                 transition_id, project_space_id, role_id).
--                 Actions scoped to a specific lifecycle transition.
--                 transition_id = NULL in a permission row means the
--                 row applies to any execution of that action.
--
-- CONSOLIDATION
--   action_permission replaces both node_action_permission and the
--   separate global_action / global_action_permission tables.
--   node_type_id and transition_id are nullable; they are interpreted
--   according to the action's scope (see above).
-- ============================================================

-- ── 1. Add scope to the action catalog ───────────────────────

ALTER TABLE node_action ADD COLUMN scope VARCHAR(20) NOT NULL DEFAULT 'NODE';

-- Transitions require the specific lifecycle_transition for fine-grained
-- per-transition permission (multiple transitions can leave the same state).
UPDATE node_action SET scope = 'LIFECYCLE' WHERE id = 'act-transition';

-- ── 2. Register global actions in the action catalog ─────────

-- handler_ref is not used for GLOBAL scope actions (they never go through
-- ActionDispatcher). Value '_global' acts as a sentinel.
INSERT INTO node_action (id, action_code, action_kind, scope, display_name, description,
                         handler_ref, display_category, requires_tx, is_default) VALUES
  ('act-manage-metamodel', 'MANAGE_METAMODEL', 'BUILTIN', 'GLOBAL',
   'Manage Metamodel',
   'Create/update/delete lifecycle, node types, link types, attribute definitions',
   '_global', 'STRUCTURAL', 0, 0),
  ('act-manage-roles', 'MANAGE_ROLES', 'BUILTIN', 'GLOBAL',
   'Manage Roles & Permissions',
   'Configure action permissions, views, and view overrides',
   '_global', 'STRUCTURAL', 0, 0),
  ('act-manage-baselines', 'MANAGE_BASELINES', 'BUILTIN', 'GLOBAL',
   'Manage Baselines',
   'Create baselines (service-level, outside action dispatch)',
   '_global', 'STRUCTURAL', 0, 0);

-- ── 3. Create the unified action_permission table ─────────────
--
-- node_type_id  : NULL for GLOBAL-scope actions.
-- transition_id : NULL for NODE-scope actions, and for LIFECYCLE rows
--                 that apply to any transition of the action type.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE action_permission (
    id               VARCHAR(100) NOT NULL,
    action_id        VARCHAR(100) NOT NULL,
    project_space_id VARCHAR(36)  NOT NULL,
    role_id          VARCHAR(36)  NOT NULL,
    node_type_id     VARCHAR(36),
    transition_id    VARCHAR(36),
    CONSTRAINT pk_action_permission  PRIMARY KEY (id),
    CONSTRAINT fk_ap_action          FOREIGN KEY (action_id) REFERENCES node_action(id),
    CONSTRAINT uq_action_permission  UNIQUE (action_id, project_space_id, role_id,
                                             node_type_id, transition_id)
);

CREATE INDEX idx_ap_action    ON action_permission(action_id);
CREATE INDEX idx_ap_nodetype  ON action_permission(node_type_id);
CREATE INDEX idx_ap_role      ON action_permission(role_id);

-- ── 4. Migrate existing NODE-scope permissions ────────────────
--
-- Copy all non-transition permissions from node_action_permission.
-- transition_id stays NULL (these are node-scope, not lifecycle-scope).
-- ─────────────────────────────────────────────────────────────

INSERT INTO action_permission (id, action_id, project_space_id, role_id, node_type_id, transition_id)
SELECT id, action_id, project_space_id, role_id, node_type_id, NULL
FROM node_action_permission
WHERE action_id != 'act-transition';

-- ── 5. Seed LIFECYCLE-scope permissions (per transition) ──────
--
-- Old model: one row per (node_type, action, from_state).
-- New model: one row per (node_type, action, transition).
-- This allows different roles for each transition even when
-- they share the same from_state (e.g. Release vs Unfreeze).
--
-- Permission mapping:
--   tr-freeze   — DESIGNER + ADMIN  (from st-inwork, only one transition)
--   tr-unfreeze — ADMIN only        (admin reverts frozen; reviewer sees but can't)
--   tr-release  — REVIEWER + ADMIN  (reviewer approves the release)
--   tr-revise   — DESIGNER + ADMIN  (open new iteration from released)
--   tr-obsolete — ADMIN only        (admin marks end-of-life)
-- ─────────────────────────────────────────────────────────────

INSERT INTO action_permission (id, action_id, project_space_id, role_id, node_type_id, transition_id) VALUES
  -- ── Document ──────────────────────────────────────────────
  ('ap-tr-d-doc-freeze',   'act-transition', 'ps-default', 'role-designer', 'nt-document', 'tr-freeze'),
  ('ap-tr-a-doc-freeze',   'act-transition', 'ps-default', 'role-admin',    'nt-document', 'tr-freeze'),
  ('ap-tr-a-doc-unfreeze', 'act-transition', 'ps-default', 'role-admin',    'nt-document', 'tr-unfreeze'),
  ('ap-tr-r-doc-release',  'act-transition', 'ps-default', 'role-reviewer', 'nt-document', 'tr-release'),
  ('ap-tr-a-doc-release',  'act-transition', 'ps-default', 'role-admin',    'nt-document', 'tr-release'),
  ('ap-tr-d-doc-revise',   'act-transition', 'ps-default', 'role-designer', 'nt-document', 'tr-revise'),
  ('ap-tr-a-doc-revise',   'act-transition', 'ps-default', 'role-admin',    'nt-document', 'tr-revise'),
  ('ap-tr-a-doc-obsolete', 'act-transition', 'ps-default', 'role-admin',    'nt-document', 'tr-obsolete'),
  -- ── Part ──────────────────────────────────────────────────
  ('ap-tr-d-prt-freeze',   'act-transition', 'ps-default', 'role-designer', 'nt-part', 'tr-freeze'),
  ('ap-tr-a-prt-freeze',   'act-transition', 'ps-default', 'role-admin',    'nt-part', 'tr-freeze'),
  ('ap-tr-a-prt-unfreeze', 'act-transition', 'ps-default', 'role-admin',    'nt-part', 'tr-unfreeze'),
  ('ap-tr-r-prt-release',  'act-transition', 'ps-default', 'role-reviewer', 'nt-part', 'tr-release'),
  ('ap-tr-a-prt-release',  'act-transition', 'ps-default', 'role-admin',    'nt-part', 'tr-release'),
  ('ap-tr-d-prt-revise',   'act-transition', 'ps-default', 'role-designer', 'nt-part', 'tr-revise'),
  ('ap-tr-a-prt-revise',   'act-transition', 'ps-default', 'role-admin',    'nt-part', 'tr-revise'),
  ('ap-tr-a-prt-obsolete', 'act-transition', 'ps-default', 'role-admin',    'nt-part', 'tr-obsolete');

-- ── 6. Seed GLOBAL-scope permissions ──────────────────────────
--
-- Zero rows for a GLOBAL action = open to all (permissive default).
-- The three admin operations are restricted to role-admin.
-- ─────────────────────────────────────────────────────────────

INSERT INTO action_permission (id, action_id, project_space_id, role_id, node_type_id, transition_id) VALUES
  ('ap-gl-mm-admin', 'act-manage-metamodel', 'ps-default', 'role-admin', NULL, NULL),
  ('ap-gl-rl-admin', 'act-manage-roles',     'ps-default', 'role-admin', NULL, NULL),
  ('ap-gl-bl-admin', 'act-manage-baselines', 'ps-default', 'role-admin', NULL, NULL);

-- ── 7. Drop superseded tables ─────────────────────────────────

DROP TABLE node_action_permission;
