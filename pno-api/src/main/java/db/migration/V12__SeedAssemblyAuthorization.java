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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Seeds authorization grants for the new {@code nt-assembly} node type and
 * widens release rights so designers (in addition to reviewers and admins)
 * can execute the {@code tr-release} transition on Parts and Assemblies.
 *
 * <p>Strategy: read every existing {@code nodeType=nt-part} grant and clone
 * it with {@code nodeType=nt-assembly}. Then add a per-space designer grant
 * for {@code TRANSITION/tr-release} on both types. Idempotent: unique-key
 * collisions are swallowed so re-runs (or manual prior backfills) survive.
 *
 * <p>Fingerprint encoding mirrors {@link db.migration.V10__BackfillAuthorizationPolicy}
 * and the runtime {@code AuthorizationKeysFingerprint} so dedup keys match.
 */
public class V12__SeedAssemblyAuthorization extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection c = context.getConnection();

        List<String> spaces = new ArrayList<>();
        try (Statement s = c.createStatement(); ResultSet rs = s.executeQuery("SELECT id FROM project_space")) {
            while (rs.next()) spaces.add(rs.getString(1));
        }
        if (spaces.isEmpty()) return;

        cloneNtPartGrantsToAssembly(c, spaces);
        addDesignerReleaseGrants(c, spaces);
    }

    /** For each (perm, scope, role, ps) where keys include nodeType=nt-part, create the same grant for nt-assembly. */
    private void cloneNtPartGrantsToAssembly(Connection c, List<String> spaces) throws Exception {
        // Read every Part grant, capturing all its keys so we preserve LIFECYCLE's transition key.
        // policyId -> (perm, scope, role, ps, ordered keys map)
        Map<String, GrantTemplate> templates = new LinkedHashMap<>();
        try (PreparedStatement ps = c.prepareStatement(
                "SELECT ap.id, ap.permission_code, ap.scope_code, ap.role_id, ap.project_space_id "
              + "FROM authorization_policy ap "
              + "JOIN authorization_policy_key apk ON apk.policy_id = ap.id "
              + "WHERE apk.key_name = 'nodeType' AND apk.key_value = 'nt-part'")) {
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    templates.put(rs.getString(1), new GrantTemplate(
                        rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5)));
                }
            }
        }
        if (templates.isEmpty()) return;

        try (PreparedStatement keysPs = c.prepareStatement(
                "SELECT key_name, key_value FROM authorization_policy_key WHERE policy_id = ? ORDER BY key_name");
             PreparedStatement insPolicy = c.prepareStatement(
                "INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint) VALUES (?,?,?,?,?,?)");
             PreparedStatement insKey = c.prepareStatement(
                "INSERT INTO authorization_policy_key (policy_id, key_name, key_value) VALUES (?,?,?)")) {

            for (Map.Entry<String, GrantTemplate> e : templates.entrySet()) {
                GrantTemplate tpl = e.getValue();

                List<String[]> assemblyKeys = new ArrayList<>();
                keysPs.setString(1, e.getKey());
                try (ResultSet kr = keysPs.executeQuery()) {
                    while (kr.next()) {
                        String name = kr.getString(1);
                        String value = "nodeType".equals(name) ? "nt-assembly" : kr.getString(2);
                        assemblyKeys.add(new String[]{name, value});
                    }
                }
                // Re-order to match the runtime key ordering used by V10:
                //   NODE      → [nodeType]
                //   LIFECYCLE → [nodeType, transition]
                assemblyKeys.sort((a, b) -> {
                    int rank1 = "nodeType".equals(a[0]) ? 0 : ("transition".equals(a[0]) ? 1 : 2);
                    int rank2 = "nodeType".equals(b[0]) ? 0 : ("transition".equals(b[0]) ? 1 : 2);
                    return Integer.compare(rank1, rank2);
                });

                String fp = fingerprint(assemblyKeys);
                String policyId = UUID.randomUUID().toString();
                insPolicy.setString(1, policyId);
                insPolicy.setString(2, tpl.permissionCode);
                insPolicy.setString(3, tpl.scopeCode);
                insPolicy.setString(4, tpl.roleId);
                insPolicy.setString(5, tpl.projectSpaceId);
                insPolicy.setString(6, fp);
                try {
                    insPolicy.executeUpdate();
                } catch (java.sql.SQLException dup) {
                    // Already present (re-run, manual backfill). Skip the keys too.
                    continue;
                }
                for (String[] kv : assemblyKeys) {
                    insKey.setString(1, policyId);
                    insKey.setString(2, kv[0]);
                    insKey.setString(3, kv[1]);
                    insKey.executeUpdate();
                }
            }
        }
    }

    /** Designer needs LIFECYCLE/tr-release on Part and Assembly so the new sigreq (reviewer + designer) can be satisfied. */
    private void addDesignerReleaseGrants(Connection c, List<String> spaces) throws Exception {
        String[] nodeTypes = {"nt-part", "nt-assembly"};
        try (PreparedStatement insPolicy = c.prepareStatement(
                "INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint) VALUES (?,?,?,?,?,?)");
             PreparedStatement insKey = c.prepareStatement(
                "INSERT INTO authorization_policy_key (policy_id, key_name, key_value) VALUES (?,?,?)")) {

            for (String nodeType : nodeTypes) {
                for (String spaceId : spaces) {
                    List<String[]> keys = List.of(
                        new String[]{"nodeType",   nodeType},
                        new String[]{"transition", "tr-release"}
                    );
                    String fp = fingerprint(keys);
                    String policyId = UUID.randomUUID().toString();
                    insPolicy.setString(1, policyId);
                    insPolicy.setString(2, "TRANSITION");
                    insPolicy.setString(3, "LIFECYCLE");
                    insPolicy.setString(4, "role-designer");
                    insPolicy.setString(5, spaceId);
                    insPolicy.setString(6, fp);
                    try {
                        insPolicy.executeUpdate();
                    } catch (java.sql.SQLException dup) {
                        continue;
                    }
                    for (String[] kv : keys) {
                        insKey.setString(1, policyId);
                        insKey.setString(2, kv[0]);
                        insKey.setString(3, kv[1]);
                        insKey.executeUpdate();
                    }
                }
            }
        }
    }

    private static String fingerprint(List<String[]> orderedKeyPairs) {
        if (orderedKeyPairs.isEmpty()) return "0".repeat(64);
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

    private record GrantTemplate(String permissionCode, String scopeCode, String roleId, String projectSpaceId) {}
}
