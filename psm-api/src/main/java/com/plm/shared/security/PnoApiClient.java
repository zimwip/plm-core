package com.plm.shared.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.plm.shared.security.PlmUserContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * HTTP client that calls pno-api to resolve user identity.
 * Responses are cached (30 s TTL) to avoid per-request latency.
 *
 * Cache key is "userId:projectSpaceId" so that role sets are correctly
 * scoped per project space.
 */
@Slf4j
@Component
public class PnoApiClient {

    private final String      pnoApiUrl;
    private final String      serviceSecret;
    private final RestTemplate rest  = new RestTemplate();
    private final Cache<String, PlmUserContext> cache = Caffeine.newBuilder()
        .expireAfterWrite(10, TimeUnit.SECONDS)
        .maximumSize(500)
        .build();

    public PnoApiClient(
        @Value("${pno.api.url:http://localhost:8081}") String pnoApiUrl,
        @Value("${plm.service.secret:dev-secret-change-in-prod}") String serviceSecret
    ) {
        this.pnoApiUrl     = pnoApiUrl;
        this.serviceSecret = serviceSecret;
    }

    /**
     * Fetches user context from pno-api scoped to the given project space (cache-first).
     * Returns null if the user is unknown or pno-api is unreachable.
     *
     * When projectSpaceId is null, roles from all spaces are returned (union).
     */
    @SuppressWarnings("unchecked")
    public PlmUserContext getUserContext(String userId, String projectSpaceId) {
        String cacheKey = userId + ":" + (projectSpaceId != null ? projectSpaceId : "");
        PlmUserContext cached = cache.getIfPresent(cacheKey);
        if (cached != null) return cached;

        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(pnoApiUrl + "/api/pno/users/" + userId + "/context");
            if (projectSpaceId != null && !projectSpaceId.isBlank()) {
                builder.queryParam("projectSpaceId", projectSpaceId);
            }
            String url = builder.toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", serviceSecret);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            Map<String, Object> body = rest.exchange(url, HttpMethod.GET, entity, Map.class).getBody();
            if (body == null) return null;

            String       username = (String)  body.get("username");
            boolean      isAdmin  = Boolean.TRUE.equals(body.get("isAdmin"));
            List<String> rawIds   = (List<String>) body.getOrDefault("roleIds", List.of());
            Set<String>  roleIds  = Set.copyOf(rawIds);

            PlmUserContext ctx = new PlmUserContext(userId, username, roleIds, isAdmin);
            cache.put(cacheKey, ctx);
            return ctx;

        } catch (RestClientException e) {
            log.warn("pno-api unreachable for user {}: {}", userId, e.getMessage());
            return null;
        }
    }

    /** Evict all cached entries for a specific user across all project spaces. */
    public void evict(String userId) {
        cache.asMap().keySet().removeIf(key -> key.startsWith(userId + ":"));
    }
}
