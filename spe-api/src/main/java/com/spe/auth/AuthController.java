package com.spe.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/spe/auth")
public class AuthController {

    private record OperationTokenRequest(String jobId, long ttlSeconds) {}

    private final PnoContextClient pnoClient;
    private final JwtService jwtService;
    private final String serviceSecret;

    public AuthController(PnoContextClient pnoClient, JwtService jwtService,
                          @Value("${plm.service.secret}") String serviceSecret) {
        this.pnoClient = pnoClient;
        this.jwtService = jwtService;
        this.serviceSecret = serviceSecret;
    }

    /**
     * Login via X-User header. No password — identity asserted by upstream (SSO/proxy).
     * Project space is not part of login; clients send X-PLM-ProjectSpace on each request.
     */
    @PostMapping("/login")
    public Mono<ResponseEntity<Map<String, Object>>> login(
            @RequestHeader(name = "X-User", required = false) String userId) {
        if (userId == null || userId.isBlank()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "X-User header required")));
        }
        return pnoClient.getUserContext(userId, null)
            .map(ctx -> {
                JwtService.Session s = jwtService.mintSession(ctx.userId(), null);
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("token", s.token());
                body.put("expiresAt", s.expiresAt().toString());
                body.put("userId", ctx.userId());
                body.put("username", ctx.username());
                body.put("isAdmin", ctx.isAdmin());
                return ResponseEntity.ok(body);
            })
            .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Unknown user"))));
    }

    /**
     * Elevates a forward JWT to a job-scoped operation token (typ=op).
     *
     * The caller must present:
     *   - Authorization: Bearer <fwd-jwt>  — proves identity (verified by AuthenticationFilter)
     *   - X-Service-Secret                 — restricts access to trusted services only
     * Identity is already proven by the forward JWT; no pno re-validation needed.
     */
    @PostMapping("/operation-token")
    public Mono<ResponseEntity<Map<String, Object>>> operationToken(
            @RequestHeader("X-Service-Secret") String secret,
            @RequestBody OperationTokenRequest req,
            ServerWebExchange exchange) {
        if (!serviceSecret.equals(secret)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Invalid service secret")));
        }
        if (req.jobId() == null || req.jobId().isBlank()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "jobId required")));
        }
        SpeUserContext ctx = exchange.getAttribute(AuthenticationFilter.CONTEXT_ATTR);
        if (ctx == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "No authenticated context")));
        }
        String token = jwtService.mintOperation(ctx, req.jobId(), req.ttlSeconds());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("token", token);
        body.put("jobId", req.jobId());
        return Mono.just(ResponseEntity.ok(body));
    }

    /**
     * Stateless — client just drops the token. Session JWTs expire naturally
     * at their exp claim. Endpoint exists for telemetry / future revocation.
     */
    @PostMapping("/logout")
    public Mono<ResponseEntity<Map<String, String>>> logout() {
        return Mono.just(ResponseEntity.ok(Map.of("status", "logged out")));
    }

    @GetMapping("/me")
    public Mono<ResponseEntity<Map<String, Object>>> me(ServerWebExchange exchange) {
        SpeUserContext ctx = exchange.getAttribute(AuthenticationFilter.CONTEXT_ATTR);
        if (ctx == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("userId", ctx.userId());
        body.put("username", ctx.username());
        body.put("roleIds", ctx.roleIds());
        body.put("isAdmin", ctx.isAdmin());
        body.put("projectSpaceId", ctx.projectSpaceId());
        return Mono.just(ResponseEntity.ok(body));
    }
}
