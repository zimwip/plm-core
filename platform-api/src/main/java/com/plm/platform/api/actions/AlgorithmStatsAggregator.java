package com.plm.platform.api.actions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.algorithm.stats.AlgorithmStatsPublisher;
import com.plm.platform.nats.NatsListenerFactory;
import io.nats.client.Dispatcher;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "plm.nats", name = "enabled", havingValue = "true")
public class AlgorithmStatsAggregator {

    private static final int WINDOW_SECONDS = 15;
    private static final int RETENTION_HOURS = 48;
    private static final String SUBJECT = "env.service.*." + AlgorithmStatsPublisher.EVENT_TYPE;

    private final NatsListenerFactory listenerFactory;
    private final ObjectMapper objectMapper;
    private final DSLContext dsl;

    private Dispatcher dispatcher;

    @PostConstruct
    void subscribe() {
        dispatcher = listenerFactory.subscribeWildcard(SUBJECT, msg -> {
            try {
                handle(new String(msg.getData(), StandardCharsets.UTF_8));
            } catch (Exception e) {
                log.warn("Failed to ingest algorithm stats payload: {}", e.getMessage());
            }
        });
        log.info("Algorithm stats aggregator subscribed: {}", SUBJECT);
    }

    @PreDestroy
    void unsubscribe() {
        listenerFactory.close(dispatcher);
    }

    private void handle(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode items = root.path("items");
        if (!items.isArray() || items.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = truncateToWindow(now);

        for (JsonNode item : items) {
            String code   = item.path("code").asText(null);
            long count    = item.path("callCount").asLong(0);
            long totalNs  = item.path("totalNanos").asLong(0);
            long minNs    = item.path("minNanos").asLong(Long.MAX_VALUE);
            long maxNs    = item.path("maxNanos").asLong(0);
            if (code == null || code.isBlank() || count == 0) continue;
            mergeAllTime(code, count, totalNs, minNs, maxNs, now);
            mergeWindow(code, windowStart, count, totalNs, minNs, maxNs);
        }
    }

    private void mergeAllTime(String code, long count, long totalNs, long minNs, long maxNs, LocalDateTime now) {
        int updated = dsl.execute("""
            UPDATE algorithm_stat
            SET call_count   = call_count + ?,
                total_ns     = total_ns + ?,
                min_ns       = LEAST(min_ns, ?),
                max_ns       = GREATEST(max_ns, ?),
                last_flushed = ?
            WHERE algorithm_code = ?
            """, count, totalNs, minNs, maxNs, now, code);
        if (updated == 0) {
            dsl.execute("""
                INSERT INTO algorithm_stat (algorithm_code, call_count, total_ns, min_ns, max_ns, last_flushed)
                VALUES (?, ?, ?, ?, ?, ?)
                """, code, count, totalNs, minNs, maxNs, now);
        }
    }

    private void mergeWindow(String code, LocalDateTime windowStart, long count, long totalNs, long minNs, long maxNs) {
        int wUpdated = dsl.execute("""
            UPDATE algorithm_stat_window
            SET call_count = call_count + ?,
                total_ns   = total_ns + ?,
                min_ns     = LEAST(min_ns, ?),
                max_ns     = GREATEST(max_ns, ?)
            WHERE algorithm_code = ? AND window_start = ?
            """, count, totalNs, minNs, maxNs, code, windowStart);
        if (wUpdated == 0) {
            dsl.execute("""
                INSERT INTO algorithm_stat_window (algorithm_code, window_start, call_count, total_ns, min_ns, max_ns)
                VALUES (?, ?, ?, ?, ?, ?)
                """, code, windowStart, count, totalNs, minNs, maxNs);
        }
    }

    @Scheduled(fixedDelay = 3_600_000, initialDelay = 3_600_000)
    public void purgeOldWindows() {
        dsl.execute("DELETE FROM algorithm_stat_window WHERE window_start < ?",
            LocalDateTime.now().minusHours(RETENTION_HOURS));
    }

    private static LocalDateTime truncateToWindow(LocalDateTime dt) {
        LocalDateTime minuteStart = dt.truncatedTo(ChronoUnit.MINUTES);
        int secondBucket = (dt.getSecond() / WINDOW_SECONDS) * WINDOW_SECONDS;
        return minuteStart.plusSeconds(secondBucket);
    }
}
