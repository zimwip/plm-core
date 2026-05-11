package com.cad.ingestion.client;

import com.plm.platform.client.ServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Client for PSM action API, routed through spe-api via ServiceClient.
 * ServiceClient auto-forwards Authorization, X-PLM-ProjectSpace, and OTel headers.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PsmActionClient {

    private final ServiceClient serviceClient;

    public UUID findByExternalId(String cadId, String projectSpaceId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = serviceClient.get(
                "psm",
                "/api/psm/internal/cad/nodes/by-external-id?externalId=" + cadId,
                Map.class
            );
            if (response != null && response.containsKey("nodeId")) {
                return UUID.fromString(response.get("nodeId").toString());
            }
        } catch (Exception e) {
            log.debug("No existing node for externalId={}: {}", cadId, e.getMessage());
        }
        return null;
    }

    public String openTransaction() {
        Map<?, ?> response = serviceClient.post("psm", "/api/psm/transactions", Map.of(), Map.class);
        if (response == null || !response.containsKey("txId")) {
            throw new IllegalStateException("PSM transaction open returned no id");
        }
        String txId = response.get("txId").toString();
        log.debug("Opened PSM transaction: {}", txId);
        return txId;
    }

    public UUID createNode(String nodeTypeId, String logicalId, String externalId,
                           Map<String, String> attrs, String txId, String projectSpaceId) {
        Map<String, Object> params = new HashMap<>(attrs);
        if (logicalId != null) params.put("_logicalId", logicalId);
        if (externalId != null) params.put("_externalId", externalId);

        Map<String, Object> body = Map.of("parameters", params);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = serviceClient.exchange(
            "psm",
            "/api/psm/actions/create_node/" + nodeTypeId,
            HttpMethod.POST,
            body,
            Map.class,
            txHeaders(txId)
        );

        if (response == null || !response.containsKey("nodeId")) {
            throw new IllegalStateException("PSM create_node returned no nodeId for type " + nodeTypeId);
        }
        UUID nodeId = UUID.fromString(response.get("nodeId").toString());
        log.debug("Created PSM node: nodeId={} type={} tx={}", nodeId, nodeTypeId, txId);
        return nodeId;
    }

    public void updateNode(UUID nodeId, Map<String, String> attrs, String txId, String projectSpaceId) {
        Map<String, Object> body = Map.of("parameters", attrs);
        serviceClient.exchange(
            "psm",
            "/api/psm/actions/update_node/" + nodeId,
            HttpMethod.POST,
            body,
            Map.class,
            txHeaders(txId)
        );
        log.debug("Updated PSM node: nodeId={} tx={}", nodeId, txId);
    }

    public String createLink(UUID sourceNodeId, String targetLogicalId, String linkTypeId,
                             String txId, String projectSpaceId) {
        Map<String, Object> body = Map.of(
            "parameters", Map.of(
                "linkTypeId",    linkTypeId,
                "targetKey",     targetLogicalId,
                "linkLogicalId", UUID.randomUUID().toString()
            )
        );
        @SuppressWarnings("unchecked")
        Map<String, Object> response = serviceClient.exchange(
            "psm",
            "/api/psm/actions/create_link/" + sourceNodeId,
            HttpMethod.POST,
            body,
            Map.class,
            txHeaders(txId)
        );
        String linkId = response != null && response.containsKey("linkId")
                ? response.get("linkId").toString() : null;
        log.debug("Created PSM link: {} -> {} type={} linkId={} tx={}", sourceNodeId, targetLogicalId, linkTypeId, linkId, txId);
        return linkId;
    }

    public void updateLinkAttributes(String linkId, UUID sourceNodeId,
                                     Map<String, String> attributes,
                                     String txId, String projectSpaceId) {
        if (linkId == null || attributes == null || attributes.isEmpty()) return;
        Map<String, Object> params = new HashMap<>();
        params.put("linkId", linkId);
        attributes.forEach((k, v) -> params.put("linkAttr_" + k, v));
        serviceClient.exchange(
            "psm",
            "/api/psm/actions/update_link/" + linkId,
            HttpMethod.POST,
            Map.of("parameters", params),
            Map.class,
            txHeaders(txId)
        );
        log.debug("Updated link attributes: linkId={} attrs={} tx={}", linkId, attributes.keySet(), txId);
    }

    private static Map<String, String> txHeaders(String txId) {
        return txId != null ? Map.of("X-PLM-Tx", txId) : Map.of();
    }

    public void commit(String txId, String projectSpaceId) {
        serviceClient.exchange(
            "psm",
            "/api/psm/actions/commit/" + txId,
            HttpMethod.POST,
            Map.of("parameters", Map.of("comment", "CAD import")),
            Map.class,
            txHeaders(txId)
        );
        log.debug("Committed PSM transaction: {}", txId);
    }

    public void rollback(String txId, String projectSpaceId) {
        try {
            serviceClient.exchange(
                "psm",
                "/api/psm/actions/rollback/" + txId,
                HttpMethod.POST,
                Map.of("parameters", Map.of()),
                Map.class,
                txHeaders(txId)
            );
            log.debug("Rolled back PSM transaction: {}", txId);
        } catch (Exception e) {
            log.warn("Failed to rollback PSM transaction {}: {}", txId, e.getMessage());
        }
    }
}
