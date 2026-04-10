package com.plm.api.controller;

import com.plm.domain.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * API REST pour les noeuds PLM.
 *
 * Convention pour les opérations d'authoring (modifyNode, transition, signature, lien) :
 *   - Le header X-PLM-Tx est OBLIGATOIRE et doit contenir un txId OPEN
 *   - La transaction est ouverte via POST /api/transactions avant d'appeler ces endpoints
 *   - La transaction est committée/annulée via POST /api/transactions/{id}/commit|rollback
 *
 * Opérations en lecture (GET) et création (POST /api/nodes) : pas de txId requis.
 */
@RestController
@RequestMapping("/api/nodes")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService       nodeService;
    private final LifecycleService  lifecycleService;
    private final LockService       lockService;
    private final PermissionService permissionService;

    // ── Création ──────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Map<String, String>> createNode(
        @RequestBody Map<String, Object> body
    ) {
        String nodeTypeId = (String) body.get("nodeTypeId");
        String userId     = (String) body.get("userId");
        @SuppressWarnings("unchecked")
        Map<String, String> attributes = (Map<String, String>) body.getOrDefault("attributes", Map.of());

        String nodeId = nodeService.createNode(nodeTypeId, userId, attributes);
        return ResponseEntity.ok(Map.of("nodeId", nodeId));
    }

    // ── Liste ─────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> listNodes() {
        return ResponseEntity.ok(nodeService.listNodes());
    }

    // ── Lecture (Server-Driven UI) ────────────────────────────────────

    /**
     * Retourne le payload UI complet.
     * txId optionnel : si fourni, montre la version OPEN de la transaction (si owner).
     */
    @GetMapping("/{nodeId}/description")
    public ResponseEntity<Map<String, Object>> getDescription(
        @PathVariable String nodeId,
        @RequestParam  String userId,
        @RequestParam(required = false) String txId
    ) {
        return ResponseEntity.ok(nodeService.buildObjectDescription(nodeId, userId, txId));
    }

    // ── Checkout — X-PLM-Tx obligatoire ──────────────────────────────

    /**
     * Ouvre un noeud en édition : acquiert le lock et crée une version OPEN
     * (copie exacte de la version courante) dans la transaction.
     * Idempotent : si le noeud est déjà checké-out dans cette tx, retourne la version existante.
     */
    @PostMapping("/{nodeId}/checkout")
    public ResponseEntity<Map<String, String>> checkoutNode(
        @PathVariable String nodeId,
        @RequestHeader("X-PLM-Tx") String txId,
        @RequestBody   Map<String, String> body
    ) {
        String userId    = body.get("userId");
        String versionId = nodeService.checkoutNode(nodeId, userId, txId);
        return ResponseEntity.ok(Map.of("versionId", versionId, "txId", txId));
    }

    // ── Modification — X-PLM-Tx obligatoire ──────────────────────────

    @PutMapping("/{nodeId}")
    public ResponseEntity<Map<String, String>> modifyNode(
        @PathVariable String nodeId,
        @RequestHeader("X-PLM-Tx") String txId,
        @RequestBody   Map<String, Object> body
    ) {
        String userId = (String) body.get("userId");
        @SuppressWarnings("unchecked")
        Map<String, String> attributes = (Map<String, String>) body.getOrDefault("attributes", Map.of());
        String description = (String) body.getOrDefault("description", "");

        String versionId = nodeService.modifyNode(nodeId, userId, txId, attributes, description);
        return ResponseEntity.ok(Map.of("versionId", versionId, "txId", txId));
    }

    // ── Transitions — X-PLM-Tx obligatoire ───────────────────────────

    @PostMapping("/{nodeId}/transitions/{transitionId}")
    public ResponseEntity<Map<String, String>> applyTransition(
        @PathVariable  String nodeId,
        @PathVariable  String transitionId,
        @RequestHeader("X-PLM-Tx") String txId,
        @RequestBody   Map<String, String> body
    ) {
        String userId = body.get("userId");
        permissionService.assertCanTransition(transitionId);
        String versionId = lifecycleService.applyTransition(nodeId, transitionId, userId, txId);
        return ResponseEntity.ok(Map.of("versionId", versionId, "txId", txId));
    }

    @GetMapping("/{nodeId}/transitions")
    public ResponseEntity<?> getAvailableTransitions(@PathVariable String nodeId) {
        return ResponseEntity.ok(lifecycleService.getAvailableTransitions(nodeId));
    }

    // ── Liens — X-PLM-Tx obligatoire ─────────────────────────────────

    @PostMapping("/links")
    public ResponseEntity<Map<String, String>> createLink(
        @RequestHeader("X-PLM-Tx") String txId,
        @RequestBody   Map<String, Object> body
    ) {
        String linkId = nodeService.createLink(
            (String) body.get("linkTypeId"),
            (String) body.get("sourceNodeId"),
            (String) body.get("targetNodeId"),
            (String) body.get("pinnedVersionId"),
            (String) body.get("userId"),
            txId
        );
        return ResponseEntity.ok(Map.of("linkId", linkId, "txId", txId));
    }

    // ── Historique des versions ───────────────────────────────────────

    @GetMapping("/{nodeId}/versions")
    public ResponseEntity<?> getVersionHistory(@PathVariable String nodeId) {
        return ResponseEntity.ok(nodeService.getVersionHistory(nodeId));
    }

    // ── Lock info ─────────────────────────────────────────────────────

    @GetMapping("/{nodeId}/lock")
    public ResponseEntity<?> getLockInfo(@PathVariable String nodeId) {
        LockService.LockInfo info = lockService.getLockInfo(nodeId);
        return ResponseEntity.ok(Map.of(
            "locked",   info.locked(),
            "lockedBy", info.lockedBy() != null ? info.lockedBy() : "",
            "txId",     info.txId() != null ? info.txId() : ""
        ));
    }

}
