package com.spe.registry;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/api/spe/registry")
public class RegistryController {

    private final ServiceRegistry registry;

    public RegistryController(ServiceRegistry registry) {
        this.registry = registry;
    }

    public record RegisterRequest(
        String serviceCode,
        String baseUrl,
        String healthUrl,
        String routePrefix,
        List<String> extraPaths,
        String version
    ) {}

    @PostMapping
    public ResponseEntity<ServiceRegistration> register(@RequestBody RegisterRequest req) {
        if (req.serviceCode() == null || req.baseUrl() == null || req.healthUrl() == null || req.routePrefix() == null) {
            return ResponseEntity.badRequest().build();
        }
        ServiceRegistration reg = registry.register(
            req.serviceCode(), req.baseUrl(), req.healthUrl(), req.routePrefix(), req.extraPaths(), req.version()
        );
        return ResponseEntity.ok(reg);
    }

    @DeleteMapping("/{serviceCode}")
    public ResponseEntity<Void> deregister(@PathVariable String serviceCode) {
        boolean removed = registry.deregister(serviceCode);
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping
    public Collection<ServiceRegistration> list() {
        return registry.all();
    }
}
