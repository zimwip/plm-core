package com.dav.webdav;

import com.plm.platform.client.ServiceClient;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;

/**
 * Streams DST file content straight to the WebDAV client. Presigned URLs are
 * signed for the public endpoint and unusable as redirects here, so the bytes
 * are proxied through dst's internal {@code /data/{id}/content} endpoint.
 */
@Slf4j
@Component
public class DstStreamClient {

    private final ServiceClient serviceClient;
    private final RestTemplate restTemplate;

    public DstStreamClient(ServiceClient serviceClient, RestTemplateBuilder builder) {
        this.serviceClient = serviceClient;
        this.restTemplate = builder.build();
    }

    public void stream(String dataId, HttpServletResponse response) {
        String url = serviceClient.resolveBaseUrl("dst") + "/api/dst/data/" + dataId + "/content";
        HttpHeaders auth = serviceClient.buildAuthHeaders();
        restTemplate.execute(URI.create(url), HttpMethod.GET,
            request -> request.getHeaders().addAll(auth),
            clientResponse -> {
                try {
                    if (!clientResponse.getStatusCode().is2xxSuccessful()) {
                        response.setStatus(clientResponse.getStatusCode().value());
                        return null;
                    }
                    HttpHeaders headers = clientResponse.getHeaders();
                    if (headers.getContentType() != null) {
                        response.setContentType(headers.getContentType().toString());
                    }
                    if (headers.getContentLength() >= 0) {
                        response.setContentLengthLong(headers.getContentLength());
                    }
                    clientResponse.getBody().transferTo(response.getOutputStream());
                    response.flushBuffer();
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
                return null;
            });
    }
}
