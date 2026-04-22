package com.plm.shared.action;

/**
 * Describes one expected path-segment ID for an action scope.
 *
 * @param name        logical name (e.g. "nodeId", "transitionId")
 * @param description human-readable purpose
 * @param required    whether the segment must be present
 */
public record ScopeSegment(String name, String description, boolean required) {}
