package com.pno.api.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plm.platform.authz.dto.ScopeKeyDefinition;
import com.pno.domain.scope.AuthorizationSnapshotVersion;
import com.pno.domain.scope.PermissionScopeRegistry;
import com.pno.domain.scope.PermissionScopeRegistry.ScopeRecord;
import com.pno.domain.service.AuthorizationService;

import lombok.RequiredArgsConstructor;

/**
 * Service-to-service snapshot endpoint. Returns the full authorization model
 * (permissions catalog, scope catalog, grants in dynamic form) so consumers
 * can rebuild their local enforcer cache.
 *
 * <p>Authentication: {@code X-Service-Secret} via the shared {@code PlmAuthFilter}
 * (path matched by {@code /internal/**}).
 */
@RestController
@RequestMapping("/internal/authorization")
@RequiredArgsConstructor
public class InternalAuthorizationController {

    private final AuthorizationService authorizationService;
    private final PermissionScopeRegistry scopeRegistry;
    private final AuthorizationSnapshotVersion versionStamp;

    @GetMapping("/snapshot")
    public ResponseEntity<Map<String, Object>> snapshot() {
        List<Map<String, Object>> policies = authorizationService.listAllPolicies();
        List<Map<String, Object>> permissions = authorizationService.listPermissions();

        List<Map<String, Object>> scopes = new ArrayList<>();
        for (ScopeRecord rec : scopeRegistry.snapshot().values()) {
            Map<String, Object> sm = new LinkedHashMap<>();
            sm.put("code", rec.scopeCode());
            sm.put("parent", rec.parentScopeCode());
            sm.put("ownerService", rec.ownerService());
            sm.put("definitionHash", rec.definitionHash());
            List<String> keyNames = new ArrayList<>();
            for (ScopeKeyDefinition k : scopeRegistry.effectiveKeys(rec.scopeCode())) {
                keyNames.add(k.name());
            }
            sm.put("keys", keyNames);
            scopes.add(sm);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("snapshotApiVersion", 2);
        body.put("version", versionStamp.current());
        body.put("permissions", permissions);
        body.put("scopes", scopes);
        body.put("policies", policies);
        return ResponseEntity.ok(body);
    }
}
