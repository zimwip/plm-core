package com.plm.admin.permission;

import com.plm.admin.config.ConfigChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin CRUD for permissions, authorization policies, and attribute views.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionAdminService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;

    public List<Map<String, Object>> listPermissions() {
        return dsl.select().from("permission").orderBy(DSL.field("display_order")).fetch().intoMaps();
    }

    @Transactional
    public void createPermission(String permissionCode, String scope, String displayName,
                                  String description, int displayOrder) {
        dsl.execute(
            "INSERT INTO permission (permission_code, scope, display_name, description, display_order) VALUES (?,?,?,?,?)",
            permissionCode, scope, displayName, description, displayOrder);
        publishChange("CREATE", "PERMISSION", permissionCode);
    }

    @Transactional
    public void updatePermission(String permissionCode, String displayName, String description, Integer displayOrder) {
        if (displayOrder != null) {
            dsl.execute("UPDATE permission SET display_name=?, description=?, display_order=? WHERE permission_code=?",
                displayName, description, displayOrder, permissionCode);
        } else {
            dsl.execute("UPDATE permission SET display_name=?, description=? WHERE permission_code=?",
                displayName, description, permissionCode);
        }
        publishChange("UPDATE", "PERMISSION", permissionCode);
    }

    // authorization_policy grants moved to pno-api in Phase D4.

    @Transactional
    public String createView(String nodeTypeId, String name, String description,
                              String eligibleRoleId, String eligibleStateId, int priority) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO attribute_view (id, node_type_id, name, description, eligible_role_id, eligible_state_id, priority) VALUES (?,?,?,?,?,?,?)",
            id, nodeTypeId, name, description, eligibleRoleId, eligibleStateId, priority);
        publishChange("CREATE", "ATTRIBUTE_VIEW", id);
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
        publishChange("UPDATE", "VIEW_ATTRIBUTE_OVERRIDE", viewId);
    }

    private void publishChange(String changeType, String entityType, String entityId) {
        eventPublisher.publishEvent(new ConfigChangedEvent(changeType, entityType, entityId));
    }
}
