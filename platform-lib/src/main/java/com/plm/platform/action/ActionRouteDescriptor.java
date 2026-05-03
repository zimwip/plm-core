package com.plm.platform.action;

/**
 * Declares the HTTP entry point for an action handler.
 * Used by discovery endpoints to return callable URLs to the frontend.
 *
 * @param httpMethod   HTTP verb — GET, POST, DELETE, PUT, PATCH
 * @param pathTemplate gateway-relative path with {key} placeholders
 * @param bodyShape    RAW, WRAPPED, MULTIPART, or NONE
 * @param autoRegister true  → Spring MVC route is registered automatically at startup
 *                     false → metadata-only (catalog/descriptor enrichment); no MVC route added.
 *                     Use false when the service already has a dedicated controller for the path
 *                     (e.g. PSM's ActionController handles its own dispatch).
 */
public record ActionRouteDescriptor(
    String httpMethod,
    String pathTemplate,
    String bodyShape,
    boolean autoRegister
) {
    public static ActionRouteDescriptor get(String pathTemplate) {
        return new ActionRouteDescriptor("GET", pathTemplate, "NONE", true);
    }

    public static ActionRouteDescriptor post(String pathTemplate) {
        return new ActionRouteDescriptor("POST", pathTemplate, "WRAPPED", true);
    }

    public static ActionRouteDescriptor postMultipart(String pathTemplate) {
        return new ActionRouteDescriptor("POST", pathTemplate, "MULTIPART", true);
    }

    public static ActionRouteDescriptor delete(String pathTemplate) {
        return new ActionRouteDescriptor("DELETE", pathTemplate, "NONE", true);
    }

    /** Metadata-only variant — no auto-registration of Spring MVC route. */
    public ActionRouteDescriptor metadataOnly() {
        return new ActionRouteDescriptor(httpMethod, pathTemplate, bodyShape, false);
    }
}
