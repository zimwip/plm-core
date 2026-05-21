-- DATA_LOCAL source is non-versioned (is_versioned=0) but lt-part-data
-- was seeded with VERSION_TO_VERSION in V2. SourceService.update() blocks
-- editing the source while this inconsistency exists. Change to VERSION_TO_MASTER
-- which is the correct policy for a non-versioned source.
UPDATE link_type
SET link_policy = 'VERSION_TO_MASTER'
WHERE id = 'lt-part-data'
  AND link_policy = 'VERSION_TO_VERSION';
