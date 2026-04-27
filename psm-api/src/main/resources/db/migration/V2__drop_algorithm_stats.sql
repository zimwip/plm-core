-- Algorithm execution stats moved to psa via NATS aggregation.
-- psm-api no longer persists stats locally.

DROP INDEX IF EXISTS idx_algorithm_stat_window_start;
DROP TABLE IF EXISTS algorithm_stat_window;
DROP TABLE IF EXISTS algorithm_stat;
