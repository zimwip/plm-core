package com.plm.admin.enumdef;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/enums")
@RequiredArgsConstructor
public class EnumDefinitionController {

    private final EnumDefinitionService enumService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(enumService.getAllEnums());
    }

    @GetMapping("/{enumId}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable String enumId) {
        return ResponseEntity.ok(enumService.getEnum(enumId));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, String> body) {
        String code = enumService.createEnum(body.get("code"), body.get("name"), body.get("description"));
        return ResponseEntity.ok(Map.of("id", code));
    }

    @PutMapping("/{enumId}")
    public ResponseEntity<Void> update(@PathVariable String enumId, @RequestBody Map<String, String> body) {
        enumService.updateEnum(enumId, body.get("name"), body.get("description"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{enumId}")
    public ResponseEntity<?> delete(@PathVariable String enumId) {
        try {
            enumService.deleteEnum(enumId);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{enumId}/values")
    public ResponseEntity<List<Map<String, Object>>> listValues(@PathVariable String enumId) {
        return ResponseEntity.ok(enumService.getValues(enumId));
    }

    @PostMapping("/{enumId}/values")
    public ResponseEntity<Map<String, Object>> addValue(
            @PathVariable String enumId, @RequestBody Map<String, Object> body) {
        String value = enumService.addValue(enumId,
            (String) body.get("value"), (String) body.get("label"),
            body.get("displayOrder") instanceof Number n ? n.intValue() : -1);
        return ResponseEntity.ok(Map.of("value", value));
    }

    @PutMapping("/{enumId}/values/{value}")
    public ResponseEntity<Void> updateValue(
            @PathVariable String enumId, @PathVariable String value,
            @RequestBody Map<String, Object> body) {
        enumService.updateValue(enumId, value, (String) body.get("label"),
            body.get("displayOrder") instanceof Number n ? n.intValue() : 0);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{enumId}/values/{value}")
    public ResponseEntity<Void> deleteValue(@PathVariable String enumId, @PathVariable String value) {
        enumService.deleteValue(enumId, value);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{enumId}/values/reorder")
    public ResponseEntity<Void> reorderValues(@PathVariable String enumId, @RequestBody List<String> values) {
        enumService.reorderValues(enumId, values);
        return ResponseEntity.ok().build();
    }
}
