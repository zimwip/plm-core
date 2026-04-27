package com.plm.platform.authz;

import com.plm.platform.authz.dto.ScopeKeyDefinition;
import com.plm.platform.authz.dto.ScopeRegistration;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

/**
 * Canonical SHA-256 of a scope <em>shape</em> definition. Both registrant and
 * registry compute the hash the same way; mismatch on the server side proves
 * two services disagree on a scope's shape and triggers a 409.
 *
 * <p>Inputs: parent code + ordered key list only. Value sources are excluded —
 * multiple services legitimately contribute different value sources for the
 * same (scope, key) without that constituting a shape conflict. Owner service
 * is also excluded for the same reason.
 */
public final class ScopeDefinitionHasher {

    private ScopeDefinitionHasher() {}

    public static String hash(ScopeRegistration s) {
        StringBuilder sb = new StringBuilder(128);
        sb.append("parent=").append(nullToEmpty(s.parentScopeCode())).append('\n');
        sb.append("keys=");
        List<ScopeKeyDefinition> keys = s.keys() == null ? List.of() : s.keys();
        for (int i = 0; i < keys.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(keys.get(i).name());
        }
        return sha256Hex(sb.toString());
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private static String sha256Hex(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
