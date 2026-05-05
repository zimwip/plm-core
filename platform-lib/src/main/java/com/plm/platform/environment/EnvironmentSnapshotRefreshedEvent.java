package com.plm.platform.environment;

import org.springframework.context.ApplicationEvent;

/**
 * Fired after {@link EnvironmentSubscriber} or
 * {@link PlatformRegistrationClient} successfully refreshes the local
 * registry snapshot. Consumers (e.g. spe-api's gateway route refresher)
 * react after the registry is updated, eliminating the race where two
 * independent NATS subscribers see the change in undefined order.
 */
public class EnvironmentSnapshotRefreshedEvent extends ApplicationEvent {

    private final long snapshotVersion;

    public EnvironmentSnapshotRefreshedEvent(Object source, long snapshotVersion) {
        super(source);
        this.snapshotVersion = snapshotVersion;
    }

    public long snapshotVersion() {
        return snapshotVersion;
    }
}
