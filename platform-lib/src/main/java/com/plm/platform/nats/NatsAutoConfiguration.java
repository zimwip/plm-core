package com.plm.platform.nats;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.nats.client.Connection;
import io.nats.client.Nats;
import io.nats.client.Options;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import java.time.Duration;

@AutoConfiguration
@ConditionalOnProperty(prefix = "plm.nats", name = "enabled", havingValue = "true")
@EnableConfigurationProperties(NatsProperties.class)
public class NatsAutoConfiguration {

    private static final Logger log = LoggerFactory.getLogger(NatsAutoConfiguration.class);

    private Connection connection;

    @Bean
    public Connection natsConnection(NatsProperties props) throws Exception {
        Options.Builder builder = new Options.Builder()
                .server(props.getUrl())
                .reconnectWait(Duration.ofMillis(props.getReconnectWaitMs()))
                .maxReconnects(props.getMaxReconnects());

        if (props.getConnectionName() != null && !props.getConnectionName().isBlank()) {
            builder.connectionName(props.getConnectionName());
        }

        connection = Nats.connect(builder.build());
        log.info("NATS connected: {}", props.getUrl());
        return connection;
    }

    @Bean
    public PlmMessageBus plmMessageBus(Connection natsConnection, ObjectMapper objectMapper) {
        return new PlmMessageBus(natsConnection, objectMapper);
    }

    @Bean
    public NatsListenerFactory natsListenerFactory(Connection natsConnection) {
        return new NatsListenerFactory(natsConnection);
    }

    @PreDestroy
    void shutdown() {
        if (connection != null) {
            try {
                connection.drain(Duration.ofSeconds(5));
                log.info("NATS connection drained");
            } catch (Exception e) {
                log.warn("NATS shutdown error: {}", e.getMessage());
            }
        }
    }
}
