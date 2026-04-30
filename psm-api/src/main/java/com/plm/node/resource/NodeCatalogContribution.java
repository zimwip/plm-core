package com.plm.node.resource;

import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.ActionConfig;
import com.plm.platform.config.dto.ActionParameterConfig;
import com.plm.platform.config.dto.AttributeConfig;
import com.plm.platform.config.dto.NodeTypeConfig;
import com.plm.platform.resource.ResourceCatalogContribution;
import com.plm.platform.resource.dto.ResourceCreateAction;
import com.plm.platform.resource.dto.ResourceDescriptor;
import com.plm.platform.resource.dto.ResourceParameter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Publishes one resource descriptor per psm node type so the federated frontend
 * can offer "create Document / Part / Assembly" through the same picker as
 * dst's "upload data file".
 *
 * <p>The {@code create_node} action's parameters (e.g. {@code _logicalId},
 * {@code _externalId}) are merged with the per-type attribute definitions
 * pulled from {@link ConfigCache}. Permission filtering on individual node
 * types still happens server-side when the action fires — platform-api only
 * filters by GLOBAL grants today.
 */
@Component
@RequiredArgsConstructor
public class NodeCatalogContribution implements ResourceCatalogContribution {

    private static final String CREATE_NODE = "create_node";
    private static final String GROUP_KEY = "PLM";
    private static final String RESOURCE_CODE = "node";

    private final ConfigCache configCache;

    @Override
    public List<ResourceDescriptor> descriptors() {
        if (!configCache.isPopulated()) return List.of();

        ActionConfig createNode = configCache.getAction(CREATE_NODE).orElse(null);

        List<ResourceDescriptor> out = new ArrayList<>();
        for (NodeTypeConfig nt : configCache.getAllNodeTypes()) {
            String path = "/api/psm/actions/" + CREATE_NODE + "/" + nt.id();
            List<ResourceParameter> params = mergeParameters(createNode, nt);

            out.add(new ResourceDescriptor(
                "psm",
                RESOURCE_CODE,
                nt.id(),
                nt.name(),
                nt.description(),
                nt.icon(),
                nt.color(),
                GROUP_KEY,
                new ResourceCreateAction(
                    "POST",
                    path,
                    "application/json",
                    "WRAPPED",
                    params
                )
            ));
        }
        return out;
    }

    private List<ResourceParameter> mergeParameters(ActionConfig createNode, NodeTypeConfig nt) {
        List<ResourceParameter> params = new ArrayList<>();
        String identitySection = "Identity";

        // 1. create_node action params (_logicalId, _externalId) FIRST, in an
        // "Identity" section. Per-NodeType overrides: logical_id label +
        // pattern live on node_type (logical_id_label / logical_id_pattern) —
        // the action_parameter row carries only the generic fallback. Apply
        // the type-specific label and regex when emitting the descriptor so
        // each NodeType's create form shows its own identifier label
        // ("Part Number", "Document Code", …) with the right validation pattern.
        if (createNode != null && createNode.parameters() != null) {
            int slot = 0;
            for (ActionParameterConfig p : createNode.parameters()) {
                String label   = p.paramLabel();
                String regex   = p.validationRegex();
                boolean required = p.required();
                if ("_logicalId".equals(p.paramName())) {
                    if (nt.logicalIdLabel() != null && !nt.logicalIdLabel().isBlank()) {
                        label = nt.logicalIdLabel();
                    }
                    if (nt.logicalIdPattern() != null && !nt.logicalIdPattern().isBlank()) {
                        regex = nt.logicalIdPattern();
                        required = true;
                    }
                }
                params.add(new ResourceParameter(
                    p.paramName(),
                    label,
                    p.dataType(),
                    required,
                    p.defaultValue(),
                    p.allowedValues(),
                    p.widgetType() != null ? p.widgetType() : "TEXT",
                    regex,
                    p.tooltip(),
                    slot++,
                    identitySection
                ));
            }
        }

        // 2. Node-type attributes after, ordered by attribute display_order
        // (already set by ConfigCache). Wire field name = attribute id —
        // ValidationService + node_version_attribute.attribute_def_id key on
        // the id, not the human "name". Sending name would surface as
        // UNKNOWN_ATTRIBUTE on commit.
        if (nt.attributes() != null) {
            int attrBase = 1000;
            for (AttributeConfig a : nt.attributes()) {
                params.add(new ResourceParameter(
                    a.id(),
                    a.label(),
                    a.dataType(),
                    a.required(),
                    a.defaultValue(),
                    a.allowedValues(),
                    a.widgetType() != null ? a.widgetType() : "TEXT",
                    a.namingRegex(),
                    a.tooltip(),
                    attrBase + a.displayOrder(),
                    a.displaySection()
                ));
            }
        }
        return params;
    }
}
