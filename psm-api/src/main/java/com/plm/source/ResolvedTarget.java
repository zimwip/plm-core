package com.plm.source;

import java.util.Map;

/**
 * Outcome of {@link SourceResolver#resolve}.
 *
 * @param displayId  user-facing identifier shown in lists (e.g. logical_id, file basename)
 * @param type       the resolved type (echoes the input — useful for resolvers that auto-route)
 * @param pinnedKey  the canonical key once resolved at this point in time. For V2M links
 *                   the resolver returns the @{@code N}-suffixed form (e.g. "PART-A@3");
 *                   {@code null} means the target was already pinned and no rewrite is needed.
 * @param details    extra fields the controller can surface to the frontend (state, fingerprint, ...)
 */
public record ResolvedTarget(
    String displayId,
    String type,
    String pinnedKey,
    Map<String, Object> details
) {}
