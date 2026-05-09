package com.cad.ingestion;

import com.cad.ingestion.model.ImportJob;
import com.cad.ingestion.model.ImportJobResult;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ImportJobRepository {

    private final DSLContext dsl;

    public ImportJob createJob(ImportJob job) {
        if (job.getId() == null) job.setId(UUID.randomUUID());
        dsl.execute(
            "INSERT INTO cad_import_job (id, status, import_context, filename, file_count, psm_tx_id, " +
            "root_node_id, project_space_id, created_by, created_at, started_at, completed_at, error_summary) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            job.getId(), job.getStatus(), job.getImportContext(), job.getFilename(),
            job.getFileCount(), job.getPsmTxId(), job.getRootNodeId(),
            job.getProjectSpaceId(), job.getCreatedBy(),
            job.getCreatedAt(), job.getStartedAt(), job.getCompletedAt(), job.getErrorSummary()
        );
        return job;
    }

    public ImportJob findById(UUID id) {
        return dsl.fetchOne(
            "SELECT id, status, import_context, filename, file_count, psm_tx_id, root_node_id, " +
            "project_space_id, created_by, created_at, started_at, completed_at, error_summary " +
            "FROM cad_import_job WHERE id = ?", id
        ).map(r -> {
            ImportJob j = new ImportJob();
            j.setId(r.get("id", UUID.class));
            j.setStatus(r.get("status", String.class));
            j.setImportContext(r.get("import_context", String.class));
            j.setFilename(r.get("filename", String.class));
            j.setFileCount(r.get("file_count", Integer.class));
            j.setPsmTxId(r.get("psm_tx_id", UUID.class));
            j.setRootNodeId(r.get("root_node_id", UUID.class));
            j.setProjectSpaceId(r.get("project_space_id", String.class));
            j.setCreatedBy(r.get("created_by", String.class));
            j.setCreatedAt(r.get("created_at", LocalDateTime.class));
            j.setStartedAt(r.get("started_at", LocalDateTime.class));
            j.setCompletedAt(r.get("completed_at", LocalDateTime.class));
            j.setErrorSummary(r.get("error_summary", String.class));
            return j;
        });
    }

    public List<ImportJob> findByUser(String userId, int page, int size) {
        return dsl.fetch(
            "SELECT id, status, import_context, filename, file_count, psm_tx_id, root_node_id, " +
            "project_space_id, created_by, created_at, started_at, completed_at, error_summary " +
            "FROM cad_import_job WHERE created_by = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            userId, size, (long) page * size
        ).map(r -> {
            ImportJob j = new ImportJob();
            j.setId(r.get("id", UUID.class));
            j.setStatus(r.get("status", String.class));
            j.setImportContext(r.get("import_context", String.class));
            j.setFilename(r.get("filename", String.class));
            j.setFileCount(r.get("file_count", Integer.class));
            j.setPsmTxId(r.get("psm_tx_id", UUID.class));
            j.setRootNodeId(r.get("root_node_id", UUID.class));
            j.setProjectSpaceId(r.get("project_space_id", String.class));
            j.setCreatedBy(r.get("created_by", String.class));
            j.setCreatedAt(r.get("created_at", LocalDateTime.class));
            j.setStartedAt(r.get("started_at", LocalDateTime.class));
            j.setCompletedAt(r.get("completed_at", LocalDateTime.class));
            j.setErrorSummary(r.get("error_summary", String.class));
            return j;
        });
    }

    public void updateStatus(UUID id, String status, LocalDateTime timestamp, String error) {
        String col = switch (status) {
            case "RUNNING" -> "started_at";
            case "DONE", "FAILED" -> "completed_at";
            default -> null;
        };
        if (col != null) {
            dsl.execute(
                "UPDATE cad_import_job SET status = ?, " + col + " = ?, error_summary = ? WHERE id = ?",
                status, timestamp, error, id
            );
        } else {
            dsl.execute(
                "UPDATE cad_import_job SET status = ?, error_summary = ? WHERE id = ?",
                status, error, id
            );
        }
    }

    public void savePsmTxId(UUID jobId, UUID txId) {
        dsl.execute("UPDATE cad_import_job SET psm_tx_id = ? WHERE id = ?", txId, jobId);
    }

    public void saveResult(ImportJobResult result) {
        if (result.getId() == null) result.setId(UUID.randomUUID());
        dsl.execute(
            "INSERT INTO cad_import_job_result (id, job_id, cad_node_id, cad_node_name, cad_node_type, " +
            "action, psm_node_id, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            result.getId(), result.getJobId(), result.getCadNodeId(), result.getCadNodeName(),
            result.getCadNodeType(), result.getAction(), result.getPsmNodeId(), result.getErrorMessage()
        );
    }

    public List<ImportJobResult> findResultsByJobId(UUID jobId) {
        return dsl.fetch(
            "SELECT id, job_id, cad_node_id, cad_node_name, cad_node_type, action, psm_node_id, error_message " +
            "FROM cad_import_job_result WHERE job_id = ? ORDER BY id",
            jobId
        ).map(r -> {
            ImportJobResult res = new ImportJobResult();
            res.setId(r.get("id", UUID.class));
            res.setJobId(r.get("job_id", UUID.class));
            res.setCadNodeId(r.get("cad_node_id", String.class));
            res.setCadNodeName(r.get("cad_node_name", String.class));
            res.setCadNodeType(r.get("cad_node_type", String.class));
            res.setAction(r.get("action", String.class));
            res.setPsmNodeId(r.get("psm_node_id", UUID.class));
            res.setErrorMessage(r.get("error_message", String.class));
            return res;
        });
    }
}
