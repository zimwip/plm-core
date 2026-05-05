package com.plm.shared.action;

import com.plm.algorithm.AlgorithmType;

/**
 * PSM extension of the platform action handler.
 * Adds {@code @AlgorithmType} for psm-admin algorithm catalog registration.
 * All PSM action handlers implement this interface.
 */
@AlgorithmType(id = "algtype-action-handler",
    name = "Action Handler",
    description = "Executes a PLM action (checkout, transition, sign, etc.)")
public interface ActionHandler extends com.plm.platform.action.ActionHandler {}
