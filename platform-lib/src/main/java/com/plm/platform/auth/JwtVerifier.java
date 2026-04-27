package com.plm.platform.auth;

import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Parses and verifies JWTs minted by spe-api. Returns a normalised
 * {@link PlmPrincipal} or empty if the token is missing/invalid/expired.
 */
public class JwtVerifier {

    private static final Logger log = LoggerFactory.getLogger(JwtVerifier.class);

    private final SecretKey key;
    private final long clockSkewSeconds;

    public JwtVerifier(String sharedSecret, long clockSkewSeconds) {
        byte[] bytes = sharedSecret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                "plm.service.secret must be at least 32 bytes for HS256 (got " + bytes.length + ")");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.clockSkewSeconds = clockSkewSeconds;
    }

    public Optional<PlmPrincipal> verify(String token) {
        if (token == null || token.isBlank()) return Optional.empty();
        try {
            Jws<Claims> jws = Jwts.parser()
                .verifyWith(key)
                .clockSkewSeconds(clockSkewSeconds)
                .build()
                .parseSignedClaims(token);
            Claims c = jws.getPayload();

            String userId = c.getSubject();
            String username = c.get("username", String.class);
            boolean isAdmin = Boolean.TRUE.equals(c.get("isAdmin", Boolean.class));
            @SuppressWarnings("unchecked")
            List<String> roleIdsRaw = (List<String>) c.getOrDefault("roleIds", List.of());
            Set<String> roleIds = new HashSet<>(roleIdsRaw);
            String projectSpace = c.get("ps", String.class);
            String typ = c.get("typ", String.class);

            return Optional.of(new PlmPrincipal(userId, username, isAdmin, roleIds, projectSpace, typ));
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT rejected: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
