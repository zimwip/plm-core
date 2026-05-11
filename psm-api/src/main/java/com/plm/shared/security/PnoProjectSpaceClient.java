package com.plm.shared.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.plm.platform.client.ServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

/**
 * Lightweight client to resolve project space descendants from PNO.
 * Uses the registry-aware ServiceClient for direct service-to-service calls.
 * Cached 60s — hierarchy changes are rare.
 */
@Slf4j
@Component
public class PnoProjectSpaceClient {

    private final ServiceClient serviceClient;
    private final Cache<String, List<String>> cache = Caffeine.newBuilder()
        .maximumSize(200)
        .expireAfterWrite(Duration.ofSeconds(60))
        .build();

    public PnoProjectSpaceClient(ServiceClient serviceClient) {
        this.serviceClient = serviceClient;
    }

    /**
     * Returns the given space ID + all descendant space IDs.
     * Cached 60s.
     */
    public List<String> getDescendants(String projectSpaceId) {
        List<String> cached = cache.getIfPresent(projectSpaceId);
        if (cached != null) return cached;

        try {
            List<String> result = serviceClient.get("pno",
                "/api/pno/project-spaces/" + projectSpaceId + "/descendants",
                new ParameterizedTypeReference<List<String>>() {});
            if (result == null) result = List.of(projectSpaceId);
            cache.put(projectSpaceId, result);
            return result;
        } catch (Exception e) {
            log.warn("Failed to resolve descendants for {}: {}", projectSpaceId, e.getMessage());
            return List.of(projectSpaceId); // fallback: just the target space
        }
    }
}
