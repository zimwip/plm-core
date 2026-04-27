package com.plm.admin.config;

/**
 * Application event published after any admin write operation
 * that modifies config/metamodel data.
 */
public record ConfigChangedEvent(String changeType, String entityType, String entityId) {}
