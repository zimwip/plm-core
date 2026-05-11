package com.plm.platform.api.environment;

import com.plm.platform.registry.LocalServiceRegistry;
import org.springframework.stereotype.Component;

/**
 * Mirrors the in-process {@link EnvironmentRegistry} state into platform-api's
 * own {@link LocalServiceRegistry}. Without this, platform-api would have no
 * registry view to drive its {@code ServiceClient} federation calls
 * (it cannot pull from itself via HTTP without circular coupling).
 *
 * <p>The mirror is invoked from {@link EnvironmentRegistry#publishChange}
 * before NATS broadcast, so platform-api's own view stays consistent with
 * what it tells everyone else.
 */
@Component
public class EnvironmentMirror {

    private final EnvironmentRegistry environmentRegistry;
    private final LocalServiceRegistry localRegistry;

    public EnvironmentMirror(EnvironmentRegistry environmentRegistry, LocalServiceRegistry localRegistry) {
        this.environmentRegistry = environmentRegistry;
        this.localRegistry = localRegistry;
    }

    public void refresh() {
        localRegistry.updateFromSnapshot(environmentRegistry.buildSnapshot());
    }
}
