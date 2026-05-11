package com.plm.platform.nats;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.nats.client.Connection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;

/**
 * Central API for publishing messages on the PLM NATS bus.
 *
 * Subject hierarchy:
 *   global.{eventType}                                    → all connected users (forwarded to WebSocket by ws-gateway)
 *   env.global.{eventType}                               → backend broadcast (NOT forwarded to frontend)
 *   project.{projectSpaceId}.users.{userId}.{eventType}   → specific project/user
 *   env.service.{serviceCode}.{eventType}                 → internal service-to-service
 */
public class PlmMessageBus {

    private static final Logger log = LoggerFactory.getLogger(PlmMessageBus.class);

    private final Connection connection;
    private final ObjectMapper objectMapper;

    public PlmMessageBus(Connection connection, ObjectMapper objectMapper) {
        this.connection = connection;
        this.objectMapper = objectMapper;
    }

    /**
     * Broadcast to all connected users (forwarded to WebSocket by ws-gateway).
     */
    public void sendGlobal(String eventType, Object payload) {
        publish("global." + eventType, payload);
    }

    /**
     * Backend-only broadcast — not forwarded to frontend via ws-gateway.
     */
    public void sendEnvGlobal(String eventType, Object payload) {
        publish("env.global." + eventType, payload);
    }

    /**
     * Send to a specific project/user pair.
     */
    public void sendToUser(String projectSpaceId, String userId, String eventType, Object payload) {
        publish("project." + projectSpaceId + ".users." + userId + "." + eventType, payload);
    }

    /**
     * Internal service-to-service notification (not forwarded to frontend).
     */
    public void sendInternal(String serviceCode, String eventType, Object payload) {
        publish("env.service." + serviceCode + "." + eventType, payload);
    }

    /**
     * Low-level publish — subject and pre-serialized JSON payload.
     * Used by OutboxPoller which already has JSON strings.
     */
    public void publishRaw(String subject, String jsonPayload) {
        try {
            connection.publish(subject, jsonPayload.getBytes(StandardCharsets.UTF_8));
            log.debug("NATS published: subject={} size={}", subject, jsonPayload.length());
        } catch (Exception e) {
            log.error("NATS publish failed: subject={} error={}", subject, e.getMessage(), e);
            throw new RuntimeException("NATS publish failed for subject=" + subject, e);
        }
    }

    @SuppressWarnings("unchecked")
    private void publish(String subject, Object payload) {
        try {
            // Inject "event" key (last subject segment) so the frontend console can
            // display a meaningful label regardless of which service built the payload.
            String eventType = subject.contains(".")
                ? subject.substring(subject.lastIndexOf('.') + 1)
                : subject;
            String json;
            if (payload instanceof java.util.Map<?, ?> map) {
                java.util.Map<String, Object> enriched = new java.util.LinkedHashMap<>((java.util.Map<String, Object>) map);
                enriched.putIfAbsent("event", eventType);
                json = objectMapper.writeValueAsString(enriched);
            } else {
                json = objectMapper.writeValueAsString(payload);
            }
            publishRaw(subject, json);
        } catch (Exception e) {
            log.error("NATS publish failed: subject={} error={}", subject, e.getMessage(), e);
        }
    }

    public Connection getConnection() {
        return connection;
    }
}
