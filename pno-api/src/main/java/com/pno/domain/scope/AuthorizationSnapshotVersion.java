package com.pno.domain.scope;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Monotonic version stamp incremented every time the authorization model
 * changes (grant CRUD, scope registration, cascade purge). Consumers compare
 * versions to know whether a cached snapshot is still fresh.
 *
 * <p>Initialized from {@code System.currentTimeMillis()} so a service restart
 * never moves the version backwards.
 */
@Component
public class AuthorizationSnapshotVersion {

    private final AtomicLong value = new AtomicLong(System.currentTimeMillis());

    public long current() {
        return value.get();
    }

    public long bump() {
        return value.incrementAndGet();
    }
}
