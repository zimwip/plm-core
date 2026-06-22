-- Attach the not_checked_out lifecycle guard to the Freeze transition (BLOCK).
-- A node (or any cascade child) that is still checked out — i.e. has a version in an open
-- transaction — cannot be frozen; it must be checked in first.
-- algorithm_instance_id is a soft reference to platform-api (ainst-psm-c-* convention).

INSERT INTO lifecycle_transition_guard (lifecycle_transition_id, algorithm_instance_id, effect, display_order)
VALUES ('tr-freeze', 'ainst-psm-c-not-checked-out', 'BLOCK', 2)
ON CONFLICT (lifecycle_transition_id, algorithm_instance_id) DO NOTHING;
