package com.plm.domain.algorithm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;

/**
 * Discovers all {@link AlgorithmBean}-annotated beans at startup, wraps each
 * in a timing proxy that records execution statistics, and indexes them by code.
 *
 * Every call to the algorithm interface methods is measured and recorded in
 * {@link AlgorithmStats}. Stats are exposed via the {@code /api/psm/algorithms/stats}
 * endpoint.
 */
@Slf4j
@Component
public class AlgorithmRegistry {

    /** code → proxied bean (with stats collection) */
    private final Map<String, Object> beansByCode = new HashMap<>();
    /** code → original unwrapped bean (for type checks) */
    private final Map<String, Object> rawBeansByCode = new HashMap<>();

    public AlgorithmRegistry(ApplicationContext ctx) {
        Map<String, Object> beans = ctx.getBeansWithAnnotation(AlgorithmBean.class);
        for (Object bean : beans.values()) {
            AlgorithmBean ann = bean.getClass().getAnnotation(AlgorithmBean.class);
            if (ann == null) continue;

            String code = ann.code();
            rawBeansByCode.put(code, bean);

            // Wrap in timing proxy — intercepts all interface method calls
            Class<?>[] ifaces = bean.getClass().getInterfaces();
            if (ifaces.length > 0) {
                Object proxy = Proxy.newProxyInstance(
                    bean.getClass().getClassLoader(),
                    ifaces,
                    new StatsInvocationHandler(code, bean));
                beansByCode.put(code, proxy);
            } else {
                // No interface — store raw (stats won't be collected)
                beansByCode.put(code, bean);
                log.warn("Algorithm '{}' has no interface — stats proxy not applied", code);
            }

            log.debug("Registered algorithm bean: code={} class={} proxied={}",
                code, bean.getClass().getSimpleName(), ifaces.length > 0);
        }
        log.info("AlgorithmRegistry: {} algorithm beans discovered (all proxied with stats)", beansByCode.size());
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

    /**
     * Dynamic proxy handler that measures execution time for every method call
     * and records it in {@link AlgorithmStats}.
     */
    private static class StatsInvocationHandler implements InvocationHandler {
        private final String code;
        private final Object target;

        StatsInvocationHandler(String code, Object target) {
            this.code = code;
            this.target = target;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            // Skip Object methods (toString, equals, hashCode) — no stats
            if (method.getDeclaringClass() == Object.class) {
                return method.invoke(target, args);
            }
            // Skip the code() accessor — no stats needed
            if ("code".equals(method.getName()) && (args == null || args.length == 0)) {
                return method.invoke(target, args);
            }

            long start = System.nanoTime();
            try {
                return method.invoke(target, args);
            } finally {
                long duration = System.nanoTime() - start;
                AlgorithmStats.forCode(code).record(duration);
            }
        }
    }
}
