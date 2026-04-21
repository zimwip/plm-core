package com.plm;

import com.plm.shared.security.PlmUserContext;
import com.plm.node.NodeService;
import com.plm.node.baseline.internal.BaselineService;
import com.plm.node.lifecycle.internal.LifecycleService;
import com.plm.node.metamodel.internal.MetaModelService;
import com.plm.node.signature.internal.SignatureService;
import com.plm.node.transaction.internal.LockService;
import com.plm.node.transaction.internal.PlmTransactionService;
import com.plm.node.version.internal.VersionService;
import com.plm.shared.security.PlmProjectSpaceContext;
import com.plm.shared.security.PlmSecurityContext;
import org.jooq.DSLContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
class PlmExtendedTest {

    @Autowired DSLContext              dsl;
    @Autowired NodeService             nodeService;
    @Autowired LockService             lockService;
    @Autowired VersionService          versionService;
    @Autowired LifecycleService        lifecycleService;
    @Autowired SignatureService        signatureService;
    @Autowired BaselineService         baselineService;
    @Autowired MetaModelService        metaModelService;
    @Autowired PlmTransactionService   txService;

    static final String PS_DEFAULT = "ps-default";

    // IDs partagés
    String lifecycleId, stateDraftId, stateInReviewId, stateReleasedId, stateFrozenId;
    String transitionToReviewId, transitionToReleasedId, transitionToFrozenId;
    String nodeTypeId, attrNameId;
    String linkTypeId;

