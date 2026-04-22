package com.pno.domain.service;

import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectSpaceService {

    private final DSLContext dsl;

    public List<Map<String, Object>> listProjectSpaces() {
        return listProjectSpaces(null);
    }

    /**
     * Returns project spaces visible to a given user.
     * Admin users see all spaces; non-admin users see only spaces where they hold a role.
     * When userId is null or blank, all active spaces are returned (internal/admin use).
     */
    public List<Map<String, Object>> listProjectSpaces(String userId) {
        if (userId != null && !userId.isBlank()) {
            // Check if user is admin
            Integer adminFlag = dsl.select(DSL.field("is_admin", Integer.class))
                .from("pno_user")
                .where("id = ?", userId)
                .and("active = 1")
                .fetchOne(0, Integer.class);

            if (!Integer.valueOf(1).equals(adminFlag)) {
                // Non-admin: only spaces where the user has at least one role
                return dsl.select()
                    .from("project_space")
                    .where("active = 1")
                    .and(DSL.exists(
                        dsl.select(DSL.field("1"))
                           .from("user_role")
                           .where(DSL.condition("user_id = ?", userId))
                           .and(DSL.condition("project_space_id = project_space.id"))
                    ))
                    .orderBy(DSL.field("name"))
                    .fetch()
                    .map(r -> toMap(r));
            }
        }

        // Admin or no filter: return all active spaces
        return dsl.select().from("project_space")
            .where("active = 1")
            .orderBy(DSL.field("name"))
            .fetch()
            .map(r -> toMap(r));
    }

    /**
     * Resolves all descendant space IDs (children, grandchildren, etc.) including the target itself.
     * Uses iterative BFS. Cycle-safe with visited set, max depth 20.
     */
    public List<String> resolveDescendants(String projectSpaceId) {
        List<String> result = new ArrayList<>();
        java.util.Set<String> visited = new java.util.HashSet<>();
        java.util.Queue<String> queue = new java.util.LinkedList<>();
        queue.add(projectSpaceId);

        while (!queue.isEmpty() && result.size() < 500) {
            String current = queue.poll();
            if (!visited.add(current)) continue;
            result.add(current);

            List<String> children = dsl.select(DSL.field("id"))
                .from("project_space")
                .where("parent_id = ?", current)
                .and("active = 1")
                .fetch(DSL.field("id"), String.class);
            queue.addAll(children);
        }
        return result;
    }

    private Map<String, Object> toMap(org.jooq.Record r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",          r.get("id",          String.class));
        m.put("name",        r.get("name",        String.class));
        m.put("description", r.get("description", String.class));
        m.put("parentId",    r.get("parent_id",   String.class));
        m.put("createdAt",   r.get("created_at",  Object.class));
        m.put("active",      Integer.valueOf(1).equals(r.get("active", Integer.class)));
        return m;
    }

    @Transactional
    public Map<String, Object> createProjectSpace(String name, String description, String parentId) {
        String id = "ps-" + UUID.randomUUID().toString().substring(0, 8);
        dsl.execute("INSERT INTO project_space (id, name, description, parent_id) VALUES (?, ?, ?, ?)",
            id, name, description, parentId);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",          id);
        m.put("name",        name);
        m.put("description", description == null ? "" : description);
        m.put("parentId",    parentId);
        m.put("active",      true);
        return m;
    }

    @Transactional
    public void deactivateProjectSpace(String id) {
        int updated = dsl.execute("UPDATE project_space SET active = 0 WHERE id = ?", id);
        if (updated == 0) throw new IllegalArgumentException("Project space not found: " + id);
    }
}
