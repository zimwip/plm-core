package com.cad.ingestion.client;

import com.plm.platform.spe.client.ServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Calls PSM's internal node-validation endpoint during import job processing.
 * Routes through ServiceClient (spe-api discovery) so tracing headers propagate.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PsmValidationClient {

    private final ServiceClient serviceClient;

    @SuppressWarnings("unchecked")
    public ValidationResult validateNode(String cadId, String name, String cadType,
                                         Map<String, String> attributes,
                                         String importContextCode,
                                         String nodeValidationAlgorithmInstanceId) {
        Map<String, Object> body = Map.of(
            "cadId",                                cadId != null ? cadId : "",
            "name",                                 name != null ? name : "",
            "cadType",                              cadType != null ? cadType : "",
            "attributes",                           attributes != null ? attributes : Map.of(),
            "importContextCode",                    importContextCode != null ? importContextCode : "",
            "nodeValidationAlgorithmInstanceId",    nodeValidationAlgorithmInstanceId != null
                                                        ? nodeValidationAlgorithmInstanceId : ""
        );

        try {
            Map<String, Object> resp = serviceClient.post(
                "psm", "/api/psm/internal/cad/validate-node", body, Map.class
            );
            if (resp == null) return ValidationResult.accept(cadType);
            boolean valid = Boolean.TRUE.equals(resp.get("valid"));
            String rejectReason = (String) resp.getOrDefault("rejectReason", "");
            String suggestedTypeId = (String) resp.getOrDefault("suggestedNodeTypeId", cadType);
            @SuppressWarnings("unchecked")
            Map<String, String> enriched = (Map<String, String>) resp.getOrDefault("enrichedAttributes", attributes);
            return new ValidationResult(valid, rejectReason, suggestedTypeId, enriched);
        } catch (Exception e) {
            log.warn("PSM validation failed for cadId={}: {} — accepting by default", cadId, e.getMessage());
            return ValidationResult.accept(cadType);
        }
    }

    public record ValidationResult(
        boolean valid,
        String rejectReason,
        String suggestedNodeTypeId,
        Map<String, String> enrichedAttributes
    ) {
        static ValidationResult accept(String typeId) {
            return new ValidationResult(true, null, typeId, Map.of());
        }
    }
}
