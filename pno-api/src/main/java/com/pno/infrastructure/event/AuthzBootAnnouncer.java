package com.pno.infrastructure.event;

import com.pno.domain.service.DynamicAuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * On pno startup, broadcast {@code global.AUTHORIZATION_CHANGED} so every
 * already-running consumer re-pulls the authorization snapshot. This closes the
 * recovery gap left by removing platform-lib's periodic refresh poll: a consumer
 * that booted while pno (or NATS) was down fails its boot pull silently and
 * would otherwise stay stale until the next admin grant change.
 *
 * <p>Fires on {@link ApplicationReadyEvent} (after Flyway + scope registration,
 * once the NATS connection is up). The announce goes through the outbox, so it
 * survives a momentary NATS gap at boot and no-ops cleanly when NATS is disabled
 * (tests).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthzBootAnnouncer {

    private final DynamicAuthorizationService authz;

    @EventListener(ApplicationReadyEvent.class)
    public void announce() {
        authz.announceSourceStarted();
        log.info("Announced AUTHORIZATION_CHANGED (SOURCE_STARTED) on pno startup");
    }
}
