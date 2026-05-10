package com.plm.platform.api.api;

import com.plm.platform.api.client.PnoApiClient;
import com.plm.platform.api.client.UiPluginsClient;
import com.plm.platform.api.security.SettingsSecurityContext;
import com.plm.platform.api.security.SettingsUserContext;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Returns the filtered UI plugin manifest for the current user.
 * Calls each registered service's {@code /internal/ui/plugins} endpoint,
 * then filters by the user's permission grants from pno-api.
 * Results are cached per user for 30 s to avoid calling all services on every boot.
 */
@RestController
@RequiredArgsConstructor
public class UiManifestController {

    private final UiPluginsClient uiPluginsClient;
    private final PnoApiClient pnoApiClient;

    private final Cache<String, List<UiPluginManifestEntry>> cache = Caffeine.newBuilder()
            .expireAfterWrite(30, TimeUnit.SECONDS)
            .maximumSize(500)
            .build();

    @GetMapping("/ui/manifest")
    public ResponseEntity<List<UiPluginManifestEntry>> manifest() {
        SettingsUserContext ctx = SettingsSecurityContext.get();
        String cacheKey = ctx.getUserId();

        List<UiPluginManifestEntry> cached = cache.getIfPresent(cacheKey);
        if (cached != null) return ResponseEntity.ok(cached);

        SettingsUserContext pnoCtx = pnoApiClient.getUserContext(ctx.getUserId(), null);
        boolean isAdmin = pnoCtx != null && pnoCtx.isAdmin();
        Set<String> grants = pnoCtx != null ? pnoCtx.getGlobalPermissions() : Set.of();

        List<UiPluginManifestEntry> all = uiPluginsClient.fetchAll();
        List<UiPluginManifestEntry> visible = all.stream()
                .filter(e -> isAdmin
                        || e.requiredPermission() == null
                        || grants.contains(e.requiredPermission()))
                .toList();

        cache.put(cacheKey, visible);
        return ResponseEntity.ok(visible);
    }
}
