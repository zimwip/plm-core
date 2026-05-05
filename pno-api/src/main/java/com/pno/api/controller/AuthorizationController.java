package com.pno.api.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    /**
     * Catalog of permissions for a given scope ({@code DATA}, {@code GLOBAL},
     * {@code NODE}, ...). Used by the admin Access Rights page to surface
     * permissions contributed by services other than psm.
     */
    @GetMapping("/permissions")
    public ResponseEntity<List<Map<String, Object>>> listPermissions(
            @RequestParam(required = false) String scope,
            @RequestParam(required = false) String serviceCode) {
        return ResponseEntity.ok(authorizationService.listPermissions(scope, serviceCode));
    }

    @Transactional
    @PostMapping("/permissions")
    public ResponseEntity<Map<String, String>> createPermission(@RequestBody Map<String, Object> body) {
        authorizationService.createPermission(
            (String) body.get("permissionCode"),
            (String) body.getOrDefault("serviceCode", "platform"),
            (String) body.getOrDefault("scope", "GLOBAL"),
            (String) body.getOrDefault("displayName", body.get("permissionCode")),
            (String) body.get("description"),
            body.get("displayOrder") instanceof Number n ? n.intValue() : 0);
        return ResponseEntity.ok(Map.of("permissionCode", (String) body.get("permissionCode")));
    }

    @Transactional
    @PutMapping("/permissions/{permissionCode}")
    public ResponseEntity<Void> updatePermission(@PathVariable String permissionCode,
                                                  @RequestBody Map<String, Object> body) {
        authorizationService.updatePermission(permissionCode,
            (String) body.get("displayName"),
            (String) body.get("description"),
            body.get("displayOrder") instanceof Number n ? n.intValue() : 0);
        return ResponseEntity.noContent().build();
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

    // ── Generic role-only scope grants (DATA, future) ──
    //
    // Any scope whose effective key list is empty can be granted with the same
    // role-only shape as GLOBAL — e.g. dst's DATA (READ_DATA / WRITE_DATA / MANAGE_DATA).
    // {@link DynamicAuthorizationService#validate} rejects calls against scopes
    // that actually require keys (NODE, LIFECYCLE), so this surface stays safe
    // even though it accepts any scope code.

    @GetMapping("/roles/{roleId}/scope-permissions/{scopeCode}")
    public ResponseEntity<List<Map<String, Object>>> getRoleScopePermissions(
            @PathVariable String roleId, @PathVariable String scopeCode) {
        return ResponseEntity.ok(authorizationService.getRoleScopePermissions(roleId, scopeCode));
    }

    @PostMapping("/roles/{roleId}/scope-permissions/{scopeCode}")
    public ResponseEntity<Void> addRoleScopePermission(
            @PathVariable String roleId, @PathVariable String scopeCode,
            @RequestBody Map<String, String> body) {
        String permCode = body.get("permissionCode");
        if (permCode == null || permCode.isBlank()) {
            throw new IllegalArgumentException("permissionCode required in request body");
        }
        authorizationService.addRoleScopePermission(roleId, permCode, scopeCode);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/roles/{roleId}/scope-permissions/{scopeCode}/{permissionCode}")
    public ResponseEntity<Void> removeRoleScopePermission(
            @PathVariable String roleId, @PathVariable String scopeCode,
            @PathVariable String permissionCode) {
        authorizationService.removeRoleScopePermission(roleId, permissionCode, scopeCode);
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
