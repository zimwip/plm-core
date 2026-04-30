package com.dst.resource;

import com.plm.platform.resource.ResourceCatalogContribution;
import com.plm.platform.resource.dto.ResourceCreateAction;
import com.plm.platform.resource.dto.ResourceDescriptor;
import com.plm.platform.resource.dto.ResourceParameter;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Publishes the dst data-object resource so the federated frontend can offer
 * "upload data file" alongside psm's create-node entries.
 *
 * <p>Single descriptor — dst doesn't have sub-types. Two parameters: the file
 * itself ({@code FILE} widget → multipart) and an optional display name.
 * {@code WRITE_DATA} is required; the platform-api filter checks the user's
 * GLOBAL grants before exposing the entry.
 */
@Component
public class DataCatalogContribution implements ResourceCatalogContribution {

    @Override
    public List<ResourceDescriptor> descriptors() {
        return List.of(new ResourceDescriptor(
            "dst",
            "data-object",
            null,
            "Data file",
            "Upload a binary blob into the data store",
            "Upload",
            "#6366f1",
            "DATA",
            new ResourceCreateAction(
                "POST",
                "/api/dst/data",
                "multipart/form-data",
                "MULTIPART",
                List.of(
                    new ResourceParameter(
                        "file", "File", "FILE", true,
                        null, null, "FILE", null,
                        "Binary content to upload", 1, null),
                    new ResourceParameter(
                        "name", "Display name", "STRING", false,
                        null, null, "TEXT", null,
                        "Optional override for the file name stored as metadata", 2, null)
                )
            )
        ));
    }
}
