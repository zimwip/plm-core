package com.plm.platform.browse.dto;

import java.util.List;

/**
 * Describes how the federated frontend should list objects exposed by a
 * {@link com.plm.platform.browse.ListableContribution} bean.
 *
 * <p>The frontend calls {@code path} via the spe-api gateway with the supplied
 * paging parameter names; the source service answers in its own JSON shape and
 * {@link #itemShape} tells the navigation tree which fields to read.
 *
 * @param httpMethod   "GET" today; reserved for future verbs
 * @param path         gateway-relative path (e.g. {@code /api/psm/nodes?type=Document})
 * @param pageParam    query parameter name carrying the 0-based page index ({@code page})
 * @param sizeParam    query parameter name carrying the page size ({@code size})
 * @param queryParams  optional extra query parameters appended verbatim ({@code type=...})
 * @param itemShape    field-name hints for the rendered tree
 */
public record ListAction(
    String httpMethod,
    String path,
    String pageParam,
    String sizeParam,
    List<String> queryParams,
    ListItemShape itemShape
) {}
