package com.plm.infrastructure.security;

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
import java.util.List;
import java.util.Set;

/**
 * Startup introspection: validates every {@link PlmAction}-annotated service method
 * against the {@code action} table to catch configuration drift early.
 *
 * <h2>What is checked</h2>
 * For each {@code @PlmAction(value = "CODE")} found in any Spring bean:
 * <ul>
 *   <li>A row exists in {@code action} with {@code action_code = 'CODE'}.</li>
 *   <li>The action's {@code action_kind = 'BUILTIN'} (we only validate built-in codes;
 *       CUSTOM codes are registered at runtime and may not exist at boot).</li>
 * </ul>
 *
 * <h2>Behaviour on failure</h2>
 * Unknown BUILTIN action codes are logged as <b>ERROR</b>. The application still
 * starts — missing permission configuration is a degraded-mode scenario, not a
 * fatal crash (the permissive-default model keeps the app usable). If you want
 * hard failure, change the log call to throw {@link IllegalStateException}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlmActionValidator {

    private final ApplicationContext ctx;
    private final DSLContext         dsl;

    @EventListener(ContextRefreshedEvent.class)
    public void validate() {
        Set<String> unknown = new LinkedHashSet<>();
        Set<String> checked = new LinkedHashSet<>();

        for (String beanName : ctx.getBeanDefinitionNames()) {
            Object bean;
            try { bean = ctx.getBean(beanName); }
            catch (Exception e) { continue; } // skip non-instantiable beans

            Class<?> targetClass = AopUtils.getTargetClass(bean);
            for (Method m : targetClass.getDeclaredMethods()) {
                PlmAction ann = m.getAnnotation(PlmAction.class);
                if (ann == null) continue;

                String code = ann.value();
                if (checked.contains(code)) continue;
                checked.add(code);

                // Verify the action_code exists in the action catalog
                Integer count = dsl.fetchCount(
                    dsl.selectOne().from("action")
                       .where("action_code = ?", code)
                       .and("action_kind = 'BUILTIN'"));

                if (count == 0) {
                    unknown.add(code + " (on " + targetClass.getSimpleName() + "." + m.getName() + ")");
                }
            }
        }

        if (unknown.isEmpty()) {
            log.info("PlmActionValidator: all {} @PlmAction codes validated ✓", checked.size());
        } else {
            log.error("PlmActionValidator: {} unknown @PlmAction code(s) — not found in action table:",
                unknown.size());
            unknown.forEach(entry -> log.error("  ✗ {}", entry));
            log.error("Ensure action_code values match the `action` table (action_kind=BUILTIN). " +
                      "Affected methods will use the permissive default (no permission check).");
        }

        // Summary of validated codes at DEBUG
        if (log.isDebugEnabled()) {
            List<String> knownCodes = dsl.select(org.jooq.impl.DSL.field("action_code"))
                .from("action").where("action_kind = 'BUILTIN'")
                .fetch(org.jooq.impl.DSL.field("action_code"), String.class);
            log.debug("PlmActionValidator: validated codes: {}", checked);
            log.debug("PlmActionValidator: all BUILTIN codes in DB: {}", knownCodes);
        }
    }
}
