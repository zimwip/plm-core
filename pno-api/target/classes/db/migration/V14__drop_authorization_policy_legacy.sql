-- ============================================================
-- V14 — Drop authorization_policy_legacy
-- ============================================================
-- V9 renamed the original table to authorization_policy_legacy and
-- V10 backfilled rows into the new shape-agnostic schema. The legacy
-- table has no remaining readers — drop it and its dependent indexes.
-- ============================================================

DROP INDEX IF EXISTS idx_ap_role_legacy;
DROP INDEX IF EXISTS idx_ap_scope_legacy;
DROP INDEX IF EXISTS idx_ap_nodetype_legacy;
DROP INDEX IF EXISTS idx_ap_transition_legacy;

DROP TABLE IF EXISTS authorization_policy_legacy;
