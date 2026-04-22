package com.plm.shared.security;

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
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Verifies the JWT minted by spe-api and populates PlmSecurityContext /
 * PlmProjectSpaceContext. Internal services only trust JWT — no X-PLM-User
 * fallback.
 *
 * Public paths bypass auth entirely.
 */
@Slf4j
@Component
@Order(1)
public class JwtAuthFilter implements Filter {

    private final String secretRaw;
    private final long clockSkewSeconds;
    private final List<String> publicPaths;

    private SecretKey key;

    public JwtAuthFilter(
        @Value("${plm.service.secret}") String secretRaw,
        @Value("${plm.jwt.clock-skew-seconds:5}") long clockSkewSeconds,
        @Value("${plm.auth.public-paths:/actuator,/v3/api-docs,/swagger-ui}") String publicPathsConfig
    ) {
        this.secretRaw = secretRaw;
        this.clockSkewSeconds = clockSkewSeconds;
        this.publicPaths = Arrays.stream(publicPathsConfig.split(","))
            .map(String::trim)
            .filter(s -> !s.isBlank())
            .toList();
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
        if (publicPaths.stream().anyMatch(uri::startsWith)) {
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
            String psFromClaim = c.get("ps", String.class);

            PlmUserContext ctx = new PlmUserContext(userId, username, roleIds, isAdmin);
            PlmSecurityContext.set(ctx);

            String ps = psFromClaim != null ? psFromClaim : req.getHeader("X-PLM-ProjectSpace");
            if (ps != null && !ps.isBlank()) {
                PlmProjectSpaceContext.set(ps);
            }

            log.debug("Auth: {} ps={}", ctx, ps);
            chain.doFilter(request, response);

        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT rejected: {}", e.getMessage());
            unauthorized(resp, "Invalid or expired token");
        } finally {
            PlmSecurityContext.clear();
            PlmProjectSpaceContext.clear();
        }
    }

    private void unauthorized(HttpServletResponse resp, String message) throws IOException {
        resp.setStatus(401);
        resp.setContentType("application/json");
        resp.getWriter().write("{\"error\":\"" + message.replace("\"", "\\\"") + "\"}");
    }
}
