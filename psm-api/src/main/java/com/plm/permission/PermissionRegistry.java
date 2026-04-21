package com.plm.permission;

import com.plm.shared.authorization.PermissionCatalogPort;
import com.plm.shared.authorization.PermissionScope;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
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
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PermissionRegistry implements PermissionCatalogPort {

    private final DSLContext dsl;

    public record PermissionEntry(
        String code,
        PermissionScope scope,
        String displayName,
        String description,
        int displayOrder
    ) {}

    /** Annotation usage sites — populated by PlmPermissionValidator at startup. */
    public record PermissionSite(String className, String methodName) {}

    private final Map<String, PermissionEntry> byCode = new ConcurrentHashMap<>();
    private final Map<String, List<PermissionSite>> sitesByCode = new ConcurrentHashMap<>();

    @PostConstruct
    void load() {
        reload();
    }

    /** Reloads the in-memory cache from the permission table. */
    public void reload() {
        byCode.clear();
        dsl.select(
                DSL.field("permission_code"),
                DSL.field("scope"),
                DSL.field("display_name"),
                DSL.field("description"),
                DSL.field("display_order"))
            .from("permission")
            .fetch()
            .forEach(r -> {
                String code = r.get("permission_code", String.class);
                byCode.put(code, new PermissionEntry(
                    code,
                    PermissionScope.valueOf(r.get("scope", String.class)),
                    r.get("display_name", String.class),
                    r.get("description", String.class),
                    r.get("display_order", Integer.class) != null ? r.get("display_order", Integer.class) : 0
                ));
            });
        log.info("PermissionRegistry: loaded {} permission(s) from DB", byCode.size());
    }

    // ── PermissionCatalogPort ──────────────────────────────────────────

    @Override
    public PermissionScope scopeFor(String permissionCode) {
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

    public List<PermissionEntry> listByScope(PermissionScope scope) {
        return byCode.values().stream()
            .filter(e -> e.scope() == scope)
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
