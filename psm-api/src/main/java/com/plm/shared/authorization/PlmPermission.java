package com.plm.shared.authorization;

import java.lang.annotation.*;

/**
 * Declares a permission requirement on a service method.
 *
 * <p>Permission codes must match {@code permission.permission_code} in the DB
 * (e.g. {@code "MANAGE_PSM"}, {@code "READ_NODE"}).
 *
 * <p>Scope is NOT declared on the annotation — it is resolved at runtime from
 * the {@code permission} table via {@link PermissionCatalogPort}.
 * SpEL expressions on the annotation tell the enforcement aspect where to find
 * context parameters (nodeId, nodeTypeId, transitionId, linkId); the scope
 * determines which of these are actually used.
 *
 * <h2>Variants</h2>
 *
 * <p><b>Global permission (no context needed):</b>
 * <pre>
 *   {@literal @}PlmPermission("MANAGE_PSM")
 *   public String createLifecycle(...) { ... }
 * </pre>
 *
 * <p><b>Node-scoped permission (nodeId known):</b>
 * <pre>
 *   {@literal @}PlmPermission(value = "READ_NODE", nodeIdExpr = "#nodeId")
 *   public Map&lt;String, Object&gt; buildObjectDescription(String nodeId) { ... }
 * </pre>
 *
 * <p><b>Node-scoped permission (nodeTypeId known, e.g. createNode):</b>
 * <pre>
 *   {@literal @}PlmPermission(value = "UPDATE_NODE", nodeTypeIdExpr = "#nodeTypeId")
 *   public String createNode(String projectSpaceId, String nodeTypeId, ...) { ... }
 * </pre>
 *
 * <p><b>Lifecycle-scoped permission:</b>
 * <pre>
 *   {@literal @}PlmPermission(value = "TRANSITION", nodeIdExpr = "#nodeId", transitionIdExpr = "#transitionId")
 *   public String applyTransition(...) { ... }
 * </pre>
 *
 * <p><b>Link-scoped permission:</b>
 * <pre>
 *   {@literal @}PlmPermission(value = "UPDATE_NODE", linkIdExpr = "#linkId")
 *   public void deleteLink(String linkId, ...) { ... }
 * </pre>
 *
 * <p><b>Multiple permissions (AND semantics):</b>
 * <pre>
 *   {@literal @}PlmPermission({"MANAGE_PSM", "MANAGE_PSM"})
 * </pre>
 *
 * <p><b>Admin bypass:</b> {@link com.plm.shared.security.PlmUserContext#isAdmin()} always passes.
 *
 * <p><b>Proxy rule:</b> fires only through the Spring proxy.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Repeatable(PlmPermissions.class)
public @interface PlmPermission {

    /**
     * Permission code(s) as stored in {@code permission.permission_code}.
     * When multiple codes are specified, ALL must pass (AND semantics).
     */
    String[] value();

    /**
     * SpEL expression to extract {@code nodeId} from parameters.
     * Required for NODE and LIFECYCLE scopes (unless nodeTypeIdExpr is set).
     */
    String nodeIdExpr() default "";

    /**
     * SpEL expression to extract {@code nodeTypeId} from parameters.
     * Used when nodeId is not yet known (e.g. createNode).
     */
    String nodeTypeIdExpr() default "";

    /**
     * SpEL expression to extract {@code transitionId} from parameters.
     * Required for LIFECYCLE scope.
     */
    String transitionIdExpr() default "";

    /**
     * SpEL expression to extract {@code linkId} from parameters.
     * The aspect resolves the source nodeId from {@code node_version_link}.
     */
    String linkIdExpr() default "";
}
