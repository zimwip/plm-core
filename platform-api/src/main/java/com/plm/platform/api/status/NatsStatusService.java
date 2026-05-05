package com.plm.platform.api.status;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Fetches NATS server monitoring stats via its HTTP endpoint
 * ({@code /varz}, {@code /connz}, {@code /subsz}). Each call is wrapped
 * with a short timeout; partial results return {@code status: "down"}
 * with whatever sub-call succeeded — never propagates exceptions to
 * the controller.
 */
@Slf4j
@Service
public class NatsStatusService {

    private final RestTemplate rest;
    private final String baseUrl;

    public NatsStatusService(RestTemplateBuilder builder,
                             @Value("${nats.monitoring.url:http://nats:8222}") String baseUrl) {
        this.rest = builder
            .connectTimeout(Duration.ofSeconds(2))
            .readTimeout(Duration.ofSeconds(3))
            .build();
        this.baseUrl = baseUrl;
    }

    public Map<String, Object> fetchStats() {
        Map<String, Object> v = safeGet("/varz");
        Map<String, Object> c = safeGet("/connz?subs=true");
        Map<String, Object> s = safeGet("/subsz");

        boolean up = !v.isEmpty();
        Map<String, Object> result = new LinkedHashMap<>();
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

        result.put("numConnections", c.getOrDefault("num_connections", 0));
        Object connections = c.get("connections");
        if (connections instanceof List<?> connList) {
            List<Map<String, Object>> connSummaries = connList.stream()
                .filter(o -> o instanceof Map)
                .map(o -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> conn = (Map<String, Object>) o;
                    Map<String, Object> summary = new LinkedHashMap<>();
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
        result.put("numSubs", s.getOrDefault("num_subscriptions", 0));
        result.put("numCache", s.getOrDefault("num_cache", 0));
        result.put("numInserts", s.getOrDefault("num_inserts", 0));
        result.put("numMatches", s.getOrDefault("num_matches", 0));
        return result;
    }

    private Map<String, Object> safeGet(String path) {
        try {
            return rest.exchange(baseUrl + path, HttpMethod.GET,
                HttpEntity.EMPTY,
                new ParameterizedTypeReference<Map<String, Object>>() {}).getBody();
        } catch (Exception e) {
            log.debug("NATS {} fetch failed: {}", path, e.getMessage());
            return Map.of();
        }
    }
}
