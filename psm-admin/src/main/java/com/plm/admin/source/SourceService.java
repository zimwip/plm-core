package com.plm.admin.source;

import com.plm.admin.config.ConfigChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SourceService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;

    public List<SourceDto> getAll() {
        return dsl.fetch("""
            SELECT s.id, s.name, s.description, s.resolver_instance_id, s.is_builtin,
                   s.is_versioned, s.color, s.icon, a.code AS resolver_code
            FROM source s
            JOIN algorithm_instance ai ON ai.id = s.resolver_instance_id
            JOIN algorithm a           ON a.id  = ai.algorithm_id
            ORDER BY s.is_builtin DESC, s.name
            """).map(this::toDto);
    }

    public SourceDto get(String id) {
        Record r = dsl.fetchOne("""
            SELECT s.id, s.name, s.description, s.resolver_instance_id, s.is_builtin,
                   s.is_versioned, s.color, s.icon, a.code AS resolver_code
            FROM source s
            JOIN algorithm_instance ai ON ai.id = s.resolver_instance_id
            JOIN algorithm a           ON a.id  = ai.algorithm_id
            WHERE s.id = ?
            """, id);
        if (r == null) throw new IllegalArgumentException("Source not found: " + id);
        return toDto(r);
    }

    public List<Map<String, Object>> listResolverInstances() {
        return dsl.fetch("""
            SELECT ai.id, ai.name, a.id AS algorithm_id, a.code AS algorithm_code, a.name AS algorithm_name
            FROM algorithm_instance ai
            JOIN algorithm a ON a.id = ai.algorithm_id
            WHERE a.algorithm_type_id = 'algtype-source-resolver'
            ORDER BY a.code, ai.name
            """).map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("instanceId", r.get("id", String.class));
            m.put("instanceName", r.get("name", String.class));
            m.put("algorithmId", r.get("algorithm_id", String.class));
            m.put("algorithmCode", r.get("algorithm_code", String.class));
            m.put("algorithmName", r.get("algorithm_name", String.class));
            return m;
        });
    }

    @Transactional
    public String create(String id, String name, String description, String resolverInstanceId,
                         boolean versioned, String color, String icon) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("Source id is required");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Source name is required");
        if (resolverInstanceId == null || resolverInstanceId.isBlank()) {
            throw new IllegalArgumentException("resolverInstanceId is required");
        }
        assertResolverInstance(resolverInstanceId);
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
        assertResolverInstance(resolverInstanceId);
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

    private void assertResolverInstance(String resolverInstanceId) {
        if (resolverInstanceId == null) return;
        int found = dsl.fetchCount(dsl.selectOne()
            .from("algorithm_instance ai")
            .join("algorithm a").on("a.id = ai.algorithm_id")
            .where("ai.id = ?", resolverInstanceId)
            .and("a.algorithm_type_id = 'algtype-source-resolver'"));
        if (found == 0) {
            throw new IllegalArgumentException("Resolver instance not found or not of type algtype-source-resolver: "
                + resolverInstanceId);
        }
    }

    private SourceDto toDto(Record r) {
        Integer builtin = r.get("is_builtin", Integer.class);
        Integer versioned = r.get("is_versioned", Integer.class);
        return new SourceDto(
            r.get("id", String.class),
            r.get("name", String.class),
            r.get("description", String.class),
            r.get("resolver_instance_id", String.class),
            r.get("resolver_code", String.class),
            builtin != null && builtin != 0,
            versioned != null && versioned != 0,
            r.get("color", String.class),
            r.get("icon", String.class)
        );
    }

    private void publishChange(String changeType, String entityId) {
        eventPublisher.publishEvent(new ConfigChangedEvent(changeType, "SOURCE", entityId));
    }
}
