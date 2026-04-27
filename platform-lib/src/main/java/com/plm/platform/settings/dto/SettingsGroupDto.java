package com.plm.platform.settings.dto;

import java.util.List;

/**
 * A settings group with its resolved sections, as returned to the frontend.
 *
 * @param groupKey   group identifier ("PLATFORM")
 * @param groupLabel human-readable label ("Platform")
 * @param sections   ordered sections within this group
 */
public record SettingsGroupDto(
    String groupKey,
    String groupLabel,
    List<SettingsSectionEntryDto> sections
) {}
