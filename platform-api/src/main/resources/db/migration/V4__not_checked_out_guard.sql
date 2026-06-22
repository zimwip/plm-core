-- Lifecycle guard: not_checked_out — blocks a transition (e.g. Freeze) on a node that still
-- has an open (uncommitted) transaction. Mirrors the all_required_filled lifecycle guard.
-- psm-api auto-registers this bean at startup (alg-psm-c-not-checked-out / ainst-psm-c-not-checked-out);
-- this migration pre-seeds it so the instance exists regardless of boot ordering.
-- ON CONFLICT DO NOTHING — auto-registration is master afterwards.

INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES
  ('alg-psm-c-not-checked-out', 'psm', 'algtype-lifecycle-guard', 'not_checked_out', 'Not Checked Out', 'not_checked_out', 'node')
ON CONFLICT (service_code, code) DO NOTHING;

INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES
  ('ainst-psm-c-not-checked-out', 'psm', 'alg-psm-c-not-checked-out', 'Not Checked Out')
ON CONFLICT (service_code, name) DO NOTHING;
