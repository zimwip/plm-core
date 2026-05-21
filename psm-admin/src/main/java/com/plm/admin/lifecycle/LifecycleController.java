package com.plm.admin.lifecycle;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/metamodel/lifecycles")
@RequiredArgsConstructor
public class LifecycleController {

    private final LifecycleService lifecycleService;
    private final LifecycleGuardService lifecycleGuardService;

    @GetMapping
    public ResponseEntity<?> getAllLifecycles() {
        return ResponseEntity.ok(lifecycleService.getAllLifecycles());
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createLifecycle(@RequestBody Map<String, String> body) {
        String code = lifecycleService.createLifecycle(body.get("code"), body.get("name"), body.get("description"));
        return ResponseEntity.ok(Map.of("id", code));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Map<String, String>> duplicateLifecycle(@PathVariable String id,
                                                                   @RequestBody Map<String, String> body) {
        String newCode = lifecycleService.duplicateLifecycle(id, body.get("code"), body.get("name"));
        return ResponseEntity.ok(Map.of("id", newCode));
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
        String stateCode = lifecycleService.addState(id,
            (String) body.get("code"),
            (String) body.get("name"),
            Boolean.TRUE.equals(body.get("isInitial")),
            metadata != null ? metadata : Map.of(),
            (int) body.getOrDefault("displayOrder", 0),
            (String) body.get("color"));
        return ResponseEntity.ok(Map.of("id", stateCode));
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
        String transCode = lifecycleService.addTransition(id, body.get("code"), body.get("name"),
            body.get("fromStateId"), body.get("toStateId"),
            body.get("guardExpr"), body.get("actionType"), body.get("versionStrategy"));
        return ResponseEntity.ok(Map.of("id", transCode));
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

    // ── Lifecycle state actions ──

    @GetMapping("/{lcId}/states/{stateId}/actions")
    public ResponseEntity<List<Map<String, Object>>> listStateActions(
            @PathVariable String lcId, @PathVariable String stateId) {
        return ResponseEntity.ok(lifecycleService.listStateActions(stateId));
    }

    @PostMapping("/{lcId}/states/{stateId}/actions")
    public ResponseEntity<Void> attachStateAction(
            @PathVariable String lcId, @PathVariable String stateId,
            @RequestBody Map<String, Object> body) {
        lifecycleService.attachStateAction(stateId,
            (String) body.get("instanceId"),
            (String) body.get("trigger"),
            (String) body.get("executionMode"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{lcId}/states/{stateId}/actions/{instanceId}")
    public ResponseEntity<Void> detachStateAction(
            @PathVariable String lcId, @PathVariable String stateId, @PathVariable String instanceId) {
        lifecycleService.detachStateAction(stateId, instanceId);
        return ResponseEntity.noContent().build();
    }

    // ── Signature requirements ──

    @PostMapping("/transitions/{transId}/signature-requirements")
    public ResponseEntity<?> addSignatureRequirement(@PathVariable String transId,
                                                      @RequestBody Map<String, Object> body) {
        int order = body.get("displayOrder") instanceof Number n ? n.intValue() : 0;
        String roleId = lifecycleService.addSignatureRequirement(transId, (String) body.get("roleId"), order);
        return ResponseEntity.ok(Map.of("roleId", roleId));
    }

    @DeleteMapping("/transitions/{transId}/signature-requirements/{roleId}")
    public ResponseEntity<?> removeSignatureRequirement(@PathVariable String transId,
                                                         @PathVariable String roleId) {
        lifecycleService.removeSignatureRequirement(transId, roleId);
        return ResponseEntity.noContent().build();
    }

    // ── Lifecycle transition guards ──

    @GetMapping("/transitions/{transId}/guards")
    public ResponseEntity<List<Map<String, Object>>> listTransitionGuards(@PathVariable String transId) {
        return ResponseEntity.ok(lifecycleGuardService.listGuards(transId));
    }

    @PostMapping("/transitions/{transId}/guards")
    public ResponseEntity<Void> attachTransitionGuard(
            @PathVariable String transId, @RequestBody Map<String, Object> body) {
        int order = body.get("displayOrder") instanceof Number n ? n.intValue() : 0;
        lifecycleGuardService.attachGuard(transId,
            (String) body.get("instanceId"),
            (String) body.getOrDefault("effect", "BLOCK"),
            order);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/transitions/{transId}/guards/{instanceId}")
    public ResponseEntity<Void> updateTransitionGuard(
            @PathVariable String transId, @PathVariable String instanceId,
            @RequestBody Map<String, Object> body) {
        lifecycleGuardService.updateGuardEffect(transId, instanceId, (String) body.get("effect"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/transitions/{transId}/guards/{instanceId}")
    public ResponseEntity<Void> detachTransitionGuard(
            @PathVariable String transId, @PathVariable String instanceId) {
        lifecycleGuardService.detachGuard(transId, instanceId);
        return ResponseEntity.noContent().build();
    }
}
