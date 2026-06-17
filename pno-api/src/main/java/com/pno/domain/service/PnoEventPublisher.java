package com.pno.domain.service;

import com.plm.platform.event.PlmEventEnvelope;
import com.plm.platform.nats.PlmMessageBus;
import com.pno.domain.scope.AuthorizationSnapshotVersion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Publishes PNO domain events to NATS.
 *
 * All mutations publish global.PNO_CHANGED so the frontend can refresh
 * user/role/project-space lists. The event payload includes the entity type
 * and action for more granular handling if needed.
 *
 * Gracefully no-ops when PlmMessageBus is unavailable (NATS disabled / tests).
 */
@Component
public class PnoEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PnoEventPublisher.class);

    private final PlmMessageBus messageBus;
    private final AuthorizationSnapshotVersion versionStamp;

    public PnoEventPublisher(@Autowired(required = false) PlmMessageBus messageBus,
                             AuthorizationSnapshotVersion versionStamp) {
        this.messageBus = messageBus;
        this.versionStamp = versionStamp;
    }

    public void userChanged(String action, String userId, String byUser) {
        publish("USER", action, "userId", userId, byUser);
    }

    public void roleChanged(String action, String roleId, String byUser) {
        publish("ROLE", action, "roleId", roleId, byUser);
    }

    public void projectSpaceChanged(String action, String projectSpaceId, String byUser) {
        publish("PROJECT_SPACE", action, "projectSpaceId", projectSpaceId, byUser);
    }

    private void publish(String entity, String action, String entityKey, String entityId, String byUser) {
        // Bump the monotonic authorization version on every identity mutation
        // (user/role/role-assignment/project-space) so consumers can detect that
        // their cached auth model is stale. Bump regardless of NATS availability
        // since the version is also served via /internal/authorization/version.
        long version = versionStamp.bump();
        if (messageBus == null) return;
        try {
            var payload = PlmEventEnvelope.of("PNO_CHANGED")
                .field("entity", entity)
                .field("action", action)
                .field(entityKey, entityId)
                .field("version", version)
                .byUser(byUser)
                .build();
            messageBus.sendGlobal("PNO_CHANGED", payload);
            log.debug("PNO event: {}.{} (v{})", entity, action, version);
        } catch (Exception e) {
            log.warn("Failed to publish PNO event: {}.{} — {}", entity, action, e.getMessage());
        }
    }
}
