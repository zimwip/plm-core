package com.plm.node.resource;

import com.plm.platform.action.ActionService;
import com.plm.platform.action.dto.ActionParameter;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.NodeTypeConfig;
import com.plm.platform.item.ItemCatalogContribution;
import com.plm.platform.item.dto.CreateAction;
import com.plm.platform.item.dto.GetAction;
import com.plm.platform.item.dto.ImportAction;
import com.plm.platform.item.dto.ItemDescriptor;
import com.plm.platform.item.dto.ItemParameter;
import com.plm.platform.item.dto.ListAction;
import com.plm.platform.item.dto.ListItemShape;
import com.plm.platform.item.dto.ItemEventType;
import com.plm.platform.item.dto.PanelSection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Publishes one item descriptor per psm node type. Each descriptor carries
 * all three actions:
 *  - {@code create} via {@code POST /actions/create_node/{id}};
 *  - {@code list}   via {@code GET /nodes?type={id}};
 *  - {@code get}    via {@code GET /nodes/{id}/detail}.
 *
 * <p>Per-user permission filtering is delegated to
 * {@link NodeItemVisibility}, which nulls out actions the caller is not
 * permitted to perform (e.g. {@code create=null} when {@code CREATE_NODE}
 * is not granted on the node type).
 *
 * <p>The create form only collects identity fields ({@code _logicalId}
 * required, {@code _externalId} optional). Domain attributes are filled
 * later via the standard checkout/{@code update_node} flow.
 */
@Component
@RequiredArgsConstructor
public class NodeItemContribution implements ItemCatalogContribution {

    private static final String CREATE_NODE = "create_node";
    private static final String SOURCE_LABEL = "PLM";
    private static final String ITEM_CODE = "node";

    private final ConfigCache   configCache;
    private final ActionService actionService;

    @Override
    public List<ItemDescriptor> descriptors() {
        if (!configCache.isPopulated()) return List.of();

        ListItemShape shape = new ListItemShape("id", "logical_id", "icon");

        List<ItemParameter> importParams = resolveImportParams();
        List<ItemDescriptor> out = new ArrayList<>();
        for (NodeTypeConfig nt : configCache.getAllNodeTypes()) {
            String createPath = "/actions/" + CREATE_NODE + "/" + nt.id();
            String listPath   = "/nodes?type=" + nt.id();

            CreateAction create = new CreateAction(
                "POST", createPath, "application/json", "WRAPPED",
                identityParameters(nt),
                "Create " + nt.name(),
                "Create a new " + nt.name() + " in the current project space",
                "PRIMARY", 0);

            ListAction list = new ListAction(
                "GET", listPath, "page", "size", List.of("type"), shape,
                "Browse " + nt.name() + "s",
                "View and search all " + nt.name() + " nodes",
                "SECONDARY", 10);

            GetAction get = new GetAction(
                "GET", "/nodes/{id}/description",
                "Open", "View node details",
                "SECONDARY", 20);

            ImportAction cadImport = new ImportAction(
                "/cad/import",
                ".step,.stp,.catproduct,.catpart",
                "Import from CAD",
                "Create a " + nt.name() + " by importing a CAD file",
                0,
                "/cad/jobs/{jobId}",
                importParams);

            out.add(new ItemDescriptor(
                "psm",
                ITEM_CODE,
                nt.id(),
                nt.name(),
                nt.description(),
                nt.icon(),
                nt.color(),
                SOURCE_LABEL,
                PanelSection.MAIN,
                1000,
                create,
                list,
                get,
                List.of(cadImport),
                List.of(ItemEventType.CREATED, ItemEventType.UPDATED)
            ));
        }
        return out;
    }

    private List<ItemParameter> resolveImportParams() {
        List<ActionParameter> raw = actionService.resolveActionParameters("cad-import-create");
        List<ItemParameter> result = new ArrayList<>();
        int order = 0;
        for (ActionParameter p : raw) {
            if ("FILE".equalsIgnoreCase(p.widget())) continue;
            String allowedValues = null;
            if (p.options() != null && !p.options().isEmpty()) {
                allowedValues = p.options().stream()
                    .map(c -> "{\"value\":\"" + c.value() + "\",\"label\":\"" + c.label() + "\"}")
                    .collect(Collectors.joining(",", "[", "]"));
            }
            result.add(new ItemParameter(
                p.name(), p.label(), "STRING", p.required(),
                p.defaultValue() != null ? p.defaultValue().toString() : null,
                allowedValues, p.widget(), p.validationRegex(),
                p.hint(), order++, null
            ));
        }
        return result;
    }

    private List<ItemParameter> identityParameters(NodeTypeConfig nt) {
        List<ItemParameter> params = new ArrayList<>();
        String identitySection = "Identity";

        String logicalIdLabel = (nt.logicalIdLabel() != null && !nt.logicalIdLabel().isBlank())
            ? nt.logicalIdLabel() : "Identifier";
        String logicalIdRegex = (nt.logicalIdPattern() != null && !nt.logicalIdPattern().isBlank())
            ? nt.logicalIdPattern() : null;

        params.add(new ItemParameter(
            "_logicalId", logicalIdLabel, "STRING", true,
            null, null, "TEXT", logicalIdRegex,
            "Unique identifier for this node (e.g. part number, document code)",
            0, identitySection
        ));
        params.add(new ItemParameter(
            "_externalId", "External ID", "STRING", false,
            null, null, "TEXT", null,
            "Optional external reference (ERP code, CAD file path, …)",
            1, identitySection
        ));
        return params;
    }
}
