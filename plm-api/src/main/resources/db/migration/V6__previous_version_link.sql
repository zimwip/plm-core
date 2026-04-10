-- ============================================================
-- V6 — Traceability link between node versions
-- ============================================================
-- Adds a self-referencing FK so each version records which
-- version it was derived from.  Used at commit time to detect
-- no-op checkouts (OPEN version identical to its predecessor).

ALTER TABLE node_version
    ADD COLUMN previous_version_id VARCHAR(36)
        REFERENCES node_version(id);
