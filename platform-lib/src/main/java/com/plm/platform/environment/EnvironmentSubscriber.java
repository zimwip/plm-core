package com.plm.platform.environment;

import com.plm.platform.nats.NatsListenerFactory;
import com.plm.platform.spe.dto.RegistrySnapshot;
import com.plm.platform.spe.registry.LocalServiceRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.SmartLifecycle;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestTemplate;

/**
 * Read-only counterpart of {@link PlatformRegistrationClient}: pulls the
 * environment snapshot from platform-api and refreshes on every
 * {@code env.global.ENVIRONMENT_CHANGED} NATS event, but does <b>not</b>
 * register itself.
 *
 * <p>Used by spe-api: the gateway must observe the registry to route, but
 * is the edge — it never appears in the registry as a target.
 *
 * <p>Implements {@link SmartLifecycle} at phase 0 so:
 * <ol>
 *   <li>NATS subscriptions are active before the gateway port opens — no
 *       {@code ENVIRONMENT_CHANGED} events are missed during startup.</li>
 *   <li>The initial snapshot pull completes synchronously before the first
 *       request is served, so routes are built from a live registry from the
 *       very first request.</li>
 * </ol>
 */
@Slf4j
public class EnvironmentSubscriber implements SmartLifecycle {

    private final PlatformRegistrationProperties props;
    private final RestTemplate rest;
    private final LocalServiceRegistry localRegistry;
    private final NatsListenerFactory natsListenerFactory;
    private final ApplicationEventPublisher eventPublisher;

    private volatile boolean running = false;

    public EnvironmentSubscriber(PlatformRegistrationProperties props, RestTemplate rest,
                                 LocalServiceRegistry localRegistry,
                                 NatsListenerFactory natsListenerFactory,
                                 ApplicationEventPublisher eventPublisher) {
        this.props = props;
        this.rest = rest;
        this.localRegistry = localRegistry;
        this.natsListenerFactory = natsListenerFactory;
        this.eventPublisher = eventPublisher;
    }

    // ---- SmartLifecycle ----

    @Override
    public void start() {
        running = true;
        // Subscribe first so no ENVIRONMENT_CHANGED event is missed during the initial pull.
        subscribeNatsEvents();
        // Synchronous pull: platform-api is guaranteed healthy via compose depends_on.
        if (!initialPullSync()) {
            new Thread(this::initialPullWithBackoff, "platform-subscriber").start();
        }
    }

    @Override
    public void stop() {
        running = false;
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public int getPhase() {
        return 0; // Before gateway web server (WebServerStartStopLifecycle at Integer.MAX_VALUE - 1)
    }

    // ---- Sync bootstrap ----

    private boolean initialPullSync() {
        long[] backoffMs = { 500L, 1_000L, 2_000L, 4_000L, 8_000L };
        for (int attempt = 0; attempt < backoffMs.length; attempt++) {
            // Also accept already-populated: NATS handler may have raced ahead
            if (pullSnapshot() || localRegistry.isPopulated()) return true;
            try { Thread.sleep(backoffMs[attempt]); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return false; }
        }
        log.error("Environment snapshot bootstrap failed after {} sync attempts — gateway routes may be incomplete", backoffMs.length);
        return false;
    }

    private void initialPullWithBackoff() {
        long[] backoffMs = { 1_000L, 2_000L, 4_000L, 8_000L, 15_000L, 30_000L };
        for (int attempt = 0; attempt < backoffMs.length; attempt++) {
            if (pullSnapshot()) return;
            try { Thread.sleep(backoffMs[attempt]); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
        while (running) {
            if (pullSnapshot()) return;
            try { Thread.sleep(30_000L); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
    }

    // ---- NATS ----

    private void subscribeNatsEvents() {
        if (natsListenerFactory == null) return;
        try {
            natsListenerFactory.subscribe("env.global.PLATFORM_RESTARTED", msg -> {
                log.info("PLATFORM_RESTARTED received — pulling fresh snapshot");
                // Small delay so services have time to re-register before we snapshot.
                new Thread(() -> {
                    try { Thread.sleep(2_000L); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
                    pullSnapshot();
                }, "platform-subscriber-restart").start();
            });
            natsListenerFactory.subscribe("env.global.ENVIRONMENT_CHANGED", msg -> {
                log.info("ENVIRONMENT_CHANGED received — pulling fresh snapshot");
                pullSnapshot();
            });
            log.info("Subscribed (read-only) to env.global.PLATFORM_RESTARTED and env.global.ENVIRONMENT_CHANGED");
        } catch (Exception e) {
            log.warn("Failed to subscribe to platform NATS events: {}", e.getMessage());
        }
    }

    // ---- Periodic safety net ----

    @Scheduled(fixedDelay = 300_000L, initialDelay = 300_000L)
    public void periodicResync() {
        pullSnapshot();
    }

    // ---- Core pull ----

    private boolean pullSnapshot() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", props.serviceSecret());
            ResponseEntity<RegistrySnapshot> resp = rest.exchange(
                props.platformUrl() + props.snapshotPath(), HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<RegistrySnapshot>() {});
            if (resp.getBody() != null) {
                long prevVersion = localRegistry.snapshotVersion();
                localRegistry.updateFromSnapshot(resp.getBody());
                long newVersion = localRegistry.snapshotVersion();
                if (newVersion > prevVersion) {
                    log.info("Registry updated to v{} ({} services)",
                        newVersion, resp.getBody().services().size());
                    if (eventPublisher != null) {
                        eventPublisher.publishEvent(
                            new EnvironmentSnapshotRefreshedEvent(this, newVersion));
                    }
                    return true;
                } else {
                    log.debug("Registry snapshot v{} already current (local v{})",
                        resp.getBody().version(), prevVersion);
                    return false;
                }
            }
            return false;
        } catch (Exception e) {
            log.debug("Subscriber snapshot pull failed: {}", e.getMessage());
            return false;
        }
    }
}
