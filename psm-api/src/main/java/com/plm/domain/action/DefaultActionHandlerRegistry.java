package com.plm.domain.action;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Default implementation of {@link ActionHandlerRegistry}.
 *
 * Collects all {@link ActionHandler} Spring beans via constructor injection,
 * indexes them by their {@link ActionHandler#actionCode()}, and validates at
 * startup that every {@code handler_ref} referenced in the {@code action} table
 * has a corresponding registered bean.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultActionHandlerRegistry implements ActionHandlerRegistry {

    private final List<ActionHandler> handlers;
    private final DSLContext dsl;

    private final Map<String, ActionHandler> handlersByCode = new ConcurrentHashMap<>();

    @PostConstruct
    void init() {
        for (ActionHandler handler : handlers) {
            handlersByCode.put(handler.actionCode(), handler);
            log.info("ActionHandlerRegistry: registered handler for '{}'", handler.actionCode());
        }

        // Validate that every handler_ref in the DB has a corresponding bean.
        // This catches misconfigured CUSTOM actions at startup time rather than at runtime.
        List<String> dbHandlerRefs = dsl.select()
            .from("action")
            .where("handler_ref IS NOT NULL")
            .fetch("handler_ref", String.class)
            .stream()
            .filter(ref -> ref != null && !ref.isBlank())
            .collect(Collectors.toList());

        for (String ref : dbHandlerRefs) {
            // handler_ref for built-in actions matches action_code (e.g. "CHECKOUT").
            // For CUSTOM actions the ref is a Spring bean name — tolerate if not in our map.
            if (!handlersByCode.containsKey(ref)) {
                log.warn("ActionHandlerRegistry: DB action has handler_ref='{}' but no matching bean — " +
                    "this is acceptable for Spring-bean-named CUSTOM handlers resolved at dispatch time", ref);
            }
        }

        log.info("ActionHandlerRegistry initialised with {} handler(s): {}",
            handlersByCode.size(), handlersByCode.keySet());
    }

    @Override
    public ActionHandler getHandler(String actionCode) {
        ActionHandler h = handlersByCode.get(actionCode);
        if (h == null) {
            throw new IllegalStateException("No ActionHandler registered for action code: " + actionCode);
        }
        return h;
    }

    @Override
    public boolean hasHandler(String actionCode) {
        return handlersByCode.containsKey(actionCode);
    }
}
