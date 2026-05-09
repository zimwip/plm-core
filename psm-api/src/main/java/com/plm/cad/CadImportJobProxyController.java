package com.plm.cad;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Proxies CAD-related data from internal services to authenticated frontend callers.
 * cad-api and psa are purely internal — this controller is the public surface.
 */
@Slf4j
@RestController
@RequestMapping("/cad")
@RequiredArgsConstructor
public class CadImportJobProxyController {

    private final CadApiClient cadApiClient;
    private final PsaImportContextClient psaImportContextClient;

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<Map<String, Object>> getJobStatus(@PathVariable String jobId) {
        Map<String, Object> status = cadApiClient.getJobStatus(jobId);
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(status);
    }

    @GetMapping("/import-contexts")
    public ResponseEntity<List<Map<String, Object>>> listImportContexts() {
        return ResponseEntity.ok(psaImportContextClient.listAll());
    }
}
