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
import com.cad.ingestion.model.SplitPart;
import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.nats.PlmMessageBus;
import com.plm.platform.spe.client.ServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
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
            txId = ownTx ? psmClient.openTransaction() : ctx.psmTxId();
            if (ownTx) repository.savePsmTxId(jobId, UUID.fromString(txId));

            ImportJobContext ctxWithTx = new ImportJobContext(
                ctx.jobId(), ctx.projectSpaceId(), ctx.userId(),
                ctx.importContextCode(), txId, ctx.rootNodeId(), ctx.splitMode()
            );

            Map<String, Object> importContextConfig = fetchImportContext(ctx.importContextCode());
            String nodeValidationInstanceId = importContextConfig != null
                ? (String) importContextConfig.get("nodeValidationAlgorithmInstanceId") : null;

            ImportContextAlgorithm algorithm = resolveAlgorithm(ctx.importContextCode());

            if (ctx.splitMode()) {
                // ── SPLIT MODE ────────────────────────────────────────────────────────────
                // Parser returns one minimal STEP file per product node; each node that is
                // created or updated gets its own DST entry + lt-part-data link.
                List<SplitPart> parts = parserClient.split(fileBytes, filename);
                nodeCount = parts.size();
                log.info("Job {} split mode: {} parts from {}", jobId, parts.size(), filename);

                String dstBaseUrl = serviceClient.resolveBaseUrl("dst");
                String authToken  = ServiceClientTokenContext.get();

                record SplitDecision(SplitPart part, ImportDecision decision) {}
                List<SplitDecision> planned = new ArrayList<>(parts.size());
                for (SplitPart part : parts) {
                    PsmValidationClient.ValidationResult validation = validationClient.validateNode(
                        part.cadId(), part.name(), part.cadType(),
                        part.attributes(), ctx.importContextCode(), nodeValidationInstanceId);

                    ImportDecision decision;
                    if (!validation.valid()) {
                        decision = ImportDecision.reject(validation.rejectReason());
                    } else {
                        CadNodeData nodeData = new CadNodeData(part.cadId(), part.name(),
                            validation.suggestedNodeTypeId() != null ? validation.suggestedNodeTypeId() : part.cadType(),
                            validation.enrichedAttributes() != null ? validation.enrichedAttributes() : part.attributes(),
                            part.parentCadId(), 0);
                        decision = algorithm.evaluate(nodeData, ctxWithTx);
                    }
                    if (decision.action() == ImportDecision.Action.CREATE) {
                        UUID existing = psmClient.findByExternalId(part.cadId(), ctx.projectSpaceId());
                        if (existing != null) {
                            log.debug("Job {}: externalId={} maps to {}, switching to UPDATE", jobId, part.cadId(), existing);
                            decision = ImportDecision.update(existing.toString(), decision.attributes());
                        }
                    }
                    planned.add(new SplitDecision(part, decision));
                }

                Map<String, UUID>   cadIdToNodeId    = new HashMap<>();
                Map<String, String> cadIdToLogicalId = new HashMap<>();

                for (SplitDecision sd : planned) {
                    CadNodeData nodeData = new CadNodeData(
                        sd.part().cadId(), sd.part().name(), sd.part().cadType(),
                        sd.part().attributes(), sd.part().parentCadId(), 0);
                    ImportJobResult result = processNode(jobId, nodeData, sd.decision(), txId, ctx.projectSpaceId());
                    repository.saveResult(result);

                    if (result.getPsmNodeId() != null) {
                        cadIdToNodeId.put(sd.part().cadId(), result.getPsmNodeId());
                        if (sd.decision().logicalId() != null)
                            cadIdToLogicalId.put(sd.part().cadId(), sd.decision().logicalId());

                        // Upload per-part file to DST → lt-part-data link
                        boolean acted = "CREATED".equals(result.getAction()) || "UPDATED".equals(result.getAction());
                        if (acted && sd.part().fileBytes().length > 0) {
                            try {
                                String partFilename = sd.part().name().replaceAll("[^a-zA-Z0-9._-]", "_") + ".step";
                                String dstFileId = dstClient.upload(
                                    sd.part().fileBytes(), partFilename, null,
                                    authToken, ctx.projectSpaceId(), dstBaseUrl);
                                if (dstFileId != null) {
                                    psmClient.createLink(result.getPsmNodeId(), dstFileId,
                                                         "lt-part-data", txId, ctx.projectSpaceId());
                                    dstClient.unref(dstFileId, authToken, ctx.projectSpaceId(), dstBaseUrl);
                                    log.debug("Job {}: part {} → DST {} lt-part-data", jobId, sd.part().cadId(), dstFileId);
                                }
                            } catch (Exception e) {
                                log.warn("Job {}: DST upload for part {} failed: {}", jobId, sd.part().cadId(), e.getMessage());
                            }
                        }
                    }
                }

                // BOM links
                for (SplitDecision sd : planned) {
                    if (sd.part().parentCadId() != null) {
                        UUID   parentPsmId    = cadIdToNodeId.get(sd.part().parentCadId());
                        UUID   childPsmId     = cadIdToNodeId.get(sd.part().cadId());
                        String childLogicalId = cadIdToLogicalId.get(sd.part().cadId());
                        if (parentPsmId != null && childPsmId != null && childLogicalId != null) {
                            try {
                                psmClient.createLink(parentPsmId, childLogicalId, "lt-composed-of", txId, ctx.projectSpaceId());
                            } catch (Exception e) {
                                log.warn("Job {}: BOM link {} -> {} failed: {}", jobId, parentPsmId, childLogicalId, e.getMessage());
                            }
                        }
                    }
                }
                if (ctx.rootNodeId() != null) {
                    UUID rootPsmId = UUID.fromString(ctx.rootNodeId());
                    for (SplitDecision sd : planned) {
                        if (sd.part().parentCadId() == null) {
                            UUID   childPsmId     = cadIdToNodeId.get(sd.part().cadId());
                            String childLogicalId = cadIdToLogicalId.get(sd.part().cadId());
                            if (childPsmId != null && childLogicalId != null) {
                                try {
                                    psmClient.createLink(rootPsmId, childLogicalId, "lt-composed-of", txId, ctx.projectSpaceId());
                                } catch (Exception e) {
                                    log.warn("Job {}: root link {} -> {} failed: {}", jobId, rootPsmId, childLogicalId, e.getMessage());
                                }
                            }
                        }
                    }
                }

            } else {
                // ── NORMAL MODE ───────────────────────────────────────────────────────────
                List<CadNodeData> nodes = parserClient.parse(fileBytes, filename);
                log.info("Job {} parsed {} nodes from {}", jobId, nodes.size(), filename);
                nodeCount = nodes.size();

                Map<String, UUID>   cadIdToNodeId    = new HashMap<>();
                Map<String, String> cadIdToLogicalId = new HashMap<>();

                // Phase 1 — gather
                record NodeDecision(CadNodeData node, ImportDecision decision) {}
                List<NodeDecision> planned = new ArrayList<>(nodes.size());
                for (CadNodeData node : nodes) {
                    PsmValidationClient.ValidationResult validation = validationClient.validateNode(
                        node.cadId(), node.name(), node.cadType(),
                        node.attributes(), ctx.importContextCode(), nodeValidationInstanceId);

                    ImportDecision decision;
                    if (!validation.valid()) {
                        decision = ImportDecision.reject(validation.rejectReason());
                    } else {
                        CadNodeData enrichedNode = node.attributes().equals(validation.enrichedAttributes())
                            ? node
                            : new CadNodeData(node.cadId(), node.name(),
                                validation.suggestedNodeTypeId() != null ? validation.suggestedNodeTypeId() : node.cadType(),
                                validation.enrichedAttributes(), node.parentCadId(), node.depth());
                        decision = algorithm.evaluate(enrichedNode, ctxWithTx);
                    }
                    if (decision.action() == ImportDecision.Action.CREATE) {
                        UUID existing = psmClient.findByExternalId(node.cadId(), ctx.projectSpaceId());
                        if (existing != null) {
                            log.debug("Job {}: externalId={} maps to existing node {}, switching to UPDATE",
                                      jobId, node.cadId(), existing);
                            decision = ImportDecision.update(existing.toString(), decision.attributes());
                        }
                    }
                    planned.add(new NodeDecision(node, decision));
                }

                // Phase 2 — sort: leaves first
                planned.sort(Comparator.comparingInt((NodeDecision nd) -> nd.node().depth()).reversed());

                // Phase 3 — execute
                for (NodeDecision nd : planned) {
                    ImportJobResult result = processNode(jobId, nd.node(), nd.decision(), txId, ctx.projectSpaceId());
                    repository.saveResult(result);
                    if (result.getPsmNodeId() != null) {
                        cadIdToNodeId.put(nd.node().cadId(), result.getPsmNodeId());
                        if (nd.decision().logicalId() != null)
                            cadIdToLogicalId.put(nd.node().cadId(), nd.decision().logicalId());
                    }
                }

                // Phase 4 — BOM links
                for (CadNodeData node : nodes) {
                    if (node.parentCadId() != null) {
                        UUID   parentPsmId    = cadIdToNodeId.get(node.parentCadId());
                        UUID   childPsmId     = cadIdToNodeId.get(node.cadId());
                        String childLogicalId = cadIdToLogicalId.get(node.cadId());
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

                // Phase 5 — upload original file to DST, link root nodes
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
                        dstClient.unref(dstFileId, authToken, ctx.projectSpaceId(), dstBaseUrl);
                    } else {
                        log.warn("Job {}: DST upload returned no ID, skipping lt-part-data links", jobId);
                    }
                } catch (Exception e) {
                    log.warn("Job {}: DST upload failed: {}", jobId, e.getMessage());
                }
            }

            // Transaction is left open: user reviews imported nodes and commits/rolls back manually.
            repository.updateStatus(jobId, "DONE", LocalDateTime.now(), null);
            log.info("Import job {} completed ({} nodes, tx={} open for review)", jobId, nodeCount, txId);

            publishJobEvent(ctx, jobId.toString(), "DONE", nodeCount, null);

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
