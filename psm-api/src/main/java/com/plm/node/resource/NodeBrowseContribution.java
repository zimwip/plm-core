package com.plm.node.resource;

import com.plm.platform.browse.ListableContribution;
import com.plm.platform.browse.dto.ListAction;
import com.plm.platform.browse.dto.ListItemShape;
import com.plm.platform.browse.dto.ListableDescriptor;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.NodeTypeConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Publishes one browse descriptor per psm node type. Each descriptor's
 * {@link ListAction} points at {@code /api/psm/nodes?type={id}}; the federated
 * navigation tree calls those endpoints in parallel and renders results grouped
 * by node type within the {@code PLM} group.
 */
@Component
@RequiredArgsConstructor
public class NodeBrowseContribution implements ListableContribution {

    private static final String GROUP_KEY = "PLM";
    private static final String RESOURCE_CODE = "node";

    private final ConfigCache configCache;

    @Override
    public List<ListableDescriptor> descriptors() {
        if (!configCache.isPopulated()) return List.of();

        ListItemShape shape = new ListItemShape("id", "logical_id", "icon");
        List<ListableDescriptor> out = new ArrayList<>();
        for (NodeTypeConfig nt : configCache.getAllNodeTypes()) {
            String path = "/api/psm/nodes?type=" + nt.id();
            out.add(new ListableDescriptor(
                "psm",
                RESOURCE_CODE,
                nt.id(),
                nt.name(),
                nt.description(),
                nt.icon(),
                nt.color(),
                GROUP_KEY,
                new ListAction("GET", path, "page", "size", List.of("type"), shape)
            ));
        }
        return out;
    }
}
