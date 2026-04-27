package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Backfills the new authorization_policy + authorization_policy_key tables from
 * authorization_policy_legacy. Each legacy row is expanded into one row per
 * existing project_space (legacy grants were projectSpace-agnostic; preserve
 * current behavior by replicating into every space).
 *
 * <p>{@code keys_fingerprint} is computed over the ordered key list of the
 * source scope (NODE.nodeType ; LIFECYCLE.nodeType + transition ; GLOBAL: empty).
 * Uses the same canonical encoding as the runtime — see
 * {@code AuthorizationKeysFingerprint}.
 */
public class V10__BackfillAuthorizationPolicy extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection c = context.getConnection();

        // Seed the three platform scopes if pno-api hasn't booted yet (this
        // migration runs at every startup; the scope rows might already exist
        // from a previous boot — INSERT only when missing).
        seedScopeIfMissing(c, "GLOBAL",    null,   "Role-only check; no context keys.", "pno");
        seedScopeIfMissing(c, "NODE",      null,   "Role + nodeType.",                  "psa");
        seedScopeIfMissing(c, "LIFECYCLE", "NODE", "Role + nodeType + transition.",     "psa");
        seedKeyIfMissing(c, "NODE",      1, "nodeType",   "Node type id");
        seedKeyIfMissing(c, "LIFECYCLE", 1, "transition", "Lifecycle transition id");

        // Collect every project_space — backfill cross-joins with this set so
        // legacy grants stay effective in every space.
        List<String> spaces = new ArrayList<>();
        try (Statement s = c.createStatement(); ResultSet rs = s.executeQuery("SELECT id FROM project_space")) {
            while (rs.next()) spaces.add(rs.getString(1));
        }
        if (spaces.isEmpty()) return;

        try (Statement s = c.createStatement();
             ResultSet rs = s.executeQuery(
                 "SELECT permission_code, scope, role_id, node_type_id, transition_id FROM authorization_policy_legacy")) {

            try (PreparedStatement insPolicy = c.prepareStatement(
                    "INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint) VALUES (?,?,?,?,?,?)");
                 PreparedStatement insKey = c.prepareStatement(
                    "INSERT INTO authorization_policy_key (policy_id, key_name, key_value) VALUES (?,?,?)")) {

                while (rs.next()) {
                    String permissionCode = rs.getString("permission_code");
                    String scope          = rs.getString("scope");
                    String roleId         = rs.getString("role_id");
                    String nodeTypeId     = rs.getString("node_type_id");
                    String transitionId   = rs.getString("transition_id");

                    List<String[]> keyPairs = new ArrayList<>();
                    if ("NODE".equals(scope) || "LIFECYCLE".equals(scope)) {
                        keyPairs.add(new String[]{"nodeType", nodeTypeId});
                    }
                    if ("LIFECYCLE".equals(scope) && transitionId != null) {
                        keyPairs.add(new String[]{"transition", transitionId});
                    }
                    String fingerprint = fingerprint(keyPairs);

                    for (String spaceId : spaces) {
                        String policyId = UUID.randomUUID().toString();
                        insPolicy.setString(1, policyId);
                        insPolicy.setString(2, permissionCode);
                        insPolicy.setString(3, scope);
                        insPolicy.setString(4, roleId);
                        insPolicy.setString(5, spaceId);
                        insPolicy.setString(6, fingerprint);
                        try {
                            insPolicy.executeUpdate();
                        } catch (java.sql.SQLException dup) {
                            // Unique violation — another (perm, scope, role, ps, fp) row already exists. Skip.
                            continue;
                        }
                        for (String[] kv : keyPairs) {
                            insKey.setString(1, policyId);
                            insKey.setString(2, kv[0]);
                            insKey.setString(3, kv[1]);
                            insKey.executeUpdate();
                        }
                    }
                }
            }
        }
    }

    private void seedScopeIfMissing(Connection c, String code, String parent, String description, String owner) throws Exception {
        try (PreparedStatement check = c.prepareStatement("SELECT 1 FROM permission_scope WHERE scope_code = ?")) {
            check.setString(1, code);
            try (ResultSet rs = check.executeQuery()) {
                if (rs.next()) return;
            }
        }
        // Definition hash is recomputed at next service registration; use a
        // backfill marker so a real registration overwrites consistency check.
        String hash = "00000000000000000000000000000000backfill00000000000000000000000000";
        if (hash.length() > 64) hash = hash.substring(0, 64);
        try (PreparedStatement ins = c.prepareStatement(
                "INSERT INTO permission_scope (scope_code, parent_scope_code, description, definition_hash, owner_service) VALUES (?,?,?,?,?)")) {
            ins.setString(1, code);
            ins.setString(2, parent);
            ins.setString(3, description);
            ins.setString(4, hash);
            ins.setString(5, owner);
            ins.executeUpdate();
        }
    }

    private void seedKeyIfMissing(Connection c, String scope, int pos, String name, String desc) throws Exception {
        try (PreparedStatement check = c.prepareStatement("SELECT 1 FROM permission_scope_key WHERE scope_code = ? AND key_name = ?")) {
            check.setString(1, scope);
            check.setString(2, name);
            try (ResultSet rs = check.executeQuery()) {
                if (rs.next()) return;
            }
        }
        try (PreparedStatement ins = c.prepareStatement(
                "INSERT INTO permission_scope_key (scope_code, key_position, key_name, description) VALUES (?,?,?,?)")) {
            ins.setString(1, scope);
            ins.setInt(2, pos);
            ins.setString(3, name);
            ins.setString(4, desc);
            ins.executeUpdate();
        }
    }

    /** Canonical fingerprint of an ordered key list — must match runtime. */
    static String fingerprint(List<String[]> orderedKeyPairs) {
        if (orderedKeyPairs.isEmpty()) return "0".repeat(64); // GLOBAL sentinel
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < orderedKeyPairs.size(); i++) {
            if (i > 0) sb.append('|');
            sb.append(orderedKeyPairs.get(i)[0]).append('=').append(orderedKeyPairs.get(i)[1]);
        }
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(sb.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
