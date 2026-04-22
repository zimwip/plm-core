package com.spe.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Two token types share the same HMAC key (plm.service.secret):
 *   - forward JWT (typ=fwd)     : short TTL (60s), full user context, signed
 *                                 by spe, consumed by downstream services.
 *   - session JWT (typ=session) : longer TTL (1h), minimal claims (sub, ps),
 *                                 issued to the frontend on /auth/login.
 *
 * Verification checks typ so a session cannot be misused as a forward token
 * and vice versa.
 */
@Slf4j
@Service
public class JwtService {

    private static final String TYP_FORWARD = "fwd";
    private static final String TYP_SESSION = "session";

    private final String secretRaw;
    private final long forwardTtl;
    private final long sessionTtl;
    private final long clockSkewSeconds;

    private SecretKey key;

    public JwtService(
        @Value("${plm.service.secret}") String secret,
        @Value("${plm.jwt.ttl-seconds:60}") long forwardTtl,
        @Value("${plm.jwt.session-ttl-seconds:3600}") long sessionTtl,
        @Value("${plm.jwt.clock-skew-seconds:5}") long clockSkewSeconds
    ) {
        this.secretRaw = secret;
        this.forwardTtl = forwardTtl;
        this.sessionTtl = sessionTtl;
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
        log.info("JwtService ready (fwdTtl={}s, sessionTtl={}s, skew={}s)",
            forwardTtl, sessionTtl, clockSkewSeconds);
    }

    // ── Forward JWT (spe → downstream) ────────────────────────────
    public String mint(SpeUserContext ctx) {
        Instant now = Instant.now();
        return Jwts.builder()
            .issuer("spe-api")
            .subject(ctx.userId())
            .claim("typ", TYP_FORWARD)
            .claim("username", ctx.username())
            .claim("roleIds", ctx.roleIds())
            .claim("isAdmin", ctx.isAdmin())
            .claim("ps", ctx.projectSpaceId())
            .id(UUID.randomUUID().toString())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(forwardTtl)))
            .signWith(key, Jwts.SIG.HS256)
            .compact();
    }

    // ── Session JWT (spe → frontend) ──────────────────────────────
    public record Session(String token, Instant expiresAt) {}

    public Session mintSession(String userId, String projectSpaceId) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(sessionTtl);
        String token = Jwts.builder()
            .issuer("spe-api")
            .subject(userId)
            .claim("typ", TYP_SESSION)
            .claim("ps", projectSpaceId)
            .id(UUID.randomUUID().toString())
            .issuedAt(Date.from(now))
            .expiration(Date.from(exp))
            .signWith(key, Jwts.SIG.HS256)
            .compact();
        return new Session(token, exp);
    }

    public record SessionClaims(String userId, String projectSpaceId) {}

    public Optional<SessionClaims> verifySession(String token) {
        return parse(token)
            .filter(c -> TYP_SESSION.equals(c.get("typ", String.class)))
            .map(c -> new SessionClaims(c.getSubject(), c.get("ps", String.class)));
    }

    @SuppressWarnings("unchecked")
    public Optional<SpeUserContext> verify(String token) {
        return parse(token).map(c -> {
            List<String> roleIds = (List<String>) c.getOrDefault("roleIds", List.of());
            return new SpeUserContext(
                c.getSubject(),
                c.get("username", String.class),
                List.copyOf(roleIds),
                Boolean.TRUE.equals(c.get("isAdmin", Boolean.class)),
                c.get("ps", String.class)
            );
        });
    }

    private Optional<Claims> parse(String token) {
        try {
            Jws<Claims> jws = Jwts.parser()
                .verifyWith(key)
                .clockSkewSeconds(clockSkewSeconds)
                .build()
                .parseSignedClaims(token);
            return Optional.of(jws.getPayload());
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT verify failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
