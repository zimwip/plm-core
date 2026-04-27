package com.pno.api.controller;

import com.pno.domain.accessrights.AccessRightsTreeService;
import com.pno.domain.service.DynamicAuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Generic access-rights API: shape-agnostic grant CRUD plus the aggregated
 * tree the frontend renders. Works for any scope registered in
 * {@link com.pno.domain.scope.PermissionScopeRegistry}.
 */
@RestController
@RequestMapping("/access-rights")
@RequiredArgsConstructor
public class AccessRightsController {

    private final DynamicAuthorizationService dynamic;
    private final AccessRightsTreeService treeService;

    @GetMapping("/tree")
    public ResponseEntity<Map<String, Object>> tree(@RequestParam(required = false) String projectSpaceId) {
        return ResponseEntity.ok(treeService.tree(projectSpaceId));
    }

    @GetMapping("/roles/{roleId}/grants")
    public ResponseEntity<List<Map<String, Object>>> grantsForRole(
            @PathVariable String roleId,
            @RequestParam(required = false) String scopeCode) {
        if (scopeCode == null || scopeCode.isBlank()) {
            return ResponseEntity.ok(dynamic.listGrantsForRole(roleId));
        }
        return ResponseEntity.ok(dynamic.listGrantsForRoleAndScope(roleId, scopeCode));
    }

    @PostMapping("/grants")
    public ResponseEntity<Map<String, Object>> addGrant(@RequestBody GrantRequest req) {
        String id = dynamic.addGrant(
            req.permissionCode(), req.scopeCode(), req.roleId(),
            req.projectSpaceId(),
            req.keys() == null ? Map.of() : req.keys());
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/grants")
    public ResponseEntity<Map<String, Object>> removeGrant(@RequestBody GrantRequest req) {
        int n = dynamic.removeGrant(
            req.permissionCode(), req.scopeCode(), req.roleId(),
            req.projectSpaceId(),
            req.keys() == null ? Map.of() : req.keys());
        return ResponseEntity.ok(Map.of("removed", n));
    }

    public record GrantRequest(
        String permissionCode,
        String scopeCode,
        String roleId,
        String projectSpaceId,
        Map<String, String> keys
    ) {}
}
