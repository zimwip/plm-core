package com.plm.platform.resource.dto;

/**
 * One resource a service exposes to the federated catalog.
 *
 * <p>Phase 2 only populates {@code createAction}; {@code listEndpoint} and
 * {@code actions} arrive in subsequent phases (kept in the DTO from day one
 * so the wire format stays stable across rollouts).
 *
 * @param serviceCode  owner service ({@code psm}, {@code dst}, ...)
 * @param resourceCode namespace within the service ({@code node}, {@code data-object})
 * @param resourceKey  optional sub-key — e.g. nodeType id for psm. Lets one
 *                     contribution emit many concrete descriptors that share
 *                     a service+resource pair (Document/Part/Assembly).
 * @param displayName  user-facing label
 * @param description  optional long form
 * @param icon         lucide / app-defined icon hint
 * @param color        accent color
 * @param groupKey     UI grouping ({@code PLM}, {@code DATA}, ...)
 * @param createAction null when the resource is read-only
 */
public record ResourceDescriptor(
    String serviceCode,
    String resourceCode,
    String resourceKey,
    String displayName,
    String description,
    String icon,
    String color,
    String groupKey,
    ResourceCreateAction createAction
) {}
