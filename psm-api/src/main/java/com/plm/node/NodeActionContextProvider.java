package com.plm.node;

import com.plm.platform.action.ActionNodeContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Resolves node context (nodeTypeId, currentStateId, lock state) for PlmActionAspect.
 * Runs DB queries against node/node_version/plm_transaction/node_version_link tables.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NodeActionContextProvider implements ActionNodeContextPort {

    private final DSLContext dsl;

    @Override
    public Optional<NodeCtx> resolveFromNodeId(String nodeId, String userId) {
        String nodeTypeId = dsl.select(DSL.field("n.node_type_id").as("node_type_id"))
            .from("node n")
            .join("node_version nv").on("nv.node_id = n.id")
            .join("plm_transaction pt").on("pt.id = nv.tx_id")
            .where("n.id = ?", nodeId)
            .and("(pt.status = 'COMMITTED' OR pt.owner_id = ?)", userId)
            .orderBy(DSL.field("nv.version_number").desc())
            .limit(1)
            .fetchOne(DSL.field("node_type_id"), String.class);

        if (nodeTypeId == null) {
            log.debug("NodeActionContextProvider: node {} not found for user {}", nodeId, userId);
            return Optional.empty();
        }

        Record stateRow = dsl.fetchOne(
            "SELECT nv.lifecycle_state_id FROM node_version nv " +
            "JOIN plm_transaction pt ON pt.id = nv.tx_id " +
            "WHERE nv.node_id = ? AND pt.status IN ('COMMITTED','OPEN') " +
            "ORDER BY nv.version_number DESC LIMIT 1", nodeId);
        String currentStateId = stateRow != null
            ? stateRow.get("lifecycle_state_id", String.class) : null;

        String lockedBy = dsl.select(DSL.field("locked_by")).from("node")
            .where("id = ?", nodeId)
            .fetchOne(DSL.field("locked_by"), String.class);
        boolean isLocked = lockedBy != null;
        boolean isLockedByCurrentUser = isLocked && userId.equals(lockedBy);

        return Optional.of(new NodeCtx(nodeId, nodeTypeId, currentStateId, isLocked, isLockedByCurrentUser));
    }

    @Override
    public Optional<NodeCtx> resolveFromLinkId(String linkId, String userId) {
        String nodeId = dsl.select(DSL.field("nv.node_id").as("node_id"))
            .from("node_version_link nvl")
            .join("node_version nv").on("nv.id = nvl.source_node_version_id")
            .where("nvl.id = ?", linkId)
            .limit(1)
            .fetchOne(DSL.field("node_id"), String.class);

        if (nodeId == null) {
            log.debug("NodeActionContextProvider: link {} source not found", linkId);
            return Optional.empty();
        }
        return resolveFromNodeId(nodeId, userId);
    }
}
