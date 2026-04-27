package com.plm.wsgateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Verifies forward JWTs minted by spe-api.
 *
 * Forward JWTs (typ=fwd) contain: sub (userId), ps (projectSpaceId),
 * username, roleIds, isAdmin. They have a short TTL (~60s).
 */
@Component
public class JwtVerifier {

    private static final Logger log = LoggerFactory.getLogger(JwtVerifier.class);

    private final SecretKey key;

    public JwtVerifier(@Value("${plm.service.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public record UserInfo(String userId, String projectSpaceId, String username) {}

    public Optional<UserInfo> verify(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String typ = claims.get("typ", String.class);
            if (!"fwd".equals(typ)) {
                log.warn("JWT type mismatch: expected fwd, got {}", typ);
                return Optional.empty();
            }

            return Optional.of(new UserInfo(
                    claims.getSubject(),
                    claims.get("ps", String.class),
                    claims.get("username", String.class)
            ));
        } catch (Exception e) {
            log.warn("JWT verification failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
