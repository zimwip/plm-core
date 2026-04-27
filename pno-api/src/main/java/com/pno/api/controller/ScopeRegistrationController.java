package com.pno.api.controller;

import com.plm.platform.authz.dto.ScopeRegistration;
import com.plm.platform.authz.dto.ScopeRegistrationRequest;
import com.plm.platform.authz.dto.ScopeRegistrationResponse;
import com.pno.domain.scope.PermissionScopeRegistry;
import com.pno.domain.scope.PermissionScopeRegistry.ScopeRecord;
import com.pno.domain.scope.ScopeRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service-to-service endpoint for scope registration. Authenticated via
 * {@code X-Service-Secret} (covered by {@code /internal/**} in PlmAuthFilter).
 */
@RestController
@RequestMapping("/internal/scopes")
@RequiredArgsConstructor
public class ScopeRegistrationController {

    private final ScopeRegistrationService registrationService;
    private final PermissionScopeRegistry registry;

    @PostMapping("/register")
    public ResponseEntity<ScopeRegistrationResponse> register(@RequestBody ScopeRegistrationRequest req) {
        if (req.scopes() == null || req.scopes().isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        registrationService.registerAll(req.serviceCode(), req.instanceId(), req.scopes());
        return ResponseEntity.ok(new ScopeRegistrationResponse(req.instanceId(), List.of()));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list() {
        List<ScopeRegistration> all = new ArrayList<>();
        for (ScopeRecord rec : registry.snapshot().values()) {
            all.add(registry.toRegistration(rec));
        }
        return ResponseEntity.ok(Map.of("scopes", all));
    }
}
