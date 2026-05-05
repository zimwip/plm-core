package com.plm.platform.api.environment;

import com.plm.platform.environment.PlatformRegistrationProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.info.BuildProperties;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * platform-api writes its own entry into the in-process
 * {@link EnvironmentRegistry} at boot — it cannot register over HTTP without
 * calling itself, and consumers (including platform-api's own
 * {@code ServiceClient} federation calls) need {@code platform} to resolve
 * to a real baseUrl.
 *
 * <p>If platform-api is ever scaled horizontally, the registry needs a
 * shared backend and this in-process self-write becomes unsafe.
 */
@Slf4j
@Component
public class PlatformSelfRegistration {

    private final EnvironmentRegistry registry;
    private final PlatformRegistrationProperties props;
    private final String version;

    public PlatformSelfRegistration(EnvironmentRegistry registry,
                                    PlatformRegistrationProperties props,
                                    @Autowired(required = false) BuildProperties buildProperties) {
        this.registry = registry;
        this.props = props;
        this.version = buildProperties != null ? buildProperties.getVersion() : "unknown";
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        ServiceRegistration reg = registry.register(
            props.serviceCode(),
            props.selfBaseUrl(),
            props.selfBaseUrl() + props.contextPath() + "/actuator/health",
            props.routePrefix(),
            props.extraPaths(),
            version,
            props.spaceTag()
        );
        log.info("platform-api self-registered as instance {} (version {}, baseUrl {})",
            reg.instanceId(), version, props.selfBaseUrl());
    }
}
