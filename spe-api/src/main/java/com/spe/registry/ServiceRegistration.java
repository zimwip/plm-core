package com.spe.registry;

import java.time.Instant;
import java.util.List;

/**
 * One registered instance of a service. Multiple instances with the same
 * {@code serviceCode} may coexist — the gateway load-balances between them.
 * {@code instanceId} is a stable identifier derived from {@code baseUrl}
 * (so re-registering the same pod/container is idempotent).
 */
public record ServiceRegistration(
    String instanceId,
    String serviceCode,
    String baseUrl,
    String healthUrl,
    String routePrefix,
    List<String> extraPaths,
    String version,
    Instant registeredAt,
    Instant lastHeartbeatOk,
    int consecutiveFailures,
    String spaceTag
) {
    public ServiceRegistration withHeartbeat(Instant at, int failures) {
        return new ServiceRegistration(
            instanceId, serviceCode, baseUrl, healthUrl, routePrefix, extraPaths, version,
            registeredAt, at, failures, spaceTag
        );
    }

    /** True if this instance has no space tag (serves untagged/default requests). */
    public boolean isUntagged() {
        return spaceTag == null || spaceTag.isBlank();
    }
}
