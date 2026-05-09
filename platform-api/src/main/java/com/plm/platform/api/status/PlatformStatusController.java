package com.plm.platform.api.status;

import com.plm.platform.api.environment.EnvironmentRegistry;
import com.plm.platform.api.environment.ServiceRegistration;
import com.plm.platform.api.environment.expected.ExpectedServicesConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Public platform status — exposes the cluster topology view served from
 * the in-process environment registry.
 *
 * <p>{@code overall} semantics:
 * <ul>
 *   <li>{@code up}       — every expected service has at least one healthy instance.</li>
 *   <li>{@code degraded} — some expected services missing or unhealthy.</li>
 *   <li>{@code down}     — no expected service has any healthy instance.</li>
 * </ul>
 *
 * <p>Synthesises a self-entry for platform-api if it is not yet in the
 * registry. All other services, including the gateway ({@code spe}), appear
 * via normal registration. Failures inside individual sub-fetches are caught
 * so a transient NATS or registry hiccup never breaks the whole status call.
 */
@Slf4j
@RestController
@RequestMapping("/status")
public class PlatformStatusController {

    private static final String PLATFORM_CODE = "platform";

    private final EnvironmentRegistry registry;
    private final ExpectedServicesConfig expectedConfig;
    private final NatsStatusService natsStatusService;
    private final String platformVersion;
    private final Instant bootTime = Instant.now();

    public PlatformStatusController(EnvironmentRegistry registry,
                                    ExpectedServicesConfig expectedConfig,
                                    NatsStatusService natsStatusService,
                                    @Autowired(required = false) BuildProperties buildProperties) {
        this.registry = registry;
        this.expectedConfig = expectedConfig;
        this.natsStatusService = natsStatusService;
        this.platformVersion = buildProperties != null ? buildProperties.getVersion() : "unknown";
    }

    @GetMapping("/nats")
    public Map<String, Object> nats() {
        try {
            return natsStatusService.fetchStats();
        } catch (Exception e) {
            log.warn("NATS status fetch failed: {}", e.getMessage());
            return Map.of("status", "down", "error", e.getMessage());
        }
    }

    @GetMapping
    public Map<String, Object> status() {
        Instant now = Instant.now();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("timestamp", now.toString());
        out.put("platformVersion", platformVersion);
        out.put("platformUptimeSeconds", Duration.between(bootTime, now).toSeconds());

        try {
            Map<String, Collection<ServiceRegistration>> byService = registry.allInstancesByService();
            List<String> expected = expectedConfig.getExpected();
            // If admin left expected list empty, fall back to dynamic discovery
            // (every registered service is treated as expected).
            if (expected.isEmpty()) {
                expected = new ArrayList<>(byService.keySet());
            }

            List<Map<String, Object>> services = new ArrayList<>();
            int totalInstances = 0;
            int totalHealthyInstances = 0;
            int totalFailingInstances = 0;
            int servicesWithHealthy = 0;
            int servicesMissing = 0;

            Set<String> emitted = new java.util.LinkedHashSet<>();

            for (String code : expected) {
                emitted.add(code);
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("serviceCode", code);

                if (PLATFORM_CODE.equals(code)) {
                    Collection<ServiceRegistration> instances = safeInstances(byService, code);
                    if (instances.isEmpty()) {
                        // Platform must be self-registered; if not, synthesise
                        // (same status semantics as gateway: we are responding).
                        appendPlatformSelf(entry);
                        totalInstances++;
                        totalHealthyInstances++;
                        servicesWithHealthy++;
                    } else {
                        ServiceCounts counts = appendInstances(entry, instances, now);
                        totalInstances += counts.total;
                        totalHealthyInstances += counts.healthy;
                        totalFailingInstances += counts.failing;
                        if (counts.healthy > 0) servicesWithHealthy++;
                    }
                    services.add(entry);
                    continue;
                }

                Collection<ServiceRegistration> instances = safeInstances(byService, code);
                if (instances.isEmpty()) {
                    entry.put("registered", false);
                    entry.put("healthy", false);
                    entry.put("status", "missing");
                    entry.put("instanceCount", 0);
                    entry.put("healthyInstances", 0);
                    entry.put("instances", List.of());
                    entry.put("version", null);
                    servicesMissing++;
                } else {
                    ServiceCounts counts = appendInstances(entry, instances, now);
                    totalInstances += counts.total;
                    totalHealthyInstances += counts.healthy;
                    totalFailingInstances += counts.failing;
                    if (counts.healthy > 0) servicesWithHealthy++;
                }
                services.add(entry);
            }

            // Also surface registered-but-not-expected services as informational
            // ("extra"). Useful when admin forgot to add a service to the list.
            for (var e : byService.entrySet()) {
                String code = e.getKey();
                if (emitted.contains(code)) continue;
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("serviceCode", code);
                entry.put("expected", false);
                ServiceCounts counts = appendInstances(entry, e.getValue(), now);
                totalInstances += counts.total;
                totalHealthyInstances += counts.healthy;
                totalFailingInstances += counts.failing;
                if (counts.healthy > 0) servicesWithHealthy++;
                services.add(entry);
            }

            int expectedSize = expected.size();
            String overall;
            if (expectedSize == 0)                          overall = "up";
            else if (servicesWithHealthy == 0)              overall = "down";
            else if (servicesWithHealthy < expectedSize)    overall = "degraded";
            else                                            overall = "up";

            out.put("overall", overall);
            out.put("expectedServices", expected);
            out.put("missingServices", servicesMissing);
            out.put("totalInstances", totalInstances);
            out.put("totalHealthyInstances", totalHealthyInstances);
            out.put("totalFailingInstances", totalFailingInstances);
            out.put("registryRevision", safeRevision());
            out.put("services", services);
            return out;
        } catch (Exception e) {
            log.warn("Status build failed: {}", e.getMessage(), e);
            out.put("overall", "down");
            out.put("error", "status build failed: " + e.getClass().getSimpleName());
            out.put("services", List.of());
            return out;
        }
    }

