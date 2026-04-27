package com.plm.platform.api.client;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.plm.platform.spe.client.ServiceClient;
import com.plm.platform.api.security.SettingsUserContext;

import lombok.extern.slf4j.Slf4j;

/**
 * Calls pno-api for user context (roles, isAdmin).
 * Cached with Caffeine (30s TTL, 500 entries).
 * Uses the registry-aware {@link ServiceClient} — no hardcoded URL.
 */
@Slf4j
@Component
public class PnoApiClient {

    private final ServiceClient serviceClient;

    private final Cache<String, SettingsUserContext> cache = Caffeine.newBuilder()
        .expireAfterWrite(30, TimeUnit.SECONDS)
        .maximumSize(500)
        .build();

    public PnoApiClient(ServiceClient serviceClient) {
        this.serviceClient = serviceClient;
    }

    /**
     * Fetch user context from PNO API. Returns null on error.
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public SettingsUserContext getUserContext(String userId, String projectSpaceId) {
        if (userId == null || userId.isBlank()) return null;

        String cacheKey = userId + ":" + (projectSpaceId != null ? projectSpaceId : "");
        SettingsUserContext hit = cache.getIfPresent(cacheKey);
        if (hit != null) return hit;

        UriComponentsBuilder pathBuilder = UriComponentsBuilder
            .fromPath("/api/pno/users/" + userId + "/context");
        if (projectSpaceId != null && !projectSpaceId.isBlank()) {
            pathBuilder.queryParam("projectSpaceId", projectSpaceId);
        }

        try {
            Map body = serviceClient.get("pno", pathBuilder.build().toUriString(), Map.class);
            if (body == null) return null;

            SettingsUserContext ctx = toContext(userId, body);
            cache.put(cacheKey, ctx);
            return ctx;
        } catch (Exception e) {
            log.warn("PNO context fetch failed for user {}: {}", userId, e.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private SettingsUserContext toContext(String userId, Map<String, Object> body) {
        String username = (String) body.get("username");
        boolean isAdmin = Boolean.TRUE.equals(body.get("isAdmin"));
        List<String> roleIds = (List<String>) body.getOrDefault("roleIds", List.of());
        List<String> grants  = (List<String>) body.getOrDefault("globalPermissions", List.of());
        return new SettingsUserContext(userId, username, new HashSet<>(roleIds), isAdmin, new HashSet<>(grants));
    }
}
