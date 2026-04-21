package com.plm.permission;

import com.plm.permission.internal.PermissionAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * API de gestion des permissions PSM (vues d'attributs + droits globaux).
 *
 * Les rôles et utilisateurs sont gérés par pno-api (/api/pno/...).
 * Ce contrôleur gère :
 *   - les vues d'attributs PSM (attribute_view + view_attribute_override)
 *   - les droits globaux (MANAGE_METAMODEL, MANAGE_ROLES, MANAGE_BASELINES, READ)
 *     pour la section "Access Rights" du frontend
 */
@RestController
@RequestMapping("/api/psm/admin")
@RequiredArgsConstructor
public class RoleController {

    private final PermissionAdminService permissionAdminService;

    // ================================================================
    // GLOBAL PERMISSIONS — catalog & current-user introspection
    // ================================================================

    /**
     * Returns all permissions with scope=GLOBAL from the permission catalog.
     */
    @GetMapping("/global-actions")
    public ResponseEntity<List<Map<String, Object>>> listGlobalPermissions() {
        return ResponseEntity.ok(permissionAdminService.listGlobalPermissions());
    }

    /**
     * Returns the GLOBAL permission codes the current user can execute.
     */
    @GetMapping("/my-global-permissions")
    public ResponseEntity<List<String>> getMyGlobalPermissions() {
        return ResponseEntity.ok(permissionAdminService.getExecutableGlobalPermissions());
    }

    // ================================================================
    // PERMISSION CATALOG — introspection for Access Rights UI
    // ================================================================

    /**
     * Returns the full permission catalog grouped by scope.
     * Used by the Access Rights section to dynamically build the UI.
     */
    @GetMapping("/permissions")
    public ResponseEntity<List<Map<String, Object>>> listPermissions() {
        return ResponseEntity.ok(permissionAdminService.listPermissions());
    }

    // ================================================================
    // PERMISSION CATALOG CRUD
    // ================================================================

    /**
     * Creates a new permission.
     * Body: { "permissionCode": "...", "scope": "GLOBAL|NODE|LIFECYCLE", "displayName": "...", "description": "...", "displayOrder": 0 }
     */
    @PostMapping("/permissions")
    public ResponseEntity<Void> createPermission(@RequestBody Map<String, Object> body) {
        permissionAdminService.createPermission(
            (String) body.get("permissionCode"),
            (String) body.get("scope"),
            (String) body.get("displayName"),
            (String) body.get("description"),
            body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : 0
        );
        return ResponseEntity.ok().build();
    }

    /**
     * Updates permission display metadata.
     * Body: { "displayName": "...", "description": "...", "displayOrder": 0 }
     */
    @PutMapping("/permissions/{permissionCode}")
    public ResponseEntity<Void> updatePermission(
        @PathVariable String permissionCode,
        @RequestBody Map<String, Object> body
    ) {
        permissionAdminService.updatePermission(
            permissionCode,
            (String) body.get("displayName"),
            (String) body.get("description"),
            body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : null
        );
        return ResponseEntity.ok().build();
    }

    // ================================================================
    // BULK POLICIES — all grants for a role in one call
    // ================================================================

    /**
     * Returns ALL authorization_policy rows for a role in the active project space.
     * Frontend slices by scope locally.
     */
    @GetMapping("/roles/{roleId}/policies")
    public ResponseEntity<List<Map<String, Object>>> getRolePolicies(
        @PathVariable String roleId
    ) {
        return ResponseEntity.ok(permissionAdminService.getRolePolicies(roleId));
    }

    // ================================================================
    // GLOBAL PERMISSIONS PER ROLE — CRUD for the Access Rights section
    // ================================================================

    /**
     * Lists the GLOBAL permission grants held by a role.
     */
    @GetMapping("/roles/{roleId}/global-permissions")
    public ResponseEntity<List<Map<String, Object>>> getRoleGlobalPermissions(
        @PathVariable String roleId
    ) {
        return ResponseEntity.ok(permissionAdminService.getRoleGlobalPermissions(roleId));
    }

    /**
     * Grants a GLOBAL permission to a role.
     * Body: { "permissionCode": "MANAGE_METAMODEL" }
     */
    @PostMapping("/roles/{roleId}/global-permissions")
    public ResponseEntity<Void> addRoleGlobalPermission(
        @PathVariable String roleId,
        @RequestBody  Map<String, String> body
    ) {
        String permCode = body.getOrDefault("permissionCode", body.get("actionId"));
        permissionAdminService.addRoleGlobalPermission(roleId, permCode);
        return ResponseEntity.ok().build();
    }

    /**
     * Revokes a GLOBAL permission from a role.
     */
    @DeleteMapping("/roles/{roleId}/global-permissions/{permissionCode}")
    public ResponseEntity<Void> removeRoleGlobalPermission(
        @PathVariable String roleId,
        @PathVariable String permissionCode
    ) {
        permissionAdminService.removeRoleGlobalPermission(roleId, permissionCode);
        return ResponseEntity.noContent().build();
    }

    // ================================================================
    // VUES
    // ================================================================

    @PostMapping("/nodetypes/{nodeTypeId}/views")
    public ResponseEntity<Map<String, String>> createView(
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, Object> body
    ) {
        String id = permissionAdminService.createView(
            nodeTypeId,
            (String)  body.get("name"),
            (String)  body.get("description"),
            (String)  body.get("eligibleRoleId"),
            (String)  body.get("eligibleStateId"),
            (int)     body.getOrDefault("priority", 0)
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/views/{viewId}/attributes/{attrId}/override")
    public ResponseEntity<Void> setViewOverride(
        @PathVariable String viewId,
        @PathVariable String attrId,
        @RequestBody Map<String, Object> body
    ) {
        permissionAdminService.setViewOverride(
            viewId, attrId,
            (Boolean) body.get("visible"),
            (Boolean) body.get("editable"),
            (Integer) body.get("displayOrder"),
            (String)  body.get("displaySection")
        );
        return ResponseEntity.ok().build();
    }
}
