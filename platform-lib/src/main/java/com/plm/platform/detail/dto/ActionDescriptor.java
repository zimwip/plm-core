package com.plm.platform.detail.dto;

import com.plm.platform.action.guard.GuardViolation;

import java.util.List;
import java.util.Map;

/**
 * One action a service tells the frontend it can perform on an object.
 * Returned inside {@link DetailDescriptor#actions()}.
 *
 * <p>The frontend renders an action button, collects parameters via
 * {@link #parameters()} (rendered as a small form), and invokes the
 * action by issuing {@code httpMethod} on {@code path}. Path is
 * gateway-relative and may contain {@code {key}} placeholders that the
 * frontend substitutes with the parent item's id.
 *
 * @param code            stable code, e.g. {@code DOWNLOAD}, {@code CHECKOUT}
 * @param label           button text
 * @param description     optional tooltip / longer explanation
 * @param icon            lucide icon hint
 * @param httpMethod      {@code GET}, {@code POST}, {@code DELETE}, ...
 * @param path            gateway-relative path with optional {@code {key}}
 * @param bodyShape       {@code RAW} (body = parameters object),
 *                        {@code WRAPPED} ({"parameters": {...}}), or
 *                        {@code MULTIPART} (file upload)
 * @param parameters      ordered field specs the frontend renders as a form;
 *                        empty list = no inputs needed
 * @param confirmRequired show a confirm dialog before invoking
 * @param dangerous       destructive — render with red accent
 * @param navigateTo      optional resource path the frontend should open
 *                        on success ({@code /api/<svc>/...})
 * @param guardViolations BLOCK violations — action visible but disabled with these reasons;
 *                        empty = action is executable
 * @param metadata        service-specific extension bag
 */
public record ActionDescriptor(
    String code,
    String label,
    String description,
    String icon,
    String httpMethod,
    String path,
    String bodyShape,
    List<ActionParameter> parameters,
    boolean confirmRequired,
    boolean dangerous,
    String navigateTo,
    List<GuardViolation> guardViolations,
    Map<String, Object> metadata
) {
    public ActionDescriptor {
        if (parameters == null) parameters = List.of();
        if (guardViolations == null) guardViolations = List.of();
        if (bodyShape == null || bodyShape.isBlank()) bodyShape = "RAW";
        if (httpMethod == null || httpMethod.isBlank()) httpMethod = "POST";
    }
}
