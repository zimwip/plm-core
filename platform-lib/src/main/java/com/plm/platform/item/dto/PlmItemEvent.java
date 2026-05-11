package com.plm.platform.item.dto;

/**
 * Generic item event carrying the full identity context needed by consumers
 * (e.g. pno-api basket auto-add). Published alongside the service-specific
 * event (e.g. NODE_CREATED) so consumers don't need to know psm internals.
 *
 * @param source          owner service: {@code psm}, {@code dst}, …
 * @param typeCode        item type within the service (maps to {@link ItemDescriptor#itemKey()})
 * @param itemId          stable item identifier
 * @param userId          actor who triggered the event
 * @param projectSpaceId  project space the item belongs to; empty string for user-global items
 * @param eventType       lifecycle stage of the event
 * @param at              ISO-8601 timestamp
 */
public record PlmItemEvent(
    String source,
    String typeCode,
    String itemId,
    String userId,
    String projectSpaceId,
    ItemEventType eventType,
    String at
) {}
