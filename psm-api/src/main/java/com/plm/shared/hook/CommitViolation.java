package com.plm.shared.hook;

/**
 * Structured validation error raised by a PreCommitValidator.
 *
 * <p>Identifier policy mirrors {@code ValidationService.Violation}: the attribute
 * <em>code</em> ({@code attrCode}, slug) is the canonical identifier; the
 * <em>label</em> ({@code attrLabel}) is for human display only.
 *
 * @param attrCode  attribute code (slug, e.g. {@code ad-ssi-zone}); may be null
 * @param attrLabel attribute label for display (e.g. {@code "Install Zone"}); may be null
 */
public record CommitViolation(
    String nodeId,
    String versionId,
    String attrCode,
    String attrLabel,
    String message
) {
    public CommitViolation(String nodeId, String versionId, String message) {
        this(nodeId, versionId, null, null, message);
    }

    public CommitViolation(String nodeId, String versionId, String attrCode, String message) {
        this(nodeId, versionId, attrCode, null, message);
    }

    @Override
    public String toString() {
        return message;
    }
}
