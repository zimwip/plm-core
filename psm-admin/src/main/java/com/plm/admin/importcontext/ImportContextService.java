package com.plm.admin.importcontext;

import com.plm.admin.config.ConfigChangedEvent;
import com.plm.platform.authz.PlmPermission;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
public class ImportContextService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;
    private final RestTemplate rest;
    private final String platformUrl;
    private final String serviceSecret;

    public ImportContextService(DSLContext dsl, ApplicationEventPublisher eventPublisher,
                                RestTemplateBuilder restBuilder,
                                @Value("${plm.settings.settings-url:http://platform-api:8084}") String platformUrl,
                                @Value("${plm.auth.service-secret:}") String serviceSecret) {
        this.dsl           = dsl;
        this.eventPublisher = eventPublisher;
        this.rest          = restBuilder.build();
        this.platformUrl   = platformUrl;
        this.serviceSecret = serviceSecret;
    }

    @PlmPermission("MANAGE_PSM")
    public List<Map<String, Object>> getAll() {
        return dsl.fetch("SELECT * FROM psa_import_context ORDER BY label").map(this::toMap);
    }

    public Map<String, Object> getByCode(String code) {
        Record r = dsl.fetchOne("SELECT * FROM psa_import_context WHERE code = ?", code);
        if (r == null) return null;
        return toMap(r);
    }

    @PlmPermission("MANAGE_PSM")
    public Map<String, Object> getById(String id) {
        Record r = dsl.fetchOne("SELECT * FROM psa_import_context WHERE id = ?", id);
        if (r == null) return null;
        return toMap(r);
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String create(String code, String label, String allowedRootNodeTypes,
                         String acceptedFormats, String importContextAlgorithmInstanceId,
                         String nodeValidationAlgorithmInstanceId) {
        String id = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO psa_import_context
              (id, code, label, allowed_root_node_types, accepted_formats,
               import_context_algorithm_instance_id, node_validation_algorithm_instance_id,
               created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?)
            """,
            id, code, label, blankToNull(allowedRootNodeTypes), blankToNull(acceptedFormats),
            blankToNull(importContextAlgorithmInstanceId), blankToNull(nodeValidationAlgorithmInstanceId),
            LocalDateTime.now(), LocalDateTime.now()
        );
        publishChange("CREATE", id);
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void update(String id, String label, String allowedRootNodeTypes,
                       String acceptedFormats, String importContextAlgorithmInstanceId,
                       String nodeValidationAlgorithmInstanceId) {
        int updated = dsl.execute("""
            UPDATE psa_import_context SET
              label=?, allowed_root_node_types=?, accepted_formats=?,
              import_context_algorithm_instance_id=?,
              node_validation_algorithm_instance_id=?,
              updated_at=?
            WHERE id=?
            """,
            label, blankToNull(allowedRootNodeTypes), blankToNull(acceptedFormats),
            blankToNull(importContextAlgorithmInstanceId), blankToNull(nodeValidationAlgorithmInstanceId),
            LocalDateTime.now(), id
        );
        if (updated == 0) throw new IllegalArgumentException("ImportContext not found: " + id);
        publishChange("UPDATE", id);
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void delete(String id) {
        int deleted = dsl.execute("DELETE FROM psa_import_context WHERE id = ?", id);
        if (deleted == 0) throw new IllegalArgumentException("ImportContext not found: " + id);
        publishChange("DELETE", id);
    }

    @PlmPermission("MANAGE_PSM")
    public List<Map<String, Object>> listImportContextAlgorithmInstances() {
        return listInstancesOfType("algtype-import-context");
    }

    @PlmPermission("MANAGE_PSM")
    public List<Map<String, Object>> listNodeValidationAlgorithmInstances() {
        return listInstancesOfType("algtype-node-import-validation");
    }

    private List<Map<String, Object>> listInstancesOfType(String typeId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", serviceSecret);
            var resp = rest.exchange(
                platformUrl + "/api/platform/internal/algorithms/instances",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            List<Map<String, Object>> instances = resp.getBody();
            if (instances == null) return List.of();
            return instances.stream()
                .filter(m -> typeId.equals(m.get("algorithmTypeId")))
                .toList();
        } catch (Exception e) {
            log.warn("Failed to fetch instances of type {} from platform-api: {}", typeId, e.getMessage());
            return List.of();
        }
    }

    private Map<String, Object> toMap(Record r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",                                   r.get("id",                                    String.class));
        m.put("code",                                 r.get("code",                                  String.class));
        m.put("label",                                r.get("label",                                 String.class));
        m.put("allowedRootNodeTypes",                 r.get("allowed_root_node_types",               String.class));
        m.put("acceptedFormats",                      r.get("accepted_formats",                      String.class));
        m.put("importContextAlgorithmInstanceId",     r.get("import_context_algorithm_instance_id",  String.class));
        m.put("nodeValidationAlgorithmInstanceId",    r.get("node_validation_algorithm_instance_id", String.class));
        m.put("createdAt",                            r.get("created_at",                            String.class));
        m.put("updatedAt",                            r.get("updated_at",                            String.class));
        return m;
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private void publishChange(String changeType, String entityId) {
        eventPublisher.publishEvent(new ConfigChangedEvent(changeType, "IMPORT_CONTEXT", entityId));
    }
}
