-- ============================================================
-- V4 — link_type_cascade: composite cascade key + transition reference
--
-- The cascade rule is fully transition-based on both sides:
--   when the parent fires parent_transition_id
--   AND the child is currently in child_from_state_id
--   → fire child_transition_id on the child
--
-- Keying on the parent transition (rather than the resulting state) is
-- consistent with the child side and unambiguous when multiple transitions
-- lead to the same state.
--
-- Children whose current state does not match any child_from_state_id rule
-- are silently skipped (e.g. a Released child during a Freeze cascade).
--
-- No data migration needed: link_type_cascade has no seed rows in V2.
-- ============================================================

DROP TABLE link_type_cascade;

CREATE TABLE link_type_cascade (
    id                    VARCHAR(36)  NOT NULL PRIMARY KEY,
    link_type_id          VARCHAR(36)  NOT NULL REFERENCES link_type(id),
    parent_transition_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    child_from_state_id   VARCHAR(36)  NOT NULL REFERENCES lifecycle_state(id),
    child_transition_id   VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    UNIQUE (link_type_id, parent_transition_id, child_from_state_id)
);

CREATE INDEX idx_ltc_link_type          ON link_type_cascade(link_type_id);
CREATE INDEX idx_ltc_parent_transition  ON link_type_cascade(parent_transition_id);
CREATE INDEX idx_ltc_child_state        ON link_type_cascade(child_from_state_id);

-- ============================================================
-- Cascade rules seed data
-- ============================================================

-- composed_of: freezing a Part cascades to In-Work sub-parts via tr-freeze
INSERT INTO link_type_cascade (id, link_type_id, parent_transition_id, child_from_state_id, child_transition_id) VALUES
  ('ltc-composed-freeze', 'lt-composed-of', 'tr-freeze', 'st-inwork', 'tr-freeze');
