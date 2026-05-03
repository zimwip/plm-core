-- lifecycle_transition_guard moved back to psm-admin (psm-admin V6).
-- psm-admin owns this table: it has proper FK to lifecycle_transition
-- and is part of admin config, not platform cross-cutting config.
DROP TABLE IF EXISTS lifecycle_transition_guard;
