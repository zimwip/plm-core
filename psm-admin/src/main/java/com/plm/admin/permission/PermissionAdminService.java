package com.plm.admin.permission;

import com.plm.admin.config.ConfigChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin CRUD for attribute views. Permission management moved to platform-api.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionAdminService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public String createView(String nodeTypeId, String name, String description,
                              String eligibleRoleId, String eligibleStateId, int priority) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO attribute_view (id, node_type_id, name, description, eligible_role_id, eligible_state_id, priority) VALUES (?,?,?,?,?,?,?)",
            id, nodeTypeId, name, description, eligibleRoleId, eligibleStateId, priority);
        eventPublisher.publishEvent(new ConfigChangedEvent("CREATE", "ATTRIBUTE_VIEW", id));
        return id;
    }

    @Transactional
    public void setViewOverride(String viewId, String attrId,
                                 Boolean visible, Boolean editable,
                                 Integer displayOrder, String displaySection) {
        dsl.execute("DELETE FROM view_attribute_override WHERE view_id = ? AND attribute_def_id = ?", viewId, attrId);
        dsl.execute(
            "INSERT INTO view_attribute_override (id, view_id, attribute_def_id, visible, editable, display_order, display_section) VALUES (?,?,?,?,?,?,?)",
            UUID.randomUUID().toString(), viewId, attrId,
            visible != null ? (visible ? 1 : 0) : null,
            editable != null ? (editable ? 1 : 0) : null,
            displayOrder, displaySection);
        eventPublisher.publishEvent(new ConfigChangedEvent("UPDATE", "VIEW_ATTRIBUTE_OVERRIDE", viewId));
    }
}
