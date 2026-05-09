package com.plm.platform.api.actions;

import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/algorithms")
@RequiredArgsConstructor
public class AlgorithmManagementController {

    private final AlgorithmManagementService algorithmService;
    private final ActionManagementService actionService;
    private final DSLContext dsl;

    @GetMapping("/types")
    public ResponseEntity<List<Map<String, Object>>> listTypes(
            @RequestParam(required = false) String serviceCode) {
        return ResponseEntity.ok(algorithmService.listAlgorithmTypes(serviceCode));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listAlgorithms(
            @RequestParam(required = false) String serviceCode) {
        return ResponseEntity.ok(algorithmService.listAlgorithms(serviceCode));
    }

    @GetMapping("/services")
    public ResponseEntity<List<String>> listServiceCodes() {
        List<String> codes = dsl.fetch("SELECT DISTINCT service_code FROM algorithm_type ORDER BY service_code")
            .getValues("service_code", String.class);
        return ResponseEntity.ok(codes);
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
    public ResponseEntity<List<Map<String, Object>>> listAllInstances(
            @RequestParam(required = false) String serviceCode) {
        return ResponseEntity.ok(algorithmService.listAllInstances(serviceCode));
    }

    @GetMapping("/{algorithmId}/instances")
    public ResponseEntity<List<Map<String, Object>>> listInstances(@PathVariable String algorithmId) {
        return ResponseEntity.ok(algorithmService.listInstances(algorithmId));
    }

    @PostMapping("/instances")
    public ResponseEntity<Map<String, String>> createInstance(@RequestBody Map<String, Object> body) {
        String id = algorithmService.createInstance(
            (String) body.get("algorithmId"),
            (String) body.get("name"),
            (String) body.get("serviceCode"));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/instances/{instanceId}")
    public ResponseEntity<Void> updateInstance(@PathVariable String instanceId,
                                               @RequestBody Map<String, String> body) {
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
    public ResponseEntity<Void> setInstanceParam(@PathVariable String instanceId,
                                                  @PathVariable String parameterId,
                                                  @RequestBody Map<String, String> body) {
        algorithmService.setInstanceParamValue(instanceId, parameterId, body.get("value"));
        return ResponseEntity.ok().build();
    }

    // Wrappers

    @GetMapping("/actions/{actionId}/wrappers")
    public ResponseEntity<List<Map<String, Object>>> listActionWrappers(@PathVariable String actionId) {
        return ResponseEntity.ok(algorithmService.listActionWrappers(actionId));
    }

    @PostMapping("/actions/{actionId}/wrappers")
    public ResponseEntity<Map<String, String>> attachActionWrapper(@PathVariable String actionId,
                                                                    @RequestBody Map<String, Object> body) {
        String id = algorithmService.attachActionWrapper(actionId,
            (String) body.get("instanceId"),
            (int) body.getOrDefault("executionOrder", 0),
            (String) body.get("serviceCode"));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/actions/{actionId}/wrappers/{wrapperId}")
    public ResponseEntity<Void> detachActionWrapper(@PathVariable String actionId,
                                                     @PathVariable String wrapperId) {
        algorithmService.detachActionWrapper(wrapperId);
        return ResponseEntity.noContent().build();
    }

    // Lifecycle-transition guards

    @GetMapping("/transitions/{transitionId}/guards")
    public ResponseEntity<List<Map<String, Object>>> listTransitionGuards(
            @PathVariable String transitionId,
            @RequestParam(required = false) String serviceCode) {
        return ResponseEntity.ok(algorithmService.listTransitionGuards(transitionId, serviceCode));
    }

    @PostMapping("/transitions/{transitionId}/guards")
    public ResponseEntity<Map<String, String>> attachTransitionGuard(
            @PathVariable String transitionId, @RequestBody Map<String, Object> body) {
        String id = algorithmService.attachTransitionGuard(transitionId,
            (String) body.get("instanceId"),
            (String) body.getOrDefault("effect", "HIDE"),
            (int) body.getOrDefault("displayOrder", 0),
            (String) body.get("serviceCode"));
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

    // Guards (delegated to ActionManagementService since action_guard table is owned there)

    @GetMapping("/actions/{actionId}/guards")
    public ResponseEntity<List<Map<String, Object>>> listActionGuards(@PathVariable String actionId) {
        return ResponseEntity.ok(actionService.listActionGuards(actionId));
    }

    @PostMapping("/actions/{actionId}/guards")
    public ResponseEntity<Map<String, String>> attachActionGuard(@PathVariable String actionId,
                                                                  @RequestBody Map<String, Object> body) {
        String id = actionService.attachGuard(actionId,
            (String) body.get("instanceId"),
            (String) body.getOrDefault("effect", "HIDE"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/actions/{actionId}/guards/{guardId}")
    public ResponseEntity<Void> updateActionGuard(@PathVariable String actionId,
                                                   @PathVariable String guardId,
                                                   @RequestBody Map<String, Object> body) {
        actionService.updateGuardEffect(guardId, (String) body.get("effect"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/actions/{actionId}/guards/{guardId}")
    public ResponseEntity<Void> detachActionGuard(@PathVariable String actionId,
                                                   @PathVariable String guardId) {
        actionService.detachGuard(guardId);
        return ResponseEntity.noContent().build();
    }

    // Stats

    @GetMapping("/stats")
    public ResponseEntity<List<Map<String, Object>>> getStats(
            @RequestParam(required = false) String serviceCode) {
        return ResponseEntity.ok(algorithmService.getStats(serviceCode));
    }

    @GetMapping("/stats/timeseries")
    public ResponseEntity<List<Map<String, Object>>> getTimeseries(
            @RequestParam(required = false) String serviceCode,
            @RequestParam(defaultValue = "24") int hours) {
        return ResponseEntity.ok(algorithmService.getTimeseries(serviceCode, hours));
    }

    @DeleteMapping("/stats")
    public ResponseEntity<Void> resetStats(
            @RequestParam(required = false) String serviceCode) {
        algorithmService.resetStats(serviceCode);
        return ResponseEntity.noContent().build();
    }
}
