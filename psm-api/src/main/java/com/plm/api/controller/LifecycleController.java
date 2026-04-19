package com.plm.api.controller;

import com.plm.domain.algorithm.AlgorithmService;
import com.plm.domain.service.LifecycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/psm/metamodel/lifecycles")
@RequiredArgsConstructor
public class LifecycleController {

    private final LifecycleService lifecycleService;
    private final AlgorithmService algorithmService;

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

    // -- States

    @GetMapping("/{id}/states")
    public ResponseEntity<?> getStates(@PathVariable String id) {
        return ResponseEntity.ok(lifecycleService.getStates(id));
    }

    @PostMapping("/{id}/states")
    public ResponseEntity<?> addState(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> metadata = (Map<String, String>) body.get("metadata");
            String stateId = lifecycleService.addState(id,
                (String) body.get("name"),
                Boolean.TRUE.equals(body.get("isInitial")),
                metadata != null ? metadata : Map.of(),
                (int) body.getOrDefault("displayOrder", 0),
                (String) body.get("color"));
            return ResponseEntity.ok(Map.of("id", stateId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{lcId}/states/{stateId}")
    public ResponseEntity<?> updateState(@PathVariable String lcId, @PathVariable String stateId,
                                          @RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> metadata = (Map<String, String>) body.get("metadata");
            lifecycleService.updateState(stateId,
                (String) body.get("name"),
                Boolean.TRUE.equals(body.get("isInitial")),
                metadata,
                (int) body.getOrDefault("displayOrder", 0),
                (String) body.get("color"));
            return ResponseEntity.ok(Map.of("id", stateId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
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

    // -- State Actions (administrate actions on lifecycle states)

    @GetMapping("/{lcId}/states/{stateId}/actions")
    public ResponseEntity<List<Map<String, Object>>> listStateActions(
        @PathVariable String lcId, @PathVariable String stateId) {
        return ResponseEntity.ok(algorithmService.listStateActions(stateId));
    }

    @PostMapping("/{lcId}/states/{stateId}/actions")
    public ResponseEntity<Map<String, String>> attachStateAction(
        @PathVariable String lcId, @PathVariable String stateId,
        @RequestBody Map<String, Object> body) {
        String actionId = algorithmService.attachStateAction(
            stateId,
            (String) body.get("instanceId"),
            (String) body.getOrDefault("trigger", "ON_ENTER"),
            (String) body.getOrDefault("executionMode", "TRANSACTIONAL"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", actionId));
    }

    @DeleteMapping("/{lcId}/states/{stateId}/actions/{actionId}")
    public ResponseEntity<Void> detachStateAction(
        @PathVariable String lcId, @PathVariable String stateId, @PathVariable String actionId) {
        algorithmService.detachStateAction(actionId);
        return ResponseEntity.noContent().build();
    }

    // -- Transitions

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

    // -- Signature Requirements

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
