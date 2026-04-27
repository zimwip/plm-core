package com.plm.platform.api.api;

import java.util.List;

/**
 * A group of settings sections returned to the frontend.
 */
public record SettingsGroupDto(
    String groupKey,
    String groupLabel,
    List<SettingsSectionResponse> sections
) {}
