package com.plm.shared.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;

/**
 * Lightweight client to resolve project space descendants from PNO.
 * Cached 60s — hierarchy changes are rare.
 */
@Slf4j
@Component
public class PnoProjectSpaceClient {

    private final String pnoApiUrl;
    private final RestTemplate restTemplate;
    private final Cache<String, List<String>> cache = Caffeine.newBuilder()
        .maximumSize(200)
        .expireAfterWrite(Duration.ofSeconds(60))
        .build();

    public PnoProjectSpaceClient(@Value("${pno.api.url}") String pnoApiUrl,
                                 RestTemplateBuilder restTemplateBuilder) {
        this.pnoApiUrl = pnoApiUrl;
        this.restTemplate = restTemplateBuilder.build();
    }

    /**
     * Returns the given space ID + all descendant space IDs.
     * Cached 60s.
     */
    public List<String> getDescendants(String projectSpaceId) {
        List<String> cached = cache.getIfPresent(projectSpaceId);
        if (cached != null) return cached;

        try {
            String url = pnoApiUrl + "/api/pno/project-spaces/" + projectSpaceId + "/descendants";
            List<String> result = restTemplate.exchange(url, HttpMethod.GET, null,
                new ParameterizedTypeReference<List<String>>() {}).getBody();
            if (result == null) result = List.of(projectSpaceId);
            cache.put(projectSpaceId, result);
            return result;
        } catch (Exception e) {
            log.warn("Failed to resolve descendants for {}: {}", projectSpaceId, e.getMessage());
            return List.of(projectSpaceId); // fallback: just the target space
        }
    }
}
