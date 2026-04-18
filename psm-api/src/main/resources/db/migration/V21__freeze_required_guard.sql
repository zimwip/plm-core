-- Attach AllRequiredFilledGuard to the Freeze transition.
-- BLOCK effect: action is visible but disabled with violation message
-- when required attributes are missing.
INSERT INTO lifecycle_transition_guard (id, lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES
  ('ltg-freeze-required', 'tr-freeze', 'gi-all-required', 'BLOCK', 1);
