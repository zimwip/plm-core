package com.plm.permission.internal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.casbin.jcasbin.model.Model;
import org.casbin.jcasbin.persist.Adapter;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;

import java.util.Arrays;
import java.util.List;

/**
 * Read-only Casbin adapter that loads policies from the {@code authorization_policy} table.
 *
 * <p>Policy CRUD is handled by {@link PermissionAdminService} via jOOQ — this adapter
 * only reads. Call {@code enforcer.loadPolicy()} after mutations to refresh the model.
 */
@Slf4j
@RequiredArgsConstructor
public class JooqPolicyAdapter implements Adapter {

    private final DSLContext dsl;

    @Override
    public void loadPolicy(Model model) {
        var rows = dsl.select(
                DSL.field("role_id"),
                DSL.field("project_space_id"),
                DSL.field("permission_code"),
                DSL.coalesce(DSL.field("node_type_id"), DSL.inline("*")),
                DSL.coalesce(DSL.field("transition_id"), DSL.inline("*")))
            .from("authorization_policy")
            .fetch();

        int count = 0;
        for (var row : rows) {
            List<String> rule = Arrays.asList(
                row.get(0, String.class),
                row.get(1, String.class),
                row.get(2, String.class),
                row.get(3, String.class),
                row.get(4, String.class));
            model.addPolicy("p", "p", rule);
            count++;
        }
        log.info("Casbin: loaded {} policies from authorization_policy", count);
    }

    @Override
    public void savePolicy(Model model) {
        throw new UnsupportedOperationException("Policy writes go through PermissionAdminService");
    }

    @Override
    public void addPolicy(String sec, String ptype, List<String> rule) {
        throw new UnsupportedOperationException("Policy writes go through PermissionAdminService");
    }

    @Override
    public void removePolicy(String sec, String ptype, List<String> rule) {
        throw new UnsupportedOperationException("Policy writes go through PermissionAdminService");
    }

    @Override
    public void removeFilteredPolicy(String sec, String ptype, int fieldIndex, String... fieldValues) {
        throw new UnsupportedOperationException("Policy writes go through PermissionAdminService");
    }
}
