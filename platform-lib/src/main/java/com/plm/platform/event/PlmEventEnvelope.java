package com.plm.platform.event;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Builder for NATS event envelopes. Enforces a common field structure across all service
 * publishers. No public constructor — always start with {@link #of(String)}.
 *
 * <p>Common fields set automatically: {@code event} (the code), {@code at} (ISO-8601 now).
 * Named setters cover cross-service fields ({@code source}, {@code itemId}, {@code userId},
 * {@code byUser}, {@code typeCode}, {@code projectSpaceId}, {@code payload}).
 * Use {@link Builder#field(String, Object)} for event-specific fields.
 *
 * <p>Convention:
 * <ul>
 *   <li>{@code userId}  — actor for ITEM_* events, read by basket/search consumers</li>
 *   <li>{@code byUser}  — actor for operational events displayed in the UI</li>
 * </ul>
 */
public final class PlmEventEnvelope {

    private PlmEventEnvelope() {}

    public static Builder of(String eventCode) {
        return new Builder(eventCode);
    }

    public static final class Builder {

        private final LinkedHashMap<String, Object> fields = new LinkedHashMap<>();

        Builder(String eventCode) {
            fields.put("event", eventCode);
            fields.put("at", LocalDateTime.now().toString());
        }

        public Builder source(String source) {
            fields.put("source", source);
            return this;
        }

        public Builder itemId(String id) {
            fields.put("itemId", id);
            return this;
        }

        /** Actor for ITEM_* events — read by basket auto-add and search consumers. */
        public Builder userId(String id) {
            fields.put("userId", id);
            return this;
        }

        /** Actor for operational events displayed in the UI. Null-safe → {@code "unknown"}. */
        public Builder byUser(String user) {
            fields.put("byUser", user != null ? user : "unknown");
            return this;
        }

        public Builder typeCode(String code) {
            fields.put("typeCode", code != null ? code : "");
            return this;
        }

        /** Null-safe — stores empty string when {@code null}. */
        public Builder projectSpaceId(String id) {
            fields.put("projectSpaceId", id != null ? id : "");
            return this;
        }

        /** Added only when non-null and non-empty. */
        public Builder payload(Map<String, Object> payload) {
            if (payload != null && !payload.isEmpty()) {
                fields.put("payload", payload);
            }
            return this;
        }

        /** Escape hatch for event-specific fields not covered by named methods. */
        public Builder field(String key, Object value) {
            fields.put(key, value);
            return this;
        }

        public Map<String, Object> build() {
            return new LinkedHashMap<>(fields);
        }
    }
}
