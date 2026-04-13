package com.plm.domain.hook;

/**
 * Structured validation error raised by a PreCommitValidator.
 * Replaces the plain List<String> used previously.
 */
public record CommitViolation(
    String nodeId,
    String versionId,
    String field,
    String message
) {
    /** Convenience constructor when field context is not available. */
    public CommitViolation(String nodeId, String versionId, String message) {
        this(nodeId, versionId, null, message);
    }

    @Override
    public String toString() {
        String prefix = "[" + nodeId + (field != null ? "." + field : "") + "] ";
        return prefix + message;
    }
}
