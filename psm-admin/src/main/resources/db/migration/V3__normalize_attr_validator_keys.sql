-- Normalize legacy attribute-validator "all states" attachment keys.
--
-- The all-states sentinel in AttributeValidatorAdminService changed from "_" to
-- "*" (a "_" sentinel collides with the "__" separator). Rows written before the
-- change are stored as  "_" + "__" + <instanceId> = "___<instanceId>".
-- The settings UI splits on the first "__", so those rows yield an instanceId
-- with a stray leading underscore: the validator name no longer resolves (shows
-- the raw code) and detach rebuilds a "*__" key that never matches the stored
-- "___" key. Rewrite legacy keys to the current "*__" form.
UPDATE entity_metadata
SET meta_key = '*' || SUBSTRING(meta_key FROM 2)
WHERE target_type = 'ATTR_VALIDATOR'
  AND meta_key LIKE '#_#_#_%' ESCAPE '#';
