package com.plm;

import com.plm.shared.exception.AccessDeniedException;
import com.plm.shared.security.PlmUserContext;
import com.plm.platform.action.ActionService;
import com.plm.node.NodeService;
import com.plm.node.lifecycle.internal.LifecycleService;
import com.plm.node.signature.internal.SignatureService;
import com.plm.node.transaction.internal.PlmTransactionService;
import com.plm.node.version.internal.VersionService;
import com.plm.platform.authz.PolicyPort;
import com.plm.shared.security.PlmProjectSpaceContext;
import com.plm.shared.security.PlmSecurityContext;
import org.jooq.DSLContext;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests d'intégration pour la gestion des rôles, permissions et vues.
 *
 * Les données du seed V4 (admin, alice/designer, bob/reviewer, charlie/reader)
 * sont disponibles car Flyway les insère au démarrage.
 *
 * Chaque test configure le PlmSecurityContext manuellement (simule le filtre HTTP).
 */
@SpringBootTest
@Transactional
class PlmRoleAndViewTest {

    @Autowired DSLContext            dsl;
    @Autowired NodeService           nodeService;
    @Autowired ActionService         actionService;
    @Autowired com.plm.platform.authz.PolicyPort policyService;
    @Autowired LifecycleService      lifecycleService;
    @Autowired SignatureService      signatureService;
    @Autowired VersionService        versionService;
    @Autowired PlmTransactionService txService;

    // IDs du seed V4
    static final String ROLE_ADMIN    = "role-admin";
    static final String ROLE_DESIGNER = "role-designer";
    static final String ROLE_REVIEWER = "role-reviewer";
    static final String ROLE_READER   = "role-reader";

    static final String USER_ADMIN   = "user-admin";
    static final String USER_ALICE   = "user-alice";   // designer
    static final String USER_BOB     = "user-bob";     // reviewer
    static final String USER_CHARLIE = "user-charlie"; // reader

    static final String NT_DOCUMENT = "nt-document";
    static final String NT_PART     = "nt-part";

    // V9 lifecycle: In Work → Frozen → Released
    static final String ST_INWORK  = "st-inwork";
    static final String ST_FROZEN  = "st-frozen";
    static final String ST_RELEASED = "st-released";

    static final String TR_FREEZE  = "tr-freeze";   // inwork→frozen  (DESIGNER+ADMIN)
    static final String TR_RELEASE = "tr-release";  // frozen→released (REVIEWER+ADMIN)
    static final String TR_REJECT  = "tr-reject";   // frozen→inwork   (REVIEWER+ADMIN)

    static final String AD_DOC_TITLE   = "ad-doc-title";
    static final String AD_DOC_AUTHOR  = "ad-doc-author";
    static final String AD_DOC_CAT     = "ad-doc-cat";
    static final String AD_DOC_REVIEW  = "ad-doc-review";

    @AfterEach
    void clearContext() {
        PlmSecurityContext.clear();
        PlmProjectSpaceContext.clear();
    }

    // ================================================================
    // PERMISSIONS NODETYPES
    // ================================================================

