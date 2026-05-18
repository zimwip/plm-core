package com.pno.infrastructure.event;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.nats.NatsListenerFactory;
import com.pno.domain.service.BasketService;
import io.nats.client.Dispatcher;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Subscribes to {@code global.ITEM_CREATED} (auto-add to basket) and
 * {@code global.ITEM_DELETED} (auto-remove from all users' baskets).
 * Best-effort: errors are logged and swallowed.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "plm.nats", name = "enabled", havingValue = "true")
public class BasketEventSubscriber {

    private final NatsListenerFactory natsListenerFactory;
    private final BasketService       basketService;
    private final ObjectMapper        objectMapper;
    private final BasketPublisher     basketPublisher;

    private Dispatcher createdDispatcher;
    private Dispatcher deletedDispatcher;

    @PostConstruct
    void subscribe() {
        createdDispatcher = natsListenerFactory.subscribe("global.ITEM_CREATED", msg -> {
            try {
                String json = new String(msg.getData(), StandardCharsets.UTF_8);
                Map<String, Object> payload = objectMapper.readValue(json, new TypeReference<>() {});

                String source         = (String) payload.get("source");
                String typeCode       = (String) payload.get("typeCode");
                String itemId         = (String) payload.get("itemId");
                String userId         = (String) payload.get("userId");
                String projectSpaceId = (String) payload.get("projectSpaceId");

                if (source == null || typeCode == null || itemId == null || userId == null) {
                    log.warn("BasketEventSubscriber: incomplete ITEM_CREATED payload, skipping");
                    return;
                }

                String key  = source + ":" + typeCode;
                String psId = projectSpaceId != null ? projectSpaceId : "";
                boolean added = basketService.add(userId, psId, source, typeCode, itemId);
                if (added) basketPublisher.itemAdded(userId, psId, key, itemId);

                log.debug("Basket auto-add: user={} ps={} key={} item={}", userId, psId, key, itemId);
            } catch (Exception e) {
                log.error("BasketEventSubscriber: failed to process ITEM_CREATED event: {}", e.getMessage(), e);
            }
        });
        log.info("BasketEventSubscriber: subscribed to global.ITEM_CREATED");

        deletedDispatcher = natsListenerFactory.subscribe("global.ITEM_DELETED", msg -> {
            try {
                String json = new String(msg.getData(), StandardCharsets.UTF_8);
                Map<String, Object> payload = objectMapper.readValue(json, new TypeReference<>() {});

                String itemId = (String) payload.get("itemId");
                if (itemId == null) {
                    log.warn("BasketEventSubscriber: incomplete ITEM_DELETED payload, skipping");
                    return;
                }

                var affected = basketService.removeByItemId(itemId);
                for (var row : affected) {
                    String userId   = (String) row.get("userId");
                    String psId     = (String) row.get("psId");
                    String source   = (String) row.get("source");
                    String typeCode = (String) row.get("typeCode");
                    basketPublisher.itemRemoved(userId, psId, source + ":" + typeCode, itemId);
                }
                if (!affected.isEmpty()) {
                    log.debug("Basket auto-remove: item={} removed from {} basket(s)", itemId, affected.size());
                }
            } catch (Exception e) {
                log.error("BasketEventSubscriber: failed to process ITEM_DELETED event: {}", e.getMessage(), e);
            }
        });
        log.info("BasketEventSubscriber: subscribed to global.ITEM_DELETED");
    }

    @PreDestroy
    void unsubscribe() {
        if (createdDispatcher != null) natsListenerFactory.close(createdDispatcher);
        if (deletedDispatcher != null) natsListenerFactory.close(deletedDispatcher);
    }
}
