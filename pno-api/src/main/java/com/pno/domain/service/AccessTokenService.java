package com.pno.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Personal access tokens (app passwords). WebDAV clients cannot send Bearer
 * tokens, so the Basic-auth password carries one of these instead. Only the
 * SHA-256 hash is persisted; the plaintext is returned once at creation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AccessTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PREFIX = "dav_";

    private final DSLContext dsl;

    /** Creates a token for the user. Returns the plaintext token — shown once. */
    @Transactional
    public Map<String, Object> create(String userId, String label, Integer ttlDays) {
        byte[] raw = new byte[20];
        RANDOM.nextBytes(raw);
        String token = PREFIX + HexFormat.of().formatHex(raw);

        String id = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = ttlDays != null ? now.plusDays(ttlDays) : null;

        dsl.execute("""
            INSERT INTO user_access_token (id, user_id, token_hash, label, created_at, expires_at)
            VALUES (?,?,?,?,?,?)
            """, id, userId, sha256Hex(token), label, now, expiresAt);

        log.info("TOKEN created id={} user={} label={} expires={}", id, userId, label, expiresAt);
        return Map.of(
            "id", id,
            "token", token,
            "label", label != null ? label : "",
            "expiresAt", expiresAt != null ? expiresAt.toString() : "");
    }

    /**
     * Verifies a plaintext token for the given user. Valid when the hash
     * matches an active, unrevoked, unexpired token of that user; touches
     * last_used_at on success.
     */
    @Transactional
    public boolean verify(String userId, String token) {
        if (userId == null || token == null || token.isBlank()) return false;
        Record r = dsl.fetchOne(
            "SELECT id, user_id, expires_at, revoked FROM user_access_token WHERE token_hash = ?",
            sha256Hex(token));
        if (r == null) return false;
        if (!userId.equals(r.get("user_id", String.class))) return false;
        if (r.get("revoked", Integer.class) != 0) return false;
        LocalDateTime expiresAt = r.get("expires_at", LocalDateTime.class);
        if (expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) return false;

        dsl.execute("UPDATE user_access_token SET last_used_at = ? WHERE id = ?",
            LocalDateTime.now(), r.get("id", String.class));
        return true;
    }

    /** Lists the user's tokens — metadata only, never hashes. */
    public List<Map<String, Object>> list(String userId) {
        return dsl.fetch("""
            SELECT id, label, created_at, expires_at, last_used_at, revoked
            FROM user_access_token WHERE user_id = ? ORDER BY created_at DESC
            """, userId).intoMaps();
    }

    /** Revokes one token of the user. Returns false when not found. */
    @Transactional
    public boolean revoke(String userId, String tokenId) {
        int n = dsl.execute(
            "UPDATE user_access_token SET revoked = 1 WHERE id = ? AND user_id = ?",
            tokenId, userId);
        if (n > 0) log.info("TOKEN revoked id={} user={}", tokenId, userId);
        return n > 0;
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
