package com.plm.api.controller;

import com.plm.domain.security.SecurityContextPort;
import com.plm.domain.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Tableau de bord utilisateur — deux endpoints distincts pour chargement parallèle.
 *
 *   GET /api/psm/dashboard/transaction  → résumé tx OPEN courante
 *   GET /api/psm/dashboard/workitems    → noeuds sur lesquels l'utilisateur peut agir
 */
@RestController
@RequestMapping("/api/psm/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService    dashboardService;
    private final SecurityContextPort secCtx;

    /**
     * Résumé de la transaction OPEN courante.
     * Retourne 204 si aucune transaction ouverte.
     */
    @GetMapping("/transaction")
    public ResponseEntity<?> getOpenTransaction() {
        String userId = secCtx.currentUser().getUserId();
        var summary = dashboardService.getOpenTransactionSummary(userId);
        return summary != null
            ? ResponseEntity.ok(summary)
            : ResponseEntity.noContent().build();
    }

    /**
     * Derniers noeuds modifiés sur lesquels l'utilisateur a au moins une action disponible,
     * triés par nombre d'actions décroissant.
     */
    @GetMapping("/workitems")
    public ResponseEntity<?> getWorkItems() {
        String userId = secCtx.currentUser().getUserId();
        return ResponseEntity.ok(dashboardService.getWorkItems(userId));
    }
}
