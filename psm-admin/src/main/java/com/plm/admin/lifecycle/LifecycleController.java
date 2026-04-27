package com.plm.admin.lifecycle;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin CRUD API for lifecycles, states, transitions, and signature requirements.
 */
@RestController
@RequestMapping("/metamodel/lifecycles")
@RequiredArgsConstructor
public class LifecycleController {

    private final LifecycleService lifecycleService;

    @GetMapping
    public ResponseEntity<?> getAllLifecycles() {
        return ResponseEntity.ok(lifecycleService.getAllLifecycles());
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createLifecycle(@RequestBody Map<String, String> body) {
        String id = lifecycleService.createLifecycle(body.get("name"), body.get("description"));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Map<String, String>> duplicateLifecycle(@PathVariable String id, @RequestBody Map<String, String> body) {
        String newId = lifecycleService.duplicateLifecycle(id, body.get("name"));
        return ResponseEntity.ok(Map.of("id", newId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLifecycle(@PathVariable String id) {
        try {
            lifecycleService.deleteLifecycle(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/states")
    public ResponseEntity<?> getStates(@PathVariable String id) {
        return ResponseEntity.ok(lifecycleService.getStates(id));
    }

    @PostMapping("/{id}/states")
    public ResponseEntity<?> addState(@PathVariable String id, @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        Map<String, String> metadata = (Map<String, String>) body.get("metadata");
        String stateId = lifecycleService.addState(id,
            (String) body.get("name"), Boolean.TRUE.equals(body.get("isInitial")),
            metadata != null ? metadata : Map.of(),
            (int) body.getOrDefault("displayOrder", 0), (String) body.get("color"));
        return ResponseEntity.ok(Map.of("id", stateId));
    }

    @PutMapping("/{lcId}/states/{stateId}")
    public ResponseEntity<?> updateState(@PathVariable String lcId, @PathVariable String stateId,
                                          @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        Map<String, String> metadata = (Map<String, String>) body.get("metadata");
        lifecycleService.updateState(stateId, (String) body.get("name"),
            Boolean.TRUE.equals(body.get("isInitial")), metadata,
            (int) body.getOrDefault("displayOrder", 0), (String) body.get("color"));
        return ResponseEntity.ok(Map.of("id", stateId));
    }

    @DeleteMapping("/{lcId}/states/{stateId}")
    public ResponseEntity<?> deleteState(@PathVariable String lcId, @PathVariable String stateId) {
        try {
            lifecycleService.deleteState(stateId);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/transitions")
    public ResponseEntity<?> getTransitions(@PathVariable String id) {
        return ResponseEntity.ok(lifecycleService.getTransitions(id));
    }

    @PostMapping("/{id}/transitions")
    public ResponseEntity<Map<String, String>> addTransition(@PathVariable String id,
                                                              @RequestBody Map<String, String> body) {
        String transId = lifecycleService.addTransition(id, body.get("name"),
            body.get("fromStateId"), body.get("toStateId"),
            body.get("guardExpr"), body.get("actionType"), body.get("versionStrategy"));
        return ResponseEntity.ok(Map.of("id", transId));
    }

    @PutMapping("/{lcId}/transitions/{transId}")
    public ResponseEntity<?> updateTransition(@PathVariable String lcId, @PathVariable String transId,
                                               @RequestBody Map<String, String> body) {
        lifecycleService.updateTransition(transId, body.get("name"),
            body.get("fromStateId"), body.get("toStateId"),
            body.get("guardExpr"), body.get("actionType"), body.get("versionStrategy"));
        return ResponseEntity.ok(Map.of("id", transId));
    }

    @DeleteMapping("/{lcId}/transitions/{transId}")
    public ResponseEntity<?> deleteTransition(@PathVariable String lcId, @PathVariable String transId) {
        lifecycleService.deleteTransition(transId);
        return ResponseEntity.noContent().build();
    }

    // ── Lifecycle state actions (tier 1 — lifecycle_state_action) ──

    @GetMapping("/{lcId}/states/{stateId}/actions")
    public ResponseEntity<List<Map<String, Object>>> listStateActions(
            @PathVariable String lcId, @PathVariable String stateId) {
        return ResponseEntity.ok(lifecycleService.listStateActions(stateId));
    }

    @PostMapping("/{lcId}/states/{stateId}/actions")
    public ResponseEntity<Map<String, String>> attachStateAction(
            @PathVariable String lcId, @PathVariable String stateId,
            @RequestBody Map<String, Object> body) {
        String id = lifecycleService.attachStateAction(stateId,
            (String) body.get("instanceId"),
            (String) body.get("trigger"),
            (String) body.get("executionMode"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/{lcId}/states/{stateId}/actions/{actionId}")
    public ResponseEntity<Void> detachStateAction(
            @PathVariable String lcId, @PathVariable String stateId, @PathVariable String actionId) {
        lifecycleService.detachStateAction(actionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transitions/{transId}/signature-requirements")
    public ResponseEntity<?> addSignatureRequirement(@PathVariable String transId,
                                                      @RequestBody Map<String, Object> body) {
        int order = body.get("displayOrder") instanceof Number n ? n.intValue() : 0;
        String id = lifecycleService.addSignatureRequirement(transId, (String) body.get("roleId"), order);
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/transitions/{transId}/signature-requirements/{reqId}")
    public ResponseEntity<?> removeSignatureRequirement(@PathVariable String transId, @PathVariable String reqId) {
        lifecycleService.removeSignatureRequirement(reqId);
        return ResponseEntity.noContent().build();
    }
}
