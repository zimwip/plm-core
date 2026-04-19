package com.plm.domain.algorithm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Validates and auto-registers algorithms at startup.
 *
 * <ol>
 *   <li>Scans interfaces for {@link AlgorithmType} → ensures {@code algorithm_type} rows exist</li>
 *   <li>Scans beans for {@link AlgorithmBean} → ensures {@code algorithm} rows exist with correct metadata</li>
 *   <li>Scans beans for {@link AlgorithmParam} → ensures {@code algorithm_parameter} rows exist</li>
 *   <li>Alerts on discrepancies (DB row exists but bean missing)</li>
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AlgorithmStartupValidator {

    private final DSLContext         dsl;
    private final AlgorithmRegistry  registry;
    private final ApplicationContext appCtx;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void validate() {
        syncAlgorithmTypes();
        syncAlgorithms();
        reverseCheck();
    }

    /**
     * Step 1: Discover @AlgorithmType annotations on interfaces and ensure DB rows exist.
     */
    private void syncAlgorithmTypes() {
        Set<String> processedIds = new HashSet<>();

        for (Object bean : appCtx.getBeansWithAnnotation(AlgorithmBean.class).values()) {
            Class<?> clazz = unwrapProxy(bean.getClass());
            // Walk direct interfaces + their parents
            for (Class<?> iface : getAllInterfaces(clazz)) {
                AlgorithmType[] types = iface.getAnnotationsByType(AlgorithmType.class);
                for (AlgorithmType at : types) {
                    if (processedIds.contains(at.id())) continue;
                    processedIds.add(at.id());

                    Record existing = dsl.fetchOne(
                        "SELECT id FROM algorithm_type WHERE id = ?", at.id());
                    if (existing == null) {
                        dsl.execute(
                            "INSERT INTO algorithm_type (id, name, description, java_interface) VALUES (?,?,?,?)",
                            at.id(), at.name(), at.description(), iface.getName());
                        log.info("Auto-registered algorithm type: {} ({})", at.id(), at.name());
                    }
                }
            }
        }
    }

    private Set<Class<?>> getAllInterfaces(Class<?> clazz) {
        Set<Class<?>> result = new java.util.LinkedHashSet<>();
        for (Class<?> iface : clazz.getInterfaces()) {
            result.add(iface);
            for (Class<?> parent : iface.getInterfaces()) {
                result.add(parent);
            }
        }
        return result;
    }

    /**
     * Step 2: Discover @AlgorithmBean annotations and ensure algorithm + parameter rows exist.
     */
    private void syncAlgorithms() {
        Map<String, Object> beans = appCtx.getBeansWithAnnotation(AlgorithmBean.class);
        int registered = 0;
        int created = 0;

        for (Object bean : beans.values()) {
            Class<?> clazz = unwrapProxy(bean.getClass());
            AlgorithmBean ann = clazz.getAnnotation(AlgorithmBean.class);
            if (ann == null) continue;

            String code = ann.code();
            String name = ann.name().isEmpty() ? clazz.getSimpleName() : ann.name();
            String desc = ann.description();
            registered++;

            Record existing = dsl.fetchOne(
                "SELECT id, algorithm_type_id, name, description FROM algorithm WHERE code = ?", code);

            String algorithmId;
            if (existing == null) {
                // Deduce type from interface's @AlgorithmType
                String typeId = resolveTypeFromInterface(clazz);
                if (typeId == null) {
                    log.error("Cannot auto-register algorithm '{}': no @AlgorithmType found on implemented interfaces of {}", code, clazz.getSimpleName());
                    continue;
                }
                algorithmId = "alg-" + code.replace("_", "-");
                // Check if ID already taken
                if (dsl.fetchOne("SELECT id FROM algorithm WHERE id = ?", algorithmId) != null) {
                    algorithmId = UUID.randomUUID().toString();
                }
                String handlerRef = Character.toLowerCase(clazz.getSimpleName().charAt(0)) + clazz.getSimpleName().substring(1);
                dsl.execute(
                    "INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref) VALUES (?,?,?,?,?,?)",
                    algorithmId, typeId, code, name, desc, handlerRef);
                log.info("Auto-registered algorithm: {} → {} (type={})", code, name, typeId);
                created++;
            } else {
                algorithmId = existing.get("id", String.class);
                // Update name/description if changed
                String dbName = existing.get("name", String.class);
                String dbDesc = existing.get("description", String.class);
                if (!name.equals(dbName) || !nullSafeEquals(desc, dbDesc)) {
                    dsl.execute("UPDATE algorithm SET name = ?, description = ? WHERE id = ?",
                        name, desc, algorithmId);
                    log.info("Updated algorithm metadata: {} (name: {} → {}, desc updated: {})",
                        code, dbName, name, !nullSafeEquals(desc, dbDesc));
                }
            }

            // Sync parameters from @AlgorithmParam
            syncParameters(clazz, algorithmId, code);
        }

        log.info("Algorithm validation: {} beans checked, {} auto-registered, {} total in DB",
            registered, created, dsl.fetchCount(dsl.selectOne().from("algorithm")));
    }

    /**
     * Step 3: Sync @AlgorithmParam annotations with algorithm_parameter rows.
     */
    private void syncParameters(Class<?> clazz, String algorithmId, String algoCode) {
        AlgorithmParam[] params = clazz.getAnnotationsByType(AlgorithmParam.class);
        if (params.length == 0) return;

        Set<String> declaredNames = new HashSet<>();
        for (AlgorithmParam p : params) {
            declaredNames.add(p.name());

            Record existing = dsl.fetchOne(
                "SELECT id FROM algorithm_parameter WHERE algorithm_id = ? AND param_name = ?",
                algorithmId, p.name());

            if (existing == null) {
                String paramId = "ap-" + algoCode.replace("_", "-") + "-" + p.name().replace("_", "-");
                if (dsl.fetchOne("SELECT id FROM algorithm_parameter WHERE id = ?", paramId) != null) {
                    paramId = UUID.randomUUID().toString();
                }
                String label = p.label().isEmpty() ? p.name() : p.label();
                String defVal = p.defaultValue().isEmpty() ? null : p.defaultValue();
                dsl.execute(
                    "INSERT INTO algorithm_parameter (id, algorithm_id, param_name, param_label, data_type, required, default_value, display_order) VALUES (?,?,?,?,?,?,?,?)",
                    paramId, algorithmId, p.name(), label, p.dataType(),
                    p.required() ? 1 : 0, defVal, p.displayOrder());
                log.info("Auto-registered parameter: {}.{} ({})", algoCode, p.name(), p.dataType());
            } else {
                // Update label, default, etc. if changed
                String paramId = existing.get("id", String.class);
                String label = p.label().isEmpty() ? p.name() : p.label();
                String defVal = p.defaultValue().isEmpty() ? null : p.defaultValue();
                dsl.execute(
                    "UPDATE algorithm_parameter SET param_label = ?, data_type = ?, required = ?, default_value = ?, display_order = ? WHERE id = ?",
                    label, p.dataType(), p.required() ? 1 : 0, defVal, p.displayOrder(), paramId);
            }
        }

        // Warn about DB params not declared in annotation
        List<Record> dbParams = dsl.fetch(
            "SELECT param_name FROM algorithm_parameter WHERE algorithm_id = ?", algorithmId);
        for (Record r : dbParams) {
            String dbParamName = r.get("param_name", String.class);
            if (!declaredNames.contains(dbParamName)) {
                log.warn("Algorithm '{}' has DB parameter '{}' not declared in @AlgorithmParam — may be stale",
                    algoCode, dbParamName);
            }
        }
    }

    /**
     * Step 4: Reverse check — DB algorithms without matching beans.
     */
    private void reverseCheck() {
        List<Record> dbAlgorithms = dsl.select().from("algorithm").fetch();
        int errors = 0;
        for (Record row : dbAlgorithms) {
            String code = row.get("code", String.class);
            if (!registry.hasBean(code)) {
                log.error("Algorithm '{}' is in DB but has no matching @AlgorithmBean — will fail at runtime", code);
                errors++;
            }
        }
        if (errors > 0) {
            log.error("Algorithm validation: {} DB algorithms have no Spring bean", errors);
        }
    }

    /**
     * Resolves the algorithm_type ID from the most specific interface that has @AlgorithmType.
     * Walks the interface hierarchy: direct interfaces first (e.g. LifecycleGuard),
     * then parent interfaces (e.g. Guard). The most specific match wins.
     */
    private String resolveTypeFromInterface(Class<?> clazz) {
        // Check direct interfaces first (most specific)
        for (Class<?> iface : clazz.getInterfaces()) {
            AlgorithmType[] types = iface.getAnnotationsByType(AlgorithmType.class);
            if (types.length == 1) return types[0].id();
            if (types.length > 1) return types[0].id(); // first declared wins
        }
        // Walk parent interfaces (e.g. LifecycleGuard extends Guard)
        for (Class<?> iface : clazz.getInterfaces()) {
            for (Class<?> parentIface : iface.getInterfaces()) {
                AlgorithmType[] types = parentIface.getAnnotationsByType(AlgorithmType.class);
                if (types.length >= 1) return types[0].id();
            }
        }
        return null;
    }

    private static Class<?> unwrapProxy(Class<?> clazz) {
        while (clazz.getName().contains("$$")) clazz = clazz.getSuperclass();
        return clazz;
    }

    private static boolean nullSafeEquals(String a, String b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }
}
