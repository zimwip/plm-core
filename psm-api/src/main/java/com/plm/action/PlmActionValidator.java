package com.plm.action;
import com.plm.shared.action.PlmAction;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.aop.support.AopUtils;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Startup validation for {@link PlmAction}-annotated service methods.
 *
 * <p>Validates that each {@code @PlmAction} code exists in the {@code action} table
 * and is a dispatchable action (has a handler). Permission-only codes should use
 * {@code @PlmPermission} instead — those are validated by {@link PlmPermissionValidator}.
 *
 * <p>Also validates that {@code action_required_permission} codes reference
 * known permission codes in the permission table.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlmActionValidator {

    private final ApplicationContext ctx;
    private final DSLContext         dsl;

    @EventListener(ContextRefreshedEvent.class)
    public void validate() {
        Set<String> unknown        = new LinkedHashSet<>();
        Set<String> notDispatchable = new LinkedHashSet<>();
        Set<String> checked        = new LinkedHashSet<>();

        for (String beanName : ctx.getBeanDefinitionNames()) {
            Object bean;
            try { bean = ctx.getBean(beanName); }
            catch (Exception e) { continue; }

            Class<?> targetClass = AopUtils.getTargetClass(bean);
            for (Method m : targetClass.getDeclaredMethods()) {
                PlmAction ann = m.getAnnotation(PlmAction.class);
                if (ann == null) continue;

                String code = ann.value();
                if (checked.contains(code)) continue;
                checked.add(code);

                var row = dsl.select(
                        org.jooq.impl.DSL.field("action_code"),
                        org.jooq.impl.DSL.field("handler_instance_id"))
                    .from("action")
                    .where("action_code = ?", code)
                    .fetchOne();

                if (row == null) {
                    unknown.add(code + " (on " + targetClass.getSimpleName() + "." + m.getName() + ")");
                } else if (row.get("handler_instance_id") == null) {
                    notDispatchable.add(code + " (on " + targetClass.getSimpleName() + "." + m.getName() +
                        ") — use @PlmPermission instead");
                }
            }
        }

        // Validate action_required_permission codes against permission table
        Set<String> unknownPerms = new LinkedHashSet<>();
        dsl.select(org.jooq.impl.DSL.field("permission_code"))
            .from("action_required_permission")
            .fetchSet(org.jooq.impl.DSL.field("permission_code"), String.class)
            .forEach(permCode -> {
                Integer count = dsl.fetchCount(
                    dsl.selectOne().from("permission")
                       .where("permission_code = ?", permCode));
                if (count == 0) {
                    unknownPerms.add(permCode);
                }
            });

        // Report results
        int total = checked.size();
        if (unknown.isEmpty() && notDispatchable.isEmpty() && unknownPerms.isEmpty()) {
            log.info("PlmActionValidator: all {} @PlmAction codes validated ✓", total);
        }
        if (!unknown.isEmpty()) {
            log.error("PlmActionValidator: {} unknown @PlmAction code(s):", unknown.size());
            unknown.forEach(entry -> log.error("  ✗ {}", entry));
        }
        if (!notDispatchable.isEmpty()) {
            log.warn("PlmActionValidator: {} @PlmAction code(s) have no handler:", notDispatchable.size());
            notDispatchable.forEach(entry -> log.warn("  ⚠ {}", entry));
        }
        if (!unknownPerms.isEmpty()) {
            log.error("PlmActionValidator: {} unknown permission code(s) in action_required_permission:",
                unknownPerms.size());
            unknownPerms.forEach(entry -> log.error("  ✗ {}", entry));
        }
    }
}
