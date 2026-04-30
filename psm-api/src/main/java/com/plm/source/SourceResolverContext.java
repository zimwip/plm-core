package com.plm.source;

/**
 * Input to {@link SourceResolver#resolve} and {@link SourceResolver#validate}.
 *
 * @param linkTypeId      link_type that owns this resolution (carries policy + cardinality)
 * @param type            target type within the source (e.g. node-type id, "filetype")
 * @param key             target key within the source (e.g. "PART-A", "PART-A@3", "/path/to/file")
 * @param sourceVersionId version row owning the link on the PLM side (the "from" version)
 * @param sourceNodeId    node id owning the link on the PLM side
 */
public record SourceResolverContext(
    String linkTypeId,
    String type,
    String key,
    String sourceVersionId,
    String sourceNodeId
) {}
