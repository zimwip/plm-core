package com.plm.platform.config;

import com.plm.platform.config.dto.ConfigSnapshot;
import com.plm.platform.nats.NatsListenerFactory;
import com.plm.platform.PlatformPaths;
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
        // Event-driven bootstrap (no compose depends_on, no retry storm):
        //   1. Subscribe to CONFIG_CHANGED FIRST so no event is missed while we pull.
        //   2. One best-effort pull — succeeds if psm-admin (psa) is already up.
        //   3. If it fails, stay UP but UNCONFIGURED and wait for psa's event. psa
        //      emits a CONFIG_CHANGED when it becomes ready (boot announce), so a
        //      consumer that started first is woken as soon as config exists.
        // Consumers gate config-dependent requests on ConfigCache.isPopulated()
        // and return "not configured" until the first snapshot lands.
        subscribeToNats();
        if (!pullConfigSnapshot(1)) {
            log.warn("Config not available at startup — service is UP but UNCONFIGURED; "
                + "waiting for {} (psa emits one when ready)", NATS_SUBJECT);
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

    private boolean pullConfigSnapshot(int attempt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", props.serviceSecret());
            ResponseEntity<ConfigSnapshot> resp = rest.exchange(
                props.adminUrl() + SNAPSHOT_URL, HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<ConfigSnapshot>() {});
            if (resp.getBody() != null) {
                long before = configCache.snapshotVersion();
                configCache.updateFromSnapshot(resp.getBody()); // rejects stale (version <= current)
                // Only fan out ConfigSnapshotUpdatedEvent when the cache actually
                // advanced — otherwise every pull (incl. same-version re-pulls)
                // would rebuild all downstream caches (guards, state actions, …).
                if (configCache.snapshotVersion() > before) {
                    eventPublisher.publishEvent(new ConfigSnapshotUpdatedEvent(resp.getBody().version()));
                    log.info("Config cache loaded from psm-admin (snapshot v{}, attempt {})",
                        resp.getBody().version(), attempt);
                }
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
