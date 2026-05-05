package com.plm.platform.item.dto;

/**
 * Where in the LeftPanel an {@link ItemDescriptor} should be rendered.
 *
 * <ul>
 *   <li>{@link #MAIN} — central scrollable zone, the primary navigation
 *       area. Default for object lists (psm nodes, dst data files, etc).</li>
 *   <li>{@link #INFO} — compact bottom band reserved for context-state
 *       surfaces (transaction summary, alerts, dashboards-at-a-glance).</li>
 * </ul>
 *
 * <p>The frontend renders MAIN sections at the top and INFO sections at
 * the bottom; both honour the per-descriptor {@code priority} ordering.
 */
public enum PanelSection {
    MAIN,
    INFO
}
