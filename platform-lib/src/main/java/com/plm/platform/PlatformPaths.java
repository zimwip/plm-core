package com.plm.platform;

/**
 * Helpers for building URLs that follow the {@code /api/<serviceCode>/...}
 * routing convention enforced by {@code SpeContextPathPostProcessor}.
 *
 * Callers that need to hit an internal endpoint on another service should go
 * through here instead of hardcoding the context path — one place to change
 * if a service ever renames.
 */
public final class PlatformPaths {

    private PlatformPaths() {}

    /**
     * Returns {@code /api/<serviceCode>} — the root of a service's HTTP
     * namespace behind the SPE gateway.
     */
    public static String contextPath(String serviceCode) {
        return "/api/" + serviceCode;
    }

    /**
     * Returns {@code /api/<serviceCode>/internal<path>}. {@code path} must
     * start with {@code /}.
     */
    public static String internalPath(String serviceCode, String path) {
        return contextPath(serviceCode) + "/internal" + path;
    }
}
