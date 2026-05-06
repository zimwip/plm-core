package com.plm.platform.environment;

import com.plm.platform.nats.NatsListenerFactory;
import com.plm.platform.spe.dto.RegisterRequest;
import com.plm.platform.spe.dto.RegistrySnapshot;
import com.plm.platform.spe.registry.LocalServiceRegistry;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.info.BuildProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.List;
import java.util.Map;

/**
 * Registers this service instance with platform-api on startup (retry with
 * backoff) and re-registers periodically so a platform-api restart never
 * leaves us unrouted. On shutdown, best-effort deregister by instanceId.
 *
 * <p>Fires at {@link ApplicationReadyEvent} — after the web server opens its
 * port — so that platform-api and spe-api can immediately health-check the
 * registered URL. Registration is attempted synchronously first; if platform-api
 * is not reachable, a background thread retries with exponential backoff.
 *
 * <p>After successful registration, pulls the current registry snapshot to
 * bootstrap {@link LocalServiceRegistry} for direct service-to-service
 * calls. Subsequent changes arrive via NATS
 * ({@code env.global.ENVIRONMENT_CHANGED}) and trigger a fresh HTTP pull.
 */
@Slf4j
public class PlatformRegistrationClient {

    private final PlatformRegistrationProperties props;
    private final RestTemplate rest;
    private final LocalServiceRegistry localRegistry;
    private final NatsListenerFactory natsListenerFactory;
    private final ApplicationContext applicationContext;
    private final String version;

    private volatile boolean registered = false;
    private volatile String instanceId = null;

    public PlatformRegistrationClient(PlatformRegistrationProperties props, RestTemplate rest,
                                      LocalServiceRegistry localRegistry, BuildProperties buildProperties,
                                      NatsListenerFactory natsListenerFactory,
                                      ApplicationContext applicationContext) {
        this.props = props;
        this.rest = rest;
        this.localRegistry = localRegistry;
        this.natsListenerFactory = natsListenerFactory;
        this.applicationContext = applicationContext;
        this.version = buildProperties != null ? buildProperties.getVersion() : "unknown";
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        assertControllerPathsNotHardcoded();
        subscribeNatsEvents();
        // Try synchronously (web server is already open): platform-api can health-check immediately.
        if (!registerSync()) {
            new Thread(this::attemptWithBackoff, "platform-registration").start();
        }
    }

    private boolean registerSync() {
        long[] backoffMs = { 500L, 1_000L, 2_000L, 4_000L, 8_000L };
        for (int attempt = 0; attempt < backoffMs.length; attempt++) {
            if (postRegistration(attempt + 1)) return true;
            try { Thread.sleep(backoffMs[attempt]); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return false; }
        }
        return false;
    }

