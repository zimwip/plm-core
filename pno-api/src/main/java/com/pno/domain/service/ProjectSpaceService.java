package com.pno.domain.service;

import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectSpaceService {

    private final DSLContext dsl;

    public List<Map<String, Object>> listProjectSpaces() {
        return dsl.select().from("project_space")
            .where("active = 1")
            .orderBy(DSL.field("name"))
            .fetch()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",          r.get("id",          String.class));
                m.put("name",        r.get("name",        String.class));
                m.put("description", r.get("description", String.class));
                m.put("createdAt",   r.get("created_at",  Object.class));
                m.put("active",      Integer.valueOf(1).equals(r.get("active", Integer.class)));
                return m;
            });
    }

    @Transactional
    public Map<String, Object> createProjectSpace(String name, String description) {
        String id = "ps-" + UUID.randomUUID().toString().substring(0, 8);
        dsl.execute("INSERT INTO project_space (id, name, description) VALUES (?, ?, ?)",
            id, name, description);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",          id);
        m.put("name",        name);
        m.put("description", description == null ? "" : description);
        m.put("active",      true);
        return m;
    }

    @Transactional
    public void deactivateProjectSpace(String id) {
        int updated = dsl.execute("UPDATE project_space SET active = 0 WHERE id = ?", id);
        if (updated == 0) throw new IllegalArgumentException("Project space not found: " + id);
    }
}
