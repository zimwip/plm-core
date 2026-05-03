package com.plm.platform.api.actions;

public record ConfigChangedEvent(String operation, String entityType, String entityId) {}
