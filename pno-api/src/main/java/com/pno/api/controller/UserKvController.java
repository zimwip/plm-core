package com.pno.api.controller;

import com.pno.domain.service.UserKvService;
import com.pno.infrastructure.security.PnoSecurityContext;
import com.pno.infrastructure.security.PnoUserContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * REST API for the per-user key/value store.
 *
 * <p>URL pattern: {@code /users/{userId}/kv/{group}/…}
 * Project space is read from {@code X-PLM-ProjectSpace} header.
 * If the header is absent or blank, psId defaults to {@code ""} (user-global scope).
 *
 * <p>A user may only access their own KV; admins may access any user's KV.
 */
@RestController
@RequestMapping("/users/{userId}/kv/{group}")
@RequiredArgsConstructor
public class UserKvController {

    private final UserKvService kvService;

    /** Lists all key/value pairs in a group. */
    @GetMapping
    public ResponseEntity<?> listGroup(
        @PathVariable String userId,
        @PathVariable String group,
        HttpServletRequest request
    ) {
        requireSelfOrAdmin(userId);
        String psId = psId(request);
        return ResponseEntity.ok(kvService.listGroup(userId, psId, group));
    }

    /** Adds a set entry for a key (no-op if already present). */
    @PutMapping("/{key}/{value}")
    public ResponseEntity<?> put(
        @PathVariable String userId,
        @PathVariable String group,
        @PathVariable String key,
        @PathVariable String value,
        HttpServletRequest request
    ) {
        requireSelfOrAdmin(userId);
        String psId = psId(request);
        kvService.put(userId, psId, group, key, value);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    /** Removes one specific set entry. */
    @DeleteMapping("/{key}/{value}")
    public ResponseEntity<?> delete(
        @PathVariable String userId,
        @PathVariable String group,
        @PathVariable String key,
        @PathVariable String value,
        HttpServletRequest request
    ) {
        requireSelfOrAdmin(userId);
        String psId = psId(request);
        kvService.delete(userId, psId, group, key, value);
        return ResponseEntity.noContent().build();
    }

    /** Removes all entries in a group (empty basket). */
    @DeleteMapping
    public ResponseEntity<?> deleteGroup(
        @PathVariable String userId,
        @PathVariable String group,
        HttpServletRequest request
    ) {
        requireSelfOrAdmin(userId);
        String psId = psId(request);
        kvService.deleteGroup(userId, psId, group);
        return ResponseEntity.noContent().build();
    }

    /** Gets a single-value entry (e.g. theme preference). */
    @GetMapping("/single/{key}")
    public ResponseEntity<?> getSingle(
        @PathVariable String userId,
        @PathVariable String group,
        @PathVariable String key,
        HttpServletRequest request
    ) {
        requireSelfOrAdmin(userId);
        return kvService.getSingleValue(userId, psId(request), group, key)
            .map(v -> ResponseEntity.<Object>ok(Map.of("key", key, "value", v)))
            .orElseGet(() -> {
                java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
                body.put("key", key);
                body.put("value", null);
                return ResponseEntity.ok(body);
            });
    }

    /** Sets a single-value entry, replacing any previous value for the same key. */
    @PutMapping("/single/{key}/{value}")
    public ResponseEntity<?> setSingle(
        @PathVariable String userId,
        @PathVariable String group,
        @PathVariable String key,
        @PathVariable String value,
        HttpServletRequest request
    ) {
        requireSelfOrAdmin(userId);
        kvService.setSingleValue(userId, psId(request), group, key, value);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // -------------------------------------------------------

    /** Extracts project-space id from request header; empty string = user-global scope. */
    private static String psId(HttpServletRequest request) {
        String h = request.getHeader("X-PLM-ProjectSpace");
        return (h != null && !h.isBlank()) ? h : "";
    }

    private static void requireSelfOrAdmin(String userId) {
        PnoUserContext ctx = PnoSecurityContext.get();
        if (!ctx.isAdmin() && !ctx.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}
