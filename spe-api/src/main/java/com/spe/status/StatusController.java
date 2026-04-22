package com.spe.status;

import com.spe.registry.ServiceRegistration;
import com.spe.registry.ServiceRegistry;
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

/**
 * Platform status — public (no auth). Summarises registry + heartbeat health.
 *
 * overall:
 *   - "up"        : every expected service has at least one healthy instance.
 *   - "degraded"  : some expected services healthy but not all.
 *   - "down"      : no expected service has any healthy instance (platform unusable).
 *
 * Failing instances are ignored for overall status — SPE cannot know the
 * expected instance count, so a failing instance is treated as transient.
 */
@RestController
@RequestMapping("/api/spe/status")
public class StatusController {

    private static final List<String> EXPECTED = List.of("psm-api", "pno-api");
    private static final int HEALTHY_MAX_FAILURES = 0;

    private final ServiceRegistry registry;
    private final String gatewayVersion;
    private final Instant bootTime = Instant.now();

    public StatusController(ServiceRegistry registry,
                            @Autowired(required = false) BuildProperties buildProperties) {
        this.registry = registry;
        this.gatewayVersion = buildProperties != null ? buildProperties.getVersion() : "unknown";
    }

    /** /api/psm/** → /api/psm/ — strip Ant-style glob suffix for display. */
    private static String externalPath(String routePrefix) {
        if (routePrefix == null) return null;
        String p = routePrefix.replaceAll("/\\*\\*$", "/").replaceAll("/\\*$", "/");
        return p.endsWith("/") ? p : p + "/";
    }

    @GetMapping
    public Map<String, Object> status() {
        Instant now = Instant.now();

        List<Map<String, Object>> services = new ArrayList<>();
        int servicesWithHealthy = 0;
        int totalInstances = 0;
        int totalHealthyInstances = 0;
        int totalFailingInstances = 0;

        for (String expected : EXPECTED) {
            Collection<ServiceRegistration> instances = registry.instancesOf(expected);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("serviceCode", expected);

            if (instances.isEmpty()) {
                entry.put("registered", false);
                entry.put("healthy", false);
                entry.put("status", "missing");
                entry.put("instanceCount", 0);
                entry.put("healthyInstances", 0);
                entry.put("instances", List.of());
                entry.put("version", null);
            } else {
                int healthyInstances = 0;
                List<Map<String, Object>> instanceEntries = new ArrayList<>();
                ServiceRegistration representative = instances.iterator().next();
                for (ServiceRegistration inst : instances) {
                    boolean healthyFlag = inst.consecutiveFailures() <= HEALTHY_MAX_FAILURES;
                    if (healthyFlag) healthyInstances++;
                    totalInstances++;
                    if (healthyFlag) totalHealthyInstances++; else totalFailingInstances++;

                    Map<String, Object> ie = new LinkedHashMap<>();
                    ie.put("instanceId", inst.instanceId());
                    ie.put("version", inst.version());
                    ie.put("healthy", healthyFlag);
                    ie.put("status", healthyFlag ? "up" : "degraded");
                    ie.put("registeredAt", inst.registeredAt().toString());
                    ie.put("lastHeartbeatOk", inst.lastHeartbeatOk() != null ? inst.lastHeartbeatOk().toString() : null);
                    ie.put("consecutiveFailures", inst.consecutiveFailures());
                    ie.put("ageSeconds",
                        inst.lastHeartbeatOk() != null
                            ? Duration.between(inst.lastHeartbeatOk(), now).toSeconds()
                            : null);
                    ie.put("spaceTag", inst.spaceTag());
                    ie.put("untagged", inst.isUntagged());
                    // Internal baseUrl intentionally hidden from public status.
                    instanceEntries.add(ie);
                }
                boolean anyHealthy = healthyInstances > 0;
                boolean allHealthy = healthyInstances == instances.size();
                String serviceStatus = !anyHealthy ? "down" : (allHealthy ? "up" : "degraded");

                entry.put("registered", true);
                entry.put("healthy", anyHealthy);
                entry.put("status", serviceStatus);
                entry.put("instanceCount", instances.size());
                entry.put("healthyInstances", healthyInstances);
                entry.put("instances", instanceEntries);
                entry.put("version", representative.version());
                entry.put("path", externalPath(representative.routePrefix()));

                if (anyHealthy) servicesWithHealthy++;
            }
            services.add(entry);
        }

        // Failing instances are transient (shutdown, restart) — SPE can't know
        // expected instance count. Only service-level health matters.
        String overall;
        if (servicesWithHealthy == 0)                      overall = "down";
        else if (servicesWithHealthy < EXPECTED.size())    overall = "degraded";
        else                                               overall = "up";

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("overall", overall);
        out.put("timestamp", now.toString());
        out.put("gatewayVersion", gatewayVersion);
        out.put("gatewayUptimeSeconds", Duration.between(bootTime, now).toSeconds());
        out.put("expectedServices", EXPECTED);
        out.put("totalInstances", totalInstances);
        out.put("totalHealthyInstances", totalHealthyInstances);
        out.put("services", services);
        return out;
    }
}
