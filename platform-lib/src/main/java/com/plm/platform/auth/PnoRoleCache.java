package com.plm.platform.auth;

import java.util.Set;
import java.util.concurrent.TimeUnit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

/**
 * Local per-service cache of pno-api role assignments, keyed by
 * {@code userId:projectSpaceId}. Populated on cache miss via {@link PnoRoleClient}.
 * Invalidated by {@link PnoChangedSubscriber} on {@code global.PNO_CHANGED} events.
 */
public class PnoRoleCache {

    private final Cache<String, Set<String>> cache;
    private final PnoRoleClient client;

    public PnoRoleCache(PnoRoleClient client, long ttlSeconds) {
        this.client = client;
        this.cache = Caffeine.newBuilder()
            .expireAfterWrite(ttlSeconds, TimeUnit.SECONDS)
            .maximumSize(1000)
            .build();
    }

    public Set<String> getRoles(String userId, String projectSpaceId) {
        String key = cacheKey(userId, projectSpaceId);
        Set<String> cached = cache.getIfPresent(key);
        if (cached != null) return cached;
        Set<String> loaded = client.fetchRoles(userId, projectSpaceId);
        cache.put(key, loaded);
        return loaded;
    }

    public void invalidateUser(String userId) {
        String prefix = userId + ":";
        cache.asMap().keySet().removeIf(k -> k.startsWith(prefix));
    }

    public void invalidateAll() {
        cache.invalidateAll();
    }

    private static String cacheKey(String userId, String projectSpaceId) {
        return userId + ":" + (projectSpaceId != null ? projectSpaceId : "");
    }
}
