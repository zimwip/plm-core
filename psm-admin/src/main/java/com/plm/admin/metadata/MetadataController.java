package com.plm.admin.metadata;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/**
 * Read-only metadata-key discovery endpoint used by the Settings UI to surface
 * which metadata keys are already registered (e.g. for LIFECYCLE_STATE).
 */
@RestController
@RequestMapping("/metamodel/metadata")
@RequiredArgsConstructor
public class MetadataController {

    private final MetadataService metadataService;

    @GetMapping("/keys")
    public ResponseEntity<List<String>> listAllKeys() {
        return ResponseEntity.ok(metadataService.listDistinctKeys(null));
    }

    @GetMapping("/keys/{targetType}")
    public ResponseEntity<List<String>> listKeysForType(@PathVariable String targetType) {
        return ResponseEntity.ok(metadataService.listDistinctKeys(targetType));
    }
}
