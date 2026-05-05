package com.plm.platform.action;

import java.lang.annotation.*;

/**
 * Marks a service method as an authorized action.
 * The action code must match {@code action.action_code} in the DB exactly.
 *
 * PlmActionAspect (@Order 2) intercepts and:
 *   1. Resolves node/link context from the scope's declared segments
 *      (segment names must match method parameter names exactly).
 *   2. Checks required permissions from action_required_permission.
 *   3. Evaluates action guards via ActionGuardPort.
 *
 * Scope-to-parameter convention:
 *   NODE       → param "nodeId"
 *   LIFECYCLE  → params "nodeId" + "transitionId"
 *   NODE_TYPE  → param "nodeTypeId"
 *   LINK       → param "linkId"
 *   TX / GLOBAL → no node param required
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PlmAction {

    /** Action code matching action.action_code (e.g. "checkout", "transition"). */
    String value();
}
