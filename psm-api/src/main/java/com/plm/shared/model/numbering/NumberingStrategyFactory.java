package com.plm.shared.model.numbering;

import com.plm.shared.model.Enums.NumberingScheme;

/**
 * Static factory mapping a NumberingScheme identifier to its strategy implementation.
 *
 * To add a new scheme:
 *   1. Add its constant to Enums.NumberingScheme
 *   2. Implement VersionNumberingStrategy
 *   3. Add a case here
 */
public final class NumberingStrategyFactory {

    private NumberingStrategyFactory() {}

    public static VersionNumberingStrategy forScheme(NumberingScheme scheme) {
        if (scheme == null) return AlphaNumericNumberingStrategy.INSTANCE;
        return switch (scheme) {
            case ALPHA_NUMERIC -> AlphaNumericNumberingStrategy.INSTANCE;
        };
    }

    /**
     * Convenience overload for raw strings coming from the DB.
     * Null-safe; unknown values degrade gracefully to ALPHA_NUMERIC.
     */
    public static VersionNumberingStrategy forSchemeString(String raw) {
        if (raw == null || raw.isBlank()) return AlphaNumericNumberingStrategy.INSTANCE;
        try {
            return forScheme(NumberingScheme.valueOf(raw));
        } catch (IllegalArgumentException e) {
            return AlphaNumericNumberingStrategy.INSTANCE;
        }
    }
}
