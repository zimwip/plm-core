package com.cad.ingestion;

import com.cad.ingestion.model.ImportJob;
import com.cad.ingestion.model.ImportJobResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Internal import endpoints — protected by X-Service-Secret (PlmAuthFilter).
 * Not exposed to end users; triggered by psm-api's CadImportActionHandler.
 */
@RestController
@RequestMapping("/internal/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportJobService jobService;

    /**
     * Submit a CAD import job. Called by psm-api's CadImportActionHandler.
     * userId and projectSpaceId are passed explicitly (no JWT user context in S2S calls).
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, Object> submit(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String nodeId,
            @RequestParam(defaultValue = "default") String contextCode,
            @RequestParam String userId,
            @RequestParam(required = false) String projectSpaceId,
            @RequestParam(required = false) String psmTxId,
            @RequestParam(defaultValue = "false") boolean splitMode) throws IOException {

        byte[] bytes = file.getBytes();
        UUID rootNodeId = nodeId != null && !nodeId.isBlank() ? UUID.fromString(nodeId) : null;

        ImportJob job = jobService.submit(
            userId,
            projectSpaceId,
            file.getOriginalFilename(),
            contextCode,
            rootNodeId,
            bytes,
            psmTxId,
            splitMode
        );

        return Map.of("jobId", job.getId().toString(), "status", job.getStatus());
    }

    @GetMapping("/{jobId}")
    public Map<String, Object> status(@PathVariable UUID jobId) {
        ImportJob job     = jobService.getJob(jobId);
        List<ImportJobResult> results = jobService.getResults(jobId);
        return Map.of(
            "job",     jobToMap(job),
            "results", results.stream().map(this::resultToMap).toList()
        );
    }

    private Map<String, Object> jobToMap(ImportJob j) {
        java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("id",             j.getId());
        m.put("status",         j.getStatus());
        m.put("importContext",  j.getImportContext());
        m.put("filename",       j.getFilename());
        m.put("fileCount",      j.getFileCount());
        m.put("projectSpaceId", j.getProjectSpaceId());
        m.put("createdBy",      j.getCreatedBy());
        m.put("createdAt",      j.getCreatedAt());
        m.put("startedAt",      j.getStartedAt());
        m.put("completedAt",    j.getCompletedAt());
        m.put("rootNodeId",     j.getRootNodeId());
        m.put("errorSummary",   j.getErrorSummary());
        if (j.getPsmTxId() != null) m.put("psmTxId", j.getPsmTxId());
        return m;
    }

    private Map<String, Object> resultToMap(ImportJobResult r) {
        java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("id",           r.getId());
        m.put("cadNodeId",    r.getCadNodeId());
        m.put("name",         r.getCadNodeName());
        m.put("type",         r.getCadNodeType());
        m.put("action",       r.getAction());
        m.put("psmNodeId",    r.getPsmNodeId());
        m.put("errorMessage", r.getErrorMessage());
        return m;
    }
}
