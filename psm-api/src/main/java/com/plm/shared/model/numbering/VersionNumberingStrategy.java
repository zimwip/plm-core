package com.plm.shared.model.numbering;

import com.plm.shared.model.Enums.VersionStrategy;

/**
 * Pure domain interface for pluggable version numbering schemes.
 *
 * Implementations receive the VersionStrategy (NONE/ITERATE/REVISE) and the previous
 * revision/iteration, and return the computed business identity for the new version.
 *
 * No Spring annotations — plain POJO. Implementations should be stateless singletons.
 */
public interface VersionNumberingStrategy {

    /**
     * Compute the new revision and iteration for a version being created.
     *
     * @param versionStrategy  NONE | ITERATE | REVISE — what kind of change this is
     * @param previousRevision the revision of the previous version (e.g. "A", "B", "AA")
     * @param previousIteration the iteration of the previous version (>= 1)
     * @return the new revision + iteration tuple
     */
    NumberingResult compute(VersionStrategy versionStrategy,
                            String previousRevision,
                            int previousIteration);
}
