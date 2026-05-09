package com.plm.node.handler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.node.domain.internal.DomainService;
import com.plm.node.version.internal.FingerPrintService;
import com.plm.node.metamodel.internal.ValidationService;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.DomainConfig;
import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@AlgorithmBean(code = "assign_domain", name = "Assign Domain Handler")
@RequiredArgsConstructor
public class AssignDomainActionHandler implements ActionHandler {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final DomainService domainService;
    private final FingerPrintService fingerPrintService;
    private final ConfigCache configCache;
    private final DSLContext dsl;
    private final ValidationService validationService;

    @Override
    public String actionCode() { return "assign_domain"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/assign_domain/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String domainId = params.get("domainId");
        if (domainId == null || domainId.isBlank()) {
            throw new IllegalArgumentException("domainId parameter is required");
        }

        // Find the OPEN version for this node in the current tx
        String versionId = dsl.select()
            .from("node_version")
            .where("node_id = ?", ctx.nodeId())
            .and("tx_id = ?", ctx.txId())
            .orderBy(org.jooq.impl.DSL.field("version_number").desc())
            .limit(1)
            .fetchOne("id", String.class);

        if (versionId == null) {
            throw new IllegalStateException("No OPEN version found for node " + ctx.nodeId());
        }

        domainService.assignDomain(ctx.nodeId(), domainId, versionId);

        // Recompute fingerprint after domain assignment
        String fp = fingerPrintService.compute(ctx.nodeId(), versionId);
        dsl.execute("UPDATE node_version SET fingerprint = ? WHERE id = ?", fp, versionId);

        List<ValidationService.Violation> violations =
            validationService.collectVersionViolations(ctx.nodeId(), versionId);
        return ActionResult.ok(Map.of("nodeId", ctx.nodeId(), "domainId", domainId, "violations", violations));
    }

    @Override
    public Map<String, String> resolveDynamicAllowedValues(String nodeId, String nodeTypeId, String transitionId) {
        String latestVersionId = dsl.select()
            .from("node_version")
            .where("node_id = ?", nodeId)
            .orderBy(org.jooq.impl.DSL.field("version_number").desc())
            .limit(1)
            .fetchOne("id", String.class);

        Set<String> assigned = new HashSet<>();
        if (latestVersionId != null) {
            assigned.addAll(domainService.getAssignedDomainIds(latestVersionId));
        }

        List<Map<String, String>> options = new ArrayList<>();
        List<DomainConfig> allDomains = configCache.getAllDomains().stream()
            .sorted((a, b) -> String.CASE_INSENSITIVE_ORDER.compare(
                a.name() != null ? a.name() : "", b.name() != null ? b.name() : ""))
            .toList();
        for (DomainConfig d : allDomains) {
            if (assigned.contains(d.id())) continue;
            Map<String, String> opt = new LinkedHashMap<>();
            opt.put("value", d.id());
            opt.put("label", d.name());
            options.add(opt);
        }
        try {
            return Map.of("domainId", MAPPER.writeValueAsString(options));
        } catch (JsonProcessingException e) {
            return Map.of();
        }
    }
}
