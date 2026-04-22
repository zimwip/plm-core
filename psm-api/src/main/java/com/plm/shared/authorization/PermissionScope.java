package com.plm.shared.authorization;

/**
 * Drives the policy structure for permission enforcement and admin UI.
 *
 * <ul>
 *   <li>{@link #GLOBAL} — role check only (e.g. MANAGE_PSM, MANAGE_PNO, READ, UPDATE)</li>
 *   <li>{@link #NODE} — role + nodeType (e.g. READ_NODE, CHECKOUT, UPDATE_NODE, SIGN)</li>
 *   <li>{@link #LIFECYCLE} — role + nodeType + transition (e.g. TRANSITION)</li>
 * </ul>
 */
public enum PermissionScope {
    GLOBAL,
    NODE,
    LIFECYCLE
}
