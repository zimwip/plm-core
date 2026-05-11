package com.plm.platform.client;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.core.IntervalFunction;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages per-service CircuitBreaker and Retry instances.
 * Lazy-created on first call to each service.
 */
public class ServiceClientResilience {

    private final ConcurrentHashMap<String, CircuitBreaker> breakers = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Retry> retries = new ConcurrentHashMap<>();
    private final ServiceClientProperties props;

    public ServiceClientResilience(ServiceClientProperties props) {
        this.props = props;
    }

    public CircuitBreaker breakerFor(String serviceCode) {
        return breakers.computeIfAbsent(serviceCode, code -> {
            var cbProps = props.circuitBreaker();
            CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(cbProps.failureRateThreshold())
                .waitDurationInOpenState(Duration.ofSeconds(cbProps.waitDurationSeconds()))
                .slidingWindowSize(cbProps.slidingWindowSize())
                .permittedNumberOfCallsInHalfOpenState(cbProps.permittedCallsInHalfOpen())
                // 4xx responses are functional errors (resource not found,
                // validation, permission) — counting them as breaker failures
                // trips the circuit on legitimate user actions (e.g. linking
                // to a non-existent dst data UUID). Only treat 5xx, network
                // and timeout errors as health signals.
                .recordException(e -> e instanceof RestClientException
                    && !(e instanceof HttpClientErrorException))
                .build();
            return CircuitBreaker.of("svc-" + code, config);
        });
    }

    public Retry retryFor(String serviceCode) {
        return retries.computeIfAbsent(serviceCode, code -> {
            var retryProps = props.retry();
            RetryConfig config = RetryConfig.custom()
                .maxAttempts(retryProps.maxAttempts())
                .intervalFunction(IntervalFunction.ofExponentialBackoff(
                    retryProps.waitDurationMs(), retryProps.multiplier()))
                // Same rationale as the breaker: don't retry 4xx — the answer
                // won't change (404 is 404), and retries amplify the breaker
                // failure count.
                .retryOnException(e ->
                    e instanceof RestClientException
                    && !(e instanceof CallNotPermittedException)
                    && !(e instanceof HttpClientErrorException))
                .build();
            return Retry.of("svc-" + code, config);
        });
    }
}
