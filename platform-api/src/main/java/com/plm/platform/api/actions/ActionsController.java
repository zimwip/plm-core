package com.plm.platform.api.actions;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/actions")
@RequiredArgsConstructor
public class ActionsController {

    private final ActionManagementService actionService;

    @GetMapping("/services")
    public ResponseEntity<List<String>> listServiceCodes() {
        return ResponseEntity.ok(actionService.listServiceCodes());
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listActions(
            @RequestParam(required = false) String serviceCode) {
        return ResponseEntity.ok(actionService.listActions(serviceCode));
    }

    @GetMapping("/{actionId}")
    public ResponseEntity<Map<String, Object>> getAction(@PathVariable String actionId) {
        return ResponseEntity.ok(actionService.getAction(actionId));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createAction(@RequestBody Map<String, Object> body) {
        String id = actionService.createAction(body);
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/{actionId}")
    public ResponseEntity<Void> updateAction(@PathVariable String actionId,
                                             @RequestBody Map<String, Object> body) {
        actionService.updateAction(actionId, body);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{actionId}")
    public ResponseEntity<Void> deleteAction(@PathVariable String actionId) {
        actionService.deleteAction(actionId);
        return ResponseEntity.noContent().build();
    }

    // Parameters

    @GetMapping("/{actionId}/parameters")
    public ResponseEntity<List<Map<String, Object>>> listParameters(@PathVariable String actionId) {
        return ResponseEntity.ok(actionService.listParameters(actionId));
    }

    @PostMapping("/{actionId}/parameters")
    public ResponseEntity<Map<String, String>> addParameter(@PathVariable String actionId,
                                                            @RequestBody Map<String, Object> body) {
        String id = actionService.addParameter(actionId, body);
        return ResponseEntity.ok(Map.of("id", id));
    }

    // Guards

    @GetMapping("/{actionId}/guards")
    public ResponseEntity<List<Map<String, Object>>> listGuards(@PathVariable String actionId) {
        return ResponseEntity.ok(actionService.listActionGuards(actionId));
    }

    @PostMapping("/{actionId}/guards")
    public ResponseEntity<Map<String, String>> attachGuard(@PathVariable String actionId,
                                                           @RequestBody Map<String, Object> body) {
        String id = actionService.attachGuard(actionId,
            (String) body.get("instanceId"),
            (String) body.getOrDefault("effect", "HIDE"),
            (int) body.getOrDefault("displayOrder", 0));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/{actionId}/guards/{guardId}")
    public ResponseEntity<Void> updateGuard(@PathVariable String actionId,
                                            @PathVariable String guardId,
                                            @RequestBody Map<String, Object> body) {
        actionService.updateGuardEffect(guardId, (String) body.get("effect"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{actionId}/guards/{guardId}")
    public ResponseEntity<Void> detachGuard(@PathVariable String actionId,
                                            @PathVariable String guardId) {
        actionService.detachGuard(guardId);
        return ResponseEntity.noContent().build();
    }
}
