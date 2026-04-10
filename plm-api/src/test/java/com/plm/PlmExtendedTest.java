package com.plm;

import com.plm.domain.service.*;
import org.jooq.DSLContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
class PlmExtendedTest {

    @Autowired DSLContext        dsl;
    @Autowired NodeService       nodeService;
    @Autowired LockService       lockService;
    @Autowired VersionService    versionService;
    @Autowired LifecycleService  lifecycleService;
    @Autowired SignatureService  signatureService;
    @Autowired BaselineService   baselineService;
    @Autowired MetaModelService  metaModelService;

    // IDs partagés
    String lifecycleId, stateDraftId, stateInReviewId, stateReleasedId, stateFrozenId;
    String transitionToReviewId, transitionToReleasedId, transitionToFrozenId;
    String nodeTypeId, attrNameId;
    String linkTypeId;

    @BeforeEach
    void setup() {
        lifecycleId     = uid();
        stateDraftId    = uid();
        stateInReviewId = uid();
        stateReleasedId = uid();
        stateFrozenId   = uid();

        dsl.execute("INSERT INTO LIFECYCLE (ID, NAME) VALUES (?,?)", lifecycleId, "Standard");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER) VALUES (?,?,?,1,0,0,1)", stateDraftId, lifecycleId, "Draft");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER) VALUES (?,?,?,0,0,0,2)", stateInReviewId, lifecycleId, "InReview");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER) VALUES (?,?,?,0,0,1,3)", stateReleasedId, lifecycleId, "Released");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER) VALUES (?,?,?,0,1,0,4)", stateFrozenId, lifecycleId, "Frozen");

        transitionToReviewId   = uid();
        transitionToReleasedId = uid();
        transitionToFrozenId   = uid();

        dsl.execute("INSERT INTO LIFECYCLE_TRANSITION (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID) VALUES (?,?,?,?,?)", transitionToReviewId, lifecycleId, "To Review", stateDraftId, stateInReviewId);
        dsl.execute("INSERT INTO LIFECYCLE_TRANSITION (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID) VALUES (?,?,?,?,?)", transitionToReleasedId, lifecycleId, "Release", stateInReviewId, stateReleasedId);
        dsl.execute("INSERT INTO LIFECYCLE_TRANSITION (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, ACTION_TYPE) VALUES (?,?,?,?,?,?)", transitionToFrozenId, lifecycleId, "Freeze", stateDraftId, stateFrozenId, "CASCADE_FROZEN");

        nodeTypeId = uid();
        dsl.execute("INSERT INTO NODE_TYPE (ID, NAME, LIFECYCLE_ID) VALUES (?,?,?)", nodeTypeId, "Part", lifecycleId);

        attrNameId = uid();
        dsl.execute("INSERT INTO ATTRIBUTE_DEFINITION (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DISPLAY_ORDER, DISPLAY_SECTION, WIDGET_TYPE) VALUES (?,?,?,?,?,0,1,'General','TEXT')",
            attrNameId, nodeTypeId, "name", "Name");

        linkTypeId = uid();
        dsl.execute("INSERT INTO LINK_TYPE (ID, NAME, LINK_POLICY, MIN_CARDINALITY, CREATED_AT) VALUES (?,?,'VERSION_TO_MASTER',0,CURRENT_TIMESTAMP)",
            linkTypeId, "composed_of");
    }

    // ================================================================
    // SIGNATURES
    // ================================================================

    @Test
    @DisplayName("Signature : crée une version technique SIGNATURE sans changer révision.itération")
    void testSignaturePreservesIteration() {
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Part A"));

        signatureService.sign(nodeId, "bob", "Reviewed", "Looks good");

        var latest = versionService.getCurrentVersion(nodeId);
        // Révision et itération inchangées
        assertThat(latest.get("REVISION", String.class)).isEqualTo("A");
        assertThat(latest.get("ITERATION", Integer.class)).isEqualTo(1);
        assertThat(latest.get("CHANGE_TYPE", String.class)).isEqualTo("SIGNATURE");

        // 2 versions techniques : création + signature
        int count = dsl.fetchCount(dsl.selectOne().from("NODE_VERSION").where("NODE_ID = ?", nodeId));
        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("Signature : un même utilisateur ne peut pas signer deux fois la même révision.itération")
    void testDuplicateSignatureRejected() {
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Part A"));
        signatureService.sign(nodeId, "bob", "Reviewed", null);

        assertThatThrownBy(() -> signatureService.sign(nodeId, "bob", "Reviewed", null))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("already signed");
    }

    @Test
    @DisplayName("Signature : après une modification de contenu (nouvelle itération), on peut re-signer")
    void testSignatureAfterContentChange() {
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Part A"));
        signatureService.sign(nodeId, "bob", "Reviewed", null);

        // Modification de contenu → nouvelle itération
        nodeService.modifyNode(nodeId, "alice", Map.of(attrNameId, "Part A v2"), "Fix");

        // Bob peut signer à nouveau car c'est une nouvelle itération
        assertThatCode(() -> signatureService.sign(nodeId, "bob", "Reviewed", "Re-checked"))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Signatures : historique complet multi-versions")
    void testSignatureHistory() {
        String nodeId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Part"));
        signatureService.sign(nodeId, "bob",     "Reviewed",  null);
        signatureService.sign(nodeId, "charlie", "Approved",  null);

        var history = signatureService.getFullSignatureHistory(nodeId);
        assertThat(history).hasSize(2);
    }

    // ================================================================
    // BASELINE
    // ================================================================

    @Test
    @DisplayName("Baseline : prérequis Frozen vérifié avant création")
    void testBaselineRequiresFrozen() {
        String parentId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Assembly"));

        // Pas Frozen → doit échouer
        assertThatThrownBy(() -> baselineService.createBaseline(parentId, "BL_01", null, "alice"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Frozen");
    }

    @Test
    @DisplayName("Baseline : résolution eager des liens VERSION_TO_MASTER")
    void testBaselineResolvesV2MLinks() {
        // Parent + 2 enfants
        String parentId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Assembly"));
        String child1Id = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Part 1"));
        String child2Id = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Part 2"));

        // Liens VERSION_TO_MASTER
        nodeService.createLink(linkTypeId, parentId, child1Id, null, "alice");
        nodeService.createLink(linkTypeId, parentId, child2Id, null, "alice");

        // Passer parent en Frozen (prérequis baseline)
        lifecycleService.applyTransition(parentId, transitionToFrozenId, "alice");

        String baselineId = baselineService.createBaseline(parentId, "BL_2026_Q1", "First baseline", "alice");

        // 2 entrées : une par lien V2M
        var content = baselineService.getBaselineContent(baselineId);
        assertThat(content).hasSize(2);
    }

    @Test
    @DisplayName("Baseline : comparaison de deux baselines détecte les changements")
    void testBaselineComparison() {
        String parentId = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Assembly"));
        String childId  = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "Part 1"));
        nodeService.createLink(linkTypeId, parentId, childId, null, "alice");

        // Baseline A
        lifecycleService.applyTransition(parentId, transitionToFrozenId, "alice");
        String blA = baselineService.createBaseline(parentId, "BL_A", null, "alice");

        // Modifier l'enfant → nouvelle itération
        // D'abord, remettre parent en Draft pour pouvoir le modifier
        // (simulation simplifiée : on crée directement une nouvelle version sur l'enfant)
        nodeService.modifyNode(childId, "bob", Map.of(attrNameId, "Part 1 updated"), "Fix");

        // Re-Frozen parent pour baseline B
        lifecycleService.applyTransition(parentId, transitionToFrozenId, "alice");
        String blB = baselineService.createBaseline(parentId, "BL_B", null, "alice");

        var diffs = baselineService.compareBaselines(blA, blB);
        assertThat(diffs).isNotEmpty();
        assertThat(diffs.get(0).get("status")).isEqualTo("CHANGED");
    }

    // ================================================================
    // META-MODEL
    // ================================================================

    @Test
    @DisplayName("MetaModel : création d'un NodeType avec attributs et règles état")
    void testMetaModelCreation() {
        String lcId = metaModelService.createLifecycle("Custom LC", "Test lifecycle");
        String s1   = metaModelService.addState(lcId, "Draft",    true,  false, false, 1);
        String s2   = metaModelService.addState(lcId, "Released", false, false, true,  2);
        metaModelService.addTransition(lcId, "Release", s1, s2, null, null);

        String ntId  = metaModelService.createNodeType("Component", "A component", lcId);
        String atId  = metaModelService.createAttributeDefinition(ntId, Map.of(
            "name", "serialNumber", "label", "Serial Number",
            "dataType", "STRING", "required", 1,
            "namingRegex", "[A-Z]{2}-\\d{4}",
            "displayOrder", 1, "displaySection", "Identity",
            "widgetType", "TEXT"
        ));

        // Règle : serialNumber requis en Released, non éditable
        metaModelService.setAttributeStateRule(atId, s2, true, false, true);

        var matrix = metaModelService.getAttributeStateMatrix(ntId);
        assertThat(matrix).isNotEmpty();

        // Vérifier la règle
        var rule = matrix.stream()
            .filter(r -> s2.equals(r.get("LIFECYCLE_STATE_ID", String.class)))
            .findFirst();
        assertThat(rule).isPresent();
        assertThat(rule.get().get("EDITABLE", Integer.class)).isEqualTo(0);
        assertThat(rule.get().get("REQUIRED", Integer.class)).isEqualTo(1);
    }

    @Test
    @DisplayName("MetaModel : LinkType avec contraintes de cardinalité")
    void testLinkTypeCardinality() {
        String ltId = metaModelService.createLinkType(
            "uses", "Usage link",
            nodeTypeId, nodeTypeId,
            "VERSION_TO_VERSION",
            0, 3 // max 3 liens
        );

        String parent = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "A"));
        String child1 = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "B"));
        String child2 = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "C"));
        String child3 = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "D"));
        String child4 = nodeService.createNode(nodeTypeId, "alice", Map.of(attrNameId, "E"));

        // Version à pointer pour V2V
        String v1 = versionService.getCurrentVersion(child1).get("ID", String.class);
        String v2 = versionService.getCurrentVersion(child2).get("ID", String.class);
        String v3 = versionService.getCurrentVersion(child3).get("ID", String.class);
        String v4 = versionService.getCurrentVersion(child4).get("ID", String.class);

        nodeService.createLink(ltId, parent, child1, v1, "alice");
        nodeService.createLink(ltId, parent, child2, v2, "alice");
        nodeService.createLink(ltId, parent, child3, v3, "alice");

        // 4ème lien doit échouer (max=3)
        assertThatThrownBy(() -> nodeService.createLink(ltId, parent, child4, v4, "alice"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("cardinality");
    }

    // -------------------------------------------------------
    private String uid() { return UUID.randomUUID().toString(); }
}
