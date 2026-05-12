package com.dst.api;

import com.dst.domain.DataMetadata;
import com.dst.domain.DataService;
import com.dst.domain.DataUploadResult;
import com.dst.security.DstSecurityContext;
import com.dst.security.DstUserContext;
import com.plm.platform.action.guard.ActionGuardContext;
import com.plm.platform.action.guard.ActionGuardPort;
import com.plm.platform.action.guard.GuardViolation;
import com.plm.platform.authz.PlmPermission;
import com.plm.platform.action.dto.ActionDescriptor;
import com.plm.platform.action.dto.DetailDescriptor;
import com.plm.platform.action.dto.DetailField;
import com.plm.platform.item.dto.ItemTypeRef;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/data")
@RequiredArgsConstructor
public class DataController {

    private final DataService dataService;
    private final ActionGuardPort guardPort;

    @GetMapping
    @PlmPermission("READ_DATA")
    public ResponseEntity<List<DataMetadata>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        DstUserContext ctx = DstSecurityContext.get();
        return ResponseEntity.ok(dataService.list(ctx.getProjectSpaceId(), page, size));
    }

    @PostMapping
    @PlmPermission("WRITE_DATA")
    public ResponseEntity<DataUploadResult> upload(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "name", required = false) String name
    ) throws IOException {
        DstUserContext ctx = DstSecurityContext.get();
        String originalName = (name != null && !name.isBlank()) ? name : file.getOriginalFilename();
        DataUploadResult result = dataService.upload(
            ctx.getUserId(), ctx.getProjectSpaceId(), originalName, file.getContentType(), file.getInputStream());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/ref")
    @PlmPermission("WRITE_DATA")
    public ResponseEntity<DataMetadata> ref(@PathVariable String id) {
        DstUserContext ctx = DstSecurityContext.get();
        return ResponseEntity.ok(dataService.reference(id, ctx.getUserId(), ctx.getProjectSpaceId()));
    }

    @PostMapping("/{id}/unref")
    @PlmPermission("WRITE_DATA")
    public ResponseEntity<Void> unref(@PathVariable String id) {
        DstUserContext ctx = DstSecurityContext.get();
        dataService.unreference(id, ctx.getUserId(), ctx.getProjectSpaceId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{id}/metadata")
    @PlmPermission("READ_DATA")
    public ResponseEntity<DataMetadata> metadata(@PathVariable String id) {
        DstUserContext ctx = DstSecurityContext.get();
        return ResponseEntity.ok(dataService.getMetadata(id, ctx.getUserId(), ctx.getProjectSpaceId()));
    }

    @GetMapping("/{id}/detail")
    @PlmPermission("READ_DATA")
    public ResponseEntity<DetailDescriptor> detail(@PathVariable String id) {
        DstUserContext ctx = DstSecurityContext.get();
        DataMetadata m = dataService.getMetadata(id, ctx.getUserId(), ctx.getProjectSpaceId());

        List<DetailField> fields = List.of(
            new DetailField("originalName", "Original name", m.originalName()),
            new DetailField("contentType",  "Content type",  m.contentType()),
            new DetailField("sizeBytes",    "Size (bytes)",  m.sizeBytes(), "number"),
            new DetailField("sha256",       "SHA-256",       m.sha256(), "code"),
            new DetailField("refCount",     "References",    m.refCount(), "number"),
            new DetailField("createdBy",    "Created by",    m.createdBy()),
            new DetailField("createdAt",    "Created at",
                m.createdAt() != null ? m.createdAt().toString() : null, "datetime"),
            new DetailField("lastAccessed", "Last accessed",
                m.lastAccessed() != null ? m.lastAccessed().toString() : null, "datetime"),
            new DetailField("location",     "Storage location", m.location(), "code")
        );

        Map<String, String> guardIds = Map.of(
            "fileId", id,
            "projectSpaceId", ctx.getProjectSpaceId()
        );
        boolean isAdmin = ctx.isAdmin();

        List<GuardViolation> downloadViolations = guardPort.evaluate(
            "DOWNLOAD", null, null, null, isAdmin,
            new ActionGuardContext(id, null, null, "DOWNLOAD", null,
                false, false, ctx.getUserId(), Map.of(), guardIds)
        ).violations();

        List<GuardViolation> deleteViolations = guardPort.evaluate(
            "DELETE", null, null, null, isAdmin,
            new ActionGuardContext(id, null, null, "DELETE", null,
                false, false, ctx.getUserId(), Map.of(), guardIds)
        ).violations();

        List<ActionDescriptor> actions = new ArrayList<>();
        actions.add(new ActionDescriptor(
            "DOWNLOAD", "Download",
            "Stream the binary back to the browser",
            "Download", "GET", "/api/dst/data/" + id, "RAW", null, List.of(),
            false, false, null, downloadViolations, Map.of("openInNewTab", true)
        ));
        actions.add(new ActionDescriptor(
            "DELETE", "Delete",
            "Remove the file. Admin only.",
            "Trash2", "DELETE", "/api/dst/data/" + id, "RAW", null, List.of(),
            true, true, null, deleteViolations, Map.of("requiresPermission", "MANAGE_DATA")
        ));

        boolean isImage = m.contentType() != null && m.contentType().startsWith("image/");
        DetailDescriptor d = new DetailDescriptor(
            m.id(),
            new ItemTypeRef("dst", "data-object", null),
            m.originalName() != null ? m.originalName() : m.id(),
            humanSize(m.sizeBytes()) + (m.contentType() != null ? "  ·  " + m.contentType() : ""),
            "FileText", "#6366f1",
            fields, actions,
            Map.of("isImage", isImage, "downloadUrl", "/api/dst/data/" + id)
        );
        return ResponseEntity.ok(d);
    }

    private static String humanSize(long b) {
        if (b < 1024) return b + " B";
        if (b < 1024L * 1024) return String.format("%.1f KB", b / 1024.0);
        if (b < 1024L * 1024 * 1024) return String.format("%.1f MB", b / (1024.0 * 1024));
        return String.format("%.2f GB", b / (1024.0 * 1024 * 1024));
    }
}
