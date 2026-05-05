package com.plm;

import com.plm.shared.security.PlmUserContext;
import com.plm.node.NodeService;
import com.plm.node.baseline.internal.BaselineService;
import com.plm.node.lifecycle.internal.LifecycleService;
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
        nodeService.createLink(linkTypeId, parentId, "SELF", nodeTypeId, logicalIdOf(child1Id), "alice", transTx, uid());
        nodeService.createLink(linkTypeId, parentId, "SELF", nodeTypeId, logicalIdOf(child2Id), "alice", transTx, uid());
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
        nodeService.createLink(linkTypeId, parentId, "SELF", nodeTypeId, logicalIdOf(childId), "alice", transTx1, uid());
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

    // -------------------------------------------------------

    /**
     * Creates a node for the given user, populates initial attributes via
     * update_node within the auto-opened creation transaction, then commits.
     */
    private String setupNode(String userId, Map<String, String> attrs) {
        String logicalId = "NODE-" + uid().substring(0, 8);
        String nodeId = nodeService.createNode(PS_DEFAULT, nodeTypeId, userId, logicalId, null);
        String txId = txService.findOpenTransaction(userId);
        if (attrs != null && !attrs.isEmpty()) {
            nodeService.modifyNode(nodeId, userId, txId, attrs, "Initial attributes");
        }
        txService.commitTransaction(txId, userId, "Initial creation", null);
        return nodeId;
    }

    private String uid() { return UUID.randomUUID().toString(); }

    private String logicalIdOf(String nodeId) {
        return dsl.select(org.jooq.impl.DSL.field("logical_id"))
            .from("node").where("id = ?", nodeId)
            .fetchOne(org.jooq.impl.DSL.field("logical_id"), String.class);
    }
}
