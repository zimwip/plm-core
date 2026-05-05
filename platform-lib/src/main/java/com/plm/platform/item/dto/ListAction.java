package com.plm.platform.item.dto;

import java.util.List;

/**
 * Describes how the federated frontend should list items for an
 * {@link ItemDescriptor}. Null on the descriptor when the item type
 * cannot be listed (e.g. action-only resources) or the caller is not
 * permitted to read.
 *
 * <p>The frontend calls {@code path} via the spe-api gateway with the supplied
 * paging parameter names; the source service answers in its own JSON shape and
 * {@link #itemShape} tells the navigation tree which fields to read.
 *
 * @param httpMethod       "GET" today; reserved for future verbs
 * @param path             gateway-relative path (e.g. {@code /nodes?type=Document})
 * @param pageParam        query parameter name carrying the 0-based page index ({@code page})
 * @param sizeParam        query parameter name carrying the page size ({@code size})
 * @param queryParams      optional extra query parameters appended verbatim ({@code type=...})
 * @param itemShape        field-name hints for the rendered tree
 * @param name             human-readable action name (aligned with PSM action schema)
 * @param description      human-readable description of what this action does
 * @param displayCategory  UI hint: {@code "PRIMARY"}, {@code "SECONDARY"}, or {@code "DANGEROUS"}
 * @param displayOrder     ordering hint within a category (lower = first)
 */
public record ListAction(
    String httpMethod,
    String path,
    String pageParam,
    String sizeParam,
    List<String> queryParams,
    ListItemShape itemShape,
    String name,
    String description,
    String displayCategory,
    int displayOrder
) {}
