package com.plm.node.link.internal.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.NodeService;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LinkTypeConfig;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import com.plm.algorithm.AlgorithmBean;

import java.util.Map;

@AlgorithmBean(code = "create_link", name = "CREATE_LINK Handler")
@RequiredArgsConstructor
public class CreateLinkActionHandler implements ActionHandler {

    private final NodeService  nodeService;
    private final ConfigCache  configCache;
    private final DSLContext   dsl;

    @Override
    public String actionCode() { return "create_link"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String linkTypeId   = params.get("linkTypeId");
        String targetNodeId = params.get("targetNodeId");
        String linkLogicalId= params.get("linkLogicalId");

        // Determine pinned version from link_type policy
        String policy = configCache.getLinkType(linkTypeId)
            .map(LinkTypeConfig::linkPolicy).orElse(null);

        String pinnedVersionId = null;
        if ("VERSION_TO_VERSION".equals(policy)) {
            pinnedVersionId = dsl.select(org.jooq.impl.DSL.field("nv.id"))
                .from("node_version nv")
                .join("plm_transaction pt").on("pt.id = nv.tx_id")
                .where("nv.node_id = ?", targetNodeId)
                .and("pt.status = 'COMMITTED'")
                .orderBy(org.jooq.impl.DSL.field("nv.version_number").desc())
                .limit(1)
                .fetchOne(org.jooq.impl.DSL.field("nv.id"), String.class);
        }

        String linkId = nodeService.createLink(
            linkTypeId, ctx.nodeId(), targetNodeId,
            pinnedVersionId, ctx.userId(), ctx.txId(), linkLogicalId);
        return ActionResult.ok("linkId", linkId);
    }
}
