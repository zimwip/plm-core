package com.plm.platform.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.nats.NatsListenerFactory;
import io.nats.client.Dispatcher;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Invalidates the local {@link PnoRoleCache} when pno-api publishes
 * {@code global.PNO_CHANGED} (user/role/project-space mutations).
 */
public class PnoChangedSubscriber {

    private static final Logger log = LoggerFactory.getLogger(PnoChangedSubscriber.class);
    private static final String SUBJECT = "global.PNO_CHANGED";

    private final NatsListenerFactory natsListeners;
    private final PnoRoleCache cache;
    private final ObjectMapper objectMapper;
    private Dispatcher dispatcher;

    public PnoChangedSubscriber(NatsListenerFactory natsListeners, PnoRoleCache cache, ObjectMapper objectMapper) {
        this.natsListeners = natsListeners;
        this.cache = cache;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void subscribe() {
        dispatcher = natsListeners.subscribe(SUBJECT, msg -> {
            try {
                JsonNode payload = objectMapper.readTree(msg.getData());
                String entity = payload.path("entity").asText(null);
                if ("USER".equals(entity)) {
                    String userId = payload.path("userId").asText(null);
                    if (userId != null && !userId.isBlank()) {
                        cache.invalidateUser(userId);
                        log.debug("Role cache: evicted user={}", userId);
                        return;
                    }
                }
                cache.invalidateAll();
                log.debug("Role cache: full eviction on entity={}", entity);
            } catch (Exception e) {
                log.warn("PnoChangedSubscriber: failed to process, evicting all: {}", e.getMessage());
                cache.invalidateAll();
            }
        });
        log.info("PnoChangedSubscriber subscribed to {}", SUBJECT);
    }

    @PreDestroy
    public void shutdown() {
        if (dispatcher != null) {
            try { natsListeners.close(dispatcher); } catch (Exception ignored) {}
        }
    }
}
