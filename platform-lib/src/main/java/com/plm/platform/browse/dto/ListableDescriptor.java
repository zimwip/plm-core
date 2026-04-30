package com.plm.platform.browse.dto;

/**
 * One browsable resource exposed by a service to the federated navigation tree.
 *
 * <p>Mirror of {@link com.plm.platform.resource.dto.ResourceDescriptor} for the
 * read/list axis. {@code resourceKey} sub-divides a {@code resourceCode} (e.g.
 * one descriptor per psm node type); a service with no sub-types leaves it null.
 *
 * @param serviceCode  owner service ({@code psm}, {@code dst}, ...)
 * @param resourceCode namespace within the service ({@code node}, {@code data-object})
 * @param resourceKey  optional sub-key (psm: nodeTypeId; dst: null)
 * @param displayName  user-facing label
 * @param description  optional long form
 * @param icon         lucide / app-defined icon hint
 * @param color        accent color
 * @param groupKey     UI grouping ({@code PLM}, {@code DATA}, ...)
 * @param listAction   how to list items for this descriptor
 */
public record ListableDescriptor(
    String serviceCode,
    String resourceCode,
    String resourceKey,
    String displayName,
    String description,
    String icon,
    String color,
    String groupKey,
    ListAction listAction
) {}
