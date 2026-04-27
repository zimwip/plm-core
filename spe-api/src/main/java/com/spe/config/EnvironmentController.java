package com.spe.config;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST CRUD for the platform expected-services list.
 * GET is public (like /api/spe/status). Write operations require X-Service-Secret
 * (enforced by {@link ServiceSecretFilter}).
 */
@RestController
@RequestMapping("/api/spe/config/environment")
public class EnvironmentController {

    private final ExpectedServicesConfig config;

    public EnvironmentController(ExpectedServicesConfig config) {
        this.config = config;
    }

    /** Read current expected services. */
    @GetMapping
    public Map<String, Object> get() {
        return Map.of("expectedServices", config.getExpected());
    }

    /** Replace the entire expected-services list. */
    @PutMapping
    public Map<String, Object> replace(@RequestBody SetExpectedRequest body) {
        config.setExpected(body.expectedServices() != null ? body.expectedServices() : List.of());
        return Map.of("expectedServices", config.getExpected());
    }

    /** Add a single service code. */
    @PostMapping("/services")
    public Map<String, Object> addService(@RequestBody AddServiceRequest body) {
        config.addService(body.serviceCode());
        return Map.of("expectedServices", config.getExpected());
    }

    /** Remove a single service code. Baseline services cannot be removed. */
    @DeleteMapping("/services/{code}")
    public Map<String, Object> removeService(@PathVariable String code) {
        boolean removed = config.removeService(code);
        return Map.of(
            "expectedServices", config.getExpected(),
            "removed", removed,
            "baseline", ExpectedServicesConfig.BASELINE.contains(code)
        );
    }

    // --- DTOs ---

    public record SetExpectedRequest(List<String> expectedServices) {}
    public record AddServiceRequest(String serviceCode) {}
}
