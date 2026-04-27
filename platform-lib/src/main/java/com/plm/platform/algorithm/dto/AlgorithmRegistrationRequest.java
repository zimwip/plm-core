package com.plm.platform.algorithm.dto;

import java.util.List;

/**
 * Catalog snapshot pushed by a runtime service (e.g. psm-api) to psm-admin
 * at startup so the admin DB always reflects the @AlgorithmBean classes
 * actually present in the JVM. Replaces the static V2 seed.
 */
public record AlgorithmRegistrationRequest(
    List<TypeDef> types,
    List<AlgoDef> algorithms
) {
    public record TypeDef(
        String id,
        String name,
        String description,
        String javaInterface
    ) {}

    public record AlgoDef(
        String id,
        String code,
        String name,
        String description,
        String typeId,
        String handlerRef,
        String module,
        String domain,
        List<ParamDef> parameters
    ) {}

    public record ParamDef(
        String paramName,
        String paramLabel,
        String dataType,
        boolean required,
        String defaultValue,
        int displayOrder
    ) {}
}
