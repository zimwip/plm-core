-- ============================================================
-- V7 — composed_of target widened back to nt-part
--
-- V6 tightened the target to nt-assembly, which made it impossible
-- to link a leaf Part into the BOM tree. Restore target = nt-part
-- so both Parts (own match) and Assemblies (descendant via
-- parent_node_type_id walk) are valid composition children.
--
-- Source stays nt-assembly: only Assemblies own a structure.
-- ============================================================

UPDATE link_type
   SET target_node_type_id = 'nt-part',
       description         = 'Assembly -> Part/Assembly composition'
 WHERE id = 'lt-composed-of';
