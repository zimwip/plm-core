package com.plm.admin.enumdef;

import com.plm.admin.config.ConfigChangedEvent;
import com.plm.admin.lifecycle.LifecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnumDefinitionService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;

    public List<Map<String, Object>> getAllEnums() {
        return dsl.select().from("enum_definition").orderBy(DSL.field("name")).fetch()
            .map(this::toEnumMap);
    }

    public Map<String, Object> getEnum(String enumId) {
        Record r = dsl.select().from("enum_definition").where("id = ?", enumId).fetchOne();
        if (r == null) throw new IllegalArgumentException("Enum not found: " + enumId);
        Map<String, Object> m = toEnumMap(r);
        m.put("values", getValues(enumId));
        return m;
    }

    @Transactional
    public String createEnum(String code, String name, String description) {
        LifecycleService.validateCode(code);
        dsl.execute("INSERT INTO enum_definition (id, name, description, created_at) VALUES (?,?,?,?)",
            code, name, description, LocalDateTime.now());
        publishChange("CREATE", "ENUM_DEFINITION", code);
        return code;
    }

    @Transactional
    public void updateEnum(String enumId, String name, String description) {
        int updated = dsl.execute("UPDATE enum_definition SET name=?, description=? WHERE id=?",
            name, description, enumId);
        if (updated == 0) throw new IllegalArgumentException("Enum not found: " + enumId);
        publishChange("UPDATE", "ENUM_DEFINITION", enumId);
    }

    @Transactional
    public void deleteEnum(String enumId) {
        int refs = dsl.fetchCount(dsl.selectOne().from("attribute_definition").where("enum_definition_id = ?", enumId));
        int linkRefs = dsl.fetchCount(dsl.selectOne().from("link_type_attribute").where("enum_definition_id = ?", enumId));
        if (refs + linkRefs > 0) throw new IllegalStateException("Enum is referenced by " + (refs + linkRefs) + " attribute definition(s)");
        dsl.execute("DELETE FROM enum_value WHERE enum_definition_id = ?", enumId);
        dsl.execute("DELETE FROM enum_definition WHERE id = ?", enumId);
        publishChange("DELETE", "ENUM_DEFINITION", enumId);
    }

    public List<Map<String, Object>> getValues(String enumId) {
        return dsl.select().from("enum_value").where("enum_definition_id = ?", enumId)
            .orderBy(DSL.field("display_order")).fetch()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("value", r.get("value", String.class));
                m.put("label", r.get("label", String.class));
                m.put("displayOrder", r.get("display_order", Integer.class));
                return m;
            });
    }

    @Transactional
    public String addValue(String enumId, String value, String label, int displayOrder) {
        if (displayOrder < 0) {
            Integer max = dsl.select(DSL.max(DSL.field("display_order", Integer.class)))
                .from("enum_value").where("enum_definition_id = ?", enumId)
                .fetchOne(0, Integer.class);
            displayOrder = max != null ? max + 1 : 0;
        }
        dsl.execute("INSERT INTO enum_value (enum_definition_id, value, label, display_order) VALUES (?,?,?,?)",
            enumId, value, label, displayOrder);
        publishChange("UPDATE", "ENUM_DEFINITION", enumId);
        return value;
    }

    @Transactional
    public void updateValue(String enumId, String value, String label, int displayOrder) {
        dsl.execute("UPDATE enum_value SET label=?, display_order=? WHERE enum_definition_id=? AND value=?",
            label, displayOrder, enumId, value);
        publishChange("UPDATE", "ENUM_DEFINITION", enumId);
    }

    @Transactional
    public void deleteValue(String enumId, String value) {
        dsl.execute("DELETE FROM enum_value WHERE enum_definition_id=? AND value=?", enumId, value);
        publishChange("UPDATE", "ENUM_DEFINITION", enumId);
    }

    @Transactional
    public void reorderValues(String enumId, List<String> values) {
        for (int i = 0; i < values.size(); i++) {
            dsl.execute("UPDATE enum_value SET display_order=? WHERE enum_definition_id=? AND value=?",
                i, enumId, values.get(i));
        }
        publishChange("UPDATE", "ENUM_DEFINITION", enumId);
    }

    private Map<String, Object> toEnumMap(Record r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.get("id", String.class));
        m.put("name", r.get("name", String.class));
        m.put("description", r.get("description", String.class));
        int count = dsl.fetchCount(dsl.selectOne().from("enum_value")
            .where("enum_definition_id = ?", r.get("id", String.class)));
        m.put("valueCount", count);
        return m;
    }

    private void publishChange(String changeType, String entityType, String entityId) {
        eventPublisher.publishEvent(new ConfigChangedEvent(changeType, entityType, entityId));
    }
}
