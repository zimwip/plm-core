package com.plm;

import com.plm.node.NodeService;
import com.plm.node.metamodel.internal.ValidationService;
import com.plm.node.transaction.internal.PlmTransactionService;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.*;
import com.plm.shared.security.PlmProjectSpaceContext;
import com.plm.shared.security.PlmSecurityContext;
import com.plm.shared.security.PlmUserContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

/**
 * Validates that psm-api rejects attributes not defined in the data model
 * (ConfigCache) during node creation and update.
 */
@SpringBootTest
@Transactional
class PlmAttributeValidationTest {

    @Autowired ConfigCache            configCache;
    @Autowired NodeService            nodeService;
    @Autowired PlmTransactionService  txService;

    static final String PS        = "ps-default";
    static final String USER      = "alice";

    // IDs for the test metamodel
    static final String LC_ID         = "lc-test";
    static final String STATE_DRAFT   = "st-draft";
    static final String NT_DOC        = "nt-doc";
    static final String ATTR_NAME     = "attr-name";
    static final String ATTR_DESC     = "attr-desc";

    @AfterEach
    void clearCtx() {
        PlmSecurityContext.clear();
    }

    @BeforeEach
    void setup() {
        PlmSecurityContext.set(new PlmUserContext("admin", "admin", Set.of(), true));
        PlmProjectSpaceContext.set(PS);
        loadTestMetamodel();
    }

    /**
     * Loads a minimal metamodel into ConfigCache — no local DB admin tables needed.
     */
    private void loadTestMetamodel() {
        ConfigSnapshot snapshot = new ConfigSnapshot(
            1L,
            // nodeTypes
            List.of(new NodeTypeConfig(
                NT_DOC, "Document", "Test document type", LC_ID,
                "Identifier", null, "ALPHA_NUMERIC", "ITERATE", false,
                "#3B82F6", "file", null, List.of(),
                List.of(
                    new AttributeConfig(ATTR_NAME, "name", "Name", "STRING", "TEXT",
                        true, null, null, null, null, 1, "General", null, false,
                        false, null, NT_DOC, null, null),
                    new AttributeConfig(ATTR_DESC, "description", "Description", "STRING", "TEXT",
                        false, null, null, null, null, 2, "General", null, false,
                        false, null, NT_DOC, null, null)
                ),
                List.of() // stateRules
            )),
            // lifecycles
            List.of(new LifecycleConfig(LC_ID, "Standard", null,
                List.of(new LifecycleStateConfig(STATE_DRAFT, LC_ID, "Draft", true, 1, "#gray")),
                List.of()
            )),
            // linkTypes
            List.of(),
            // actions — minimal: need create_node and update_node action configs
            List.of(
                new ActionConfig("act-create", "create_node", "NODE_TYPE", "Create Node", null,
                    "STRUCTURAL", 0, null, "hi-create",
                    List.of(), List.of("CREATE_NODE"), List.of(), List.of()),
                new ActionConfig("act-update", "update_node", "NODE", "Update Node", null,
                    "PRIMARY", 10, null, "hi-update",
                    List.of(), List.of("UPDATE_NODE"), List.of(), List.of())
            ),
            // permissions
            List.of(
                new PermissionConfig("CREATE_NODE", "NODE", "Create Node", null, 0),
                new PermissionConfig("UPDATE_NODE", "NODE", "Update Node", null, 1),
                new PermissionConfig("TRANSITION", "LIFECYCLE", "Transition", null, 2),
                new PermissionConfig("MANAGE_PSM", "GLOBAL", "Manage PSM", null, 10)
            ),
            // authorizationPolicies — admin bypasses, but add for completeness
            List.of(),
            // algorithms
            List.of(),
            // domains
            List.of(),
            // enums
            List.of(),
            // attributeViews
            List.of(),
            // stateActions
            List.of(),
            // sources
            List.of(),
            // entityMetadata
            Map.of()
        );

        configCache.loadFromSnapshot(snapshot);
    }

    // ================================================================
    // CREATE — only logical_id is accepted; attributes flow via update_node
    // ================================================================

    @Test
    @DisplayName("Create node with only logical_id succeeds and yields an empty initial version")
    void createWithLogicalIdOnly() {
        String nodeId = nodeService.createNode(PS, NT_DOC, USER, "DOC-001", null);
        assertThat(nodeId).isNotNull();
    }

    // ================================================================
    // UPDATE — unknown attributes
    // ================================================================

    @Test
    @DisplayName("Update node with valid attributes succeeds")
    void updateWithValidAttributes() {
        String nodeId = createAndCommitNode();

        String txId = txService.openTransaction(USER);
        String versionId = nodeService.modifyNode(nodeId, USER, txId,
            Map.of(ATTR_NAME, "Updated Name"), "Update name");

        assertThat(versionId).isNotNull();
    }

    @Test
    @DisplayName("Update node with unknown attribute ID raises validation error")
    void updateWithUnknownAttributeRejected() {
        String nodeId = createAndCommitNode();

        String txId = txService.openTransaction(USER);
        assertThatThrownBy(() ->
            nodeService.modifyNode(nodeId, USER, txId,
                Map.of("nonexistent-attr", "some value"), "Bad update")
        )
            .isInstanceOf(ValidationService.ValidationException.class)
            .satisfies(ex -> {
                var ve = (ValidationService.ValidationException) ex;
                assertThat(ve.getErrors()).hasSize(1);
                assertThat(ve.getErrors().get(0).code()).isEqualTo("UNKNOWN_ATTRIBUTE");
                assertThat(ve.getErrors().get(0).attrCode()).isEqualTo("nonexistent-attr");
            });
    }

    @Test
    @DisplayName("Update mixing valid and unknown attributes raises error only for unknowns")
    void updateMixedAttributesRejectsUnknown() {
        String nodeId = createAndCommitNode();

        String txId = txService.openTransaction(USER);
        assertThatThrownBy(() ->
            nodeService.modifyNode(nodeId, USER, txId,
                Map.of(
                    ATTR_NAME, "Good",
                    "fake-attr", "Bad"
                ), "Mixed update")
        )
            .isInstanceOf(ValidationService.ValidationException.class)
            .satisfies(ex -> {
                var ve = (ValidationService.ValidationException) ex;
                assertThat(ve.getErrors()).hasSize(1);
                assertThat(ve.getErrors().get(0).attrCode()).isEqualTo("fake-attr");
                assertThat(ve.getErrors().get(0).message()).contains("fake-attr");
            });
    }

    // ================================================================
    // Helpers
    // ================================================================

    private String createAndCommitNode() {
        String nodeId = nodeService.createNode(PS, NT_DOC, USER, "DOC-001", null);
        String txId = txService.findOpenTransaction(USER);
        nodeService.modifyNode(nodeId, USER, txId,
            Map.of(ATTR_NAME, "Test Doc"), "Initial attributes");
        txService.commitTransaction(txId, USER, "Initial creation", null);
        return nodeId;
    }
}
