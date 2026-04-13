package com.pno.api.controller;

import com.pno.domain.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pno/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<?> listRoles() {
        return ResponseEntity.ok(roleService.listRoles());
    }

    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody Map<String, Object> body) {
        String name        = (String) body.get("name");
        String description = (String) body.get("description");
        return ResponseEntity.ok(roleService.createRole(name, description));
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<?> updateRole(@PathVariable String roleId,
                                        @RequestBody Map<String, Object> body) {
        String name        = (String) body.get("name");
        String description = (String) body.get("description");
        roleService.updateRole(roleId, name, description);
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<?> deleteRole(@PathVariable String roleId) {
        roleService.deleteRole(roleId);
        return ResponseEntity.noContent().build();
    }
}
