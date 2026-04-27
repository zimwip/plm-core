package com.plm.platform.spe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.Map;

/**
 * Derives {@code server.servlet.context-path} from {@code spe.registration.service-code}
 * before the servlet container starts, so controllers can drop the {@code /api/{service}}
 * prefix from {@code @RequestMapping}.
 *
 * Runs only if the user has not already set {@code server.servlet.context-path} explicitly
 * and if SPE registration is not disabled.
 */
public class SpeContextPathPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "speContextPathDerived";
    private static final String CONTEXT_PATH_KEY = "server.servlet.context-path";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        if (Boolean.FALSE.equals(env.getProperty("spe.registration.enabled", Boolean.class, Boolean.TRUE))) {
            return;
        }
        String serviceCode = env.getProperty("spe.registration.service-code");
        if (serviceCode == null || serviceCode.isBlank()) return;
        if (env.getProperty(CONTEXT_PATH_KEY) != null) return;
        // Opt-out: services that explicitly declare a non-conventional route-prefix
        // keep controlling their own context-path (or none at all).
        String explicitRoutePrefix = env.getProperty("spe.registration.route-prefix");
        if (explicitRoutePrefix != null && !explicitRoutePrefix.isBlank()) return;

        String contextPath = "/api/" + serviceCode;
        env.getPropertySources().addFirst(new MapPropertySource(
            PROPERTY_SOURCE_NAME,
            Map.of(CONTEXT_PATH_KEY, contextPath)
        ));
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
