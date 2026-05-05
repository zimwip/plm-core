package com.plm.platform.item.dto;

import java.util.List;

/**
 * Describes how to create one item. Lives on
 * {@link ItemDescriptor#create()}; null when the item is read-only or the
 * caller is not permitted to create.
 *
 * <p>The path is gateway-relative: the frontend prepends
 * {@code /api/<descriptor.serviceCode>} to build the final URL.
 *
 * @param httpMethod       "POST" today; reserved for future verbs
 * @param path             gateway-relative path (e.g. {@code /actions/create_node/Document})
 * @param contentType      "application/json" or "multipart/form-data"
 * @param bodyShape        how the frontend should serialize the form values:
 *                         <ul>
 *                           <li>{@code RAW}        — `{...params}` as JSON</li>
 *                           <li>{@code WRAPPED}    — `{ parameters: {...params} }` (psm action convention)</li>
 *                           <li>{@code MULTIPART}  — multipart/form-data with one part per param</li>
 *                         </ul>
 * @param parameters       ordered fields to render in the create form
 * @param name             human-readable action name (aligned with PSM action schema)
 * @param description      human-readable description of what this action does
 * @param displayCategory  UI hint: {@code "PRIMARY"}, {@code "SECONDARY"}, or {@code "DANGEROUS"}
 * @param displayOrder     ordering hint within a category (lower = first)
 */
public record CreateAction(
    String httpMethod,
    String path,
    String contentType,
    String bodyShape,
    List<ItemParameter> parameters,
    String name,
    String description,
    String displayCategory,
    int displayOrder
) {}
