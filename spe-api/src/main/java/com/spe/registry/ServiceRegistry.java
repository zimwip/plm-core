package com.spe.registry;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class ServiceRegistry {

    private final ConcurrentHashMap<String, ServiceRegistration> byCode = new ConcurrentHashMap<>();
    private final ApplicationEventPublisher publisher;

    public ServiceRegistry(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public ServiceRegistration register(String serviceCode,
                                        String baseUrl,
                                        String healthUrl,
                                        String routePrefix,
                                        List<String> extraPaths,
                                        String version) {
        Instant now = Instant.now();
        ServiceRegistration reg = new ServiceRegistration(
            serviceCode, baseUrl, healthUrl, routePrefix,
            extraPaths == null ? List.of() : List.copyOf(extraPaths),
            version != null ? version : "unknown",
            now, now, 0
        );
        ServiceRegistration previous = byCode.put(serviceCode, reg);
        log.info("Service registered: {} v{} -> {} (prefix={}, extras={})",
            serviceCode, reg.version(), baseUrl, routePrefix, reg.extraPaths());
        publisher.publishEvent(new RegistryEvents.ServiceRegisteredEvent(this, reg));
        return reg;
    }

    public boolean deregister(String serviceCode) {
        ServiceRegistration removed = byCode.remove(serviceCode);
        if (removed != null) {
            log.info("Service deregistered: {}", serviceCode);
            publisher.publishEvent(new RegistryEvents.ServiceDeregisteredEvent(this, serviceCode));
            return true;
        }
        return false;
    }

    public Collection<ServiceRegistration> all() {
        return byCode.values();
    }

    public Optional<ServiceRegistration> get(String code) {
        return Optional.ofNullable(byCode.get(code));
    }

    public void markHeartbeat(String serviceCode, boolean ok) {
        byCode.computeIfPresent(serviceCode, (code, reg) -> {
            int failures = ok ? 0 : reg.consecutiveFailures() + 1;
            Instant last  = ok ? Instant.now() : reg.lastHeartbeatOk();
            return reg.withHeartbeat(last, failures);
        });
    }
}
