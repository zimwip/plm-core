package com.plm.platform.nats;

import io.nats.client.Connection;
import io.nats.client.Dispatcher;
import io.nats.client.MessageHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Factory for creating NATS push-based subscriptions.
 *
 * Each call returns a Dispatcher that can be closed independently (e.g. on WebSocket disconnect).
 */
public class NatsListenerFactory {

    private static final Logger log = LoggerFactory.getLogger(NatsListenerFactory.class);

    private final Connection connection;

    public NatsListenerFactory(Connection connection) {
        this.connection = connection;
    }

    /**
     * Subscribe to an exact subject.
     */
    public Dispatcher subscribe(String subject, MessageHandler handler) {
        Dispatcher d = connection.createDispatcher(handler);
        d.subscribe(subject);
        log.debug("NATS subscribed: {}", subject);
        return d;
    }

    /**
     * Subscribe with NATS wildcard (e.g. "global.>" or "project.ps1.users.u42.>").
     * Same as subscribe — NATS wildcards are part of the subject string.
     */
    public Dispatcher subscribeWildcard(String subject, MessageHandler handler) {
        return subscribe(subject, handler);
    }

    /**
     * Subscribe multiple subjects on a single dispatcher.
     */
    public Dispatcher subscribe(String[] subjects, MessageHandler handler) {
        Dispatcher d = connection.createDispatcher(handler);
        for (String subject : subjects) {
            d.subscribe(subject);
            log.debug("NATS subscribed: {}", subject);
        }
        return d;
    }

    /**
     * Drain and close a dispatcher (graceful unsubscribe).
     */
    public void close(Dispatcher dispatcher) {
        if (dispatcher != null) {
            try {
                dispatcher.drain(java.time.Duration.ofSeconds(5));
            } catch (Exception e) {
                log.warn("NATS dispatcher drain failed: {}", e.getMessage());
            }
        }
    }
}
