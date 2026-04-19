package com.plm.shared.model.numbering;

import com.plm.shared.model.Enums.VersionStrategy;

import java.util.Arrays;

/**
 * ALPHA_NUMERIC scheme: single-letter revision (A, B, ... Z, AA, AB, ...) + numeric iteration.
 *
 * Examples:
 *   ITERATE: A.1 → A.2 → A.3
 *   REVISE:  A.3 → B.1 → ... → Z.1 → AA.1
 *   NONE:    A.2 → A.2 (unchanged)
 *
 * Stateless singleton — safe to share across threads.
 */
public class AlphaNumericNumberingStrategy implements VersionNumberingStrategy {

    public static final AlphaNumericNumberingStrategy INSTANCE = new AlphaNumericNumberingStrategy();

    private AlphaNumericNumberingStrategy() {}

    @Override
    public NumberingResult compute(VersionStrategy versionStrategy,
                                   String previousRevision,
                                   int previousIteration) {
        // Normalize: iteration 0 is a display-only value from collapse history
        // (e.g. "B" instead of "B.1"). Treat as 1 for numbering purposes.
        int effIteration = Math.max(previousIteration, 1);
        return switch (versionStrategy) {
            case REVISE  -> new NumberingResult(nextRevision(previousRevision), 1);
            case ITERATE -> new NumberingResult(previousRevision, effIteration + 1);
            case NONE    -> new NumberingResult(previousRevision, effIteration);
        };
    }

    private String nextRevision(String current) {
        char[] chars = current.toCharArray();
        int i = chars.length - 1;
        while (i >= 0) {
            if (chars[i] < 'Z') { chars[i]++; return new String(chars); }
            chars[i] = 'A'; i--;
        }
        char[] next = new char[chars.length + 1];
        Arrays.fill(next, 'A');
        return new String(next);
    }
}