    @BeforeEach
    void setup() {
        // Admin context so createNode bypasses role checks
        PlmSecurityContext.set(new PlmUserContext("admin", "admin", Set.of(), true));
        PlmProjectSpaceContext.set("ps-default");

        lifecycleId     = uid();
        stateDraftId    = uid();
        stateInReviewId = uid();
        stateReleasedId = uid();
        stateFrozenId   = uid();

        dsl.execute("INSERT INTO LIFECYCLE (ID, NAME) VALUES (?,?)", lifecycleId, "Standard");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, DISPLAY_ORDER) VALUES (?,?,?,1,1)", stateDraftId, lifecycleId, "Draft");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, DISPLAY_ORDER) VALUES (?,?,?,0,2)", stateInReviewId, lifecycleId, "InReview");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, DISPLAY_ORDER) VALUES (?,?,?,0,3)", stateReleasedId, lifecycleId, "Released");
        dsl.execute("INSERT INTO LIFECYCLE_STATE (ID, LIFECYCLE_ID, NAME, IS_INITIAL, DISPLAY_ORDER) VALUES (?,?,?,0,4)", stateFrozenId, lifecycleId, "Frozen");

        transitionToReviewId   = uid();
        transitionToReleasedId = uid();
        transitionToFrozenId   = uid();

        dsl.execute("INSERT INTO LIFECYCLE_TRANSITION (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID) VALUES (?,?,?,?,?)", transitionToReviewId, lifecycleId, "To Review", stateDraftId, stateInReviewId);
        dsl.execute("INSERT INTO LIFECYCLE_TRANSITION (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID) VALUES (?,?,?,?,?)", transitionToReleasedId, lifecycleId, "Release", stateInReviewId, stateReleasedId);
        dsl.execute("INSERT INTO LIFECYCLE_TRANSITION (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, ACTION_TYPE) VALUES (?,?,?,?,?,?)", transitionToFrozenId, lifecycleId, "Freeze", stateDraftId, stateFrozenId, "CASCADE_FROZEN");

        // Entity metadata for frozen/released states (used by guards and baseline)
        dsl.execute("INSERT INTO ENTITY_METADATA (ID, TARGET_TYPE, TARGET_ID, META_KEY, META_VALUE) VALUES (?,?,?,?,?)",
            uid(), "LIFECYCLE_STATE", stateFrozenId, "frozen", "true");
        dsl.execute("INSERT INTO ENTITY_METADATA (ID, TARGET_TYPE, TARGET_ID, META_KEY, META_VALUE) VALUES (?,?,?,?,?)",
            uid(), "LIFECYCLE_STATE", stateReleasedId, "released", "true");

        nodeTypeId = uid();
        dsl.execute("INSERT INTO NODE_TYPE (ID, NAME, LIFECYCLE_ID) VALUES (?,?,?)", nodeTypeId, "Part", lifecycleId);

        attrNameId = uid();
        dsl.execute("INSERT INTO ATTRIBUTE_DEFINITION (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DISPLAY_ORDER, DISPLAY_SECTION, WIDGET_TYPE) VALUES (?,?,?,?,?,0,1,'General','TEXT')",
            attrNameId, nodeTypeId, "name", "Name", "STRING");

        linkTypeId = uid();
        dsl.execute("INSERT INTO LINK_TYPE (ID, NAME, LINK_POLICY, MIN_CARDINALITY, CREATED_AT) VALUES (?,?,'VERSION_TO_MASTER',0,CURRENT_TIMESTAMP)",
            linkTypeId, "composed_of");
    }

    // ================================================================
    // SIGNATURES
    // ================================================================

    @Test
    @DisplayName("Signature : écrite sur la version courante sans nouvelle version")
    void testSignaturePreservesIteration() {
        String nodeId = setupNode("alice", Map.of(attrNameId, "Part A"));

        signatureService.sign(nodeId, "bob", "Reviewed", "Looks good");

        var latest = versionService.getCurrentVersion(nodeId);
        // Révision et itération inchangées
        assertThat(latest.get("revision", String.class)).isEqualTo("A");
        assertThat(latest.get("iteration", Integer.class)).isEqualTo(1);

        // Signature recorded on existing version (no new version created)
        int count = dsl.fetchCount(dsl.selectOne().from("NODE_VERSION").where("NODE_ID = ?", nodeId));
        assertThat(count).isEqualTo(1);

        // Signature exists
        int sigCount = dsl.fetchCount(dsl.selectOne().from("NODE_SIGNATURE").where("NODE_ID = ?", nodeId));
        assertThat(sigCount).isEqualTo(1);
    }

    @Test
    @DisplayName("Signature : un même utilisateur ne peut pas signer deux fois la même révision.itération")
    void testDuplicateSignatureRejected() {
        String nodeId = setupNode("alice", Map.of(attrNameId, "Part A"));

        signatureService.sign(nodeId, "bob", "Reviewed", null);

        assertThatThrownBy(() -> signatureService.sign(nodeId, "bob", "Reviewed", null))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("already signed");
    }

    @Test
    @DisplayName("Signature : après une modification de contenu (nouvelle itération), on peut re-signer")
    void testSignatureAfterContentChange() {
        String nodeId = setupNode("alice", Map.of(attrNameId, "Part A"));

        signatureService.sign(nodeId, "bob", "Reviewed", null);

        // Modification de contenu → nouvelle itération
        String modTx = txService.openTransaction("alice");
        nodeService.modifyNode(nodeId, "alice", modTx, Map.of(attrNameId, "Part A v2"), "Fix");
        txService.commitTransaction(modTx, "alice", "Content update", null);

        // Bob peut signer à nouveau car c'est une nouvelle itération
        assertThatCode(() -> signatureService.sign(nodeId, "bob", "Reviewed", "Re-checked"))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Signatures : historique complet multi-versions")
    void testSignatureHistory() {
        String nodeId = setupNode("alice", Map.of(attrNameId, "Part"));

        signatureService.sign(nodeId, "bob", "Reviewed", null);
        signatureService.sign(nodeId, "charlie", "Approved", null);

        var history = signatureService.getFullSignatureHistory(nodeId);
        assertThat(history).hasSize(2);
    }

    // ================================================================
    // BASELINE
    // ================================================================

    @Test
    @DisplayName("Baseline : prérequis Frozen vérifié avant création")
    void testBaselineRequiresFrozen() {
        String parentId = setupNode("alice", Map.of(attrNameId, "Assembly"));

        // Pas Frozen → doit échouer
        assertThatThrownBy(() -> baselineService.createBaseline(parentId, "BL_01", null, "alice"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Frozen");
    }

    @Test
    @DisplayName("Baseline : résolution eager des liens VERSION_TO_MASTER")
    void testBaselineResolvesV2MLinks() {
        // Parent + 2 enfants
        String parentId = setupNode("alice", Map.of(attrNameId, "Assembly"));
        String child1Id = setupNode("alice", Map.of(attrNameId, "Part 1"));
        String child2Id = setupNode("alice", Map.of(attrNameId, "Part 2"));

        // Liens + Frozen dans la même transaction (commit requiert au moins une node_version)
        String transTx = txService.openTransaction("alice");
        nodeService.createLink(linkTypeId, parentId, child1Id, null, "alice", transTx, uid());
        nodeService.createLink(linkTypeId, parentId, child2Id, null, "alice", transTx, uid());
        lifecycleService.applyTransition(parentId, transitionToFrozenId, "alice", transTx);
        txService.commitTransaction(transTx, "alice", "Links created and frozen", null);

        String baselineId = baselineService.createBaseline(parentId, "BL_2026_Q1", "First baseline", "alice");

        // 2 entrées : une par lien V2M
        var content = baselineService.getBaselineContent(baselineId);
        assertThat(content).hasSize(2);
    }

    @Test
    @DisplayName("Baseline : comparaison de deux baselines détecte les changements")
    void testBaselineComparison() {
        String parentId = setupNode("alice", Map.of(attrNameId, "Assembly"));
        String childId  = setupNode("alice", Map.of(attrNameId, "Part 1"));

        // Lien + Frozen A dans la même transaction
        String transTx1 = txService.openTransaction("alice");
        nodeService.createLink(linkTypeId, parentId, childId, null, "alice", transTx1, uid());
        lifecycleService.applyTransition(parentId, transitionToFrozenId, "alice", transTx1);
        txService.commitTransaction(transTx1, "alice", "Link created and frozen for BL_A", null);
        String blA = baselineService.createBaseline(parentId, "BL_A", null, "alice");

        // Modifier l'enfant → nouvelle itération
        String modTx = txService.openTransaction("bob");
        nodeService.modifyNode(childId, "bob", modTx, Map.of(attrNameId, "Part 1 updated"), "Fix");
        txService.commitTransaction(modTx, "bob", "Content fix", null);

        // Parent is still Frozen — BL_B resolves V2M links to the updated child
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
        String s1   = metaModelService.addState(lcId, "Draft",    true,  Map.of(), 1, null);
        String s2   = metaModelService.addState(lcId, "Released", false, Map.of("frozen", "false", "released", "true"), 2, null);
        metaModelService.addTransition(lcId, "Release", s1, s2, null, null, null);

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
            .filter(r -> s2.equals(r.get("lifecycle_state_id", String.class)))
            .findFirst();
        assertThat(rule).isPresent();
        assertThat(rule.get().get("editable", Integer.class)).isEqualTo(0);
        assertThat(rule.get().get("required", Integer.class)).isEqualTo(1);
    }

    @Test
    @DisplayName("MetaModel : LinkType avec contraintes de cardinalité")
    void testLinkTypeCardinality() {
        String ltId = metaModelService.createLinkType(
            "uses", "Usage link",
            nodeTypeId, nodeTypeId,
            "VERSION_TO_VERSION",
            0, 3, // max 3 liens
            null, null
        );

        String parent = setupNode("alice", Map.of(attrNameId, "A"));
        String child1 = setupNode("alice", Map.of(attrNameId, "B"));
        String child2 = setupNode("alice", Map.of(attrNameId, "C"));
        String child3 = setupNode("alice", Map.of(attrNameId, "D"));
        String child4 = setupNode("alice", Map.of(attrNameId, "E"));

        // Version à pointer pour V2V
        String v1 = versionService.getCurrentVersion(child1).get("id", String.class);
        String v2 = versionService.getCurrentVersion(child2).get("id", String.class);
        String v3 = versionService.getCurrentVersion(child3).get("id", String.class);
        String v4 = versionService.getCurrentVersion(child4).get("id", String.class);

        // Links require a valid txId for lock validation (checkout is called regardless of policy)
        String linkTx = txService.openTransaction("alice");
        nodeService.createLink(ltId, parent, child1, v1, "alice", linkTx, uid());
        nodeService.createLink(ltId, parent, child2, v2, "alice", linkTx, uid());
        nodeService.createLink(ltId, parent, child3, v3, "alice", linkTx, uid());

        // 4ème lien doit échouer (max=3)
        assertThatThrownBy(() -> nodeService.createLink(ltId, parent, child4, v4, "alice", linkTx, uid()))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("cardinality");
    }

    // -------------------------------------------------------

    /** Creates a node for the given user and immediately commits the creation transaction. */
    private String setupNode(String userId, Map<String, String> attrs) {
        String nodeId = nodeService.createNode(PS_DEFAULT, nodeTypeId, userId, attrs, null, null);
        String txId = txService.findOpenTransaction(userId);
        txService.commitTransaction(txId, userId, "Initial creation", null);
        return nodeId;
    }

    private String uid() { return UUID.randomUUID().toString(); }
}
