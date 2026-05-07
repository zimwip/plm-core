package com.plm.platform.algorithm;

import com.plm.platform.algorithm.stats.AlgorithmStats;
import com.plm.platform.algorithm.stats.AlgorithmStatsPublisher;
import com.plm.platform.algorithm.stats.AlgorithmStatsPublisher.StatDelta;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Drains in-memory algorithm execution stats every 15 seconds and publishes
 * deltas via NATS to the central aggregator (psa). Publish is fire-and-forget
 * — losing a window is acceptable.
 *
 * Registered conditionally by {@link AlgorithmRegistryAutoConfiguration}
 * when {@link AlgorithmStatsPublisher} is available (requires NATS).
 */
@Slf4j
@RequiredArgsConstructor
public class AlgorithmStatsService {

    private final AlgorithmStatsPublisher publisher;

    @PostConstruct
    void init() {
        log.info("AlgorithmStatsService ready — flushing every 15s to NATS");
    }

    @Scheduled(fixedDelay = 15_000, initialDelay = 15_000)
    public void flush() {
        Map<String, AlgorithmStats> all = AlgorithmStats.all();
        if (all.isEmpty()) {
            log.debug("Algorithm stats flush: registry empty");
            return;
        }

        List<StatDelta> items = new ArrayList<>(all.size());
        for (Map.Entry<String, AlgorithmStats> entry : all.entrySet()) {
            AlgorithmStats.Snapshot snap = entry.getValue().drainAndReset();
            if (snap.callCount() == 0) continue;
            items.add(new StatDelta(
                entry.getKey(),
                snap.callCount(),
                snap.totalNanos(),
                snap.minNanos(),
                snap.maxNanos()
            ));
        }
        if (items.isEmpty()) {
            log.debug("Algorithm stats flush: all snapshots empty");
            return;
        }
        publisher.publish(items);
        log.info("Flushed {} algorithm stat deltas to NATS", items.size());
    }
}
