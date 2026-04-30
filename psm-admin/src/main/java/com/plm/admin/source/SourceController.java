package com.plm.admin.source;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin CRUD for Sources. A Source declares an external (or local) system that
 * hosts link targets and is bound to a resolver algorithm instance.
 *
 * The built-in {@code SELF} source is read-only — PUT/DELETE on it return 409.
 */
@RestController
@RequestMapping("/sources")
@RequiredArgsConstructor
public class SourceController {

    private final SourceService sourceService;

    @GetMapping
    public ResponseEntity<List<SourceDto>> list() {
        return ResponseEntity.ok(sourceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SourceDto> get(@PathVariable String id) {
        return ResponseEntity.ok(sourceService.get(id));
    }

    @GetMapping("/resolvers")
    public ResponseEntity<List<Map<String, Object>>> listResolvers() {
        return ResponseEntity.ok(sourceService.listResolverInstances());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        String id = sourceService.create(
            (String) body.get("id"),
            (String) body.get("name"),
            (String) body.get("description"),
            (String) body.get("resolverInstanceId"),
            Boolean.TRUE.equals(body.get("versioned")),
            (String) body.get("color"),
            (String) body.get("icon")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        sourceService.update(id,
            (String) body.get("name"),
            (String) body.get("description"),
            (String) body.get("resolverInstanceId"),
            Boolean.TRUE.equals(body.get("versioned")),
            (String) body.get("color"),
            (String) body.get("icon")
        );
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        sourceService.delete(id);
        return ResponseEntity.ok().build();
    }
}
