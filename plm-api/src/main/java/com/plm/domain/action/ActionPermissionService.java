package com.plm.domain.action;

import com.plm.domain.exception.PlmFunctionalException;
import com.plm.infrastructure.security.PlmProjectSpaceContext;
import com.plm.infrastructure.security.PlmSecurityContext;
import com.plm.infrastructure.security.PlmUserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;

/**
 * Unified action-level permission check.
 *
 * Resolution algorithm:
 *   1. Admin → always allowed.
 *   2. Load node_type_action, assert status = ENABLED.
 *   3. Count node_action_permission rows for (node_type_action_id, user roles, state or NULL).
 *   4. Zero rows = open to all (consistent with existing transition_permission semantics).
 *   5. ≥1 rows  = allowlist — user must match at least one row.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionPermissionService {

    private final DSLContext dsl;

    /**
     * Throws {@link AccessDeniedException} if the current user cannot execute
     * the given node_type_action on the node in its current lifecycle state.
     */
    public void assertCanExecute(String nodeTypeActionId, String currentStateId) {
        if (!canExecute(nodeTypeActionId, currentStateId)) {
            PlmUserContext ctx = PlmSecurityContext.get();
            throw new AccessDeniedException(
                "User " + (ctx != null ? ctx.getUserId() : "unknown") + " cannot execute action " + nodeTypeActionId);
        }
    }

    public boolean canExecute(String nodeTypeActionId, String currentStateId) {
        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx == null || ctx.isAdmin()) return true;

        // Check status = ENABLED
        String status = dsl.select(DSL.field("status"))
            .from("node_type_action")
            .where("id = ?", nodeTypeActionId)
            .fetchOne(DSL.field("status"), String.class);
        if (!"ENABLED".equals(status)) return false;

        Set<String> roleIds = ctx.getRoleIds();
        if (roleIds.isEmpty()) return false;

        String psId = PlmProjectSpaceContext.get();

        // Zero permission rows (for this project space) = open to all
        var countQ = dsl.selectOne().from("node_action_permission")
               .where("node_type_action_id = ?", nodeTypeActionId);
        if (psId != null) countQ = countQ.and("project_space_id = ?", psId);
        if (dsl.fetchCount(countQ) == 0) return true;

        String ph = String.join(",", Collections.nCopies(roleIds.size(), "?"));

        var allowQ = DSL.selectOne()
            .from("node_action_permission")
            .where("node_type_action_id = ?", nodeTypeActionId)
            .and("role_id IN (" + ph + ")", roleIds.toArray())
            .and("(lifecycle_state_id = ? OR lifecycle_state_id IS NULL)", currentStateId);
        if (psId != null) allowQ = allowQ.and("project_space_id = ?", psId);

        return dsl.fetchCount(allowQ) > 0;
    }

    public static class AccessDeniedException extends PlmFunctionalException {
        public AccessDeniedException(String message) { super(message, 403); }
    }
}
