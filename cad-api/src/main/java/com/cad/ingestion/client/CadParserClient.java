package com.cad.ingestion.client;

import com.cad.algorithm.CadNodeData;
import com.cad.algorithm.CadOccurrence;
import com.cad.ingestion.model.SplitPart;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
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

    @SuppressWarnings({"deprecation", "removal"}) // setBufferRequestBody: only way to stream multipart on SimpleClientHttpRequestFactory
    public CadParserClient(RestTemplateBuilder builder,
                           @Value("${cad.parser.url}") String parserUrl) {
        // bufferRequestBody=false streams the multipart body to the socket; paired with
        // a FileSystemResource part the upload never hits the heap as a whole byte[].
        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout(10_000);
        rf.setReadTimeout(120_000);
        rf.setBufferRequestBody(false);
        this.rest      = builder.requestFactory(() -> rf).build();
        this.parserUrl = parserUrl;
    }

    /** A disk-backed multipart part that reports {@code filename} to the parser (not the temp name). */
    private static Resource filePart(Path file, String filename) {
        return new FileSystemResource(file) {
            @Override public String getFilename() { return filename; }
        };
    }

    /**
     * Sends the file to the parser sidecar and returns the parsed CAD node list in DFS order.
     * Format is detected from the filename extension:
     *   .step / .stp  → STEP
     *   .CATProduct / .CATPart → CATIA_V5
     *   others        → UNKNOWN (parser decides)
     */
    public List<CadNodeData> parse(Path file, String filename) {
        String format = detectFormat(filename);
        log.info("Sending {} (format={}) to parser at {}", filename, format, parserUrl);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", filePart(file, filename));
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
    public SplitResult split(Path file, String filename) {
        String format = detectFormat(filename);
        log.info("Submitting async split for {} (format={}) to {}", filename, format, parserUrl);

        // Step 1 — submit job (fast, parser returns 202 immediately)
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", filePart(file, filename));
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

        // Step 3 — return metadata only. Part STEP bytes stay on the parser disk and are
        // fetched one at a time via downloadPartStep(), so the importer never holds them all.
        List<PartMeta> parts = status.parts();
        List<SplitPart> result = new ArrayList<>(parts.size());
        for (int i = 0; i < parts.size(); i++) {
            PartMeta meta = parts.get(i);
            result.add(new SplitPart(
                meta.nodeId(),
                meta.name(),
                meta.cadType(),
                meta.attributes() != null ? meta.attributes() : Map.of(),
                meta.occurrences() != null ? meta.occurrences() : List.of(),
                jobId,
                i
            ));
        }
        log.info("Split job {} produced {} parts (metadata only)", jobId, result.size());
        return new SplitResult(jobId, result);
    }

    /**
     * Streams one part's STEP file from the parser to a temp file on disk and returns its path.
     * The response body is copied chunk-by-chunk (never a full byte[] in heap). Caller owns the
     * temp file and must delete it after upload.
     */
    public Path downloadPartStep(String jobId, int partIndex) {
        try {
            Path tmp = Files.createTempFile("cad-part-" + partIndex + "-", ".step");
            rest.execute(
                parserUrl + "/split/" + jobId + "/part/" + partIndex,
                HttpMethod.GET,
                null,
                resp -> {
                    try (var in = resp.getBody()) {
                        Files.copy(in, tmp, StandardCopyOption.REPLACE_EXISTING);
                    }
                    return null;
                }
            );
            return tmp;
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to download split part " + jobId + "/" + partIndex, e);
        }
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
    public byte[] convertToGlb(Path stepFile, String filename) {
        log.info("Requesting GLB conversion for {}", filename);
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", filePart(stepFile, filename));

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
