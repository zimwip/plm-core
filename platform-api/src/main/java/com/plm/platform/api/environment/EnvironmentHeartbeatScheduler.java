package com.plm.platform.api.environment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Probes every registered instance's {@code healthUrl} on a fixed interval.
 * After {@code failure-threshold} consecutive failures the instance is
 * evicted; this triggers an {@code ENVIRONMENT_CHANGED} publish via
 * {@link EnvironmentRegistry#deregisterInstance}.
 *
 * <p>Synchronous probes run on a small thread pool so a single hung service
 * cannot stall the schedule.
 */
@Slf4j
@Component
public class EnvironmentHeartbeatScheduler {

    private final EnvironmentRegistry registry;
    private final RestTemplate restTemplate;
    private final int failureThreshold;
    private final ExecutorService executor;

    public EnvironmentHeartbeatScheduler(
        EnvironmentRegistry registry,
        RestTemplateBuilder builder,
        @Value("${platform.heartbeat.failure-threshold:3}") int failureThreshold,
        @Value("${platform.heartbeat.timeout-ms:3000}") int timeoutMs,
        @Value("${platform.heartbeat.workers:8}") int workers
    ) {
        this.registry = registry;
        this.failureThreshold = failureThreshold;
        this.restTemplate = builder
            .connectTimeout(Duration.ofMillis(timeoutMs))
            .readTimeout(Duration.ofMillis(timeoutMs))
            .build();
        this.executor = Executors.newFixedThreadPool(Math.max(1, workers), r -> {
            Thread t = new Thread(r, "env-heartbeat");
            t.setDaemon(true);
            return t;
        });
    }

    @Scheduled(fixedDelayString = "${platform.heartbeat.interval-ms:10000}")
    public void tick() {
        List<ServiceRegistration> snapshot = new ArrayList<>(registry.allInstances());
        for (ServiceRegistration instance : snapshot) {
            executor.submit(() -> ping(instance));
        }
    }

    private void ping(ServiceRegistration instance) {
        try {
            restTemplate.getForEntity(instance.healthUrl(), String.class);
            registry.markHeartbeat(instance.serviceCode(), instance.instanceId(), true);
        } catch (Exception err) {
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
        }
    }

    @PreDestroy
    void shutdown() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) executor.shutdownNow();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            executor.shutdownNow();
        }
    }
}
