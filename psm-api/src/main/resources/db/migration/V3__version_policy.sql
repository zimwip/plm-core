-- ============================================================
-- V3: Add version_policy to node_type
--
-- Determines how the business version number (revision.iteration)
-- is incremented when a node is checked out for content modification.
--
--   NONE    → same revision.iteration (traceability only, no visible change)
--   ITERATE → iteration + 1 (A.1 → A.2)  — default behaviour
--   RELEASE → new revision, iteration reset to 1 (A.x → B.1)
-- ============================================================

ALTER TABLE node_type
    ADD COLUMN version_policy VARCHAR(20) NOT NULL DEFAULT 'ITERATE';
