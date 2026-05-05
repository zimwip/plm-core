package com.plm.platform.settings.dto;

/**
 * Describes a single settings section that a service exposes.
 * Declared as {@code @Bean} in each service, collected by
 * {@link com.plm.platform.settings.SettingsRegistrationClient} for batch registration.
 *
 * @param key        unique identifier ("node-types", "algorithms")
 * @param label      display name ("Node Types", "Algorithms")
 * @param group      group key ("GENERAL", "PNO", "PLATFORM", "APPLICATION", "HELP")
 * @param order      sort order within group
 * @param permission required permission code, or null for unrestricted
 * @param icon       lucide icon name ("layers", "shield", …), or null for default
 */
public record SettingSectionDto(
    String key,
    String label,
    String group,
    int order,
    String permission,
    String icon
) {}
