package com.plm.platform.item.dto;

import java.util.List;

/**
 * Import entry-point registered by a service. Always a multipart POST.
 * The frontend shows an upload modal when at least one import action is present.
 *
 * @param path            gateway-relative POST endpoint (e.g. {@code /data})
 * @param acceptedTypes   MIME / extension hint for the file picker (e.g. {@code .stp,.step})
 * @param name            display label shown in the import modal header
 * @param description     optional longer description
 * @param displayOrder    ordering hint when multiple import actions exist
 * @param jobStatusPath   service-relative path template for polling async job status
 *                        (e.g. {@code /cad/jobs/{jobId}}); null for synchronous imports.
 *                        Frontend substitutes {@code {jobId}} from the submit response.
 * @param parameters      additional form fields (DROPDOWN, TEXT, …) rendered below the file
 *                        picker; null or empty = no extra fields
 */
public record ImportAction(
    String path,
    String acceptedTypes,
    String name,
    String description,
    int displayOrder,
    String jobStatusPath,
    List<ItemParameter> parameters
) {
    public ImportAction {
        if (parameters == null) parameters = List.of();
    }

    /** Backward-compat constructor for import actions without extra parameters. */
    public ImportAction(String path, String acceptedTypes, String name,
                        String description, int displayOrder, String jobStatusPath) {
        this(path, acceptedTypes, name, description, displayOrder, jobStatusPath, List.of());
    }
}
