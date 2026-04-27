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
 * Serves the {@code NODE.nodeType} value list from the {@code node_type} table
 * owned by psm-admin.
 */
@Component
@RequiredArgsConstructor
public class NodeTypeValueProvider implements ScopeValueProvider {

    private final DSLContext dsl;

    @Override
    public String scopeCode() { return "NODE"; }

    @Override
    public String keyName() { return "nodeType"; }

    @Override
    public List<KeyValue> values(Map<String, String> parentPath) {
        List<KeyValue> out = new ArrayList<>();
        for (Record r : dsl.select(DSL.field("id"), DSL.field("name"))
                .from("node_type")
                .orderBy(DSL.field("name"))
                .fetch()) {
            out.add(new KeyValue(r.get("id", String.class), r.get("name", String.class)));
        }
        return out;
    }
}
