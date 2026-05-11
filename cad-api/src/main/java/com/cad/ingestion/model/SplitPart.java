package com.cad.ingestion.model;

import com.cad.algorithm.CadOccurrence;
import java.util.List;
import java.util.Map;

public record SplitPart(
        String cadId,
        String name,
        String cadType,
        Map<String, String> attributes,
        List<CadOccurrence> occurrences,
        byte[] fileBytes
) {
    public boolean hasOccurrences() {
        return occurrences != null && !occurrences.isEmpty();
    }
}
