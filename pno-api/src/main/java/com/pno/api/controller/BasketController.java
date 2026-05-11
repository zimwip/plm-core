package com.pno.api.controller;

import com.pno.domain.service.BasketService;
import com.pno.infrastructure.event.BasketPublisher;
import com.pno.infrastructure.security.PnoSecurityContext;
import com.pno.infrastructure.security.PnoUserContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/users/{userId}/basket")
@RequiredArgsConstructor
public class BasketController {

    private final BasketService basketService;
    private final BasketPublisher basketPublisher;

    @GetMapping
    public ResponseEntity<?> list(
        @PathVariable String userId,
        HttpServletRequest request
    ) {
        requireSelfOrAdmin(userId);
        return ResponseEntity.ok(basketService.list(userId, psId(request)));
    }

    @PutMapping("/{source}/{typeCode}/{itemId}")
    public ResponseEntity<?> add(
        @PathVariable String userId,
        @PathVariable String source,
        @PathVariable String typeCode,
        @PathVariable String itemId,
        HttpServletRequest request
    ) {
        requireSelfOrAdmin(userId);
        String psId = psId(request);
        boolean added = basketService.add(userId, psId, source, typeCode, itemId);
        if (added) basketPublisher.itemAdded(userId, psId, source + ":" + typeCode, itemId);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @DeleteMapping("/{source}/{typeCode}/{itemId}")
    public ResponseEntity<?> remove(
        @PathVariable String userId,
        @PathVariable String source,
        @PathVariable String typeCode,
        @PathVariable String itemId,
        HttpServletRequest request
    ) {
        requireSelfOrAdmin(userId);
        String psId = psId(request);
        basketService.remove(userId, psId, source, typeCode, itemId);
        basketPublisher.itemRemoved(userId, psId, source + ":" + typeCode, itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<?> clear(
        @PathVariable String userId,
        HttpServletRequest request
    ) {
        requireSelfOrAdmin(userId);
        String psId = psId(request);
        basketService.clear(userId, psId);
        basketPublisher.cleared(userId, psId);
        return ResponseEntity.noContent().build();
    }

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
