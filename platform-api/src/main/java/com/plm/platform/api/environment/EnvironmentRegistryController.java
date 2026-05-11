package com.plm.platform.api.environment;

import com.plm.platform.action.dto.RegisterRequest;
import com.plm.platform.action.dto.RegistrySnapshot;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Internal endpoints driving the environment registry. All routes require
 * {@code X-Service-Secret} (enforced upstream by platform-lib's
 * {@code PlmAuthFilter} since these live under {@code /internal/}).
 */
@RestController
@RequestMapping("/internal/environment")
public class EnvironmentRegistryController {

    private final EnvironmentRegistry registry;

    public EnvironmentRegistryController(EnvironmentRegistry registry) {
        this.registry = registry;
    }

    @PostMapping("/register")
    public ResponseEntity<ServiceRegistration> register(@RequestBody RegisterRequest req) {
        if (req.serviceCode() == null || req.baseUrl() == null || req.healthUrl() == null || req.routePrefix() == null) {
            return ResponseEntity.badRequest().build();
        }
        ServiceRegistration reg = registry.register(
            req.serviceCode(), req.baseUrl(), req.healthUrl(), req.routePrefix(),
            req.extraPaths(), req.version(), req.spaceTag()
        );
        return ResponseEntity.ok(reg);
    }

    @DeleteMapping("/register/{serviceCode}/instances/{instanceId}")
    public ResponseEntity<Void> deregisterInstance(@PathVariable String serviceCode,
                                                   @PathVariable String instanceId) {
        boolean removed = registry.deregisterInstance(serviceCode, instanceId, "client-deregister");
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/register/{serviceCode}")
    public ResponseEntity<Void> deregisterService(@PathVariable String serviceCode) {
        int removed = registry.deregisterService(serviceCode);
        return removed > 0 ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/snapshot")
    public RegistrySnapshot snapshot() {
        return registry.buildSnapshot();
    }
}
