package com.plm.cad;

import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.AlgorithmConfig;
import com.plm.platform.config.dto.AlgorithmInstanceConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

/**
 * Internal endpoint called by cad-api during async import job processing.
 * Resolves the configured NodeImportValidationAlgorithm and runs it.
 * Protected by X-Service-Secret (enforced by PlmAuthFilter for /internal/**).
 */
@Slf4j
@RestController
@RequestMapping("/internal/cad")
@RequiredArgsConstructor
public class CadValidationController {

    private final AlgorithmRegistry algorithmRegistry;
    private final ConfigCache configCache;

    @PostMapping("/validate-node")
    public ResponseEntity<Map<String, Object>> validateNode(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        Map<String, String> attributes = (Map<String, String>) body.getOrDefault("attributes", Map.of());

        NodeImportCandidate candidate = new NodeImportCandidate(
            (String) body.get("cadId"),
            (String) body.get("name"),
            (String) body.get("cadType"),
            attributes,
            (String) body.get("importContextCode")
        );

        String instanceId = (String) body.get("nodeValidationAlgorithmInstanceId");
        NodeImportValidationAlgorithm algorithm = resolveAlgorithm(instanceId);
        NodeValidationResult result = algorithm.validate(candidate);

        return ResponseEntity.ok(Map.of(
            "valid",                result.valid(),
            "rejectReason",         result.rejectReason() != null ? result.rejectReason() : "",
            "suggestedNodeTypeId",  result.suggestedNodeTypeId() != null ? result.suggestedNodeTypeId() : "",
            "enrichedAttributes",   result.enrichedAttributes() != null ? result.enrichedAttributes() : Map.of()
        ));
    }

    private NodeImportValidationAlgorithm resolveAlgorithm(String instanceId) {
        if (instanceId != null) {
            Optional<AlgorithmInstanceConfig> inst = configCache.getInstance(instanceId);
            if (inst.isPresent()) {
                String algorithmId = inst.get().algorithmId();
                Optional<String> code = configCache.getAllAlgorithms().stream()
                    .filter(a -> algorithmId.equals(a.id()))
                    .map(AlgorithmConfig::code)
                    .findFirst();
                if (code.isPresent() && algorithmRegistry.hasBean(code.get())) {
                    return algorithmRegistry.resolve(code.get(), NodeImportValidationAlgorithm.class);
                }
                log.warn("Instance {} references unknown algorithm {}", instanceId, algorithmId);
            } else {
                log.warn("Algorithm instance {} not found in config cache", instanceId);
            }
        }
        return algorithmRegistry.hasBean("default-node-validation")
            ? algorithmRegistry.resolve("default-node-validation", NodeImportValidationAlgorithm.class)
            : new DefaultNodeImportValidationAlgorithm();
    }
}
