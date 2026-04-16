-- V4: Replace guard_expr='all_signatures_done' with signature_requirement rows
-- The guard is now implicit: transitions with signature_requirement rows
-- require COUNT(distinct signers) >= COUNT(requirements) before proceeding.

UPDATE lifecycle_transition SET guard_expr = NULL WHERE id = 'tr-release';

INSERT INTO signature_requirement (id, lifecycle_transition_id, role_required, display_order) VALUES
  ('sr-rel-01', 'tr-release', 'role-reviewer', 10),
  ('sr-rel-02', 'tr-release', 'role-admin',    20);
