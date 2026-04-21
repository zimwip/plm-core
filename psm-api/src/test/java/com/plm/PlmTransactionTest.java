package com.plm;

import com.plm.shared.exception.AccessDeniedException;
import com.plm.shared.security.PlmUserContext;
import com.plm.node.NodeService;
import com.plm.node.transaction.internal.LockService;
import com.plm.node.transaction.internal.PlmTransactionService;
import com.plm.node.version.internal.VersionService;
import com.plm.shared.security.PlmProjectSpaceContext;
import com.plm.shared.security.PlmSecurityContext;
import org.jooq.DSLContext;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
class PlmTransactionTest {

    @Autowired DSLContext            dsl;
    @Autowired NodeService           nodeService;
    @Autowired PlmTransactionService txService;
    @Autowired LockService           lockService;
    @Autowired VersionService        versionService;

    static final String USER_ALICE   = "user-alice";
    static final String USER_BOB     = "user-bob";
    static final String USER_ADMIN   = "user-admin";
    static final String NT_DOCUMENT  = "nt-document";
    static final String AD_DOC_TITLE  = "ad-doc-title";
    static final String AD_DOC_AUTHOR = "ad-doc-author";
    static final String AD_DOC_CAT    = "ad-doc-cat";

    @AfterEach void clearCtx() { PlmSecurityContext.clear(); PlmProjectSpaceContext.clear(); }

    // ── Helpers ──────────────────────────────────────────────────────

    private void asAlice() {
        PlmSecurityContext.set(new PlmUserContext(USER_ALICE, "alice", Set.of("role-designer"), false));
        PlmProjectSpaceContext.set("ps-default");
    }
    private void asBob() {
        PlmSecurityContext.set(new PlmUserContext(USER_BOB, "bob", Set.of("role-reviewer"), false));
        PlmProjectSpaceContext.set("ps-default");
    }
    private void asAdmin() {
        PlmSecurityContext.set(new PlmUserContext(USER_ADMIN, "admin", Set.of("role-admin"), true));
        PlmProjectSpaceContext.set("ps-default");
    }

    private String createDoc() {
        String nodeId = nodeService.createNode("ps-default", NT_DOCUMENT, USER_ALICE, Map.of(
            AD_DOC_TITLE, "Doc", AD_DOC_AUTHOR, "Alice", AD_DOC_CAT, "Design"
        ), null, null);
        String txId = txService.findOpenTransaction(USER_ALICE);
        txService.commitTransaction(txId, USER_ALICE, "Initial creation", null);
        return nodeId;
    }

    /** Résout le statut de la transaction liée à une node_version. */
    private String txStatusForVersion(org.jooq.Record version) {
        // tx_id may not be in the record's SELECT columns; look it up by version id
        String versionId = version.get("id", String.class);
        String txId = dsl.select().from("node_version").where("id = ?", versionId)
                         .fetchOne("tx_id", String.class);
        return dsl.select().from("plm_transaction").where("id = ?", txId)
                  .fetchOne("status", String.class);
    }

    // ================================================================
    // OUVERTURE
    // ================================================================

    @Test
    @DisplayName("Ouvrir une transaction explicitement")
    void testOpenTransaction() {
        asAlice();
        String txId = txService.openTransaction(USER_ALICE);

        var tx = txService.getTransaction(txId);
        assertThat(tx.get("status", String.class)).isEqualTo("OPEN");
        assertThat(tx.get("owner_id", String.class)).isEqualTo(USER_ALICE);
    }

    @Test
    @DisplayName("Un utilisateur ne peut pas avoir deux transactions OPEN simultanées")
    void testOnlyOneOpenTxPerUser() {
        asAlice();
        txService.openTransaction(USER_ALICE);

        assertThatThrownBy(() -> txService.openTransaction(USER_ALICE))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("already has an open transaction");
    }

    @Test
    @DisplayName("Deux utilisateurs différents peuvent chacun avoir une transaction OPEN")
    void testDifferentUsersCanHaveOpenTx() {
        asAlice();
        String txAlice = txService.openTransaction(USER_ALICE);

        asBob();
        String txBob = txService.openTransaction(USER_BOB);

        assertThat(txAlice).isNotEqualTo(txBob);
        assertThat(txService.findOpenTransaction(USER_ALICE)).isEqualTo(txAlice);
        assertThat(txService.findOpenTransaction(USER_BOB)).isEqualTo(txBob);
    }

