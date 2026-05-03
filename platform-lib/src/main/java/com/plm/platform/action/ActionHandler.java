package com.plm.platform.action;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;

/**
 * Contract for all action handlers — built-in and custom.
 *
 * PSM extends this interface with {@code @AlgorithmType} for psm-admin registration.
 * Simple services (DST, etc.) implement this directly as plain Spring beans.
 */
public interface ActionHandler {

    /** Stable action code this handler serves (e.g. "SIGN", "CHECKOUT", "DOWNLOAD"). */
    String actionCode();

    /**
     * Execute the action.
     *
     * @param context  resolved execution context
     * @param params   validated user-supplied parameters
     * @return         result payload included in the HTTP response
     */
    ActionResult execute(ActionContext context, Map<String, String> params);

    /**
     * Declares the HTTP entry point this action is exposed at.
     * Used by discovery endpoints to return callable URLs.
     * Returns empty if the action has no dedicated HTTP binding.
     */
    default Optional<ActionRouteDescriptor> route() {
        return Optional.empty();
    }

    /**
     * Handles the HTTP request for this action's declared route.
     * Auto-registered by {@code ActionHandlerRouteAutoConfiguration} when {@link #route()} is present.
     *
     * <p>Default: calls {@link #execute} and wraps the result in {@code 200 OK}.
     * Override to return binary responses, custom status codes, or streaming bodies.
     */
    default ResponseEntity<?> executeHttp(ActionContext ctx, Map<String, String> params, HttpServletRequest req) {
        return ResponseEntity.ok(execute(ctx, params));
    }

    /**
     * Returns optional display hints for the UI (color, icon, label override, etc.).
     * Default: empty map (no overrides).
     */
    default Map<String, Object> resolveDisplayHints(String nodeId, String nodeTypeId, String transitionId) {
        return Map.of();
    }

    /**
     * Returns dynamic allowed-values overrides for the action's parameters.
     * Default: empty map (no dynamic values).
     */
    default Map<String, String> resolveDynamicAllowedValues(String nodeId, String nodeTypeId, String transitionId) {
        return Map.of();
    }
}
