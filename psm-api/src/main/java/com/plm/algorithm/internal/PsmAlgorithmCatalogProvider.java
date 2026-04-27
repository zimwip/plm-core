package com.plm.algorithm.internal;

import com.plm.algorithm.AlgorithmBean;
import com.plm.algorithm.AlgorithmParam;
import com.plm.algorithm.AlgorithmRegistry;
import com.plm.algorithm.AlgorithmType;
import com.plm.platform.algorithm.AlgorithmCatalogProvider;
import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest;
import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest.AlgoDef;
import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest.ParamDef;
import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest.TypeDef;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.util.ClassUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds the algorithm catalog from {@code @AlgorithmBean}/{@code @AlgorithmParam}
 * classes + {@link AlgorithmRegistry} module/domain metadata. Pushed to psm-admin
 * by {@link com.plm.platform.algorithm.AlgorithmRegistrationClient}.
 *
 * <p>Type id is read from the {@code @AlgorithmType} annotation on the implemented
 * interface (e.g. {@code algtype-action-handler} on {@code ActionHandler}).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PsmAlgorithmCatalogProvider implements AlgorithmCatalogProvider {

    private final ApplicationContext appCtx;
    private final AlgorithmRegistry registry;

    @Override
    public AlgorithmRegistrationRequest buildCatalog() {
        Map<String, TypeDef> types = new LinkedHashMap<>();
        List<AlgoDef> algorithms = new ArrayList<>();

        for (Map.Entry<String, Object> e : registry.getAllBeans().entrySet()) {
            String code = e.getKey();
            Object bean = e.getValue();
            Class<?> implClass = ClassUtils.getUserClass(bean);

            AlgorithmBean ann = implClass.getAnnotation(AlgorithmBean.class);
            if (ann == null) continue;

            String typeId = null;
            String javaInterface = null;
            for (Class<?> iface : collectInterfaces(implClass)) {
                AlgorithmType at = iface.getAnnotation(AlgorithmType.class);
                if (at == null) continue;
                typeId = at.id();
                javaInterface = iface.getName();
                types.putIfAbsent(at.id(), new TypeDef(at.id(), at.name(), at.description(), iface.getName()));
                break;
            }
            if (typeId == null) {
                log.warn("Algorithm '{}' ({}) has no @AlgorithmType on any interface — skipped",
                    code, implClass.getSimpleName());
                continue;
            }

            String name = ann.name() == null || ann.name().isBlank() ? implClass.getSimpleName() : ann.name();
            String description = ann.description() == null ? "" : ann.description();
            String beanName = lowerFirst(implClass.getSimpleName());
            String module = registry.getModuleForCode(code);
            String domain = registry.getDomainForCode(code);

            AlgorithmParam[] params = implClass.getAnnotationsByType(AlgorithmParam.class);
            List<ParamDef> paramDefs = new ArrayList<>(params.length);
            for (AlgorithmParam p : params) {
                paramDefs.add(new ParamDef(
                    p.name(),
                    p.label() == null || p.label().isBlank() ? p.name() : p.label(),
                    p.dataType() == null || p.dataType().isBlank() ? "STRING" : p.dataType(),
                    p.required(),
                    p.defaultValue() == null ? "" : p.defaultValue(),
                    p.displayOrder()
                ));
            }

            algorithms.add(new AlgoDef(
                deriveAlgorithmId(code),
                code,
                name,
                description,
                typeId,
                beanName,
                module,
                domain,
                paramDefs
            ));
        }

        log.info("Algorithm catalog built: {} types, {} algorithms", types.size(), algorithms.size());
        return new AlgorithmRegistrationRequest(new ArrayList<>(types.values()), algorithms);
    }

    private static java.util.Set<Class<?>> collectInterfaces(Class<?> clazz) {
        java.util.Set<Class<?>> out = new java.util.LinkedHashSet<>();
        Class<?> c = clazz;
        while (c != null && c != Object.class) {
            for (Class<?> iface : c.getInterfaces()) {
                out.add(iface);
                for (Class<?> parent : iface.getInterfaces()) out.add(parent);
            }
            c = c.getSuperclass();
        }
        return out;
    }

    private static String lowerFirst(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toLowerCase(s.charAt(0)) + s.substring(1);
    }

    /**
     * Stable id derived from code so upserts target the same row across restarts.
     * Existing V2 seed uses ad-hoc ids ({@code alg-not-frozen}); registration may
     * insert a parallel row keyed by code if id mismatches. The {@code uq_algorithm_code}
     * unique constraint protects against duplicate codes.
     */
    private static String deriveAlgorithmId(String code) {
        return "alg-" + code.replace('_', '-');
    }
}
