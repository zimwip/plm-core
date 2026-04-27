package com.spe.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * Enforces X-Service-Secret on /api/spe/registry/** and write operations
 * on /api/spe/config/environment/** requests. Other paths pass through unchanged.
 */
@Slf4j
@Component
public class ServiceSecretFilter implements WebFilter {

    private static final String REGISTRY_PREFIX = "/api/spe/registry";
    private static final String ENV_CONFIG_PREFIX = "/api/spe/config/environment";

    private final String expectedSecret;

    public ServiceSecretFilter(@Value("${plm.service.secret}") String expectedSecret) {
        this.expectedSecret = expectedSecret;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        String method = exchange.getRequest().getMethod().name();

        // --- Registry endpoints: all require secret except /tags (read-only) ---
        if (path.startsWith(REGISTRY_PREFIX)) {
            if (path.equals(REGISTRY_PREFIX + "/tags")) {
                return chain.filter(exchange);
            }
            return requireSecret(exchange, chain);
        }

        // --- Environment config endpoints: write ops require secret, GET is public ---
        if (path.startsWith(ENV_CONFIG_PREFIX)) {
            if ("GET".equals(method)) {
                return chain.filter(exchange);
            }
            return requireSecret(exchange, chain);
        }

        return chain.filter(exchange);
    }

    private Mono<Void> requireSecret(ServerWebExchange exchange, WebFilterChain chain) {
        String provided = exchange.getRequest().getHeaders().getFirst("X-Service-Secret");
        if (provided == null || !expectedSecret.equals(provided)) {
            log.warn("Access denied from {} (missing/invalid X-Service-Secret)",
                exchange.getRequest().getRemoteAddress());
            return writeJson(exchange.getResponse(), HttpStatus.FORBIDDEN, "{\"error\":\"Forbidden\"}");
        }
        return chain.filter(exchange);
    }

    private Mono<Void> writeJson(ServerHttpResponse response, HttpStatus status, String body) {
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        DataBuffer buf = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buf));
    }
}
