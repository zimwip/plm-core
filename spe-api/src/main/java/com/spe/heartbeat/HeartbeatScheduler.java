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
        List<ServiceRegistration> snapshot = new ArrayList<>(registry.all());
        for (ServiceRegistration svc : snapshot) {
            ping(svc);
        }
    }

    private void ping(ServiceRegistration svc) {
        webClient.get()
            .uri(svc.healthUrl())
            .retrieve()
            .toBodilessEntity()
            .timeout(Duration.ofMillis(timeoutMs))
            .doOnNext(resp -> registry.markHeartbeat(svc.serviceCode(), resp.getStatusCode().is2xxSuccessful()))
            .doOnError(err -> {
                registry.markHeartbeat(svc.serviceCode(), false);
                int failures = registry.get(svc.serviceCode())
                    .map(ServiceRegistration::consecutiveFailures).orElse(0);
                log.warn("Heartbeat failed for {} ({}): {} (failures={})",
                    svc.serviceCode(), svc.healthUrl(), err.getMessage(), failures);
                if (failures >= failureThreshold) {
                    log.warn("Evicting {} after {} consecutive heartbeat failures", svc.serviceCode(), failures);
                    registry.deregister(svc.serviceCode());
                }
            })
            .onErrorResume(err -> reactor.core.publisher.Mono.empty())
            .subscribe();
    }
}
