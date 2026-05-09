package com.cad.ingestion.client;

import com.cad.algorithm.CadNodeData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Component
public class CadParserClient {

    private record ParserResponse(String format, List<CadNodeData> nodes) {}

    private final RestTemplate rest;
    private final String parserUrl;

    public CadParserClient(RestTemplateBuilder builder,
                           @Value("${cad.parser.url}") String parserUrl) {
        this.rest      = builder.build();
        this.parserUrl = parserUrl;
    }

    /**
     * Sends the file to the parser sidecar and returns the parsed CAD node list in DFS order.
     * Format is detected from the filename extension:
     *   .step / .stp  → STEP
     *   .CATProduct / .CATPart → CATIA_V5
     *   others        → UNKNOWN (parser decides)
     */
    public List<CadNodeData> parse(byte[] fileBytes, String filename) {
        String format = detectFormat(filename);
        log.info("Sending {} ({} bytes, format={}) to parser at {}", filename, fileBytes.length, format, parserUrl);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new org.springframework.core.io.ByteArrayResource(fileBytes) {
            @Override public String getFilename() { return filename; }
        });
        body.add("format", format);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<ParserResponse> response = rest.exchange(
            parserUrl + "/parse",
            HttpMethod.POST,
            request,
            ParserResponse.class
        );

        ParserResponse parsed = response.getBody();
        List<CadNodeData> nodes = parsed != null && parsed.nodes() != null ? parsed.nodes() : List.of();
        log.info("Parser returned {} nodes for {}", nodes.size(), filename);
        return nodes;
    }

    private String detectFormat(String filename) {
        if (filename == null) return "UNKNOWN";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".step") || lower.endsWith(".stp")) return "STEP";
        if (lower.endsWith(".catproduct") || lower.endsWith(".catpart")) return "CATIA_V5";
        return "UNKNOWN";
    }
}
