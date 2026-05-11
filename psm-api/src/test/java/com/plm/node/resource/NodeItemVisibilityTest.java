package com.plm.node.resource;

import com.plm.platform.authz.PolicyPort;
import com.plm.platform.item.dto.CreateAction;
import com.plm.platform.item.dto.GetAction;
import com.plm.platform.item.dto.ItemDescriptor;
import com.plm.platform.item.dto.ItemVisibilityContext;
import com.plm.platform.item.dto.ListAction;
import com.plm.platform.item.dto.ListItemShape;
import com.plm.platform.item.dto.PanelSection;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Exercises the per-action permission split. Today's psm permissions
 * separate create from read: {@code CREATE_NODE} vs {@code READ_NODE}.
 * The resolver must emit asymmetric descriptors — creatable but not
 * listable, and vice versa — depending on the user's grants on that
 * node type.
 */
class NodeItemVisibilityTest {

    private final PolicyPort policy = mock(PolicyPort.class);
    private final NodeItemVisibility visibility = new NodeItemVisibility(policy);

    @AfterEach
    void clear() {
        com.plm.shared.security.PlmSecurityContext.clear();
        com.plm.shared.security.PlmProjectSpaceContext.clear();
    }

    private static ItemDescriptor nodeDescriptor(String nodeTypeId) {
        return new ItemDescriptor(
            "psm", "node", nodeTypeId,
            "Type " + nodeTypeId, null, null, null, "PLM",
            PanelSection.MAIN, 1000,
            new CreateAction("POST", "/actions/create_node/" + nodeTypeId,
                "application/json", "WRAPPED", List.of(), "Create", null, "PRIMARY", 0),
            new ListAction("GET", "/nodes?type=" + nodeTypeId, "page", "size",
                List.of("type"), new ListItemShape("id", "logical_id", "icon"), "Browse", null, "SECONDARY", 10),
            new GetAction("GET", "/nodes/{id}/description", "Open", null, "SECONDARY", 20),
            null,
            null
        );
    }

    private static ItemVisibilityContext ctx() {
        return new ItemVisibilityContext("user-alice", "ps-default",
            false, Set.of("role-designer"), Set.of());
    }

    @Test
    void creatableButNotReadable_keepsOnlyCreate() {
        when(policy.canOnNodeTypes(eq("CREATE_NODE"), any())).thenReturn(Map.of("nt-doc", true));
        when(policy.canOnNodeTypes(eq("READ_NODE"),   any())).thenReturn(Map.of("nt-doc", false));

        ItemDescriptor out = visibility.filter(ctx(), nodeDescriptor("nt-doc"));

        assertThat(out).isNotNull();
        assertThat(out.create()).isNotNull();
        assertThat(out.list()).isNull();
        assertThat(out.get()).isNull();
    }

    @Test
    void readableButNotCreatable_keepsListAndGet() {
        when(policy.canOnNodeTypes(eq("CREATE_NODE"), any())).thenReturn(Map.of("nt-doc", false));
        when(policy.canOnNodeTypes(eq("READ_NODE"),   any())).thenReturn(Map.of("nt-doc", true));

        ItemDescriptor out = visibility.filter(ctx(), nodeDescriptor("nt-doc"));

        assertThat(out).isNotNull();
        assertThat(out.create()).isNull();
        assertThat(out.list()).isNotNull();
        assertThat(out.get()).isNotNull();
    }

    @Test
    void neitherPermission_dropsDescriptor() {
        when(policy.canOnNodeTypes(eq("CREATE_NODE"), any())).thenReturn(Map.of("nt-doc", false));
        when(policy.canOnNodeTypes(eq("READ_NODE"),   any())).thenReturn(Map.of("nt-doc", false));

        ItemDescriptor out = visibility.filter(ctx(), nodeDescriptor("nt-doc"));

        assertThat(out).isNull();
    }

    @Test
    void bothPermissions_keepsAllActions() {
        when(policy.canOnNodeTypes(eq("CREATE_NODE"), any())).thenReturn(Map.of("nt-doc", true));
        when(policy.canOnNodeTypes(eq("READ_NODE"),   any())).thenReturn(Map.of("nt-doc", true));

        ItemDescriptor out = visibility.filter(ctx(), nodeDescriptor("nt-doc"));

        assertThat(out).isNotNull();
        assertThat(out.create()).isNotNull();
        assertThat(out.list()).isNotNull();
        assertThat(out.get()).isNotNull();
    }

    @Test
    void admin_passthroughsUnfiltered() {
        ItemVisibilityContext admin = new ItemVisibilityContext(
            "user-admin", null, true, Set.of(), Set.of());
        ItemDescriptor in = nodeDescriptor("nt-doc");

        ItemDescriptor out = visibility.filter(admin, in);

        assertThat(out).isSameAs(in);
    }

    @Test
    void nonPsmNodeDescriptor_passesThroughUntouched() {
        ItemDescriptor dst = new ItemDescriptor(
            "dst", "data-object", null,
            "Data file", null, null, null, "DATA",
            PanelSection.MAIN, 500,
            new CreateAction("POST", "/data", "multipart/form-data", "MULTIPART", List.of(), "Upload", null, "PRIMARY", 0),
            new ListAction("GET", "/data", "page", "size", List.of(), null, "Browse", null, "SECONDARY", 10),
            new GetAction("GET", "/data/{id}/detail", "Open", null, "SECONDARY", 20),
            null,
            null
        );

        ItemDescriptor out = visibility.filter(ctx(), dst);

        assertThat(out).isSameAs(dst);
    }
}
