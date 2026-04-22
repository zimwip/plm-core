package com.pno.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Verifies the JWT minted by spe-api and populates PnoSecurityContext.
 *
 * Skipped paths:
 *   - /actuator, /v3/api-docs, /swagger-ui (public)
 *   - /api/pno/users/{id}/context (S2S, handled by PnoAuthFilter secret check)
 */
@Slf4j
@Component
@Order(0)
public class JwtAuthFilter implements Filter {

    private final String secretRaw;
    private final long clockSkewSeconds;

    private SecretKey key;

    public JwtAuthFilter(
        @Value("${plm.service.secret}") String secretRaw,
        @Value("${plm.jwt.clock-skew-seconds:5}") long clockSkewSeconds
    ) {
        this.secretRaw = secretRaw;
        this.clockSkewSeconds = clockSkewSeconds;
    }

    @PostConstruct
    public void init() {
        byte[] bytes = secretRaw.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                "plm.service.secret must be at least 32 bytes for HS256 (got " + bytes.length + ")");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        String uri = req.getRequestURI();

        // Public
        if (uri.startsWith("/actuator") || uri.startsWith("/v3/api-docs") || uri.startsWith("/swagger-ui")) {
            chain.doFilter(request, response);
            return;
        }

        // S2S endpoints: let PnoAuthFilter's secret check handle them
        if (uri.matches("/api/pno/users/[^/]+/context")
            || uri.matches("/api/pno/project-spaces/[^/]+/effective-service-tags")) {
            chain.doFilter(request, response);
            return;
        }

        String auth = req.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            unauthorized(resp, "Missing Bearer token");
            return;
        }
        String token = auth.substring("Bearer ".length()).trim();

        try {
            Jws<Claims> jws = Jwts.parser()
                .verifyWith(key)
                .clockSkewSeconds(clockSkewSeconds)
                .build()
                .parseSignedClaims(token);
            Claims c = jws.getPayload();

            String userId   = c.getSubject();
            String username = c.get("username", String.class);
            boolean isAdmin = Boolean.TRUE.equals(c.get("isAdmin", Boolean.class));
            @SuppressWarnings("unchecked")
            List<String> roleIdsRaw = (List<String>) c.getOrDefault("roleIds", List.of());
            Set<String> roleIds = new HashSet<>(roleIdsRaw);

            PnoUserContext ctx = new PnoUserContext(userId, username, roleIds, isAdmin);
            PnoSecurityContext.set(ctx);

            log.debug("Auth: {}", ctx);
            chain.doFilter(request, response);

        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT rejected: {}", e.getMessage());
            unauthorized(resp, "Invalid or expired token");
        } finally {
            PnoSecurityContext.clear();
        }
    }

    private void unauthorized(HttpServletResponse resp, String message) throws IOException {
        resp.setStatus(401);
        resp.setContentType("application/json");
        resp.getWriter().write("{\"error\":\"" + message.replace("\"", "\\\"") + "\"}");
    }
}
