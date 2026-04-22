package com.plm.platform.spe.dto;

import java.util.List;

/**
 * Payload POSTed by a service instance to spe-api /api/spe/registry to
 * announce itself. Consumed server-side by the spe-api RegistryController
 * and built client-side by SpeRegistrationClient — single source of truth
 * for the wire shape.
 */
public record RegisterRequest(
    String serviceCode,
    String baseUrl,
    String healthUrl,
    String routePrefix,
    List<String> extraPaths,
    String version,
    String spaceTag
) {}
