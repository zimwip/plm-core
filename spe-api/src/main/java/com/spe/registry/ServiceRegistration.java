package com.spe.registry;

import java.time.Instant;
import java.util.List;

public record ServiceRegistration(
    String serviceCode,
    String baseUrl,
    String healthUrl,
    String routePrefix,
    List<String> extraPaths,
    String version,
    Instant registeredAt,
    Instant lastHeartbeatOk,
    int consecutiveFailures
) {
    public ServiceRegistration withHeartbeat(Instant at, int failures) {
        return new ServiceRegistration(
            serviceCode, baseUrl, healthUrl, routePrefix, extraPaths, version,
            registeredAt, at, failures
        );
    }
}
