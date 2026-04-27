package com.plm.platform.api.registry;

import com.plm.platform.settings.dto.SettingsRegisterRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;

/**
 * Internal endpoints for service registration of settings sections.
 * Protected by X-Service-Secret header (validated by the shared platform-lib auth filter).
 */
@Slf4j
@RestController
@RequestMapping("/internal/settings")
public class SettingsRegistrationController {

    private final SettingsSectionRegistry registry;

    public SettingsRegistrationController(SettingsSectionRegistry registry) {
        this.registry = registry;
    }

    /**
     * Register settings sections for a service.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody SettingsRegisterRequest request) {
        if (request.serviceCode() == null || request.serviceCode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "serviceCode is required"));
        }
        ServiceSettingsRegistration reg = registry.register(request);
        return ResponseEntity.ok(Map.of(
            "serviceCode", reg.serviceCode(),
            "instanceId", reg.instanceId(),
            "sectionCount", reg.sections().size(),
            "registeredAt", reg.registeredAt().toString()
        ));
    }

    /**
     * Deregister a specific instance of a service.
     */
    @DeleteMapping("/register/{serviceCode}/instances/{instanceId}")
    public ResponseEntity<Void> deregisterInstance(
            @PathVariable String serviceCode,
            @PathVariable String instanceId) {
        boolean removed = registry.deregisterInstance(serviceCode, instanceId);
        return removed ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    /**
     * Deregister all sections for a service (admin/debug).
     */
    @DeleteMapping("/register/{serviceCode}")
    public ResponseEntity<Void> deregister(@PathVariable String serviceCode) {
        boolean removed = registry.deregister(serviceCode);
        return removed ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    /**
     * List all registrations (debug).
     */
    @GetMapping("/register")
    public ResponseEntity<Collection<ServiceSettingsRegistration>> listAll() {
        return ResponseEntity.ok(registry.allRegistrations());
    }
}
