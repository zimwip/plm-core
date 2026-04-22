package com.plm.platform.spe.dto;

/**
 * Lightweight view of one service instance, pushed from spe-api to clients.
 * Deliberately a subset of spe-api's ServiceRegistration — no heartbeat internals.
 */
public record ServiceInstanceInfo(
    String instanceId,
    String serviceCode,
    String baseUrl,
    String version,
    String spaceTag,
    boolean healthy
) {}
