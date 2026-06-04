package com.plm.shared.model;

/**
 * Fully resolved attribute definition, including inheritance metadata.
 * Built from config snapshots provided by psm-admin, walking the
 * parent_node_type_id chain.
 *
 * <p><b>Validation is no longer carried here.</b> {@code required} and naming-regex
 * moved to pluggable {@code AttributeValidator} rules (see {@code AttributeValidatorService}).
 * {@code allowedValues} is the resolved ENUM value list (JSON), reconstructed from the
 * enum tables — kept for rendering and intrinsic ENUM membership checks.
 *
 * @param inherited        true when this attribute is defined in an ancestor type
 * @param inheritedFrom    display name of the ancestor type that defines it, or null if own
 * @param ownerNodeTypeId  the node_type_id of the type that actually defines this attribute_definition row (null for domain attrs)
 * @param sourceDomainId   non-null when this attribute comes from a domain assignment
 * @param sourceDomainName display name of the source domain, or null for node_type attrs
 */
public record ResolvedAttribute(
    String id,
    String name,
    String label,
    String dataType,
    String widgetType,
    String defaultValue,
    String allowedValues,
    String enumDefinitionId,
    int displayOrder,
    String displaySection,
    String tooltip,
    boolean asName,
    boolean inherited,
    String inheritedFrom,
    String ownerNodeTypeId,
    String sourceDomainId,
    String sourceDomainName
) {}
