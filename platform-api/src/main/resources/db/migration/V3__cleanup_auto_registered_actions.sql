-- Remove action rows that were auto-created during service registration with
-- incorrect scope/displayCategory/displayOrder defaults. Algorithm and
-- algorithm_instance rows are kept (they are correct). Action rows must be
-- populated via an explicit seed migration with proper metadata.
DELETE FROM action WHERE id LIKE 'act-%';
