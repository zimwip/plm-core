package com.plm.platform.api.registry;

import com.plm.platform.settings.dto.SettingSectionDto;

import java.time.Instant;
import java.util.List;

/**
 * Stores the settings sections registered by a single service instance.
 *
 * @param serviceCode service identifier ("psm-api", "pno-api", etc.)
 * @param instanceId  deterministic SHA-1(baseUrl) like SPE registration
 * @param sections    all settings sections this service exposes
 * @param registeredAt timestamp of last registration
 */
public record ServiceSettingsRegistration(
    String serviceCode,
    String instanceId,
    List<SettingSectionDto> sections,
    Instant registeredAt
) {}
