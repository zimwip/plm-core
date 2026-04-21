package com.plm.permission.internal;

import com.plm.permission.PermissionRegistry;
import com.plm.shared.authorization.PermissionScope;
import com.plm.shared.authorization.PlmPermission;
import com.plm.shared.authorization.PlmPermissions;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.support.AopUtils;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Startup validation for {@link PlmPermission} annotations.
 *
 * <ul>
 *   <li>Validates each permission code exists in the {@code permission} table
 *       (via {@link PermissionRegistry}).</li>
 *   <li>Validates scope consistency: SpEL expressions on annotation must match
 *       the scope defined in the {@code permission} table.</li>
 *   <li>Records annotation usage sites in {@link PermissionRegistry}.</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlmPermissionValidator {

    private final ApplicationContext ctx;
    private final PermissionRegistry registry;

    @EventListener(ContextRefreshedEvent.class)
    public void validate() {
        Set<String> unknown      = new LinkedHashSet<>();
        Set<String> inconsistent = new LinkedHashSet<>();
        Set<String> checked      = new LinkedHashSet<>();

        for (String beanName : ctx.getBeanDefinitionNames()) {
            Object bean;
            try { bean = ctx.getBean(beanName); }
            catch (Exception e) { continue; }

            Class<?> targetClass = AopUtils.getTargetClass(bean);
            for (Method m : targetClass.getDeclaredMethods()) {
                List<PlmPermission> annotations = collectAnnotations(m);
                for (PlmPermission ann : annotations) {
                    String className  = targetClass.getSimpleName();
                    String methodName = m.getName();

                    for (String code : ann.value()) {
                        registry.registerSite(code, className, methodName);

                        if (!checked.contains(code)) {
                            checked.add(code);
                            if (!registry.exists(code)) {
                                unknown.add(code + " (on " + className + "." + methodName + ")");
                            }
                        }
                    }

                    validateScopeConsistency(ann, targetClass.getSimpleName(), m.getName(), inconsistent);
                }
            }
        }

        if (unknown.isEmpty() && inconsistent.isEmpty()) {
            log.info("PlmPermissionValidator: all {} @PlmPermission codes validated ✓", checked.size());
        }
        if (!unknown.isEmpty()) {
            log.error("PlmPermissionValidator: {} unknown permission code(s) — not in permission table:",
                unknown.size());
            unknown.forEach(entry -> log.error("  ✗ {}", entry));
        }
        if (!inconsistent.isEmpty()) {
            log.error("PlmPermissionValidator: {} scope inconsistencies:", inconsistent.size());
            inconsistent.forEach(entry -> log.error("  ✗ {}", entry));
        }
    }

    private List<PlmPermission> collectAnnotations(Method m) {
        List<PlmPermission> result = new ArrayList<>();
        PlmPermission single = m.getAnnotation(PlmPermission.class);
        if (single != null) result.add(single);
        PlmPermissions container = m.getAnnotation(PlmPermissions.class);
        if (container != null) {
            for (PlmPermission p : container.value()) result.add(p);
        }
        return result;
    }

    /**
     * Validates that the annotation's SpEL expressions are consistent with the
     * permission's scope from the DB.
     */
    private void validateScopeConsistency(PlmPermission ann, String className, String methodName,
                                          Set<String> inconsistent) {
        // Resolve scope from permission table for each code
        for (String code : ann.value()) {
            PermissionScope scope = registry.scopeFor(code);
            if (scope == null) continue; // already reported as unknown

            boolean hasNodeId     = !ann.nodeIdExpr().isEmpty();
            boolean hasNodeTypeId = !ann.nodeTypeIdExpr().isEmpty();
            boolean hasTransition = !ann.transitionIdExpr().isEmpty();
            boolean hasLinkId     = !ann.linkIdExpr().isEmpty();
            boolean hasNodeContext = hasNodeId || hasNodeTypeId || hasLinkId;

            if (scope == PermissionScope.NODE && !hasNodeContext) {
                inconsistent.add(className + "." + methodName +
                    ": permission '" + code + "' has scope=NODE — requires nodeIdExpr, nodeTypeIdExpr, or linkIdExpr");
            }
            if (scope == PermissionScope.LIFECYCLE && !hasNodeContext) {
                inconsistent.add(className + "." + methodName +
                    ": permission '" + code + "' has scope=LIFECYCLE — requires nodeIdExpr, nodeTypeIdExpr, or linkIdExpr");
            }
            if (scope == PermissionScope.LIFECYCLE && !hasTransition) {
                inconsistent.add(className + "." + methodName +
                    ": permission '" + code + "' has scope=LIFECYCLE — requires transitionIdExpr");
            }
            if (scope == PermissionScope.GLOBAL && hasNodeContext) {
                inconsistent.add(className + "." + methodName +
                    ": permission '" + code + "' has scope=GLOBAL — should not have nodeIdExpr/nodeTypeIdExpr/linkIdExpr");
            }
        }
    }
}
