package com.plm.platform.action;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.platform.algorithm.AlgorithmType;
import com.plm.platform.event.PlmEvent;
import com.plm.platform.nats.NatsListenerFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.util.ClassUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Registers this service's action handlers, guards, and algorithm contributions
 * with platform-api at startup.
 * Re-registers periodically so a platform-api restart never leaves the catalog stale.
 *
 * Mirrors SettingsRegistrationClient pattern.
 */
@Slf4j
public class ActionCatalogRegistrationClient {

    private static final String REGISTER_PATH = "/api/platform/internal/registry/actions";
    private static final String PLATFORM_RESTARTED_SUBJECT = "env.global.PLATFORM_RESTARTED";

    private final String platformUrl;
    private final String serviceCode;
    private final String serviceSecret;
    private final RestTemplate rest;
    private final List<ActionHandler> handlers;
    private final List<com.plm.platform.action.guard.ActionGuard> guards;
    private final List<AlgorithmCatalogContribution> contributions;
    private final NatsListenerFactory natsListenerFactory;
    private final ApplicationContext appCtx;

    private volatile boolean registered = false;

    public ActionCatalogRegistrationClient(String platformUrl, String serviceCode, String serviceSecret,
                                           RestTemplate rest,
                                           List<ActionHandler> handlers,
                                           List<com.plm.platform.action.guard.ActionGuard> guards,
                                           List<AlgorithmCatalogContribution> contributions,
                                           NatsListenerFactory natsListenerFactory,
                                           ApplicationContext appCtx) {
        this.platformUrl = platformUrl;
        this.serviceCode = serviceCode;
        this.serviceSecret = serviceSecret;
        this.rest = rest;
        this.handlers = handlers;
        this.guards = guards;
        this.contributions = contributions;
        this.natsListenerFactory = natsListenerFactory;
        this.appCtx = appCtx;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        new Thread(this::attemptWithBackoff, "action-catalog-registration").start();
        subscribePlatformRestarted();
    }

