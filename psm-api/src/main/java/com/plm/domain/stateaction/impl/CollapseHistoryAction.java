package com.plm.domain.stateaction.impl;

import com.plm.domain.algorithm.AlgorithmBean;
import com.plm.domain.algorithm.AlgorithmParam;
import com.plm.domain.metadata.Metadata;
import com.plm.domain.metadata.MetadataService;
import com.plm.domain.stateaction.StateAction;
import com.plm.domain.stateaction.StateActionContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Collapses revision history when entering a state marked with a specific
 * metadata key (default: "released").
 *
 * Parameterized via {@code meta_key} — the action checks that the target
 * state has this metadata key set to "true" before proceeding. This makes
 * the action reusable across different lifecycle configurations.
 *
 * Deletes ALL committed versions of the previous revision. Versions pinned
 * by a baseline or VERSION_TO_VERSION link are preserved. The new version's
 * iteration is set to 0 (displayed as just the revision letter, e.g. "B").
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

        collapseRevisionHistory(ctx.nodeId(), ctx.revision());

        // Truncate the new version's iteration (e.g. B.1 -> B)
        dsl.execute(
            "UPDATE node_version SET iteration = 0 WHERE id = ?",
            ctx.versionId()
        );
    }

    private void collapseRevisionHistory(String nodeId, String oldRevision) {
        // All committed versions of the old revision
        List<String> toDelete = dsl
            .select(DSL.field("nv.id").as("nv_id"))
            .from("node_version nv")
            .join("plm_transaction tx")
            .on("tx.id = nv.tx_id")
            .where("nv.node_id = ?", nodeId)
            .and("nv.revision = ?", oldRevision)
            .and("tx.status = 'COMMITTED'")
            .fetch()
            .map(r -> r.get("nv_id", String.class))
            .stream()
            // Skip versions pinned by a baseline or VERSION_TO_VERSION link
            .filter(id ->
                dsl.fetchCount(
                    dsl.selectOne().from("baseline_entry")
                       .where("resolved_version_id = ?", id)
                ) == 0 &&
                dsl.fetchCount(
                    dsl.selectOne().from("node_version_link")
                       .where("pinned_version_id = ?", id)
                ) == 0
            )
            .collect(Collectors.toList());

        if (toDelete.isEmpty()) return;

        String ph = String.join(",", Collections.nCopies(toDelete.size(), "?"));
        Object[] p = toDelete.toArray();

        dsl.execute("DELETE FROM node_signature WHERE node_version_id IN (" + ph + ")", p);
        dsl.execute("DELETE FROM node_version_link WHERE source_node_version_id IN (" + ph + ")", p);
        dsl.execute("DELETE FROM node_version_attribute WHERE node_version_id IN (" + ph + ")", p);
        // NULL out any previous_version_id chains pointing into deleted versions
        dsl.execute("UPDATE node_version SET previous_version_id = NULL WHERE previous_version_id IN (" + ph + ")", p);
        dsl.execute("DELETE FROM node_version WHERE id IN (" + ph + ")", p);

        log.info("Collapsed revision: node={} revision={} removed={}", nodeId, oldRevision, toDelete.size());
    }
}
