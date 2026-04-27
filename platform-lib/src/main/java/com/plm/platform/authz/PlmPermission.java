package com.plm.platform.authz;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares a permission requirement on a service method.
 *
 * <p>Permission codes must match {@code permission.permission_code} in the DB
 * (e.g. {@code "MANAGE_PSM"}, {@code "READ_NODE"}).
 *
 * <p>Scope is resolved from the {@code permission} table at runtime via
 * {@link PermissionCatalogPort}. Each scope declares an ordered key list at
 * registration time; {@link #keyExprs()} tells the enforcement aspect where to
 * find each key in the method arguments. A {@link ScopeKeyResolver} for the
 * scope may transform the raw expression results (e.g. resolve {@code nodeId}
 * into {@code nodeType}) before enforcement.
 *
 * <p><b>Global permission (no scope keys):</b>
 * <pre>
 *   {@literal @}PlmPermission("MANAGE_PSM")
 *   public String createLifecycle(...) { ... }
 * </pre>
 *
 * <p><b>Node-scoped permission (resolver maps nodeId → nodeType):</b>
 * <pre>
 *   {@literal @}PlmPermission(value = "READ_NODE",
 *       keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
 *   public Map&lt;String, Object&gt; read(String nodeId) { ... }
 * </pre>
 *
 * <p><b>Lifecycle-scoped permission:</b>
 * <pre>
 *   {@literal @}PlmPermission(value = "TRANSITION",
 *       keyExprs = {
 *           {@literal @}KeyExpr(name = "nodeType", expr = "#nodeId"),
 *           {@literal @}KeyExpr(name = "transition", expr = "#transitionId")
 *       })
 *   public String applyTransition(String nodeId, String transitionId) { ... }
 * </pre>
 *
 * <p><b>Multiple permissions (AND semantics):</b>
 * <pre>
 *   {@literal @}PlmPermission({"READ_NODE", "SIGN"})
 * </pre>
 *
 * <p><b>Admin bypass:</b> users with admin=true always pass.
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
     * SpEL expressions producing the raw values for each scope key. Names must
     * match the keys declared by the scope at registration (or its parent,
     * when inherited).
     */
    KeyExpr[] keyExprs() default {};
}
