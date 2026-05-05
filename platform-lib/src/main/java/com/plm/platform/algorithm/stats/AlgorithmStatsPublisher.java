package com.plm.platform.algorithm.stats;

import com.plm.platform.nats.PlmMessageBus;
import com.plm.platform.environment.PlatformRegistrationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Publishes per-algorithm execution stat deltas over NATS so a central
 * service (psa) can aggregate stats coming from every running instance.
 *
 * Subject: {@code env.service.{serviceCode}.ALGORITHM_STATS}
 *
 * Payload:
 * <pre>{
 *   "serviceCode": "psm",
 *   "instanceId":  "abcd123",
 *   "publishedAt": "2025-...",
 *   "items": [
 *     { "code": "CHECKOUT", "callCount": 42, "totalNanos": 1234, "minNanos": 10, "maxNanos": 200 },
 *     ...
 *   ]
 * }</pre>
 *
 * Stats loss tolerated by design — fire-and-forget. Aggregator merges
 * deltas into all-time + windowed tables.
 */
public class AlgorithmStatsPublisher {

    private static final Logger log = LoggerFactory.getLogger(AlgorithmStatsPublisher.class);

    public static final String EVENT_TYPE = "ALGORITHM_STATS";

    private final PlmMessageBus bus;
    private final PlatformRegistrationProperties platformProps;

    public AlgorithmStatsPublisher(PlmMessageBus bus, PlatformRegistrationProperties platformProps) {
        this.bus = bus;
        this.platformProps = platformProps;
    }

    public void publish(List<StatDelta> items) {
        if (items == null || items.isEmpty()) return;
        String serviceCode = platformProps.serviceCode();
        if (serviceCode == null || serviceCode.isBlank()) {
            log.debug("AlgorithmStatsPublisher: no service-code, skipping publish");
            return;
        }
        Map<String, Object> payload = Map.of(
            "serviceCode", serviceCode,
            "instanceId",  instanceIdFromBaseUrl(platformProps.selfBaseUrl()),
            "publishedAt", Instant.now().toString(),
            "items",       items
        );
        try {
            bus.sendInternal(serviceCode, EVENT_TYPE, payload);
            log.debug("Published {} algorithm stat deltas", items.size());
        } catch (Exception e) {
            log.warn("Algorithm stats publish failed: {}", e.getMessage());
        }
    }

    private static String instanceIdFromBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) return "unknown";
        return Integer.toHexString(baseUrl.hashCode());
    }

    public record StatDelta(
        String code,
        long callCount,
        long totalNanos,
        long minNanos,
        long maxNanos
    ) {}
}
