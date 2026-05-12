package com.cad.ingestion.client;

import com.plm.platform.client.ServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Client for the DST (Data Store) service.
 * Uploads the original CAD file for archival after a successful import.
 *
 * Calls POST /api/dst/data (multipart) — auth headers built via ServiceClient.buildAuthHeaders()
 * which handles both delegated-user context (async jobs) and JWT forwarding (sync requests).
 */
@Slf4j
@Component
public class DstStorageClient {

    private final RestTemplate rest;
    private final ServiceClient serviceClient;

    public DstStorageClient(RestTemplateBuilder builder, ServiceClient serviceClient) {
        this.rest = builder.build();
        this.serviceClient = serviceClient;
    }

    /**
     * Uploads file bytes to DST and returns the assigned dstFileId.
     * Returns null if DST is unreachable or returns an unexpected response.
     */
    public String upload(byte[] fileBytes, String filename, String contentType, String dstBaseUrl) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(fileBytes) {
                @Override public String getFilename() { return filename; }
            });
            body.add("name", filename);

            HttpHeaders headers = serviceClient.buildAuthHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = rest.postForObject(
                dstBaseUrl + "/api/dst/data",
                request,
                Map.class
            );

            if (response != null && response.get("metadata") instanceof Map<?,?> meta && meta.containsKey("id")) {
                String dstFileId = meta.get("id").toString();
                log.info("Uploaded {} to DST: dstFileId={}", filename, dstFileId);
                return dstFileId;
            }

            log.warn("DST upload for {} returned unexpected response: {}", filename, response);
            return null;

        } catch (Exception e) {
            log.warn("DST upload failed for {}: {}", filename, e.getMessage());
            return null;
        }
    }

    /**
     * Releases the uploader's reference on a DST data object.
     * Called after a PSM link has taken ownership (ref_count 2→1).
     */
    public void unref(String dstFileId, String dstBaseUrl) {
        try {
            HttpHeaders headers = serviceClient.buildAuthHeaders();
            rest.exchange(
                dstBaseUrl + "/api/dst/data/" + dstFileId + "/unref",
                HttpMethod.POST,
                new HttpEntity<>(headers),
                Void.class
            );
            log.debug("Unreferenced DST object {}", dstFileId);
        } catch (Exception e) {
            log.warn("DST unref failed for {}: {}", dstFileId, e.getMessage());
        }
    }
}
