package com.plm.platform.api.actions;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Internal (service-to-service, X-Service-Secret) endpoints for algorithm catalog queries.
 * Paths under /internal/** are accepted by PlmAuthFilter with service secret instead of JWT.
 */
@RestController
@RequiredArgsConstructor
public class AlgorithmInternalController {

    private final AlgorithmManagementService algorithmService;

    @GetMapping("/internal/algorithms/instances")
    public ResponseEntity<List<Map<String, Object>>> listInstances(
            @RequestParam(required = false) String serviceCode) {
        return ResponseEntity.ok(algorithmService.listAllInstances(serviceCode));
    }

    @GetMapping("/internal/algorithms/by-type")
    public ResponseEntity<List<Map<String, Object>>> listByType(
            @RequestParam String typeId) {
        return ResponseEntity.ok(algorithmService.listAlgorithmsByType(typeId));
    }
}
