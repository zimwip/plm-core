package com.plm.api.controller;

import com.plm.domain.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * API de gestion des permissions PSM (node type, transitions, vues).
 *
 * Les rôles et utilisateurs sont gérés par pno-api (/api/pno/...).
 * Ce contrôleur gère uniquement ce qui est propre au PSM :
 *   - droits d'accès d'un rôle sur un type de noeud
 *   - droits de transition
 *   - vues d'attributs
 */
@RestController
@RequestMapping("/api/psm/admin")
@RequiredArgsConstructor
public class RoleController {

    private final PermissionService permissionService;

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
            !Boolean.FALSE.equals(body.get("canRead")),
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
