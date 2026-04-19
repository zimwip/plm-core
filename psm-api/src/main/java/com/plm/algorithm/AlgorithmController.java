package com.plm.algorithm;

import com.plm.algorithm.internal.AlgorithmService;
import com.plm.algorithm.internal.AlgorithmStatsService;
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
    // ACTION WRAPPERS (middleware pipeline)
    // ================================================================

    @GetMapping("/actions/{actionId}/wrappers")
    public ResponseEntity<List<Map<String, Object>>> listActionWrappers(@PathVariable String actionId) {
        return ResponseEntity.ok(algorithmService.listActionWrappers(actionId));
    }

    @PostMapping("/actions/{actionId}/wrappers")
    public ResponseEntity<Map<String, String>> attachActionWrapper(
        @PathVariable String actionId,
        @RequestBody Map<String, Object> body
    ) {
        String id = algorithmService.attachActionWrapper(
            actionId,
            (String) body.get("instanceId"),
            (int) body.getOrDefault("executionOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/actions/{actionId}/wrappers/{wrapperId}")
    public ResponseEntity<Void> detachActionWrapper(
        @PathVariable String actionId,
        @PathVariable String wrapperId
    ) {
        algorithmService.detachActionWrapper(wrapperId);
        return ResponseEntity.noContent().build();
    }

    // ================================================================
    // LIFECYCLE STATE ACTIONS (tier 1 — lifecycle-state level)
    // ================================================================

    @GetMapping("/states/{stateId}/actions")
    public ResponseEntity<List<Map<String, Object>>> listStateActions(@PathVariable String stateId) {
        return ResponseEntity.ok(algorithmService.listStateActions(stateId));
    }

    @PostMapping("/states/{stateId}/actions")
    public ResponseEntity<Map<String, String>> attachStateAction(
        @PathVariable String stateId,
        @RequestBody Map<String, Object> body
    ) {
        String id = algorithmService.attachStateAction(
            stateId,
            (String) body.get("instanceId"),
            (String) body.getOrDefault("trigger", "ON_ENTER"),
            (String) body.getOrDefault("executionMode", "TRANSACTIONAL"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/state-actions/{attachmentId}")
    public ResponseEntity<Void> detachStateAction(@PathVariable String attachmentId) {
        algorithmService.detachStateAction(attachmentId);
        return ResponseEntity.noContent().build();
    }

    // ================================================================
    // NODE-TYPE STATE ACTIONS (tier 2 — per-node-type override)
    // ================================================================

    @GetMapping("/node-types/{nodeTypeId}/states/{stateId}/actions")
    public ResponseEntity<List<Map<String, Object>>> listNodeTypeStateActions(
        @PathVariable String nodeTypeId,
        @PathVariable String stateId
    ) {
        return ResponseEntity.ok(algorithmService.listNodeTypeStateActions(nodeTypeId, stateId));
    }

    @PostMapping("/node-types/{nodeTypeId}/states/{stateId}/actions")
    public ResponseEntity<Map<String, String>> attachNodeTypeStateAction(
        @PathVariable String nodeTypeId,
        @PathVariable String stateId,
        @RequestBody Map<String, Object> body
    ) {
        String id = algorithmService.attachNodeTypeStateAction(
            nodeTypeId,
            stateId,
            (String) body.get("instanceId"),
            (String) body.getOrDefault("trigger", "ON_ENTER"),
            (String) body.getOrDefault("executionMode", "TRANSACTIONAL"),
            (String) body.getOrDefault("overrideAction", "ADD"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/node-type-state-actions/{attachmentId}")
    public ResponseEntity<Void> detachNodeTypeStateAction(@PathVariable String attachmentId) {
        algorithmService.detachNodeTypeStateAction(attachmentId);
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
