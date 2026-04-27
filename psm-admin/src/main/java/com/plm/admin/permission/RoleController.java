package com.plm.admin.permission;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin API for managing permissions, authorization policies, and attribute views.
 */
@RestController
@RequiredArgsConstructor
public class RoleController {

    private final PermissionAdminService permissionAdminService;

    @GetMapping("/permissions")
    public ResponseEntity<List<Map<String, Object>>> listPermissions() {
        return ResponseEntity.ok(permissionAdminService.listPermissions());
    }

    @PostMapping("/permissions")
    public ResponseEntity<Void> createPermission(@RequestBody Map<String, Object> body) {
        permissionAdminService.createPermission(
            (String) body.get("permissionCode"), (String) body.get("scope"),
            (String) body.get("displayName"), (String) body.get("description"),
            body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : 0
        );
        return ResponseEntity.ok().build();
    }

    @PutMapping("/permissions/{permissionCode}")
    public ResponseEntity<Void> updatePermission(
        @PathVariable String permissionCode, @RequestBody Map<String, Object> body) {
        permissionAdminService.updatePermission(permissionCode,
            (String) body.get("displayName"), (String) body.get("description"),
            body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : null);
        return ResponseEntity.ok().build();
    }

    // Role × permission grants moved to pno-api in Phase D4 — see AuthorizationController there.

    @PostMapping("/nodetypes/{nodeTypeId}/views")
    public ResponseEntity<Map<String, String>> createView(
        @PathVariable String nodeTypeId, @RequestBody Map<String, Object> body) {
        String id = permissionAdminService.createView(nodeTypeId,
            (String) body.get("name"), (String) body.get("description"),
            (String) body.get("eligibleRoleId"), (String) body.get("eligibleStateId"),
            (int) body.getOrDefault("priority", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/views/{viewId}/attributes/{attrId}/override")
    public ResponseEntity<Void> setViewOverride(
        @PathVariable String viewId, @PathVariable String attrId,
        @RequestBody Map<String, Object> body) {
        permissionAdminService.setViewOverride(viewId, attrId,
            (Boolean) body.get("visible"), (Boolean) body.get("editable"),
            (Integer) body.get("displayOrder"), (String) body.get("displaySection"));
        return ResponseEntity.ok().build();
    }
}
