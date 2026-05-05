package com.plm.admin.permission;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin API for attribute views. Permission CRUD moved to platform-api.
 */
@RestController
@RequiredArgsConstructor
public class RoleController {

    private final PermissionAdminService permissionAdminService;

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
