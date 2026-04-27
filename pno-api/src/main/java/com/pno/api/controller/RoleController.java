package com.pno.api.controller;

import com.pno.domain.service.PnoEventPublisher;
import com.pno.domain.service.RoleService;
import com.pno.infrastructure.security.PnoSecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final PnoEventPublisher eventPublisher;

    @GetMapping
    public ResponseEntity<?> listRoles() {
        return ResponseEntity.ok(roleService.listRoles());
    }

    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody Map<String, Object> body) {
        String name        = (String) body.get("name");
        String description = (String) body.get("description");
        var role = roleService.createRole(name, description);
        eventPublisher.roleChanged("CREATED", (String) role.get("id"), currentUserId());
        return ResponseEntity.ok(role);
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<?> updateRole(@PathVariable String roleId,
                                        @RequestBody Map<String, Object> body) {
        String name        = (String) body.get("name");
        String description = (String) body.get("description");
        roleService.updateRole(roleId, name, description);
        eventPublisher.roleChanged("UPDATED", roleId, currentUserId());
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<?> deleteRole(@PathVariable String roleId) {
        roleService.deleteRole(roleId);
        eventPublisher.roleChanged("DELETED", roleId, currentUserId());
        return ResponseEntity.noContent().build();
    }

    private String currentUserId() {
        var ctx = PnoSecurityContext.get();
        return ctx != null ? ctx.getUserId() : "unknown";
    }
}
