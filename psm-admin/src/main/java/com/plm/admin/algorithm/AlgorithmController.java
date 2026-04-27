package com.plm.admin.algorithm;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin CRUD API for algorithms, instances, guards, wrappers, and state actions.
 */
@RestController
@RequestMapping("/algorithms")
@RequiredArgsConstructor
public class AlgorithmController {

    private final AlgorithmService algorithmService;

    @GetMapping("/types")
    public ResponseEntity<List<Map<String, Object>>> listTypes() {
        return ResponseEntity.ok(algorithmService.listAlgorithmTypes());
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listAlgorithms() {
        return ResponseEntity.ok(algorithmService.listAlgorithms());
    }

    @GetMapping("/by-type/{typeId}")
    public ResponseEntity<List<Map<String, Object>>> listByType(@PathVariable String typeId) {
        return ResponseEntity.ok(algorithmService.listAlgorithmsByType(typeId));
    }

    @GetMapping("/{algorithmId}/parameters")
    public ResponseEntity<List<Map<String, Object>>> listParameters(@PathVariable String algorithmId) {
        return ResponseEntity.ok(algorithmService.listParameters(algorithmId));
    }

    @GetMapping("/instances")
    public ResponseEntity<List<Map<String, Object>>> listAllInstances() {
        return ResponseEntity.ok(algorithmService.listAllInstances());
    }

    @GetMapping("/{algorithmId}/instances")
    public ResponseEntity<List<Map<String, Object>>> listInstances(@PathVariable String algorithmId) {
        return ResponseEntity.ok(algorithmService.listInstances(algorithmId));
    }

    @PostMapping("/instances")
    public ResponseEntity<Map<String, String>> createInstance(@RequestBody Map<String, String> body) {
        String id = algorithmService.createInstance(body.get("algorithmId"), body.get("name"));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/instances/{instanceId}")
    public ResponseEntity<Void> updateInstance(@PathVariable String instanceId, @RequestBody Map<String, String> body) {
        algorithmService.updateInstance(instanceId, body.get("name"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/instances/{instanceId}")
    public ResponseEntity<Void> deleteInstance(@PathVariable String instanceId) {
        algorithmService.deleteInstance(instanceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/instances/{instanceId}/params")
    public ResponseEntity<List<Map<String, Object>>> getInstanceParams(@PathVariable String instanceId) {
        return ResponseEntity.ok(algorithmService.getInstanceParamValues(instanceId));
    }

    @PutMapping("/instances/{instanceId}/params/{parameterId}")
    public ResponseEntity<Void> setInstanceParam(
        @PathVariable String instanceId, @PathVariable String parameterId,
        @RequestBody Map<String, String> body) {
        algorithmService.setInstanceParamValue(instanceId, parameterId, body.get("value"));
        return ResponseEntity.ok().build();
    }

    // Guards, wrappers, state actions
    @GetMapping("/actions/{actionId}/guards")
    public ResponseEntity<List<Map<String, Object>>> listActionGuards(@PathVariable String actionId) {
        return ResponseEntity.ok(algorithmService.listActionGuards(actionId));
    }

    @PostMapping("/actions/{actionId}/guards")
    public ResponseEntity<Map<String, String>> attachActionGuard(
        @PathVariable String actionId, @RequestBody Map<String, Object> body) {
        String id = algorithmService.attachActionGuard(actionId,
            (String) body.get("instanceId"), (String) body.getOrDefault("effect", "HIDE"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/actions/{actionId}/guards/{guardId}")
    public ResponseEntity<Void> updateActionGuard(
            @PathVariable String actionId, @PathVariable String guardId,
            @RequestBody Map<String, Object> body) {
        algorithmService.updateActionGuardEffect(guardId, (String) body.get("effect"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/actions/{actionId}/guards/{guardId}")
    public ResponseEntity<Void> detachActionGuard(@PathVariable String actionId, @PathVariable String guardId) {
        algorithmService.detachActionGuard(guardId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/actions/{actionId}/wrappers")
    public ResponseEntity<List<Map<String, Object>>> listActionWrappers(@PathVariable String actionId) {
        return ResponseEntity.ok(algorithmService.listActionWrappers(actionId));
    }

    @PostMapping("/actions/{actionId}/wrappers")
    public ResponseEntity<Map<String, String>> attachActionWrapper(
        @PathVariable String actionId, @RequestBody Map<String, Object> body) {
        String id = algorithmService.attachActionWrapper(actionId,
            (String) body.get("instanceId"), (int) body.getOrDefault("executionOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/actions/{actionId}/wrappers/{wrapperId}")
    public ResponseEntity<Void> detachActionWrapper(@PathVariable String actionId, @PathVariable String wrapperId) {
        algorithmService.detachActionWrapper(wrapperId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<List<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(algorithmService.getStats());
    }

    @DeleteMapping("/stats")
    public ResponseEntity<Void> resetStats() {
        algorithmService.resetStats();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/timeseries")
    public ResponseEntity<List<Map<String, Object>>> getStatsTimeseries(
            @RequestParam(defaultValue = "24") int hours) {
        return ResponseEntity.ok(algorithmService.getStatsTimeseries(hours));
    }

    // ── Lifecycle-transition guards ──

    @GetMapping("/transitions/{transitionId}/guards")
    public ResponseEntity<List<Map<String, Object>>> listTransitionGuards(@PathVariable String transitionId) {
        return ResponseEntity.ok(algorithmService.listTransitionGuards(transitionId));
    }

    @PostMapping("/transitions/{transitionId}/guards")
    public ResponseEntity<Map<String, String>> attachTransitionGuard(
            @PathVariable String transitionId, @RequestBody Map<String, Object> body) {
        String id = algorithmService.attachTransitionGuard(transitionId,
            (String) body.get("instanceId"),
            (String) body.getOrDefault("effect", "HIDE"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/transitions/guards/{guardId}")
    public ResponseEntity<Void> updateTransitionGuard(
            @PathVariable String guardId, @RequestBody Map<String, Object> body) {
        algorithmService.updateTransitionGuardEffect(guardId, (String) body.get("effect"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/transitions/guards/{guardId}")
    public ResponseEntity<Void> detachTransitionGuard(@PathVariable String guardId) {
        algorithmService.detachTransitionGuard(guardId);
        return ResponseEntity.noContent().build();
    }

    // ── Node-action guards ──

    @GetMapping("/node-actions/{nodeTypeId}/{actionCode}/guards")
    public ResponseEntity<List<Map<String, Object>>> listNodeActionGuards(
            @PathVariable String nodeTypeId, @PathVariable String actionCode,
            @RequestParam(required = false) String transitionId) {
        return ResponseEntity.ok(algorithmService.listNodeActionGuards(nodeTypeId, actionCode, transitionId));
    }

    @PostMapping("/node-actions/{nodeTypeId}/{actionCode}/guards")
    public ResponseEntity<Map<String, String>> attachNodeActionGuard(
            @PathVariable String nodeTypeId, @PathVariable String actionCode,
            @RequestBody Map<String, Object> body) {
        String id = algorithmService.attachNodeActionGuard(nodeTypeId, actionCode,
            (String) body.get("transitionId"),
            (String) body.get("instanceId"),
            (String) body.getOrDefault("effect", "HIDE"),
            (String) body.getOrDefault("overrideAction", "ADD"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/node-actions/guards/{guardId}")
    public ResponseEntity<Void> updateNodeActionGuard(
            @PathVariable String guardId, @RequestBody Map<String, Object> body) {
        algorithmService.updateNodeActionGuardEffect(guardId, (String) body.get("effect"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/node-actions/guards/{guardId}")
    public ResponseEntity<Void> detachNodeActionGuard(@PathVariable String guardId) {
        algorithmService.detachNodeActionGuard(guardId);
        return ResponseEntity.noContent().build();
    }

    // ── Node-type × lifecycle-state action overrides (tier 2) ──

    @GetMapping("/node-types/{nodeTypeId}/states/{stateId}/actions")
    public ResponseEntity<List<Map<String, Object>>> listNodeTypeStateActions(
            @PathVariable String nodeTypeId, @PathVariable String stateId) {
        return ResponseEntity.ok(algorithmService.listNodeTypeStateActions(nodeTypeId, stateId));
    }

    @PostMapping("/node-types/{nodeTypeId}/states/{stateId}/actions")
    public ResponseEntity<Map<String, String>> attachNodeTypeStateAction(
            @PathVariable String nodeTypeId, @PathVariable String stateId,
            @RequestBody Map<String, Object> body) {
        String id = algorithmService.attachNodeTypeStateAction(nodeTypeId, stateId,
            (String) body.get("instanceId"),
            (String) body.get("trigger"),
            (String) body.get("executionMode"),
            (String) body.get("overrideAction"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/node-type-state-actions/{attachmentId}")
    public ResponseEntity<Void> detachNodeTypeStateAction(@PathVariable String attachmentId) {
        algorithmService.detachNodeTypeStateAction(attachmentId);
        return ResponseEntity.noContent().build();
    }
}
