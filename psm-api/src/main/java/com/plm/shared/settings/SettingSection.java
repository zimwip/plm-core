package com.plm.shared.settings;

/**
 * A pluggable settings section. Each module declares its own sections as Spring beans.
 * The SettingsController collects all beans and exposes them filtered by user permissions.
 */
public interface SettingSection {
    String key();
    String label();
    SettingGroup group();
    int order();
    /** Permission code required to see this section, or null if open to all. */
    String permission();
}
