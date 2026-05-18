package com.plm.search.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.nats.NatsListenerFactory;
import com.plm.search.extractor.ItemEventExtractor;
import com.plm.search.service.IndexWriteService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Subscribes to NATS search subjects and dispatches to IndexWriteService.
 * Only active when {@code plm.nats.enabled=true}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty("plm.nats.enabled")
public class NatsEventConsumer {

    private static final TypeReference<Map<String, Object>> MAP_TYPE =
        new TypeReference<>() {};

    private final NatsListenerFactory      natsListenerFactory;
    private final IndexWriteService        indexWriteService;
    private final ObjectMapper             objectMapper;
    private final List<ItemEventExtractor> extractors;

    @PostConstruct
    void subscribe() {
        // Node index — standard item events dispatched through service-specific extractors
        natsListenerFactory.subscribe(
            new String[]{"global.ITEM_CREATED", "global.ITEM_UPDATED"},
            msg -> {
                try {
                    Map<String, Object> event = objectMapper.readValue(msg.getData(), MAP_TYPE);
                    String source = (String) event.get("source");
                    if (source == null) return;
                    extractors.stream()
                        .filter(ext -> ext.sourceCode().equals(source))
                        .findFirst()
                        .flatMap(ext -> ext.extractUpsert(event))
                        .ifPresent(indexWriteService::indexEntry);
                } catch (Exception e) {
                    log.warn("item upsert event failed: subject={} err={}", msg.getSubject(), e.getMessage());
                }
            }
        );

        natsListenerFactory.subscribe("global.ITEM_DELETED", msg -> {
            try {
                Map<String, Object> event = objectMapper.readValue(msg.getData(), MAP_TYPE);
                String source = (String) event.get("source");
                if (source == null) return;
                extractors.stream()
                    .filter(ext -> ext.sourceCode().equals(source))
                    .findFirst()
                    .flatMap(ext -> ext.extractDelete(event))
                    .ifPresent(indexWriteService::deleteById);
            } catch (Exception e) {
                log.warn("item delete event failed: err={}", e.getMessage());
            }
        });

        // Edge index — link events
        natsListenerFactory.subscribe(
            new String[]{"global.LINK_CREATED"},
            msg -> {
                try {
                    Map<String, Object> event = objectMapper.readValue(msg.getData(), MAP_TYPE);
                    indexWriteService.handleEdgeUpsert(event);
                } catch (Exception e) {
                    log.warn("link created event failed: err={}", e.getMessage());
                }
            }
        );

        natsListenerFactory.subscribe("global.LINK_DELETED", msg -> {
            try {
                Map<String, Object> event = objectMapper.readValue(msg.getData(), MAP_TYPE);
                indexWriteService.handleEdgeDelete(event);
            } catch (Exception e) {
                log.warn("link deleted event failed: err={}", e.getMessage());
            }
        });

        log.info("Search NATS consumers subscribed: global.ITEM_*, global.LINK_*");
    }

    @Scheduled(fixedDelay = 500)
    void idleFlush() {
        long idleMs = System.currentTimeMillis() - indexWriteService.getLastWriteMs();
        if (indexWriteService.getPending() > 0 && idleMs >= indexWriteService.getIdleThresholdMs()) {
            indexWriteService.flush();
        }
    }
}
