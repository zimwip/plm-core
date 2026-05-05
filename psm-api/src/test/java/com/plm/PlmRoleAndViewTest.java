package com.plm;

import com.plm.shared.exception.AccessDeniedException;
import com.plm.shared.security.PlmUserContext;
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

        @SuppressWarnings("unchecked")
        var attributes = (List<Map<String, Object>>) desc.get("attributes");

        // reviewNote doit être visible et en premier (displayOrder=1)
        var reviewNote = attributes.stream()
            .filter(a -> "reviewNote".equals(a.get("name")))
            .findFirst();
        // Presence in the list means visible=true (invisible attributes are filtered out)
        assertThat(reviewNote).isPresent();
        assertThat(reviewNote.get().get("displayOrder")).isEqualTo(1);

        // reviewer a can_write=false → editable=false même si la vue dit editable=true
        assertThat(reviewNote.get().get("editable")).isEqualTo(false);
    }

    @Test
    @DisplayName("Vue READER : reviewNote masquée quel que soit l'état")
    void testReaderViewHidesReviewNote() {
        asDesigner();
        String nodeId = createMinimalDocument();

        asReader();
        var desc = nodeService.buildObjectDescription(nodeId, USER_CHARLIE, ROLE_READER);

        @SuppressWarnings("unchecked")
        var attributes = (List<Map<String, Object>>) desc.get("attributes");

        // reviewNote masquée → absente du payload
        boolean reviewNotePresent = attributes.stream()
            .anyMatch(a -> "reviewNote".equals(a.get("name")));
        assertThat(reviewNotePresent).isFalse();
    }

    @Test
    @DisplayName("Vue DESIGNER en In Work : reviewNote invisible (règle état asr-iw-01)")
    void testDesignerViewInWorkHidesReviewNote() {
        asDesigner();
        String nodeId = createMinimalDocument();

        var desc = nodeService.buildObjectDescription(nodeId, USER_ALICE, ROLE_DESIGNER);

        @SuppressWarnings("unchecked")
        var attributes = (List<Map<String, Object>>) desc.get("attributes");

        // En Draft, reviewNote est invisible (AttributeStateRule asr-01)
        boolean reviewNotePresent = attributes.stream()
            .anyMatch(a -> "reviewNote".equals(a.get("name")));
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

        @SuppressWarnings("unchecked")
        var attributes = (List<Map<String, Object>>) desc.get("attributes");

        // Tous les attributs visibles doivent être readonly SAUF reviewNote
        // (car reviewer peut éditer reviewNote, mais can_write=false l'emporte)
        // → en fait la règle est : finalEditable = globalCanWrite && viewEditable
        //   reviewer a can_write=false donc TOUT est readonly dans le payload
        boolean anyEditable = attributes.stream()
            .anyMatch(a -> Boolean.TRUE.equals(a.get("editable")));
        assertThat(anyEditable).isFalse();
    }

    @Test
    @DisplayName("Actions disponibles filtrées par rôle dans le payload")
    void testActionsFilteredByRole() {
        asDesigner();
        String nodeId = createMinimalDocument();

        // Designer en In Work : doit voir tr-freeze
        var descDesigner = nodeService.buildObjectDescription(nodeId, USER_ALICE, ROLE_DESIGNER);
        @SuppressWarnings("unchecked")
        var actionsDesigner = (List<Map<String, Object>>) descDesigner.get("actions");
        // The action ID is now the node_type_action id; the transition is referenced via transitionId
        assertThat(actionsDesigner).anyMatch(a -> TR_FREEZE.equals(a.get("transitionId")));

        // Reader en Draft : all actions present but unauthorized (authorized=false)
        asReader();
        var descReader = nodeService.buildObjectDescription(nodeId, USER_CHARLIE, ROLE_READER);
        @SuppressWarnings("unchecked")
        var actionsReader = (List<Map<String, Object>>) descReader.get("actions");
        assertThat(actionsReader).isNotEmpty();
        assertThat(actionsReader).allMatch(a -> Boolean.FALSE.equals(a.get("authorized")));
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
