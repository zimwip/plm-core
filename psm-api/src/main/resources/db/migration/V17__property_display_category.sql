-- ============================================================
-- Move assign/unassign domain actions to PROPERTY display category.
-- Frontend renders PROPERTY actions in the Properties tab.
-- ============================================================

UPDATE action SET display_category = 'PROPERTY'
WHERE action_code IN ('assign_domain', 'unassign_domain');
