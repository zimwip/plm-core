package com.plm.action;

import com.plm.shared.exception.AccessDeniedException;
import com.plm.shared.security.PlmUserContext;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Single authority for action-level permission checks.
 *
 * <h2>Public API — one assert per scope</h2>
 * <ul>
 *   <li>{@link #assertGlobal(String)}           — GLOBAL scope (no node context)</li>
 *   <li>{@link #assertNode(String, String)}      — NODE scope (resolves nodeId → nodeTypeId)</li>
 *   <li>{@link #assertNodeType(String, String)}  — NODE scope (nodeTypeId already known)</li>
 *   <li>{@link #assertLifecycle(String, String, String)} — LIFECYCLE scope (nodeTypeId + transitionId)</li>
 * </ul>
 *
 * <h2>Permission model</h2>
 * {@code action_permission} is the sole bridge linking
 * action × project_space × role × [node_type] × [transition].
 * The action's {@code scope} column drives which fields participate.
 * If no applicable {@code action_permission} rows exist for a given
 * (action, node_type[, transition]) key, the action is treated as not wired
 * and access is denied. Admin users bypass all checks.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionPermissionService  implements com.plm.shared.authorization.ActionPermissionPort {

    private final DSLContext          dsl;
    private final SecurityContextPort secCtx;

    // ================================================================
    // PUBLIC API — one assert per scope
    // ================================================================

    public void assertGlobal(String actionCode) {
        assertCanExecuteInternal(actionCode, null, null);
    }

    public void assertNode(String actionCode, String nodeId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return;

        String nodeTypeId = resolveNodeTypeId(nodeId);
        if (nodeTypeId == null) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot " + actionCode + " — node not found: " + nodeId);
        }

        ResolvedAction ra = resolveAction(actionCode);
        if (ra == null) return; // unknown action → open

        if (!canExecuteCore(ra.effectiveActionId, ra.scope, nodeTypeId, null, ctx)) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot " + actionCode + " on node " + nodeId);
        }
    }

    public void assertNodeType(String actionCode, String nodeTypeId) {
        assertCanExecuteInternal(actionCode, nodeTypeId, null);
    }

    public void assertLifecycle(String actionCode, String nodeTypeId, String transitionId) {
        assertCanExecuteInternal(actionCode, nodeTypeId, transitionId);
    }

    // ================================================================
    // NON-THROWING VARIANTS
    // ================================================================

    public boolean canOnNodeType(String actionCode, String nodeTypeId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return true;

        ResolvedAction ra = resolveAction(actionCode);
        if (ra == null) return true;

        return canExecuteCore(ra.effectiveActionId, ra.scope, nodeTypeId, null, ctx);
    }

    public Map<String, Boolean> canOnNodeTypes(String actionCode, Collection<String> nodeTypeIds) {
        Map<String, Boolean> result = new HashMap<>();
        if (nodeTypeIds.isEmpty()) return result;

        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) {
            nodeTypeIds.forEach(id -> result.put(id, true));
            return result;
        }
        if (ctx.getRoleIds().isEmpty()) {
            nodeTypeIds.forEach(id -> result.put(id, false));
            return result;
        }

        ResolvedAction ra = resolveAction(actionCode);
        if (ra == null) {
            nodeTypeIds.forEach(id -> result.put(id, true));
            return result;
        }

        for (String nodeTypeId : nodeTypeIds) {
            result.put(nodeTypeId,
                canExecuteCore(ra.effectiveActionId, ra.scope, nodeTypeId, null, ctx));
        }
        return result;
    }

    /**
     * Checks whether the current user can trigger a specific transition.
     * Resolves (nodeTypeId, actionId=act-transition) and delegates to
     * {@link #canExecuteCore}. If no matching action_permission rows exist for
     * the transition, the transition is treated as not wired → denied.
     */
    public void assertTransition(String nodeTypeId, String transitionId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return;

        ResolvedAction ra = resolveAction("TRANSITION");
        if (ra == null) return;

        if (!canExecuteCore(ra.actionId, "LIFECYCLE", nodeTypeId, transitionId, ctx)) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot trigger transition " + transitionId);
        }
    }

    /**
     * Single-arg convenience: asserts the current user can trigger this transition
     * on at least one node type that has it wired.
     */
    public void assertTransition(String transitionId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return;

        ResolvedAction ra = resolveAction("TRANSITION");
        if (ra == null) return;

        List<String> nodeTypeIds = dsl.selectDistinct(DSL.field("node_type_id"))
            .from("action_permission")
            .where("action_id = ?", ra.actionId)
            .and("transition_id = ?", transitionId)
            .and("node_type_id IS NOT NULL")
            .fetch(DSL.field("node_type_id"), String.class);

        for (String nodeTypeId : nodeTypeIds) {
            if (canExecuteCore(ra.actionId, "LIFECYCLE", nodeTypeId, transitionId, ctx)) return;
        }

        throw new AccessDeniedException(
            "User " + ctx.getUserId() + " cannot trigger transition " + transitionId);
    }

    // ================================================================
    // GLOBAL INTROSPECTION
    // ================================================================

    public List<String> getExecutableGlobalActionCodes() {
        PlmUserContext ctx = secCtx.currentUser();

        var allGlobal = dsl.select(DSL.field("id"), DSL.field("action_code"))
            .from("action")
            .where("scope = 'GLOBAL'")
            .fetch();

        if (ctx.isAdmin()) {
            return allGlobal.map(r -> r.get("action_code", String.class));
        }

        List<String> result = new ArrayList<>();
        for (var row : allGlobal) {
            String actionId = row.get("id",          String.class);
            String code     = row.get("action_code", String.class);
            if (canExecuteCore(actionId, "GLOBAL", null, null, ctx)) {
                result.add(code);
            }
        }
        return result;
    }

    public List<Map<String, Object>> listGlobalActions() {
        return dsl.select(
                DSL.field("id"),
                DSL.field("action_code"),
                DSL.field("display_name"),
                DSL.field("description"))
            .from("action")
            .where("scope = 'GLOBAL'")
            .orderBy(DSL.field("display_name"))
            .fetch()
            .map(r -> Map.<String, Object>of(
                "id",          r.get("id",           String.class),
                "actionCode",  r.get("action_code",  String.class),
                "displayName", r.get("display_name", String.class),
                "description", r.get("description",  String.class)));
    }

    // ================================================================
    // PACKAGE-PRIVATE — used by ActionService
    // ================================================================

    public boolean canExecute(String actionId, String scope,
                       String nodeTypeId, String transitionId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return true;
        String effectiveId = resolveEffectiveActionId(actionId);
        return canExecuteCore(effectiveId, scope, nodeTypeId, transitionId, ctx);
    }

    // ================================================================
    // INTERNALS
    // ================================================================

    private void assertCanExecuteInternal(String actionCode, String nodeTypeId, String transitionId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return;

        ResolvedAction ra = resolveAction(actionCode);
        if (ra == null) return; // unknown action → open

        if (!canExecuteCore(ra.effectiveActionId, ra.scope, nodeTypeId, transitionId, ctx)) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot execute '" + actionCode + "'"
                + (nodeTypeId != null ? " on node type " + nodeTypeId : ""));
        }
    }

    /**
     * Core allowlist check against {@code action_permission}. A single EXISTS query
     * proves the user's role has a matching permission row. Absence of any applicable
     * row (whether for this role or any role) = deny — "not wired" collapses into the
     * same check since the role filter is applied upfront.
     */
    private boolean canExecuteCore(String actionId, String scope,
                                   String nodeTypeId, String transitionId,
                                   PlmUserContext ctx) {
        Set<String> roleIds = ctx.getRoleIds();
        if (roleIds.isEmpty()) return false;

        String psId = secCtx.currentProjectSpaceId();
        String ph = String.join(",", Collections.nCopies(roleIds.size(), "?"));

        var q = dsl.selectOne().from("action_permission")
            .where("action_id = ?", actionId)
            .and("role_id IN (" + ph + ")", roleIds.toArray());
        if (psId != null) q = q.and("project_space_id = ?", psId);

        if ("GLOBAL".equals(scope)) {
            q = q.and("node_type_id IS NULL");
        } else {
            if (nodeTypeId != null) q = q.and("node_type_id = ?", nodeTypeId);
            if ("LIFECYCLE".equals(scope) && transitionId != null) {
                q = q.and("(transition_id = ? OR transition_id IS NULL)", transitionId);
            } else {
                q = q.and("transition_id IS NULL");
            }
        }

        return dsl.fetchExists(q);
    }

    private record ResolvedAction(String actionId, String scope, String effectiveActionId) {}

    private ResolvedAction resolveAction(String actionCode) {
        Record action = dsl.select(DSL.field("id"), DSL.field("scope"), DSL.field("managed_with"))
            .from("action")
            .where("action_code = ?", actionCode)
            .fetchOne();
        if (action == null) return null;
        String actionId   = action.get("id", String.class);
        String managedWith = action.get("managed_with", String.class);
        return new ResolvedAction(actionId, action.get("scope", String.class),
            managedWith != null ? managedWith : actionId);
    }

    /**
     * Returns the effective action ID for permission/guard lookups.
     * If the action has managed_with set, returns the manager's ID.
     */
    public String resolveEffectiveActionId(String actionId) {
        String managedWith = dsl.select(DSL.field("managed_with")).from("action")
            .where("id = ?", actionId)
            .fetchOne(DSL.field("managed_with"), String.class);
        return managedWith != null ? managedWith : actionId;
    }

    private String resolveNodeTypeId(String nodeId) {
        return dsl.select(DSL.field("node_type_id")).from("node")
            .where("id = ?", nodeId)
            .fetchOne(DSL.field("node_type_id"), String.class);
    }
}
