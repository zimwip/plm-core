package com.spe.registry;

import com.plm.platform.spe.dto.RegistrySnapshot;
import com.plm.platform.spe.dto.ServiceInstanceInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Listens to registry change events and pushes the full snapshot
 * to every registered service instance's callback endpoint.
 */
@Slf4j
@Component
public class RegistryPushService {

    private final ServiceRegistry registry;
    private final WebClient webClient;
    private final String serviceSecret;
    private final AtomicLong versionCounter = new AtomicLong(0);

    public RegistryPushService(ServiceRegistry registry,
                               WebClient.Builder webClientBuilder,
                               @Value("${plm.service.secret}") String serviceSecret) {
        this.registry = registry;
        this.webClient = webClientBuilder.build();
        this.serviceSecret = serviceSecret;
    }

    @EventListener
    public void onInstanceRegistered(RegistryEvents.InstanceRegisteredEvent e) {
        pushToAll();
    }

    @EventListener
    public void onInstanceRemoved(RegistryEvents.InstanceRemovedEvent e) {
        pushToAll();
    }

    @EventListener
    public void onHealthStatusChanged(RegistryEvents.HealthStatusChangedEvent e) {
        pushToAll();
    }

    /**
     * Build current snapshot (used by push and by the REST endpoint).
     */
    public RegistrySnapshot buildSnapshot() {
        long version = versionCounter.incrementAndGet();
        Map<String, List<ServiceInstanceInfo>> services = new LinkedHashMap<>();
        for (var entry : registry.allInstancesByService().entrySet()) {
            services.put(entry.getKey(), entry.getValue().stream()
                .map(r -> new ServiceInstanceInfo(
                    r.instanceId(), r.serviceCode(), r.baseUrl(),
                    r.version(), r.spaceTag(), r.consecutiveFailures() == 0))
                .toList());
        }
        return new RegistrySnapshot(version, services);
    }

    private void pushToAll() {
        RegistrySnapshot snapshot = buildSnapshot();
        Collection<ServiceRegistration> allInstances = registry.allInstances();
        if (allInstances.isEmpty()) return;

        log.debug("Pushing registry v{} to {} instances", snapshot.version(), allInstances.size());
        for (ServiceRegistration instance : allInstances) {
            String callbackUrl = instance.baseUrl() + "/internal/registry/update";
            webClient.post()
                .uri(callbackUrl)
                .header("X-Service-Secret", serviceSecret)
                .bodyValue(snapshot)
                .retrieve()
                .toBodilessEntity()
                .timeout(Duration.ofSeconds(3))
                .doOnError(err -> log.debug("Push to {} failed: {}", callbackUrl, err.getMessage()))
                .onErrorResume(err -> Mono.empty())
                .subscribe();
        }
    }
}
