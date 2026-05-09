package com.cad.ingestion.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class ImportJob {
    private UUID id;
    private String status; // PENDING, RUNNING, DONE, FAILED
    private String importContext;
    private String filename;
    private int fileCount;
    private UUID psmTxId;
    private UUID rootNodeId;
    private String projectSpaceId;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String errorSummary;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImportContext() { return importContext; }
    public void setImportContext(String importContext) { this.importContext = importContext; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public int getFileCount() { return fileCount; }
    public void setFileCount(int fileCount) { this.fileCount = fileCount; }

    public UUID getPsmTxId() { return psmTxId; }
    public void setPsmTxId(UUID psmTxId) { this.psmTxId = psmTxId; }

    public UUID getRootNodeId() { return rootNodeId; }
    public void setRootNodeId(UUID rootNodeId) { this.rootNodeId = rootNodeId; }

    public String getProjectSpaceId() { return projectSpaceId; }
    public void setProjectSpaceId(String projectSpaceId) { this.projectSpaceId = projectSpaceId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getErrorSummary() { return errorSummary; }
    public void setErrorSummary(String errorSummary) { this.errorSummary = errorSummary; }
}
