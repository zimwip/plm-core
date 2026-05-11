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
 * Subscribes to {@code global.ITEM_CREATED} and auto-adds created items to
 * the actor's basket ({@code BASKET} KV group, key = source:typeCode,
 * value = itemId). Best-effort: errors are logged and swallowed so a
 * bad event never breaks the message bus.
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

    private Dispatcher dispatcher;

    @PostConstruct
    void subscribe() {
        dispatcher = natsListenerFactory.subscribe("global.ITEM_CREATED", msg -> {
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
    }

    @PreDestroy
    void unsubscribe() {
        if (dispatcher != null) {
            natsListenerFactory.close(dispatcher);
        }
    }
}
