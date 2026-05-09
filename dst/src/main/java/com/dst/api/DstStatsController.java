package com.dst.api;

import com.plm.platform.authz.PlmPermission;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class DstStatsController {

    private final DSLContext dsl;

    @Value("${dst.storage.root:/tmp/dst-data}")
    private String storageRoot;

    @Value("${spring.servlet.multipart.max-file-size:40MB}")
    private String maxFileSize;

    @GetMapping
    @PlmPermission("MANAGE_DATA")
    public ResponseEntity<DstStatsDto> getStats() {
        Record totals = dsl.fetchOne(
            "SELECT COUNT(*) AS file_count, COALESCE(SUM(size_bytes), 0) AS total_size FROM data_object");

        List<DstStatsDto.ProjectSpaceStat> perPs = dsl.fetch(
            "SELECT project_space_id, COUNT(*) AS file_count, COALESCE(SUM(size_bytes), 0) AS total_size " +
            "FROM data_object GROUP BY project_space_id ORDER BY total_size DESC"
        ).map(r -> new DstStatsDto.ProjectSpaceStat(
            r.get("project_space_id", String.class),
            r.get("file_count", Long.class),
            r.get("total_size", Long.class)
        ));

        List<DstStatsDto.ContentTypeStat> perCt = dsl.fetch(
            "SELECT content_type, COUNT(*) AS file_count FROM data_object " +
            "GROUP BY content_type ORDER BY file_count DESC"
        ).map(r -> new DstStatsDto.ContentTypeStat(
            r.get("content_type", String.class),
            r.get("file_count", Long.class)
        ));

        return ResponseEntity.ok(new DstStatsDto(
            totals.get("file_count", Long.class),
            totals.get("total_size", Long.class),
            storageRoot,
            maxFileSize,
            perPs,
            perCt
        ));
    }
}
