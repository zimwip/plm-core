package com.plm.platform.action;

import com.plm.platform.action.guard.ActionGuardContext;
import com.plm.platform.action.guard.ActionGuardPort;
import com.plm.platform.action.guard.GuardViolationException;
import com.plm.platform.auth.PlmPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Generic Spring MVC handler target for auto-registered action routes.
 *
 * Routes are registered programmatically by {@link ActionHandlerRouteRegistrar}.
 * All registered routes share the single {@link #dispatch} method, which looks up
 * the correct {@link ActionHandler} by matching the Spring-resolved path pattern.
 */
public class ActionHandlerRouteController {

    private final ConcurrentHashMap<String, ActionHandler> handlersByKey = new ConcurrentHashMap<>();
    private final ActionGuardPort guardPort;
    private final ActionDispatcher actionDispatcher;

    ActionHandlerRouteController(ActionGuardPort guardPort, ActionDispatcher actionDispatcher) {
        this.guardPort = guardPort;
        this.actionDispatcher = actionDispatcher;
    }

    void bind(String routeKey, ActionHandler handler) {
        handlersByKey.put(routeKey, handler);
    }

    @SuppressWarnings("unchecked")
    public ResponseEntity<?> dispatch(HttpServletRequest req) throws Exception {
        String pattern = (String) req.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        ActionHandler handler = handlersByKey.get(req.getMethod() + ":" + pattern);
        if (handler == null) {
            return ResponseEntity.notFound().build();
        }

        PlmPrincipal principal = (PlmPrincipal) req.getAttribute("plm.principal");
        Map<String, String> pathVars =
            (Map<String, String>) req.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (pathVars == null) pathVars = Map.of();

        String txIdHeader = req.getHeader("X-PLM-Tx");
        ActionContext ctx = new ActionContext(
            pathVars.getOrDefault("id", null),
            null, null,
            handler.actionCode(),
            null,
            principal != null ? principal.userId() : null,
            (txIdHeader != null && !txIdHeader.isBlank()) ? txIdHeader : null,
            pathVars
        );

        if (guardPort != null) {
            boolean isAdmin = principal != null && principal.isAdmin();
            ActionGuardContext guardCtx = new ActionGuardContext(
                pathVars.getOrDefault("id", null),
                null, null,
                handler.actionCode(),
                null,
                false, false,
                principal != null ? principal.userId() : null,
                Map.of(), pathVars
            );
            try {
                guardPort.assertGuards(handler.actionCode(), null, null, null, isAdmin, guardCtx);
            } catch (GuardViolationException e) {
                return ResponseEntity.status(e.getHttpStatus())
                    .body(Map.of("error", "guard_violation", "violations", e.getViolations()));
            }
        }

        if (actionDispatcher != null) {
            ResponseEntity<?>[] holder = new ResponseEntity<?>[1];
            ActionWrapper.Chain chain = actionDispatcher.wrapForHttp(
                handler.actionCode(),
                (c, p) -> { holder[0] = handler.executeHttp(c, p, req); return ActionResult.ok(Map.of()); }
            );
            chain.proceed(ctx, Map.of());
            return holder[0] != null ? holder[0] : ResponseEntity.internalServerError().build();
        }
        return handler.executeHttp(ctx, Map.of(), req);
    }
}
