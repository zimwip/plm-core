package com.cad.ingestion;

import com.cad.algorithm.CadNodeData;
import com.cad.algorithm.DefaultImportContextAlgorithm;
import com.cad.algorithm.ImportContextAlgorithm;
import com.cad.algorithm.ImportDecision;
import com.cad.algorithm.ImportJobContext;
import com.cad.ingestion.client.CadParserClient;
import com.cad.ingestion.client.DstStorageClient;
import com.cad.ingestion.client.PsmActionClient;
import com.cad.ingestion.client.PsmValidationClient;
import com.plm.platform.spe.client.ServiceClientTokenContext;
import com.cad.ingestion.model.ImportJobResult;
import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.nats.PlmMessageBus;
import com.plm.platform.spe.client.ServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class ImportJobProcessor {

    private final ImportJobRepository  repository;
    private final CadParserClient      parserClient;
    private final PsmActionClient      psmClient;
    private final PsmValidationClient  validationClient;
    private final AlgorithmRegistry    algorithmRegistry;
    private final ServiceClient        serviceClient;
    private final DstStorageClient     dstClient;

    @Autowired(required = false)
    private PlmMessageBus messageBus;

    public ImportJobProcessor(
            ImportJobRepository repository,
            CadParserClient parserClient,
            PsmActionClient psmClient,
            PsmValidationClient validationClient,
            AlgorithmRegistry algorithmRegistry,
            ServiceClient serviceClient,
            DstStorageClient dstClient) {
        this.repository        = repository;
        this.parserClient      = parserClient;
        this.psmClient         = psmClient;
        this.validationClient  = validationClient;
        this.algorithmRegistry = algorithmRegistry;
        this.serviceClient     = serviceClient;
        this.dstClient         = dstClient;
    }

    @Async
    public void process(UUID jobId, byte[] fileBytes, String filename, ImportJobContext ctx) {
        log.info("Starting import job {} file={} contextCode={}", jobId, filename, ctx.importContextCode());

        repository.updateStatus(jobId, "RUNNING", LocalDateTime.now(), null);

        boolean ownTx = ctx.psmTxId() == null;
        String txId = null;
        int nodeCount = 0;
        try {
            List<CadNodeData> nodes = parserClient.parse(fileBytes, filename);
            log.info("Job {} parsed {} nodes from {}", jobId, nodes.size(), filename);
            nodeCount = nodes.size();

            txId = ownTx ? psmClient.openTransaction() : ctx.psmTxId();
            if (ownTx) repository.savePsmTxId(jobId, UUID.fromString(txId));

            ImportJobContext ctxWithTx = new ImportJobContext(
                ctx.jobId(), ctx.projectSpaceId(), ctx.userId(),
                ctx.importContextCode(), txId, ctx.rootNodeId()
            );

            // Fetch import context config from PSA to get node validation instance ID
            Map<String, Object> importContextConfig = fetchImportContext(ctx.importContextCode());
            String nodeValidationInstanceId = importContextConfig != null
                ? (String) importContextConfig.get("nodeValidationAlgorithmInstanceId") : null;

            ImportContextAlgorithm algorithm = resolveAlgorithm(ctx.importContextCode());

            Map<String, UUID>   cadIdToNodeId    = new HashMap<>();
            Map<String, String> cadIdToLogicalId = new HashMap<>();

            for (CadNodeData node : nodes) {
                // 1. PSM validation first
                PsmValidationClient.ValidationResult validation = validationClient.validateNode(
                    node.cadId(), node.name(), node.cadType(),
                    node.attributes(), ctx.importContextCode(), nodeValidationInstanceId
                );

                ImportDecision decision;
                if (!validation.valid()) {
                    decision = ImportDecision.reject(validation.rejectReason());
                } else {
                    // Pass enriched attributes and suggested type to algorithm
                    CadNodeData enrichedNode = node.attributes().equals(validation.enrichedAttributes())
                        ? node
                        : new CadNodeData(node.cadId(), node.name(),
                            validation.suggestedNodeTypeId() != null ? validation.suggestedNodeTypeId() : node.cadType(),
                            validation.enrichedAttributes(), node.parentCadId(), node.depth());
                    decision = algorithm.evaluate(enrichedNode, ctxWithTx);
                }

                ImportJobResult result = processNode(jobId, node, decision, txId, ctx.projectSpaceId());
                repository.saveResult(result);

                if (result.getPsmNodeId() != null) {
                    cadIdToNodeId.put(node.cadId(), result.getPsmNodeId());
                    if (decision.logicalId() != null) {
                        cadIdToLogicalId.put(node.cadId(), decision.logicalId());
                    }
                }
            }

            for (CadNodeData node : nodes) {
                if (node.parentCadId() != null) {
                    UUID   parentPsmId      = cadIdToNodeId.get(node.parentCadId());
                    UUID   childPsmId       = cadIdToNodeId.get(node.cadId());
                    String childLogicalId   = cadIdToLogicalId.get(node.cadId());
                    if (parentPsmId != null && childPsmId != null && childLogicalId != null) {
                        try {
                            psmClient.createLink(parentPsmId, childLogicalId, "lt-composed-of", txId, ctx.projectSpaceId());
                        } catch (Exception e) {
                            log.warn("Job {}: failed to create BOM link {} -> {}: {}",
                                jobId, parentPsmId, childLogicalId, e.getMessage());
                        }
                    }
                }
            }

            if (ctx.rootNodeId() != null) {
                UUID rootPsmId = UUID.fromString(ctx.rootNodeId());
                for (CadNodeData node : nodes) {
                    if (node.parentCadId() == null) {
                        UUID   childPsmId     = cadIdToNodeId.get(node.cadId());
                        String childLogicalId = cadIdToLogicalId.get(node.cadId());
                        if (childPsmId != null && childLogicalId != null) {
                            try {
                                psmClient.createLink(rootPsmId, childLogicalId, "lt-composed-of", txId, ctx.projectSpaceId());
                            } catch (Exception e) {
                                log.warn("Job {}: failed to link root {} -> {}: {}",
                                    jobId, rootPsmId, childLogicalId, e.getMessage());
                            }
                        }
                    }
                }
            }

            // Upload original CAD file to DST and create "represented by" links on top-level nodes
            try {
                String dstBaseUrl = serviceClient.resolveBaseUrl("dst");
                String authToken  = ServiceClientTokenContext.get();
                String dstFileId  = dstClient.upload(fileBytes, filename, null,
                                                      authToken, ctx.projectSpaceId(), dstBaseUrl);
                if (dstFileId != null) {
                    log.info("Job {}: DST upload succeeded, dstFileId={}", jobId, dstFileId);
                    for (CadNodeData node : nodes) {
                        if (node.parentCadId() == null) {
                            UUID rootImportedId = cadIdToNodeId.get(node.cadId());
                            if (rootImportedId != null) {
                                try {
                                    psmClient.createLink(rootImportedId, dstFileId,
                                                         "lt-part-data", txId, ctx.projectSpaceId());
                                } catch (Exception e) {
                                    log.warn("Job {}: lt-part-data link {} -> {} failed: {}",
                                             jobId, rootImportedId, dstFileId, e.getMessage());
                                }
                            }
                        }
                    }
                } else {
                    log.warn("Job {}: DST upload returned no ID, skipping lt-part-data links", jobId);
                }
            } catch (Exception e) {
                log.warn("Job {}: DST upload failed: {}", jobId, e.getMessage());
            }

            // Transaction is left open: user reviews imported nodes and commits/rolls back manually.
            repository.updateStatus(jobId, "DONE", LocalDateTime.now(), null);
            log.info("Import job {} completed ({} nodes, tx={} open for review)", jobId, nodes.size(), txId);

            publishJobEvent(ctx, jobId.toString(), "DONE", nodes.size(), null);

        } catch (Exception e) {
            log.error("Import job {} failed: {}", jobId, e.getMessage(), e);
            if (ownTx && txId != null) psmClient.rollback(txId, ctx.projectSpaceId());
            repository.updateStatus(jobId, "FAILED", LocalDateTime.now(), e.getMessage());
            publishJobEvent(ctx, jobId.toString(), "FAILED", nodeCount, e.getMessage());
        }
    }

    private ImportJobResult processNode(UUID jobId, CadNodeData node,
                                        ImportDecision decision, String txId, String projectSpaceId) {
        ImportJobResult result = new ImportJobResult();
        result.setJobId(jobId);
        result.setCadNodeId(node.cadId());
        result.setCadNodeName(node.name());
        result.setCadNodeType(node.cadType());

        try {
            switch (decision.action()) {
                case CREATE -> {
                    UUID nodeId = psmClient.createNode(
                        decision.nodeTypeId(), decision.logicalId(), node.cadId(),
                        decision.attributes(), txId, projectSpaceId
                    );
                    result.setPsmNodeId(nodeId);
                    result.setAction("CREATED");
                }
                case UPDATE -> {
                    UUID targetId = UUID.fromString(decision.targetNodeId());
                    psmClient.updateNode(targetId, decision.attributes(), txId, projectSpaceId);
                    result.setPsmNodeId(targetId);
                    result.setAction("UPDATED");
                }
                case SKIP   -> result.setAction("SKIPPED");
                case REJECT -> {
                    result.setAction("REJECTED");
                    result.setErrorMessage(decision.rejectReason());
                }
            }
        } catch (Exception e) {
            log.warn("Job {}: node {} action {} failed: {}", jobId, node.cadId(), decision.action(), e.getMessage());
            result.setAction("REJECTED");
            result.setErrorMessage(e.getMessage());
        }

        return result;
    }

    private ImportContextAlgorithm resolveAlgorithm(String contextCode) {
        String code = (contextCode != null && !contextCode.isBlank()) ? contextCode : "default";
        if (algorithmRegistry.hasBean(code)) {
            return algorithmRegistry.resolve(code, ImportContextAlgorithm.class);
        }
        log.warn("No algorithm bean for context '{}', falling back to default", code);
        return new DefaultImportContextAlgorithm();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchImportContext(String contextCode) {
        if (contextCode == null || contextCode.isBlank() || "default".equals(contextCode)) return null;
        try {
            return serviceClient.get("psa", "/api/psa/internal/import-contexts/" + contextCode, Map.class);
        } catch (Exception e) {
            log.warn("Could not fetch import context '{}' from PSA: {}", contextCode, e.getMessage());
            return null;
        }
    }

    private void publishJobEvent(ImportJobContext ctx, String jobId, String status,
                                  int nodeCount, String errorSummary) {
        if (messageBus == null) return;
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("jobId",        jobId);
            payload.put("status",       status);
            payload.put("nodeCount",    nodeCount);
            payload.put("rootNodeId",   ctx.rootNodeId());
            payload.put("contextCode",  ctx.importContextCode());
            if (errorSummary != null) payload.put("errorSummary", errorSummary);

            messageBus.sendToUser(ctx.projectSpaceId(), ctx.userId(), "IMPORT_JOB_DONE", payload);
            log.debug("Published IMPORT_JOB_DONE for job={} user={}", jobId, ctx.userId());
        } catch (Exception e) {
            log.warn("Failed to publish IMPORT_JOB_DONE event for job {}: {}", jobId, e.getMessage());
        }
    }
}
