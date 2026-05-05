package com.plm.platform.environment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

/**
 * Regression guard for the "no hardcoded /api/... in controllers" rule enforced
 * by {@link PlatformRegistrationClient#findHardcodedApiPaths(List)} at startup. If
 * someone re-introduces a controller whose {@code @RequestMapping} duplicates
 * the gateway prefix, this test fails before the change reaches runtime.
 */
class ControllerPathGuardTest {

    @Test
    void flagsAbsolutePathsThatDuplicateGatewayPrefix() {
        List<String> offenders = PlatformRegistrationClient.findHardcodedApiPaths(List.of(
            "/nodes",
            "/api/psm/nodes",
            "/api/pno/users"
        ));

        assertEquals(List.of("/api/psm/nodes", "/api/pno/users"), offenders);
    }

    @Test
    void acceptsRelativeAndInternalPaths() {
        List<String> offenders = PlatformRegistrationClient.findHardcodedApiPaths(List.of(
            "/nodes",
            "/internal/config/snapshot",
            "/actuator/health",
            "/v3/api-docs"
        ));

        assertTrue(offenders.isEmpty(), "Expected no offenders but got: " + offenders);
    }

    @Test
    void deduplicatesRepeatedOffenders() {
        List<String> offenders = PlatformRegistrationClient.findHardcodedApiPaths(List.of(
            "/api/psm/x",
            "/api/psm/x",
            "/api/psm/y"
        ));

        assertEquals(List.of("/api/psm/x", "/api/psm/y"), offenders);
    }
}
