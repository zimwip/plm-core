package com.pno.api.controller;

import com.pno.domain.service.PnoEventPublisher;
import com.pno.domain.service.UserService;
import com.pno.infrastructure.security.PnoSecurityContext;
import com.pno.infrastructure.security.PnoUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PnoEventPublisher eventPublisher;

    @GetMapping
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(userService.listUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUser(@PathVariable String userId) {
        var user = userService.getUser(userId);
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody Map<String, Object> body) {
        String displayName = (String) body.get("displayName");
        String email       = (String) body.get("email");
        userService.updateUser(userId, displayName, email);
        eventPublisher.userChanged("UPDATED", userId, currentUserId());
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> body) {
        String username    = (String) body.get("username");
        String displayName = (String) body.get("displayName");
        String email       = (String) body.get("email");
        var user = userService.createUser(username, displayName, email);
        eventPublisher.userChanged("CREATED", (String) user.get("id"), currentUserId());
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deactivateUser(@PathVariable String userId) {
        userService.deactivateUser(userId);
        eventPublisher.userChanged("DEACTIVATED", userId, currentUserId());
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
        eventPublisher.userChanged("ROLE_ASSIGNED", userId, currentUserId());
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
        eventPublisher.userChanged("ROLE_REMOVED", userId, currentUserId());
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
        eventPublisher.userChanged("ADMIN_CHANGED", userId, currentUserId());
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    /**
     * Sets the user's default project space. The gateway (spe) reads it at login
     * to pick the active project space bound to the issued token.
     * Admin-only. Returns the updated value; 400 if the project space does not exist.
     */
    @PutMapping("/{userId}/default-space")
    public ResponseEntity<?> setDefaultProjectSpace(@PathVariable String userId,
                                                    @RequestBody Map<String, Object> body) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Default project space can only be set by an admin"));
        }
        String projectSpaceId = (String) body.get("projectSpaceId");
        if (projectSpaceId == null || projectSpaceId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "projectSpaceId required"));
        }
        try {
            String updated = userService.setDefaultProjectSpace(userId, projectSpaceId);
            eventPublisher.userChanged("DEFAULT_SPACE_CHANGED", userId, currentUserId());
            return ResponseEntity.ok(Map.of("defaultProjectSpaceId", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private boolean isAdmin() {
        PnoUserContext ctx = PnoSecurityContext.get();
        return ctx != null && ctx.isAdmin();
    }

    private String currentUserId() {
        var ctx = PnoSecurityContext.get();
        return ctx != null ? ctx.getUserId() : "unknown";
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
