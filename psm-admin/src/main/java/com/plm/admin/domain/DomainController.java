package com.plm.admin.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin CRUD API for domains and domain attributes.
 * Domain assignment/unassignment to nodes stays in psm-data.
 */
@RestController
@RequestMapping("/domains")
@RequiredArgsConstructor
public class DomainController {

    private final DomainService domainService;

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
        String id = domainService.createDomain(body.get("name"), body.get("description"),
            body.get("color"), body.get("icon"));
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
}
