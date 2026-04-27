package com.pno.domain.scope;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;

/**
 * Canonical fingerprint of the ordered key list for one grant. Must match the
 * encoding used by the V10 backfill so backfilled rows survive uniqueness checks
 * against future writes.
 *
 * <p>Format: {@code key1=val1|key2=val2} sorted by {@link PermissionScopeRegistry}
 * key position. Empty key list → fixed sentinel of 64 zeros (one stable
 * fingerprint for every GLOBAL grant).
 */
public final class AuthorizationKeysFingerprint {

    private AuthorizationKeysFingerprint() {}

    public static String compute(PermissionScopeRegistry registry, String scopeCode, Map<String, String> keys) {
        List<com.plm.platform.authz.dto.ScopeKeyDefinition> ordered = registry.effectiveKeys(scopeCode);
        if (ordered.isEmpty()) return "0".repeat(64);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < ordered.size(); i++) {
            if (i > 0) sb.append('|');
            String name = ordered.get(i).name();
            String value = keys.getOrDefault(name, "");
            sb.append(name).append('=').append(value);
        }
        return sha256Hex(sb.toString());
    }

    private static String sha256Hex(String s) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
