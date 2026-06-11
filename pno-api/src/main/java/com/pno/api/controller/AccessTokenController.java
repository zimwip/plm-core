package com.pno.api.controller;

import com.pno.domain.service.AccessTokenService;
import com.pno.infrastructure.security.PnoSecurityContext;
import com.pno.infrastructure.security.PnoUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Personal access tokens (app passwords) for WebDAV-style Basic auth.
 * Users manage their own tokens; admins can manage anyone's.
 */
@RestController
@RequestMapping("/users/{userId}/tokens")
@RequiredArgsConstructor
public class AccessTokenController {

    private final AccessTokenService tokenService;

    @PostMapping
    public ResponseEntity<?> create(@PathVariable String userId,
                                    @RequestBody(required = false) Map<String, Object> body) {
        if (!selfOrAdmin(userId)) return forbidden();
        String label = body != null ? (String) body.get("label") : null;
        Integer ttlDays = body != null && body.get("ttlDays") instanceof Number n ? n.intValue() : null;
        return ResponseEntity.ok(tokenService.create(userId, label, ttlDays));
    }

    @GetMapping
    public ResponseEntity<?> list(@PathVariable String userId) {
        if (!selfOrAdmin(userId)) return forbidden();
        return ResponseEntity.ok(tokenService.list(userId));
    }

    @DeleteMapping("/{tokenId}")
    public ResponseEntity<?> revoke(@PathVariable String userId, @PathVariable String tokenId) {
        if (!selfOrAdmin(userId)) return forbidden();
        return tokenService.revoke(userId, tokenId)
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }

    private static boolean selfOrAdmin(String userId) {
        PnoUserContext ctx = PnoSecurityContext.get();
        return ctx != null && (ctx.isAdmin() || userId.equals(ctx.getUserId()));
    }

    private static ResponseEntity<?> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "Tokens can only be managed by their owner or an admin"));
    }
}
