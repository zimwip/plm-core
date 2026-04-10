package com.plm.api.controller;

import com.plm.domain.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * API de gestion des rôles, utilisateurs, permissions et vues.
 * Toutes les opérations d'écriture sont réservées aux admins (vérification dans PermissionService).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class RoleController {

    private final PermissionService permissionService;

    // ================================================================
    // ROLES
    // ================================================================

    @PostMapping("/roles")
    public ResponseEntity<Map<String, String>> createRole(@RequestBody Map<String, Object> body) {
        String id = permissionService.createRole(
            (String)  body.get("name"),
            (String)  body.get("description"),
            Boolean.TRUE.equals(body.get("isAdmin"))
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    // ================================================================
    // UTILISATEURS
    // ================================================================

    @PostMapping("/users")
    public ResponseEntity<Map<String, String>> createUser(@RequestBody Map<String, String> body) {
        String id = permissionService.createUser(
            body.get("username"),
            body.get("displayName"),
            body.get("email")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PostMapping("/users/{userId}/roles/{roleId}")
    public ResponseEntity<Void> assignRole(
        @PathVariable String userId,
        @PathVariable String roleId
    ) {
        permissionService.assignRole(userId, roleId);
        return ResponseEntity.ok().build();
    }

    // ================================================================
    // PERMISSIONS NODETYPES
    // ================================================================

    @PutMapping("/roles/{roleId}/nodetypes/{nodeTypeId}/permissions")
    public ResponseEntity<Void> setNodeTypePermission(
        @PathVariable String roleId,
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, Object> body
    ) {
        permissionService.setNodeTypePermission(
            roleId, nodeTypeId,
            !Boolean.FALSE.equals(body.get("canRead")),       // défaut true
            Boolean.TRUE.equals(body.get("canWrite")),
            Boolean.TRUE.equals(body.get("canTransition")),
            Boolean.TRUE.equals(body.get("canSign")),
            Boolean.TRUE.equals(body.get("canCreateLink")),
            Boolean.TRUE.equals(body.get("canBaseline"))
        );
        return ResponseEntity.ok().build();
    }

    // ================================================================
    // PERMISSIONS TRANSITIONS
    // ================================================================

    @PostMapping("/transitions/{transitionId}/roles/{roleId}")
    public ResponseEntity<Void> setTransitionPermission(
        @PathVariable String transitionId,
        @PathVariable String roleId
    ) {
        permissionService.setTransitionPermission(transitionId, roleId);
        return ResponseEntity.ok().build();
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
        Boolean visible      = (Boolean) body.get("visible");
        Boolean editable     = (Boolean) body.get("editable");
        Integer displayOrder = (Integer) body.get("displayOrder");
        String  section      = (String)  body.get("displaySection");

        permissionService.setViewOverride(viewId, attrId, visible, editable, displayOrder, section);
        return ResponseEntity.ok().build();
    }

    // ================================================================
}
