package com.plm.node.version.internal.handler;

import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import com.plm.node.NodeService;
import com.plm.node.metamodel.internal.ValidationService;
import lombok.RequiredArgsConstructor;
import com.plm.algorithm.AlgorithmBean;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@AlgorithmBean(code = "update_node", name = "UPDATE_NODE Handler")
@RequiredArgsConstructor
public class UpdateNodeActionHandler implements ActionHandler {

    private final NodeService       nodeService;
    private final ValidationService validationService;

    @Override
    public String actionCode() { return "update_node"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/update_node/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        // Pull internal params out before passing attributes to modifyNode
        Map<String, String> attributes = new HashMap<>(params);
        String description = attributes.remove("_description");
        if (description == null || description.isBlank()) description = "Content update";

        String versionId = nodeService.modifyNode(
            ctx.nodeId(), ctx.userId(), ctx.txId(), attributes, description);

        // Dry-run validation: surface soft constraint violations without blocking
        List<ValidationService.Violation> violations =
            validationService.collectVersionViolations(ctx.nodeId(), versionId);

        return ActionResult.ok(Map.of(
            "nodeId",     ctx.nodeId(),
            "versionId",  versionId,
            "violations", violations
        ));
    }
}
