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
        m.put("isolated",    Integer.valueOf(1).equals(r.get("isolated", Integer.class)));
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

    // ── Service tag configuration ──────────────────────────────────

    /**
     * Returns service tags for a project space, grouped by service code.
     * Result: { "psm-api": ["PSM1","PSM2"], "pno-api": ["PNO1"] }
     */
    public Map<String, List<String>> getServiceTags(String projectSpaceId) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        dsl.select(DSL.field("service_code"), DSL.field("tag_value"))
            .from("project_space_service_tag")
            .where("project_space_id = ?", projectSpaceId)
            .orderBy(DSL.field("service_code"), DSL.field("tag_value"))
            .fetch()
            .forEach(r -> result.computeIfAbsent(
                r.get("service_code", String.class), k -> new ArrayList<>()
            ).add(r.get("tag_value", String.class)));
        return result;
    }

    /**
     * Returns effective service tags for a project space, resolving hierarchy.
     * Walks up the parent chain: if this space has tags for a service, use them;
     * otherwise inherit from parent. Also returns whether the effective config is isolated.
     */
    public Map<String, Object> getEffectiveServiceTags(String projectSpaceId) {
        // Walk up the hierarchy collecting configs
        String currentId = projectSpaceId;
        java.util.Set<String> visited = new java.util.HashSet<>();
        Map<String, List<String>> effectiveTags = new LinkedHashMap<>();
        boolean isolated = false;

        while (currentId != null && visited.add(currentId)) {
            // Get this space's own tags
            Map<String, List<String>> ownTags = getServiceTags(currentId);

            // Get isolated flag for current space
            var rec = dsl.select(DSL.field("isolated"), DSL.field("parent_id"))
                .from("project_space")
                .where("id = ?", currentId)
                .and("active = 1")
                .fetchOne();
            if (rec == null) break;

            if (currentId.equals(projectSpaceId)) {
                isolated = Integer.valueOf(1).equals(rec.get("isolated", Integer.class));
            }

            // For each service in ownTags, if not already defined by a child, take it
            for (var entry : ownTags.entrySet()) {
                effectiveTags.putIfAbsent(entry.getKey(), entry.getValue());
            }

            currentId = rec.get("parent_id", String.class);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("projectSpaceId", projectSpaceId);
        result.put("isolated", isolated);
        result.put("serviceTags", effectiveTags);
        return result;
    }

    /**
     * Sets service tags for a project space (replaces all tags for the given service).
     * Validates isolation: if this project is isolated, ensures no other project uses the same tags.
     */
    @Transactional
    public void setServiceTags(String projectSpaceId, String serviceCode, List<String> tags) {
        // Check project exists
        Integer exists = dsl.select(DSL.field("1"))
            .from("project_space")
            .where("id = ?", projectSpaceId)
            .and("active = 1")
            .fetchOne(0, Integer.class);
        if (exists == null) throw new IllegalArgumentException("Project space not found: " + projectSpaceId);

        // Check isolation constraints
        boolean isIsolated = isIsolated(projectSpaceId);
        if (isIsolated && tags != null && !tags.isEmpty()) {
            for (String tag : tags) {
                // Check no other project uses this service+tag
                Integer conflict = dsl.select(DSL.field("1"))
                    .from("project_space_service_tag")
                    .where("service_code = ?", serviceCode)
                    .and("tag_value = ?", tag)
                    .and(DSL.condition("project_space_id <> ?", projectSpaceId))
                    .fetchOne(0, Integer.class);
                if (conflict != null) {
                    throw new IllegalStateException(
                        "Tag '" + tag + "' for service '" + serviceCode
                        + "' is already used by another project space (isolation conflict)");
                }
            }
        }

        // Also check if any other isolated project already owns these tags
        if (tags != null && !tags.isEmpty()) {
            for (String tag : tags) {
                Integer isolatedConflict = dsl.select(DSL.field("1"))
                    .from("project_space_service_tag")
                    .innerJoin("project_space").on("project_space.id = project_space_service_tag.project_space_id")
                    .where("project_space_service_tag.service_code = ?", serviceCode)
                    .and("project_space_service_tag.tag_value = ?", tag)
                    .and("project_space.isolated = 1")
                    .and(DSL.condition("project_space_service_tag.project_space_id <> ?", projectSpaceId))
                    .fetchOne(0, Integer.class);
                if (isolatedConflict != null) {
                    throw new IllegalStateException(
                        "Tag '" + tag + "' for service '" + serviceCode
                        + "' is exclusively owned by an isolated project space");
                }
            }
        }

        // Delete existing tags for this service
        dsl.execute("DELETE FROM project_space_service_tag WHERE project_space_id = ? AND service_code = ?",
            projectSpaceId, serviceCode);

        // Insert new tags
        if (tags != null) {
            for (String tag : tags) {
                if (tag != null && !tag.isBlank()) {
                    String id = "psst-" + UUID.randomUUID().toString().substring(0, 8);
                    dsl.execute("INSERT INTO project_space_service_tag (id, project_space_id, service_code, tag_value) VALUES (?, ?, ?, ?)",
                        id, projectSpaceId, serviceCode, tag.trim());
                }
            }
        }
    }

    /** Set the isolated flag on a project space. */
    @Transactional
    public void setIsolated(String projectSpaceId, boolean isolated) {
        int updated = dsl.execute("UPDATE project_space SET isolated = ? WHERE id = ? AND active = 1",
            isolated ? 1 : 0, projectSpaceId);
        if (updated == 0) throw new IllegalArgumentException("Project space not found: " + projectSpaceId);
    }

    public boolean isIsolated(String projectSpaceId) {
        Integer flag = dsl.select(DSL.field("isolated", Integer.class))
            .from("project_space")
            .where("id = ?", projectSpaceId)
            .and("active = 1")
            .fetchOne(0, Integer.class);
        return Integer.valueOf(1).equals(flag);
    }
}
