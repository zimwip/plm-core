package com.plm.admin.source;

import com.plm.admin.config.ConfigChangedEvent;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class SourceService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;
    private final RestTemplate rest;
    private final String platformUrl;
    private final String serviceSecret;

    public SourceService(DSLContext dsl, ApplicationEventPublisher eventPublisher,
                         RestTemplateBuilder restBuilder,
                         @Value("${plm.settings.settings-url:http://platform-api:8084}") String platformUrl,
                         @Value("${plm.auth.service-secret:}") String serviceSecret) {
        this.dsl           = dsl;
        this.eventPublisher = eventPublisher;
        this.rest          = restBuilder.build();
        this.platformUrl   = platformUrl;
        this.serviceSecret = serviceSecret;
    }

    public List<SourceDto> getAll() {
        return dsl.fetch("SELECT * FROM source ORDER BY is_builtin DESC, name")
            .map(this::toDto);
    }

    public SourceDto get(String id) {
        Record r = dsl.fetchOne("SELECT * FROM source WHERE id = ?", id);
        if (r == null) throw new IllegalArgumentException("Source not found: " + id);
        return toDto(r);
    }

    public List<Map<String, Object>> listResolverInstances() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", serviceSecret);
            var resp = rest.exchange(
                platformUrl + "/api/platform/algorithms/instances",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            List<Map<String, Object>> instances = resp.getBody();
            if (instances == null) return List.of();
            return instances.stream()
                .filter(m -> "algtype-source-resolver".equals(m.get("algorithmTypeId"))
                          || "Source Resolver".equals(m.get("typeName")))
                .toList();
        } catch (Exception e) {
            log.warn("Failed to fetch resolver instances from platform-api: {}", e.getMessage());
            return List.of();
        }
    }

    @Transactional
    public String create(String id, String name, String description, String resolverInstanceId,
                         boolean versioned, String color, String icon) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("Source id is required");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Source name is required");
        if (resolverInstanceId == null || resolverInstanceId.isBlank())
            throw new IllegalArgumentException("resolverInstanceId is required");
        dsl.execute("""
            INSERT INTO source (id, name, description, resolver_instance_id, is_builtin, is_versioned, color, icon, created_at)
            VALUES (?,?,?,?,0,?,?,?,?)
            """, id, name, description, resolverInstanceId,
            versioned ? 1 : 0,
            blankToNull(color), blankToNull(icon), LocalDateTime.now());
        publishChange("CREATE", id);
        return id;
    }

    @Transactional
    public void update(String id, String name, String description, String resolverInstanceId,
                       boolean versioned, String color, String icon) {
        assertNotBuiltin(id);
        if (linkTypeUsesV2V(id) && !versioned) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Source " + id + " is referenced by VERSION_TO_VERSION link types; "
                    + "cannot mark it as non-versioned");
        }
        int updated = dsl.execute("""
            UPDATE source SET name=?, description=?, resolver_instance_id=?, is_versioned=?, color=?, icon=? WHERE id=?
            """, name, description, resolverInstanceId,
            versioned ? 1 : 0,
            blankToNull(color), blankToNull(icon), id);
        if (updated == 0) throw new IllegalArgumentException("Source not found: " + id);
        publishChange("UPDATE", id);
    }

    private boolean linkTypeUsesV2V(String sourceId) {
        return dsl.fetchCount(dsl.selectOne().from("link_type")
            .where("target_source_id = ? AND link_policy = 'VERSION_TO_VERSION'", sourceId)) > 0;
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    @Transactional
    public void delete(String id) {
        assertNotBuiltin(id);
        int linkTypeUsage = dsl.fetchCount(dsl.selectOne().from("link_type").where("target_source_id = ?", id));
        if (linkTypeUsage > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Source " + id + " is referenced by " + linkTypeUsage + " link type(s)");
        }
        dsl.execute("DELETE FROM source WHERE id = ?", id);
        publishChange("DELETE", id);
    }

    private void assertNotBuiltin(String id) {
        Integer flag = dsl.select(DSL.field("is_builtin", Integer.class))
            .from("source").where("id = ?", id).fetchOne(DSL.field("is_builtin", Integer.class));
        if (flag == null) throw new IllegalArgumentException("Source not found: " + id);
        if (flag != 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Built-in source '" + id + "' cannot be modified");
        }
    }

    private SourceDto toDto(Record r) {
        Integer builtin  = r.get("is_builtin",  Integer.class);
        Integer versioned = r.get("is_versioned", Integer.class);
        return new SourceDto(
            r.get("id",                   String.class),
            r.get("name",                 String.class),
            r.get("description",          String.class),
            r.get("resolver_instance_id", String.class),
            null,
            builtin  != null && builtin  != 0,
            versioned != null && versioned != 0,
            r.get("color", String.class),
            r.get("icon",  String.class)
        );
    }

    private void publishChange(String changeType, String entityId) {
        eventPublisher.publishEvent(new ConfigChangedEvent(changeType, "SOURCE", entityId));
    }
}
