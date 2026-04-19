package com.plm.domain.model.numbering;

/**
 * Immutable result of a numbering computation — the business identity of a version.
 */
public record NumberingResult(String revision, int iteration) {

    public NumberingResult {
        if (revision == null || revision.isBlank())
            throw new IllegalArgumentException("revision must not be blank");
        if (iteration < 0)
            throw new IllegalArgumentException("iteration must be >= 0");
    }
}
