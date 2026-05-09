package com.cad.ingestion.client;

import com.cad.algorithm.CadNodeData;
import com.cad.ingestion.model.SplitPart;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class CadParserClient {

    private record ParserResponse(String format, List<CadNodeData> nodes) {}

    private record SplitPartDto(
            String nodeId, String name, String cadType,
            Map<String, String> attributes, String parentNodeId, String fileBytes) {}
    private record SplitResponse(String format, List<SplitPartDto> parts) {}

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

    public List<SplitPart> split(byte[] fileBytes, String filename) {
        String format = detectFormat(filename);
        log.info("Requesting split for {} ({} bytes, format={}) from {}", filename, fileBytes.length, format, parserUrl);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new org.springframework.core.io.ByteArrayResource(fileBytes) {
            @Override public String getFilename() { return filename; }
        });
        body.add("format", format);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ResponseEntity<SplitResponse> response = rest.exchange(
            parserUrl + "/split",
            HttpMethod.POST,
            new HttpEntity<>(body, headers),
            SplitResponse.class
        );

        SplitResponse parsed = response.getBody();
        if (parsed == null || parsed.parts() == null) return List.of();
        log.info("Parser /split returned {} parts for {}", parsed.parts().size(), filename);

        return parsed.parts().stream().map(dto -> new SplitPart(
            dto.nodeId(),
            dto.name(),
            dto.cadType(),
            dto.attributes() != null ? dto.attributes() : Map.of(),
            dto.parentNodeId(),
            dto.fileBytes() != null ? Base64.getDecoder().decode(dto.fileBytes()) : new byte[0]
        )).toList();
    }

    private String detectFormat(String filename) {
        if (filename == null) return "UNKNOWN";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".step") || lower.endsWith(".stp")) return "STEP";
        if (lower.endsWith(".catproduct") || lower.endsWith(".catpart")) return "CATIA_V5";
        return "UNKNOWN";
    }
}
