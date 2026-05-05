package com.plm.platform.api.environment.expected;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Admin CRUD for the expected-services list. Read is admin-only (gated
 * upstream), writes are admin-only and additionally trip
 * {@code EXPECTED_SERVICES_CHANGED} on NATS.
 */
@RestController
@RequestMapping("/admin/environment/expected-services")
public class ExpectedServicesController {

    private final ExpectedServicesConfig config;

    public ExpectedServicesController(ExpectedServicesConfig config) {
        this.config = config;
    }

    @GetMapping
    public Map<String, Object> get() {
        return Map.of("expectedServices", config.getExpected());
    }

    @PutMapping
    public Map<String, Object> replace(@RequestBody SetExpectedRequest body) {
        config.setExpected(body.expectedServices() != null ? body.expectedServices() : List.of());
        return Map.of("expectedServices", config.getExpected());
    }

    @PostMapping("/services")
    public Map<String, Object> addService(@RequestBody AddServiceRequest body) {
        config.addService(body.serviceCode());
        return Map.of("expectedServices", config.getExpected());
    }

    @DeleteMapping("/services/{code}")
    public Map<String, Object> removeService(@PathVariable String code) {
        boolean removed = config.removeService(code);
        return Map.of(
            "expectedServices", config.getExpected(),
            "removed", removed,
            "baseline", ExpectedServicesConfig.BASELINE.contains(code)
        );
    }

    public record SetExpectedRequest(List<String> expectedServices) {}
    public record AddServiceRequest(String serviceCode) {}
}
