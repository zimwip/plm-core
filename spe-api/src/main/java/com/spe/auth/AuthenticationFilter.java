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
    private final PnoTokenClient tokenClient;
    private final JwtService jwtService;

    public AuthenticationFilter(PnoContextClient pnoClient, PnoTokenClient tokenClient,
                                JwtService jwtService) {
        this.pnoClient = pnoClient;
        this.tokenClient = tokenClient;
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        if (path.startsWith("/actuator")
            || path.equals("/api/spe/auth/login")
            || path.equals("/api/spe/auth/logout")
            || path.equals("/api/platform/status")
            || path.startsWith("/api/platform/status/")
            || isUiBundlePath(path)) {
            return chain.filter(exchange);
        }

        HttpHeaders headers = exchange.getRequest().getHeaders();
        String authz = headers.getFirst(HttpHeaders.AUTHORIZATION);

        // WebDAV clients (Finder, Explorer, davfs2) only speak Basic auth. On
        // /api/dav the Basic username is the PLM userId and the password must
        // be a personal access token (pno user_access_token, verified S2S).
        if (path.startsWith("/api/dav")) {
            BasicCredentials creds = decodeBasic(authz);
            if (creds == null || creds.password().isBlank()) {
                return unauthorized(exchange, "Basic credentials required");
            }
            String psHeader0 = headers.getFirst("X-PLM-ProjectSpace");
            String basicPs = (psHeader0 != null && !psHeader0.isBlank()) ? psHeader0 : null;
            return tokenClient.verify(creds.userId(), creds.password())
                .flatMap(valid -> valid
                    ? resolveAndForward(exchange, chain, creds.userId(), basicPs, extractServiceCode(path))
                    : unauthorized(exchange, "Invalid access token"));
        }

        String token = null;
        if (authz != null && authz.startsWith("Bearer ")) {
            token = authz.substring("Bearer ".length()).trim();
        } else if (path.startsWith("/api/ws")) {
            // Browsers cannot set headers on the WebSocket upgrade handshake.
            // SockJS clients pass the session token as ?token= on the /api/ws URL.
            token = exchange.getRequest().getQueryParams().getFirst("token");
        }
        if (token == null || token.isBlank()) {
            return unauthorized(exchange, "Missing Bearer session token");
        }

        // Operation-token elevation: caller presents their forward JWT (typ=fwd) as credential.
        // The forward JWT already proves identity — no pno re-validation needed.
        // X-Service-Secret checked by AuthController to restrict access to trusted services only.
        if (path.equals("/api/spe/auth/operation-token")) {
            Optional<SpeUserContext> fwdCtx = jwtService.verifyForward(token);
            if (fwdCtx.isEmpty()) {
                return unauthorized(exchange.getResponse(), "Valid forward JWT required for operation token");
            }
            exchange.getAttributes().put(CONTEXT_ATTR, fwdCtx.get());
            return chain.filter(exchange);
        }

        Optional<JwtService.SessionClaims> session = jwtService.verifySession(token);
        if (session.isEmpty()) {
            return unauthorized(exchange, "Invalid or expired session token");
        }

        String userId = session.get().userId();
        String psHeader = headers.getFirst("X-PLM-ProjectSpace");
        String ps = (psHeader != null && !psHeader.isBlank()) ? psHeader : session.get().projectSpaceId();

        return resolveAndForward(exchange, chain, userId, ps, extractServiceCode(path));
    }

    // Shared tail of both auth schemes: resolve user context via pno, gate on
    // allowedServiceCodes, mint forward JWT, swap the Authorization header.
    private Mono<Void> resolveAndForward(ServerWebExchange exchange, WebFilterChain chain,
                                         String userId, String ps, String serviceCode) {
        return pnoClient.getUserContext(userId, ps)
            .switchIfEmpty(Mono.defer(() ->
                unauthorized(exchange, "User no longer resolvable").then(Mono.empty())))
            .flatMap(ctx -> {
                if (serviceCode != null && !ctx.isAdmin()
                        && !ctx.allowedServiceCodes().contains(serviceCode)) {
                    return forbidden(exchange.getResponse(),
                        "Access to service '" + serviceCode + "' not granted");
                }

                String fwd = jwtService.mint(ctx);
                exchange.getAttributes().put(CONTEXT_ATTR, ctx);
                exchange.getAttributes().put(JWT_ATTR, fwd);

                ServerHttpRequest mutated = exchange.getRequest().mutate()
                    .headers(h -> {
                        h.remove("X-PLM-User");
                        h.remove("X-Job-Id"); // internal only — S2S services set this, not external clients
                        h.set(HttpHeaders.AUTHORIZATION, "Bearer " + fwd);
                    })
                    .build();
                return chain.filter(exchange.mutate().request(mutated).build());
            });
    }

    record BasicCredentials(String userId, String password) {}

    // Decodes a "Basic base64(user:pass)" header; null when absent/malformed.
    private static BasicCredentials decodeBasic(String authz) {
        if (authz == null || !authz.startsWith("Basic ")) return null;
        try {
            String decoded = new String(
                java.util.Base64.getDecoder().decode(authz.substring("Basic ".length()).trim()),
                StandardCharsets.UTF_8);
            int colon = decoded.indexOf(':');
            if (colon < 0) return null;
            String user = decoded.substring(0, colon);
            if (user.isBlank()) return null;
            return new BasicCredentials(user, decoded.substring(colon + 1));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    // Returns the serviceCode segment from /api/<serviceCode>/... paths.
    // Returns null for /api/spe/... (spe's own paths are not proxied).
    private static String extractServiceCode(String path) {
        if (!path.startsWith("/api/")) return null;
        int start = 5;
        int end = path.indexOf('/', start);
        String code = end < 0 ? path.substring(start) : path.substring(start, end);
        if (code.isBlank() || "spe".equals(code)) return null;
        return code;
    }

    // /api/<serviceCode>/ui/** — static plugin bundles, loaded via dynamic import()
    // which cannot attach Authorization headers.
    private static boolean isUiBundlePath(String path) {
        if (!path.startsWith("/api/")) return false;
        int second = path.indexOf('/', 5);
        return second > 0 && path.startsWith("/ui/", second);
    }

    // 401 with a Basic challenge on /api/dav — WebDAV clients need the
    // WWW-Authenticate header to prompt for credentials.
    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        if (exchange.getRequest().getPath().value().startsWith("/api/dav")
                && !exchange.getResponse().isCommitted()) {
            exchange.getResponse().getHeaders().set("WWW-Authenticate", "Basic realm=\"PLM\"");
        }
        return unauthorized(exchange.getResponse(), message);
    }

    private Mono<Void> unauthorized(ServerHttpResponse response, String message) {
        return writeError(response, HttpStatus.UNAUTHORIZED, message);
    }

    private Mono<Void> forbidden(ServerHttpResponse response, String message) {
        return writeError(response, HttpStatus.FORBIDDEN, message);
    }

    private static Mono<Void> writeError(ServerHttpResponse response, HttpStatus status, String message) {
        if (response.isCommitted()) return Mono.empty();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        String body = "{\"error\":\"" + message.replace("\"", "\\\"") + "\"}";
        DataBuffer buf = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buf));
    }
}
