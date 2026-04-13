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
public class RoleService {

    private final DSLContext dsl;

    public List<Map<String, Object>> listRoles() {
        return dsl.select().from("pno_role").orderBy(DSL.field("name")).fetch()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",          r.get("id",          String.class));
                m.put("name",        r.get("name",        String.class));
                m.put("description", r.get("description", String.class));
                return m;
            });
    }

    @Transactional
    public Map<String, Object> createRole(String name, String description) {
        String id = "role-" + UUID.randomUUID().toString().substring(0, 8);
        dsl.execute("INSERT INTO pno_role (id, name, description) VALUES (?, ?, ?)",
            id, name, description);
        return Map.of("id", id, "name", name, "description", description == null ? "" : description);
    }

    @Transactional
    public void updateRole(String roleId, String name, String description) {
        int updated = dsl.execute(
            "UPDATE pno_role SET name = ?, description = ? WHERE id = ?",
            name, description, roleId);
        if (updated == 0) throw new IllegalArgumentException("Role not found: " + roleId);
    }

    @Transactional
    public void deleteRole(String roleId) {
        // Remove all user_role assignments first
        dsl.execute("DELETE FROM user_role WHERE role_id = ?", roleId);
        int deleted = dsl.execute("DELETE FROM pno_role WHERE id = ?", roleId);
        if (deleted == 0) throw new IllegalArgumentException("Role not found: " + roleId);
    }
}
