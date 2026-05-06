package com.plm.node.handler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.node.domain.internal.DomainService;
import com.plm.node.version.internal.FingerPrintService;
import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@AlgorithmBean(code = "unassign_domain", name = "Unassign Domain Handler")
@RequiredArgsConstructor
public class UnassignDomainActionHandler implements ActionHandler {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final DomainService domainService;
    private final FingerPrintService fingerPrintService;
    private final DSLContext dsl;

    @Override
    public String actionCode() { return "unassign_domain"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/unassign_domain/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String domainId = params.get("domainId");
        if (domainId == null || domainId.isBlank()) {
            throw new IllegalArgumentException("domainId parameter is required");
        }

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

        domainService.unassignDomain(ctx.nodeId(), domainId, versionId);

        // Recompute fingerprint after domain removal
        String fp = fingerPrintService.compute(ctx.nodeId(), versionId);
        dsl.execute("UPDATE node_version SET fingerprint = ? WHERE id = ?", fp, versionId);

        return ActionResult.ok(Map.of("nodeId", ctx.nodeId(), "domainId", domainId));
    }

    @Override
    public Map<String, String> resolveDynamicAllowedValues(String nodeId, String nodeTypeId, String transitionId) {
        String latestVersionId = dsl.select()
            .from("node_version")
            .where("node_id = ?", nodeId)
            .orderBy(org.jooq.impl.DSL.field("version_number").desc())
            .limit(1)
            .fetchOne("id", String.class);

        List<Map<String, String>> options = new ArrayList<>();
        if (latestVersionId != null) {
            for (Map<String, Object> d : domainService.getAssignedDomains(latestVersionId)) {
                Map<String, String> opt = new LinkedHashMap<>();
                opt.put("value", (String) d.get("id"));
                opt.put("label", (String) d.get("name"));
                options.add(opt);
            }
        }
        try {
            return Map.of("domainId", MAPPER.writeValueAsString(options));
        } catch (JsonProcessingException e) {
            return Map.of();
        }
    }
}
