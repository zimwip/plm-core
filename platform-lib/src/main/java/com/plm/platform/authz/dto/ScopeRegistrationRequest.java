package com.plm.platform.authz.dto;

import java.util.List;

/**
 * Batch payload posted by a service instance to {@code POST /api/pno/internal/scopes/register}.
 *
 * @param serviceCode caller identity ({@code psa}, {@code psm}, …)
 * @param instanceId  deterministic SHA-1(baseUrl) — same scheme as SPE/Settings registration
 * @param scopes      every scope this service contributes
 */
public record ScopeRegistrationRequest(
    String serviceCode,
    String instanceId,
    List<ScopeRegistration> scopes
) {}
