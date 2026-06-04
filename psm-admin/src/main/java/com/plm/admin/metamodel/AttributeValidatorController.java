package com.plm.admin.metamodel;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Admin endpoints for the generic attribute-validation feature.
 * Relative paths only — the {@code /api/psa} prefix is auto-applied by platform-lib.
 */
@RestController
@RequestMapping("/metamodel/attributes")
@RequiredArgsConstructor
public class AttributeValidatorController {

    private final AttributeValidatorAdminService service;

    // -- Validator attachments

    @GetMapping("/{attrDefId}/validators")
    public ResponseEntity<Map<String, String>> listValidators(
        @PathVariable String attrDefId, @RequestParam String nodeTypeId) {
        return ResponseEntity.ok(service.list(nodeTypeId, attrDefId));
    }

    @PostMapping("/{attrDefId}/validators")
    public ResponseEntity<Map<String, String>> attachValidator(
        @PathVariable String attrDefId, @RequestBody Map<String, String> body) {
        service.attach(
            body.get("nodeTypeId"), attrDefId,
            body.get("stateId"), body.get("instanceId"), body.get("effect"));
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @DeleteMapping("/{attrDefId}/validators")
    public ResponseEntity<Map<String, String>> detachValidator(
        @PathVariable String attrDefId,
        @RequestParam(required = false) String nodeTypeId,
        @RequestParam(required = false) String stateId,
        @RequestParam(required = false) String instanceId,
        @RequestBody(required = false) Map<String, String> body) {
        if (body != null) {
            if (nodeTypeId == null) nodeTypeId = body.get("nodeTypeId");
            if (stateId == null)    stateId    = body.get("stateId");
            if (instanceId == null) instanceId = body.get("instanceId");
        }
        service.detach(nodeTypeId, attrDefId, stateId, instanceId);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // -- Generic per-attribute metadata (key/value)

    @GetMapping("/{attrDefId}/metadata")
    public ResponseEntity<Map<String, String>> listMetadata(@PathVariable String attrDefId) {
        return ResponseEntity.ok(service.metadata(attrDefId));
    }

    @PutMapping("/{attrDefId}/metadata/{key}")
    public ResponseEntity<Map<String, String>> setMetadata(
        @PathVariable String attrDefId, @PathVariable String key, @RequestBody Map<String, String> body) {
        service.setMetadata(attrDefId, key, body.get("value"));
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @DeleteMapping("/{attrDefId}/metadata/{key}")
    public ResponseEntity<Map<String, String>> removeMetadata(
        @PathVariable String attrDefId, @PathVariable String key) {
        service.removeMetadata(attrDefId, key);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // -- Per-attribute regex

    @GetMapping("/{attrDefId}/regex")
    public ResponseEntity<Map<String, String>> getRegex(
        @PathVariable String attrDefId,
        @RequestParam(required = false) String nodeTypeId) {
        Map<String, String> result = new HashMap<>();
        result.put("regex", service.getRegex(attrDefId));
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{attrDefId}/regex")
    public ResponseEntity<Map<String, String>> setRegex(
        @PathVariable String attrDefId, @RequestBody Map<String, String> body) {
        service.setRegex(attrDefId, body.get("regex"));
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
