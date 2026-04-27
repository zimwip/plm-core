package com.plm.platform.algorithm;

import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest;
import com.plm.platform.config.ConfigRegistrationProperties;
import com.plm.platform.spe.PlatformPaths;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

/**
 * On startup, asks the {@link AlgorithmCatalogProvider} for the local
 * algorithm catalog and POSTs it to psm-admin so DB rows are always in
 * sync with @AlgorithmBean code. psm-admin upserts then publishes
 * CONFIG_CHANGED so other consumers refresh their snapshot.
 *
 * <p>Reuses {@link ConfigRegistrationProperties} for adminUrl + serviceSecret.
 */
@Slf4j
public class AlgorithmRegistrationClient {

    private static final String ADMIN_SERVICE_CODE = "psa";
    private static final String REGISTER_URL = PlatformPaths.internalPath(ADMIN_SERVICE_CODE, "/algorithms/register");

    private final ConfigRegistrationProperties props;
    private final RestTemplate rest;
    private final AlgorithmCatalogProvider provider;

    public AlgorithmRegistrationClient(ConfigRegistrationProperties props,
                                       RestTemplate rest,
                                       AlgorithmCatalogProvider provider) {
        this.props = props;
        this.rest = rest;
        this.provider = provider;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        new Thread(this::registerWithBackoff, "algorithm-registration").start();
    }

    private void registerWithBackoff() {
        long[] backoffMs = { 1_000L, 2_000L, 4_000L, 8_000L, 15_000L, 30_000L };
        for (int attempt = 0; attempt < backoffMs.length; attempt++) {
            if (push(attempt + 1)) return;
            try { Thread.sleep(backoffMs[attempt]); }
            catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
        int attempt = backoffMs.length;
        while (true) {
            attempt++;
            if (push(attempt)) return;
            try { Thread.sleep(30_000L); }
            catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
    }

    private boolean push(int attempt) {
        try {
            AlgorithmRegistrationRequest payload = provider.buildCatalog();
            if (payload == null
                || (payload.types() == null || payload.types().isEmpty())
                && (payload.algorithms() == null || payload.algorithms().isEmpty())) {
                log.debug("Algorithm catalog is empty — skipping registration");
                return true;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Service-Secret", props.serviceSecret());

            rest.exchange(
                props.adminUrl() + REGISTER_URL, HttpMethod.POST,
                new HttpEntity<>(payload, headers), Void.class);

            log.info("Algorithm catalog registered with psm-admin: {} types, {} algorithms (attempt {})",
                payload.types().size(), payload.algorithms().size(), attempt);
            return true;
        } catch (Exception e) {
            if (attempt <= 5 || attempt % 10 == 0) {
                log.warn("Algorithm registration attempt {} failed: {}", attempt, e.getMessage());
            }
            return false;
        }
    }
}