    private long safeRevision() {
        try { return registry.revision(); } catch (Exception e) { return -1L; }
    }

    private Collection<ServiceRegistration> safeInstances(
            Map<String, Collection<ServiceRegistration>> byService, String code) {
        try {
            Collection<ServiceRegistration> v = byService.get(code);
            return v == null ? List.of() : v;
        } catch (Exception e) {
            return List.of();
        }
    }

    private void appendPlatformSelf(Map<String, Object> entry) {
        entry.put("registered", true);
        entry.put("healthy", true);
        entry.put("status", "up");
        entry.put("instanceCount", 1);
        entry.put("healthyInstances", 1);
        entry.put("version", platformVersion);
        entry.put("path", "/api/platform/");
        Map<String, Object> inst = new LinkedHashMap<>();
        inst.put("instanceId", "self");
        inst.put("healthy", true);
        inst.put("status", "up");
        inst.put("synthetic", true);
        entry.put("instances", List.of(inst));
    }

    private ServiceCounts appendInstances(Map<String, Object> entry,
                                          Collection<ServiceRegistration> instances,
                                          Instant now) {
        int total = instances.size();
        int healthy = 0;
        int failing = 0;
        List<Map<String, Object>> instanceEntries = new ArrayList<>();
        ServiceRegistration representative = instances.iterator().next();
        for (ServiceRegistration r : instances) {
            boolean healthyFlag = r.consecutiveFailures() == 0;
            if (healthyFlag) healthy++; else failing++;
            Map<String, Object> ie = new LinkedHashMap<>();
            ie.put("instanceId", r.instanceId());
            ie.put("version", r.version());
            ie.put("healthy", healthyFlag);
            ie.put("status", healthyFlag ? "up" : "degraded");
            ie.put("registeredAt", r.registeredAt() == null ? null : r.registeredAt().toString());
            ie.put("lastHeartbeatOk", r.lastHeartbeatOk() == null ? null : r.lastHeartbeatOk().toString());
            ie.put("consecutiveFailures", r.consecutiveFailures());
            ie.put("ageSeconds",
                r.lastHeartbeatOk() != null
                    ? Duration.between(r.lastHeartbeatOk(), now).toSeconds()
                    : null);
            ie.put("spaceTag", r.spaceTag());
            ie.put("untagged", r.isUntagged());
            instanceEntries.add(ie);
        }
        boolean anyHealthy = healthy > 0;
        boolean allHealthy = healthy == total;
        entry.put("registered", true);
        entry.put("healthy", anyHealthy);
        entry.put("status", !anyHealthy ? "down" : (allHealthy ? "up" : "degraded"));
        entry.put("instanceCount", total);
        entry.put("healthyInstances", healthy);
        entry.put("instances", instanceEntries);
        entry.put("version", representative.version());
        entry.put("path", representative.routePrefix() == null ? null
            : representative.routePrefix().replaceAll("/\\*\\*$", "/").replaceAll("/\\*$", "/"));
        return new ServiceCounts(total, healthy, failing);
    }

    private record ServiceCounts(int total, int healthy, int failing) {}
}
