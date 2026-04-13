package com.plm;

import com.plm.domain.service.*;
import com.plm.infrastructure.security.PlmSecurityContext;
import com.plm.infrastructure.security.PlmUserContext;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
class PlmIntegrationTest {

    @Autowired DSLContext              dsl;
    @Autowired NodeService             nodeService;
    @Autowired LockService             lockService;
    @Autowired VersionService          versionService;
    @Autowired LifecycleService        lifecycleService;
    @Autowired PlmTransactionService   txService;

    static final String PS_DEFAULT = "ps-default";
    static final String ALICE       = "alice";
    static final String BOB         = "bob";

    // IDs créés dans setupMetaModel()
    String lifecycleId;
    String stateDraftId;
    String stateInReviewId;
    String stateReleasedId;
    String stateFrozenId;
    String transitionToReviewId;
    String transitionToReleasedId;
    String nodeTypeId;
    String attrNameId;
    String attrDescId;

    @AfterEach
    void clearCtx() { PlmSecurityContext.clear(); }

    // Admin bypasses all role-based permission checks (no node_type_permission in test meta-model)
    private void asAdmin() {
        PlmSecurityContext.set(new PlmUserContext("admin", "admin", Set.of(), true));
    }

    @BeforeEach
    void setupMetaModel() {
        asAdmin();

        // -- Lifecycle
        lifecycleId      = uid();
        stateDraftId     = uid();
        stateInReviewId  = uid();
        stateReleasedId  = uid();
        stateFrozenId    = uid();
        transitionToReviewId   = uid();
        transitionToReleasedId = uid();

        dsl.execute("INSERT INTO LIFECYCLE (ID, NAME) VALUES (?, ?)", lifecycleId, "Standard");

        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER) VALUES (?,?,?,1,0,0,1)", stateDraftId,    lifecycleId, "Draft");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER) VALUES (?,?,?,0,0,0,2)", stateInReviewId, lifecycleId, "InReview");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER) VALUES (?,?,?,0,0,1,3)", stateReleasedId, lifecycleId, "Released");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER) VALUES (?,?,?,0,1,0,4)", stateFrozenId,   lifecycleId, "Frozen");

        dsl.execute("INSERT INTO LIFECYCLE_TRANSITION (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, GUARD_EXPR) VALUES (?,?,?,?,?,?)",
            transitionToReviewId, lifecycleId, "Submit for Review", stateDraftId, stateInReviewId, "all_required_filled");
        dsl.execute("INSERT INTO LIFECYCLE_TRANSITION (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, VERSION_STRATEGY) VALUES (?,?,?,?,?,?)",
            transitionToReleasedId, lifecycleId, "Release", stateInReviewId, stateReleasedId, "REVISE");

        // -- NodeType
        nodeTypeId = uid();
        dsl.execute("INSERT INTO NODE_TYPE (ID, NAME, LIFECYCLE_ID) VALUES (?,?,?)", nodeTypeId, "Document", lifecycleId);

        // -- Action registry: register TRANSITION actions for the test node type
        // (normally auto-created by MetaModelService.createNodeType, but test uses raw SQL)
        dsl.execute("INSERT INTO node_type_action (id, node_type_id, action_id, status, transition_id, display_order) VALUES (?,?,?,?,?,?)",
            "nta-tr-" + transitionToReviewId + "-" + nodeTypeId, nodeTypeId, "act-transition", "ENABLED", transitionToReviewId, 0);
        dsl.execute("INSERT INTO node_type_action (id, node_type_id, action_id, status, transition_id, display_order) VALUES (?,?,?,?,?,?)",
            "nta-tr-" + transitionToReleasedId + "-" + nodeTypeId, nodeTypeId, "act-transition", "ENABLED", transitionToReleasedId, 0);
        // Register default-on built-in actions (CHECKOUT, SIGN, CREATE_LINK, BASELINE)
        dsl.execute("INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order) VALUES (?,?,?,?,?)",
            "nta-co-" + nodeTypeId, nodeTypeId, "act-checkout", "ENABLED", 100);
        dsl.execute("INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order) VALUES (?,?,?,?,?)",
            "nta-sg-" + nodeTypeId, nodeTypeId, "act-sign", "ENABLED", 200);

        // -- Attributs
        attrNameId = uid();
        attrDescId = uid();
        dsl.execute("INSERT INTO ATTRIBUTE_DEFINITION (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DISPLAY_ORDER, DISPLAY_SECTION, WIDGET_TYPE) VALUES (?,?,?,?,?,1,1,'General','TEXT')",
            attrNameId, nodeTypeId, "name", "Name", "STRING");
        dsl.execute("INSERT INTO ATTRIBUTE_DEFINITION (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DISPLAY_ORDER, DISPLAY_SECTION, WIDGET_TYPE) VALUES (?,?,?,?,?,0,2,'General','TEXT')",
            attrDescId, nodeTypeId, "description", "Description", "STRING");

        // -- Règle : name required pour InReview, non éditable en Released
        String ruleId1 = uid();
        String ruleId2 = uid();
        dsl.execute("INSERT INTO ATTRIBUTE_STATE_RULE (ID, ATTRIBUTE_DEFINITION_ID, LIFECYCLE_STATE_ID, REQUIRED, EDITABLE) VALUES (?,?,?,1,1)",
            ruleId1, attrNameId, stateInReviewId);
        dsl.execute("INSERT INTO ATTRIBUTE_STATE_RULE (ID, ATTRIBUTE_DEFINITION_ID, LIFECYCLE_STATE_ID, REQUIRED, EDITABLE) VALUES (?,?,?,0,0)",
            ruleId2, attrNameId, stateReleasedId);
    }

    @Test
    @DisplayName("Création d'un noeud → état initial = Draft, révision A, itération 1")
    void testNodeCreation() {
        String nodeId = nodeService.createNode(PS_DEFAULT, nodeTypeId, ALICE, Map.of(attrNameId, "Mon Document"));

        var version = versionService.getCurrentVersion(nodeId);
        assertThat(version).isNotNull();
        assertThat(version.get("revision", String.class)).isEqualTo("A");
        assertThat(version.get("iteration", Integer.class)).isEqualTo(1);
        assertThat(version.get("lifecycle_state_id", String.class)).isEqualTo(stateDraftId);
        assertThat(version.get("change_type", String.class)).isEqualTo("CONTENT");
    }

    @Test
    @DisplayName("Modification de contenu → incrémente l'itération A.1 → A.2")
    void testContentModification() {
        String nodeId = nodeService.createNode(PS_DEFAULT, nodeTypeId, ALICE, Map.of(attrNameId, "Doc v1"));

        String txId = txService.openTransaction(ALICE);
        nodeService.modifyNode(nodeId, ALICE, txId, Map.of(attrNameId, "Doc v2"), "Update name");
        txService.commitTransaction(txId, ALICE, "Content update done");

        var version = versionService.getCurrentVersion(nodeId);
        assertThat(version.get("revision", String.class)).isEqualTo("A");
        assertThat(version.get("iteration", Integer.class)).isEqualTo(2);
        assertThat(version.get("change_type", String.class)).isEqualTo("CONTENT");
    }

    @Test
    @DisplayName("Changement de lifecycle → même révision.itération, nouvelle version technique")
    void testLifecycleChangePreservesIteration() {
        String nodeId = nodeService.createNode(PS_DEFAULT, nodeTypeId, ALICE, Map.of(attrNameId, "Doc"));

        String txId = txService.openTransaction(ALICE);
        lifecycleService.applyTransition(nodeId, transitionToReviewId, ALICE, txId);
        txService.commitTransaction(txId, ALICE, "Submitted for review");

        var version = versionService.getCurrentVersion(nodeId);
        // Itération toujours à 1, révision toujours A
        assertThat(version.get("revision", String.class)).isEqualTo("A");
        assertThat(version.get("iteration", Integer.class)).isEqualTo(1);
        assertThat(version.get("change_type", String.class)).isEqualTo("LIFECYCLE");
        assertThat(version.get("lifecycle_state_id", String.class)).isEqualTo(stateInReviewId);
    }

    @Test
    @DisplayName("Passage Released → nouvelle révision B, itération 1")
    void testReleaseIncrementsRevision() {
        String nodeId = nodeService.createNode(PS_DEFAULT, nodeTypeId, ALICE, Map.of(attrNameId, "Doc"));

        String tx1 = txService.openTransaction(ALICE);
        lifecycleService.applyTransition(nodeId, transitionToReviewId, ALICE, tx1);
        txService.commitTransaction(tx1, ALICE, "Submitted");

        String tx2 = txService.openTransaction(ALICE);
        lifecycleService.applyTransition(nodeId, transitionToReleasedId, ALICE, tx2);
        txService.commitTransaction(tx2, ALICE, "Released");

        var version = versionService.getCurrentVersion(nodeId);
        assertThat(version.get("revision", String.class)).isEqualTo("B");
        assertThat(version.get("iteration", Integer.class)).isEqualTo(1);
    }

    @Test
    @DisplayName("Audit trail : plusieurs versions avec même révision.itération pour les changements lifecycle")
    void testAuditTrail() {
        String nodeId = nodeService.createNode(PS_DEFAULT, nodeTypeId, ALICE, Map.of(attrNameId, "Doc"));

        String txId = txService.openTransaction(ALICE);
        lifecycleService.applyTransition(nodeId, transitionToReviewId, ALICE, txId);
        txService.commitTransaction(txId, ALICE, "Submitted");

        int versionCount = dsl.fetchCount(
            dsl.selectOne().from("NODE_VERSION").where("NODE_ID = ?", nodeId)
        );

        // 2 versions techniques : création + lifecycle
        assertThat(versionCount).isEqualTo(2);

        // Les 2 ont la même révision.itération
        var versions = dsl.select().from("NODE_VERSION")
            .where("NODE_ID = ?", nodeId)
            .orderBy(DSL.field("VERSION_NUMBER"))
            .fetch();

        assertThat(versions.get(0).get("revision", String.class)).isEqualTo("A");
        assertThat(versions.get(0).get("iteration", Integer.class)).isEqualTo(1);
        assertThat(versions.get(1).get("revision", String.class)).isEqualTo("A");
        assertThat(versions.get(1).get("iteration", Integer.class)).isEqualTo(1);
    }

    @Test
    @DisplayName("Lock exclusif : fail-fast si noeud déjà locké par une autre transaction")
    void testLockConflict() {
        String nodeId = nodeService.createNode(PS_DEFAULT, nodeTypeId, ALICE, Map.of(attrNameId, "Doc"));

        // Alice checkout le noeud : acquiert le lock et crée une version OPEN
        String aliceTxId = txService.openTransaction(ALICE);
        nodeService.checkout(nodeId, ALICE, aliceTxId);

        // Bob ouvre une tx et essaie de prendre le même lock → conflit
        String bobTxId = txService.openTransaction(BOB);
        assertThatThrownBy(() -> nodeService.checkout(nodeId, BOB, bobTxId))
            .isInstanceOf(LockService.LockConflictException.class)
            .hasMessageContaining(ALICE);
    }

    @Test
    @DisplayName("Server-Driven UI : payload contient attributs et actions disponibles")
    void testObjectDescription() {
        String nodeId = nodeService.createNode(PS_DEFAULT, nodeTypeId, ALICE, Map.of(attrNameId, "Doc"));

        var desc = nodeService.buildObjectDescription(nodeId, ALICE, null);

        assertThat(desc).containsKey("attributes");
        assertThat(desc).containsKey("actions");
        assertThat(desc.get("identity")).isEqualTo("A.1");

        @SuppressWarnings("unchecked")
        var actions = (java.util.List<?>) desc.get("actions");
        assertThat(actions).isNotEmpty(); // transition Draft → InReview disponible
    }

    // -------------------------------------------------------

    private String uid() { return UUID.randomUUID().toString(); }
}
