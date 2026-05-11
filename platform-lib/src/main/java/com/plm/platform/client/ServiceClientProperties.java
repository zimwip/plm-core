package com.plm.platform.client;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Resilience4j configuration for the ServiceClient.
 * Defaults are sensible for a local Docker Compose setup.
 */
@ConfigurationProperties(prefix = "platform.client")
public record ServiceClientProperties(
    CircuitBreakerProps circuitBreaker,
    RetryProps retry
) {
    public record CircuitBreakerProps(
        float failureRateThreshold,
        int waitDurationSeconds,
        int slidingWindowSize,
        int permittedCallsInHalfOpen
    ) {
        public CircuitBreakerProps {
            if (failureRateThreshold <= 0) failureRateThreshold = 50;
            if (waitDurationSeconds <= 0) waitDurationSeconds = 30;
            if (slidingWindowSize <= 0) slidingWindowSize = 10;
            if (permittedCallsInHalfOpen <= 0) permittedCallsInHalfOpen = 3;
        }
    }

    public record RetryProps(
        int maxAttempts,
        long waitDurationMs,
        double multiplier
    ) {
        public RetryProps {
            if (maxAttempts <= 0) maxAttempts = 3;
            if (waitDurationMs <= 0) waitDurationMs = 500;
            if (multiplier <= 0) multiplier = 2.0;
        }
    }

    public ServiceClientProperties {
        if (circuitBreaker == null) circuitBreaker = new CircuitBreakerProps(50, 30, 10, 3);
        if (retry == null) retry = new RetryProps(3, 500, 2.0);
    }
}
