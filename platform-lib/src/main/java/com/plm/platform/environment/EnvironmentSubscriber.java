package com.plm.platform.environment;

import com.plm.platform.nats.NatsListenerFactory;
import com.plm.platform.spe.dto.RegistrySnapshot;
import com.plm.platform.spe.registry.LocalServiceRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
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
 */
@Slf4j
public class EnvironmentSubscriber {

    private final PlatformRegistrationProperties props;
    private final RestTemplate rest;
    private final LocalServiceRegistry localRegistry;
    private final NatsListenerFactory natsListenerFactory;
    private final ApplicationEventPublisher eventPublisher;

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

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        new Thread(this::initialPullWithBackoff, "platform-subscriber").start();
        subscribeNatsEvents();
    }

    private void subscribeNatsEvents() {
        if (natsListenerFactory == null) return;
        try {
            natsListenerFactory.subscribe("env.global.PLATFORM_RESTARTED", msg -> {
                log.info("PLATFORM_RESTARTED received — pulling fresh snapshot");
                new Thread(() -> {
                    try { Thread.sleep(2_000L); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
                    pullSnapshot();
                }, "platform-subscriber-restart").start();
            });
            natsListenerFactory.subscribe("env.global.ENVIRONMENT_CHANGED", msg -> {
                log.debug("ENVIRONMENT_CHANGED received — pulling fresh snapshot");
                pullSnapshot();
            });
            log.info("Subscribed (read-only) to env.global.PLATFORM_RESTARTED and env.global.ENVIRONMENT_CHANGED");
        } catch (Exception e) {
            log.warn("Failed to subscribe to platform NATS events: {}", e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 300_000L, initialDelay = 300_000L)
    public void periodicResync() {
        pullSnapshot();
    }

    private void initialPullWithBackoff() {
        long[] backoffMs = { 1_000L, 2_000L, 4_000L, 8_000L, 15_000L, 30_000L };
        for (long wait : backoffMs) {
            if (pullSnapshot()) return;
            try { Thread.sleep(wait); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
        while (!localRegistry.isPopulated()) {
            if (pullSnapshot()) return;
            try { Thread.sleep(30_000L); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
    }

    private boolean pullSnapshot() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", props.serviceSecret());
            ResponseEntity<RegistrySnapshot> resp = rest.exchange(
                props.platformUrl() + props.snapshotPath(), HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<RegistrySnapshot>() {});
            if (resp.getBody() != null) {
                localRegistry.updateFromSnapshot(resp.getBody());
                log.debug("Subscriber pulled snapshot v{} ({} services)",
                    resp.getBody().version(), resp.getBody().services().size());
                if (eventPublisher != null) {
                    eventPublisher.publishEvent(
                        new EnvironmentSnapshotRefreshedEvent(this, resp.getBody().version()));
                }
                return true;
            }
            return false;
        } catch (Exception e) {
            log.debug("Subscriber snapshot pull failed: {}", e.getMessage());
            return false;
        }
    }
}
