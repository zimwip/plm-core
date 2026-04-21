package com.plm.algorithm.internal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Periodically flushes in-memory algorithm execution statistics to the
 * {@code algorithm_stat} table (all-time) and {@code algorithm_stat_window}
 * table (15-minute buckets). Runs every 60 seconds.
 *
 * The flush is additive: in-memory counters are drained (reset to zero)
 * and merged into the DB row using SQL aggregation (call_count += delta,
 * min = LEAST(min, delta_min), etc.). This way the DB accumulates all-time
 * stats while the in-memory counters stay small.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlgorithmStatsService {

    private static final int WINDOW_MINUTES = 15;
    private static final int RETENTION_HOURS = 48;

    private final DSLContext dsl;

    /**
     * Flush every 60 seconds. Drains in-memory counters and merges into DB.
     */
    @Scheduled(fixedDelay = 60_000, initialDelay = 60_000)
    public void flush() {
        Map<String, AlgorithmStats> all = AlgorithmStats.all();
        if (all.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = truncateToWindow(now);

        int flushed = 0;
        for (Map.Entry<String, AlgorithmStats> entry : all.entrySet()) {
            String code = entry.getKey();
            AlgorithmStats.Snapshot snap = entry.getValue().drainAndReset();
            if (snap.callCount() == 0) continue;

            // ── All-time stats ──
            int updated = dsl.execute("""
                UPDATE algorithm_stat
                SET call_count   = call_count + ?,
                    total_ns     = total_ns + ?,
                    min_ns       = LEAST(min_ns, ?),
                    max_ns       = GREATEST(max_ns, ?),
                    last_flushed = ?
                WHERE algorithm_code = ?
                """, snap.callCount(), snap.totalNanos(), snap.minNanos(),
                     snap.maxNanos(), now, code);

            if (updated == 0) {
                dsl.execute("""
                    INSERT INTO algorithm_stat (algorithm_code, call_count, total_ns, min_ns, max_ns, last_flushed)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, code, snap.callCount(), snap.totalNanos(), snap.minNanos(),
                         snap.maxNanos(), now);
            }

            // ── Windowed stats (15-min bucket) ──
            int wUpdated = dsl.execute("""
                UPDATE algorithm_stat_window
                SET call_count = call_count + ?,
                    total_ns   = total_ns + ?,
                    min_ns     = LEAST(min_ns, ?),
                    max_ns     = GREATEST(max_ns, ?)
                WHERE algorithm_code = ? AND window_start = ?
                """, snap.callCount(), snap.totalNanos(), snap.minNanos(),
                     snap.maxNanos(), code, windowStart);

            if (wUpdated == 0) {
                dsl.execute("""
                    INSERT INTO algorithm_stat_window (algorithm_code, window_start, call_count, total_ns, min_ns, max_ns)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, code, windowStart, snap.callCount(), snap.totalNanos(),
                         snap.minNanos(), snap.maxNanos());
            }

            flushed++;
        }

        if (flushed > 0) {
            log.debug("Algorithm stats flushed: {} algorithms updated", flushed);
        }

        // Purge old windows beyond retention
        dsl.execute("DELETE FROM algorithm_stat_window WHERE window_start < ?",
                     now.minusHours(RETENTION_HOURS));
    }

    /**
     * Returns persisted stats from DB (all-time accumulated).
     * Merges with current in-memory stats for a complete picture.
     */
    public List<Map<String, Object>> getPersistedStats() {
        // Load DB stats
        Map<String, Map<String, Object>> dbStats = new LinkedHashMap<>();
        dsl.select().from("algorithm_stat").orderBy(org.jooq.impl.DSL.field("algorithm_code")).fetch()
            .forEach(r -> {
                String code = r.get("algorithm_code", String.class);
                long count  = r.get("call_count", Long.class);
                long total  = r.get("total_ns",   Long.class);
                long min    = r.get("min_ns",     Long.class);
                long max    = r.get("max_ns",     Long.class);
                dbStats.put(code, buildStatsMap(code, count, total, min, max,
                    r.get("last_flushed").toString()));
            });

        // Merge current in-memory (not yet flushed)
        AlgorithmStats.all().forEach((code, stats) -> {
            long memCount = stats.getCallCount();
            if (memCount == 0) return;

            Map<String, Object> existing = dbStats.get(code);
            if (existing != null) {
                long dbCount = ((Number) existing.get("callCount")).longValue();
                double dbTotal = (Double) existing.get("totalMs");
                double dbMin   = (Double) existing.get("minMs");
                double dbMax   = (Double) existing.get("maxMs");

                long totalCount = dbCount + memCount;
                double totalMs  = dbTotal + stats.getTotalNanos() / 1_000_000.0;
                double minMs    = Math.min(dbMin, stats.getMinNanos() / 1_000_000.0);
                double maxMs    = Math.max(dbMax, stats.getMaxNanos() / 1_000_000.0);
                double avgMs    = totalCount > 0 ? totalMs / totalCount : 0;

                existing.put("callCount", totalCount);
                existing.put("totalMs", totalMs);
                existing.put("minMs", minMs);
                existing.put("maxMs", maxMs);
                existing.put("avgMs", avgMs);
                existing.put("pendingFlush", memCount);
            } else {
                var snap = stats.snapshot();
                var m = new LinkedHashMap<>(snap);
                m.put("algorithmCode", code);
                m.put("lastFlushed", "pending");
                m.put("pendingFlush", memCount);
                dbStats.put(code, m);
            }
        });

        return List.copyOf(dbStats.values());
    }

    /**
     * Returns windowed time-series stats for the last N hours.
     * Each entry: { windowStart, algorithmCode, callCount, totalMs, avgMs, minMs, maxMs }
     */
    public List<Map<String, Object>> getTimeseries(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<Map<String, Object>> result = new ArrayList<>();

        dsl.select().from("algorithm_stat_window")
           .where(org.jooq.impl.DSL.field("window_start").greaterOrEqual(since))
           .orderBy(org.jooq.impl.DSL.field("window_start"),
                    org.jooq.impl.DSL.field("algorithm_code"))
           .fetch()
           .forEach(r -> {
               String code   = r.get("algorithm_code", String.class);
               long count    = r.get("call_count", Long.class);
               long totalNs  = r.get("total_ns", Long.class);
               long minNs    = r.get("min_ns", Long.class);
               long maxNs    = r.get("max_ns", Long.class);
               String window = r.get("window_start").toString();

               var m = new LinkedHashMap<String, Object>();
               m.put("windowStart", window);
               m.put("algorithmCode", code);
               m.put("callCount", count);
               m.put("totalMs", totalNs / 1_000_000.0);
               m.put("avgMs", count > 0 ? (totalNs / 1_000_000.0) / count : 0.0);
               m.put("minMs", minNs / 1_000_000.0);
               m.put("maxMs", maxNs / 1_000_000.0);
               result.add(m);
           });

        return result;
    }

    /** Resets both in-memory and DB stats (all-time + windowed). */
    public void resetAll() {
        AlgorithmStats.resetAll();
        dsl.execute("DELETE FROM algorithm_stat");
        dsl.execute("DELETE FROM algorithm_stat_window");
        log.info("Algorithm stats reset (memory + DB + windows)");
    }

    private Map<String, Object> buildStatsMap(String code, long count, long totalNs,
                                               long minNs, long maxNs, String lastFlushed) {
        double totalMs = totalNs / 1_000_000.0;
        double avgMs = count > 0 ? totalMs / count : 0;
        var m = new LinkedHashMap<String, Object>();
        m.put("algorithmCode", code);
        m.put("callCount", count);
        m.put("totalMs", totalMs);
        m.put("minMs", minNs / 1_000_000.0);
        m.put("maxMs", maxNs / 1_000_000.0);
        m.put("avgMs", avgMs);
        m.put("lastFlushed", lastFlushed);
        m.put("pendingFlush", 0L);
        return m;
    }

    /** Truncate datetime to the nearest 15-minute window floor. */
    private static LocalDateTime truncateToWindow(LocalDateTime dt) {
        LocalDateTime hourStart = dt.truncatedTo(ChronoUnit.HOURS);
        int minuteBucket = (dt.getMinute() / WINDOW_MINUTES) * WINDOW_MINUTES;
        return hourStart.plusMinutes(minuteBucket);
    }
}