    @Test
    @DisplayName("DESIGNER peut lire et écrire un Document")
    void testDesignerCanWrite() {
        asDesigner();
        String nodeId = createMinimalDocument();

        String txId = txService.openTransaction(USER_ALICE);
        assertThatCode(() -> nodeService.modifyNode(nodeId, USER_ALICE, txId,
            Map.of(AD_DOC_TITLE, "Updated Title"), "Fix title"))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("REVIEWER ne peut pas modifier un Document")
    void testReviewerCannotWrite() {
        // Alice crée le noeud
        asDesigner();
        String nodeId = createMinimalDocument();

        // Bob (reviewer) essaie de modifier — permission denied before txId check
        asReviewer();
        assertThatThrownBy(() -> nodeService.modifyNode(nodeId, USER_BOB, null,
            Map.of(AD_DOC_TITLE, "Hacked"), "Hack"))
            .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("READER peut lire mais pas écrire")
    void testReaderCanOnlyRead() {
        asDesigner();
        String nodeId = createMinimalDocument();

        asReader();
        // Lecture OK
        assertThatCode(() -> nodeService.buildObjectDescription(nodeId, USER_CHARLIE, ROLE_READER))
            .doesNotThrowAnyException();

        // Écriture KO — permission denied before txId check
        assertThatThrownBy(() -> nodeService.modifyNode(nodeId, USER_CHARLIE, null, Map.of(), ""))
            .isInstanceOf(AccessDeniedException.class);
    }

    // ================================================================
    // PERMISSIONS TRANSITIONS
    // ================================================================

    @Test
    @DisplayName("DESIGNER peut freezer (tr-freeze), pas REVIEWER")
    void testTransitionPermissionFreeze() {
        asDesigner();
        String nodeId = createMinimalDocument();

        // Alice (designer) peut freezer
        String txId = txService.openTransaction(USER_ALICE);
        assertThatCode(() -> lifecycleService.applyTransition(nodeId, TR_FREEZE, USER_ALICE, txId))
            .doesNotThrowAnyException();

        // Tester directement la permission reviewer
        asReviewer();
        assertThatThrownBy(() -> policyService.assertTransition(TR_FREEZE))
            .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("REVIEWER peut releaser (tr-release), pas DESIGNER")
    void testTransitionPermissionRelease() {
        asDesigner();
        String nodeId = createMinimalDocument();

        // Designer freeze d'abord
        String txId = txService.openTransaction(USER_ALICE);
        lifecycleService.applyTransition(nodeId, TR_FREEZE, USER_ALICE, txId);
        txService.commitTransaction(txId, USER_ALICE, "Frozen", null);

        // Alice (designer) ne peut pas releaser
        asDesigner();
        assertThatThrownBy(() -> policyService.assertTransition(TR_RELEASE))
            .isInstanceOf(AccessDeniedException.class);

        // Bob (reviewer) peut releaser
        asReviewer();
        assertThatCode(() -> policyService.assertTransition(TR_RELEASE))
            .doesNotThrowAnyException();
    }

    // ================================================================
    // SIGNATURES
    // ================================================================

    @Test
    @DisplayName("REVIEWER peut signer, READER ne peut pas")
    void testSignaturePermissions() {
        asDesigner();
        String nodeId = createMinimalDocument();

        // Bob (reviewer) peut signer
        asReviewer();
        assertThatCode(() -> signatureService.sign(nodeId, USER_BOB, "Reviewed", null))
            .doesNotThrowAnyException();

        // Charlie (reader) ne peut pas signer — permission denied
        asReader();
        assertThatThrownBy(() -> signatureService.sign(nodeId, USER_CHARLIE, "Reviewed", null))
            .isInstanceOf(AccessDeniedException.class);
    }

    // ================================================================
    // VUES
    // ================================================================

    @Test
    @DisplayName("Vue REVIEWER en Frozen : reviewNote apparaît en premier (editable=false car can_write=false)")
    void testReviewerViewFrozen() {
        asDesigner();
        String nodeId = createMinimalDocument();

        String txId = txService.openTransaction(USER_ALICE);
        lifecycleService.applyTransition(nodeId, TR_FREEZE, USER_ALICE, txId);
        txService.commitTransaction(txId, USER_ALICE, "Frozen", null);

        // Bob (reviewer) consulte en Frozen → vue 'view-reviewer-frozen' active
        asReviewer();
        var desc = nodeService.buildObjectDescription(nodeId, USER_BOB, ROLE_REVIEWER);

        // reviewNote doit être visible et en premier (displayOrder=1 → sorted first)
        var reviewNote = desc.fields().stream()
            .filter(f -> "reviewNote".equals(f.name()))
            .findFirst();
        assertThat(reviewNote).isPresent();
        assertThat(desc.fields().get(0).name()).isEqualTo("reviewNote");

        // reviewer a can_write=false → editable=false même si la vue dit editable=true
        assertThat(reviewNote.get().editable()).isFalse();
    }

    @Test
    @DisplayName("Vue READER : reviewNote masquée quel que soit l'état")
    void testReaderViewHidesReviewNote() {
        asDesigner();
        String nodeId = createMinimalDocument();

        asReader();
        var desc = nodeService.buildObjectDescription(nodeId, USER_CHARLIE, ROLE_READER);

        // reviewNote masquée → absente du payload
        boolean reviewNotePresent = desc.fields().stream()
            .anyMatch(f -> "reviewNote".equals(f.name()));
        assertThat(reviewNotePresent).isFalse();
    }

    @Test
    @DisplayName("Vue DESIGNER en In Work : reviewNote invisible (règle état asr-iw-01)")
    void testDesignerViewInWorkHidesReviewNote() {
        asDesigner();
        String nodeId = createMinimalDocument();

        var desc = nodeService.buildObjectDescription(nodeId, USER_ALICE, ROLE_DESIGNER);

        // En Draft, reviewNote est invisible (AttributeStateRule asr-01)
        boolean reviewNotePresent = desc.fields().stream()
            .anyMatch(f -> "reviewNote".equals(f.name()));
        assertThat(reviewNotePresent).isFalse();
    }

    @Test
    @DisplayName("Payload canWrite = false pour REVIEWER → tous attributs readonly")
    void testPayloadReviewerAllReadonly() {
        asDesigner();
        String nodeId = createMinimalDocument();

        String txId = txService.openTransaction(USER_ALICE);
        lifecycleService.applyTransition(nodeId, TR_FREEZE, USER_ALICE, txId);
        txService.commitTransaction(txId, USER_ALICE, "Frozen", null);

        asReviewer();
        var desc = nodeService.buildObjectDescription(nodeId, USER_BOB, ROLE_REVIEWER);

        // Tous les attributs visibles doivent être readonly — reviewer a can_write=false
        // (globalCanWrite override appliqué par NodeController, pas par le service)
        // → le service retourne les flags tels que la vue les définit ; le controller les écrase
        // → ici on vérifie que la vue reviewer ne produit pas de champ editable sans override
        boolean anyEditable = desc.fields().stream().anyMatch(f -> f.editable());
        assertThat(anyEditable).isFalse();
    }

    @Test
    @DisplayName("Actions disponibles filtrées par rôle dans le payload")
    void testActionsFilteredByRole() {
        asDesigner();
        String nodeId = createMinimalDocument();

        // Designer en In Work : doit voir tr-freeze
        var descDesigner = nodeService.buildObjectDescription(nodeId, USER_ALICE, ROLE_DESIGNER);
        var actionsDesigner = actionService.resolveActionsForNode(
            nodeId,
            (String) descDesigner.metadata().get("nodeTypeId"),
            (String) descDesigner.metadata().get("state"),
            false, false);
        assertThat(actionsDesigner).anyMatch(a -> TR_FREEZE.equals(a.metadata().get("transitionId")));

        // Reader en Draft : all actions present but unauthorized (guardViolations non-empty)
        asReader();
        var descReader = nodeService.buildObjectDescription(nodeId, USER_CHARLIE, ROLE_READER);
        var actionsReader = actionService.resolveActionsForNode(
            nodeId,
            (String) descReader.metadata().get("nodeTypeId"),
            (String) descReader.metadata().get("state"),
            false, false);
        assertThat(actionsReader).isNotEmpty();
        assertThat(actionsReader).allMatch(a -> !a.guardViolations().isEmpty());
    }

    // ================================================================
    // ADMIN
    // ================================================================

    @Test
    @DisplayName("ADMIN peut tout faire sans restriction")
    void testAdminBypassesAllPermissions() {
        asAdmin();
        String nodeId = createMinimalDocument();

        // Admin peut modifier
        String txId = txService.openTransaction(USER_ADMIN);
        assertThatCode(() -> nodeService.modifyNode(nodeId, USER_ADMIN, txId,
            Map.of(AD_DOC_TITLE, "Admin edit"), "Admin edit"))
            .doesNotThrowAnyException();

        // Admin peut déclencher n'importe quelle transition
        assertThatCode(() -> policyService.assertTransition(TR_RELEASE))
            .doesNotThrowAnyException();
    }

    // ================================================================
    // Helpers
    // ================================================================

    private String createMinimalDocument() {
        String logicalId = "DOC-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        String nodeId = nodeService.createNode("ps-default", NT_DOCUMENT, USER_ALICE,
            logicalId, null);
        String txId = txService.findOpenTransaction(USER_ALICE);
        nodeService.modifyNode(nodeId, USER_ALICE, txId, Map.of(
            AD_DOC_TITLE,  "Test Document",
            AD_DOC_AUTHOR, "Alice",
            AD_DOC_CAT,    "Design"
        ), "Initial attributes");
        txService.commitTransaction(txId, USER_ALICE, "Initial creation", null);
        return nodeId;
    }

    private void asAdmin() {
        PlmSecurityContext.set(new PlmUserContext(
            USER_ADMIN, "admin", Set.of(ROLE_ADMIN), true));
        PlmProjectSpaceContext.set("ps-default");
    }

    private void asDesigner() {
        PlmSecurityContext.set(new PlmUserContext(
            USER_ALICE, "alice", Set.of(ROLE_DESIGNER), false));
        PlmProjectSpaceContext.set("ps-default");
    }

    private void asReviewer() {
        PlmSecurityContext.set(new PlmUserContext(
            USER_BOB, "bob", Set.of(ROLE_REVIEWER), false));
        PlmProjectSpaceContext.set("ps-default");
    }

    private void asReader() {
        PlmSecurityContext.set(new PlmUserContext(
            USER_CHARLIE, "charlie", Set.of(ROLE_READER), false));
        PlmProjectSpaceContext.set("ps-default");
    }
}
