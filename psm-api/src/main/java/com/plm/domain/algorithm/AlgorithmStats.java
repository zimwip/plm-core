package com.plm.domain.algorithm;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

/**
 * Collects per-algorithm execution statistics in memory.
 * Thread-safe — uses atomic operations for concurrent updates.
 *
 * Periodically flushed to the {@code algorithm_stat} table by
 * {@link AlgorithmStatsService}.
 */
public class AlgorithmStats {

    private final LongAdder  callCount = new LongAdder();
    private final LongAdder  totalNanos = new LongAdder();
    private final AtomicLong minNanos = new AtomicLong(Long.MAX_VALUE);
    private final AtomicLong maxNanos = new AtomicLong(0);

    public void record(long durationNanos) {
        callCount.increment();
        totalNanos.add(durationNanos);
        minNanos.accumulateAndGet(durationNanos, Math::min);
        maxNanos.accumulateAndGet(durationNanos, Math::max);
    }

    public long getCallCount()  { return callCount.sum(); }
    public long getTotalNanos() { return totalNanos.sum(); }
    public long getMinNanos()   { return callCount.sum() > 0 ? minNanos.get() : 0; }
    public long getMaxNanos()   { return maxNanos.get(); }

    /** Resets counters and returns the snapshot before reset (for flush-and-clear). */
    public Snapshot drainAndReset() {
        long count = callCount.sumThenReset();
        long total = totalNanos.sumThenReset();
        long min   = count > 0 ? minNanos.getAndSet(Long.MAX_VALUE) : 0;
        long max   = maxNanos.getAndSet(0);
        return new Snapshot(count, total, min, max);
    }

    public Map<String, Object> snapshot() {
        long count = callCount.sum();
        long total = totalNanos.sum();
        long min   = count > 0 ? minNanos.get() : 0;
        long max   = maxNanos.get();
        double avg = count > 0 ? (double) total / count : 0;
        return Map.of(
            "callCount", count,
            "totalMs",   total / 1_000_000.0,
            "minMs",     min / 1_000_000.0,
            "maxMs",     max / 1_000_000.0,
            "avgMs",     avg / 1_000_000.0
        );
    }

    public record Snapshot(long callCount, long totalNanos, long minNanos, long maxNanos) {}

    // ── Global registry ──

    private static final ConcurrentHashMap<String, AlgorithmStats> REGISTRY = new ConcurrentHashMap<>();

    public static AlgorithmStats forCode(String code) {
        return REGISTRY.computeIfAbsent(code, k -> new AlgorithmStats());
    }

    public static Map<String, AlgorithmStats> all() {
        return REGISTRY;
    }

    public static Map<String, Map<String, Object>> allSnapshots() {
        Map<String, Map<String, Object>> result = new ConcurrentHashMap<>();
        REGISTRY.forEach((code, stats) -> result.put(code, stats.snapshot()));
        return result;
    }

    public static void resetAll() {
        REGISTRY.clear();
    }
}
