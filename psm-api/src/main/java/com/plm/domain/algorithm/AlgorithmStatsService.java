package com.plm.domain.algorithm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Periodically flushes in-memory algorithm execution statistics to the
 * {@code algorithm_stat} table. Runs every 60 seconds.
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

    private final DSLContext dsl;

    /**
     * Flush every 60 seconds. Drains in-memory counters and merges into DB.
     */
    @Scheduled(fixedDelay = 60_000, initialDelay = 60_000)
    public void flush() {
        Map<String, AlgorithmStats> all = AlgorithmStats.all();
        if (all.isEmpty()) return;

        int flushed = 0;
        for (Map.Entry<String, AlgorithmStats> entry : all.entrySet()) {
            String code = entry.getKey();
            AlgorithmStats.Snapshot snap = entry.getValue().drainAndReset();
            if (snap.callCount() == 0) continue;

            // MERGE pattern: upsert with aggregation
            int updated = dsl.execute("""
                UPDATE algorithm_stat
                SET call_count   = call_count + ?,
                    total_ns     = total_ns + ?,
                    min_ns       = LEAST(min_ns, ?),
                    max_ns       = GREATEST(max_ns, ?),
                    last_flushed = ?
                WHERE algorithm_code = ?
                """, snap.callCount(), snap.totalNanos(), snap.minNanos(),
                     snap.maxNanos(), LocalDateTime.now(), code);

            if (updated == 0) {
                dsl.execute("""
                    INSERT INTO algorithm_stat (algorithm_code, call_count, total_ns, min_ns, max_ns, last_flushed)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, code, snap.callCount(), snap.totalNanos(), snap.minNanos(),
                         snap.maxNanos(), LocalDateTime.now());
            }
            flushed++;
        }

        if (flushed > 0) {
            log.debug("Algorithm stats flushed: {} algorithms updated", flushed);
        }
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

    /** Resets both in-memory and DB stats. */
    public void resetAll() {
        AlgorithmStats.resetAll();
        dsl.execute("DELETE FROM algorithm_stat");
        log.info("Algorithm stats reset (memory + DB)");
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
}
