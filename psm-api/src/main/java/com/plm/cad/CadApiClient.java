package com.plm.cad;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@Slf4j
@Component
public class CadApiClient {

    private final RestTemplate rest;
    private final String cadApiUrl;
    private final String serviceSecret;

    public CadApiClient(
            RestTemplateBuilder builder,
            @Value("${cad.api.internal.url:http://cad-api:8087}") String cadApiUrl,
            @Value("${plm.auth.service-secret:}") String serviceSecret) {
        this.rest          = builder.build();
        this.cadApiUrl     = cadApiUrl;
        this.serviceSecret = serviceSecret;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> submitImport(String nodeId, String contextCode,
                                             String userId, String projectSpaceId,
                                             byte[] fileBytes, String filename, String psmTxId) {
        ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
            @Override public String getFilename() { return filename; }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);
        body.add("nodeId", nodeId);
        body.add("contextCode", contextCode != null ? contextCode : "default");
        body.add("userId", userId);
        body.add("projectSpaceId", projectSpaceId);
        if (psmTxId != null) body.add("psmTxId", psmTxId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("X-Service-Secret", serviceSecret);
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                String auth = attrs.getRequest().getHeader("Authorization");
                if (auth != null) headers.set("Authorization", auth);
            }
        } catch (Exception ignored) {}

        Map<String, Object> result = rest.postForObject(
            cadApiUrl + "/api/cad/internal/import",
            new HttpEntity<>(body, headers),
            Map.class
        );
        if (result == null) throw new IllegalStateException("cad-api /internal/import returned null");
        return result;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getJobStatus(String jobId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Service-Secret", serviceSecret);
        var resp = rest.exchange(
            cadApiUrl + "/api/cad/internal/import/" + jobId,
            HttpMethod.GET,
            new HttpEntity<>(headers),
            Map.class
        );
        return resp.getBody();
    }
}
