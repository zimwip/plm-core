package com.plm.platform.api.api;

/**
 * A single settings section as returned to the frontend.
 */
public record SettingsSectionResponse(
    String key,
    String label,
    boolean canWrite,
    String serviceCode,
    String icon
) {}
