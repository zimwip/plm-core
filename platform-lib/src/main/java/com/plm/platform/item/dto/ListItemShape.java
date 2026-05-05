package com.plm.platform.item.dto;

/**
 * Field-name hints telling the federated navigation tree which keys carry the
 * id, label, and (optional) icon for items returned by a {@link ListAction}.
 *
 * <p>Defaults map onto the psm node JSON shape. Sources whose JSON differs
 * declare their own field names (e.g. {@code "uuid" / "name" / null} for dst
 * data files).
 */
public record ListItemShape(
    String idField,
    String labelField,
    String iconField
) {
    public static ListItemShape defaults() {
        return new ListItemShape("id", "logical_id", null);
    }
}
