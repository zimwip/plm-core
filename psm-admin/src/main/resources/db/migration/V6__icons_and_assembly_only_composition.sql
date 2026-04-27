-- ============================================================
-- V6 — Meaningful icons + Assembly-only composition
--
-- Icons must match the frontend's NODE_ICONS map (PascalCase
-- lucide-react export names). The lowercase values seeded in V5
-- silently render as nothing.
--
-- composed_of is now Assembly -> Assembly: a Part can neither
-- own children nor be a child in the structure tree. Demo uses
-- Assembly throughout the BOM; Part stays available for atomic
-- items outside the structure (documentation references, etc.).
-- ============================================================

UPDATE node_type SET icon = 'FileText' WHERE id = 'nt-document';
UPDATE node_type SET icon = 'Cog'      WHERE id = 'nt-part';
UPDATE node_type SET icon = 'Blocks'   WHERE id = 'nt-assembly';

UPDATE link_type
   SET target_node_type_id = 'nt-assembly',
       description         = 'Assembly -> Assembly composition'
 WHERE id = 'lt-composed-of';
