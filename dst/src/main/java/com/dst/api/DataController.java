package com.dst.api;

import com.dst.domain.DataMetadata;
import com.dst.domain.DataService;
import com.dst.security.DstSecurityContext;
import com.plm.platform.authz.PlmPermission;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Public DST surface (mounted under {@code /api/dst} via the gateway).
 *
 * <ul>
 *   <li>{@code POST /data}         — upload binary, returns metadata + UUID</li>
 *   <li>{@code GET  /data/{id}}    — download binary, bumps last_accessed</li>
 *   <li>{@code GET  /data/{id}/metadata} — metadata only</li>
 *   <li>{@code DELETE /data/{id}}  — remove (admin)</li>
 * </ul>
 */
@RestController
@RequestMapping("/data")
@RequiredArgsConstructor
public class DataController {

    private final DataService dataService;

    @GetMapping
    @PlmPermission("READ_DATA")
    public ResponseEntity<List<DataMetadata>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(dataService.list(page, size));
    }

    @PostMapping
    @PlmPermission("WRITE_DATA")
    public ResponseEntity<DataMetadata> upload(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "name", required = false) String name
    ) throws IOException {
        String userId = DstSecurityContext.get().getUserId();
        String originalName = (name != null && !name.isBlank()) ? name : file.getOriginalFilename();
        DataMetadata meta = dataService.upload(userId, originalName, file.getContentType(), file.getInputStream());
        return ResponseEntity.ok(meta);
    }

    @GetMapping("/{id}/metadata")
    @PlmPermission("READ_DATA")
    public ResponseEntity<DataMetadata> metadata(@PathVariable String id) {
        return ResponseEntity.ok(dataService.getMetadata(id, DstSecurityContext.get().getUserId()));
    }

    @GetMapping("/{id}")
    @PlmPermission("READ_DATA")
    public ResponseEntity<InputStreamResource> download(@PathVariable String id) {
        String userId = DstSecurityContext.get().getUserId();
        DataMetadata meta = dataService.download(id, userId);

        HttpHeaders headers = new HttpHeaders();
        if (meta.originalName() != null && !meta.originalName().isBlank()) {
            headers.setContentDisposition(ContentDisposition.attachment()
                .filename(meta.originalName(), StandardCharsets.UTF_8).build());
        }
        headers.setContentLength(meta.sizeBytes());
        headers.add("X-Data-Sha256", meta.sha256());

        MediaType type = meta.contentType() != null
            ? MediaType.parseMediaType(meta.contentType())
            : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok().headers(headers).contentType(type)
            .body(new InputStreamResource(dataService.openStream(meta.location())));
    }

    @DeleteMapping("/{id}")
    @PlmPermission("MANAGE_DATA")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        dataService.delete(id, DstSecurityContext.get().getUserId());
        return ResponseEntity.noContent().build();
    }
}
