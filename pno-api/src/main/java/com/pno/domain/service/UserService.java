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
public class UserService {

    private final DSLContext dsl;

    /**
     * Returns the user context payload consumed by plm-api's PlmAuthFilter.
     * Format: { userId, username, isAdmin, roleIds }
     *
     * When projectSpaceId is provided, only roles assigned in that space are returned.
     * When null/blank, roles across all project spaces are returned (union).
     */
    public Map<String, Object> getUserContext(String userId, String projectSpaceId) {
        var user = dsl.select().from("pno_user")
            .where("id = ?", userId)
            .and("active = 1")
            .fetchOne();
        if (user == null) return null;

        String  username = user.get("username",  String.class);
        boolean isAdmin  = Integer.valueOf(1).equals(user.get("is_admin", Integer.class));

        List<String> roleIds = new ArrayList<>();

        var query = dsl.select(DSL.field("ur.role_id").as("role_id"))
            .from("user_role ur");

        var condition = DSL.condition("ur.user_id = ?", userId);
        if (projectSpaceId != null && !projectSpaceId.isBlank()) {
            condition = condition.and(DSL.condition("ur.project_space_id = ?", projectSpaceId));
        }

        query.where(condition).fetch()
            .forEach(r -> roleIds.add(r.get("role_id", String.class)));

        Map<String, Object> ctx = new LinkedHashMap<>();
        ctx.put("userId",   userId);
        ctx.put("username", username);
        ctx.put("isAdmin",  isAdmin);
        ctx.put("roleIds",  roleIds);
        return ctx;
    }

    public List<Map<String, Object>> listUsers() {
        return dsl.select().from("pno_user").orderBy(DSL.field("username")).fetch()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",          r.get("id",           String.class));
                m.put("username",    r.get("username",     String.class));
                m.put("displayName", r.get("display_name", String.class));
                m.put("email",       r.get("email",        String.class));
                m.put("active",      Integer.valueOf(1).equals(r.get("active",   Integer.class)));
                m.put("isAdmin",     Integer.valueOf(1).equals(r.get("is_admin", Integer.class)));
                return m;
            });
    }

    @Transactional
    public void setAdmin(String targetUserId, boolean admin) {
        if (!admin) {
            // Guard: at least one other active admin must remain
            Integer otherAdmins = dsl.select(DSL.count()).from("pno_user")
                .where("active = 1")
                .and("is_admin = 1")
                .and("id != ?", targetUserId)
                .fetchOne(0, Integer.class);
            if (otherAdmins == null || otherAdmins == 0) {
                throw new IllegalStateException("Cannot remove the last admin — at least one active admin must remain.");
            }
        }
        int updated = dsl.execute(
            "UPDATE pno_user SET is_admin = ? WHERE id = ?",
            admin ? 1 : 0, targetUserId);
        if (updated == 0) throw new IllegalArgumentException("User not found: " + targetUserId);
    }

    @Transactional
    public Map<String, Object> createUser(String username, String displayName, String email) {
        String id = "user-" + UUID.randomUUID().toString().substring(0, 8);
        dsl.execute(
            "INSERT INTO pno_user (id, username, display_name, email, active) VALUES (?, ?, ?, ?, 1)",
            id, username, displayName, email);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",          id);
        m.put("username",    username);
        m.put("displayName", displayName);
        m.put("email",       email);
        m.put("active",      true);
        return m;
    }

    @Transactional
    public void deactivateUser(String userId) {
        int updated = dsl.execute("UPDATE pno_user SET active = 0 WHERE id = ?", userId);
        if (updated == 0) throw new IllegalArgumentException("User not found: " + userId);
    }

    @Transactional
    public void assignRole(String userId, String roleId, String projectSpaceId) {
        String id = "ur-" + UUID.randomUUID().toString().substring(0, 8);
        dsl.execute(
            "INSERT INTO user_role (id, user_id, role_id, project_space_id) VALUES (?, ?, ?, ?)",
            id, userId, roleId, projectSpaceId);
    }

    @Transactional
    public void removeRole(String userId, String roleId, String projectSpaceId) {
        dsl.execute(
            "DELETE FROM user_role WHERE user_id = ? AND role_id = ? AND project_space_id = ?",
            userId, roleId, projectSpaceId);
    }

    /**
     * Returns all role assignments for a user, including project space information.
     * Optionally filtered to a specific project space.
     */
    public List<Map<String, Object>> getUserRoles(String userId, String projectSpaceId) {
        var query = dsl.select(
                DSL.field("r.id").as("role_id"),
                DSL.field("r.name").as("role_name"),
                DSL.field("ps.id").as("project_space_id"),
                DSL.field("ps.name").as("project_space_name"))
            .from("user_role ur")
            .join("pno_role r").on("ur.role_id = r.id")
            .join("project_space ps").on("ur.project_space_id = ps.id");

        var condition = DSL.condition("ur.user_id = ?", userId);
        if (projectSpaceId != null && !projectSpaceId.isBlank()) {
            condition = condition.and(DSL.condition("ur.project_space_id = ?", projectSpaceId));
        }

        return query.where(condition).fetch()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",               r.get("role_id",           String.class));
                m.put("name",             r.get("role_name",          String.class));
                m.put("projectSpaceId",   r.get("project_space_id",  String.class));
                m.put("projectSpaceName", r.get("project_space_name", String.class));
                return m;
            });
    }
}
