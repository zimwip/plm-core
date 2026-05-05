package com.spe.gateway;

import com.plm.platform.environment.PlatformRegistrationProperties;
import com.plm.platform.spe.dto.RegistrySnapshot;
import com.plm.platform.spe.dto.ServiceInstanceInfo;
import com.plm.platform.spe.registry.LocalServiceRegistry;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Bootstrap fallback for the gateway: seeds {@link LocalServiceRegistry}
 * with a synthetic {@code platform} entry derived from
 * {@code platform.registration.platform-url} so {@code /api/platform/*}
 * can route during cold start, before the first
 * {@code ENVIRONMENT_CHANGED} from platform-api arrives.
 *
 * <p>Without this, the cluster has a startup deadlock: services cannot
 * register because they cannot reach platform-api through the gateway,
 * and the gateway has no platform-api route until services register.
 */
@Slf4j
@Component
public class PlatformBootstrapSeed {

    private final LocalServiceRegistry registry;
    private final PlatformRegistrationProperties props;

    public PlatformBootstrapSeed(LocalServiceRegistry registry, PlatformRegistrationProperties props) {
        this.registry = registry;
        this.props = props;
    }

    @PostConstruct
    public void seed() {
        String platformUrl = props.platformUrl();
        if (platformUrl == null || platformUrl.isBlank()) {
            log.warn("platform.registration.platform-url not set — gateway cold-start route to platform-api unavailable");
            return;
        }
        ServiceInstanceInfo synthetic = new ServiceInstanceInfo(
            "bootstrap",
            "platform",
            platformUrl,
            "bootstrap",
            null,
            true
        );
        registry.updateFromSnapshot(new RegistrySnapshot(0L, Map.of("platform", List.of(synthetic))));
        log.info("Seeded gateway registry with synthetic platform entry @ {}", platformUrl);
    }
}
