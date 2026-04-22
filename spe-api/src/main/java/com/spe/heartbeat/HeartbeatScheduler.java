package com.spe.heartbeat;

import com.spe.registry.ServiceRegistration;
import com.spe.registry.ServiceRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class HeartbeatScheduler {

    private final ServiceRegistry registry;
    private final WebClient webClient;
    private final int failureThreshold;
    private final int timeoutMs;

    public HeartbeatScheduler(
        ServiceRegistry registry,
        WebClient.Builder builder,
        @Value("${spe.heartbeat.failure-threshold:3}") int failureThreshold,
        @Value("${spe.heartbeat.timeout-ms:3000}") int timeoutMs
    ) {
        this.registry = registry;
        this.webClient = builder.build();
        this.failureThreshold = failureThreshold;
        this.timeoutMs = timeoutMs;
    }

    @Scheduled(fixedDelayString = "${spe.heartbeat.interval-ms:10000}")
    public void tick() {
        List<ServiceRegistration> snapshot = new ArrayList<>(registry.allInstances());
        for (ServiceRegistration instance : snapshot) {
            ping(instance);
        }
    }

    private void ping(ServiceRegistration instance) {
        webClient.get()
            .uri(instance.healthUrl())
            .retrieve()
            .toBodilessEntity()
            .timeout(Duration.ofMillis(timeoutMs))
            .doOnNext(resp -> registry.markHeartbeat(
                instance.serviceCode(), instance.instanceId(), resp.getStatusCode().is2xxSuccessful()))
            .doOnError(err -> {
                registry.markHeartbeat(instance.serviceCode(), instance.instanceId(), false);
                int failures = registry.getInstance(instance.serviceCode(), instance.instanceId())
                    .map(ServiceRegistration::consecutiveFailures).orElse(0);
                log.warn("Heartbeat failed for {}/{} ({}): {} (failures={})",
                    instance.serviceCode(), instance.instanceId(), instance.healthUrl(), err.getMessage(), failures);
                if (failures >= failureThreshold) {
                    log.warn("Evicting {}/{} after {} consecutive heartbeat failures",
                        instance.serviceCode(), instance.instanceId(), failures);
                    registry.deregisterInstance(instance.serviceCode(), instance.instanceId(), "heartbeat-threshold");
                }
            })
            .onErrorResume(err -> reactor.core.publisher.Mono.empty())
            .subscribe();
    }
}
