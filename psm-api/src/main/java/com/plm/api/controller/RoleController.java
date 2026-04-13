package com.plm.api.controller;

import com.plm.domain.action.ActionPermissionService;
import com.plm.domain.service.PermissionService;
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
 *   - les droits globaux (MANAGE_METAMODEL, MANAGE_ROLES, MANAGE_BASELINES)
 *     pour la section "Access Rights" du frontend
 */
@RestController
@RequestMapping("/api/psm/admin")
@RequiredArgsConstructor
public class RoleController {

    private final PermissionService       permissionService;
    private final ActionPermissionService actionPermissionService;

    // ================================================================
    // GLOBAL ACTIONS — catalog & current-user introspection
    // ================================================================

    /**
     * Returns all actions with scope=GLOBAL from the action catalog.
     * Open to all authenticated users (read-only).
     */
    @GetMapping("/global-actions")
    public ResponseEntity<List<Map<String, Object>>> listGlobalActions() {
        return ResponseEntity.ok(actionPermissionService.listGlobalActions());
    }

    /**
     * Returns the GLOBAL action codes the current user can execute in the
     * active project space.  Used by the frontend to decide which write
     * buttons to show.  Admin users get all global actions.
     */
    @GetMapping("/my-global-permissions")
    public ResponseEntity<List<String>> getMyGlobalPermissions() {
        return ResponseEntity.ok(actionPermissionService.getExecutableGlobalActionCodes());
    }

    // ================================================================
    // GLOBAL PERMISSIONS PER ROLE — CRUD for the Access Rights section
    // ================================================================

    /**
     * Lists the GLOBAL action permissions held by a role in the active
     * project space.  Open to all authenticated users (read-only).
     */
    @GetMapping("/roles/{roleId}/global-permissions")
    public ResponseEntity<List<Map<String, Object>>> getRoleGlobalPermissions(
        @PathVariable String roleId
    ) {
        return ResponseEntity.ok(permissionService.getRoleGlobalPermissions(roleId));
    }

    /**
     * Grants a GLOBAL action to a role.  Requires MANAGE_ROLES.
     * Body: { "actionId": "act-manage-metamodel" }
     */
    @PostMapping("/roles/{roleId}/global-permissions")
    public ResponseEntity<Void> addRoleGlobalPermission(
        @PathVariable String roleId,
        @RequestBody  Map<String, String> body
    ) {
        permissionService.addRoleGlobalPermission(roleId, body.get("actionId"));
        return ResponseEntity.ok().build();
    }

    /**
     * Revokes a GLOBAL action from a role.  Requires MANAGE_ROLES.
     */
    @DeleteMapping("/roles/{roleId}/global-permissions/{actionId}")
    public ResponseEntity<Void> removeRoleGlobalPermission(
        @PathVariable String roleId,
        @PathVariable String actionId
    ) {
        permissionService.removeRoleGlobalPermission(roleId, actionId);
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
        String id = permissionService.createView(
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
        permissionService.setViewOverride(
            viewId, attrId,
            (Boolean) body.get("visible"),
            (Boolean) body.get("editable"),
            (Integer) body.get("displayOrder"),
            (String)  body.get("displaySection")
        );
        return ResponseEntity.ok().build();
    }
}
