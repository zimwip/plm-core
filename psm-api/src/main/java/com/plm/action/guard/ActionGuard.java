package com.plm.action.guard;

import com.plm.algorithm.AlgorithmType;

/**
 * PSM extension of the platform action guard.
 * Adds {@code @AlgorithmType} for psm-admin algorithm catalog registration.
 * All PSM guard implementations implement this interface.
 */
@AlgorithmType(id = "algtype-action-guard",
    name = "Action Guard",
    description = "Checks node/action state preconditions (frozen, locked, ownership)")
public interface ActionGuard extends com.plm.platform.action.guard.ActionGuard {}
