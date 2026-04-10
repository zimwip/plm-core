package com.plm;

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

    @Autowired DSLContext       dsl;
    @Autowired NodeService      nodeService;
    @Autowired PermissionService permissionService;
    @Autowired LifecycleService lifecycleService;
    @Autowired SignatureService  signatureService;
    @Autowired VersionService   versionService;

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

    static final String ST_DRAFT    = "st-draft";
    static final String ST_INREVIEW = "st-inreview";
    static final String ST_RELEASED = "st-released";

    static final String TR_SUBMIT  = "tr-submit";
    static final String TR_APPROVE = "tr-approve";
    static final String TR_REJECT  = "tr-reject";

    static final String AD_DOC_NUMBER  = "ad-doc-number";
    static final String AD_DOC_TITLE   = "ad-doc-title";
    static final String AD_DOC_AUTHOR  = "ad-doc-author";
    static final String AD_DOC_CAT     = "ad-doc-cat";
    static final String AD_DOC_REVIEW  = "ad-doc-review";

    @AfterEach
    void clearContext() {
        PlmSecurityContext.clear();
    }

    // ================================================================
    // PERMISSIONS NODETYPES
    // ================================================================

    @Test
    @DisplayName("DESIGNER peut lire et écrire un Document")
    void testDesignerCanWrite() {
        asDesigner();
        String nodeId = nodeService.createNode(NT_DOCUMENT, USER_ALICE, Map.of(
            AD_DOC_NUMBER, "DOC-0001",
            AD_DOC_TITLE,  "My Document",
            AD_DOC_AUTHOR, "Alice",
            AD_DOC_CAT,    "Design"
        ));

        assertThatCode(() -> nodeService.modifyNode(nodeId, USER_ALICE,
            Map.of(AD_DOC_TITLE, "Updated Title"), "Fix title"))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("REVIEWER ne peut pas modifier un Document")
    void testReviewerCannotWrite() {
        // Alice crée le noeud
        asDesigner();
        String nodeId = nodeService.createNode(NT_DOCUMENT, USER_ALICE, Map.of(
            AD_DOC_NUMBER, "DOC-0002", AD_DOC_TITLE, "Doc", AD_DOC_AUTHOR, "Alice", AD_DOC_CAT, "Test"
        ));

        // Bob (reviewer) essaie de modifier
        asReviewer();
        assertThatThrownBy(() -> nodeService.modifyNode(nodeId, USER_BOB,
            Map.of(AD_DOC_TITLE, "Hacked"), "Hack"))
            .isInstanceOf(PermissionService.AccessDeniedException.class);
    }

    @Test
    @DisplayName("READER peut lire mais pas écrire")
    void testReaderCanOnlyRead() {
        asDesigner();
        String nodeId = nodeService.createNode(NT_DOCUMENT, USER_ALICE, Map.of(
            AD_DOC_NUMBER, "DOC-0003", AD_DOC_TITLE, "Doc", AD_DOC_AUTHOR, "Alice", AD_DOC_CAT, "Test"
        ));

        asReader();
        // Lecture OK
        assertThatCode(() -> nodeService.buildObjectDescription(nodeId, USER_CHARLIE, ROLE_READER))
            .doesNotThrowAnyException();

        // Écriture KO
        assertThatThrownBy(() -> nodeService.modifyNode(nodeId, USER_CHARLIE, Map.of(), ""))
            .isInstanceOf(PermissionService.AccessDeniedException.class);
    }

    // ================================================================
    // PERMISSIONS TRANSITIONS
    // ================================================================

    @Test
    @DisplayName("DESIGNER peut soumettre (tr-submit), pas REVIEWER")
    void testTransitionPermissionSubmit() {
        asDesigner();
        String nodeId = createMinimalDocument("DOC-0010");

        // Alice (designer) peut soumettre
        assertThatCode(() -> lifecycleService.applyTransition(nodeId, TR_SUBMIT, USER_ALICE))
            .doesNotThrowAnyException();

        // Remettre en Draft et tester avec reviewer
        // (simulation : on teste directement la permission)
        asReviewer();
        assertThatThrownBy(() -> permissionService.assertCanTransition(TR_SUBMIT))
            .isInstanceOf(PermissionService.AccessDeniedException.class);
    }

    @Test
    @DisplayName("REVIEWER peut approuver (tr-approve), pas DESIGNER")
    void testTransitionPermissionApprove() {
        asDesigner();
        String nodeId = createMinimalDocument("DOC-0011");
        lifecycleService.applyTransition(nodeId, TR_SUBMIT, USER_ALICE);

        // Alice (designer) ne peut pas approuver
        asDesigner();
        assertThatThrownBy(() -> permissionService.assertCanTransition(TR_APPROVE))
            .isInstanceOf(PermissionService.AccessDeniedException.class);

        // Bob (reviewer) peut approuver
        asReviewer();
        assertThatCode(() -> permissionService.assertCanTransition(TR_APPROVE))
            .doesNotThrowAnyException();
    }

    // ================================================================
    // SIGNATURES
    // ================================================================

    @Test
    @DisplayName("REVIEWER peut signer, READER ne peut pas")
    void testSignaturePermissions() {
        asDesigner();
        String nodeId = createMinimalDocument("DOC-0020");

        // Bob (reviewer) peut signer
        asReviewer();
        assertThatCode(() -> signatureService.sign(nodeId, USER_BOB, "Reviewed", null))
            .doesNotThrowAnyException();

        // Charlie (reader) ne peut pas signer
        asReader();
        assertThatThrownBy(() -> signatureService.sign(nodeId, USER_CHARLIE, "Reviewed", null))
            .isInstanceOf(PermissionService.AccessDeniedException.class);
    }

    // ================================================================
    // VUES
    // ================================================================

    @Test
    @DisplayName("Vue REVIEWER en InReview : reviewNote apparaît en premier")
    void testReviewerViewInReview() {
        asDesigner();
        String nodeId = createMinimalDocument("DOC-0030");
        lifecycleService.applyTransition(nodeId, TR_SUBMIT, USER_ALICE);

        // Bob (reviewer) consulte en InReview → vue 'view-reviewer-inreview' active
        asReviewer();
        var desc = nodeService.buildObjectDescription(nodeId, USER_BOB, ROLE_REVIEWER);

        @SuppressWarnings("unchecked")
        var attributes = (List<Map<String, Object>>) desc.get("attributes");

        // reviewNote doit être visible et en premier (displayOrder=1)
        var reviewNote = attributes.stream()
            .filter(a -> "reviewNote".equals(a.get("name")))
            .findFirst();
        assertThat(reviewNote).isPresent();
        assertThat(reviewNote.get().get("visible")).isEqualTo(true);
        assertThat(reviewNote.get().get("displayOrder")).isEqualTo(1);

        // reviewNote éditable pour reviewer en InReview
        assertThat(reviewNote.get().get("editable")).isEqualTo(true);
    }

    @Test
    @DisplayName("Vue READER : reviewNote masquée quel que soit l'état")
    void testReaderViewHidesReviewNote() {
        asDesigner();
        String nodeId = createMinimalDocument("DOC-0031");

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
    @DisplayName("Vue DESIGNER en Draft : reviewNote invisible (règle état)")
    void testDesignerViewDraftHidesReviewNote() {
        asDesigner();
        String nodeId = createMinimalDocument("DOC-0032");

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
        String nodeId = createMinimalDocument("DOC-0033");
        lifecycleService.applyTransition(nodeId, TR_SUBMIT, USER_ALICE);

        asReviewer();
        var desc = nodeService.buildObjectDescription(nodeId, USER_BOB, ROLE_REVIEWER);

        assertThat(desc.get("canWrite")).isEqualTo(false);

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
        String nodeId = createMinimalDocument("DOC-0040");

        // Designer en Draft : doit voir tr-submit
        var descDesigner = nodeService.buildObjectDescription(nodeId, USER_ALICE, ROLE_DESIGNER);
        @SuppressWarnings("unchecked")
        var actionsDesigner = (List<Map<String, Object>>) descDesigner.get("actions");
        assertThat(actionsDesigner).anyMatch(a -> TR_SUBMIT.equals(a.get("id")));

        // Reader en Draft : aucune action (can_transition=false)
        asReader();
        var descReader = nodeService.buildObjectDescription(nodeId, USER_CHARLIE, ROLE_READER);
        @SuppressWarnings("unchecked")
        var actionsReader = (List<Map<String, Object>>) descReader.get("actions");
        assertThat(actionsReader).isEmpty();
    }

    // ================================================================
    // ADMIN
    // ================================================================

    @Test
    @DisplayName("ADMIN peut tout faire sans restriction")
    void testAdminBypassesAllPermissions() {
        asAdmin();
        String nodeId = createMinimalDocument("DOC-0050");

        // Admin peut modifier
        assertThatCode(() -> nodeService.modifyNode(nodeId, USER_ADMIN,
            Map.of(AD_DOC_TITLE, "Admin edit"), "Admin edit"))
            .doesNotThrowAnyException();

        // Admin peut déclencher n'importe quelle transition
        assertThatCode(() -> permissionService.assertCanTransition(TR_APPROVE))
            .doesNotThrowAnyException();
    }

    // ================================================================
    // Helpers
    // ================================================================

    private String createMinimalDocument(String number) {
        return nodeService.createNode(NT_DOCUMENT, USER_ALICE, Map.of(
            AD_DOC_NUMBER, number,
            AD_DOC_TITLE,  "Test Document",
            AD_DOC_AUTHOR, "Alice",
            AD_DOC_CAT,    "Design"
        ));
    }

    private void asAdmin() {
        PlmSecurityContext.set(new PlmUserContext(
            USER_ADMIN, "admin", Set.of(ROLE_ADMIN), true));
    }

    private void asDesigner() {
        PlmSecurityContext.set(new PlmUserContext(
            USER_ALICE, "alice", Set.of(ROLE_DESIGNER), false));
    }

    private void asReviewer() {
        PlmSecurityContext.set(new PlmUserContext(
            USER_BOB, "bob", Set.of(ROLE_REVIEWER), false));
    }

    private void asReader() {
        PlmSecurityContext.set(new PlmUserContext(
            USER_CHARLIE, "charlie", Set.of(ROLE_READER), false));
    }
}
