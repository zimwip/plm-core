package com.plm.node.transaction;

import com.plm.shared.security.SecurityContextPort;
import com.plm.node.transaction.internal.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * API REST pour la gestion des transactions PLM.
 *
 * Commit/rollback passent par le ActionController central :
 *   POST /api/psm/actions/COMMIT/{txId}
 *   POST /api/psm/actions/ROLLBACK/{txId}
 *
 * Ce contrôleur gère les opérations de consultation et d'ouverture.
 */
@RestController
@RequestMapping("/api/psm/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final PlmTransactionService txService;
    private final SecurityContextPort   secCtx;

    // ── Ouvrir une transaction explicitement ──────────────────────────

    @PostMapping
    public ResponseEntity<Map<String, String>> openTransaction() {
        String userId = secCtx.currentUser().getUserId();
        String txId   = txService.openTransaction(userId);
        return ResponseEntity.ok(Map.of("txId", txId));
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
