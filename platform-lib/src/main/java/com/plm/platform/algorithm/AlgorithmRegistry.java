package com.plm.platform.algorithm;

import com.plm.platform.algorithm.stats.AlgorithmStats;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.util.ClassUtils;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;

/**
 * Discovers all {@link AlgorithmBean}-annotated beans at startup, wraps each
 * in a timing proxy that records execution statistics, and indexes them by code.
 *
 * Registered as a bean by {@link AlgorithmRegistryAutoConfiguration}.
 * The {@code appClass} parameter (the service's {@code @SpringBootApplication} class,
 * which extends {@link com.plm.platform.PlatformService}) is used for Spring Modulith
 * module discovery; pass {@code null} to skip module metadata.
 */
@Slf4j
public class AlgorithmRegistry {

    private final ApplicationContext ctx;
    private final Class<?>           appClass;

    /** code → proxied bean (with stats collection) */
    private Map<String, Object> beansByCode    = new HashMap<>();
    /** code → original unwrapped bean (for type checks) */
    private Map<String, Object> rawBeansByCode = new HashMap<>();
    /** code → Spring Modulith module name (e.g. "node", "action") */
    private Map<String, String> moduleByCode   = new HashMap<>();
    /** code → first-level sub-package within the module (e.g. "transaction", "lifecycle") */
    private Map<String, String> domainByCode   = new HashMap<>();

    public AlgorithmRegistry(ApplicationContext ctx, Class<?> appClass) {
        this.ctx      = ctx;
        this.appClass = appClass;
    }

    @PostConstruct
    public void discover() {
        // Derive base package from the application class (e.g. "com.plm" from PlmApplication).
        // Used to extract module + domain names from bean package paths — pure string parsing,
        // no Spring Modulith API required.
        String basePackage = appClass != null ? appClass.getPackageName() : null;

        Map<String, Object> beans = ctx.getBeansWithAnnotation(AlgorithmBean.class);
        for (Object bean : beans.values()) {
            Class<?> implClass = ClassUtils.getUserClass(bean);
            AlgorithmBean ann = implClass.getAnnotation(AlgorithmBean.class);
            if (ann == null) continue;

            String code = ann.code();
            rawBeansByCode.put(code, bean);

            if (basePackage != null) {
                String implPkg = implClass.getPackageName();
                String prefix = basePackage + ".";
                if (implPkg.startsWith(prefix)) {
                    String rel = implPkg.substring(prefix.length());
                    String module = rel.split("\\.")[0];
                    moduleByCode.put(code, module);
                    String domain = computeDomain(implPkg, prefix + module);
                    if (domain != null) domainByCode.put(code, domain);
                }
            }

            Class<?>[] ifaces = bean.getClass().getInterfaces();
            if (ifaces.length > 0) {
                Object proxy = Proxy.newProxyInstance(
                    bean.getClass().getClassLoader(),
                    ifaces,
                    new StatsInvocationHandler(code, bean));
                beansByCode.put(code, proxy);
            } else {
                beansByCode.put(code, bean);
                log.warn("Algorithm '{}' has no interface — stats proxy not applied", code);
            }

            log.debug("Registered algorithm bean: code={} class={} proxied={}",
                code, bean.getClass().getSimpleName(), ifaces.length > 0);
        }
        log.info("AlgorithmRegistry: {} algorithm beans discovered", beansByCode.size());
    }

    /**
     * Resolves an algorithm bean by code, cast to the expected interface.
     * The returned object is a timing proxy — all calls are measured.
     */
    @SuppressWarnings("unchecked")
    public <T> T resolve(String code, Class<T> iface) {
        Object bean = beansByCode.get(code);
        if (bean == null) {
            throw new IllegalArgumentException("No algorithm bean registered for code: " + code);
        }
        if (!iface.isInstance(bean)) {
            throw new IllegalArgumentException(
                "Algorithm '" + code + "' (" + rawBeansByCode.get(code).getClass().getSimpleName()
                + ") does not implement " + iface.getSimpleName());
        }
        return (T) bean;
    }

    public boolean hasBean(String code) {
        return beansByCode.containsKey(code);
    }

    public Map<String, Object> getAllBeans() {
        return Map.copyOf(rawBeansByCode);
    }

    /** Spring Modulith module name for an algorithm code, or null if unknown. */
    public String getModuleForCode(String code) {
        return moduleByCode.get(code);
    }

    /** First-level sub-package (domain) within the module, or null. */
    public String getDomainForCode(String code) {
        return domainByCode.get(code);
    }

    /** Immutable snapshot of code → module name mappings. */
    public Map<String, String> getModuleByCode() {
        return Map.copyOf(moduleByCode);
    }

    /**
     * Extracts the first meaningful sub-package under the module base.
     *   com.plm.node.transaction.internal.handler → "transaction"
     *   com.plm.node.handler                       → "handler"
     *   com.plm.permission.internal                → null (skip pure-internal)
     */
    static String computeDomain(String classPackage, String modulePackage) {
        if (classPackage == null || modulePackage == null) return null;
        if (!classPackage.startsWith(modulePackage)) return null;
        String rel = classPackage.substring(modulePackage.length());
        if (rel.startsWith(".")) rel = rel.substring(1);
        if (rel.isEmpty()) return null;
        String[] parts = rel.split("\\.");
        for (String p : parts) {
            if (!"internal".equals(p)) return p;
        }
        return null;
    }

    /**
     * Dynamic proxy handler that measures execution time for every method call
     * and records it in {@link AlgorithmStats}.
     */
    private static class StatsInvocationHandler implements InvocationHandler {
        private final String code;
        private final Object target;

        StatsInvocationHandler(String code, Object target) {
            this.code   = code;
            this.target = target;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            if (method.getDeclaringClass() == Object.class) {
                return method.invoke(target, args);
            }
            if ("code".equals(method.getName()) && (args == null || args.length == 0)) {
                return method.invoke(target, args);
            }

            long start = System.nanoTime();
            try {
                return method.invoke(target, args);
            } catch (java.lang.reflect.InvocationTargetException e) {
                throw e.getCause();
            } finally {
                AlgorithmStats.forCode(code).record(System.nanoTime() - start);
            }
        }
    }
}
