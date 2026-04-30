package com.plm.platform.resource.dto;

/**
 * One input field on a resource action (create form for now; generic action
 * parameters come in Phase 4).
 *
 * <p>Field shape mirrors {@link com.plm.platform.config.dto.ActionParameterConfig}
 * so the frontend can render uniformly. Widget types: {@code TEXT},
 * {@code TEXTAREA}, {@code DROPDOWN}, {@code NUMBER}, {@code FILE}.
 *
 * <p>{@code displaySection} groups fields under a header in the form (matches
 * the per-attribute {@code display_section} in the metamodel). Null = default
 * group. Identifier fields (logical / external id) typically use a leading
 * "Identity" section so they render before attribute groups.
 */
public record ResourceParameter(
    String name,
    String label,
    String dataType,
    boolean required,
    String defaultValue,
    String allowedValues,
    String widgetType,
    String validationRegex,
    String tooltip,
    int displayOrder,
    String displaySection
) {}
