package com.plm.source;

import com.plm.platform.algorithm.AlgorithmType;
import com.plm.platform.action.guard.GuardViolation;

import java.util.List;

/**
 * Resolves a link's {@code (type, key)} pair against the system declared by a Source.
 *
 * Each Source in psm-admin is bound to one resolver instance. The SELF source
 * uses a built-in resolver backed by NodeService/VersionService; custom sources
 * (file system, git, external PLM, ...) plug in by implementing this interface
 * and registering an {@code algorithm_instance} of type {@code algtype-source-resolver}.
 *
 * Implementations are discovered as {@link com.plm.platform.algorithm.AlgorithmBean} beans.
 */
@AlgorithmType(
    id = "algtype-source-resolver",
    name = "Source Resolver",
    description = "Resolves a (type, key) pair to a target object hosted in a Source")
public interface SourceResolver {

    /** Algorithm code, must match the {@code algorithm.code} row backing this resolver. */
    String code();

    /**
     * Object types this resolver knows how to handle. The SELF resolver returns
     * all node-type IDs; a file resolver might return {@code List.of("filetype")}.
     */
    List<String> supportedTypes();

    /**
     * Look up the target referenced by {@code (ctx.type, ctx.key)}.
     *
     * For SELF nodes:
     * <ul>
     *   <li>{@code key = "PART-A"} — V2M, returns the master node, {@code pinnedKey == null}</li>
     *   <li>{@code key = "PART-A@3"} — V2V, returns version 3, {@code pinnedKey == "PART-A@3"}</li>
     * </ul>
     */
    ResolvedTarget resolve(SourceResolverContext ctx);

    /**
     * Validate the target against link-type constraints. Used during link
     * creation/update to reject invalid pairings (wrong node type, cycles, ...).
     * Returns the violation list — empty list means valid.
     */
    List<GuardViolation> validate(SourceResolverContext ctx, LinkConstraint constraint);

    /**
     * Whether the underlying Source carries a version axis on its objects. The
     * SELF resolver returns {@code true} (PSM nodes have version_number); resolvers
     * fronting immutable stores (dst data files, blobs, foreign URLs) return the
     * default {@code false}. Used as a runtime sanity check against
     * {@code source.is_versioned} and to gate which {@code linkPolicy} values are
     * permitted on link types pointing at this source.
     */
    default boolean isVersioned() {
        return false;
    }

    /**
     * Suggest matching keys for a (type, query) pair — feeds the frontend
     * key picker. Default implementation returns empty (free-text input only).
     */
    default List<KeyHint> suggestKeys(String type, String query, int limit) {
        return List.of();
    }

    /**
     * Reverse lookup: which incoming links reference this {@code (type, key)} pair?
     * Used by the cross-source Where-Used view. Default implementation returns
     * empty — sources without a reverse index don't contribute parents.
     */
    default List<Reference> findReferencesTo(String type, String key) {
        return List.of();
    }

    /**
     * Called after a link pointing at this source is created (or a duplicate upload
     * is confirmed). Implementations may increment a reference counter or register
     * a back-reference. Default is a no-op.
     */
    default void attach(SourceResolverContext ctx) {}

    /**
     * Called after a link pointing at this source is deleted, or before its target
     * is replaced. Implementations may decrement a reference counter or clean up
     * back-references. Default is a no-op.
     */
    default void detach(SourceResolverContext ctx) {}
}
