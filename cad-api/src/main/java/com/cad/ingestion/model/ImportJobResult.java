package com.cad.ingestion.model;

import java.util.UUID;

public class ImportJobResult {
    private UUID id;
    private UUID jobId;
    private String cadNodeId;
    private String cadNodeName;
    private String cadNodeType;
    private String action; // CREATED, UPDATED, SKIPPED, REJECTED
    private UUID psmNodeId;
    private String errorMessage;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }

    public String getCadNodeId() { return cadNodeId; }
    public void setCadNodeId(String cadNodeId) { this.cadNodeId = cadNodeId; }

    public String getCadNodeName() { return cadNodeName; }
    public void setCadNodeName(String cadNodeName) { this.cadNodeName = cadNodeName; }

    public String getCadNodeType() { return cadNodeType; }
    public void setCadNodeType(String cadNodeType) { this.cadNodeType = cadNodeType; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public UUID getPsmNodeId() { return psmNodeId; }
    public void setPsmNodeId(UUID psmNodeId) { this.psmNodeId = psmNodeId; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
