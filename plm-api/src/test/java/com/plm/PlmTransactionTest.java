package com.plm;

import com.plm.domain.model.Enums.ChangeType;
import com.plm.domain.service.*;
import com.plm.infrastructure.security.PlmSecurityContext;
import com.plm.infrastructure.security.PlmUserContext;
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
    static final String AD_DOC_NUMBER = "ad-doc-number";
    static final String AD_DOC_TITLE  = "ad-doc-title";
    static final String AD_DOC_AUTHOR = "ad-doc-author";
    static final String AD_DOC_CAT    = "ad-doc-cat";

    @AfterEach void clearCtx() { PlmSecurityContext.clear(); }

    // ── Helpers ──────────────────────────────────────────────────────

    private void asAlice() {
        PlmSecurityContext.set(new PlmUserContext(USER_ALICE, "alice", Set.of("role-designer"), false));
    }
    private void asBob() {
        PlmSecurityContext.set(new PlmUserContext(USER_BOB, "bob", Set.of("role-reviewer"), false));
    }
    private void asAdmin() {
        PlmSecurityContext.set(new PlmUserContext(USER_ADMIN, "admin", Set.of("role-admin"), true));
    }

    private String createDoc(String number) {
        return nodeService.createNode(NT_DOCUMENT, USER_ALICE, Map.of(
            AD_DOC_NUMBER, number, AD_DOC_TITLE, "Doc", AD_DOC_AUTHOR, "Alice", AD_DOC_CAT, "Design"
        ));
    }

    // ================================================================
    // OUVERTURE
    // ================================================================

    @Test
    @DisplayName("Ouvrir une transaction explicitement")
    void testOpenTransaction() {
        asAlice();
        String txId = txService.openTransaction(USER_ALICE, "Refonte géométrie");

        var tx = txService.getTransaction(txId);
        assertThat(tx.get("STATUS", String.class)).isEqualTo("OPEN");
        assertThat(tx.get("OWNER_ID", String.class)).isEqualTo(USER_ALICE);
        assertThat(tx.get("TITLE", String.class)).isEqualTo("Refonte géométrie");
    }

    @Test
    @DisplayName("Un utilisateur ne peut pas avoir deux transactions OPEN simultanées")
    void testOnlyOneOpenTxPerUser() {
        asAlice();
        txService.openTransaction(USER_ALICE, "Tx 1");

        assertThatThrownBy(() -> txService.openTransaction(USER_ALICE, "Tx 2"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("already has an open transaction");
    }

    @Test
    @DisplayName("Deux utilisateurs différents peuvent chacun avoir une transaction OPEN")
    void testDifferentUsersCanHaveOpenTx() {
        asAlice();
        String txAlice = txService.openTransaction(USER_ALICE, "Alice tx");

        asBob();
        String txBob = txService.openTransaction(USER_BOB, "Bob tx");

        assertThat(txAlice).isNotEqualTo(txBob);
        assertThat(txService.findOpenTransaction(USER_ALICE)).isEqualTo(txAlice);
        assertThat(txService.findOpenTransaction(USER_BOB)).isEqualTo(txBob);
    }

    // ================================================================
    // CRÉATION AUTOMATIQUE
    // ================================================================

    @Test
    @DisplayName("La transaction est créée automatiquement au premier checkin")
    void testAutoTransactionOnCheckin() {
        asAlice();
        String nodeId = createDoc("DOC-AUTO-1");

        // Pas de tx ouverte
        assertThat(txService.findOpenTransaction(USER_ALICE)).isNull();

        // Premier checkin → crée la tx automatiquement
        String txId = lockService.checkin(nodeId, USER_ALICE, "Auto modification");

        assertThat(txId).isNotNull();
        assertThat(txService.findOpenTransaction(USER_ALICE)).isEqualTo(txId);

        var tx = txService.getTransaction(txId);
        assertThat(tx.get("STATUS", String.class)).isEqualTo("OPEN");
    }

    @Test
    @DisplayName("Plusieurs checkins réutilisent la même transaction OPEN")
    void testMultipleCheckinsReuseOpenTx() {
        asAlice();
        String node1 = createDoc("DOC-MULTI-1");
        String node2 = createDoc("DOC-MULTI-2");

        String tx1 = lockService.checkin(node1, USER_ALICE, "Batch edit");
        String tx2 = lockService.checkin(node2, USER_ALICE, "Batch edit");

        assertThat(tx1).isEqualTo(tx2); // même transaction
    }

    // ================================================================
    // VERSIONS DANS LA TRANSACTION
    // ================================================================

    @Test
    @DisplayName("Les versions créées dans une tx OPEN ont tx_status=OPEN")
    void testVersionTxStatusOpen() {
        asAlice();
        String nodeId = createDoc("DOC-TX-1");
        String txId   = txService.openTransaction(USER_ALICE, "Modification");

        lockService.checkin(nodeId, USER_ALICE, "Modification");
        versionService.createVersion(nodeId, USER_ALICE, ChangeType.CONTENT,
            null, Map.of(AD_DOC_TITLE, "Updated"), "Fix title");

        var versions = txService.getTransactionVersions(txId);
        assertThat(versions).hasSize(1);
        assertThat(versions.get(0).get("TX_STATUS", String.class)).isEqualTo("OPEN");
    }

    @Test
    @DisplayName("Visibilité OPEN : seul le owner et les admins voient les versions")
    void testOpenVersionVisibility() {
        asAlice();
        String nodeId = createDoc("DOC-VIS-1");
        String txId   = txService.openTransaction(USER_ALICE, "Private work");

        lockService.checkin(nodeId, USER_ALICE, "Private work");
        versionService.createVersion(nodeId, USER_ALICE, ChangeType.CONTENT,
            null, Map.of(AD_DOC_TITLE, "Draft v2"), "WIP");

        var latestVersion = versionService.getCurrentVersion(nodeId);
        assertThat(latestVersion.get("TX_STATUS", String.class)).isEqualTo("OPEN");

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
        String nodeId = createDoc("DOC-CURVIS-1");
        // Version initiale (committed car pas de tx au moment de createNode)
        var v1 = versionService.getCurrentVersion(nodeId);
        assertThat(v1.get("TX_STATUS", String.class)).isEqualTo("COMMITTED");

        // Alice ouvre une tx et crée une version OPEN
        String txId = txService.openTransaction(USER_ALICE, "WIP");
        lockService.checkin(nodeId, USER_ALICE, "WIP");
        versionService.createVersion(nodeId, USER_ALICE, ChangeType.CONTENT,
            null, Map.of(AD_DOC_TITLE, "WIP title"), "WIP");

        // Alice voit sa propre version OPEN
        asAlice();
        var aliceView = txService.getCurrentVisibleVersion(nodeId);
        assertThat(aliceView.get("TX_STATUS", String.class)).isEqualTo("OPEN");

        // Bob voit uniquement la dernière version COMMITTED (v1)
        asBob();
        var bobView = txService.getCurrentVisibleVersion(nodeId);
        assertThat(bobView.get("TX_STATUS", String.class)).isEqualTo("COMMITTED");
        assertThat(bobView.get("VERSION_NUMBER", Integer.class))
            .isEqualTo(v1.get("VERSION_NUMBER", Integer.class));
    }

    // ================================================================
    // COMMIT
    // ================================================================

    @Test
    @DisplayName("Commit : les versions passent à COMMITTED et le lock est libéré")
    void testCommit() {
        asAlice();
        String nodeId = createDoc("DOC-CMT-1");
        String txId   = txService.openTransaction(USER_ALICE, "Feature A");

        lockService.checkin(nodeId, USER_ALICE, "Feature A");
        versionService.createVersion(nodeId, USER_ALICE, ChangeType.CONTENT,
            null, Map.of(AD_DOC_TITLE, "Final title"), "Done");

        txService.commitTransaction(txId, USER_ALICE, "Feature A complete — reviewed and validated");

        // Statut tx → COMMITTED
        var tx = txService.getTransaction(txId);
        assertThat(tx.get("STATUS", String.class)).isEqualTo("COMMITTED");
        assertThat(tx.get("COMMIT_COMMENT", String.class)).contains("Feature A complete");

        // Version → COMMITTED
        var version = versionService.getCurrentVersion(nodeId);
        assertThat(version.get("TX_STATUS", String.class)).isEqualTo("COMMITTED");

        // Lock libéré
        assertThat(lockService.isLocked(nodeId)).isFalse();

        // Plus de tx ouverte pour Alice
        assertThat(txService.findOpenTransaction(USER_ALICE)).isNull();
    }

    @Test
    @DisplayName("Commit sans commentaire → erreur")
    void testCommitRequiresComment() {
        asAlice();
        String nodeId = createDoc("DOC-CMT-2");
        String txId   = txService.openTransaction(USER_ALICE, "Work");
        lockService.checkin(nodeId, USER_ALICE, "Work");

        assertThatThrownBy(() -> txService.commitTransaction(txId, USER_ALICE, ""))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("comment is required");

        assertThatThrownBy(() -> txService.commitTransaction(txId, USER_ALICE, null))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Commit par un non-owner → erreur")
    void testCommitByNonOwner() {
        asAlice();
        String txId = txService.openTransaction(USER_ALICE, "Alice work");

        asBob();
        assertThatThrownBy(() -> txService.commitTransaction(txId, USER_BOB, "Trying to commit"))
            .isInstanceOf(PermissionService.AccessDeniedException.class);
    }

    @Test
    @DisplayName("Après commit : Bob voit les versions (COMMITTED = visibles par tous)")
    void testCommittedVersionsVisibleToAll() {
        asAlice();
        String nodeId = createDoc("DOC-CMT-3");
        String txId   = txService.openTransaction(USER_ALICE, "Feature");
        lockService.checkin(nodeId, USER_ALICE, "Feature");
        versionService.createVersion(nodeId, USER_ALICE, ChangeType.CONTENT,
            null, Map.of(AD_DOC_TITLE, "New title"), "Done");

        txService.commitTransaction(txId, USER_ALICE, "Feature complete");

        // Bob voit maintenant la nouvelle version
        asBob();
        var bobView = txService.getCurrentVisibleVersion(nodeId);
        assertThat(bobView.get("TX_STATUS", String.class)).isEqualTo("COMMITTED");
        assertThat(bobView.get("VERSION_NUMBER", Integer.class)).isEqualTo(2);
    }

    // ================================================================
    // ROLLBACK
    // ================================================================

    @Test
    @DisplayName("Rollback : locks libérés, transaction supprimée, plus de tx ouverte")
    void testRollback() {
        asAlice();
        String nodeId = createDoc("DOC-RB-1");
        String txId   = txService.openTransaction(USER_ALICE, "Bad idea");

        lockService.checkin(nodeId, USER_ALICE, "Bad idea");
        versionService.createVersion(nodeId, USER_ALICE, ChangeType.CONTENT,
            null, Map.of(AD_DOC_TITLE, "Bad title"), "Oops");

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
        String nodeId = createDoc("DOC-RB-2");
        // Version initiale = 1
        int versionsBefore = dsl.fetchCount(
            dsl.selectOne().from("NODE_VERSION").where("NODE_ID = ?", nodeId));

        String txId = txService.openTransaction(USER_ALICE, "Cancelled work");
        lockService.checkin(nodeId, USER_ALICE, "Cancelled work");
        versionService.createVersion(nodeId, USER_ALICE, ChangeType.CONTENT,
            null, Map.of(AD_DOC_TITLE, "Temp"), "Temp");

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
        String nodeId = createDoc("DOC-RB-3");
        // Version initiale committée
        var v1 = versionService.getCurrentVersion(nodeId);
        int v1Number = v1.get("VERSION_NUMBER", Integer.class);

        // Ouvrir une tx, créer une version OPEN
        String txId = txService.openTransaction(USER_ALICE, "Cancelled");
        lockService.checkin(nodeId, USER_ALICE, "Cancelled");
        versionService.createVersion(nodeId, USER_ALICE, ChangeType.CONTENT,
            null, Map.of(AD_DOC_TITLE, "Should disappear"), "Draft");

        // Alice voit la version OPEN
        asAlice();
        var aliceView = txService.getCurrentVisibleVersion(nodeId);
        assertThat(aliceView.get("TX_STATUS", String.class)).isEqualTo("OPEN");

        // Rollback
        txService.rollbackTransaction(txId, USER_ALICE);

        // Plus de tx ouverte
        assertThat(txService.findOpenTransaction(USER_ALICE)).isNull();

        // Tout le monde voit à nouveau la version initiale committée
        asAlice();
        var afterRollback = txService.getCurrentVisibleVersion(nodeId);
        assertThat(afterRollback.get("VERSION_NUMBER", Integer.class)).isEqualTo(v1Number);
        assertThat(afterRollback.get("TX_STATUS", String.class)).isEqualTo("COMMITTED");

        asBob();
        var bobView = txService.getCurrentVisibleVersion(nodeId);
        assertThat(bobView.get("VERSION_NUMBER", Integer.class)).isEqualTo(v1Number);
    }

    @Test
    @DisplayName("Commit d'une tx déjà COMMITTED → erreur (not OPEN)")
    void testDoubleCommitFails() {
        asAlice();
        String txId = txService.openTransaction(USER_ALICE, "Work");
        txService.commitTransaction(txId, USER_ALICE, "Done");

        assertThatThrownBy(() -> txService.commitTransaction(txId, USER_ALICE, "Again"))
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
        txService.openTransaction(USER_ALICE, "Alice open tx");

        asBob();
        var visible = txService.listTransactions(50);
        // Bob ne doit pas voir la tx OPEN d'Alice
        boolean aliceTxVisible = visible.stream()
            .anyMatch(r -> USER_ALICE.equals(r.get("OWNER_ID", String.class))
                       && "OPEN".equals(r.get("STATUS", String.class)));
        assertThat(aliceTxVisible).isFalse();
    }

    @Test
    @DisplayName("listTransactions : admin voit les transactions OPEN de tous les utilisateurs")
    void testListTransactionsAdmin() {
        asAlice();
        txService.openTransaction(USER_ALICE, "Alice open");

        asAdmin();
        var all = txService.listTransactions(50);
        boolean aliceTxVisible = all.stream()
            .anyMatch(r -> USER_ALICE.equals(r.get("OWNER_ID", String.class))
                       && "OPEN".equals(r.get("STATUS", String.class)));
        assertThat(aliceTxVisible).isTrue();
    }

    @Test
    @DisplayName("Après rollback, la transaction n'apparaît plus dans les listes")
    void testRolledBackTxDisappearsFromList() {
        asAlice();
        String txId = txService.openTransaction(USER_ALICE, "To be cancelled");
        txService.rollbackTransaction(txId, USER_ALICE);

        asAdmin();
        var all = txService.listTransactions(50);
        boolean txStillVisible = all.stream()
            .anyMatch(r -> txId.equals(r.get("ID", String.class)));
        assertThat(txStillVisible).isFalse();
    }
}
