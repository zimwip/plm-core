package com.spe.auth;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Reactive client that fetches effective service tag configuration for a
 * project space from pno-api. Cached with 60s TTL (tag config changes
 * infrequently — admin operation).
 *
 * Response shape from PNO:
 * <pre>
 * {
 *   "projectSpaceId": "ps-xxx",
 *   "isolated": true,
 *   "serviceTags": { "psm-api": ["PSM1"], "pno-api": ["PNO1"] }
 * }
 * </pre>
 */
@Slf4j
@Component
public class ProjectSpaceTagClient {

    private final WebClient webClient;
    private final String pnoApiUrl;
    private final String serviceSecret;

    private final Cache<String, ProjectSpaceTagConfig> cache = Caffeine.newBuilder()
        .expireAfterWrite(60, TimeUnit.SECONDS)
        .maximumSize(200)
        .build();

    public ProjectSpaceTagClient(
        WebClient.Builder builder,
        @Value("${pno.api.url}") String pnoApiUrl,
        @Value("${plm.service.secret}") String serviceSecret
    ) {
        this.webClient = builder.build();
        this.pnoApiUrl = pnoApiUrl;
        this.serviceSecret = serviceSecret;
    }

    /**
     * Get effective tag config for a project space (with hierarchy inheritance).
     * Returns empty config (not isolated, no tags) on error or missing project space.
     */
    public Mono<ProjectSpaceTagConfig> getTagConfig(String projectSpaceId) {
        if (projectSpaceId == null || projectSpaceId.isBlank()) {
            return Mono.just(ProjectSpaceTagConfig.EMPTY);
        }

        ProjectSpaceTagConfig hit = cache.getIfPresent(projectSpaceId);
        if (hit != null) return Mono.just(hit);

        String url = pnoApiUrl + "/api/pno/project-spaces/" + projectSpaceId + "/effective-service-tags";

        return webClient.get()
            .uri(url)
            .header("X-Service-Secret", serviceSecret)
            .retrieve()
            .bodyToMono(Map.class)
            .timeout(Duration.ofSeconds(3))
            .map(this::toConfig)
            .doOnNext(cfg -> cache.put(projectSpaceId, cfg))
            .onErrorResume(err -> {
                log.warn("Failed to fetch service tags for project space {}: {}", projectSpaceId, err.toString());
                return Mono.just(ProjectSpaceTagConfig.EMPTY);
            });
    }

    @SuppressWarnings("unchecked")
    private ProjectSpaceTagConfig toConfig(Map<String, Object> body) {
        boolean isolated = Boolean.TRUE.equals(body.get("isolated"));
        Map<String, List<String>> serviceTags = (Map<String, List<String>>) body.getOrDefault("serviceTags", Map.of());
        // Convert to Set<String> per service for fast lookup
        Map<String, Set<String>> tagSets = new LinkedHashMap<>();
        for (var entry : serviceTags.entrySet()) {
            tagSets.put(entry.getKey(), Set.copyOf(entry.getValue()));
        }
        return new ProjectSpaceTagConfig(isolated, Collections.unmodifiableMap(tagSets));
    }

    /** Immutable tag configuration for a project space. */
    public record ProjectSpaceTagConfig(
        boolean isolated,
        Map<String, Set<String>> serviceTags
    ) {
        public static final ProjectSpaceTagConfig EMPTY = new ProjectSpaceTagConfig(false, Map.of());

        /** Tags required for a specific service. Empty set = no preference. */
        public Set<String> tagsForService(String serviceCode) {
            return serviceTags.getOrDefault(serviceCode, Set.of());
        }
    }
}
