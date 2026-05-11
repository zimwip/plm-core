package com.plm.platform.settings;

import com.plm.platform.nats.NatsListenerFactory;
import com.plm.platform.settings.dto.SettingSectionDto;
import com.plm.platform.settings.dto.SettingsRegisterRequest;
import com.plm.platform.PlatformPaths;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;

/**
 * Registers this service's settings sections with platform-api on startup
 * (retry with backoff) and re-registers periodically so a platform-api
 * restart never leaves sections unregistered.
 * On shutdown, best-effort deregister.
 * <p>
 * Collects all {@link SettingSectionDto} beans from the Spring context
 * and sends them as a batch.
 * <p>
 * Mirrors {@code SpeRegistrationClient} / {@code ConfigRegistrationClient} pattern.
 */
@Slf4j
public class SettingsRegistrationClient {

    /** Service-code of platform-api. Keep in sync with its {@code spe.registration.service-code}. */
    private static final String PLATFORM_SERVICE_CODE = "platform";
    private static final String REGISTER_URL = PlatformPaths.internalPath(PLATFORM_SERVICE_CODE, "/settings/register");

    private static final String PLATFORM_RESTARTED_SUBJECT = "env.global.PLATFORM_RESTARTED";

    private final SettingsRegistrationProperties props;
    private final RestTemplate rest;
    private final List<SettingSectionDto> sections;
    private final NatsListenerFactory natsListenerFactory;

    private volatile boolean registered = false;
    private volatile String instanceId;

    public SettingsRegistrationClient(SettingsRegistrationProperties props, RestTemplate rest,
                                      List<SettingSectionDto> sections,
                                      NatsListenerFactory natsListenerFactory) {
        this.props = props;
        this.rest = rest;
        this.sections = sections;
        this.natsListenerFactory = natsListenerFactory;
        this.instanceId = computeInstanceId(props.selfBaseUrl());
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        new Thread(this::attemptWithBackoff, "platform-registration").start();
        subscribePlatformRestarted();
    }

    private void subscribePlatformRestarted() {
        if (natsListenerFactory == null) return;
        try {
            natsListenerFactory.subscribe(PLATFORM_RESTARTED_SUBJECT, msg -> {
                log.info("PLATFORM_RESTARTED received — re-registering settings sections");
                new Thread(() -> {
                    try { Thread.sleep(2_000L); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
                    postRegistration(0);
                }, "settings-reregistration").start();
            });
            log.debug("Subscribed to {}", PLATFORM_RESTARTED_SUBJECT);
        } catch (Exception e) {
            log.warn("Failed to subscribe to {}: {}", PLATFORM_RESTARTED_SUBJECT, e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 300_000L, initialDelay = 300_000L)
    public void periodicReRegister() {
        postRegistration(1);
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

            SettingsRegisterRequest body = new SettingsRegisterRequest(
                props.serviceCode(),
                instanceId,
                sections
            );

            ResponseEntity<Map<String, Object>> resp = rest.exchange(
                props.settingsUrl() + REGISTER_URL, HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<Map<String, Object>>() {});

            Map<String, Object> respBody = resp.getBody();
            String returnedId = respBody != null ? (String) respBody.get("instanceId") : null;
            if (returnedId != null) this.instanceId = returnedId;

            if (!registered) {
                log.info("Registered {} settings sections with platform-api at {} as instance {} (attempt {})",
                    sections.size(), props.settingsUrl(), this.instanceId, attempt);
            }
            registered = true;
            return true;
        } catch (RestClientException e) {
            if (attempt <= 5 || attempt % 10 == 0) {
                log.warn("platform-api registration attempt {} failed: {}", attempt, e.getMessage());
            }
            return false;
        }
    }

    @PreDestroy
    public void onShutdown() {
        if (instanceId == null) return;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", props.serviceSecret());
            rest.exchange(
                props.settingsUrl() + REGISTER_URL + "/" + props.serviceCode() + "/instances/" + instanceId,
                HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
            log.info("Deregistered settings instance {} from platform-api", instanceId);
        } catch (Exception e) {
            log.debug("Settings deregistration best-effort: {}", e.getMessage());
        }
    }

    /**
     * Compute deterministic instance ID from base URL (SHA-1 truncated to 10 hex chars).
     * Same logic as spe-api's ServiceRegistry.
     */
    private static String computeInstanceId(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) return "unknown";
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] hash = md.digest(baseUrl.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(10);
            for (int i = 0; i < 5; i++) {
                sb.append(String.format("%02x", hash[i]));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return baseUrl.hashCode() + "";
        }
    }
}
