package com.plm.platform.item.dto;

/**
 * One item managed by a service, with the actions the calling user may
 * perform on it. Replaces the previous {@code ResourceDescriptor} (create
 * axis) + {@code ListableDescriptor} (list/get axis) split with a single
 * uniform shape.
 *
 * <p>The identity tuple is {@code (serviceCode, itemCode, itemKey)} —
 * same triple identifies the same logical item across calls.
 *
 * <p>Each action carries its own gateway-relative {@code path}; the
 * frontend prepends {@code /api/<serviceCode>} to build the final URL.
 * Actions that the caller is not permitted to perform — or that the item
 * type does not support — are emitted as {@code null}.
 *
 * @param serviceCode    owner service ({@code psm}, {@code dst}, ...)
 * @param itemCode       namespace within the service ({@code node}, {@code data-object})
 * @param itemKey        optional sub-key — e.g. nodeType id for psm. Lets one
 *                       contribution emit many concrete descriptors that share
 *                       a service+item pair (Document/Part/Assembly).
 * @param displayName    user-facing label
 * @param description    optional long form
 * @param icon           lucide / app-defined icon hint
 * @param color          accent color
 * @param sourceLabel    group label used by the navigation panel and the
 *                       create modal as the source heading (e.g.
 *                       {@code PLM}, {@code DATA})
 * @param panelSection   LeftPanel zone: {@link PanelSection#MAIN} (central)
 *                       or {@link PanelSection#INFO} (compact bottom band)
 * @param priority       ordering hint, higher = displayed first
 * @param create         how to create one — null when not creatable / not permitted
 * @param list           how to list — null when not listable / not permitted
 * @param get            how to fetch one — null when not viewable / not permitted
 */
public record ItemDescriptor(
    String serviceCode,
    String itemCode,
    String itemKey,
    String displayName,
    String description,
    String icon,
    String color,
    String sourceLabel,
    PanelSection panelSection,
    int priority,
    CreateAction create,
    ListAction list,
    GetAction get
) {
    public ItemDescriptor {
        if (panelSection == null) panelSection = PanelSection.MAIN;
    }

    /** True when at least one action is applicable for the caller. */
    public boolean hasAnyAction() {
        return create != null || list != null || get != null;
    }
}
