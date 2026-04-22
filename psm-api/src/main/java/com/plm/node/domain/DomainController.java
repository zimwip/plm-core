package com.plm.node.domain;

import com.plm.node.domain.internal.DomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/psm/domains")
@RequiredArgsConstructor
public class DomainController {

    private final DomainService domainService;

    // ================================================================
    // DOMAIN CRUD
    // ================================================================

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(domainService.getAllDomains());
    }

    @GetMapping("/{domainId}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable String domainId) {
        return ResponseEntity.ok(domainService.getDomain(domainId));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, String> body) {
        String id = domainService.createDomain(
            body.get("name"),
            body.get("description"),
            body.get("color"),
            body.get("icon")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/{domainId}")
    public ResponseEntity<Void> update(@PathVariable String domainId, @RequestBody Map<String, String> body) {
        domainService.updateDomain(domainId, body.get("name"), body.get("description"),
            body.get("color"), body.get("icon"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{domainId}")
    public ResponseEntity<Void> delete(@PathVariable String domainId) {
        domainService.deleteDomain(domainId);
        return ResponseEntity.ok().build();
    }

    // ================================================================
    // DOMAIN ATTRIBUTES
    // ================================================================

    @GetMapping("/{domainId}/attributes")
    public ResponseEntity<List<Map<String, Object>>> listAttributes(@PathVariable String domainId) {
        return ResponseEntity.ok(domainService.getDomainAttributes(domainId));
    }

    @PostMapping("/{domainId}/attributes")
    public ResponseEntity<Map<String, Object>> createAttribute(
            @PathVariable String domainId, @RequestBody Map<String, Object> body) {
        String id = domainService.createDomainAttribute(domainId, body);
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/{domainId}/attributes/{attrId}")
    public ResponseEntity<Void> updateAttribute(
            @PathVariable String domainId, @PathVariable String attrId,
            @RequestBody Map<String, Object> body) {
        domainService.updateDomainAttribute(domainId, attrId, body);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{domainId}/attributes/{attrId}")
    public ResponseEntity<Void> deleteAttribute(
            @PathVariable String domainId, @PathVariable String attrId) {
        domainService.deleteDomainAttribute(domainId, attrId);
        return ResponseEntity.ok().build();
    }

    // ================================================================
    // DOMAIN ATTRIBUTE STATE RULES
    // ================================================================

    @PutMapping("/{domainId}/attributes/{attrId}/states/{stateId}/rules")
    public ResponseEntity<Map<String, Object>> setStateRule(
            @PathVariable String domainId, @PathVariable String attrId,
            @PathVariable String stateId, @RequestBody Map<String, Object> body) {
        String id = domainService.setDomainAttributeStateRule(
            domainId, attrId, stateId,
            Boolean.TRUE.equals(body.get("required")) || Integer.valueOf(1).equals(body.get("required")),
            body.get("editable") == null || Boolean.TRUE.equals(body.get("editable")) || Integer.valueOf(1).equals(body.get("editable")),
            body.get("visible") == null || Boolean.TRUE.equals(body.get("visible")) || Integer.valueOf(1).equals(body.get("visible"))
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @GetMapping("/{domainId}/attributes/matrix")
    public ResponseEntity<List<Map<String, Object>>> getStateMatrix(@PathVariable String domainId) {
        return ResponseEntity.ok(domainService.getDomainAttributeStateMatrix(domainId));
    }
}
