package com.pno.api.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pno.domain.service.AuthorizationService;
import com.pno.infrastructure.security.PnoSecurityContext;
import com.pno.infrastructure.security.PnoUserContext;

import lombok.RequiredArgsConstructor;

/**
 * pno-api is the single source of truth for role × permission grants.
 * Endpoints are mounted directly under the service namespace so the frontend
 * hits {@code /api/pno/<path>}.
 */
@RestController
@RequiredArgsConstructor
public class AuthorizationController {

    private final AuthorizationService authorizationService;

    // ── Catalog queries ──

    @GetMapping("/global-actions")
    public ResponseEntity<List<Map<String, Object>>> listGlobalActions() {
        return ResponseEntity.ok(authorizationService.listGlobalPermissions());
    }

    @GetMapping("/my-global-permissions")
    public ResponseEntity<List<String>> getMyGlobalPermissions() {
        PnoUserContext u = PnoSecurityContext.get();
        if (u == null) return ResponseEntity.ok(List.of());
        Set<String> roleIds = u.getRoleIds() == null ? Set.of() : u.getRoleIds();
        return ResponseEntity.ok(authorizationService.listPermissionCodesForRoles(roleIds, u.isAdmin()));
    }

    // ── Role grants ──

    @GetMapping("/roles/{roleId}/policies")
    public ResponseEntity<List<Map<String, Object>>> getRolePolicies(@PathVariable String roleId) {
        return ResponseEntity.ok(authorizationService.getRolePolicies(roleId));
    }

    @GetMapping("/roles/{roleId}/global-permissions")
    public ResponseEntity<List<Map<String, Object>>> getRoleGlobalPermissions(@PathVariable String roleId) {
        return ResponseEntity.ok(authorizationService.getRoleGlobalPermissions(roleId));
    }

    @PostMapping("/roles/{roleId}/global-permissions")
    public ResponseEntity<Void> addRoleGlobalPermission(
            @PathVariable String roleId, @RequestBody Map<String, String> body) {
        String permCode = body.getOrDefault("permissionCode", body.get("actionId"));
        if (permCode == null || permCode.isBlank()) {
            throw new IllegalArgumentException("permissionCode required in request body");
        }
        authorizationService.addRoleGlobalPermission(roleId, permCode);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/roles/{roleId}/global-permissions/{permissionCode}")
    public ResponseEntity<Void> removeRoleGlobalPermission(
            @PathVariable String roleId, @PathVariable String permissionCode) {
        authorizationService.removeRoleGlobalPermission(roleId, permissionCode);
        return ResponseEntity.noContent().build();
    }

    // ── Node-type scoped grants ──

    @GetMapping("/nodetypes/{nodeTypeId}/permissions/{permissionCode}")
    public ResponseEntity<List<Map<String, Object>>> listNodeTypeGrants(
            @PathVariable String nodeTypeId,
            @PathVariable String permissionCode,
            @RequestParam(required = false) String transitionId) {
        return ResponseEntity.ok(authorizationService.getNodeTypeGrants(nodeTypeId, permissionCode, transitionId));
    }

    @PostMapping("/nodetypes/{nodeTypeId}/permissions/{permissionCode}")
    public ResponseEntity<Void> addNodeTypeGrant(
            @PathVariable String nodeTypeId,
            @PathVariable String permissionCode,
            @RequestBody Map<String, String> body) {
        authorizationService.addNodeTypeGrant(nodeTypeId, permissionCode,
            body.get("roleId"), body.get("transitionId"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/nodetypes/{nodeTypeId}/permissions/{permissionCode}")
    public ResponseEntity<Void> removeNodeTypeGrant(
            @PathVariable String nodeTypeId,
            @PathVariable String permissionCode,
            @RequestBody Map<String, String> body) {
        authorizationService.removeNodeTypeGrant(nodeTypeId, permissionCode,
            body.get("roleId"), body.get("transitionId"));
        return ResponseEntity.noContent().build();
    }
}