    private void attemptWithBackoff() {
        long[] backoffMs = { 1_000L, 2_000L, 4_000L, 8_000L, 15_000L, 30_000L };
        for (int attempt = 0; attempt < backoffMs.length; attempt++) {
            if (postRegistration(attempt + 1)) return;
            try { Thread.sleep(backoffMs[attempt]); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
        while (!registered) {
            if (postRegistration(-1)) return;
            try { Thread.sleep(30_000L); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
    }

    private void assertControllerPathsNotHardcoded() {
        if (applicationContext == null) return;
        String expected = props.contextPath();
        if (expected.isEmpty()) return;
        String actual = applicationContext.getEnvironment().getProperty("server.servlet.context-path", "");
        if (!expected.equals(actual)) return;

        RequestMappingHandlerMapping mapping;
        try {
            mapping = applicationContext.getBean(RequestMappingHandlerMapping.class);
        } catch (Exception ignored) {
            return;
        }
        List<String> allPaths = mapping.getHandlerMethods().keySet().stream()
            .flatMap(info -> info.getPatternValues().stream())
            .distinct()
            .toList();
        List<String> bad = findHardcodedApiPaths(allPaths);
        if (!bad.isEmpty()) {
            throw new IllegalStateException(
                "Controller paths must not start with '/api/...' — context-path already adds '"
                + expected + "'. Offenders: " + bad);
        }
    }

    static List<String> findHardcodedApiPaths(List<String> controllerPaths) {
        return controllerPaths.stream()
            .filter(p -> p.startsWith("/api/"))
            .distinct()
            .toList();
    }

    private void subscribeNatsEvents() {
        if (natsListenerFactory == null) return;
        try {
            natsListenerFactory.subscribe("env.global.PLATFORM_RESTARTED", msg -> {
                log.info("PLATFORM_RESTARTED received — re-registering with platform-api");
                new Thread(() -> {
                    try { Thread.sleep(2_000L); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
                    if (postRegistration(0)) {
                        log.info("Re-registered with platform-api after restart");
                    }
                }, "platform-re-register").start();
            });
            natsListenerFactory.subscribe("env.global.ENVIRONMENT_CHANGED", msg -> {
                log.debug("ENVIRONMENT_CHANGED received — pulling fresh snapshot");
                pullRegistrySnapshot();
            });
            log.info("Subscribed to env.global.PLATFORM_RESTARTED and env.global.ENVIRONMENT_CHANGED");
        } catch (Exception e) {
            log.warn("Failed to subscribe to platform NATS events: {}", e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 300_000L, initialDelay = 300_000L)
    public void periodicReRegister() {
        if (postRegistration(1)) {
            pullRegistrySnapshot();
        }
    }

    private boolean postRegistration(int attempt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", props.serviceSecret());
            headers.set("Content-Type", "application/json");

            String actualContextPath = applicationContext != null
                ? applicationContext.getEnvironment().getProperty("server.servlet.context-path", "")
                : "";
            RegisterRequest body = new RegisterRequest(
                props.serviceCode(),
                props.selfBaseUrl(),
                props.selfBaseUrl() + actualContextPath + "/actuator/health",
                props.routePrefix(),
                props.extraPaths(),
                version,
                props.spaceTag()
            );

            ResponseEntity<Map<String, Object>> resp = rest.exchange(
                props.platformUrl() + props.registrationPath(), HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> respBody = resp.getBody();
            String returnedId = respBody != null ? (String) respBody.get("instanceId") : null;
            if (returnedId != null) this.instanceId = returnedId;
            if (!registered) {
                String tag = props.spaceTag();
                String tagLabel = (tag == null || tag.isBlank()) ? "untagged" : tag;
                log.info("Registered with platform-api at {} as instance {} (attempt {}, tag: {})",
                    props.platformUrl(), this.instanceId, attempt, tagLabel);
            }
            registered = true;
            pullRegistrySnapshot();
            return true;
        } catch (RestClientException e) {
            if (attempt <= 5 || attempt % 10 == 0) {
                log.warn("platform-api registration attempt {} failed: {}", attempt, e.getMessage());
            }
            return false;
        }
    }

    private void pullRegistrySnapshot() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", props.serviceSecret());
            ResponseEntity<RegistrySnapshot> resp = rest.exchange(
                props.platformUrl() + props.snapshotPath(), HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<RegistrySnapshot>() {});
            if (resp.getBody() != null) {
                localRegistry.updateFromSnapshot(resp.getBody());
                log.debug("Local registry refreshed: {} services (snapshot v{})",
                    resp.getBody().services().size(), resp.getBody().version());
            }
        } catch (Exception e) {
            log.warn("Failed to pull registry snapshot: {}", e.getMessage());
        }
    }

    @PreDestroy
    public void onShutdown() {
        if (instanceId == null) return;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", props.serviceSecret());
            rest.exchange(
                props.platformUrl() + props.registrationPath() + "/" + props.serviceCode() + "/instances/" + instanceId,
                HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
            log.info("Deregistered instance {} from platform-api", instanceId);
        } catch (Exception e) {
            log.debug("Deregistration best-effort: {}", e.getMessage());
        }
    }
}
