package com.plm.platform.settings.dto;

/**
 * A settings section entry as returned to the frontend after permission filtering.
 *
 * @param key      section unique identifier
 * @param label    display name
 * @param canWrite whether the current user has write access
 */
public record SettingsSectionEntryDto(
    String key,
    String label,
    boolean canWrite
) {}
