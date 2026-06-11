package com.spe.auth;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Verifies personal access tokens against pno-api (Basic-auth password on
 * /api/dav). Positive results are cached briefly — WebDAV clients fire many
 * requests per browse — negatives are not, so revocation applies fast and
 * guessing always pays the pno round-trip.
 */
@Slf4j
@Component
public class PnoTokenClient {

    private final WebClient webClient;
    private final String pnoApiUrl;
    private final String serviceSecret;

    // key = userId + ':' + sha256(token); only successful verifications cached
    private final Cache<String, Boolean> cache = Caffeine.newBuilder()
        .expireAfterWrite(60, TimeUnit.SECONDS)
        .maximumSize(1000)
        .build();

    public PnoTokenClient(
        WebClient.Builder builder,
        @Value("${pno.api.url}") String pnoApiUrl,
        @Value("${plm.service.secret}") String serviceSecret
    ) {
        this.webClient = builder.build();
        this.pnoApiUrl = pnoApiUrl;
        this.serviceSecret = serviceSecret;
    }

    public Mono<Boolean> verify(String userId, String token) {
        if (userId == null || token == null || token.isBlank()) return Mono.just(false);

        String key = userId + ":" + sha256Hex(token);
        if (Boolean.TRUE.equals(cache.getIfPresent(key))) return Mono.just(true);

        return webClient.post()
            .uri(pnoApiUrl + "/api/pno/internal/tokens/verify")
            .header("X-Service-Secret", serviceSecret)
            .bodyValue(Map.of("userId", userId, "token", token))
            .retrieve()
            .bodyToMono(Map.class)
            .timeout(Duration.ofSeconds(3))
            .map(body -> Boolean.TRUE.equals(body.get("valid")))
            .doOnNext(valid -> { if (valid) cache.put(key, true); })
            .onErrorResume(err -> {
                log.warn("pno token verify failed for user {}: {}", userId, err.toString());
                return Mono.just(false);
            });
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
