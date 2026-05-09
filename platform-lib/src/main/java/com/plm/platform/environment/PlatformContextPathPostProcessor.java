package com.plm.platform.environment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.Map;

/**
 * Derives {@code server.servlet.context-path} from
 * {@code platform.registration.service-code} before the servlet container
 * starts, so controllers can drop the {@code /api/{service}} prefix from
 * {@code @RequestMapping}.
 *
 * <p>Runs only if the user has not already set
 * {@code server.servlet.context-path} explicitly and if registration is
 * not disabled.
 */
public class PlatformContextPathPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "platformContextPathDerived";
    private static final String CONTEXT_PATH_KEY = "server.servlet.context-path";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        // Note: deliberately decoupled from platform.registration.enabled.
        // platform-api self-disables registration but still needs its
        // context-path = /api/platform so the auth filter strips it correctly.
        String serviceCode = env.getProperty("platform.registration.service-code");
        if (serviceCode == null || serviceCode.isBlank()) return;
        // Reactive runtimes (Spring Cloud Gateway, WebFlux-only) have no servlet
        // container — server.servlet.context-path is meaningless and must not be
        // injected, or PlatformRegistrationClient will compute a wrong health URL.
        if ("reactive".equalsIgnoreCase(env.getProperty("spring.main.web-application-type"))) return;
        if (env.getProperty(CONTEXT_PATH_KEY) != null) return;
        String explicitRoutePrefix = env.getProperty("platform.registration.route-prefix");
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
