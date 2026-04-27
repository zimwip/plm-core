package com.pno.domain.scope;

import com.plm.platform.authz.dto.ScopeRegistration;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Auto-registers the platform-level {@code GLOBAL} scope on pno-api boot.
 * pno-api itself does not opt in to the platform-lib registration client (it
 * <em>is</em> the registry); it seeds its own canonical scope locally.
 *
 * <p>Other platform-level scopes that pno owns conceptually (e.g., {@code USER},
 * {@code ROLE}, {@code PROJECT_SPACE}) can be added here as the system grows.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PnoBootstrapScopes {

    private static final String SELF_SERVICE_CODE = "pno";
    private static final String SELF_INSTANCE_ID  = "pno-bootstrap";

    private final ScopeRegistrationService registrationService;

    @PostConstruct
    public void registerPlatformScopes() {
        ScopeRegistration global = new ScopeRegistration(
            "GLOBAL",
            null,
            "Role-only check; no context keys.",
            List.of(),
            List.of()
        );
        try {
            registrationService.registerAll(SELF_SERVICE_CODE, SELF_INSTANCE_ID, List.of(global));
            log.info("PnoBootstrapScopes: GLOBAL scope ensured");
        } catch (RuntimeException e) {
            log.error("PnoBootstrapScopes: failed to register GLOBAL scope: {}", e.getMessage(), e);
            throw e;
        }
    }
}
