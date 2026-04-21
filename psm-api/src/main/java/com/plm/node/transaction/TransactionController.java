package com.plm.node.transaction;

import com.plm.action.internal.ActionDispatcher;
import com.plm.shared.action.ActionResult;
import com.plm.shared.security.SecurityContextPort;
import com.plm.node.transaction.internal.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * API REST pour la gestion des transactions PLM.
 *
 * Flux typique :
 *
 *   [optionnel] POST /api/transactions         → ouvre une tx explicitement
 *               PUT  /api/nodes/{id}            → modifie (checkin auto si pas de tx)
 *               PUT  /api/nodes/{id}            → autre modif dans la même tx
 *               POST /api/transactions/{id}/commit   → commit avec commentaire
 *
 *   ou :
 *               POST /api/transactions/{id}/rollback → annule tout
 */
@RestController
@RequestMapping("/api/psm/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final PlmTransactionService txService;
    private final SecurityContextPort   secCtx;
    private final ActionDispatcher      actionDispatcher;

    // ── Ouvrir une transaction explicitement ──────────────────────────

    @PostMapping
    public ResponseEntity<Map<String, String>> openTransaction() {
        String userId = secCtx.currentUser().getUserId();
        String txId   = txService.openTransaction(userId);
        return ResponseEntity.ok(Map.of("txId", txId));
    }

    // ── TX-scope action dispatch ─────────────────────────────────────

    @PostMapping("/{txId}/actions/{actionCode}")
    public ResponseEntity<?> executeTransactionAction(
        @PathVariable String txId,
        @PathVariable String actionCode,
        @RequestBody Map<String, Object> body
    ) {
        String userId = secCtx.currentUser().getUserId();
        @SuppressWarnings("unchecked")
        Map<String, Object> paramMap = (Map<String, Object>) body.getOrDefault("parameters", Map.of());
        Map<String, String> params = paramMap.entrySet().stream()
            .collect(Collectors.toMap(Map.Entry::getKey, e -> String.valueOf(e.getValue())));

        ActionResult result = actionDispatcher.dispatch(
            actionCode, null, null, null, userId, txId, params);

        return ResponseEntity.ok(result.data());
    }

    // ── Consulter une transaction ─────────────────────────────────────

    @GetMapping("/{txId}")
    public ResponseEntity<?> getTransaction(@PathVariable String txId) {
        return ResponseEntity.ok(txService.getTransaction(txId));
    }

    @GetMapping
    public ResponseEntity<?> listTransactions(
        @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(txService.listTransactions(limit));
    }

    // ── Versions incluses dans la transaction ─────────────────────────

    @GetMapping("/{txId}/versions")
    public ResponseEntity<?> getVersions(@PathVariable String txId) {
        return ResponseEntity.ok(txService.getTransactionVersions(txId));
    }

    // ── Noeuds modifiés dans la transaction (1 entrée par noeud) ─────

    @GetMapping("/{txId}/nodes")
    public ResponseEntity<?> getTransactionNodes(@PathVariable String txId) {
        return ResponseEntity.ok(txService.getTransactionNodes(txId));
    }

    // ── Release specific nodes from an open transaction ───────────────

    @PostMapping("/{txId}/release")
    public ResponseEntity<Map<String, String>> releaseNodes(
        @PathVariable String txId,
        @RequestBody  Map<String, Object> body
    ) {
        String userId = secCtx.currentUser().getUserId();
        @SuppressWarnings("unchecked")
        List<String> nodeIds = (List<String>) body.get("nodeIds");
        txService.releaseNodes(txId, userId, nodeIds);
        return ResponseEntity.ok(Map.of("status", "RELEASED", "txId", txId));
    }

    // ── Statut de la transaction courante de l'utilisateur ───────────
    // Résolu depuis le header X-PLM-User (via PlmSecurityContext).
    // Retourne 204 No Content si aucune transaction OPEN n'existe pour cet utilisateur.

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentTransaction() {
        String userId = secCtx.currentUser().getUserId();
        String txId   = txService.findOpenTransaction(userId);
        if (txId == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(txService.getTransaction(txId));
    }

}
