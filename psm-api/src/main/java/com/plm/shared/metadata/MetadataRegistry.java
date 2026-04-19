package com.plm.shared.metadata;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Discovers all Spring beans annotated with {@link Metadata} at startup
 * and builds a catalog of known metadata keys per target type.
 *
 * This allows the frontend to dynamically render metadata toggles
 * based on what the backend code actually supports.
 */
@Slf4j
@Component
public class MetadataRegistry {

    public record KnownKey(String key, String target, String description, String declaredBy) {}

    /** target → list of known keys */
    private final Map<String, List<KnownKey>> byTarget = new LinkedHashMap<>();
    /** flat list of all known keys */
    private final List<KnownKey> all = new ArrayList<>();

    public MetadataRegistry(ApplicationContext ctx) {
        Map<String, Object> beans = ctx.getBeansOfType(Object.class);
        for (var entry : beans.entrySet()) {
            Object bean = entry.getValue();
            Class<?> clazz = bean.getClass();
            // Unwrap Spring CGLIB proxy
            if (clazz.getName().contains("$$")) {
                clazz = clazz.getSuperclass();
            }
            Metadata[] annotations = clazz.getAnnotationsByType(Metadata.class);
            for (Metadata m : annotations) {
                KnownKey kk = new KnownKey(m.key(), m.target(), m.description(), clazz.getSimpleName());
                // Deduplicate by (key, target)
                boolean exists = byTarget.getOrDefault(m.target(), List.of())
                    .stream().anyMatch(k -> k.key().equals(m.key()));
                if (!exists) {
                    byTarget.computeIfAbsent(m.target(), k -> new ArrayList<>()).add(kk);
                    all.add(kk);
                }
            }
        }
        log.info("MetadataRegistry: discovered {} known keys across {} target types",
            all.size(), byTarget.size());
        byTarget.forEach((target, keys) ->
            log.debug("  {}: {}", target, keys.stream().map(KnownKey::key).toList()));
    }

    /** Returns known metadata keys for a given target type. */
    public List<KnownKey> getKeysForTarget(String targetType) {
        return byTarget.getOrDefault(targetType, List.of());
    }

    /** Returns all known metadata keys. */
    public List<KnownKey> getAllKeys() {
        return List.copyOf(all);
    }
}
