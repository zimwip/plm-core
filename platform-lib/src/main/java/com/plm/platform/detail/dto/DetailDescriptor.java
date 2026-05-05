package com.plm.platform.detail.dto;

import com.plm.platform.item.dto.GetAction;

import java.util.List;
import java.util.Map;

/**
 * Server-driven view of one object. Replaces ad-hoc per-service detail
 * payloads (psm {@code /nodes/{id}/description}, dst
 * {@code /data/{id}/metadata}, ...) with a uniform shape the generic
 * frontend editor can render without source-specific code.
 *
 * <p>The pattern: each {@link com.plm.platform.item.dto.ItemDescriptor}
 * declares a {@link GetAction} pointing at an endpoint that returns this
 * record; the frontend fetches the descriptor, renders {@link #fields()}
 * as a definition list, {@link #actions()} as buttons, and uses
 * {@link #title()} + {@link #subtitle()} for the editor header. Custom
 * plugins may still supply richer editors, but the default path is now a
 * single contract.
 *
 * @param id          stable object identifier
 * @param title       prominent header text
 * @param subtitle    optional muted line beneath the title
 * @param icon        lucide hint
 * @param color       accent colour
 * @param fields      ordered detail fields rendered as definition rows
 * @param actions     buttons the user can invoke on this object
 * @param metadata    service-specific extension bag (state colour, lock
 *                    info, anything not modelled by the standard fields)
 */
public record DetailDescriptor(
    String id,
    String title,
    String subtitle,
    String icon,
    String color,
    List<DetailField> fields,
    List<ActionDescriptor> actions,
    Map<String, Object> metadata
) {
    public DetailDescriptor {
        if (fields == null) fields = List.of();
        if (actions == null) actions = List.of();
    }
}
