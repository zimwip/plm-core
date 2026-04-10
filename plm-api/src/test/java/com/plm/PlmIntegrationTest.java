package com.plm;

import com.plm.domain.model.Enums.ChangeType;
import com.plm.domain.service.*;
import org.jooq.DSLContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
class PlmIntegrationTest {

    @Autowired DSLContext     dsl;
    @Autowired NodeService    nodeService;
    @Autowired LockService    lockService;
    @Autowired VersionService versionService;
    @Autowired LifecycleService lifecycleService;

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

    @BeforeEach
    void setupMetaModel() {
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
        dsl.execute("INSERT INTO LIFECYCLE_TRANSITION (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID) VALUES (?,?,?,?,?)",
            transitionToReleasedId, lifecycleId, "Release", stateInReviewId, stateReleasedId);

        // -- NodeType
        nodeTypeId = uid();
        dsl.execute("INSERT INTO NODE_TYPE (ID, NAME, LIFECYCLE_ID) VALUES (?,?,?)", nodeTypeId, "Document", lifecycleId);

        // -- Attributs
        attrNameId = uid();
        attrDescId = uid();
        dsl.execute("INSERT INTO ATTRIBUTE_DEFINITION (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DISPLAY_ORDER, DISPLAY_SECTION, WIDGET_TYPE) VALUES (?,?,?,?,?,1,1,'General','TEXT')",
            attrNameId, nodeTypeId, "name", "Name");
        dsl.execute("INSERT INTO ATTRIBUTE_DEFINITION (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DISPLAY_ORDER, DISPLAY_SECTION, WIDGET_TYPE) VALUES (?,?,?,?,?,0,2,'General','TEXT')",
            attrDescId, nodeTypeId, "description", "Description");

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
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Mon Document"));

        var version = versionService.getCurrentVersion(nodeId);
        assertThat(version).isNotNull();
        assertThat(version.get("REVISION", String.class)).isEqualTo("A");
        assertThat(version.get("ITERATION", Integer.class)).isEqualTo(1);
        assertThat(version.get("LIFECYCLE_STATE_ID", String.class)).isEqualTo(stateDraftId);
        assertThat(version.get("CHANGE_TYPE", String.class)).isEqualTo("CONTENT");
    }

    @Test
    @DisplayName("Modification de contenu → incrémente l'itération A.1 → A.2")
    void testContentModification() {
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Doc v1"));

        nodeService.modifyNode(nodeId, "alice", Map.of(attrNameId, "Doc v2"), "Update name");

        var version = versionService.getCurrentVersion(nodeId);
        assertThat(version.get("REVISION", String.class)).isEqualTo("A");
        assertThat(version.get("ITERATION", Integer.class)).isEqualTo(2);
        assertThat(version.get("CHANGE_TYPE", String.class)).isEqualTo("CONTENT");
    }

    @Test
    @DisplayName("Changement de lifecycle → même révision.itération, nouvelle version technique")
    void testLifecycleChangePreservesIteration() {
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Doc"));

        lifecycleService.applyTransition(nodeId, transitionToReviewId, "alice");

        var version = versionService.getCurrentVersion(nodeId);
        // Itération toujours à 1, révision toujours A
        assertThat(version.get("REVISION", String.class)).isEqualTo("A");
        assertThat(version.get("ITERATION", Integer.class)).isEqualTo(1);
        assertThat(version.get("CHANGE_TYPE", String.class)).isEqualTo("LIFECYCLE");
        assertThat(version.get("LIFECYCLE_STATE_ID", String.class)).isEqualTo(stateInReviewId);
    }

    @Test
    @DisplayName("Passage Released → nouvelle révision B, itération 1")
    void testReleaseIncrementsRevision() {
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Doc"));
        lifecycleService.applyTransition(nodeId, transitionToReviewId, "alice");
        lifecycleService.applyTransition(nodeId, transitionToReleasedId, "alice");

        var version = versionService.getCurrentVersion(nodeId);
        assertThat(version.get("REVISION", String.class)).isEqualTo("B");
        assertThat(version.get("ITERATION", Integer.class)).isEqualTo(1);
    }

    @Test
    @DisplayName("Audit trail : plusieurs versions avec même révision.itération pour les changements lifecycle")
    void testAuditTrail() {
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Doc"));
        lifecycleService.applyTransition(nodeId, transitionToReviewId, "alice");

        int versionCount = dsl.fetchCount(
            dsl.selectOne().from("NODE_VERSION").where("NODE_ID = ?", nodeId)
        );

        // 2 versions techniques : création + lifecycle
        assertThat(versionCount).isEqualTo(2);

        // Les 2 ont la même révision.itération
        var versions = dsl.select().from("NODE_VERSION")
            .where("NODE_ID = ?", nodeId)
            .orderBy(dsl.field("VERSION_NUMBER"))
            .fetch();

        assertThat(versions.get(0).get("REVISION", String.class)).isEqualTo("A");
        assertThat(versions.get(0).get("ITERATION", Integer.class)).isEqualTo(1);
        assertThat(versions.get(1).get("REVISION", String.class)).isEqualTo("A");
        assertThat(versions.get(1).get("ITERATION", Integer.class)).isEqualTo(1);
    }

    @Test
    @DisplayName("Lock exclusif : fail-fast si noeud déjà locké")
    void testLockConflict() {
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Doc"));

        // Alice prend le lock
        lockService.checkin(nodeId, "alice", uid());

        // Bob essaie → conflit
        assertThatThrownBy(() -> lockService.checkin(nodeId, "bob", uid()))
            .isInstanceOf(LockService.LockConflictException.class)
            .hasMessageContaining("alice");
    }

    @Test
    @DisplayName("Server-Driven UI : payload contient attributs et actions disponibles")
    void testObjectDescription() {
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Doc"));

        var desc = nodeService.buildObjectDescription(nodeId, "alice", "USER");

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
