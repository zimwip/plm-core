package com.plm.domain.action;

import java.lang.annotation.*;

/**
 * Declares the action-level authorization requirement for a service method.
 *
 * <p>Action codes must match {@code action.action_code} exactly
 * (e.g. {@code "CHECKOUT"}, not {@code "act-checkout"}).
 * Use the {@code action_code} column value, not the {@code id} column.
 *
 * <h2>Variants</h2>
 *
 * <p><b>Global action</b> — no node context, checked against {@code action_permission} (GLOBAL scope):
 * <pre>
 *   {@literal @}PlmAction("MANAGE_METAMODEL")
 *   public String createLifecycle(...) { ... }
 * </pre>
 *
 * <p><b>Node-scoped action</b> — resolves nodeId via SpEL, then nodeType + current state:
 * <pre>
 *   {@literal @}PlmAction(value = "CHECKOUT", nodeIdExpr = "#nodeId")
 *   public String checkout(String nodeId, String userId, String txId) { ... }
 * </pre>
 *
 * <p><b>Node-scoped action with specific transition</b> — adds transitionId to scope the
 * permission check to a specific lifecycle transition (disambiguates multiple transitions
 * from the same state — e.g. "Release" vs "Unfreeze" both from st-frozen):
 * <pre>
 *   {@literal @}PlmAction(value = "TRANSITION", nodeIdExpr = "#nodeId", transitionIdExpr = "#transitionId")
 *   public String applyTransition(String nodeId, String transitionId, ...) { ... }
 * </pre>
 *
 * <p><b>NodeType-scoped action</b> — for {@code createNode} where nodeId doesn't exist yet.
 * The aspect checks {@code action_permission} using the target node type and
 * {@code currentStateId = null} (matches global permission rows with no state restriction):
 * <pre>
 *   {@literal @}PlmAction(value = "CHECKOUT", nodeTypeIdExpr = "#nodeTypeId")
 *   public String createNode(String projectSpaceId, String nodeTypeId, ...) { ... }
 * </pre>
 *
 * <p><b>Link-scoped action</b> — for {@code deleteLink}/{@code updateLink} where the signature
 * carries a {@code linkId} instead of a {@code nodeId}. The aspect resolves the source
 * node from {@code node_version_link}:
 * <pre>
 *   {@literal @}PlmAction(value = "DELETE_LINK", linkIdExpr = "#linkId")
 *   public void deleteLink(String linkId, String userId, String txId) { ... }
 * </pre>
 *
 * <p><b>Admin bypass:</b> {@link com.plm.domain.security.PlmUserContext#isAdmin()} always passes.
 *
 * <p><b>Proxy rule:</b> fires only through the Spring proxy. Use
 * {@code @Lazy @Autowired} self-injection for recursive/cascade calls.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PlmAction {

    /**
     * Action code as stored in {@code action.action_code}.
     * Must be the exact DB value, e.g. {@code "CHECKOUT"}, {@code "MANAGE_METAMODEL"}.
     */
    String value();

    /**
     * SpEL expression to extract {@code nodeId} from parameters.
     * The aspect resolves nodeTypeId from the node and checks
     * {@code action_permission}. Leave empty for global, nodeType, or link variants.
     * <p>Examples: {@code "#nodeId"}, {@code "#sourceNodeId"}
     */
    String nodeIdExpr() default "";

    /**
     * SpEL expression to extract {@code nodeTypeId} from parameters.
     * Used when creating a node (no nodeId exists yet). The aspect checks permission
     * with {@code currentStateId = null}, matching global (non-state-gated) permission rows.
     * <p>Example: {@code "#nodeTypeId"}
     */
    String nodeTypeIdExpr() default "";

    /**
     * SpEL expression to extract a {@code transitionId} from parameters.
     * Used in combination with {@link #nodeIdExpr()} to scope the permission check to a
     * specific lifecycle transition, disambiguating multiple transitions that leave the
     * same state. When set, the aspect calls the transition-aware overload of
     * {@link ActionPermissionService#assertCanExecuteByCode}.
     * <p>Example: {@code "#transitionId"}
     */
    String transitionIdExpr() default "";

    /**
     * SpEL expression to extract a {@code linkId} from parameters.
     * The aspect resolves the source nodeId from {@code node_version_link} and then
     * performs a standard node-scoped permission check.
     * <p>Example: {@code "#linkId"}
     */
    String linkIdExpr() default "";
}
