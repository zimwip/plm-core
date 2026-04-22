package com.pno.infrastructure.registration;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class SpeRegistrationClient {

    private static final String SERVICE_CODE = "pno-api";
    private static final String ROUTE_PREFIX = "/api/pno/**";
    private static final List<String> EXTRA_PATHS = List.of();

    private final String speUrl;
    private final String serviceSecret;
    private final String selfBaseUrl;
    private final String version;
    private final RestTemplate rest;

    private volatile boolean registered = false;

    public SpeRegistrationClient(
        @Value("${spe.api.url:http://spe-api:8082}") String speUrl,
        @Value("${plm.service.secret}") String serviceSecret,
        @Value("${spe.self.base-url:http://pno-api:8081}") String selfBaseUrl,
        @Autowired(required = false) BuildProperties buildProperties,
        RestTemplateBuilder restTemplateBuilder
    ) {
        this.speUrl = speUrl;
        this.serviceSecret = serviceSecret;
        this.selfBaseUrl = selfBaseUrl;
        this.version = buildProperties != null ? buildProperties.getVersion() : "unknown";
        this.rest = restTemplateBuilder.build();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        new Thread(this::attemptWithBackoff, "spe-registration").start();
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
            headers.set("X-Service-Secret", serviceSecret);
            headers.set("Content-Type", "application/json");

            Map<String, Object> body = Map.of(
                "serviceCode", SERVICE_CODE,
                "baseUrl", selfBaseUrl,
                "healthUrl", selfBaseUrl + "/actuator/health",
                "routePrefix", ROUTE_PREFIX,
                "extraPaths", EXTRA_PATHS,
                "version", version
            );

            rest.exchange(speUrl + "/api/spe/registry", HttpMethod.POST,
                new HttpEntity<>(body, headers), String.class);
            if (!registered) log.info("Registered with spe-api at {} (attempt {})", speUrl, attempt);
            registered = true;
            return true;
        } catch (RestClientException e) {
            if (attempt <= 5 || attempt % 10 == 0) {
                log.warn("spe-api registration attempt {} failed: {}", attempt, e.getMessage());
            }
            return false;
        }
    }

    @PreDestroy
    public void onShutdown() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", serviceSecret);
            rest.exchange(speUrl + "/api/spe/registry/" + SERVICE_CODE,
                HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
            log.info("Deregistered from spe-api");
        } catch (Exception e) {
            log.debug("Deregistration best-effort: {}", e.getMessage());
        }
    }
}
