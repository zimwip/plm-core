package com.dst.resource;

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
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Publishes the dst data-object item so the federated frontend can offer
 * "upload data file" alongside psm's create-node entries and list uploaded
 * files in the navigation tree.
 *
 * <p>Single descriptor — dst doesn't have sub-types. All three actions
 * populated; per-user permission filtering is delegated to
 * {@link DataItemVisibility}, which checks {@code WRITE_DATA} for create
 * and {@code READ_DATA} for list/get and nulls denied actions out.
 */
@Component
public class DataItemContribution implements ItemCatalogContribution {

    @Override
    public List<ItemDescriptor> descriptors() {
        ListItemShape shape = new ListItemShape("id", "originalName", null);

        CreateAction create = new CreateAction(
            "POST", "/data", "multipart/form-data", "MULTIPART",
            List.of(
                new ItemParameter(
                    "file", "File", "FILE", true,
                    null, null, "FILE", null,
                    "Binary content to upload", 1, null),
                new ItemParameter(
                    "name", "Display name", "STRING", false,
                    null, null, "TEXT", null,
                    "Optional override for the file name stored as metadata", 2, null)
            ),
            "Upload file",
            "Upload a binary file to the data store",
            "PRIMARY", 0);

        ListAction list = new ListAction(
            "GET", "/data", "page", "size", List.of(), shape,
            "Browse files",
            "View and search uploaded data files",
            "SECONDARY", 10);

        GetAction get = new GetAction(
            "GET", "/data/{id}/detail",
            "Open", "View file details",
            "SECONDARY", 20);

        ImportAction importStep = new ImportAction(
            "/data",
            "*",
            "Import file",
            "Upload any file to the data store",
            0,
            null);

        return List.of(new ItemDescriptor(
            "dst",
            "data-object",
            null,
            "Data file",
            "Binary blobs hosted in the dst service",
            "FileText",
            "#6366f1",
            "DATA",
            PanelSection.MAIN,
            500,
            create,
            list,
            get,
            List.of(importStep),
            List.of(ItemEventType.CREATED, ItemEventType.UPDATED)
        ));
    }
}
