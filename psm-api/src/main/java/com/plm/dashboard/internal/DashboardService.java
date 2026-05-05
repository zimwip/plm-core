package com.plm.dashboard.internal;
import com.plm.node.transaction.internal.PlmTransactionService;
import com.plm.node.transaction.internal.LockService;

import com.plm.action.ActionService;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.NodeTypeConfig;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Données agrégées pour le tableau de bord utilisateur.
 *
 * Deux vues distinctes, chargeables indépendamment :
 *  - openTransaction : résumé de la transaction OPEN courante (noeuds modifiés)
 *  - workItems       : derniers noeuds modifiés (COMMITTED) sur lesquels
 *                      l'utilisateur a au moins une action disponible,
 *                      triés par nombre d'actions décroissant
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DSLContext           dsl;
    private final ConfigCache          configCache;
    private final ActionService        actionService;
    private final LockService          lockService;
    private final PlmTransactionService txService;
    private final SecurityContextPort  secCtx;

    /** Max nodes scanned to build workItems (stop early if 10 found). */
    private static final int SCAN_LIMIT = 30;
    /** Max workItems returned. */
    private static final int WORK_ITEM_LIMIT = 10;

    // ================================================================
    // OPEN TRANSACTION SUMMARY
    // ================================================================

    public Map<String, Object> getOpenTransactionSummary(String userId) {
        String psId = secCtx.requireProjectSpaceId();
        String txId = txService.findOpenTransaction(userId);
        if (txId == null) return null;

        Record tx = dsl.select().from("plm_transaction")
            .where("id = ?", txId)
            .fetchOne();
        if (tx == null) return null;

        // Scope to the caller's current project space — nodes from other spaces
        // belonging to the same transaction are excluded from the summary.
        List<Record> rows = dsl.fetch(
            "SELECT n.id AS node_id, n.logical_id, n.node_type_id, " +
            "       nv.revision, nv.iteration, nv.lifecycle_state_id, nv.change_type " +
            "FROM node_version nv " +
            "JOIN node n  ON n.id  = nv.node_id " +
            "WHERE nv.tx_id = ? " +
            "  AND n.project_space_id = ? " +
            "ORDER BY nv.created_at DESC",
            txId, psId
        );

        List<Map<String, Object>> nodeList = new ArrayList<>();
        for (Record r : rows) {
            Map<String, Object> nm = new LinkedHashMap<>();
            nm.put("nodeId",           r.get("node_id",           String.class));
            nm.put("logicalId",        r.get("logical_id",        String.class));
            String ntId = r.get("node_type_id", String.class);
            nm.put("nodeTypeId",       ntId);
            nm.put("nodeTypeName",     configCache.getNodeType(ntId)
                .map(NodeTypeConfig::name).orElse(ntId));
            nm.put("revision",         r.get("revision",          String.class));
            nm.put("iteration",        r.get("iteration",         Integer.class));
            nm.put("lifecycleStateId", r.get("lifecycle_state_id",String.class));
            nm.put("changeType",       r.get("change_type",       String.class));
            nodeList.add(nm);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("txId",      txId);
        result.put("title",     tx.get("commit_comment", String.class));
        result.put("createdAt", tx.get("created_at", Object.class));
        result.put("nodes",     nodeList);
        return result;
    }

    // ================================================================
    // WORK ITEMS
    // ================================================================

    public List<Map<String, Object>> getWorkItems(String userId) {
        String psId = secCtx.requireProjectSpaceId();

        // Fetch last SCAN_LIMIT committed nodes in the current project space
        // (most recently versioned first).
        List<Record> candidates = dsl.fetch(
            "SELECT n.id AS node_id, n.logical_id, n.node_type_id, " +
            "       nv.revision, nv.iteration, nv.lifecycle_state_id, nv.created_at " +
            "FROM node n " +
            "JOIN node_version nv  ON nv.node_id = n.id " +
            "JOIN plm_transaction pt ON pt.id = nv.tx_id " +
            "WHERE pt.status = 'COMMITTED' " +
            "  AND n.project_space_id = ? " +
            "  AND nv.version_number = (" +
            "    SELECT MAX(nv2.version_number) " +
            "    FROM node_version nv2 " +
            "    JOIN plm_transaction pt2 ON pt2.id = nv2.tx_id " +
            "    WHERE nv2.node_id = n.id AND pt2.status = 'COMMITTED'" +
            "  ) " +
            "ORDER BY nv.created_at DESC " +
            "LIMIT " + SCAN_LIMIT,
            psId
        );

        List<Map<String, Object>> result = new ArrayList<>();

        for (Record r : candidates) {
            if (result.size() >= WORK_ITEM_LIMIT) break;

            String nodeId        = r.get("node_id",           String.class);
            String nodeTypeId    = r.get("node_type_id",      String.class);
            String currentStateId= r.get("lifecycle_state_id",String.class);

            LockService.LockInfo lockInfo = lockService.getLockInfo(nodeId);
            boolean isLockedByMe = lockInfo.locked() && userId.equals(lockInfo.lockedBy());

            List<Map<String, Object>> actions = actionService.resolveActionsForNode(
                nodeId, nodeTypeId, currentStateId,
                lockInfo.locked(), isLockedByMe
            );

            if (actions.isEmpty()) continue;

            // Dashboard only shows feasible actions: authorized + no guard violations.
            List<Map<String, Object>> actionSummary = new ArrayList<>();
            for (Map<String, Object> a : actions) {
                if (!Boolean.TRUE.equals(a.get("authorized"))) continue;

                Map<String, Object> summary = new LinkedHashMap<>();
                summary.put("id",              a.get("id"));
                summary.put("actionCode",      a.get("actionCode"));
                summary.put("name",            a.get("name"));
                summary.put("description",     a.get("description"));
                summary.put("displayCategory", a.get("displayCategory"));
                summary.put("guardViolations", a.get("guardViolations"));
                actionSummary.add(summary);
            }
            if (actionSummary.isEmpty()) continue;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("nodeId",           nodeId);
            item.put("logicalId",        r.get("logical_id",     String.class));
            item.put("nodeTypeId",       nodeTypeId);
            item.put("nodeTypeName",     configCache.getNodeType(nodeTypeId)
                .map(NodeTypeConfig::name).orElse(nodeTypeId));
            item.put("revision",         r.get("revision",       String.class));
            item.put("iteration",        r.get("iteration",      Integer.class));
            item.put("lifecycleStateId", currentStateId);
            item.put("lastModifiedAt",   r.get("created_at",     Object.class));
            item.put("actions",          actionSummary);
            result.add(item);
        }

        // Order by number of available actions (most actionable first)
        result.sort((a, b) -> {
            int ca = ((List<?>) a.get("actions")).size();
            int cb = ((List<?>) b.get("actions")).size();
            return Integer.compare(cb, ca);
        });

        return result;
    }
}
