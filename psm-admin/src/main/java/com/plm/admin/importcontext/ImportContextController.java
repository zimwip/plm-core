package com.plm.admin.importcontext;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ImportContextController {

    private final ImportContextService importContextService;

    // ── Admin CRUD ─────────────────────────────────────────────────

    @GetMapping("/admin/import-contexts")
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(importContextService.getAll());
    }

    @GetMapping("/admin/import-contexts/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable String id) {
        Map<String, Object> ctx = importContextService.getById(id);
        return ctx != null ? ResponseEntity.ok(ctx) : ResponseEntity.notFound().build();
    }

    @GetMapping("/admin/import-contexts/algorithm-instances/import")
    public ResponseEntity<List<Map<String, Object>>> listImportAlgorithmInstances() {
        return ResponseEntity.ok(importContextService.listImportContextAlgorithmInstances());
    }

    @GetMapping("/admin/import-contexts/algorithm-instances/validation")
    public ResponseEntity<List<Map<String, Object>>> listValidationAlgorithmInstances() {
        return ResponseEntity.ok(importContextService.listNodeValidationAlgorithmInstances());
    }

    @PostMapping("/admin/import-contexts")
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        String id = importContextService.create(
            (String) body.get("code"),
            (String) body.get("label"),
            (String) body.get("allowedRootNodeTypes"),
            (String) body.get("acceptedFormats"),
            (String) body.get("importContextAlgorithmInstanceId"),
            (String) body.get("nodeValidationAlgorithmInstanceId")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/admin/import-contexts/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        importContextService.update(
            id,
            (String) body.get("label"),
            (String) body.get("allowedRootNodeTypes"),
            (String) body.get("acceptedFormats"),
            (String) body.get("importContextAlgorithmInstanceId"),
            (String) body.get("nodeValidationAlgorithmInstanceId")
        );
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/admin/import-contexts/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        importContextService.delete(id);
        return ResponseEntity.ok().build();
    }

    // ── Internal S2S ───────────────────────────────────────────────

    @GetMapping("/internal/import-contexts")
    public ResponseEntity<List<Map<String, Object>>> listInternal() {
        return ResponseEntity.ok(importContextService.getAll());
    }

    @GetMapping("/internal/import-contexts/{code}")
    public ResponseEntity<Map<String, Object>> getByCode(@PathVariable String code) {
        Map<String, Object> ctx = importContextService.getByCode(code);
        return ctx != null ? ResponseEntity.ok(ctx) : ResponseEntity.notFound().build();
    }
}
