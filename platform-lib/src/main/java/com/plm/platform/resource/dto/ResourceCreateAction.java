package com.plm.platform.resource.dto;

import java.util.List;

/**
 * Describes how to create one resource.
 *
 * <p>Per-user permission filtering is delegated to the source service via the
 * {@code /internal/resources/visible} fan-out — the descriptor itself no longer
 * carries a {@code requiredPermissions} list, and platform-api does not enforce
 * one. Each contributing service owns the decision (psm: scope-aware
 * {@code CREATE_NODE} per nodeType; dst: {@code WRITE_DATA} grant).
 *
 * @param httpMethod    "POST" today; reserved for future verbs
 * @param path          gateway-relative path
 * @param contentType   "application/json" or "multipart/form-data"
 * @param bodyShape     how the frontend should serialize the form values:
 *                      <ul>
 *                        <li>{@code RAW}        — `{...params}` as JSON</li>
 *                        <li>{@code WRAPPED}    — `{ parameters: {...params} }` (psm action convention)</li>
 *                        <li>{@code MULTIPART}  — multipart/form-data with one part per param</li>
 *                      </ul>
 * @param parameters    ordered fields to render in the create form
 */
public record ResourceCreateAction(
    String httpMethod,
    String path,
    String contentType,
    String bodyShape,
    List<ResourceParameter> parameters
) {}
