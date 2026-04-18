-- ============================================================
-- V17 — Comment threading + remove act-comment from action dispatcher
-- ============================================================

-- Add threading support
ALTER TABLE node_version_comment ADD COLUMN parent_comment_id VARCHAR(36);
ALTER TABLE node_version_comment ADD COLUMN attribute_name    VARCHAR(100);

ALTER TABLE node_version_comment ADD CONSTRAINT nvc_parent_fkey
  FOREIGN KEY (parent_comment_id) REFERENCES node_version_comment(id);

-- Remove act-comment: comments now use direct REST endpoint, not action dispatcher
DELETE FROM action_permission WHERE action_id = 'act-comment';
DELETE FROM node_type_action  WHERE action_id = 'act-comment';
DELETE FROM action_parameter  WHERE action_id = 'act-comment';
DELETE FROM action            WHERE id        = 'act-comment';
