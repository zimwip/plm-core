package com.spe.registry;

import com.plm.platform.spe.dto.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spe/registry")
public class RegistryController {

    private final ServiceRegistry registry;

    public RegistryController(ServiceRegistry registry) {
        this.registry = registry;
    }

    @PostMapping
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

    /** Remove a single instance (called by the service itself on shutdown). */
    @DeleteMapping("/{serviceCode}/instances/{instanceId}")
    public ResponseEntity<Void> deregisterInstance(@PathVariable String serviceCode,
                                                   @PathVariable String instanceId) {
        boolean removed = registry.deregisterInstance(serviceCode, instanceId, "client-deregister");
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /** Remove all instances of a service (admin / tests). */
    @DeleteMapping("/{serviceCode}")
    public ResponseEntity<Void> deregisterService(@PathVariable String serviceCode) {
        int removed = registry.deregisterService(serviceCode);
        return removed > 0 ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /** Flat list of all instances (legacy shape). */
    @GetMapping
    public Collection<ServiceRegistration> list() {
        return registry.allInstances();
    }

    /** Grouped: serviceCode -> [instances]. */
    @GetMapping("/grouped")
    public Map<String, Collection<ServiceRegistration>> grouped() {
        return registry.allInstancesByService();
    }

    /** Available space tags per service (for admin UI tag configuration). */
    @GetMapping("/tags")
    public Map<String, List<String>> tags() {
        return registry.tagsByService();
    }

    /** Instances of one service. */
    @GetMapping("/{serviceCode}/instances")
    public Map<String, Object> instancesOf(@PathVariable String serviceCode) {
        Collection<ServiceRegistration> instances = registry.instancesOf(serviceCode);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("serviceCode", serviceCode);
        out.put("instanceCount", instances.size());
        out.put("instances", instances);
        return out;
    }
}
