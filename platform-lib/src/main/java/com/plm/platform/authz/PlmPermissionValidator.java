package com.plm.platform.authz;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.support.AopUtils;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Startup validator for {@link PlmPermission} sites.
 *
 * <ul>
 *   <li>Every permission code must exist in the catalog.</li>
 *   <li>The set of {@link KeyExpr#name()} declared on the annotation must
 *       cover (or be a subset of) the scope's effective keys. Missing keys
 *       usually mean a resolver is expected to fill them in; extra keys are
 *       a bug.</li>
 * </ul>
 *
 * <p>Logs errors — does not fail boot, matching the previous behavior in
 * psm-api. Enforcement is otherwise transparent.
 */
@Slf4j
public class PlmPermissionValidator {

    private final ApplicationContext         ctx;
    private final PermissionCatalogPort      catalog;
    private final ScopeDefinitionCache       scopes;

    public PlmPermissionValidator(ApplicationContext ctx,
                                  PermissionCatalogPort catalog,
                                  ScopeDefinitionCache scopes) {
        this.ctx     = ctx;
        this.catalog = catalog;
        this.scopes  = scopes;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void validate() {
        Set<String> unknown      = new LinkedHashSet<>();
        Set<String> inconsistent = new LinkedHashSet<>();
        Set<String> checked      = new LinkedHashSet<>();

        for (String beanName : ctx.getBeanDefinitionNames()) {
            Object bean;
            try { bean = ctx.getBean(beanName); } catch (Exception e) { continue; }

            Class<?> targetClass = AopUtils.getTargetClass(bean);
            for (Method m : targetClass.getDeclaredMethods()) {
                for (PlmPermission ann : collectAnnotations(m)) {
                    String where = targetClass.getSimpleName() + "." + m.getName();
                    for (String code : ann.value()) {
                        if (checked.add(code) && !catalog.exists(code)) {
                            unknown.add(code + " (on " + where + ")");
                        }
                    }
                    validateKeys(ann, where, inconsistent);
                }
            }
        }

        if (unknown.isEmpty() && inconsistent.isEmpty()) {
            log.info("PlmPermissionValidator: all {} @PlmPermission code(s) validated", checked.size());
        }
        if (!unknown.isEmpty()) {
            log.error("PlmPermissionValidator: {} unknown permission code(s):", unknown.size());
            unknown.forEach(e -> log.error("  ✗ {}", e));
        }
        if (!inconsistent.isEmpty()) {
            log.error("PlmPermissionValidator: {} scope-key inconsistency:", inconsistent.size());
            inconsistent.forEach(e -> log.error("  ✗ {}", e));
        }
    }

    private List<PlmPermission> collectAnnotations(Method m) {
        List<PlmPermission> out = new ArrayList<>();
        PlmPermission single = m.getAnnotation(PlmPermission.class);
        if (single != null) out.add(single);
        PlmPermissions container = m.getAnnotation(PlmPermissions.class);
        if (container != null) {
            for (PlmPermission p : container.value()) out.add(p);
        }
        return out;
    }

    private void validateKeys(PlmPermission ann, String where, Set<String> inconsistent) {
        if (!scopes.isPopulated()) return; // scope cache not ready yet

        for (String code : ann.value()) {
            String scopeCode = catalog.scopeFor(code);
            if (scopeCode == null) continue;
            ScopeDefinitionCache.ScopeDef def = scopes.get(scopeCode);
            if (def == null) continue;

            Set<String> allowed = new LinkedHashSet<>(def.keys());
            for (KeyExpr ke : ann.keyExprs()) {
                if (!allowed.contains(ke.name())) {
                    inconsistent.add(where + ": key '" + ke.name()
                        + "' on @PlmPermission(" + code + ") is not declared by scope " + scopeCode
                        + " (expected keys: " + def.keys() + ")");
                }
            }
        }
    }
}
