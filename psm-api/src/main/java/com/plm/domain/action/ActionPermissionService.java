package com.plm.domain.action;

import com.plm.domain.exception.PlmFunctionalException;
import com.plm.infrastructure.security.PlmProjectSpaceContext;
import com.plm.infrastructure.security.PlmSecurityContext;
import com.plm.infrastructure.security.PlmUserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Unified action-level permission check against the {@code action_permission} table.
 *
 * <h2>Permission model</h2>
 * {@code action_permission} links: action × project_space × role × [node_type] × [transition]
 *
 * <p>The action's {@code scope} column (on {@code action}) drives which fields
 * participate in the check:
 * <ul>
 *   <li><b>GLOBAL</b> — {@code (action_id, project_space_id, role_id)}. No node context.
 *       Used for admin/config operations (MANAGE_METAMODEL, MANAGE_ROLES, MANAGE_BASELINES).</li>
 *   <li><b>NODE</b> — adds {@code node_type_id}. Standard node actions (checkout, update, …).</li>
 *   <li><b>LIFECYCLE</b> — adds {@code node_type_id} + {@code transition_id}.
 *       Per-transition control: a DESIGNER may freeze but not unfreeze even though both
 *       transitions share the same from_state.</li>
 * </ul>
 *
 * <h2>Permissive default</h2>
 * Zero matching rows in {@code action_permission} = open to all (allowlist only when
 * at least one row exists). Admin users bypass all checks.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionPermissionService {

    private final DSLContext dsl;

    /**
     * Throws {@link AccessDeniedException} if the current user cannot execute
     * the given node_type_action.
     */
    public void assertCanExecute(String nodeTypeActionId) {
        if (!canExecute(nodeTypeActionId)) {
            PlmUserContext ctx = PlmSecurityContext.get();
            throw new AccessDeniedException(
                "User " + (ctx != null ? ctx.getUserId() : "unknown")
                + " cannot execute action " + nodeTypeActionId);
        }
    }

    /**
     * Returns {@code true} if the current user can execute the given node_type_action.
     */
    public boolean canExecute(String nodeTypeActionId) {
        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx == null || ctx.isAdmin()) return true;

        Record nta = dsl.select(
                DSL.field("node_type_id"),
                DSL.field("action_id"),
                DSL.field("transition_id"),
                DSL.field("status"))
            .from("node_type_action")
            .where("id = ?", nodeTypeActionId)
            .fetchOne();

        if (nta == null || !"ENABLED".equals(nta.get("status", String.class))) return false;

        String nodeTypeId   = nta.get("node_type_id",  String.class);
        String actionId     = nta.get("action_id",     String.class);
        String transitionId = nta.get("transition_id", String.class);

        // Resolve scope from action
        String scope = dsl.select(DSL.field("scope")).from("action")
            .where("id = ?", actionId)
            .fetchOne(DSL.field("scope"), String.class);

        return canExecuteCore(actionId, scope, nodeTypeId, transitionId, ctx);
    }

    /**
     * Permission check by action code and node/transition context.
     * Called by {@link com.plm.infrastructure.security.PlmActionAspect}.
     *
     * <p>{@code nodeTypeId} is required for NODE and LIFECYCLE scope actions.
     * {@code transitionId} is required for LIFECYCLE scope actions; pass {@code null}
     * for NODE scope (or to match any transition when blanket rows are seeded).
     *
     * <p>The check is skipped (open to all) if no enabled {@code node_type_action}
     * row exists for the combination.
     */
    public void assertCanExecuteByCode(String nodeTypeId, String actionCode, String transitionId) {
        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx == null || ctx.isAdmin()) return;

        // Resolve action row (id + scope)
        Record action = dsl.select(DSL.field("id"), DSL.field("scope"))
            .from("action")
            .where("action_code = ?", actionCode)
            .fetchOne();
        if (action == null) return; // unknown code → open to all

        String actionId = action.get("id",    String.class);
        String scope    = action.get("scope", String.class);

        // For LIFECYCLE scope: look up the NTA matching the specific transition
        // For other scopes: any enabled NTA for (nodeTypeId, actionId)
        if (nodeTypeId != null) {
            var ntaQuery = dsl.select(DSL.field("id"))
                .from("node_type_action")
                .where("node_type_id = ?", nodeTypeId)
                .and("action_id = ?", actionId)
                .and("status = 'ENABLED'");
            if ("LIFECYCLE".equals(scope) && transitionId != null) {
                ntaQuery = ntaQuery.and("transition_id = ?", transitionId);
            }
            String ntaId = ntaQuery.limit(1).fetchOne(DSL.field("id"), String.class);
            if (ntaId == null) return; // not configured for this node type → open to all
        }

        if (!canExecuteCore(actionId, scope, nodeTypeId, transitionId, ctx)) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot execute action '" + actionCode
                + (nodeTypeId != null ? "' on node type '" + nodeTypeId + "'" : "'"));
        }
    }

    // ── Global permission introspection ──────────────────────────────

    /**
     * Returns the list of GLOBAL action codes the current user can execute
     * in the active project space.  Admin users get all global actions.
     * Used by the frontend to determine which write buttons to show.
     */
    public List<String> getExecutableGlobalActionCodes() {
        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx == null) return List.of();

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

    /**
     * Returns all actions with {@code scope = 'GLOBAL'} from the action catalog.
     * Exposed to the frontend so the Access Rights section can enumerate them.
     */
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

    // ── Core allowlist ────────────────────────────────────────────────

    /**
     * Core allowlist check against {@code action_permission}.
     *
     * <p>Match criteria vary by scope:
     * <ul>
     *   <li>GLOBAL: {@code action_id + project_space_id + role_id}</li>
     *   <li>NODE: same + {@code node_type_id}, {@code transition_id IS NULL}</li>
     *   <li>LIFECYCLE: same + {@code node_type_id} +
     *       {@code (transition_id = ? OR transition_id IS NULL)}</li>
     * </ul>
     */
    boolean canExecuteCore(String actionId, String scope,
                                   String nodeTypeId, String transitionId,
                                   PlmUserContext ctx) {
        Set<String> roleIds = ctx.getRoleIds();
        if (roleIds.isEmpty()) return false;

        String psId = PlmProjectSpaceContext.get();

        // Build the base filter applicable to this scope
        var baseQ = dsl.selectOne().from("action_permission")
            .where("action_id = ?", actionId);
        if (psId != null) baseQ = baseQ.and("project_space_id = ?", psId);

        if ("GLOBAL".equals(scope)) {
            baseQ = baseQ.and("node_type_id IS NULL");
        } else {
            // NODE or LIFECYCLE: must match node_type_id
            if (nodeTypeId != null) baseQ = baseQ.and("node_type_id = ?", nodeTypeId);
            if ("LIFECYCLE".equals(scope) && transitionId != null) {
                baseQ = baseQ.and("(transition_id = ? OR transition_id IS NULL)", transitionId);
            } else {
                baseQ = baseQ.and("transition_id IS NULL");
            }
        }

        // Zero applicable rows = open to all (permissive default)
        if (dsl.fetchCount(baseQ) == 0) return true;

        // Allowlist check: at least one row must match a role the user has
        String ph = String.join(",", Collections.nCopies(roleIds.size(), "?"));
        var allowQ = DSL.selectOne().from("action_permission")
            .where("action_id = ?", actionId)
            .and("role_id IN (" + ph + ")", roleIds.toArray());
        if (psId != null) allowQ = allowQ.and("project_space_id = ?", psId);

        if ("GLOBAL".equals(scope)) {
            allowQ = allowQ.and("node_type_id IS NULL");
        } else {
            if (nodeTypeId != null) allowQ = allowQ.and("node_type_id = ?", nodeTypeId);
            if ("LIFECYCLE".equals(scope) && transitionId != null) {
                allowQ = allowQ.and("(transition_id = ? OR transition_id IS NULL)", transitionId);
            } else {
                allowQ = allowQ.and("transition_id IS NULL");
            }
        }

        return dsl.fetchCount(allowQ) > 0;
    }

    public static class AccessDeniedException extends PlmFunctionalException {
        public AccessDeniedException(String message) { super(message, 403); }
    }
}
