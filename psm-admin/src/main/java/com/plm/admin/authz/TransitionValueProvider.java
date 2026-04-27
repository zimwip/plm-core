package com.plm.admin.authz;

import com.plm.platform.authz.ScopeValueProvider;
import com.plm.platform.authz.dto.KeyValue;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Serves the {@code LIFECYCLE.transition} value list. Requires {@code nodeType}
 * in {@code parentPath} so the response is scoped to the lifecycle attached to
 * that nodeType — pno builds a {@code valuesByParent} map for the frontend.
 *
 * <p>Returns empty when the parent nodeType is missing or has no lifecycle.
 */
@Component
@RequiredArgsConstructor
public class TransitionValueProvider implements ScopeValueProvider {

    private final DSLContext dsl;

    @Override
    public String scopeCode() { return "LIFECYCLE"; }

    @Override
    public String keyName() { return "transition"; }

    @Override
    public List<KeyValue> values(Map<String, String> parentPath) {
        String nodeTypeId = parentPath.get("nodeType");
        if (nodeTypeId == null || nodeTypeId.isBlank()) return List.of();

        List<KeyValue> out = new ArrayList<>();
        for (Record r : dsl.fetch(
                "SELECT t.id, t.name, fs.name AS from_state_name, ts.name AS to_state_name "
                    + "FROM lifecycle_transition t "
                    + "JOIN node_type nt ON nt.lifecycle_id = t.lifecycle_id "
                    + "JOIN lifecycle_state fs ON fs.id = t.from_state_id "
                    + "JOIN lifecycle_state ts ON ts.id = t.to_state_id "
                    + "WHERE nt.id = ? "
                    + "ORDER BY fs.name, t.name",
                nodeTypeId)) {
            String label = r.get("from_state_name", String.class) + " → " + r.get("name", String.class);
            out.add(new KeyValue(r.get("id", String.class), label));
        }
        return out;
    }
}
