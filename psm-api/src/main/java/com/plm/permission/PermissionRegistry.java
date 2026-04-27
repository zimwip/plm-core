package com.plm.permission;

import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigSnapshotUpdatedEvent;
import com.plm.platform.authz.PermissionCatalogPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Read-only in-memory cache of the {@code permission} table.
 *
 * <p>Loaded at startup. Provides permission metadata lookups for:
 * <ul>
 *   <li>Permission module: scope resolution, annotation validation, admin UI catalog</li>
 *   <li>Action module: scope lookup via {@link PermissionCatalogPort}</li>
 * </ul>
 *
 * <p>Scope codes are plain strings (e.g. {@code "GLOBAL"}, {@code "NODE"},
 * {@code "LIFECYCLE"}, or any future service-contributed scope) — see
 * {@code permission.scope} column.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PermissionRegistry implements PermissionCatalogPort {

    private final ConfigCache configCache;

    public record PermissionEntry(
        String code,
        String scope,
        String displayName,
        String description,
        int displayOrder
    ) {}

    /** Annotation usage sites — populated by PlmPermissionValidator at startup. */
    public record PermissionSite(String className, String methodName) {}

    private final Map<String, PermissionEntry> byCode = new ConcurrentHashMap<>();
    private final Map<String, List<PermissionSite>> sitesByCode = new ConcurrentHashMap<>();

    @EventListener(ConfigSnapshotUpdatedEvent.class)
    public void onConfigSnapshotUpdated(ConfigSnapshotUpdatedEvent event) {
        reload();
    }

    /** Reloads the in-memory cache from ConfigCache. */
    public void reload() {
        byCode.clear();
        configCache.getAllPermissions().forEach(p -> {
            byCode.put(p.permissionCode(), new PermissionEntry(
                p.permissionCode(),
                p.scope(),
                p.displayName(),
                p.description(),
                p.displayOrder()
            ));
        });
        log.info("PermissionRegistry: loaded {} permission(s) from ConfigCache", byCode.size());
    }

    // ── PermissionCatalogPort ──────────────────────────────────────────

    @Override
    public String scopeFor(String permissionCode) {
        PermissionEntry entry = byCode.get(permissionCode);
        return entry != null ? entry.scope() : null;
    }

    @Override
    public boolean exists(String permissionCode) {
        return byCode.containsKey(permissionCode);
    }

    // ── Module-internal API ────────────────────────────────────────────

    public PermissionEntry get(String code) {
        return byCode.get(code);
    }

    public Set<String> allCodes() {
        return Collections.unmodifiableSet(byCode.keySet());
    }

    public Collection<PermissionEntry> all() {
        return Collections.unmodifiableCollection(byCode.values());
    }

    public List<PermissionEntry> listByScope(String scope) {
        return byCode.values().stream()
            .filter(e -> e.scope().equals(scope))
            .sorted(Comparator.comparingInt(PermissionEntry::displayOrder))
            .collect(Collectors.toList());
    }

    /** Called by PlmPermissionValidator to record annotation usage sites. */
    public void registerSite(String code, String className, String methodName) {
        sitesByCode.computeIfAbsent(code, k -> new ArrayList<>())
            .add(new PermissionSite(className, methodName));
    }

    public List<PermissionSite> sitesFor(String code) {
        return sitesByCode.getOrDefault(code, List.of());
    }
}
