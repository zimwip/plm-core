package com.cad.ingestion.model;

import com.cad.algorithm.CadOccurrence;
import java.util.List;
import java.util.Map;

/**
 * Metadata for one split part. Carries no file bytes — the part STEP lives on the
 * cad-parser disk (15-min TTL) and is fetched lazily via
 * {@code CadParserClient.downloadPartStep(splitJobId, partIndex)} right before upload,
 * so the importer never holds every part in heap at once.
 */
public record SplitPart(
        String cadId,
        String name,
        String cadType,
        Map<String, String> attributes,
        List<CadOccurrence> occurrences,
        String splitJobId,
        int partIndex
) {
    public boolean hasOccurrences() {
        return occurrences != null && !occurrences.isEmpty();
    }
}
