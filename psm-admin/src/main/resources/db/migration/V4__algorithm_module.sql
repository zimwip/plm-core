-- ============================================================
-- Algorithm registration metadata
-- Module + domain are pushed by psm-api at startup via
-- POST /internal/algorithms/register. Until registration runs
-- they remain NULL — frontend falls back to "unknown".
-- ============================================================

ALTER TABLE algorithm ADD COLUMN module_name VARCHAR(100);
ALTER TABLE algorithm ADD COLUMN domain_name VARCHAR(100);
