package com.plm.api.controller;

import com.plm.domain.action.ActionDispatcher;
import com.plm.domain.action.ActionResult;
import com.plm.domain.service.*;
import com.plm.infrastructure.security.PlmProjectSpaceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * API REST pour les noeuds PLM.
 *
 * Toutes les opérations d'écriture (checkout, modification, transition, signature, lien)
 * passent exclusivement par l'endpoint générique :
 *
 *   POST /api/nodes/{nodeId}/actions/{nodeTypeActionId}
 *   Header: X-PLM-Tx (requis si l'action a requires_tx = true)
 *   Body:   { "userId": "...", "parameters": { ... } }
 *
 * L'identifiant nodeTypeActionId est l'id de node_type_action, obtenu via
 * GET /api/nodes/{nodeId}/description (champ actions[].id dans le payload UI).
 *
 * Opérations en lecture (GET) et création (POST /api/nodes) : pas de txId requis.
 */
@RestController
@RequestMapping("/api/psm/nodes")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService       nodeService;
    private final LockService       lockService;
    private final SignatureService  signatureService;
    private final ActionDispatcher  actionDispatcher;

    // ── Création ──────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Map<String, String>> createNode(
        @RequestBody Map<String, Object> body
    ) {
        String projectSpaceId = PlmProjectSpaceContext.require();
        String nodeTypeId = (String) body.get("nodeTypeId");
        String userId     = (String) body.get("userId");
        String logicalId  = (String) body.get("logicalId");
        String externalId = (String) body.get("externalId");
        @SuppressWarnings("unchecked")
        Map<String, String> attributes = (Map<String, String>) body.getOrDefault("attributes", Map.of());

        String nodeId = nodeService.createNode(projectSpaceId, nodeTypeId, userId, attributes,
                                               logicalId, externalId);
        return ResponseEntity.ok(Map.of("nodeId", nodeId));
    }

    // ── Liste ─────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> listNodes() {
        return ResponseEntity.ok(nodeService.listNodes(PlmProjectSpaceContext.require()));
    }

    // ── Lecture (Server-Driven UI) ────────────────────────────────────

    /**
     * Retourne le payload UI complet (attributs, actions disponibles, état, lock…).
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

    // ── Liens — lecture ───────────────────────────────────────────────

    @GetMapping("/{nodeId}/links/children")
    public ResponseEntity<?> getChildLinks(@PathVariable String nodeId) {
        return ResponseEntity.ok(nodeService.getChildLinks(nodeId));
    }

    @GetMapping("/{nodeId}/links/parents")
    public ResponseEntity<?> getParentLinks(@PathVariable String nodeId) {
        return ResponseEntity.ok(nodeService.getParentLinks(nodeId));
    }

    // ── Historique des versions ───────────────────────────────────────

    @GetMapping("/{nodeId}/versions")
    public ResponseEntity<?> getVersionHistory(@PathVariable String nodeId) {
        return ResponseEntity.ok(nodeService.getVersionHistory(nodeId));
    }

    @GetMapping("/{nodeId}/versions/diff")
    public ResponseEntity<?> getVersionDiff(
            @PathVariable String nodeId,
            @RequestParam int v1,
            @RequestParam int v2) {
        return ResponseEntity.ok(nodeService.getVersionDiff(nodeId, v1, v2));
    }

    // ── Lock info ─────────────────────────────────────────────────────

    @GetMapping("/{nodeId}/lock")
    public ResponseEntity<?> getLockInfo(@PathVariable String nodeId) {
        LockService.LockInfo info = lockService.getLockInfo(nodeId);
        return ResponseEntity.ok(Map.of(
            "locked",   info.locked(),
            "lockedBy", info.lockedBy() != null ? info.lockedBy() : ""
        ));
    }

    // ── Signatures — lecture ──────────────────────────────────────────

    @GetMapping("/{nodeId}/signatures")
    public ResponseEntity<?> getSignatures(@PathVariable String nodeId) {
        return ResponseEntity.ok(signatureService.getSignaturesForCurrentIteration(nodeId));
    }

    @GetMapping("/{nodeId}/signatures/history")
    public ResponseEntity<?> getSignatureHistory(@PathVariable String nodeId) {
        return ResponseEntity.ok(signatureService.getFullSignatureHistory(nodeId));
    }

    // ── Actions (seul point d'entrée pour toutes les écritures) ───────

    @PostMapping("/{nodeId}/actions/{nodeTypeActionId}")
    public ResponseEntity<?> executeAction(
        @PathVariable  String nodeId,
        @PathVariable  String nodeTypeActionId,
        @RequestHeader(value = "X-PLM-Tx", required = false) String txId,
        @RequestBody   Map<String, Object> body
    ) {
        String userId = (String) body.get("userId");
        @SuppressWarnings("unchecked")
        Map<String, String> params = (Map<String, String>) body.getOrDefault("parameters", Map.of());

        String currentStateId = nodeService.getCurrentStateId(nodeId, txId);

        ActionResult result = actionDispatcher.dispatch(
            nodeTypeActionId, nodeId, currentStateId, userId, txId, params);
        return ResponseEntity.ok(result.data());
    }

}
