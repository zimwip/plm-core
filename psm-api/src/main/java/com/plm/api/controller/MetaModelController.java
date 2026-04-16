package com.plm.api.controller;

import com.plm.domain.service.MetaModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/psm/metamodel")
@RequiredArgsConstructor
public class MetaModelController {

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
        try {
            String stateId = metaModelService.addState(
                id,
                (String) body.get("name"),
                Boolean.TRUE.equals(body.get("isInitial")),
                Boolean.TRUE.equals(body.get("isFrozen")),
                Boolean.TRUE.equals(body.get("isReleased")),
                (int) body.getOrDefault("displayOrder", 0),
                (String) body.get("color")
            );
            return ResponseEntity.ok(Map.of("id", stateId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/lifecycles/{lcId}/states/{stateId}")
    public ResponseEntity<?> updateState(
        @PathVariable String lcId,
        @PathVariable String stateId,
        @RequestBody Map<String, Object> body
    ) {
        try {
            metaModelService.updateState(
                stateId,
                (String) body.get("name"),
                Boolean.TRUE.equals(body.get("isInitial")),
                Boolean.TRUE.equals(body.get("isFrozen")),
                Boolean.TRUE.equals(body.get("isReleased")),
                (int) body.getOrDefault("displayOrder", 0),
                (String) body.get("color")
            );
            return ResponseEntity.ok(Map.of("id", stateId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/lifecycles/{lcId}/transitions/{transId}")
    public ResponseEntity<?> updateTransition(
        @PathVariable String lcId,
        @PathVariable String transId,
        @RequestBody Map<String, String> body
    ) {
        metaModelService.updateTransition(
            transId,
            body.get("name"),
            body.get("fromStateId"),
            body.get("toStateId"),
            body.get("guardExpr"),
            body.get("actionType"),
            body.get("versionStrategy")
        );
        return ResponseEntity.ok(Map.of("id", transId));
    }

    @PostMapping("/lifecycles/{id}/transitions")
    public ResponseEntity<Map<String, String>> addTransition(
        @PathVariable String id,
        @RequestBody Map<String, String> body
    ) {
        String transId = metaModelService.addTransition(
            id, body.get("name"),
            body.get("fromStateId"), body.get("toStateId"),
            body.get("guardExpr"), body.get("actionType"),
            body.get("versionStrategy")
        );
        return ResponseEntity.ok(Map.of("id", transId));
    }

    @DeleteMapping("/lifecycles/{id}")
    public ResponseEntity<?> deleteLifecycle(@PathVariable String id) {
        try {
            metaModelService.deleteLifecycle(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/lifecycles/{lcId}/states/{stateId}")
    public ResponseEntity<?> deleteState(@PathVariable String lcId, @PathVariable String stateId) {
        try {
            metaModelService.deleteState(stateId);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/lifecycles/{lcId}/transitions/{transId}")
    public ResponseEntity<?> deleteTransition(@PathVariable String lcId, @PathVariable String transId) {
        metaModelService.deleteTransition(transId);
        return ResponseEntity.noContent().build();
    }

    // -- Signature Requirements

    @PostMapping("/transitions/{transId}/signature-requirements")
    public ResponseEntity<?> addSignatureRequirement(
        @PathVariable String transId,
        @RequestBody Map<String, Object> body
    ) {
        int order = body.get("displayOrder") instanceof Number n ? n.intValue() : 0;
        String id = metaModelService.addSignatureRequirement(transId, (String) body.get("roleId"), order);
        return ResponseEntity.ok(Map.of("id", id));
    }

    @DeleteMapping("/transitions/{transId}/signature-requirements/{reqId}")
    public ResponseEntity<?> removeSignatureRequirement(
        @PathVariable String transId,
        @PathVariable String reqId
    ) {
        metaModelService.removeSignatureRequirement(reqId);
        return ResponseEntity.noContent().build();
    }

    // -- NodeType
    @GetMapping("/nodetypes")
    public ResponseEntity<?> getAllNodeTypes() {
        return ResponseEntity.ok(metaModelService.getAllNodeTypes());
    }

    @GetMapping("/nodetypes/creatable")
    public ResponseEntity<?> getCreatableNodeTypes() {
        return ResponseEntity.ok(metaModelService.getCreatableNodeTypes());
    }

    @PostMapping("/nodetypes")
    public ResponseEntity<?> createNodeType(@RequestBody Map<String, String> body) {
        try {
            String id = metaModelService.createNodeType(
                body.get("name"), body.get("description"), body.get("lifecycleId"),
                body.get("numberingScheme"), body.get("versionPolicy"),
                body.get("color"), body.get("icon"),
                body.get("parentNodeTypeId")
            );
            return ResponseEntity.ok(Map.of("id", id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/nodetypes/{nodeTypeId}/parent")
    public ResponseEntity<?> updateNodeTypeParent(
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, String> body
    ) {
        try {
            metaModelService.updateNodeTypeParent(nodeTypeId, body.get("parentNodeTypeId"));
            return ResponseEntity.ok(Map.of("id", nodeTypeId));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/nodetypes/{nodeTypeId}/appearance")
    public ResponseEntity<?> updateNodeTypeAppearance(
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, String> body
    ) {
        metaModelService.updateNodeTypeAppearance(nodeTypeId, body.get("color"), body.get("icon"));
        return ResponseEntity.ok(Map.of("id", nodeTypeId));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/numbering-scheme")
    public ResponseEntity<?> updateNumberingScheme(
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, String> body
    ) {
        try {
            metaModelService.updateNodeTypeNumberingScheme(nodeTypeId, body.get("numberingScheme"));
            return ResponseEntity.ok(Map.of("id", nodeTypeId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/nodetypes/{nodeTypeId}/lifecycle")
    public ResponseEntity<?> updateLifecycle(
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, String> body
    ) {
        metaModelService.updateNodeTypeLifecycle(nodeTypeId, body.get("lifecycleId"));
        return ResponseEntity.ok(Map.of("id", nodeTypeId));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/version-policy")
    public ResponseEntity<?> updateVersionPolicy(
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, String> body
    ) {
        try {
            metaModelService.updateNodeTypeVersionPolicy(nodeTypeId, body.get("versionPolicy"));
            return ResponseEntity.ok(Map.of("id", nodeTypeId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/nodetypes/{nodeTypeId}/collapse-history")
    public ResponseEntity<?> updateCollapseHistory(
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, Object> body
    ) {
        boolean v = Boolean.TRUE.equals(body.get("collapseHistory"));
        metaModelService.updateNodeTypeCollapseHistory(nodeTypeId, v);
        return ResponseEntity.ok(Map.of("id", nodeTypeId));
    }

    @DeleteMapping("/nodetypes/{nodeTypeId}")
    public ResponseEntity<?> deleteNodeType(@PathVariable String nodeTypeId) {
        try {
            metaModelService.deleteNodeType(nodeTypeId);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/nodetypes/{nodeTypeId}/identity")
    public ResponseEntity<?> updateNodeTypeIdentity(
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, String> body
    ) {
        metaModelService.updateNodeTypeIdentity(nodeTypeId, body.get("logicalIdLabel"), body.get("logicalIdPattern"));
        return ResponseEntity.ok(Map.of("id", nodeTypeId));
    }

    // -- Attributes (includes inherited attrs with inherited=true flag)
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

    @PutMapping("/nodetypes/{nodeTypeId}/attributes/{attrId}")
    public ResponseEntity<?> updateAttribute(
        @PathVariable String nodeTypeId,
        @PathVariable String attrId,
        @RequestBody Map<String, Object> body
    ) {
        metaModelService.updateAttributeDefinition(attrId, body);
        return ResponseEntity.ok(Map.of("id", attrId));
    }

    @DeleteMapping("/nodetypes/{nodeTypeId}/attributes/{attrId}")
    public ResponseEntity<?> deleteAttribute(@PathVariable String nodeTypeId, @PathVariable String attrId) {
        try {
            metaModelService.deleteAttribute(attrId);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    // -- AttributeStateRule
    // nodeTypeId in body is optional; when provided it scopes the rule to that type
    // (used by child types to override an inherited attribute's state rule).
    // When absent, the rule is scoped to the attribute's own node type (default behaviour).
    @PutMapping("/attributes/{attrId}/states/{stateId}/rules")
    public ResponseEntity<Map<String, String>> setRule(
        @PathVariable String attrId,
        @PathVariable String stateId,
        @RequestBody Map<String, Object> body
    ) {
        String nodeTypeId = (String) body.get("nodeTypeId");
        String id = metaModelService.setAttributeStateRule(
            nodeTypeId, attrId, stateId,
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

    @GetMapping("/nodetypes/{nodeTypeId}/linktypes")
    public ResponseEntity<?> getLinkTypesForNodeType(@PathVariable String nodeTypeId) {
        return ResponseEntity.ok(metaModelService.getEffectiveLinkTypes(nodeTypeId));
    }

    @PutMapping("/linktypes/{id}")
    public ResponseEntity<?> updateLinkType(
        @PathVariable String id,
        @RequestBody Map<String, Object> body
    ) {
        try {
            metaModelService.updateLinkType(id, body);
            return ResponseEntity.ok(Map.of("id", id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/linktypes/{id}")
    public ResponseEntity<?> deleteLinkType(@PathVariable String id) {
        try {
            metaModelService.deleteLinkType(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/linktypes/{id}/attributes")
    public ResponseEntity<?> getLinkTypeAttributes(@PathVariable String id) {
        return ResponseEntity.ok(metaModelService.getLinkTypeAttributes(id));
    }

    @PostMapping("/linktypes/{id}/attributes")
    public ResponseEntity<Map<String, String>> createLinkTypeAttribute(
        @PathVariable String id,
        @RequestBody Map<String, Object> body
    ) {
        String attrId = metaModelService.createLinkTypeAttribute(id, body);
        return ResponseEntity.ok(Map.of("id", attrId));
    }

    @PutMapping("/linktypes/{id}/attributes/{attrId}")
    public ResponseEntity<?> updateLinkTypeAttribute(
        @PathVariable String id,
        @PathVariable String attrId,
        @RequestBody Map<String, Object> body
    ) {
        metaModelService.updateLinkTypeAttribute(attrId, body);
        return ResponseEntity.ok(Map.of("id", attrId));
    }

    @DeleteMapping("/linktypes/{id}/attributes/{attrId}")
    public ResponseEntity<?> deleteLinkTypeAttribute(
        @PathVariable String id,
        @PathVariable String attrId
    ) {
        metaModelService.deleteLinkTypeAttribute(attrId);
        return ResponseEntity.noContent().build();
    }

    // -- LinkType Cascade Rules

    @GetMapping("/linktypes/{id}/cascades")
    public ResponseEntity<?> getLinkTypeCascades(@PathVariable String id) {
        return ResponseEntity.ok(metaModelService.getLinkTypeCascades(id));
    }

    @PostMapping("/linktypes/{id}/cascades")
    public ResponseEntity<Map<String, String>> createLinkTypeCascade(
        @PathVariable String id,
        @RequestBody Map<String, String> body
    ) {
        try {
            String cascadeId = metaModelService.createLinkTypeCascade(
                id, body.get("parentTransitionId"), body.get("childFromStateId"), body.get("childTransitionId"));
            return ResponseEntity.ok(Map.of("id", cascadeId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/linktypes/{id}/cascades/{cascadeId}")
    public ResponseEntity<?> deleteLinkTypeCascade(
        @PathVariable String id,
        @PathVariable String cascadeId
    ) {
        metaModelService.deleteLinkTypeCascade(cascadeId);
        return ResponseEntity.noContent().build();
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
            (Integer) body.get("maxCardinality"),
            (String) body.get("linkLogicalIdLabel"),
            (String) body.get("linkLogicalIdPattern"),
            (String) body.get("color"),
            (String) body.get("icon")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/linktypes/{id}/identity")
    public ResponseEntity<?> updateLinkTypeIdentity(
        @PathVariable String id,
        @RequestBody Map<String, String> body
    ) {
        metaModelService.updateLinkTypeIdentity(id, body.get("linkLogicalIdLabel"), body.get("linkLogicalIdPattern"));
        return ResponseEntity.ok(Map.of("id", id));
    }

    // -- Action registry

    @GetMapping("/actions")
    public ResponseEntity<?> getAllActions() {
        return ResponseEntity.ok(metaModelService.getAllActions());
    }

    @GetMapping("/nodetypes/{nodeTypeId}/actions")
    public ResponseEntity<?> getActionsForNodeType(@PathVariable String nodeTypeId) {
        return ResponseEntity.ok(metaModelService.getActionsForNodeType(nodeTypeId));
    }

    @PostMapping("/nodetypes/{nodeTypeId}/actions")
    public ResponseEntity<Map<String, String>> registerCustomAction(
        @PathVariable String nodeTypeId,
        @RequestBody Map<String, Object> body
    ) {
        String ntaId = metaModelService.registerCustomAction(
            nodeTypeId,
            (String) body.get("actionCode"),
            (String) body.get("displayName"),
            (String) body.get("handlerRef"),
            (String) body.get("displayCategory"),
            Boolean.TRUE.equals(body.get("requiresTx")),
            (String) body.get("description")
        );
        return ResponseEntity.ok(Map.of("id", ntaId));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/actions/{ntaId}/status")
    public ResponseEntity<?> setNodeTypeActionStatus(
        @PathVariable String nodeTypeId,
        @PathVariable String ntaId,
        @RequestBody Map<String, String> body
    ) {
        try {
            metaModelService.setNodeTypeActionStatus(ntaId, body.get("status"));
            return ResponseEntity.ok(Map.of("id", ntaId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/nodetypes/{nodeTypeId}/actions/{ntaId}/permissions")
    public ResponseEntity<?> getActionPermissions(
        @PathVariable String nodeTypeId,
        @PathVariable String ntaId
    ) {
        return ResponseEntity.ok(metaModelService.getNodeTypeActionPermissions(ntaId));
    }

    @PostMapping("/nodetypes/{nodeTypeId}/actions/{ntaId}/permissions")
    public ResponseEntity<?> addActionPermission(
        @PathVariable String nodeTypeId,
        @PathVariable String ntaId,
        @RequestBody Map<String, String> body
    ) {
        metaModelService.setNodeTypeActionPermission(ntaId, body.get("roleId"));
        return ResponseEntity.ok(Map.of("id", ntaId));
    }

    @DeleteMapping("/nodetypes/{nodeTypeId}/actions/{ntaId}/permissions")
    public ResponseEntity<?> removeActionPermission(
        @PathVariable String nodeTypeId,
        @PathVariable String ntaId,
        @RequestBody Map<String, String> body
    ) {
        metaModelService.removeNodeTypeActionPermission(ntaId, body.get("roleId"));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/nodetypes/{nodeTypeId}/actions/{ntaId}/param-overrides/{parameterId}")
    public ResponseEntity<?> setParamOverride(
        @PathVariable String nodeTypeId,
        @PathVariable String ntaId,
        @PathVariable String parameterId,
        @RequestBody Map<String, Object> body
    ) {
        metaModelService.setNodeActionParamOverride(
            ntaId, parameterId,
            (String) body.get("defaultValue"),
            (String) body.get("allowedValues"),
            body.get("required") != null ? (Boolean.TRUE.equals(body.get("required")) ? 1 : 0) : null
        );
        return ResponseEntity.ok(Map.of("id", ntaId));
    }
}
