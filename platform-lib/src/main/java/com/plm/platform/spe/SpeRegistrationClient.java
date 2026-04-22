package com.plm.platform.spe;

import com.plm.platform.spe.dto.RegistrySnapshot;
import com.plm.platform.spe.registry.LocalServiceRegistry;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.info.BuildProperties;
import com.plm.platform.spe.dto.RegisterRequest;
import org.springframework.context.event.EventListener;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Registers this service instance with spe-api on startup (retry with
 * backoff) and re-registers periodically so an spe restart never leaves
 * us unrouted. On shutdown, best-effort deregister by instanceId.
 *
 * After successful registration, pulls the current registry snapshot
 * to bootstrap the local service registry for direct service-to-service calls.
 */
@Slf4j
public class SpeRegistrationClient {

    private final SpeRegistrationProperties props;
    private final RestTemplate rest;
    private final LocalServiceRegistry localRegistry;
    private final String version;

    private volatile boolean registered = false;
    private volatile String instanceId = null;

    public SpeRegistrationClient(SpeRegistrationProperties props, RestTemplate rest,
                                 LocalServiceRegistry localRegistry, BuildProperties buildProperties) {
        this.props = props;
        this.rest = rest;
        this.localRegistry = localRegistry;
        this.version = buildProperties != null ? buildProperties.getVersion() : "unknown";
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        new Thread(this::attemptWithBackoff, "spe-registration").start();
    }

    @Scheduled(fixedDelay = 300_000L, initialDelay = 300_000L)
    public void periodicReRegister() {
        if (postRegistration(1)) {
            pullRegistrySnapshot();
        }
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

    private boolean postRegistration(int attempt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", props.serviceSecret());
            headers.set("Content-Type", "application/json");

            RegisterRequest body = new RegisterRequest(
                props.serviceCode(),
                props.selfBaseUrl(),
                props.selfBaseUrl() + "/actuator/health",
                props.routePrefix(),
                props.extraPaths(),
                version,
                props.spaceTag()
            );

            ResponseEntity<Map<String, Object>> resp = rest.exchange(
                props.speUrl() + "/api/spe/registry", HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> respBody = resp.getBody();
            String returnedId = respBody != null ? (String) respBody.get("instanceId") : null;
            if (returnedId != null) this.instanceId = returnedId;
            if (!registered) {
                String tag = props.spaceTag();
                String tagLabel = (tag == null || tag.isBlank()) ? "untagged" : tag;
                log.info("Registered with spe-api at {} as instance {} (attempt {}, tag: {})",
                    props.speUrl(), this.instanceId, attempt, tagLabel);
            }
            registered = true;

            // Bootstrap local registry after first successful registration
            pullRegistrySnapshot();

            return true;
        } catch (RestClientException e) {
            if (attempt <= 5 || attempt % 10 == 0) {
                log.warn("spe-api registration attempt {} failed: {}", attempt, e.getMessage());
            }
            return false;
        }
    }

    private void pullRegistrySnapshot() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", props.serviceSecret());
            ResponseEntity<RegistrySnapshot> resp = rest.exchange(
                props.speUrl() + "/api/spe/registry/snapshot", HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<RegistrySnapshot>() {});
            if (resp.getBody() != null) {
                localRegistry.updateFromSnapshot(resp.getBody());
                log.info("Bootstrapped local registry: {} services (snapshot v{})",
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
            rest.exchange(props.speUrl() + "/api/spe/registry/" + props.serviceCode() + "/instances/" + instanceId,
                HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
            log.info("Deregistered instance {} from spe-api", instanceId);
        } catch (Exception e) {
            log.debug("Deregistration best-effort: {}", e.getMessage());
        }
    }
}
