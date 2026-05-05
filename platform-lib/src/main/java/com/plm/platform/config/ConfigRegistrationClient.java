package com.plm.platform.config;

import com.plm.platform.config.dto.ConfigSnapshot;
import com.plm.platform.nats.NatsListenerFactory;
import com.plm.platform.spe.PlatformPaths;
import io.nats.client.Dispatcher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.SmartLifecycle;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

/**
 * Bootstraps {@link ConfigCache} from psm-admin on startup (pull with backoff)
 * and subscribes to NATS for config change notifications.
 *
 * <p>Implements {@link SmartLifecycle} at phase 0 so the initial pull completes
 * synchronously before the web server opens its port (phase Integer.MAX_VALUE-1).
 * This guarantees ConfigCache is populated before the first request is served.
 *
 * <p>Flow:
 * <ol>
 *   <li>On startup → pull snapshot from {@code GET /internal/config/snapshot} (sync)</li>
 *   <li>Subscribe to NATS {@code env.service.psm-admin.CONFIG_CHANGED}</li>
 *   <li>On NATS message → re-pull snapshot to refresh cache</li>
 * </ol>
 */
@Slf4j
public class ConfigRegistrationClient implements SmartLifecycle {

    /** Service-code of psm-admin. Keep in sync with its {@code spe.registration.service-code}. */
    private static final String ADMIN_SERVICE_CODE = "psa";
    private static final String SNAPSHOT_URL = PlatformPaths.internalPath(ADMIN_SERVICE_CODE, "/config/snapshot");
    private static final String NATS_SUBJECT = "env.service." + ADMIN_SERVICE_CODE + ".CONFIG_CHANGED";

    private final ConfigRegistrationProperties props;
    private final RestTemplate rest;
    private final ConfigCache configCache;
    private final NatsListenerFactory natsListenerFactory;
    private final ApplicationEventPublisher eventPublisher;

    private volatile Dispatcher natsDispatcher;
    private volatile boolean running = false;

    public ConfigRegistrationClient(ConfigRegistrationProperties props,
                                    RestTemplate rest,
                                    ConfigCache configCache,
                                    NatsListenerFactory natsListenerFactory,
                                    ApplicationEventPublisher eventPublisher) {
        this.props = props;
        this.rest = rest;
        this.configCache = configCache;
        this.natsListenerFactory = natsListenerFactory;
        this.eventPublisher = eventPublisher;
    }

    // ---- SmartLifecycle ----

    @Override
    public void start() {
        running = true;
        // Synchronous bootstrap: psm-admin is guaranteed healthy via compose depends_on,
        // so the first attempt should succeed before the web server opens its port.
        if (!bootstrapSync()) {
            // Unexpected: psm-admin unreachable despite depends_on. Keep retrying in background.
            new Thread(this::bootstrapWithBackoff, "config-bootstrap").start();
        }
    }

    @Override
    public void stop() {
        running = false;
        if (natsDispatcher != null && natsListenerFactory != null) {
            natsListenerFactory.close(natsDispatcher);
        }
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public int getPhase() {
        return 0; // Before web server (WebServerStartStopLifecycle runs at Integer.MAX_VALUE - 1)
    }

    // ---- Bootstrap ----

    /** Tries synchronously with short backoff. Returns true if cache was populated. */
    private boolean bootstrapSync() {
        long[] backoffMs = { 500L, 1_000L, 2_000L, 4_000L, 8_000L };
        for (int attempt = 0; attempt < backoffMs.length; attempt++) {
            if (pullConfigSnapshot(attempt + 1)) {
                subscribeToNats();
                return true;
            }
            try { Thread.sleep(backoffMs[attempt]); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return false; }
        }
        log.error("Config cache bootstrap failed after {} sync attempts — service will start without config", backoffMs.length);
        return false;
    }

    private void bootstrapWithBackoff() {
        long[] backoffMs = { 1_000L, 2_000L, 4_000L, 8_000L, 15_000L, 30_000L };
        for (int attempt = 0; attempt < backoffMs.length; attempt++) {
            if (pullConfigSnapshot(attempt + 1)) {
                subscribeToNats();
                return;
            }
            try { Thread.sleep(backoffMs[attempt]); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
        int attempt = backoffMs.length;
        while (true) {
            attempt++;
            if (pullConfigSnapshot(attempt)) {
                subscribeToNats();
                return;
            }
            try { Thread.sleep(30_000L); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
    }

    private boolean pullConfigSnapshot(int attempt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", props.serviceSecret());
            ResponseEntity<ConfigSnapshot> resp = rest.exchange(
                props.adminUrl() + SNAPSHOT_URL, HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<ConfigSnapshot>() {});
            if (resp.getBody() != null) {
                configCache.updateFromSnapshot(resp.getBody());
                eventPublisher.publishEvent(new ConfigSnapshotUpdatedEvent(resp.getBody().version()));
                log.info("Config cache loaded from psm-admin (snapshot v{}, attempt {})",
                    resp.getBody().version(), attempt);
                return true;
            }
            return false;
        } catch (Exception e) {
            if (attempt <= 5 || attempt % 10 == 0) {
                log.warn("Config snapshot pull attempt {} failed: {}", attempt, e.getMessage());
            }
            return false;
        }
    }

    private void subscribeToNats() {
        if (natsListenerFactory == null) {
            log.info("NATS not available — config changes will not be auto-refreshed");
            return;
        }
        natsDispatcher = natsListenerFactory.subscribe(NATS_SUBJECT, msg -> {
            log.info("Received CONFIG_CHANGED via NATS — refreshing config cache");
            pullConfigSnapshot(0);
        });
        log.info("Subscribed to NATS subject: {}", NATS_SUBJECT);
    }
}
