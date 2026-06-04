-- Drop attribute-validator attachments that reference the removed Enum Attribute
-- Validator (platform-api V3 deletes the algorithm itself). Enum validation is
-- intrinsic to the attribute's enum_definition / allowedValues, so these
-- attachments are meaningless (the instance has no backing bean anyway).
-- meta_key form: <stateId|*>__<instanceId> ; match keys ending with the enum instance.
DELETE FROM entity_metadata
WHERE target_type = 'ATTR_VALIDATOR'
  AND meta_key LIKE '%ainst-psm-c-enum-attribute-validator';
