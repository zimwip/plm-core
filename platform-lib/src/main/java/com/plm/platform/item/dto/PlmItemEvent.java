package com.plm.platform.item.dto;

import java.util.Map;

/**
 * Generic item event carrying the full identity context needed by consumers
 * (e.g. pno-api basket auto-add, search indexing). Published alongside the
 * service-specific event (e.g. NODE_CREATED) so consumers don't need to know
 * service internals.
 *
 * @param source          owner service: {@code psm}, {@code dst}, …
 * @param typeCode        item type within the service (maps to {@link ItemDescriptor#itemKey()})
 * @param itemId          stable item identifier
 * @param userId          actor who triggered the event
 * @param projectSpaceId  project space the item belongs to; empty string for user-global items
 * @param eventType       lifecycle stage of the event
 * @param at              ISO-8601 timestamp
 * @param payload         service-specific data for consumers that need it (e.g. search indexing).
 *                        Keys and structure are defined per source service.
 *                        Empty map when not provided — never null.
 */
public record PlmItemEvent(
    String source,
    String typeCode,
    String itemId,
    String userId,
    String projectSpaceId,
    ItemEventType eventType,
    String at,
    Map<String, Object> payload
) {
    public PlmItemEvent {
        if (payload == null) payload = Map.of();
    }
}
