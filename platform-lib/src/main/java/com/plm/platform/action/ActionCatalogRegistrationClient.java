package com.plm.platform.action;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    private final String platformUrl;
    private final String serviceCode;
    private final String serviceSecret;
    private final RestTemplate rest;
    private final List<ActionHandler> handlers;
    private final List<com.plm.platform.action.guard.ActionGuard> guards;
    private final List<AlgorithmCatalogContribution> contributions;

    private volatile boolean registered = false;

    public ActionCatalogRegistrationClient(String platformUrl, String serviceCode, String serviceSecret,
                                           RestTemplate rest,
                                           List<ActionHandler> handlers,
                                           List<com.plm.platform.action.guard.ActionGuard> guards,
                                           List<AlgorithmCatalogContribution> contributions) {
        this.platformUrl = platformUrl;
        this.serviceCode = serviceCode;
        this.serviceSecret = serviceSecret;
        this.rest = rest;
        this.handlers = handlers;
        this.guards = guards;
        this.contributions = contributions;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        new Thread(this::attemptWithBackoff, "action-catalog-registration").start();
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
        return contributions.stream().map(c -> {
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
            return entry;
        }).toList();
    }

    // "com.plm.node.handler.CheckoutActionHandler" → "node"
    private static String packageToModule(Class<?> cls) {
        String[] parts = cls.getPackageName().split("\\.");
        return parts.length > 2 ? parts[2] : "unknown";
    }
}
