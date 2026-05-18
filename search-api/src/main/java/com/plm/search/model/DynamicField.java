package com.plm.search.model;

import java.util.List;

/**
 * A named, typed attribute value carried in the payload of ITEM_CREATED/ITEM_UPDATED events.
 * valueType: "string" | "number" | "date" | "boolean"
 */
public record DynamicField(String name, String valueType, List<Object> values) {}
