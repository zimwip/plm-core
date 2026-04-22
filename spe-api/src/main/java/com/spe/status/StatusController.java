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
 *   - "up"        : all expected services present and healthy
 *   - "degraded"  : some services missing or unhealthy
 *   - "down"      : no services registered
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
        Collection<ServiceRegistration> all = registry.all();
        Instant now = Instant.now();

        List<Map<String, Object>> services = new ArrayList<>();
        int healthy = 0;
        for (String expected : EXPECTED) {
            ServiceRegistration reg = all.stream()
                .filter(r -> expected.equals(r.serviceCode()))
                .findFirst().orElse(null);

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("serviceCode", expected);
            if (reg == null) {
                entry.put("registered", false);
                entry.put("healthy", false);
                entry.put("status", "missing");
                entry.put("version", null);
            } else {
                boolean healthyFlag = reg.consecutiveFailures() <= HEALTHY_MAX_FAILURES;
                entry.put("registered", true);
                entry.put("healthy", healthyFlag);
                entry.put("version", reg.version());
                // External path the gateway exposes — internal baseUrl is intentionally hidden.
                entry.put("path", externalPath(reg.routePrefix()));
                entry.put("registeredAt", reg.registeredAt().toString());
                entry.put("lastHeartbeatOk", reg.lastHeartbeatOk() != null ? reg.lastHeartbeatOk().toString() : null);
                entry.put("consecutiveFailures", reg.consecutiveFailures());
                entry.put("ageSeconds",
                    reg.lastHeartbeatOk() != null
                        ? Duration.between(reg.lastHeartbeatOk(), now).toSeconds()
                        : null);
                entry.put("status", healthyFlag ? "up" : "degraded");
                if (healthyFlag) healthy++;
            }
            services.add(entry);
        }

        String overall;
        if (healthy == EXPECTED.size())      overall = "up";
        else if (healthy == 0)               overall = "down";
        else                                 overall = "degraded";

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("overall", overall);
        // (helper below)
        out.put("timestamp", now.toString());
        out.put("gatewayVersion", gatewayVersion);
        out.put("gatewayUptimeSeconds", Duration.between(bootTime, now).toSeconds());
        out.put("expectedServices", EXPECTED);
        out.put("services", services);
        return out;
    }
}
