package com.cad.ingestion.client;

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
 * Calls POST /api/dst/data (multipart) — forwards Authorization + X-PLM-ProjectSpace
 * headers that were set on the current thread by CadAuthContextBinder.
 */
@Slf4j
@Component
public class DstStorageClient {

    private final RestTemplate rest;

    public DstStorageClient(RestTemplateBuilder builder) {
        this.rest = builder.build();
    }

    /**
     * Uploads file bytes to DST and returns the assigned dstFileId.
     * Returns null if DST is unreachable or returns an unexpected response.
     */
    public String upload(byte[] fileBytes, String filename, String contentType,
                         String authorizationHeader, String projectSpaceId, String dstBaseUrl) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(fileBytes) {
                @Override public String getFilename() { return filename; }
            });
            body.add("name", filename);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            if (authorizationHeader != null) headers.set("Authorization", authorizationHeader);
            if (projectSpaceId != null)      headers.set("X-PLM-ProjectSpace", projectSpaceId);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = rest.postForObject(
                dstBaseUrl + "/api/dst/data",
                request,
                Map.class
            );

            if (response != null && response.containsKey("id")) {
                String dstFileId = response.get("id").toString();
                log.info("Uploaded {} to DST: dstFileId={}", filename, dstFileId);
                return dstFileId;
            }

            log.warn("DST upload for {} returned unexpected response: {}", filename, response);
            return null;

        } catch (Exception e) {
            log.warn("DST upload not yet implemented or unavailable for {}: {}", filename, e.getMessage());
            return null;
        }
    }

    /**
     * Releases the uploader's reference on a DST data object.
     * Called after a PSM link has taken ownership (ref_count 2→1).
     */
    public void unref(String dstFileId, String authorizationHeader, String projectSpaceId, String dstBaseUrl) {
        try {
            HttpHeaders headers = new HttpHeaders();
            if (authorizationHeader != null) headers.set("Authorization", authorizationHeader);
            if (projectSpaceId != null)      headers.set("X-PLM-ProjectSpace", projectSpaceId);

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
