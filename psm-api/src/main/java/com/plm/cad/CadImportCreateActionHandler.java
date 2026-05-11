package com.plm.cad;

import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionResult;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.security.PlmProjectSpaceContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@AlgorithmBean(
    code = "cad-import-create",
    name = "CAD Import — Create",
    description = "Imports a CAD file and creates PSM nodes without requiring an existing root node"
)
public class CadImportCreateActionHandler implements ActionHandler {

    private final CadApiClient cadApiClient;
    private final PsaImportContextClient psaClient;

    public CadImportCreateActionHandler(CadApiClient cadApiClient, PsaImportContextClient psaClient) {
        this.cadApiClient = cadApiClient;
        this.psaClient    = psaClient;
    }

    @Override
    public String actionCode() { return "cad-import-create"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.postMultipart("/cad/import").withJobStatusPath("/cad/jobs/{jobId}"));
    }

    @Override
    public ActionResult execute(ActionContext context, Map<String, String> params) {
        return ActionResult.ok(Map.of("error", "cad-import-create requires multipart — use POST /api/psm/cad/import"));
    }

    @Override
    public Map<String, String> resolveDynamicAllowedValues(String nodeId, String nodeTypeId, String transitionId) {
        List<Map<String, Object>> contexts = psaClient.listAll();
        String json = contexts.stream()
            .map(ctx -> String.format("{\"value\":\"%s\",\"label\":\"%s (%s)\"}",
                ctx.get("code"),
                String.valueOf(ctx.get("label")).replace("\"", "\\\""),
                ctx.get("code")))
            .collect(Collectors.joining(",", "[", "]"));
        return Map.of("contextCode", json);
    }

    @Override
    public ResponseEntity<?> executeHttp(ActionContext ctx, Map<String, String> params, HttpServletRequest req) {
        if (!(req instanceof MultipartHttpServletRequest multipart)) {
            return ResponseEntity.badRequest().body(Map.of("error", "multipart request required"));
        }

        MultipartFile file = multipart.getFile("file");
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "file is required"));
        }

        String contextCode = multipart.getParameter("contextCode");
        if (contextCode == null || contextCode.isBlank()) contextCode = "default";

        boolean splitMode = true;

        String userId         = ctx.userId();
        String projectSpaceId = PlmProjectSpaceContext.get();

        Map<String, Object> importContext = psaClient.findByCode(contextCode);
        if (importContext == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Import context not found: " + contextCode));
        }

        String acceptedFormatsRaw = (String) importContext.get("acceptedFormats");
        if (acceptedFormatsRaw != null && !acceptedFormatsRaw.isBlank()) {
            String filename = file.getOriginalFilename();
            if (!isFormatAccepted(filename, acceptedFormatsRaw)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "File format not accepted for context " + contextCode,
                    "acceptedFormats", acceptedFormatsRaw
                ));
            }
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            log.error("Failed to read uploaded file", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to read file"));
        }

        log.info("Submitting CAD import (create): contextCode={} file={} size={}",
            contextCode, file.getOriginalFilename(), bytes.length);

        Map<String, Object> result = cadApiClient.submitImport(
            null, contextCode, userId, projectSpaceId, bytes, file.getOriginalFilename(), ctx.txId(), splitMode
        );

        return ResponseEntity.accepted().body(result);
    }

    private boolean isFormatAccepted(String filename, String acceptedFormatsJson) {
        if (filename == null) return false;
        String lower = filename.toLowerCase();
        String stripped = acceptedFormatsJson.replaceAll("[\\[\\]\"\\s]", "");
        List<String> formats = Arrays.asList(stripped.split(","));
        for (String fmt : formats) {
            if (fmt.equalsIgnoreCase("STEP") && (lower.endsWith(".step") || lower.endsWith(".stp"))) return true;
            if (fmt.equalsIgnoreCase("CATIA_V5") && (lower.endsWith(".catproduct") || lower.endsWith(".catpart"))) return true;
        }
        return false;
    }
}
