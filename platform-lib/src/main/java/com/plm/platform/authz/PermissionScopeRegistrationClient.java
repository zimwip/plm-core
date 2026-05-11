package com.plm.platform.authz;

import com.plm.platform.authz.dto.ScopeRegistration;
import com.plm.platform.authz.dto.ScopeRegistrationRequest;
import com.plm.platform.authz.dto.ScopeRegistrationResponse;
import com.plm.platform.PlatformPaths;
import com.plm.platform.environment.PlatformRegistrationProperties;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Registers this service's permission scopes with pno-api at boot.
 * Mirrors {@code SettingsRegistrationClient}: exponential backoff (1s/2s/4s/8s/15s/30s)
 * then 30s∞ retry; periodic re-register every 300s.
 *
 * <p>Service identity ({@code serviceCode}, {@code selfBaseUrl},
 * {@code serviceSecret}) is read from {@link PlatformRegistrationProperties} — the
 * single source of truth for sidecar identity across all platform-lib clients.
 *
 * <p><strong>Conflict handling:</strong> a 409 response means another service
 * already registered the same scope code with a different shape. Logged + thrown
 * as {@link IllegalStateException} so this service fails to bootstrap. Two
 * services disagreeing about a scope's shape is a deployment bug, not something
 * to retry around.
 */
@Slf4j
public class PermissionScopeRegistrationClient {

    private static final String PNO_SERVICE_CODE = "pno";
    private static final String REGISTER_URL = PlatformPaths.internalPath(PNO_SERVICE_CODE, "/scopes/register");

    private final PermissionScopeRegistrationProperties props;
    private final PlatformRegistrationProperties platformProps;
    private final RestTemplate rest;
    private final List<PermissionScopeContribution> contributions;

    private volatile boolean registered = false;
    private volatile String instanceId;

    public PermissionScopeRegistrationClient(PermissionScopeRegistrationProperties props,
                                             PlatformRegistrationProperties platformProps,
                                             RestTemplate rest,
                                             List<PermissionScopeContribution> contributions) {
        this.props = props;
        this.platformProps = platformProps;
        this.rest = rest;
        this.contributions = contributions;
        this.instanceId = computeInstanceId(platformProps.selfBaseUrl());
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        new Thread(this::attemptWithBackoff, "permission-scope-registration").start();
    }

    @Scheduled(fixedDelay = 300_000L, initialDelay = 300_000L)
    public void periodicReRegister() {
        if (!registered) return;
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
            List<ScopeRegistration> scopes = contributions.stream()
                .map(PermissionScopeContribution::definition)
                .collect(Collectors.toList());

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", platformProps.serviceSecret());
            headers.set("Content-Type", "application/json");

            ScopeRegistrationRequest body = new ScopeRegistrationRequest(
                platformProps.serviceCode(), instanceId, scopes
            );

            ResponseEntity<ScopeRegistrationResponse> resp = rest.exchange(
                props.pnoUrl() + REGISTER_URL, HttpMethod.POST,
                new HttpEntity<>(body, headers),
                ScopeRegistrationResponse.class);

            if (!registered) {
                log.info("Registered {} permission scope(s) with pno-api at {} as instance {} (attempt {})",
                    scopes.size(), props.pnoUrl(), instanceId, attempt);
            }
            registered = true;
            return true;
        } catch (HttpStatusCodeException e) {
            HttpStatusCode code = e.getStatusCode();
            if (code.value() == HttpStatus.CONFLICT.value()) {
                String body = e.getResponseBodyAsString();
                log.error("Permission scope registration rejected by pno-api with 409 Conflict — fatal. Response: {}", body);
                throw new IllegalStateException("Conflicting permission scope registration: " + body, e);
            }
            if (attempt <= 5 || attempt % 10 == 0) {
                log.warn("pno-api scope registration attempt {} failed: HTTP {}", attempt, code.value());
            }
            return false;
        } catch (RestClientException e) {
            if (attempt <= 5 || attempt % 10 == 0) {
                log.warn("pno-api scope registration attempt {} failed: {}", attempt, e.getMessage());
            }
            return false;
        }
    }

    @PreDestroy
    public void onShutdown() {
        // No deregister endpoint — scope rows persist by design.
    }

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
            return Integer.toString(baseUrl.hashCode());
        }
    }
}
