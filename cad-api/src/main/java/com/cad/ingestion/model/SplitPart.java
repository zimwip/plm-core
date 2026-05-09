package com.cad.ingestion.model;

import java.util.Map;

public record SplitPart(
        String cadId,
        String name,
        String cadType,
        Map<String, String> attributes,
        String parentCadId,
        byte[] fileBytes
) {}
