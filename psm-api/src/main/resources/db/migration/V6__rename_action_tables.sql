-- ============================================================
-- V6: Rename node_action* tables to action*
--
-- node_action            → action
-- node_action_parameter  → action_parameter
-- node_action_param_override → action_param_override
--
-- H2 RENAME TO automatically updates FK constraint references
-- in other tables. The constraint definitions in node_type_action
-- and action_permission are updated transparently.
-- ============================================================

ALTER TABLE node_action_param_override RENAME TO action_param_override;
ALTER TABLE node_action_parameter      RENAME TO action_parameter;
ALTER TABLE node_action                RENAME TO action;
