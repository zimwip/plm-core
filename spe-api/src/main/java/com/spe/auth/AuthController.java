package com.spe.auth;

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

    private final PnoContextClient pnoClient;
    private final JwtService jwtService;

    public AuthController(PnoContextClient pnoClient, JwtService jwtService) {
        this.pnoClient = pnoClient;
        this.jwtService = jwtService;
    }

    public record LoginRequest(String userId, String projectSpaceId) {}

    /**
     * Auto-login (no password): caller asserts a userId; spe validates the
     * user exists in pno and issues a session JWT. In a real deployment this
     * would require credentials.
     */
    @PostMapping("/login")
    public Mono<ResponseEntity<Map<String, Object>>> login(@RequestBody LoginRequest req) {
        if (req == null || req.userId() == null || req.userId().isBlank()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "userId required")));
        }
        return pnoClient.getUserContext(req.userId(), req.projectSpaceId())
            .map(ctx -> {
                JwtService.Session s = jwtService.mintSession(ctx.userId(), req.projectSpaceId());
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("token", s.token());
                body.put("expiresAt", s.expiresAt().toString());
                body.put("userId", ctx.userId());
                body.put("username", ctx.username());
                body.put("roleIds", ctx.roleIds());
                body.put("isAdmin", ctx.isAdmin());
                body.put("projectSpaceId", req.projectSpaceId());
                return ResponseEntity.ok(body);
            })
            .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Unknown user"))));
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
