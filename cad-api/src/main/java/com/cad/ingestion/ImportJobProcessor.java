package com.cad.ingestion;

import com.cad.algorithm.CadNodeData;
import com.cad.algorithm.CadOccurrence;
import com.cad.algorithm.DefaultImportContextAlgorithm;
import com.cad.algorithm.ImportContextAlgorithm;
import com.cad.algorithm.ImportDecision;
import com.cad.algorithm.ImportJobContext;
import com.cad.algorithm.ImportLinkDecision;
import com.cad.ingestion.client.CadParserClient;
import com.cad.ingestion.client.DstStorageClient;
import com.cad.ingestion.client.PsmActionClient;
import com.cad.ingestion.client.PsmValidationClient;
import com.plm.platform.client.ServiceClientTokenContext;
import com.cad.ingestion.model.ImportJobResult;
import com.cad.ingestion.model.SplitPart;
import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.nats.PlmMessageBus;
import com.plm.platform.client.ServiceClient;
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
        List<String> warnings = new ArrayList<>();
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
                            part.occurrences(), 0);
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
                        sd.part().attributes(), sd.part().occurrences(), 0);
                    ImportJobResult result = processNode(jobId, nodeData, sd.decision(), txId, ctx.projectSpaceId());
                    repository.saveResult(result);
                    if ("REJECTED".equals(result.getAction())) {
                        warnings.add("Node rejected [" + result.getCadNodeName() + "]: " + result.getErrorMessage());
                    }

                    if (result.getPsmNodeId() != null) {
                        cadIdToNodeId.put(sd.part().cadId(), result.getPsmNodeId());
                        if (sd.decision().logicalId() != null)
                            cadIdToLogicalId.put(sd.part().cadId(), sd.decision().logicalId());

                        // Upload per-part file to DST → lt-part-data link (kind=design)
                        // Then convert to GLB and upload a second link (kind=simplified)
                        boolean acted = "CREATED".equals(result.getAction()) || "UPDATED".equals(result.getAction());
                        if (acted && sd.part().fileBytes().length > 0) {
                            uploadPartRepresentations(jobId, sd.part().cadId(), sd.part().name(),
                                sd.part().fileBytes(), result.getPsmNodeId(),
                                authToken, ctx.projectSpaceId(), dstBaseUrl, txId, warnings);
                        }
                    }
                }

                // BOM links
                for (SplitDecision sd : planned) {
                    if (sd.part().hasOccurrences()) {
                        CadNodeData nodeData = new CadNodeData(sd.part().cadId(), sd.part().name(),
                            sd.part().cadType(), sd.part().attributes(), sd.part().occurrences(), 0);
                        for (CadOccurrence occ : sd.part().occurrences()) {
                            UUID   parentPsmId    = cadIdToNodeId.get(occ.parentCadId());
                            String childLogicalId = cadIdToLogicalId.get(sd.part().cadId());
                            if (parentPsmId != null && childLogicalId != null) {
                                try {
                                    ImportLinkDecision linkDecision = algorithm.evaluateLink(nodeData, occ, ctxWithTx);
                                    String linkId = psmClient.createLink(parentPsmId, childLogicalId,
                                            linkDecision.linkTypeId(), txId, ctx.projectSpaceId());
                                    if (linkId != null && !linkDecision.attributes().isEmpty()) {
                                        psmClient.updateLinkAttributes(linkId, parentPsmId,
                                                linkDecision.attributes(), txId, ctx.projectSpaceId());
                                    }
                                } catch (Exception e) {
                                    String msg = "BOM link failed [" + parentPsmId + " -> " + sd.part().cadId() + "]: " + e.getMessage();
                                    log.warn("Job {}: {}", jobId, msg);
                                    warnings.add(msg);
                                }
                            }
                        }
                    }
                }
                if (ctx.rootNodeId() != null) {
                    UUID rootPsmId = UUID.fromString(ctx.rootNodeId());
                    for (SplitDecision sd : planned) {
                        if (!sd.part().hasOccurrences()) {
                            UUID   childPsmId     = cadIdToNodeId.get(sd.part().cadId());
                            String childLogicalId = cadIdToLogicalId.get(sd.part().cadId());
                            if (childPsmId != null && childLogicalId != null) {
                                try {
                                    psmClient.createLink(rootPsmId, childLogicalId, "lt-composed-of", txId, ctx.projectSpaceId());
                                } catch (Exception e) {
                                    String msg = "root BOM link failed [" + rootPsmId + " -> " + childPsmId + "]: " + e.getMessage();
                                    log.warn("Job {}: {}", jobId, msg);
                                    warnings.add(msg);
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
                                validation.enrichedAttributes(), node.occurrences(), node.depth());
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
                    if ("REJECTED".equals(result.getAction())) {
                        warnings.add("Node rejected [" + result.getCadNodeName() + "]: " + result.getErrorMessage());
                    }
                    if (result.getPsmNodeId() != null) {
                        cadIdToNodeId.put(nd.node().cadId(), result.getPsmNodeId());
                        if (nd.decision().logicalId() != null)
                            cadIdToLogicalId.put(nd.node().cadId(), nd.decision().logicalId());
                    }
                }

                // Phase 4 — BOM links
                for (NodeDecision nd : planned) {
                    CadNodeData node = nd.node();
                    if (node.hasOccurrences()) {
                        for (CadOccurrence occ : node.occurrences()) {
                            UUID   parentPsmId    = cadIdToNodeId.get(occ.parentCadId());
                            String childLogicalId = cadIdToLogicalId.get(node.cadId());
                            if (parentPsmId != null && childLogicalId != null) {
                                try {
                                    ImportLinkDecision linkDecision = algorithm.evaluateLink(node, occ, ctxWithTx);
                                    String linkId = psmClient.createLink(parentPsmId, childLogicalId,
                                            linkDecision.linkTypeId(), txId, ctx.projectSpaceId());
                                    if (linkId != null && !linkDecision.attributes().isEmpty()) {
                                        psmClient.updateLinkAttributes(linkId, parentPsmId,
                                                linkDecision.attributes(), txId, ctx.projectSpaceId());
                                    }
                                } catch (Exception e) {
                                    String msg = "BOM link failed [" + parentPsmId + " -> " + node.cadId() + "]: " + e.getMessage();
                                    log.warn("Job {}: {}", jobId, msg);
                                    warnings.add(msg);
                                }
                            }
                        }
                    }
                }
                if (ctx.rootNodeId() != null) {
                    UUID rootPsmId = UUID.fromString(ctx.rootNodeId());
                    for (NodeDecision nd : planned) {
                        CadNodeData node = nd.node();
                        if (!node.hasOccurrences()) {
                            UUID   childPsmId     = cadIdToNodeId.get(node.cadId());
                            String childLogicalId = cadIdToLogicalId.get(node.cadId());
                            if (childPsmId != null && childLogicalId != null) {
                                try {
                                    psmClient.createLink(rootPsmId, childLogicalId, "lt-composed-of", txId, ctx.projectSpaceId());
                                } catch (Exception e) {
                                    String msg = "root BOM link failed [" + rootPsmId + " -> " + childPsmId + "]: " + e.getMessage();
                                    log.warn("Job {}: {}", jobId, msg);
                                    warnings.add(msg);
                                }
                            }
                        }
                    }
                }

                // Phase 5 — upload original file to DST (kind=original), link root nodes
                try {
                    String dstBaseUrl = serviceClient.resolveBaseUrl("dst");
                    String authToken  = ServiceClientTokenContext.get();
                    String dstFileId  = dstClient.upload(fileBytes, filename, null,
                                                          authToken, ctx.projectSpaceId(), dstBaseUrl);
                    if (dstFileId != null) {
                        log.info("Job {}: DST upload succeeded, dstFileId={}", jobId, dstFileId);
                        for (NodeDecision nd : planned) {
                            CadNodeData node = nd.node();
                            if (!node.hasOccurrences()) {
                                UUID rootImportedId = cadIdToNodeId.get(node.cadId());
                                if (rootImportedId != null) {
                                    try {
                                        String linkId = psmClient.createLink(rootImportedId, dstFileId,
                                                             "lt-part-data", txId, ctx.projectSpaceId());
                                        if (linkId != null)
                                            psmClient.updateLinkAttributes(linkId, rootImportedId,
                                                                Map.of("kind", "original", "layer", "main"), txId, ctx.projectSpaceId());
                                    } catch (Exception e) {
                                        String msg = "lt-part-data link failed [node=" + rootImportedId
                                            + " -> dst/" + dstFileId + "]: " + e.getMessage();
                                        log.warn("Job {}: {}", jobId, msg);
                                        warnings.add(msg);
                                    }
                                }
                            }
                        }
                        dstClient.unref(dstFileId, authToken, ctx.projectSpaceId(), dstBaseUrl);
                    } else {
                        String msg = "DST upload returned no ID, lt-part-data links skipped";
                        log.warn("Job {}: {}", jobId, msg);
                        warnings.add(msg);
                    }
                } catch (Exception e) {
                    String msg = "DST upload failed: " + e.getMessage();
                    log.warn("Job {}: {}", jobId, msg);
                    warnings.add(msg);
                }
            }

            // Transaction is left open: user reviews imported nodes and commits/rolls back manually.
            String warningSummary = warnings.isEmpty() ? null
                : warnings.size() + " warning(s): " + String.join("; ", warnings);
            repository.updateStatus(jobId, "DONE", LocalDateTime.now(), warningSummary);
            log.info("Import job {} completed ({} nodes, tx={} open for review, {} warning(s))",
                jobId, nodeCount, txId, warnings.size());

            publishJobEvent(ctx, jobId.toString(), "DONE", nodeCount, null, warnings);

        } catch (Exception e) {
            log.error("Import job {} failed: {}", jobId, e.getMessage(), e);
            if (ownTx && txId != null) psmClient.rollback(txId, ctx.projectSpaceId());
            repository.updateStatus(jobId, "FAILED", LocalDateTime.now(), e.getMessage());
            publishJobEvent(ctx, jobId.toString(), "FAILED", nodeCount, e.getMessage(), List.of());
        }
    }

    @Async
    public void processMulti(UUID jobId, byte[] originalZipBytes, String zipFilename,
                              List<ZipUtil.FileEntry> files, ImportJobContext ctx) {
        log.info("Starting ZIP import job {} files={} contextCode={}", jobId, files.size(), ctx.importContextCode());
        repository.updateStatus(jobId, "RUNNING", LocalDateTime.now(), null);

        boolean ownTx = ctx.psmTxId() == null;
        String txId = null;
        int nodeCount = 0;
        List<String> warnings = new ArrayList<>();

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
            String dstBaseUrl = serviceClient.resolveBaseUrl("dst");
            String authToken  = ServiceClientTokenContext.get();

            // Shared across all files — cross-file parentCadId references resolve naturally
            Map<String, UUID>   cadIdToNodeId    = new HashMap<>();
            Map<String, String> cadIdToLogicalId = new HashMap<>();

            if (ctx.splitMode()) {
                List<SplitPart> allParts = new ArrayList<>();
                for (ZipUtil.FileEntry entry : files) {
                    try {
                        List<SplitPart> parts = parserClient.split(entry.bytes(), entry.filename());
                        allParts.addAll(parts);
                        log.info("Job {}: split {} → {} parts", jobId, entry.filename(), parts.size());
                    } catch (Exception e) {
                        String msg = "Split failed for " + entry.filename() + ": " + e.getMessage();
                        log.warn("Job {}: {}", jobId, msg);
                        warnings.add(msg);
                    }
                }
                nodeCount = allParts.size();

                record SplitDecision(SplitPart part, ImportDecision decision) {}
                List<SplitDecision> planned = new ArrayList<>(allParts.size());
                for (SplitPart part : allParts) {
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
                            part.occurrences(), 0);
                        decision = algorithm.evaluate(nodeData, ctxWithTx);
                    }
                    if (decision.action() == ImportDecision.Action.CREATE) {
                        UUID existing = psmClient.findByExternalId(part.cadId(), ctx.projectSpaceId());
                        if (existing != null) {
                            decision = ImportDecision.update(existing.toString(), decision.attributes());
                        }
                    }
                    planned.add(new SplitDecision(part, decision));
                }

                for (SplitDecision sd : planned) {
                    CadNodeData nodeData = new CadNodeData(sd.part().cadId(), sd.part().name(),
                        sd.part().cadType(), sd.part().attributes(), sd.part().occurrences(), 0);
                    ImportJobResult result = processNode(jobId, nodeData, sd.decision(), txId, ctx.projectSpaceId());
                    repository.saveResult(result);
                    if ("REJECTED".equals(result.getAction())) {
                        warnings.add("Node rejected [" + result.getCadNodeName() + "]: " + result.getErrorMessage());
                    }
                    if (result.getPsmNodeId() != null) {
                        cadIdToNodeId.put(sd.part().cadId(), result.getPsmNodeId());
                        if (sd.decision().logicalId() != null)
                            cadIdToLogicalId.put(sd.part().cadId(), sd.decision().logicalId());
                        boolean acted = "CREATED".equals(result.getAction()) || "UPDATED".equals(result.getAction());
                        if (acted && sd.part().fileBytes().length > 0) {
                            uploadPartRepresentations(jobId, sd.part().cadId(), sd.part().name(),
                                sd.part().fileBytes(), result.getPsmNodeId(),
                                authToken, ctx.projectSpaceId(), dstBaseUrl, txId, warnings);
                        }
                    }
                }

                for (SplitDecision sd : planned) {
                    if (sd.part().hasOccurrences()) {
                        CadNodeData nodeData = new CadNodeData(sd.part().cadId(), sd.part().name(),
                            sd.part().cadType(), sd.part().attributes(), sd.part().occurrences(), 0);
                        for (CadOccurrence occ : sd.part().occurrences()) {
                            UUID   parentPsmId    = cadIdToNodeId.get(occ.parentCadId());
                            String childLogicalId = cadIdToLogicalId.get(sd.part().cadId());
                            if (parentPsmId != null && childLogicalId != null) {
                                try {
                                    ImportLinkDecision linkDecision = algorithm.evaluateLink(nodeData, occ, ctxWithTx);
                                    String linkId = psmClient.createLink(parentPsmId, childLogicalId,
                                            linkDecision.linkTypeId(), txId, ctx.projectSpaceId());
                                    if (linkId != null && !linkDecision.attributes().isEmpty()) {
                                        psmClient.updateLinkAttributes(linkId, parentPsmId,
                                                linkDecision.attributes(), txId, ctx.projectSpaceId());
                                    }
                                } catch (Exception e) {
                                    warnings.add("BOM link failed [" + parentPsmId + " -> " + sd.part().cadId() + "]: " + e.getMessage());
                                }
                            }
                        }
                    }
                }
                if (ctx.rootNodeId() != null) {
                    UUID rootPsmId = UUID.fromString(ctx.rootNodeId());
                    for (SplitDecision sd : planned) {
                        if (!sd.part().hasOccurrences()) {
                            UUID   childPsmId     = cadIdToNodeId.get(sd.part().cadId());
                            String childLogicalId = cadIdToLogicalId.get(sd.part().cadId());
                            if (childPsmId != null && childLogicalId != null) {
                                try {
                                    psmClient.createLink(rootPsmId, childLogicalId, "lt-composed-of", txId, ctx.projectSpaceId());
                                } catch (Exception e) {
                                    warnings.add("root BOM link failed [" + rootPsmId + " -> " + childPsmId + "]: " + e.getMessage());
                                }
                            }
                        }
                    }
                }

            } else {
                // Normal mode — aggregate all nodes, then plan + execute as one graph
                List<CadNodeData> allNodes = new ArrayList<>();
                for (ZipUtil.FileEntry entry : files) {
                    try {
                        List<CadNodeData> nodes = parserClient.parse(entry.bytes(), entry.filename());
                        allNodes.addAll(nodes);
                        log.info("Job {}: parsed {} → {} nodes", jobId, entry.filename(), nodes.size());
                    } catch (Exception e) {
                        String msg = "Parse failed for " + entry.filename() + ": " + e.getMessage();
                        log.warn("Job {}: {}", jobId, msg);
                        warnings.add(msg);
                    }
                }
                nodeCount = allNodes.size();

                record NodeDecision(CadNodeData node, ImportDecision decision) {}
                List<NodeDecision> planned = new ArrayList<>(allNodes.size());
                for (CadNodeData node : allNodes) {
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
                                validation.enrichedAttributes(), node.occurrences(), node.depth());
                        decision = algorithm.evaluate(enrichedNode, ctxWithTx);
                    }
                    if (decision.action() == ImportDecision.Action.CREATE) {
                        UUID existing = psmClient.findByExternalId(node.cadId(), ctx.projectSpaceId());
                        if (existing != null) {
                            decision = ImportDecision.update(existing.toString(), decision.attributes());
                        }
                    }
                    planned.add(new NodeDecision(node, decision));
                }

                planned.sort(Comparator.comparingInt((NodeDecision nd) -> nd.node().depth()).reversed());

                for (NodeDecision nd : planned) {
                    ImportJobResult result = processNode(jobId, nd.node(), nd.decision(), txId, ctx.projectSpaceId());
                    repository.saveResult(result);
                    if ("REJECTED".equals(result.getAction())) {
                        warnings.add("Node rejected [" + result.getCadNodeName() + "]: " + result.getErrorMessage());
                    }
                    if (result.getPsmNodeId() != null) {
                        cadIdToNodeId.put(nd.node().cadId(), result.getPsmNodeId());
                        if (nd.decision().logicalId() != null)
                            cadIdToLogicalId.put(nd.node().cadId(), nd.decision().logicalId());
                    }
                }

                for (NodeDecision nd : planned) {
                    CadNodeData node = nd.node();
                    if (node.hasOccurrences()) {
                        for (CadOccurrence occ : node.occurrences()) {
                            UUID   parentPsmId    = cadIdToNodeId.get(occ.parentCadId());
                            String childLogicalId = cadIdToLogicalId.get(node.cadId());
                            if (parentPsmId != null && childLogicalId != null) {
                                try {
                                    ImportLinkDecision linkDecision = algorithm.evaluateLink(node, occ, ctxWithTx);
                                    String linkId = psmClient.createLink(parentPsmId, childLogicalId,
                                            linkDecision.linkTypeId(), txId, ctx.projectSpaceId());
                                    if (linkId != null && !linkDecision.attributes().isEmpty()) {
                                        psmClient.updateLinkAttributes(linkId, parentPsmId,
                                                linkDecision.attributes(), txId, ctx.projectSpaceId());
                                    }
                                } catch (Exception e) {
                                    warnings.add("BOM link failed [" + parentPsmId + " -> " + node.cadId() + "]: " + e.getMessage());
                                }
                            }
                        }
                    }
                }
                if (ctx.rootNodeId() != null) {
                    UUID rootPsmId = UUID.fromString(ctx.rootNodeId());
                    for (NodeDecision nd : planned) {
                        CadNodeData node = nd.node();
                        if (!node.hasOccurrences()) {
                            UUID   childPsmId     = cadIdToNodeId.get(node.cadId());
                            String childLogicalId = cadIdToLogicalId.get(node.cadId());
                            if (childPsmId != null && childLogicalId != null) {
                                try {
                                    psmClient.createLink(rootPsmId, childLogicalId, "lt-composed-of", txId, ctx.projectSpaceId());
                                } catch (Exception e) {
                                    warnings.add("root BOM link failed [" + rootPsmId + " -> " + childPsmId + "]: " + e.getMessage());
                                }
                            }
                        }
                    }
                }

                // Upload original ZIP to DST (kind=original), link all top-level roots
                try {
                    String dstFileId = dstClient.upload(originalZipBytes, zipFilename, null,
                        authToken, ctx.projectSpaceId(), dstBaseUrl);
                    if (dstFileId != null) {
                        for (NodeDecision nd : planned) {
                            CadNodeData node = nd.node();
                            if (!node.hasOccurrences()) {
                                UUID rootImportedId = cadIdToNodeId.get(node.cadId());
                                if (rootImportedId != null) {
                                    try {
                                        String linkId = psmClient.createLink(rootImportedId, dstFileId, "lt-part-data", txId, ctx.projectSpaceId());
                                        if (linkId != null)
                                            psmClient.updateLinkAttributes(linkId, rootImportedId,
                                                Map.of("kind", "original", "layer", "main"), txId, ctx.projectSpaceId());
                                    } catch (Exception e) {
                                        warnings.add("lt-part-data link failed [node=" + rootImportedId + " -> dst/" + dstFileId + "]: " + e.getMessage());
                                    }
                                }
                            }
                        }
                        dstClient.unref(dstFileId, authToken, ctx.projectSpaceId(), dstBaseUrl);
                    } else {
                        warnings.add("DST upload returned no ID for ZIP, lt-part-data links skipped");
                    }
                } catch (Exception e) {
                    warnings.add("DST upload failed for ZIP: " + e.getMessage());
                }
            }

            String warningSummary = warnings.isEmpty() ? null
                : warnings.size() + " warning(s): " + String.join("; ", warnings);
            repository.updateStatus(jobId, "DONE", LocalDateTime.now(), warningSummary);
            log.info("ZIP import job {} completed ({} nodes, tx={} open, {} warning(s))",
                jobId, nodeCount, txId, warnings.size());
            publishJobEvent(ctx, jobId.toString(), "DONE", nodeCount, null, warnings);

        } catch (Exception e) {
            log.error("ZIP import job {} failed: {}", jobId, e.getMessage(), e);
            if (ownTx && txId != null) psmClient.rollback(txId, ctx.projectSpaceId());
            repository.updateStatus(jobId, "FAILED", LocalDateTime.now(), e.getMessage());
            publishJobEvent(ctx, jobId.toString(), "FAILED", nodeCount, e.getMessage(), List.of());
        }
    }

    private void uploadPartRepresentations(UUID jobId, String cadId, String name, byte[] stepBytes,
                                            UUID psmNodeId, String authToken, String projectSpaceId,
                                            String dstBaseUrl, String txId, List<String> warnings) {
        String safeFilename = name.replaceAll("[^a-zA-Z0-9._-]", "_");

        // Upload STEP (kind=design)
        try {
            String stepFileId = dstClient.upload(stepBytes, safeFilename + ".step", null,
                authToken, projectSpaceId, dstBaseUrl);
            if (stepFileId != null) {
                String linkId = psmClient.createLink(psmNodeId, stepFileId, "lt-part-data", txId, projectSpaceId);
                if (linkId != null)
                    psmClient.updateLinkAttributes(linkId, psmNodeId,
                        Map.of("kind", "design", "layer", "main"), txId, projectSpaceId);
                dstClient.unref(stepFileId, authToken, projectSpaceId, dstBaseUrl);
                log.debug("Job {}: {} → DST {} (kind=design)", jobId, cadId, stepFileId);
            } else {
                warnings.add("DST STEP upload returned no ID for part " + cadId);
            }
        } catch (Exception e) {
            warnings.add("STEP lt-part-data link failed [cadId=" + cadId + "]: " + e.getMessage());
        }

        // Convert STEP → GLB (kind=simplified) — non-fatal if parser unavailable
        try {
            byte[] glbBytes = parserClient.convertToGlb(stepBytes, safeFilename + ".step");
            if (glbBytes != null && glbBytes.length > 0) {
                String glbFileId = dstClient.upload(glbBytes, safeFilename + ".glb", "model/gltf-binary",
                    authToken, projectSpaceId, dstBaseUrl);
                if (glbFileId != null) {
                    String linkId = psmClient.createLink(psmNodeId, glbFileId, "lt-part-data", txId, projectSpaceId);
                    if (linkId != null)
                        psmClient.updateLinkAttributes(linkId, psmNodeId,
                            Map.of("kind", "simplified", "layer", "main"), txId, projectSpaceId);
                    dstClient.unref(glbFileId, authToken, projectSpaceId, dstBaseUrl);
                    log.debug("Job {}: {} → DST {} (kind=simplified, {} KB)", jobId, cadId, glbFileId, glbBytes.length / 1024);
                }
            }
        } catch (Exception e) {
            log.warn("Job {}: GLB conversion skipped for {}: {}", jobId, cadId, e.getMessage());
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
                    // create_node only stores identity fields; apply domain attrs now
                    if (!decision.attributes().isEmpty()) {
                        psmClient.updateNode(nodeId, decision.attributes(), txId, projectSpaceId);
                    }
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
                                  int nodeCount, String errorSummary, List<String> warnings) {
        if (messageBus == null) return;
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("jobId",        jobId);
            payload.put("status",       status);
            payload.put("nodeCount",    nodeCount);
            payload.put("rootNodeId",   ctx.rootNodeId());
            payload.put("contextCode",  ctx.importContextCode());
            if (errorSummary != null) payload.put("errorSummary", errorSummary);
            if (warnings != null && !warnings.isEmpty()) payload.put("warnings", warnings);

            messageBus.sendToUser(ctx.projectSpaceId(), ctx.userId(), "IMPORT_JOB_DONE", payload);
            log.debug("Published IMPORT_JOB_DONE for job={} user={}", jobId, ctx.userId());
        } catch (Exception e) {
            log.warn("Failed to publish IMPORT_JOB_DONE event for job {}: {}", jobId, e.getMessage());
        }
    }
}
