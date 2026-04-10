package com.plm.api.controller;

import com.plm.domain.service.BaselineService;
import com.plm.domain.service.MetaModelService;
import com.plm.domain.service.SignatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// ================================================================
// META-MODEL API
// ================================================================

@RestController
@RequestMapping("/api/metamodel")
@RequiredArgsConstructor
class MetaModelController {

    private final MetaModelService metaModelService;

    // -- Lifecycle
    @GetMapping("/lifecycles")
    public ResponseEntity<?> getAllLifecycles() {
        return ResponseEntity.ok(metaModelService.getAllLifecycles());
    }

    @PostMapping("/lifecycles")
    public ResponseEntity<Map<String, String>> createLifecycle(@RequestBody Map<String, String> body) {
        String id = metaModelService.createLifecycle(body.get("name"), body.get("description"));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @GetMapping("/lifecycles/{id}/states")
    public ResponseEntity<?> getStates(@PathVariable String id) {
        return ResponseEntity.ok(metaModelService.getStates(id));
    }

    @GetMapping("/lifecycles/{id}/transitions")
    public ResponseEntity<?> getTransitions(@PathVariable String id) {
        return ResponseEntity.ok(metaModelService.getTransitions(id));
    }

    @PostMapping("/lifecycles/{id}/states")
    public ResponseEntity<Map<String, String>> addState(
        @PathVariable String id,
        @RequestBody Map<String, Object> body
    ) {
        String stateId = metaModelService.addState(
            id,
            (String) body.get("name"),
            Boolean.TRUE.equals(body.get("isInitial")),
            Boolean.TRUE.equals(body.get("isFrozen")),
            Boolean.TRUE.equals(body.get("isReleased")),
            (int) body.getOrDefault("displayOrder", 0)
        );
        return ResponseEntity.ok(Map.of("id", stateId));
    }

    @PostMapping("/lifecycles/{id}/transitions")
    public ResponseEntity<Map<String, String>> addTransition(
        @PathVariable String id,
        @RequestBody Map<String, String> body
    ) {
        String transId = metaModelService.addTransition(
            id, body.get("name"),
            body.get("fromStateId"), body.get("toStateId"),
            body.get("guardExpr"), body.get("actionType")
        );
        return ResponseEntity.ok(Map.of("id", transId));
    }

    // -- NodeType
    @GetMapping("/nodetypes")
    public ResponseEntity<?> getAllNodeTypes() {
        return ResponseEntity.ok(metaModelService.getAllNodeTypes());
    }

    @PostMapping("/nodetypes")
    public ResponseEntity<Map<String, String>> createNodeType(@RequestBody Map<String, String> body) {
        String id = metaModelService.createNodeType(
            body.get("name"), body.get("description"), body.get("lifecycleId")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    // -- Attributes
    @GetMapping("/nodetypes/{nodeTypeId}/attributes")
    public ResponseEntity<?> getAttributes(@PathVariable String nodeTypeId) {
        return ResponseEntity.ok(metaModelService.getAttributeDefinitions(nodeTypeId));
    }

    @PostMapping("/nodetypes/{nodeTypeId}/attributes")
    public ResponseEntity<Map<String, String>> createAttribute(
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, Object> body
    ) {
        String id = metaModelService.createAttributeDefinition(nodeTypeId, body);
        return ResponseEntity.ok(Map.of("id", id));
    }

    @GetMapping("/nodetypes/{nodeTypeId}/attributes/matrix")
    public ResponseEntity<?> getMatrix(@PathVariable String nodeTypeId) {
        return ResponseEntity.ok(metaModelService.getAttributeStateMatrix(nodeTypeId));
    }

    // -- AttributeStateRule
    @PutMapping("/attributes/{attrId}/states/{stateId}/rules")
    public ResponseEntity<Map<String, String>> setRule(
        @PathVariable String attrId,
        @PathVariable String stateId,
        @RequestBody Map<String, Object> body
    ) {
        String id = metaModelService.setAttributeStateRule(
            attrId, stateId,
            Boolean.TRUE.equals(body.get("required")),
            !Boolean.FALSE.equals(body.get("editable")),
            !Boolean.FALSE.equals(body.get("visible"))
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    // -- LinkType
    @GetMapping("/linktypes")
    public ResponseEntity<?> getAllLinkTypes() {
        return ResponseEntity.ok(metaModelService.getAllLinkTypes());
    }

    @PostMapping("/linktypes")
    public ResponseEntity<Map<String, String>> createLinkType(@RequestBody Map<String, Object> body) {
        String id = metaModelService.createLinkType(
            (String) body.get("name"),
            (String) body.get("description"),
            (String) body.get("sourceNodeTypeId"),
            (String) body.get("targetNodeTypeId"),
            (String) body.getOrDefault("linkPolicy", "VERSION_TO_MASTER"),
            (int) body.getOrDefault("minCardinality", 0),
            (Integer) body.get("maxCardinality")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }
}

// ================================================================
// BASELINE API
// ================================================================

@RestController
@RequestMapping("/api/baselines")
@RequiredArgsConstructor
class BaselineController {

    private final BaselineService baselineService;

    @GetMapping
    public ResponseEntity<?> listBaselines() {
        return ResponseEntity.ok(baselineService.listBaselines());
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createBaseline(@RequestBody Map<String, String> body) {
        String id = baselineService.createBaseline(
            body.get("rootNodeId"),
            body.get("name"),
            body.get("description"),
            body.get("userId")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<?> getContent(@PathVariable String id) {
        return ResponseEntity.ok(baselineService.getBaselineContent(id));
    }

    @GetMapping("/compare")
    public ResponseEntity<?> compare(
        @RequestParam String baselineA,
        @RequestParam String baselineB
    ) {
        return ResponseEntity.ok(baselineService.compareBaselines(baselineA, baselineB));
    }

}

// ================================================================
// SIGNATURE API
// ================================================================

@RestController
@RequestMapping("/api/nodes/{nodeId}/signatures")
@RequiredArgsConstructor
class SignatureController {

    private final SignatureService signatureService;

    @PostMapping
    public ResponseEntity<Map<String, String>> sign(
        @PathVariable String nodeId,
        @RequestHeader(value = "X-PLM-Tx", required = false) String txId,
        @RequestBody Map<String, String> body
    ) {
        String sigId = signatureService.sign(
            nodeId,
            body.get("userId"),
            txId,
            body.get("meaning"),
            body.get("comment")
        );
        return ResponseEntity.ok(Map.of("signatureId", sigId));
    }

    @GetMapping
    public ResponseEntity<?> getSignatures(@PathVariable String nodeId) {
        return ResponseEntity.ok(signatureService.getSignaturesForCurrentIteration(nodeId));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@PathVariable String nodeId) {
        return ResponseEntity.ok(signatureService.getFullSignatureHistory(nodeId));
    }

}
