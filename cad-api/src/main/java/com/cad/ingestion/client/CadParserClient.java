package com.cad.ingestion.client;

import com.cad.algorithm.CadNodeData;
import com.cad.algorithm.CadOccurrence;
import com.cad.ingestion.model.SplitPart;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class CadParserClient {

    private record ParserResponse(String format, List<CadNodeData> nodes) {}

    // Async job responses
    private record SubmitResponse(String jobId) {}
    private record PartMeta(String nodeId, String name, String cadType,
                            Map<String, String> attributes, List<CadOccurrence> occurrences) {}
    private record JobStatusResponse(String status, String error, List<PartMeta> parts) {}

    /** Return value of {@link #split}: jobId kept alive so callers can fetch per-part GLBs in parallel. */
    public record SplitResult(String jobId, List<SplitPart> parts) {}

    private final RestTemplate rest;
    private final String parserUrl;

    public CadParserClient(RestTemplateBuilder builder,
                           @Value("${cad.parser.url}") String parserUrl) {
        this.rest      = builder
                .connectTimeout(Duration.ofSeconds(10))
                .readTimeout(Duration.ofMinutes(2))
                .build();
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

        ResponseEntity<ParserResponse> response = rest.exchange(
            parserUrl + "/parse",
            HttpMethod.POST,
            new HttpEntity<>(body, headers),
            ParserResponse.class
        );

        ParserResponse parsed = response.getBody();
        List<CadNodeData> nodes = parsed != null && parsed.nodes() != null ? parsed.nodes() : List.of();
        log.info("Parser returned {} nodes for {}", nodes.size(), filename);
        return nodes;
    }

    /**
     * Submits a split job to the parser (returns immediately), polls until done,
     * then downloads each part STEP file individually.
     * Returns both the jobId (kept alive on the parser for 15 min) and the parts,
     * so the caller can fetch per-part GLBs in parallel via {@link #getPartGlb}.
     */
    public SplitResult split(byte[] fileBytes, String filename) {
        String format = detectFormat(filename);
        log.info("Submitting async split for {} ({} bytes, format={}) to {}", filename, fileBytes.length, format, parserUrl);

        // Step 1 — submit job (fast, parser returns 202 immediately)
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new org.springframework.core.io.ByteArrayResource(fileBytes) {
            @Override public String getFilename() { return filename; }
        });
        body.add("format", format);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ResponseEntity<SubmitResponse> submitResp = rest.exchange(
            parserUrl + "/split",
            HttpMethod.POST,
            new HttpEntity<>(body, headers),
            SubmitResponse.class
        );

        SubmitResponse submit = submitResp.getBody();
        if (submit == null || submit.jobId() == null) throw new RuntimeException("Parser returned no jobId");
        String jobId = submit.jobId();
        log.info("Split job submitted: jobId={}", jobId);

        // Step 2 — poll until DONE (3s interval, up to 10 minutes)
        JobStatusResponse status = pollUntilDone(jobId);

        // Step 3 — download each part file
        List<PartMeta> parts = status.parts();
        log.info("Downloading {} parts for job {}", parts.size(), jobId);
        List<SplitPart> result = new ArrayList<>(parts.size());
        for (int i = 0; i < parts.size(); i++) {
            PartMeta meta = parts.get(i);
            ResponseEntity<byte[]> partResp = rest.exchange(
                parserUrl + "/split/" + jobId + "/part/" + i,
                HttpMethod.GET,
                null,
                byte[].class
            );
            byte[] partBytes = partResp.getBody() != null ? partResp.getBody() : new byte[0];
            result.add(new SplitPart(
                meta.nodeId(),
                meta.name(),
                meta.cadType(),
                meta.attributes() != null ? meta.attributes() : Map.of(),
                meta.occurrences() != null ? meta.occurrences() : List.of(),
                partBytes
            ));
        }
        log.info("Downloaded {} parts for split job {}", result.size(), jobId);
        return new SplitResult(jobId, result);
    }

    /**
     * Fetches the pre-converted GLB for one part from an existing split job.
     * The cad-parser converts on demand (from the split STEP file on disk) and uses
     * its OCCT worker pool — call this concurrently for all parts to max throughput.
     * Returns null (non-fatal) if the job has expired or conversion fails.
     */
    public byte[] getPartGlb(String jobId, int partIndex) {
        log.debug("Requesting GLB for split job={} part={}", jobId, partIndex);
        try {
            ResponseEntity<byte[]> resp = rest.exchange(
                parserUrl + "/split/" + jobId + "/part/" + partIndex + "/glb",
                HttpMethod.GET, null, byte[].class
            );
            byte[] glb = resp.getBody();
            log.debug("GLB for job={} part={}: {} bytes", jobId, partIndex, glb != null ? glb.length : 0);
            return glb;
        } catch (Exception e) {
            log.warn("GLB fetch failed for job={} part={}: {}", jobId, partIndex, e.getMessage());
            return null;
        }
    }

    private JobStatusResponse pollUntilDone(String jobId) {
        int maxAttempts = 200; // ~10 minutes at 3s intervals
        for (int i = 0; i < maxAttempts; i++) {
            try { Thread.sleep(3_000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

            ResponseEntity<JobStatusResponse> resp = rest.exchange(
                parserUrl + "/split/" + jobId,
                HttpMethod.GET,
                null,
                JobStatusResponse.class
            );
            JobStatusResponse status = resp.getBody();
            if (status == null) continue;
            log.debug("Split job {} status: {}", jobId, status.status());

            switch (status.status()) {
                case "DONE"    -> { return status; }
                case "ERROR"   -> throw new RuntimeException("Parser split failed: " + status.error());
                case "PENDING" -> { /* continue polling */ }
                default        -> throw new RuntimeException("Unknown split job status: " + status.status());
            }
        }
        throw new RuntimeException("Split job timed out: jobId=" + jobId);
    }

    /**
     * Converts a STEP file to GLB binary via the parser /convert endpoint.
     * Returns null (non-fatal) if the parser is unavailable or conversion fails.
     */
    public byte[] convertToGlb(byte[] stepBytes, String filename) {
        log.info("Requesting GLB conversion for {} ({} bytes)", filename, stepBytes.length);
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new org.springframework.core.io.ByteArrayResource(stepBytes) {
                @Override public String getFilename() { return filename; }
            });

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ResponseEntity<byte[]> response = rest.exchange(
                parserUrl + "/convert",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                byte[].class
            );
            byte[] glb = response.getBody();
            log.info("GLB conversion for {}: {} bytes", filename, glb != null ? glb.length : 0);
            return glb;
        } catch (Exception e) {
            log.warn("GLB conversion failed for {}: {}", filename, e.getMessage());
            return null;
        }
    }

    private String detectFormat(String filename) {
        if (filename == null) return "UNKNOWN";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".step") || lower.endsWith(".stp")) return "STEP";
        if (lower.endsWith(".catproduct") || lower.endsWith(".catpart")) return "CATIA_V5";
        return "UNKNOWN";
    }
}
