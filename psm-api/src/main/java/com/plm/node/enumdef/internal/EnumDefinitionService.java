package com.plm.node.enumdef.internal;

import com.plm.shared.authorization.PlmPermission;
import com.plm.shared.event.PlmEventPublisher;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnumDefinitionService {

    private final DSLContext dsl;
    private final PlmEventPublisher eventPublisher;
    private final SecurityContextPort secCtx;

    // ================================================================
    // ENUM DEFINITION CRUD
    // ================================================================

    public List<Map<String, Object>> getAllEnums() {
        return dsl.select().from("enum_definition")
            .orderBy(DSL.field("name"))
            .fetch()
            .map(this::toEnumMap);
    }

    public Map<String, Object> getEnum(String enumId) {
        Record r = dsl.select().from("enum_definition").where("id = ?", enumId).fetchOne();
        if (r == null) throw new IllegalArgumentException("Enum not found: " + enumId);
        Map<String, Object> m = toEnumMap(r);
        m.put("values", getValues(enumId));
        return m;
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String createEnum(String name, String description) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO enum_definition (id, name, description, created_at) VALUES (?, ?, ?, ?)",
            id, name, description, LocalDateTime.now());
        log.info("Enum definition '{}' created: {}", name, id);
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateEnum(String enumId, String name, String description) {
        int updated = dsl.execute(
            "UPDATE enum_definition SET name = ?, description = ? WHERE id = ?",
            name, description, enumId);
        if (updated == 0) throw new IllegalArgumentException("Enum not found: " + enumId);
        log.info("Enum definition '{}' updated", enumId);
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void deleteEnum(String enumId) {
        // Check references from attribute_definition
        int attrRefs = dsl.fetchCount(
            dsl.selectOne().from("attribute_definition").where("enum_definition_id = ?", enumId));
        int linkAttrRefs = dsl.fetchCount(
            dsl.selectOne().from("link_type_attribute").where("enum_definition_id = ?", enumId));
        if (attrRefs + linkAttrRefs > 0) {
            throw new IllegalStateException(
                "Enum is referenced by " + (attrRefs + linkAttrRefs) + " attribute definition(s)");
        }
        dsl.execute("DELETE FROM enum_value WHERE enum_definition_id = ?", enumId);
        dsl.execute("DELETE FROM enum_definition WHERE id = ?", enumId);
        log.info("Enum definition '{}' deleted", enumId);
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    // ================================================================
    // ENUM VALUES CRUD
    // ================================================================

    public List<Map<String, Object>> getValues(String enumId) {
        return dsl.select().from("enum_value")
            .where("enum_definition_id = ?", enumId)
            .orderBy(DSL.field("display_order"))
            .fetch()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.get("id", String.class));
                m.put("value", r.get("value", String.class));
                m.put("label", r.get("label", String.class));
                m.put("displayOrder", r.get("display_order", Integer.class));
                return m;
            });
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String addValue(String enumId, String value, String label, int displayOrder) {
        if (displayOrder < 0) {
            Integer max = dsl.select(DSL.max(DSL.field("display_order", Integer.class)))
                .from("enum_value").where("enum_definition_id = ?", enumId)
                .fetchOne(0, Integer.class);
            displayOrder = max != null ? max + 1 : 0;
        }
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO enum_value (id, enum_definition_id, value, label, display_order) VALUES (?, ?, ?, ?, ?)",
            id, enumId, value, label, displayOrder);
        log.info("Enum value '{}' added to enum {}", value, enumId);
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateValue(String valueId, String value, String label, int displayOrder) {
        dsl.execute(
            "UPDATE enum_value SET value = ?, label = ?, display_order = ? WHERE id = ?",
            value, label, displayOrder, valueId);
        log.info("Enum value '{}' updated", valueId);
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void deleteValue(String valueId) {
        dsl.execute("DELETE FROM enum_value WHERE id = ?", valueId);
        log.info("Enum value '{}' deleted", valueId);
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void reorderValues(String enumId, List<String> valueIds) {
        for (int i = 0; i < valueIds.size(); i++) {
            dsl.execute(
                "UPDATE enum_value SET display_order = ? WHERE id = ? AND enum_definition_id = ?",
                i, valueIds.get(i), enumId);
        }
        log.info("Enum {} values reordered", enumId);
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    // ================================================================
    // Helpers
    // ================================================================

    private Map<String, Object> toEnumMap(Record r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.get("id", String.class));
        m.put("name", r.get("name", String.class));
        m.put("description", r.get("description", String.class));
        // Count values
        int count = dsl.fetchCount(
            dsl.selectOne().from("enum_value")
               .where("enum_definition_id = ?", r.get("id", String.class)));
        m.put("valueCount", count);
        return m;
    }
}