    private void subscribePlatformRestarted() {
        if (natsListenerFactory == null) return;
        try {
            natsListenerFactory.subscribe(PLATFORM_RESTARTED_SUBJECT, msg -> {
                log.info("PLATFORM_RESTARTED received — re-registering action catalog for {}", serviceCode);
                new Thread(() -> {
                    try { Thread.sleep(2_000L); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
                    postRegistration();
                }, "action-catalog-reregistration").start();
            });
            log.debug("Subscribed to {}", PLATFORM_RESTARTED_SUBJECT);
        } catch (Exception e) {
            log.warn("Failed to subscribe to {}: {}", PLATFORM_RESTARTED_SUBJECT, e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 300_000L, initialDelay = 300_000L)
    public void periodicReRegister() {
        postRegistration();
    }

    private void attemptWithBackoff() {
        long[] backoffMs = { 1_000L, 2_000L, 4_000L, 8_000L, 15_000L, 30_000L };
        for (long delay : backoffMs) {
            if (postRegistration()) return;
            try { Thread.sleep(delay); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
        while (!registered) {
            if (postRegistration()) return;
            try { Thread.sleep(30_000L); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
    }

    private boolean postRegistration() {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("serviceCode", serviceCode);
            body.put("handlers", buildHandlerEntries());
            body.put("guards", buildGuardEntries());
            body.put("contributions", buildContributionEntries());
            body.put("events", buildEventEntries());

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", serviceSecret);
            headers.set("Content-Type", "application/json");
            rest.postForEntity(platformUrl + REGISTER_PATH, new HttpEntity<>(body, headers), Map.class);
            registered = true;
            log.info("Action catalog registered with platform-api: {} ({} handlers, {} guards, {} contributions)",
                serviceCode, handlers.size(), guards.size(), contributions.size());
            return true;
        } catch (RestClientException e) {
            log.debug("Action catalog registration failed (platform-api not ready?): {}", e.getMessage());
            return false;
        }
    }

    private List<Map<String, Object>> buildHandlerEntries() {
        return handlers.stream().map(h -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("code", h.actionCode());
            entry.put("label", h.actionCode());
            entry.put("module", packageToModule(h.getClass()));
            Optional<ActionRouteDescriptor> route = h.route();
            route.ifPresent(r -> {
                entry.put("httpMethod",   r.httpMethod());
                entry.put("pathTemplate", r.pathTemplate());
                entry.put("bodyShape",    r.bodyShape());
            });
            return entry;
        }).toList();
    }

    private List<Map<String, Object>> buildGuardEntries() {
        return guards.stream().map(g -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("code",   g.code());
            entry.put("label",  g.code());
            entry.put("module", packageToModule(g.getClass()));
            return entry;
        }).toList();
    }

    private List<Map<String, Object>> buildContributionEntries() {
        // typeId → contribution map; auto-scanned first, explicit contributions override
        Map<String, Map<String, Object>> byTypeId = new LinkedHashMap<>();

        // Auto-scan: group all @AlgorithmBean beans by @AlgorithmType on their interfaces
        if (appCtx != null) {
            Map<String, List<Map<String, Object>>> algsByType = new LinkedHashMap<>();
            Map<String, Map<String, Object>> typeMetaByTypeId = new LinkedHashMap<>();

            for (Object bean : appCtx.getBeansWithAnnotation(AlgorithmBean.class).values()) {
                Class<?> implClass = ClassUtils.getUserClass(bean);
                AlgorithmBean beanAnn = implClass.getAnnotation(AlgorithmBean.class);
                if (beanAnn == null) continue;

                String code   = beanAnn.code();
                String label  = beanAnn.name().isBlank() ? code : beanAnn.name();
                String module = packageToModule(implClass);
                Map<String, Object> algEntry = new LinkedHashMap<>();
                algEntry.put("code", code); algEntry.put("label", label); algEntry.put("module", module);

                for (Class<?> iface : allInterfaces(implClass)) {
                    for (AlgorithmType at : iface.getAnnotationsByType(AlgorithmType.class)) {
                        typeMetaByTypeId.computeIfAbsent(at.id(), k -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("typeId", at.id());
                            m.put("typeName", at.name());
                            m.put("javaInterface", iface.getSimpleName());
                            return m;
                        });
                        algsByType.computeIfAbsent(at.id(), k -> new ArrayList<>()).add(algEntry);
                    }
                }
            }

            for (Map.Entry<String, Map<String, Object>> e : typeMetaByTypeId.entrySet()) {
                Map<String, Object> entry = new LinkedHashMap<>(e.getValue());
                entry.put("algorithms", algsByType.getOrDefault(e.getKey(), List.of()));
                byTypeId.put(e.getKey(), entry);
            }
        }

        // Explicit AlgorithmCatalogContribution beans override auto-scanned entries
        for (AlgorithmCatalogContribution c : contributions) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("typeId",        c.typeId());
            entry.put("typeName",      c.typeName());
            entry.put("javaInterface", c.javaInterface());
            entry.put("algorithms", c.algorithms().stream().map(a -> {
                Map<String, Object> alg = new LinkedHashMap<>();
                alg.put("code",   a.code());
                alg.put("label",  a.label());
                alg.put("module", a.module());
                return alg;
            }).toList());
            byTypeId.put(c.typeId(), entry);
        }

        return List.copyOf(byTypeId.values());
    }

    private static Set<Class<?>> allInterfaces(Class<?> clazz) {
        Set<Class<?>> result = new LinkedHashSet<>();
        for (Class<?> iface : clazz.getInterfaces()) {
            result.add(iface);
            result.addAll(allInterfaces(iface));
        }
        return result;
    }

    /**
     * Scans all Spring beans for methods annotated with {@link PlmEvent} and
     * returns the deduplicated event catalog. Deduplication by code is needed
     * because Spring proxies may expose the same method multiple times.
     */
    private List<Map<String, Object>> buildEventEntries() {
        if (appCtx == null) return List.of();
        Map<String, Map<String, Object>> byCode = new LinkedHashMap<>();
        for (Object bean : appCtx.getBeansOfType(Object.class).values()) {
            Class<?> cls = ClassUtils.getUserClass(bean);
            for (Method m : cls.getMethods()) {
                PlmEvent ann = m.getAnnotation(PlmEvent.class);
                if (ann == null) continue;
                byCode.computeIfAbsent(ann.code(), k -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("code", ann.code());
                    entry.put("description", ann.description());
                    entry.put("scope", ann.scope());
                    return entry;
                });
            }
        }
        return List.copyOf(byCode.values());
    }

    // "com.plm.node.handler.CheckoutActionHandler" → "node"
    private static String packageToModule(Class<?> cls) {
        String[] parts = cls.getPackageName().split("\\.");
        return parts.length > 2 ? parts[2] : "unknown";
    }
}
