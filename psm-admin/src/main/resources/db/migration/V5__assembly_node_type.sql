-- ============================================================
-- V5 — Assembly node type, icons & colors, composition rewrite
--
-- Changes:
--   * adds nt-assembly as a child of nt-part (inherits attributes,
--     same lifecycle, same logical_id pattern so existing P-NNNNNN
--     identifiers stay valid for both types)
--   * gives every node type an icon + color for the frontend chip
--   * moves composed_of source to nt-assembly so plain Parts can no
--     longer be composition roots; nt-part as target still matches
--     nt-assembly via the parent_node_type_id walk
--   * release transition now requires reviewer + designer signatures
--     (replaces the previous reviewer + admin pair)
-- ============================================================

-- ── Icons + colors on existing types ─────────────────────────
UPDATE node_type SET icon = 'file-text', color = '#6366f1' WHERE id = 'nt-document';
UPDATE node_type SET icon = 'cog',       color = '#10b981' WHERE id = 'nt-part';

-- ── New Assembly type, inherits Part ─────────────────────────
INSERT INTO node_type
  (id, name, description, lifecycle_id, logical_id_label, logical_id_pattern,
   color, icon, parent_node_type_id) VALUES
  ('nt-assembly', 'Assembly',
   'Composed assembly of Parts and sub-Assemblies (inherits Part)',
   'lc-standard', 'Assembly Number', 'P-\d{6}',
   '#f97316', 'layers', 'nt-part');

-- ── Move composed_of source from Part → Assembly ─────────────
-- Source restricted to Assembly; target stays nt-part so Assemblies
-- (descendants of Part) still match as targets via inheritance walk.
UPDATE link_type
   SET source_node_type_id = 'nt-assembly',
       description         = 'Assembly -> Part/Assembly composition'
 WHERE id = 'lt-composed-of';

-- ── Release signature requirement: reviewer + designer ───────
UPDATE signature_requirement
   SET role_required = 'role-designer'
 WHERE id = 'sr-rel-02';
