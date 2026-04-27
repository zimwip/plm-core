package com.spe.status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

/**
 * Fetches NATS server monitoring stats via its HTTP endpoint (/varz, /connz).
 */
@Service
public class NatsStatusService {

    private static final Logger log = LoggerFactory.getLogger(NatsStatusService.class);

    private final WebClient webClient;

    public NatsStatusService(WebClient.Builder webClientBuilder,
                             @Value("${nats.monitoring.url:http://nats:8222}") String natsMonitoringUrl) {
        this.webClient = webClientBuilder.baseUrl(natsMonitoringUrl).build();
    }

    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> fetchStats() {
        Mono<Map> varz = webClient.get().uri("/varz")
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(3))
                .onErrorResume(e -> {
                    log.warn("NATS /varz fetch failed: {}", e.getMessage());
                    return Mono.empty();
                });

        Mono<Map> connz = webClient.get().uri("/connz?subs=true")
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(3))
                .onErrorResume(e -> {
                    log.warn("NATS /connz fetch failed: {}", e.getMessage());
                    return Mono.empty();
                });

        Mono<Map> subsz = webClient.get().uri("/subsz")
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(3))
                .onErrorResume(e -> {
                    log.warn("NATS /subsz fetch failed: {}", e.getMessage());
                    return Mono.empty();
                });

        return Mono.zip(varz.defaultIfEmpty(Map.of()),
                        connz.defaultIfEmpty(Map.of()),
                        subsz.defaultIfEmpty(Map.of()))
                .map(tuple -> {
                    Map<String, Object> v = tuple.getT1();
                    Map<String, Object> c = tuple.getT2();
                    Map<String, Object> s = tuple.getT3();

                    boolean up = !v.isEmpty();

                    Map<String, Object> result = new java.util.LinkedHashMap<>();
                    result.put("status", up ? "up" : "down");
                    result.put("version", v.getOrDefault("version", null));
                    result.put("uptime", v.getOrDefault("uptime", null));
                    result.put("connections", v.getOrDefault("connections", 0));
                    result.put("totalConnections", v.getOrDefault("total_connections", 0));
                    result.put("subscriptions", v.getOrDefault("subscriptions", 0));
                    result.put("inMsgs", v.getOrDefault("in_msgs", 0));
                    result.put("outMsgs", v.getOrDefault("out_msgs", 0));
                    result.put("inBytes", v.getOrDefault("in_bytes", 0));
                    result.put("outBytes", v.getOrDefault("out_bytes", 0));
                    result.put("slowConsumers", v.getOrDefault("slow_consumers", 0));

                    // Connection details from /connz
                    result.put("numConnections", c.getOrDefault("num_connections", 0));
                    Object connections = c.get("connections");
                    if (connections instanceof java.util.List<?> connList) {
                        var connSummaries = connList.stream()
                                .filter(o -> o instanceof Map)
                                .map(o -> {
                                    Map<String, Object> conn = (Map<String, Object>) o;
                                    Map<String, Object> summary = new java.util.LinkedHashMap<>();
                                    summary.put("cid", conn.get("cid"));
                                    summary.put("name", conn.getOrDefault("name", ""));
                                    summary.put("ip", conn.get("ip"));
                                    summary.put("lang", conn.getOrDefault("lang", ""));
                                    summary.put("version", conn.getOrDefault("version", ""));
                                    summary.put("subscriptions", conn.getOrDefault("subscriptions_list", conn.get("subscriptions")));
                                    summary.put("inMsgs", conn.getOrDefault("in_msgs", 0));
                                    summary.put("outMsgs", conn.getOrDefault("out_msgs", 0));
                                    summary.put("inBytes", conn.getOrDefault("in_bytes", 0));
                                    summary.put("outBytes", conn.getOrDefault("out_bytes", 0));
                                    summary.put("uptime", conn.getOrDefault("uptime", ""));
                                    summary.put("idle", conn.getOrDefault("idle", ""));
                                    return summary;
                                })
                                .toList();
                        result.put("connectionDetails", connSummaries);
                    }

                    // Subscription count from /subsz
                    result.put("numSubs", s.getOrDefault("num_subscriptions", 0));
                    result.put("numCache", s.getOrDefault("num_cache", 0));
                    result.put("numInserts", s.getOrDefault("num_inserts", 0));
                    result.put("numMatches", s.getOrDefault("num_matches", 0));

                    return result;
                });
    }
}
