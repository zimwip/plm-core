-- Adds collapse_history flag to node_type.
-- When true, the REVISE transition deletes intermediate iterations of the
-- just-released revision, keeping only the last one (relabelled iteration=0).
-- Result: history shows A, B, C instead of A.1, A.2, A.3, B.1 …
ALTER TABLE node_type ADD COLUMN collapse_history BOOLEAN NOT NULL DEFAULT FALSE;
