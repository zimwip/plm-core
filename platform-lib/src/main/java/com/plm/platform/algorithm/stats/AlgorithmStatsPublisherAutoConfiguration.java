package com.plm.platform.algorithm.stats;

import com.plm.platform.nats.NatsAutoConfiguration;
import com.plm.platform.nats.PlmMessageBus;
import com.plm.platform.environment.PlatformRegistrationProperties;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

@AutoConfiguration(after = NatsAutoConfiguration.class)
@ConditionalOnProperty(prefix = "plm.nats", name = "enabled", havingValue = "true")
@EnableConfigurationProperties(PlatformRegistrationProperties.class)
public class AlgorithmStatsPublisherAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public AlgorithmStatsPublisher algorithmStatsPublisher(
            PlmMessageBus bus,
            PlatformRegistrationProperties props) {
        return new AlgorithmStatsPublisher(bus, props);
    }
}
