package com.plm.admin.domain;

import com.plm.admin.config.ConfigChangedEvent;
import com.plm.admin.lifecycle.LifecycleService;
import com.plm.admin.metamodel.AttributeValidatorAdminService;
import com.plm.admin.metamodel.MetaModelService;
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

import static com.plm.admin.metamodel.MetaModelService.toInt;
import static com.plm.admin.metamodel.MetaModelService.toIntFlag;

@Slf4j
@Service
@RequiredArgsConstructor
public class DomainService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;
    private final AttributeValidatorAdminService validatorAdminService;
    private final MetaModelService metaModelService;

    @Transactional
    public String createDomain(String code, String name, String description, String color, String icon) {
        LifecycleService.validateCode(code);
        dsl.execute("INSERT INTO domain (id, name, description, color, icon, created_at) VALUES (?,?,?,?,?,?)",
            code, name, description, color, icon, LocalDateTime.now());
        publishChange("CREATE", "DOMAIN", code);
        return code;
    }

    @Transactional
    public void updateDomain(String domainId, String name, String description, String color, String icon) {
        int updated = dsl.execute("UPDATE domain SET name=?, description=?, color=?, icon=? WHERE id=?",
            name, description, color, icon, domainId);
        if (updated == 0) throw new IllegalArgumentException("Domain not found: " + domainId);
        publishChange("UPDATE", "DOMAIN", domainId);
    }

    @Transactional
    public void deleteDomain(String domainId) {
        dsl.execute("DELETE FROM attribute_validation_rule WHERE attribute_definition_id IN (SELECT id FROM attribute_definition WHERE domain_id = ?)", domainId);
        dsl.execute("DELETE FROM attribute_metadata WHERE attribute_definition_id IN (SELECT id FROM attribute_definition WHERE domain_id = ?)", domainId);
        dsl.execute("DELETE FROM view_attribute_override WHERE attribute_def_id IN (SELECT id FROM attribute_definition WHERE domain_id = ?)", domainId);
        dsl.execute("DELETE FROM attribute_definition WHERE domain_id = ?", domainId);
        dsl.execute("DELETE FROM domain WHERE id = ?", domainId);
        publishChange("DELETE", "DOMAIN", domainId);
    }

    public List<Map<String, Object>> getAllDomains() {
        return dsl.select().from("domain").orderBy(DSL.field("name")).fetch()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.get("id", String.class));
                m.put("name", r.get("name", String.class));
                m.put("description", r.get("description", String.class));
                m.put("color", r.get("color", String.class));
                m.put("icon", r.get("icon", String.class));
                return m;
            });
    }

    public Map<String, Object> getDomain(String domainId) {
        Record r = dsl.select().from("domain").where("id = ?", domainId).fetchOne();
        if (r == null) throw new IllegalArgumentException("Domain not found: " + domainId);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.get("id", String.class));
        m.put("name", r.get("name", String.class));
        m.put("description", r.get("description", String.class));
        m.put("color", r.get("color", String.class));
        m.put("icon", r.get("icon", String.class));
        return m;
    }

    public List<Map<String, Object>> getDomainAttributes(String domainId) {
        return dsl.select().from("attribute_definition")
            .where("domain_id = ?", domainId)
            .orderBy(DSL.field("display_order"))
            .fetch().map(r -> {
                Map<String, Object> m = r.intoMap();
                metaModelService.enrichAttributeMap(m);
                return m;
            });
    }

    @Transactional
    public String createDomainAttribute(String domainId, Map<String, Object> params) {
        String code = (String) params.get("code");
        LifecycleService.validateCode(code);
        dsl.execute("""
            INSERT INTO attribute_definition
              (id, node_type_id, domain_id, name, label, data_type, default_value,
               widget_type, display_order, display_section, tooltip, as_name,
               enum_definition_id, created_at)
            VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
            """,
            code, domainId, params.get("name"), params.get("label"),
            params.getOrDefault("dataType", "STRING"),
            params.get("defaultValue"), params.getOrDefault("widgetType", "TEXT"),
            toInt(params.get("displayOrder"), 0), params.get("displaySection"),
            params.get("tooltip"), params.get("enumDefinitionId"), LocalDateTime.now()
        );
        // required / regex are pluggable validation rules (domain attrs use wildcard node type).
        validatorAdminService.setRequiredGlobal(code, toIntFlag(params.get("required")) == 1);
        validatorAdminService.setRegex(code, (String) params.get("namingRegex"));
        publishChange("CREATE", "DOMAIN_ATTRIBUTE", code);
        return code;
    }

    @Transactional
    public void updateDomainAttribute(String domainId, String attrId, Map<String, Object> params) {
        dsl.execute("""
            UPDATE attribute_definition SET name=?, label=?, data_type=?, default_value=?,
                widget_type=?, display_order=?, display_section=?, tooltip=?,
                enum_definition_id=?
            WHERE id=? AND domain_id=?
            """,
            params.get("name"), params.get("label"), params.getOrDefault("dataType", "STRING"),
            params.get("defaultValue"),
            params.getOrDefault("widgetType", "TEXT"), toInt(params.get("displayOrder"), 0),
            params.get("displaySection"), params.get("tooltip"),
            params.get("enumDefinitionId"), attrId, domainId
        );
        if (params.containsKey("required")) {
            validatorAdminService.setRequiredGlobal(attrId, toIntFlag(params.get("required")) == 1);
        }
        if (params.containsKey("namingRegex")) {
            validatorAdminService.setRegex(attrId, (String) params.get("namingRegex"));
        }
        publishChange("UPDATE", "DOMAIN_ATTRIBUTE", attrId);
    }

    @Transactional
    public void deleteDomainAttribute(String domainId, String attrId) {
        validatorAdminService.deleteAllForAttribute(attrId);
        dsl.execute("DELETE FROM view_attribute_override WHERE attribute_def_id = ?", attrId);
        dsl.execute("DELETE FROM attribute_definition WHERE id = ? AND domain_id = ?", attrId, domainId);
        publishChange("DELETE", "DOMAIN_ATTRIBUTE", attrId);
    }

    private void publishChange(String changeType, String entityType, String entityId) {
        eventPublisher.publishEvent(new ConfigChangedEvent(changeType, entityType, entityId));
    }
}
