package com.plm.node.version.internal.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.NodeService;
import com.plm.node.metamodel.internal.ValidationService;
import lombok.RequiredArgsConstructor;
import com.plm.algorithm.AlgorithmBean;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@AlgorithmBean(code = "update_node", name = "UPDATE_NODE Handler")
@RequiredArgsConstructor
public class UpdateNodeActionHandler implements ActionHandler {

    private final NodeService       nodeService;
    private final ValidationService validationService;

    @Override
    public String actionCode() { return "update_node"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        // Pull internal params out before passing attributes to modifyNode
        Map<String, String> attributes = new HashMap<>(params);
        String description = attributes.remove("_description");
        if (description == null || description.isBlank()) description = "Content update";

        String versionId = nodeService.modifyNode(
            ctx.nodeId(), ctx.userId(), ctx.txId(), attributes, description);

        // Dry-run validation: surface constraint violations without blocking
        List<String> violations = validationService.collectVersionViolations(ctx.nodeId(), versionId);

        return ActionResult.ok(Map.of(
            "nodeId",     ctx.nodeId(),
            "versionId",  versionId,
            "violations", violations
        ));
    }
}
