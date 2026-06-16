package com.plm.platform.environment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

/**
 * No-op since the gateway-strip routing change.
 *
 * <p>Previously this derived {@code server.servlet.context-path = /api/<code>}
 * so backends served under the {@code /api/<serviceCode>} prefix and Spring
 * stripped it. The spe-api gateway now strips {@code /api/<serviceCode>}
 * itself and forwards a root path, so backends serve at root and must NOT set
 * a context-path (it would double the prefix and 404). Direct service-to-service
 * and health calls likewise use bare paths ({@code /internal/...},
 * {@code /actuator/health}).
 *
 * <p>The class is retained (still listed in {@code spring.factories}) as an
 * intentional no-op to avoid touching every service's factory config; it can
 * be deleted once that registration is removed.
 */
public class PlatformContextPathPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        // Intentionally does nothing — the gateway owns the /api/<code> prefix.
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
