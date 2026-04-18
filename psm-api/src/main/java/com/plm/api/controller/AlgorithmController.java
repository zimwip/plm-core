package com.plm.api.controller;

import com.plm.domain.algorithm.AlgorithmService;
import com.plm.domain.algorithm.AlgorithmStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API for the Algorithm & Guard system.
 *
 * Provides CRUD for algorithm instances, parameter values,
 * and guard attachments (action-level and NTA-level).
 *
 * Read endpoints are open to all authenticated users.
 * Write endpoints require MANAGE_METAMODEL permission (enforced via @PlmAction on AlgorithmService).
 */
@RestController
@RequestMapping("/api/psm/algorithms")
@RequiredArgsConstructor
public class AlgorithmController {

    private final AlgorithmService      algorithmService;
    private final AlgorithmStatsService statsService;

    // ================================================================
    // ALGORITHM TYPES
    // ================================================================

    @GetMapping("/types")
    public ResponseEntity<List<Map<String, Object>>> listTypes() {
        return ResponseEntity.ok(algorithmService.listAlgorithmTypes());
    }

    // ================================================================
    // ALGORITHMS
    // ================================================================

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

    // ================================================================
    // ALGORITHM INSTANCES
    // ================================================================

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
    public ResponseEntity<Void> updateInstance(
        @PathVariable String instanceId,
        @RequestBody Map<String, String> body
    ) {
        algorithmService.updateInstance(instanceId, body.get("name"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/instances/{instanceId}")
    public ResponseEntity<Void> deleteInstance(@PathVariable String instanceId) {
        algorithmService.deleteInstance(instanceId);
        return ResponseEntity.noContent().build();
    }

    // ================================================================
    // INSTANCE PARAMETER VALUES
    // ================================================================

    @GetMapping("/instances/{instanceId}/params")
    public ResponseEntity<List<Map<String, Object>>> getInstanceParams(@PathVariable String instanceId) {
        return ResponseEntity.ok(algorithmService.getInstanceParamValues(instanceId));
    }

    @PutMapping("/instances/{instanceId}/params/{parameterId}")
    public ResponseEntity<Void> setInstanceParam(
        @PathVariable String instanceId,
        @PathVariable String parameterId,
        @RequestBody Map<String, String> body
    ) {
        algorithmService.setInstanceParamValue(instanceId, parameterId, body.get("value"));
        return ResponseEntity.ok().build();
    }

    // ================================================================
    // ACTION GUARDS (global level)
    // ================================================================

    @GetMapping("/actions/{actionId}/guards")
    public ResponseEntity<List<Map<String, Object>>> listActionGuards(@PathVariable String actionId) {
        return ResponseEntity.ok(algorithmService.listActionGuards(actionId));
    }

    @PostMapping("/actions/{actionId}/guards")
    public ResponseEntity<Map<String, String>> attachActionGuard(
        @PathVariable String actionId,
        @RequestBody Map<String, Object> body
    ) {
        String id = algorithmService.attachActionGuard(
            actionId,
            (String) body.get("instanceId"),
            (String) body.getOrDefault("effect", "HIDE"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/actions/{actionId}/guards/{guardId}")
    public ResponseEntity<Void> detachActionGuard(
        @PathVariable String actionId,
        @PathVariable String guardId
    ) {
        algorithmService.detachActionGuard(guardId);
        return ResponseEntity.noContent().build();
    }

    // ================================================================
    // LIFECYCLE-TRANSITION GUARDS (shared across node_types of the lifecycle)
    // ================================================================

    @GetMapping("/transitions/{transitionId}/guards")
    public ResponseEntity<List<Map<String, Object>>> listTransitionGuards(@PathVariable String transitionId) {
        return ResponseEntity.ok(algorithmService.listTransitionGuards(transitionId));
    }

    @PostMapping("/transitions/{transitionId}/guards")
    public ResponseEntity<Map<String, String>> attachTransitionGuard(
        @PathVariable String transitionId,
        @RequestBody Map<String, Object> body
    ) {
        String id = algorithmService.attachTransitionGuard(
            transitionId,
            (String) body.get("instanceId"),
            (String) body.getOrDefault("effect", "HIDE"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/transitions/guards/{guardId}")
    public ResponseEntity<Void> detachTransitionGuard(@PathVariable String guardId) {
        algorithmService.detachTransitionGuard(guardId);
        return ResponseEntity.noContent().build();
    }

    // ================================================================
    // NODE-ACTION GUARDS (per node_type × action × transition, inherit + override)
    // ================================================================

    @GetMapping("/node-actions/{nodeTypeId}/{actionCode}/guards")
    public ResponseEntity<List<Map<String, Object>>> listNodeActionGuards(
        @PathVariable String nodeTypeId,
        @PathVariable String actionCode,
        @RequestParam(required = false) String transitionId
    ) {
        return ResponseEntity.ok(algorithmService.listNodeActionGuards(nodeTypeId, actionCode, transitionId));
    }

    @PostMapping("/node-actions/{nodeTypeId}/{actionCode}/guards")
    public ResponseEntity<Map<String, String>> attachNodeActionGuard(
        @PathVariable String nodeTypeId,
        @PathVariable String actionCode,
        @RequestBody Map<String, Object> body
    ) {
        String id = algorithmService.attachNodeActionGuard(
            nodeTypeId,
            actionCode,
            (String) body.get("transitionId"),
            (String) body.get("instanceId"),
            (String) body.getOrDefault("effect", "HIDE"),
            (String) body.getOrDefault("overrideAction", "ADD"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/node-actions/guards/{guardId}")
    public ResponseEntity<Void> detachNodeActionGuard(@PathVariable String guardId) {
        algorithmService.detachNodeActionGuard(guardId);
        return ResponseEntity.noContent().build();
    }

    // ================================================================
    // EXECUTION STATISTICS
    // ================================================================

    /**
     * Returns per-algorithm execution stats (DB + in-memory merged).
     * Includes callCount, minMs, avgMs, maxMs, totalMs, lastFlushed, pendingFlush.
     */
    @GetMapping("/stats")
    public ResponseEntity<List<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(statsService.getPersistedStats());
    }

    /** Resets all algorithm execution stats (both in-memory and DB). */
    @DeleteMapping("/stats")
    public ResponseEntity<Void> resetStats() {
        statsService.resetAll();
        return ResponseEntity.noContent().build();
    }
}
