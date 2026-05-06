package com.plm.node.lifecycle.internal.stateaction.impl;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.algorithm.AlgorithmParam;
import com.plm.shared.metadata.Metadata;
import com.plm.shared.metadata.MetadataService;
import com.plm.node.lifecycle.internal.stateaction.StateAction;
import com.plm.node.lifecycle.internal.stateaction.StateActionContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Collapses revision iteration history when entering a state marked with a
 * specific metadata key (default: "released").
 *
 * Parameterized via {@code meta_key} — the action checks that the target
 * state has this metadata key set to "true" before proceeding. This makes
 * the action reusable across different lifecycle configurations.
 *
 * Deletes ALL committed versions of the CURRENT revision except the one
 * entering the release state. Versions pinned by a baseline or
 * VERSION_TO_VERSION link are preserved. The surviving version's iteration
 * is set to 0 (displayed as just the revision letter, e.g. "A").
 *
 * Revision bump (A -> B) happens later at Revise, not at Release.
 */
@Metadata(key = "released", target = "LIFECYCLE_STATE",
    description = "Release milestone — boundary for history collapse")
@Slf4j
@AlgorithmBean(code = "collapse_history",
    name = "Collapse History",
    description = "Deletes committed versions of previous revision when entering a release boundary state")
@AlgorithmParam(name = "meta_key", label = "Boundary Metadata Key", dataType = "STRING",
    defaultValue = "released", displayOrder = 1)
@RequiredArgsConstructor
public class CollapseHistoryAction implements StateAction {

    private final DSLContext dsl;
    private final MetadataService metadataService;

    @Override
    public String code() {
        return "collapse_history";
    }

    @Override
    public void execute(StateActionContext ctx) {
        // Check metadata key on target state (parameterized, default "released")
        String metaKey = ctx.parameters().getOrDefault("meta_key", "released");
        if (!metadataService.isTrue("LIFECYCLE_STATE", ctx.toStateId(), metaKey)) {
            log.debug("collapse_history: target state {} does not have metadata '{}' — skipping",
                ctx.toStateId(), metaKey);
            return;
        }

        // Collapse iteration history of the CURRENT revision (no revision bump at Release)
        collapseRevisionHistory(ctx.nodeId(), ctx.revision(), ctx.versionId());

        // Truncate iteration (e.g. A.3 -> A displayed as just "A")
        dsl.execute(
            "UPDATE node_version SET iteration = 0 WHERE id = ?",
            ctx.versionId()
        );
    }

    private void collapseRevisionHistory(String nodeId, String revision, String currentVersionId) {
        // All committed versions of this revision EXCEPT the current one
        List<String> toDelete = dsl
            .select(DSL.field("nv.id").as("nv_id"))
            .from("node_version nv")
            .join("plm_transaction tx")
            .on("tx.id = nv.tx_id")
            .where("nv.node_id = ?", nodeId)
            .and("nv.revision = ?", revision)
            .and("nv.id <> ?", currentVersionId)
            .and("tx.status = 'COMMITTED'")
            .fetch()
            .map(r -> r.get("nv_id", String.class))
            .stream()
            // Skip versions pinned by a baseline or VERSION_TO_VERSION SELF link.
            // V2V is now encoded in target_key as 'logical_id@versionNumber'; baseline
            // entries store the same canonical key in resolved_key.
            .filter(id -> {
                org.jooq.Record meta = dsl.fetchOne("""
                    SELECT n.logical_id, nv.version_number
                    FROM node_version nv JOIN node n ON n.id = nv.node_id
                    WHERE nv.id = ?
                    """, id);
                if (meta == null) return true;
                String pinnedKey = meta.get("logical_id", String.class) + "@" + meta.get("version_number", Integer.class);
                int blRefs = dsl.fetchCount(dsl.selectOne().from("baseline_entry")
                    .where("resolved_key = ?", pinnedKey));
                if (blRefs > 0) return false;
                int linkRefs = dsl.fetchCount(dsl.selectOne().from("node_version_link")
                    .where("target_source_id = 'SELF'").and("target_key = ?", pinnedKey));
                return linkRefs == 0;
            })
            .collect(Collectors.toList());

        if (toDelete.isEmpty()) return;

        String ph = String.join(",", Collections.nCopies(toDelete.size(), "?"));
        Object[] p = toDelete.toArray();

        // Move signatures only from the last version (highest version_number) to current
        String lastVersionId = dsl
            .select(DSL.field("id"))
            .from("node_version")
            .where("id IN (" + ph + ")", p)
            .orderBy(DSL.field("version_number").desc())
            .limit(1)
            .fetchOne("id", String.class);
        if (lastVersionId != null) {
            dsl.execute("UPDATE node_signature SET node_version_id = ? WHERE node_version_id = ?",
                currentVersionId, lastVersionId);
        }
        // Delete signatures from remaining deleted versions
        dsl.execute("DELETE FROM node_signature WHERE node_version_id IN (" + ph + ")", p);

        // Move comments from ALL deleted versions to the current version
        dsl.execute("UPDATE node_version_comment SET node_version_id = ? WHERE node_version_id IN (" + ph + ")",
            prepend(currentVersionId, p));

        dsl.execute("DELETE FROM node_version_link WHERE source_node_version_id IN (" + ph + ")", p);
        dsl.execute("DELETE FROM node_version_attribute WHERE node_version_id IN (" + ph + ")", p);
        // NULL out any previous_version_id chains pointing into deleted versions
        dsl.execute("UPDATE node_version SET previous_version_id = NULL WHERE previous_version_id IN (" + ph + ")", p);
        dsl.execute("DELETE FROM node_version WHERE id IN (" + ph + ")", p);

        log.info("Collapsed revision: node={} revision={} removed={}", nodeId, revision, toDelete.size());
    }

    private Object[] prepend(Object first, Object[] rest) {
        Object[] result = new Object[rest.length + 1];
        result[0] = first;
        System.arraycopy(rest, 0, result, 1, rest.length);
        return result;
    }
}
