package com.spe.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * WebFilter — runs on every request (gateway-proxied + local controllers).
 *
 * Skipped (no auth required):
 *   - /actuator/**
 *   - /api/spe/auth/login, /api/spe/auth/logout
 *   - /api/platform/status, /api/platform/status/nats
 *     (public cluster-state surface — moved from /api/spe/status when
 *     platform-api became the central control plane)
 *
 * Protected paths:
 *   - Read Authorization: Bearer <session-jwt>
 *   - Verify session → userId + projectSpaceId
 *   - Project space can be overridden by X-PLM-ProjectSpace header (per-request)
 *   - Resolve SpeUserContext via pno
 *   - Mint short-lived forward JWT
 *   - Replace Authorization header with the forward JWT
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 100)
public class AuthenticationFilter implements WebFilter {

    public static final String CONTEXT_ATTR = "spe.userContext";
    public static final String JWT_ATTR = "spe.jwt";

    private final PnoContextClient pnoClient;
    private final JwtService jwtService;

    public AuthenticationFilter(PnoContextClient pnoClient, JwtService jwtService) {
        this.pnoClient = pnoClient;
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        if (path.startsWith("/actuator")
            || path.equals("/api/spe/auth/login")
            || path.equals("/api/spe/auth/logout")
            || path.equals("/api/platform/status")
            || path.startsWith("/api/platform/status/")) {
            return chain.filter(exchange);
        }

        HttpHeaders headers = exchange.getRequest().getHeaders();
        String authz = headers.getFirst(HttpHeaders.AUTHORIZATION);
        String token = null;
        if (authz != null && authz.startsWith("Bearer ")) {
            token = authz.substring("Bearer ".length()).trim();
        } else if (path.startsWith("/api/ws")) {
            // Browsers cannot set headers on the WebSocket upgrade handshake.
            // SockJS clients pass the session token as ?token= on the /api/ws URL.
            token = exchange.getRequest().getQueryParams().getFirst("token");
        }
        if (token == null || token.isBlank()) {
            return unauthorized(exchange.getResponse(), "Missing Bearer session token");
        }

        Optional<JwtService.SessionClaims> session = jwtService.verifySession(token);
        if (session.isEmpty()) {
            return unauthorized(exchange.getResponse(), "Invalid or expired session token");
        }

        String userId = session.get().userId();
        String psHeader = headers.getFirst("X-PLM-ProjectSpace");
        String ps = (psHeader != null && !psHeader.isBlank()) ? psHeader : session.get().projectSpaceId();

        return pnoClient.getUserContext(userId, ps)
            .switchIfEmpty(Mono.defer(() ->
                unauthorized(exchange.getResponse(), "User no longer resolvable").then(Mono.empty())))
            .flatMap(ctx -> {
                String fwd = jwtService.mint(ctx);
                exchange.getAttributes().put(CONTEXT_ATTR, ctx);
                exchange.getAttributes().put(JWT_ATTR, fwd);

                ServerHttpRequest mutated = exchange.getRequest().mutate()
                    .headers(h -> {
                        h.remove("X-PLM-User");
                        h.set(HttpHeaders.AUTHORIZATION, "Bearer " + fwd);
                    })
                    .build();
                return chain.filter(exchange.mutate().request(mutated).build());
            });
    }

    private Mono<Void> unauthorized(ServerHttpResponse response, String message) {
        if (response.isCommitted()) return Mono.empty();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        String body = "{\"error\":\"" + message.replace("\"", "\\\"") + "\"}";
        DataBuffer buf = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buf));
    }
}
