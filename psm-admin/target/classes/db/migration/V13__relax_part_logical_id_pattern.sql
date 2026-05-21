-- V13: Relax logical_id_pattern for nt-part / nt-assembly to accept real STEP part numbers.
-- Old pattern P-\d{6} was too restrictive; STEP part numbers follow no fixed convention.
-- New pattern: starts with alphanumeric, then allows alphanumeric + space/hyphen/dot/underscore.
-- Existing P-XXXXXX logical IDs still match.
UPDATE node_type
   SET logical_id_pattern = '[A-Za-z0-9][A-Za-z0-9 \-_.]*'
 WHERE id IN ('nt-part', 'nt-assembly');
