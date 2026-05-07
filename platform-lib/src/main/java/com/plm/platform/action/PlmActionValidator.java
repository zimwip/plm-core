package com.plm.platform.action;

import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.ActionConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.support.AopUtils;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;

import java.lang.reflect.Method;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Startup validation for {@link PlmAction}-annotated service methods.
 *
 * <p>Validates that each {@code @PlmAction} code exists in ConfigCache
 * and is a dispatchable action (has a handler). Permission-only codes should use
 * {@code @PlmPermission} instead.
 *
 * <p>Also validates that {@code requiredPermissions} on actions reference
 * known permission codes in ConfigCache.
 *
 * <p>Registered conditionally by {@link PlmActionAutoConfiguration} when ConfigCache is available.
 */
@Slf4j
@RequiredArgsConstructor
public class PlmActionValidator {

    private final ApplicationContext ctx;
    private final ConfigCache        configCache;

    @EventListener(ContextRefreshedEvent.class)
    public void validate() {
        Set<String> unknown         = new LinkedHashSet<>();
        Set<String> notDispatchable = new LinkedHashSet<>();
        Set<String> checked         = new LinkedHashSet<>();

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

                var actionOpt = configCache.getAction(code);
                if (actionOpt.isEmpty()) {
                    unknown.add(code + " (on " + targetClass.getSimpleName() + "." + m.getName() + ")");
                } else if (actionOpt.get().handlerInstanceId() == null) {
                    notDispatchable.add(code + " (on " + targetClass.getSimpleName() + "." + m.getName() +
                        ") — use @PlmPermission instead");
                }
            }
        }

        Set<String> unknownPerms = new LinkedHashSet<>();
        Set<String> allPermCodes = new LinkedHashSet<>();
        for (ActionConfig action : configCache.getAllActions()) {
            if (action.requiredPermissions() != null) {
                allPermCodes.addAll(action.requiredPermissions());
            }
        }
        for (String permCode : allPermCodes) {
            if (configCache.getPermission(permCode).isEmpty()) {
                unknownPerms.add(permCode);
            }
        }

        int total = checked.size();
        if (unknown.isEmpty() && notDispatchable.isEmpty() && unknownPerms.isEmpty()) {
            log.info("PlmActionValidator: all {} @PlmAction codes validated OK", total);
        }
        if (!unknown.isEmpty()) {
            log.error("PlmActionValidator: {} unknown @PlmAction code(s):", unknown.size());
            unknown.forEach(entry -> log.error("  X {}", entry));
        }
        if (!notDispatchable.isEmpty()) {
            log.warn("PlmActionValidator: {} @PlmAction code(s) have no handler:", notDispatchable.size());
            notDispatchable.forEach(entry -> log.warn("  ! {}", entry));
        }
        if (!unknownPerms.isEmpty()) {
            log.error("PlmActionValidator: {} unknown permission code(s) in action requiredPermissions:",
                unknownPerms.size());
            unknownPerms.forEach(entry -> log.error("  X {}", entry));
        }
    }
}
