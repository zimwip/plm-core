package com.plm.admin.metadata;

import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plm.admin.config.ConfigChangedEvent;

import lombok.RequiredArgsConstructor;

/**
 * Metadata-key discovery + generic entity_metadata CRUD.
 * Writes publish a ConfigChangedEvent so consumers refresh their config snapshot
 * (e.g. webdav reads NODE_TYPE:*:webdav.directory / LINK_TYPE:*:webdav.file).
 */
@RestController
@RequestMapping("/metamodel/metadata")
@RequiredArgsConstructor
public class MetadataController {

    private final MetadataService metadataService;
    private final ApplicationEventPublisher eventPublisher;

    @GetMapping("/keys")
    public ResponseEntity<List<String>> listAllKeys() {
        return ResponseEntity.ok(metadataService.listDistinctKeys(null));
    }

    @GetMapping("/keys/{targetType}")
    public ResponseEntity<List<String>> listKeysForType(@PathVariable String targetType) {
        return ResponseEntity.ok(metadataService.listDistinctKeys(targetType));
    }

    @GetMapping("/{targetType}/{targetId}")
    public ResponseEntity<Map<String, String>> getMetadata(@PathVariable String targetType,
                                                           @PathVariable String targetId) {
        return ResponseEntity.ok(metadataService.getMetadata(targetType, targetId));
    }

    @PutMapping("/{targetType}/{targetId}/{key}")
    public ResponseEntity<Void> setMetadata(@PathVariable String targetType,
                                            @PathVariable String targetId,
                                            @PathVariable String key,
                                            @RequestBody Map<String, String> body) {
        String value = body.get("value");
        if (value == null) {
            return ResponseEntity.badRequest().build();
        }
        metadataService.set(targetType, targetId, key, value);
        eventPublisher.publishEvent(new ConfigChangedEvent("METADATA_SET", targetType, targetId));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{targetType}/{targetId}/{key}")
    public ResponseEntity<Void> removeMetadata(@PathVariable String targetType,
                                               @PathVariable String targetId,
                                               @PathVariable String key) {
        metadataService.removeOne(targetType, targetId, key);
        eventPublisher.publishEvent(new ConfigChangedEvent("METADATA_REMOVED", targetType, targetId));
        return ResponseEntity.noContent().build();
    }
}
