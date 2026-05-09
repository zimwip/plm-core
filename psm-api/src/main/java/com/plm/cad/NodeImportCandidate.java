package com.plm.cad;

import java.util.Map;

public record NodeImportCandidate(
    String cadId,
    String name,
    String cadType,
    Map<String, String> attributes,
    String importContextCode
) {}
