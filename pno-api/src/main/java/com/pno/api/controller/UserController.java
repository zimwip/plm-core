package com.pno.api.controller;

import com.pno.domain.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pno/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(userService.listUsers());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> body) {
        String username    = (String) body.get("username");
        String displayName = (String) body.get("displayName");
        String email       = (String) body.get("email");
        return ResponseEntity.ok(userService.createUser(username, displayName, email));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deactivateUser(@PathVariable String userId) {
        userService.deactivateUser(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Assigns a role to a user within a specific project space.
     * projectSpaceId is required — roles are always scoped to a project space.
     */
    @PostMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<?> assignRole(@PathVariable String userId,
                                        @PathVariable String roleId,
                                        @RequestParam String projectSpaceId) {
        userService.assignRole(userId, roleId, projectSpaceId);
        return ResponseEntity.ok(Map.of("status", "assigned"));
    }

    /**
     * Removes a role from a user within a specific project space.
     */
    @DeleteMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<?> removeRole(@PathVariable String userId,
                                        @PathVariable String roleId,
                                        @RequestParam String projectSpaceId) {
        userService.removeRole(userId, roleId, projectSpaceId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lists all role assignments for a user.
     * Optionally filtered by projectSpaceId.
     * Each entry includes project space information.
     */
    @GetMapping("/{userId}/roles")
    public ResponseEntity<?> getUserRoles(@PathVariable String userId,
                                          @RequestParam(required = false) String projectSpaceId) {
        return ResponseEntity.ok(userService.getUserRoles(userId, projectSpaceId));
    }

    /**
     * Sets or unsets admin flag on a user.
     * Unsetting admin requires at least one other active admin to remain.
     */
    @PutMapping("/{userId}/admin")
    public ResponseEntity<?> setAdmin(@PathVariable String userId,
                                      @RequestBody Map<String, Object> body) {
        Boolean isAdmin = (Boolean) body.get("isAdmin");
        if (isAdmin == null) return ResponseEntity.badRequest().body(Map.of("error", "isAdmin required"));
        userService.setAdmin(userId, isAdmin);
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    /**
     * Service-to-service endpoint consumed by plm-api's PlmAuthFilter.
     * Returns { userId, username, isAdmin, roleIds } scoped to a project space.
     * When projectSpaceId is omitted, roles from all spaces are returned (union).
     * Auth is bypassed in PnoAuthFilter for this path pattern.
     */
    @GetMapping("/{userId}/context")
    public ResponseEntity<?> getUserContext(@PathVariable String userId,
                                            @RequestParam(required = false) String projectSpaceId) {
        Map<String, Object> ctx = userService.getUserContext(userId, projectSpaceId);
        if (ctx == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ctx);
    }
}
