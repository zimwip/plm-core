package com.pno.domain.scope;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.nats.NatsListenerFactory;
import com.pno.domain.accessrights.AccessRightsTreeService;
import com.pno.domain.service.DynamicAuthorizationService;
import io.nats.client.Dispatcher;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Subscribes to {@code global.SCOPE_VALUES_CHANGED} so pno can:
 *  1. Cascade-purge grants whose key/value no longer exists in the source
 *     service ({@link DynamicAuthorizationService#purgeOrphanedGrants}).
 *  2. Invalidate the access-rights tree cache so the next frontend fetch sees
 *     fresh values.
 *
 * <p>Payload (JSON): {@code {scopeCode, keyName, removedIds: [...]}}.
 *
 * <p>Gracefully no-ops when NATS is disabled.
 */
@Slf4j
@Component
public class ScopeValuesChangedSubscriber {

    private static final String SUBJECT = "global.SCOPE_VALUES_CHANGED";

    private final NatsListenerFactory listenerFactory;
    private final DynamicAuthorizationService authorization;
    private final AccessRightsTreeService treeService;
    private final ObjectMapper objectMapper;

    private Dispatcher dispatcher;

    public ScopeValuesChangedSubscriber(
            @Autowired(required = false) NatsListenerFactory listenerFactory,
            DynamicAuthorizationService authorization,
            AccessRightsTreeService treeService,
            ObjectMapper objectMapper) {
        this.listenerFactory = listenerFactory;
        this.authorization = authorization;
        this.treeService = treeService;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void subscribe() {
        if (listenerFactory == null) return;
        dispatcher = listenerFactory.subscribe(SUBJECT, msg -> handle(new String(msg.getData())));
        log.info("Subscribed to {}", SUBJECT);
    }

    void handle(String payloadJson) {
        try {
            JsonNode payload = objectMapper.readTree(payloadJson);
            String keyName = payload.path("keyName").asText(null);
            JsonNode removed = payload.path("removedIds");
            if (keyName == null || keyName.isBlank() || !removed.isArray() || removed.isEmpty()) return;
            List<String> ids = new ArrayList<>(removed.size());
            removed.forEach(n -> ids.add(n.asText()));
            int purged = authorization.purgeOrphanedGrants(keyName, ids);
            treeService.invalidate();
            log.info("SCOPE_VALUES_CHANGED key={} removed={} → purged {} grant(s)", keyName, ids.size(), purged);
        } catch (Exception e) {
            log.warn("Failed to handle SCOPE_VALUES_CHANGED payload: {}", e.getMessage());
        }
    }

    @PreDestroy
    void close() {
        if (dispatcher != null && listenerFactory != null) {
            listenerFactory.close(dispatcher);
        }
    }
}
