package com.spe.auth;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Reactive client that fetches user context from pno-api.
 * Uses the service-secret (not a JWT) since this call predates JWT minting.
 */
@Slf4j
@Component
public class PnoContextClient {

    private final WebClient webClient;
    private final String pnoApiUrl;
    private final String serviceSecret;

    private final Cache<String, SpeUserContext> cache = Caffeine.newBuilder()
        .expireAfterWrite(10, TimeUnit.SECONDS)
        .maximumSize(500)
        .build();

    public PnoContextClient(
        WebClient.Builder builder,
        @Value("${pno.api.url}") String pnoApiUrl,
        @Value("${plm.service.secret}") String serviceSecret
    ) {
        this.webClient = builder.build();
        this.pnoApiUrl = pnoApiUrl;
        this.serviceSecret = serviceSecret;
    }

    public Mono<SpeUserContext> getUserContext(String userId, String projectSpaceId) {
        if (userId == null || userId.isBlank()) return Mono.empty();

        String key = userId + ":" + (projectSpaceId != null ? projectSpaceId : "");
        SpeUserContext hit = cache.getIfPresent(key);
        if (hit != null) return Mono.just(hit);

        UriComponentsBuilder builder = UriComponentsBuilder
            .fromHttpUrl(pnoApiUrl + "/api/pno/users/" + userId + "/context");
        if (projectSpaceId != null && !projectSpaceId.isBlank()) {
            builder.queryParam("projectSpaceId", projectSpaceId);
        }
        String url = builder.toUriString();

        return webClient.get()
            .uri(url)
            .header("X-Service-Secret", serviceSecret)
            .retrieve()
            .bodyToMono(Map.class)
            .timeout(Duration.ofSeconds(3))
            .map(body -> toContext(userId, projectSpaceId, body))
            .doOnNext(ctx -> cache.put(key, ctx))
            .onErrorResume(err -> {
                log.warn("pno context fetch failed for user {}: {}", userId, err.toString());
                return Mono.empty();
            });
    }

    @SuppressWarnings("unchecked")
    private SpeUserContext toContext(String userId, String projectSpaceId, Map<String, Object> body) {
        String username = (String) body.get("username");
        boolean isAdmin = Boolean.TRUE.equals(body.get("isAdmin"));
        List<String> roleIds = (List<String>) body.getOrDefault("roleIds", List.of());
        return new SpeUserContext(userId, username, List.copyOf(roleIds), isAdmin, projectSpaceId);
    }
}
