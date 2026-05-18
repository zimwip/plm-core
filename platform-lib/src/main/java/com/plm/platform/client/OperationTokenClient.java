package com.plm.platform.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Mints job-scoped operation tokens (typ=op) from spe-api.
 * Used by long-running async workers (e.g., CAD import) to obtain a token
 * that outlives the initial forward JWT (default 60s TTL).
 *
 * <p>The returned token carries a {@code jid} claim bound to {@code jobId}.
 * Services validate this claim against the {@code X-Job-Id} header on each request.
 */
@Slf4j
public class OperationTokenClient {

    private final RestTemplate rest;
    private final String speUrl;
    private final String serviceSecret;

    public OperationTokenClient(RestTemplateBuilder builder, String speUrl, String serviceSecret) {
        this.rest          = builder.build();
        this.speUrl        = speUrl;
        this.serviceSecret = serviceSecret;
    }

    /**
     * Elevates the caller's current forward JWT to a job-scoped operation token.
     * The caller's JWT (stored in {@link ServiceClientTokenContext}) is forwarded
     * as the Authorization header; spe-api extracts identity from it directly.
     *
     * @param jobId      unique job identifier (bound into the token's {@code jid} claim)
     * @param ttlSeconds requested lifetime (spe-api caps at {@code plm.jwt.operation-max-ttl-seconds})
     * @return signed JWT string (typ=op)
     */
    @SuppressWarnings("unchecked")
    public String requestToken(String jobId, long ttlSeconds) {
        String currentToken = ServiceClientTokenContext.get();
        if (currentToken == null) {
            throw new IllegalStateException("No forward JWT in context — cannot request operation token");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Service-Secret", serviceSecret);
        headers.set("Authorization", "Bearer " + currentToken);

        Map<String, Object> body = Map.of("jobId", jobId, "ttlSeconds", ttlSeconds);

        Map<String, Object> response = rest.postForObject(
            speUrl + "/api/spe/auth/operation-token",
            new HttpEntity<>(body, headers),
            Map.class
        );

        if (response == null || !response.containsKey("token")) {
            throw new IllegalStateException("operation-token endpoint returned no token");
        }
        log.debug("Operation token minted for job={}", jobId);
        return (String) response.get("token");
    }
}