    // ================================================================
    // CRÉATION AUTOMATIQUE
    // ================================================================

    @Test
    @DisplayName("Checkout dans une transaction OPEN acquiert le lock")
    void testCheckoutAcquiresLock() {
        asAlice();
        String nodeId = createDoc();

        // Pas de tx ouverte
        assertThat(txService.findOpenTransaction(USER_ALICE)).isNull();

        // Ouvrir une tx, checkout le noeud (lock + version OPEN)
        String txId = txService.openTransaction(USER_ALICE);
        nodeService.checkout(nodeId, USER_ALICE, txId);

        assertThat(lockService.isLockedByTx(nodeId, txId)).isTrue();
        assertThat(txService.findOpenTransaction(USER_ALICE)).isEqualTo(txId);

        var tx = txService.getTransaction(txId);
        assertThat(tx.get("status", String.class)).isEqualTo("OPEN");
    }

    @Test
    @DisplayName("Plusieurs checkouts dans la même transaction OPEN lockent tous les noeuds")
    void testMultipleCheckoutsInSameTx() {
        asAlice();
        String node1 = createDoc();
        String node2 = createDoc();

        String txId = txService.openTransaction(USER_ALICE);
        nodeService.checkout(node1, USER_ALICE, txId);
        nodeService.checkout(node2, USER_ALICE, txId);

        assertThat(lockService.isLockedByTx(node1, txId)).isTrue();
        assertThat(lockService.isLockedByTx(node2, txId)).isTrue();
    }

    // ================================================================
    // VERSIONS DANS LA TRANSACTION
    // ================================================================

    @Test
    @DisplayName("Les versions créées dans une tx OPEN appartiennent à une transaction OPEN")
    void testVersionTxStatusOpen() {
        asAlice();
        String nodeId = createDoc();
        String txId   = txService.openTransaction(USER_ALICE);

        nodeService.modifyNode(nodeId, USER_ALICE, txId, Map.of(AD_DOC_TITLE, "Updated"), "Fix title");

        var versions = txService.getTransactionVersions(txId);
        assertThat(versions).hasSize(1);
        assertThat(txStatusForVersion(versions.get(0))).isEqualTo("OPEN");
    }

    @Test
    @DisplayName("Visibilité OPEN : seul le owner et les admins voient les versions")
    void testOpenVersionVisibility() {
        asAlice();
        String nodeId = createDoc();
        String txId   = txService.openTransaction(USER_ALICE);

        nodeService.modifyNode(nodeId, USER_ALICE, txId, Map.of(AD_DOC_TITLE, "Draft v2"), "WIP");

        // Alice voit sa propre version OPEN via getCurrentVisibleVersion
        var latestVersion = txService.getCurrentVisibleVersion(nodeId);
        assertThat(txStatusForVersion(latestVersion)).isEqualTo("OPEN");

        // Alice (owner) voit la version OPEN
        assertThat(txService.isVersionVisible(latestVersion)).isTrue();

        // Bob ne voit PAS la version OPEN d'Alice
        asBob();
        assertThat(txService.isVersionVisible(latestVersion)).isFalse();

        // Admin voit tout
        asAdmin();
        assertThat(txService.isVersionVisible(latestVersion)).isTrue();
    }

    @Test
    @DisplayName("getCurrentVisibleVersion : Bob voit la dernière version COMMITTED")
    void testCurrentVisibleVersionForOtherUser() {
        asAlice();
        String nodeId = createDoc();
        // Version initiale (committed — auto-tx créée à la création du noeud)
        var v1 = versionService.getCurrentVersion(nodeId);
        assertThat(txStatusForVersion(v1)).isEqualTo("COMMITTED");

        // Alice ouvre une tx et crée une version OPEN
        String txId = txService.openTransaction(USER_ALICE);
        nodeService.modifyNode(nodeId, USER_ALICE, txId, Map.of(AD_DOC_TITLE, "WIP title"), "WIP");

        // Alice voit sa propre version OPEN
        asAlice();
        var aliceView = txService.getCurrentVisibleVersion(nodeId);
        assertThat(txStatusForVersion(aliceView)).isEqualTo("OPEN");

        // Bob voit uniquement la dernière version COMMITTED (v1)
        asBob();
        var bobView = txService.getCurrentVisibleVersion(nodeId);
        assertThat(txStatusForVersion(bobView)).isEqualTo("COMMITTED");
        assertThat(bobView.get("version_number", Integer.class))
            .isEqualTo(v1.get("version_number", Integer.class));
    }

