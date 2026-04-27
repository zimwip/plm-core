package com.plm.admin.metamodel;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin CRUD API for node types, attributes, link types, and related metamodel entities.
 */
@RestController
@RequestMapping("/metamodel")
@RequiredArgsConstructor
public class MetaModelController {

    private final MetaModelService metaModelService;

    // -- NodeType
    @GetMapping("/nodetypes")
    public ResponseEntity<?> getAllNodeTypes() {
        return ResponseEntity.ok(metaModelService.getAllNodeTypes());
    }

    @PostMapping("/nodetypes")
    public ResponseEntity<?> createNodeType(@RequestBody Map<String, String> body) {
        String id = metaModelService.createNodeType(
            body.get("name"), body.get("description"), body.get("lifecycleId"),
            body.get("numberingScheme"), body.get("versionPolicy"),
            body.get("color"), body.get("icon"), body.get("parentNodeTypeId")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/parent")
    public ResponseEntity<?> updateNodeTypeParent(
        @PathVariable String nodeTypeId, @RequestBody Map<String, String> body) {
        metaModelService.updateNodeTypeParent(nodeTypeId, body.get("parentNodeTypeId"));
        return ResponseEntity.ok(Map.of("id", nodeTypeId));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/appearance")
    public ResponseEntity<?> updateNodeTypeAppearance(
        @PathVariable String nodeTypeId, @RequestBody Map<String, String> body) {
        metaModelService.updateNodeTypeAppearance(nodeTypeId, body.get("color"), body.get("icon"));
        return ResponseEntity.ok(Map.of("id", nodeTypeId));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/numbering-scheme")
    public ResponseEntity<?> updateNumberingScheme(
        @PathVariable String nodeTypeId, @RequestBody Map<String, String> body) {
        metaModelService.updateNodeTypeNumberingScheme(nodeTypeId, body.get("numberingScheme"));
        return ResponseEntity.ok(Map.of("id", nodeTypeId));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/lifecycle")
    public ResponseEntity<?> updateLifecycle(
        @PathVariable String nodeTypeId, @RequestBody Map<String, String> body) {
        metaModelService.updateNodeTypeLifecycle(nodeTypeId, body.get("lifecycleId"));
        return ResponseEntity.ok(Map.of("id", nodeTypeId));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/version-policy")
    public ResponseEntity<?> updateVersionPolicy(
        @PathVariable String nodeTypeId, @RequestBody Map<String, String> body) {
        metaModelService.updateNodeTypeVersionPolicy(nodeTypeId, body.get("versionPolicy"));
        return ResponseEntity.ok(Map.of("id", nodeTypeId));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/collapse-history")
    public ResponseEntity<?> updateCollapseHistory(
        @PathVariable String nodeTypeId, @RequestBody Map<String, Object> body) {
        boolean v = Boolean.TRUE.equals(body.get("collapseHistory"));
        metaModelService.updateNodeTypeCollapseHistory(nodeTypeId, v);
        return ResponseEntity.ok(Map.of("id", nodeTypeId));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/identity")
    public ResponseEntity<?> updateNodeTypeIdentity(
        @PathVariable String nodeTypeId, @RequestBody Map<String, String> body) {
        metaModelService.updateNodeTypeIdentity(nodeTypeId, body.get("logicalIdLabel"), body.get("logicalIdPattern"));
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

    // -- Attributes
    @GetMapping("/nodetypes/{nodeTypeId}/attributes")
    public ResponseEntity<?> getAttributes(@PathVariable String nodeTypeId) {
        return ResponseEntity.ok(metaModelService.getAttributeDefinitions(nodeTypeId));
    }

    @PostMapping("/nodetypes/{nodeTypeId}/attributes")
    public ResponseEntity<Map<String, String>> createAttribute(
        @PathVariable String nodeTypeId, @RequestBody Map<String, Object> body) {
        String id = metaModelService.createAttributeDefinition(nodeTypeId, body);
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/nodetypes/{nodeTypeId}/attributes/{attrId}")
    public ResponseEntity<?> updateAttribute(
        @PathVariable String nodeTypeId, @PathVariable String attrId,
        @RequestBody Map<String, Object> body) {
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

    @GetMapping("/nodetypes/{nodeTypeId}/attributes/matrix")
    public ResponseEntity<?> getMatrix(@PathVariable String nodeTypeId) {
        return ResponseEntity.ok(metaModelService.getAttributeStateMatrix(nodeTypeId));
    }

    // -- AttributeStateRule
    @PutMapping("/attributes/{attrId}/states/{stateId}/rules")
    public ResponseEntity<Map<String, String>> setRule(
        @PathVariable String attrId, @PathVariable String stateId,
        @RequestBody Map<String, Object> body) {
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
    public ResponseEntity<?> getLinkTypesByNodeType(@PathVariable String nodeTypeId) {
        return ResponseEntity.ok(metaModelService.getLinkTypesByNodeType(nodeTypeId));
    }

    @PostMapping("/linktypes")
    public ResponseEntity<Map<String, String>> createLinkType(@RequestBody Map<String, Object> body) {
        String id = metaModelService.createLinkType(
            (String) body.get("name"), (String) body.get("description"),
            (String) body.get("sourceNodeTypeId"), (String) body.get("targetNodeTypeId"),
            (String) body.getOrDefault("linkPolicy", "VERSION_TO_MASTER"),
            (int) body.getOrDefault("minCardinality", 0),
            (Integer) body.get("maxCardinality"),
            (String) body.get("linkLogicalIdLabel"), (String) body.get("linkLogicalIdPattern"),
            (String) body.get("color"), (String) body.get("icon")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/linktypes/{id}")
    public ResponseEntity<?> updateLinkType(@PathVariable String id, @RequestBody Map<String, Object> body) {
        metaModelService.updateLinkType(id, body);
        return ResponseEntity.ok(Map.of("id", id));
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

    // -- LinkType Attributes
    @GetMapping("/linktypes/{id}/attributes")
    public ResponseEntity<?> getLinkTypeAttributes(@PathVariable String id) {
        return ResponseEntity.ok(metaModelService.getLinkTypeAttributes(id));
    }

    @PostMapping("/linktypes/{id}/attributes")
    public ResponseEntity<Map<String, String>> createLinkTypeAttribute(
        @PathVariable String id, @RequestBody Map<String, Object> body) {
        String attrId = metaModelService.createLinkTypeAttribute(id, body);
        return ResponseEntity.ok(Map.of("id", attrId));
    }

    @PutMapping("/linktypes/{id}/attributes/{attrId}")
    public ResponseEntity<?> updateLinkTypeAttribute(
        @PathVariable String id, @PathVariable String attrId,
        @RequestBody Map<String, Object> body) {
        metaModelService.updateLinkTypeAttribute(attrId, body);
        return ResponseEntity.ok(Map.of("id", attrId));
    }

    @DeleteMapping("/linktypes/{id}/attributes/{attrId}")
    public ResponseEntity<?> deleteLinkTypeAttribute(
        @PathVariable String id, @PathVariable String attrId) {
        metaModelService.deleteLinkTypeAttribute(attrId);
        return ResponseEntity.noContent().build();
    }

    // -- LinkType Cascades
    @GetMapping("/linktypes/{id}/cascades")
    public ResponseEntity<?> getLinkTypeCascades(@PathVariable String id) {
        return ResponseEntity.ok(metaModelService.getLinkTypeCascades(id));
    }

    @PostMapping("/linktypes/{id}/cascades")
    public ResponseEntity<Map<String, String>> createLinkTypeCascade(
        @PathVariable String id, @RequestBody Map<String, String> body) {
        String cascadeId = metaModelService.createLinkTypeCascade(
            id, body.get("parentTransitionId"), body.get("childFromStateId"), body.get("childTransitionId"));
        return ResponseEntity.ok(Map.of("id", cascadeId));
    }

    @DeleteMapping("/linktypes/{id}/cascades/{cascadeId}")
    public ResponseEntity<?> deleteLinkTypeCascade(
        @PathVariable String id, @PathVariable String cascadeId) {
        metaModelService.deleteLinkTypeCascade(cascadeId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/linktypes/{id}/identity")
    public ResponseEntity<?> updateLinkTypeIdentity(
        @PathVariable String id, @RequestBody Map<String, String> body) {
        metaModelService.updateLinkTypeIdentity(id, body.get("linkLogicalIdLabel"), body.get("linkLogicalIdPattern"));
        return ResponseEntity.ok(Map.of("id", id));
    }

    // ── Action catalog ──

    @GetMapping("/actions")
    public ResponseEntity<List<Map<String, Object>>> listAllActions() {
        return ResponseEntity.ok(metaModelService.listAllActions());
    }

    @PostMapping("/actions")
    public ResponseEntity<Map<String, String>> registerCustomAction(@RequestBody Map<String, Object> body) {
        String id = metaModelService.createAction(body);
        return ResponseEntity.ok(Map.of("id", id));
    }

    @GetMapping("/nodetypes/{nodeTypeId}/actions")
    public ResponseEntity<List<Map<String, Object>>> listActionsForNodeType(@PathVariable String nodeTypeId) {
        return ResponseEntity.ok(metaModelService.listActionsForNodeType(nodeTypeId));
    }

    @PutMapping("/actions/{actionId}/managed-with")
    public ResponseEntity<Void> setActionManagedWith(
            @PathVariable String actionId, @RequestBody Map<String, String> body) {
        metaModelService.setActionManagedWith(actionId, body.get("managedWith"));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/actions/{actionId}/managed-actions")
    public ResponseEntity<List<Map<String, Object>>> listManagedActions(@PathVariable String actionId) {
        return ResponseEntity.ok(metaModelService.listManagedActions(actionId));
    }
}
