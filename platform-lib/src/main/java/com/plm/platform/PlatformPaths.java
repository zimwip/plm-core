package com.plm.platform;

/**
 * Helpers for building service URLs.
 *
 * <p>Since the gateway-strip routing change, backends serve at ROOT — the
 * spe-api gateway strips {@code /api/<serviceCode>} before forwarding, and
 * direct service-to-service calls (which bypass the gateway) target bare
 * paths. So an internal endpoint is reached at {@code /internal/...}, not
 * {@code /api/<code>/internal/...}.
 */
public final class PlatformPaths {

    private PlatformPaths() {}

    /**
     * External, gateway-facing root of a service: {@code /api/<serviceCode>}.
     * Used for route prefixes and browser-facing URLs, NOT for direct S2S calls.
     */
    public static String contextPath(String serviceCode) {
        return "/api/" + serviceCode;
    }

    /**
     * Returns the bare internal path {@code /internal<path>} ({@code path} must
     * start with {@code /}). The {@code serviceCode} is kept in the signature
     * for call-site clarity and forward compatibility, but is no longer part of
     * the URL — the target is selected by the registry-aware client, and the
     * backend serves internal endpoints at root.
     */
    public static String internalPath(String serviceCode, String path) {
        return "/internal" + path;
    }
}
