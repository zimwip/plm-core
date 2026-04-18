-- ============================================================
-- V16 — Comment system + Sign meaning cleanup
-- ============================================================

-- Fix SIGN meaning: Approved | Rejected only
UPDATE action_parameter
SET default_value  = 'Approved',
    allowed_values = '["Approved","Rejected"]'
WHERE id = 'nap-sign-meaning';

-- ── Comment table ────────────────────────────────────────────
CREATE TABLE node_version_comment (
    id                  VARCHAR(36)   NOT NULL PRIMARY KEY,
    node_id             VARCHAR(36)   NOT NULL REFERENCES node(id),
    node_version_id     VARCHAR(36)   NOT NULL REFERENCES node_version(id),
    author              VARCHAR(100)  NOT NULL,
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    text                TEXT          NOT NULL,
    version_fingerprint VARCHAR(64)           -- SHA-256 of version at comment time (tamper evidence)
);

CREATE INDEX idx_comment_node    ON node_version_comment(node_id);
CREATE INDEX idx_comment_version ON node_version_comment(node_version_id);

-- ── COMMENT action ───────────────────────────────────────────
INSERT INTO action (id, action_code, action_kind, scope, display_name, description, handler_ref, display_category, requires_tx, is_default) VALUES
  ('act-comment', 'COMMENT', 'BUILTIN', 'NODE', 'Add Comment', 'Post a comment on the current committed version', 'commentActionHandler', 'PRIMARY', 0, 1);

INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, widget_type, display_order) VALUES
  ('nap-cmt-text', 'act-comment', 'text', 'Comment', 'STRING', 1, 'TEXTAREA', 1);

INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order) VALUES
  ('nta-cmt-doc', 'nt-document', 'act-comment', 'ENABLED', 210),
  ('nta-cmt-prt', 'nt-part',     'act-comment', 'ENABLED', 210);

-- Permissions: DESIGNER + REVIEWER can comment
INSERT INTO action_permission (id, action_id, project_space_id, role_id, node_type_id, transition_id) VALUES
  ('nap-cmt-d-doc', 'act-comment', 'ps-default', 'role-designer', 'nt-document', NULL),
  ('nap-cmt-d-prt', 'act-comment', 'ps-default', 'role-designer', 'nt-part',     NULL),
  ('nap-cmt-r-doc', 'act-comment', 'ps-default', 'role-reviewer', 'nt-document', NULL),
  ('nap-cmt-r-prt', 'act-comment', 'ps-default', 'role-reviewer', 'nt-part',     NULL);