    // ================================================================
    // COMMIT
    // ================================================================

    @Test
    @DisplayName("Commit : les versions passent à COMMITTED et le lock est libéré")
    void testCommit() {
        asAlice();
        String nodeId = createDoc();
        String txId   = txService.openTransaction(USER_ALICE);

        nodeService.modifyNode(nodeId, USER_ALICE, txId, Map.of(AD_DOC_TITLE, "Final title"), "Done");

        txService.commitTransaction(txId, USER_ALICE, "Feature A complete — reviewed and validated", null);

        // Statut tx → COMMITTED
        var tx = txService.getTransaction(txId);
        assertThat(tx.get("status", String.class)).isEqualTo("COMMITTED");
        assertThat(tx.get("commit_comment", String.class)).contains("Feature A complete");

        // Version → tx COMMITTED
        var version = versionService.getCurrentVersion(nodeId);
        assertThat(txStatusForVersion(version)).isEqualTo("COMMITTED");

        // Lock libéré
        assertThat(lockService.isLocked(nodeId)).isFalse();

        // Plus de tx ouverte pour Alice
        assertThat(txService.findOpenTransaction(USER_ALICE)).isNull();
    }

    @Test
    @DisplayName("Commit sans commentaire → erreur")
    void testCommitRequiresComment() {
        asAlice();
        String nodeId = createDoc();
        String txId   = txService.openTransaction(USER_ALICE);
        nodeService.checkout(nodeId, USER_ALICE, txId);

        assertThatThrownBy(() -> txService.commitTransaction(txId, USER_ALICE, "", null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("comment is required");

        assertThatThrownBy(() -> txService.commitTransaction(txId, USER_ALICE, null, null))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Commit par un non-owner → erreur")
    void testCommitByNonOwner() {
        asAlice();
        String txId = txService.openTransaction(USER_ALICE);

        asBob();
        assertThatThrownBy(() -> txService.commitTransaction(txId, USER_BOB, "Trying to commit", null))
            .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Après commit : Bob voit les versions (COMMITTED = visibles par tous)")
    void testCommittedVersionsVisibleToAll() {
        asAlice();
        String nodeId = createDoc();
        String txId   = txService.openTransaction(USER_ALICE);
        nodeService.modifyNode(nodeId, USER_ALICE, txId, Map.of(AD_DOC_TITLE, "New title"), "Done");

        txService.commitTransaction(txId, USER_ALICE, "Feature complete", null);

        // Bob voit maintenant la nouvelle version (tx committée)
        asBob();
        var bobView = txService.getCurrentVisibleVersion(nodeId);
        assertThat(txStatusForVersion(bobView)).isEqualTo("COMMITTED");
        assertThat(bobView.get("version_number", Integer.class)).isEqualTo(2);
    }

    // ================================================================
    // ROLLBACK
    // ================================================================

    @Test
    @DisplayName("Rollback : locks libérés, transaction supprimée, plus de tx ouverte")
    void testRollback() {
        asAlice();
        String nodeId = createDoc();
        String txId   = txService.openTransaction(USER_ALICE);

        nodeService.modifyNode(nodeId, USER_ALICE, txId, Map.of(AD_DOC_TITLE, "Bad title"), "Oops");

        txService.rollbackTransaction(txId, USER_ALICE);

        // Transaction supprimée physiquement
        assertThat(dsl.fetchCount(
            dsl.selectOne().from("PLM_TRANSACTION").where("ID = ?", txId)
        )).isEqualTo(0);

        // Lock libéré
        assertThat(lockService.isLocked(nodeId)).isFalse();

        // Plus de tx ouverte
        assertThat(txService.findOpenTransaction(USER_ALICE)).isNull();
    }

    @Test
    @DisplayName("Rollback : les versions sont supprimées physiquement (comme si rien ne s'était passé)")
    void testRollbackDeletesVersionsPhysically() {
        asAlice();
        String nodeId = createDoc();
        // Version initiale = 1
        int versionsBefore = dsl.fetchCount(
            dsl.selectOne().from("NODE_VERSION").where("NODE_ID = ?", nodeId));

        String txId = txService.openTransaction(USER_ALICE);
        nodeService.modifyNode(nodeId, USER_ALICE, txId, Map.of(AD_DOC_TITLE, "Temp"), "Temp");

        // 2 versions : initiale + OPEN
        assertThat(dsl.fetchCount(dsl.selectOne().from("NODE_VERSION").where("NODE_ID = ?", nodeId)))
            .isEqualTo(versionsBefore + 1);

        txService.rollbackTransaction(txId, USER_ALICE);

        // Retour à l'état initial : la version OPEN est supprimée
        assertThat(dsl.fetchCount(dsl.selectOne().from("NODE_VERSION").where("NODE_ID = ?", nodeId)))
            .isEqualTo(versionsBefore);

        // La transaction elle-même est supprimée
        assertThat(dsl.fetchCount(dsl.selectOne().from("PLM_TRANSACTION").where("ID = ?", txId)))
            .isEqualTo(0);
    }

    @Test
    @DisplayName("Rollback : le noeud retrouve son dernier état committed (version OPEN disparue)")
    void testRollbackRestoresLastCommittedState() {
        asAlice();
        String nodeId = createDoc();
        // Version initiale committée
        var v1 = versionService.getCurrentVersion(nodeId);
        int v1Number = v1.get("version_number", Integer.class);

        // Ouvrir une tx, créer une version OPEN
        String txId = txService.openTransaction(USER_ALICE);
        nodeService.modifyNode(nodeId, USER_ALICE, txId, Map.of(AD_DOC_TITLE, "Should disappear"), "Draft");

        // Alice voit la version OPEN
        asAlice();
        var aliceView = txService.getCurrentVisibleVersion(nodeId);
        assertThat(txStatusForVersion(aliceView)).isEqualTo("OPEN");

        // Rollback
        txService.rollbackTransaction(txId, USER_ALICE);

        // Plus de tx ouverte
        assertThat(txService.findOpenTransaction(USER_ALICE)).isNull();

        // Tout le monde voit à nouveau la version initiale committée
        asAlice();
        var afterRollback = txService.getCurrentVisibleVersion(nodeId);
        assertThat(afterRollback.get("version_number", Integer.class)).isEqualTo(v1Number);
        assertThat(txStatusForVersion(afterRollback)).isEqualTo("COMMITTED");

        asBob();
        var bobView = txService.getCurrentVisibleVersion(nodeId);
        assertThat(bobView.get("version_number", Integer.class)).isEqualTo(v1Number);
    }

    @Test
    @DisplayName("Commit d'une tx déjà COMMITTED → erreur (not OPEN)")
    void testDoubleCommitFails() {
        asAlice();
        String nodeId = createDoc();
        String txId = txService.openTransaction(USER_ALICE);
        nodeService.modifyNode(nodeId, USER_ALICE, txId, Map.of(AD_DOC_TITLE, "v2"), "setup");
        txService.commitTransaction(txId, USER_ALICE, "Done", null);

        assertThatThrownBy(() -> txService.commitTransaction(txId, USER_ALICE, "Again", null))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("already");
    }

    // ================================================================
    // LISTAGE
    // ================================================================

    @Test
    @DisplayName("listTransactions : utilisateur normal ne voit pas les tx OPEN des autres")
    void testListTransactionsVisibility() {
        asAlice();
        txService.openTransaction(USER_ALICE);

        asBob();
        var visible = txService.listTransactions(50);
        // Bob ne doit pas voir la tx OPEN d'Alice
        boolean aliceTxVisible = visible.stream()
            .anyMatch(r -> USER_ALICE.equals(r.get("owner_id", String.class))
                       && "OPEN".equals(r.get("status", String.class)));
        assertThat(aliceTxVisible).isFalse();
    }

    @Test
    @DisplayName("listTransactions : admin voit les transactions OPEN de tous les utilisateurs")
    void testListTransactionsAdmin() {
        asAlice();
        txService.openTransaction(USER_ALICE);

        asAdmin();
        var all = txService.listTransactions(50);
        boolean aliceTxVisible = all.stream()
            .anyMatch(r -> USER_ALICE.equals(r.get("owner_id", String.class))
                       && "OPEN".equals(r.get("status", String.class)));
        assertThat(aliceTxVisible).isTrue();
    }

    @Test
    @DisplayName("Après rollback, la transaction n'apparaît plus dans les listes")
    void testRolledBackTxDisappearsFromList() {
        asAlice();
        String txId = txService.openTransaction(USER_ALICE);
        txService.rollbackTransaction(txId, USER_ALICE);

        asAdmin();
        var all = txService.listTransactions(50);
        boolean txStillVisible = all.stream()
            .anyMatch(r -> txId.equals(r.get("id", String.class)));
        assertThat(txStillVisible).isFalse();
    }
}
