package com.plm.platform.action;

import java.util.Map;

/**
 * Port: validates and normalizes action parameters before dispatch.
 *
 * The default no-op implementation ({@link #NO_OP}) passes through all
 * parameters unchanged. Services with richer validation (e.g. DB-driven
 * overrides) provide their own bean implementing this interface.
 */
public interface ActionParameterValidatorPort {

    Map<String, String> validate(String actionId, String nodeTypeId, Map<String, String> rawParams);

    ActionParameterValidatorPort NO_OP = (actionId, nodeTypeId, rawParams) ->
        rawParams != null ? rawParams : Map.of();
}
