package com.dst.api;

import com.plm.platform.action.dto.FieldMeta;
import com.plm.platform.action.dto.ItemTypeDescriptor;
import com.plm.platform.item.dto.ItemTypeRef;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/item-type")
public class ItemTypeController {

    private static final ItemTypeDescriptor DATA_OBJECT_DESCRIPTOR = new ItemTypeDescriptor(
        new ItemTypeRef("dst", "data-object", null),
        "Data Object",
        "FileText",
        "#6366f1",
        "originalName",
        null,
        List.of(
            new FieldMeta("originalName", "Original name",    null, "text",     null, null, 0),
            new FieldMeta("contentType",  "Content type",     null, "text",     null, null, 1),
            new FieldMeta("sizeBytes",    "Size (bytes)",      null, "number",   null, null, 2),
            new FieldMeta("sha256",       "SHA-256",           null, "code",     null, null, 3),
            new FieldMeta("refCount",     "References",        null, "number",   null, null, 4),
            new FieldMeta("createdBy",    "Created by",        null, "text",     null, null, 5),
            new FieldMeta("createdAt",    "Created at",        null, "datetime", null, null, 6),
            new FieldMeta("lastAccessed", "Last accessed",     null, "datetime", null, null, 7),
            new FieldMeta("location",     "Storage location",  null, "code",     null, null, 8)
        ),
        Map.of()
    );

    @GetMapping("/{key}")
    public ResponseEntity<ItemTypeDescriptor> get(@PathVariable String key) {
        if ("data-object".equals(key)) {
            return ResponseEntity.ok(DATA_OBJECT_DESCRIPTOR);
        }
        return ResponseEntity.notFound().build();
    }
}
