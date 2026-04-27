package com.plm.platform.settings.dto;

import java.util.List;

/**
 * Payload sent by each service instance to register its settings sections
 * with the central platform-api.
 *
 * @param serviceCode service identifier ("psm-api", "pno-api", etc.)
 * @param instanceId  deterministic SHA-1(baseUrl) like SPE registration
 * @param sections    all settings sections this service exposes
 */
public record SettingsRegisterRequest(
    String serviceCode,
    String instanceId,
    List<SettingSectionDto> sections
) {}
