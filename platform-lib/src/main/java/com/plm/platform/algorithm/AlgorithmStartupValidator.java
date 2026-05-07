package com.plm.platform.algorithm;

import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.AlgorithmConfig;
import com.plm.platform.config.dto.AlgorithmParameterConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Validates algorithms at startup against ConfigCache (read-only).
 *
 * <ol>
 *   <li>Scans interfaces for {@link AlgorithmType} → validates they exist in ConfigCache</li>
 *   <li>Scans beans for {@link AlgorithmBean} → validates matching algorithm exists in ConfigCache</li>
 *   <li>Scans beans for {@link AlgorithmParam} → validates matching parameters exist in ConfigCache</li>
 *   <li>Reverse check: ConfigCache algorithms without matching Spring beans</li>
 * </ol>
 *
 * No longer writes to DB — admin tables are managed by psm-admin.
 * Registered conditionally by {@link AlgorithmRegistryAutoConfiguration} when ConfigCache is available.
 */
@Slf4j
@RequiredArgsConstructor
public class AlgorithmStartupValidator {

    private final ConfigCache        configCache;
    private final AlgorithmRegistry  registry;
    private final ApplicationContext appCtx;

    @EventListener(ApplicationReadyEvent.class)
    public void validate() {
        syncAlgorithmTypes();
        syncAlgorithms();
        reverseCheck();
    }

    private void syncAlgorithmTypes() {
        Set<String> processedIds = new HashSet<>();
        int missing = 0;

        for (Object bean : appCtx.getBeansWithAnnotation(AlgorithmBean.class).values()) {
            Class<?> clazz = unwrapProxy(bean.getClass());
            for (Class<?> iface : getAllInterfaces(clazz)) {
                AlgorithmType[] types = iface.getAnnotationsByType(AlgorithmType.class);
                for (AlgorithmType at : types) {
                    if (processedIds.contains(at.id())) continue;
                    processedIds.add(at.id());

                    boolean found = configCache.getAllAlgorithms().stream()
                        .anyMatch(alg -> at.id().equals(alg.algorithmTypeId()));
                    if (!found) {
                        log.warn("Algorithm type '{}' ({}) declared on {} has no matching algorithms in ConfigCache",
                            at.id(), at.name(), iface.getSimpleName());
                        missing++;
                    }
                }
            }
        }

        if (missing == 0 && !processedIds.isEmpty()) {
            log.info("Algorithm type validation: all {} types validated OK", processedIds.size());
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

    private void syncAlgorithms() {
        var beans = appCtx.getBeansWithAnnotation(AlgorithmBean.class);
        int checked = 0;
        int missing = 0;

        for (Object bean : beans.values()) {
            Class<?> clazz = unwrapProxy(bean.getClass());
            AlgorithmBean ann = clazz.getAnnotation(AlgorithmBean.class);
            if (ann == null) continue;

            String code = ann.code();
            checked++;

            var algOpt = configCache.getAlgorithm(code);
            if (algOpt.isEmpty()) {
                log.warn("Algorithm bean '{}' ({}) has no matching entry in ConfigCache — will fail at runtime",
                    code, clazz.getSimpleName());
                missing++;
                continue;
            }

            syncParameters(clazz, algOpt.get(), code);
        }

        log.info("Algorithm validation: {} beans checked, {} missing from ConfigCache, {} total in ConfigCache",
            checked, missing, configCache.getAllAlgorithms().size());
    }

    private void syncParameters(Class<?> clazz, AlgorithmConfig alg, String algoCode) {
        AlgorithmParam[] params = clazz.getAnnotationsByType(AlgorithmParam.class);
        if (params.length == 0) return;

        List<AlgorithmParameterConfig> configParams = alg.parameters() != null ? alg.parameters() : List.of();
        Set<String> configParamNames = configParams.stream()
            .map(AlgorithmParameterConfig::paramName)
            .collect(Collectors.toSet());

        for (AlgorithmParam p : params) {
            if (!configParamNames.contains(p.name())) {
                log.warn("Algorithm '{}' has @AlgorithmParam '{}' not found in ConfigCache — may be missing from admin config",
                    algoCode, p.name());
            }
        }

        Set<String> declaredNames = new HashSet<>();
        for (AlgorithmParam p : params) {
            declaredNames.add(p.name());
        }
        for (AlgorithmParameterConfig cp : configParams) {
            if (!declaredNames.contains(cp.paramName())) {
                log.warn("Algorithm '{}' has ConfigCache parameter '{}' not declared in @AlgorithmParam — may be stale",
                    algoCode, cp.paramName());
            }
        }
    }

    private void reverseCheck() {
        List<AlgorithmConfig> configAlgorithms = configCache.getAllAlgorithms();
        int errors = 0;
        for (AlgorithmConfig alg : configAlgorithms) {
            if (!registry.hasBean(alg.code())) {
                log.error("Algorithm '{}' is in ConfigCache but has no matching @AlgorithmBean — will fail at runtime",
                    alg.code());
                errors++;
            }
        }
        if (errors > 0) {
            log.error("Algorithm validation: {} ConfigCache algorithms have no Spring bean", errors);
        }
    }

    private static Class<?> unwrapProxy(Class<?> clazz) {
        while (clazz.getName().contains("$$")) clazz = clazz.getSuperclass();
        return clazz;
    }
}
