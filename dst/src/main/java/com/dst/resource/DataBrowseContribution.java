package com.dst.resource;

import com.plm.platform.browse.ListableContribution;
import com.plm.platform.browse.dto.ListAction;
import com.plm.platform.browse.dto.ListItemShape;
import com.plm.platform.browse.dto.ListableDescriptor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Publishes the dst data-object resource so the federated navigation tree
 * surfaces uploaded files alongside psm nodes. Single descriptor under the
 * {@code DATA} group; items are paged from {@code GET /api/dst/data}.
 */
@Component
public class DataBrowseContribution implements ListableContribution {

    @Override
    public List<ListableDescriptor> descriptors() {
        ListItemShape shape = new ListItemShape("id", "originalName", null);
        return List.of(new ListableDescriptor(
            "dst",
            "data-object",
            null,
            "Data files",
            "Binary blobs hosted in the dst service",
            "FileText",
            "#6366f1",
            "DATA",
            new ListAction("GET", "/api/dst/data", "page", "size", List.of(), shape)
        ));
    }
}
