package com.plm.domain.action.handler;

import com.plm.domain.action.ActionContext;
import com.plm.domain.action.ActionHandler;
import com.plm.domain.action.ActionResult;
import com.plm.domain.service.NodeService;
import com.plm.domain.service.ValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("updateNodeActionHandler")
@RequiredArgsConstructor
public class UpdateNodeActionHandler implements ActionHandler {

    private final NodeService       nodeService;
    private final ValidationService validationService;

    @Override
    public String actionCode() { return "UPDATE_NODE"; }

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
