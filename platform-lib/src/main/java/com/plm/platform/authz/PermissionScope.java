package com.plm.platform.authz;

/**
 * Platform-supplied scope codes.
 *
 * <p>Kept as an enum for the three scopes that ship with the platform
 * (GLOBAL / NODE / LIFECYCLE). The authorization registry itself stores scope
 * codes as arbitrary strings; callers that need to compare to a platform scope
 * can use {@link #name()} or the static string constants below.
 */
public enum PermissionScope {
    GLOBAL,
    NODE,
    LIFECYCLE;

    /** String form of {@link #GLOBAL} — convenient for switch(String). */
    public static final String GLOBAL_CODE    = "GLOBAL";
    public static final String NODE_CODE      = "NODE";
    public static final String LIFECYCLE_CODE = "LIFECYCLE";
}
