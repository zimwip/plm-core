package com.plm.shared.guard;

/**
 * Determines how a failed guard affects the action in the UI.
 *
 * At execution time, both effects deny the action equally (403/422).
 * The distinction is UI-only.
 */
public enum GuardEffect {
    /** Action removed from the list entirely — user doesn't see it. */
    HIDE,
    /** Action shown but disabled, with violation messages explaining why. */
    BLOCK
}
