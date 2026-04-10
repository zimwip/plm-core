package com.plm.api.controller;

import com.plm.domain.service.LockService;
import com.plm.domain.service.PermissionService;
import com.plm.domain.service.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final PlmTransactionService txService;

    // ── Ouvrir une transaction explicitement ──────────────────────────

    @PostMapping
    public ResponseEntity<Map<String, String>> openTransaction(
        @RequestBody Map<String, String> body
    ) {
        String userId = body.get("userId");
        String title  = body.getOrDefault("title", "");
        String txId   = txService.openTransaction(userId, title);
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

    // ── Commit ────────────────────────────────────────────────────────

    @PostMapping("/{txId}/commit")
    public ResponseEntity<Map<String, String>> commit(
        @PathVariable String txId,
        @RequestBody  Map<String, String> body
    ) {
        String userId  = body.get("userId");
        String comment = body.get("comment");
        txService.commitTransaction(txId, userId, comment);
        return ResponseEntity.ok(Map.of("status", "COMMITTED", "txId", txId));
    }

    // ── Rollback ──────────────────────────────────────────────────────

    @PostMapping("/{txId}/rollback")
    public ResponseEntity<Map<String, String>> rollback(
        @PathVariable String txId,
        @RequestBody  Map<String, String> body
    ) {
        String userId = body.get("userId");
        txService.rollbackTransaction(txId, userId);
        return ResponseEntity.ok(Map.of("status", "ROLLEDBACK", "txId", txId));
    }

    // ── Statut de la transaction courante de l'utilisateur ───────────

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentTransaction(@RequestParam String userId) {
        String txId = txService.findOpenTransaction(userId);
        if (txId == null) {
            return ResponseEntity.ok(Map.of("status", "NONE"));
        }
        return ResponseEntity.ok(txService.getTransaction(txId));
    }

}
