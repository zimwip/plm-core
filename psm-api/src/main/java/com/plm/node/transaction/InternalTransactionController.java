package com.plm.node.transaction;

import com.plm.node.NodeService;
import com.plm.node.transaction.internal.PlmTransactionService;
import com.plm.platform.auth.JwtVerifier;
import com.plm.shared.security.PlmSecurityContext;
import com.plm.shared.security.PsmAuthContextBinder;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.jooq.Record;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * S2S-only (X-Service-Secret) transaction interface consumed by platform-api
 * to federate transactions across services. Mirrors the public TransactionController
 * semantics but speaks a normalized cross-service DTO vocabulary.
 *
 * Security: PlmAuthFilter validates X-Service-Secret on /internal/**. This
 * controller additionally decodes the forwarded JWT to populate the PLM user
 * context so service-layer permission checks work correctly.
 */
@RestController
@RequestMapping("/internal/transactions")
@RequiredArgsConstructor
public class InternalTransactionController {

    // ── DTOs ──────────────────────────────────────────────────────────

    public record TxItem(
        String itemId,
        String label,
        String changeType,
        String logicalId,
        String revision,
        int iteration,
        String nodeTypeId,
        String nodeTypeName,
        String lifecycleStateId
    ) {}

    public record TxSummary(
        String serviceCode, String txId, String status, String ownerId,
        String createdAt, int itemCount
    ) {}

    public record TxDetail(
        String serviceCode, String txId, String status, String ownerId,
        String createdAt, List<TxItem> items
    ) {}

    public record AddItemRequest(String itemRef, Map<String, String> parameters) {}

    public record CommitRequest(String comment, List<String> itemIds) {}

    public record RemoveItemsRequest(List<String> itemIds) {}

    // ── Dependencies ──────────────────────────────────────────────────

    private final PlmTransactionService txService;
    private final NodeService nodeService;
    private final JwtVerifier jwtVerifier;
    private final PsmAuthContextBinder authContextBinder;

    // ── Endpoints ─────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<TxSummary>> listTransactions(
        @RequestParam(required = false) String status,
        HttpServletRequest req
    ) {
        bindContext(req);
        try {
            String userId = PlmSecurityContext.get().getUserId();
            if ("OPEN".equals(status)) {
                String txId = txService.findOpenTransaction(userId);
                if (txId == null) return ResponseEntity.ok(List.of());
                return ResponseEntity.ok(List.of(buildSummary(txId)));
            }
            return ResponseEntity.ok(
                txService.listTransactions(50).stream()
                    .map(r -> buildSummary(r.get("id", String.class)))
                    .toList()
            );
        } finally {
            authContextBinder.clear();
        }
    }

    @GetMapping("/{txId}")
    public ResponseEntity<TxDetail> getTransaction(
        @PathVariable String txId, HttpServletRequest req
    ) {
        bindContext(req);
        try {
            return ResponseEntity.ok(buildDetail(txId));
        } finally {
            authContextBinder.clear();
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> openTransaction(HttpServletRequest req) {
        bindContext(req);
        try {
            String userId = PlmSecurityContext.get().getUserId();
            String existing = txService.findOpenTransaction(userId);
            String txId = existing != null ? existing : txService.openTransaction(userId);
            return ResponseEntity.ok(Map.of("txId", txId));
        } finally {
            authContextBinder.clear();
        }
    }

    @PostMapping("/{txId}/commit")
    public ResponseEntity<Map<String, Object>> commit(
        @PathVariable String txId,
        @RequestBody CommitRequest body,
        HttpServletRequest req
    ) {
        bindContext(req);
        try {
            String userId = PlmSecurityContext.get().getUserId();
            String continuationTxId = txService.commitTransaction(txId, userId, body.comment(), body.itemIds());
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("txId", txId);
            if (continuationTxId != null) resp.put("continuationTxId", continuationTxId);
            return ResponseEntity.ok(resp);
        } finally {
            authContextBinder.clear();
        }
    }

    @PostMapping("/{txId}/rollback")
    public ResponseEntity<Map<String, String>> rollback(
        @PathVariable String txId, HttpServletRequest req
    ) {
        bindContext(req);
        try {
            String userId = PlmSecurityContext.get().getUserId();
            txService.rollbackTransaction(txId, userId);
            return ResponseEntity.ok(Map.of("txId", txId, "status", "ROLLED_BACK"));
        } finally {
            authContextBinder.clear();
        }
    }

    @PostMapping("/{txId}/items")
    public ResponseEntity<Map<String, String>> addItem(
        @PathVariable String txId,
        @RequestBody AddItemRequest body,
        HttpServletRequest req
    ) {
        bindContext(req);
        try {
            String userId = PlmSecurityContext.get().getUserId();
            String versionId = nodeService.checkout(body.itemRef(), userId, txId);
            return ResponseEntity.ok(Map.of(
                "txId", txId,
                "itemId", body.itemRef(),
                "versionId", versionId
            ));
        } finally {
            authContextBinder.clear();
        }
    }

    @DeleteMapping("/{txId}/items")
    public ResponseEntity<Map<String, String>> removeItems(
        @PathVariable String txId,
        @RequestBody RemoveItemsRequest body,
        HttpServletRequest req
    ) {
        bindContext(req);
        try {
            String userId = PlmSecurityContext.get().getUserId();
            txService.releaseNodes(txId, userId, body.itemIds());
            return ResponseEntity.ok(Map.of("txId", txId, "status", "RELEASED"));
        } finally {
            authContextBinder.clear();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private void bindContext(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return;
        // Forward JWTs now carry roleIds/perms/ps as claims — trust them directly.
        jwtVerifier.verify(auth.substring(7).trim())
            .ifPresent(p -> authContextBinder.bind(p, req));
    }

    private TxSummary buildSummary(String txId) {
        Record r = txService.getTransaction(txId);
        int itemCount = txService.getTransactionNodes(txId).size();
        return new TxSummary(
            "psm",
            txId,
            r.get("status", String.class),
            r.get("owner_id", String.class),
            String.valueOf(r.get("created_at")),
            itemCount
        );
    }

    private TxDetail buildDetail(String txId) {
        Record r = txService.getTransaction(txId);
        List<TxItem> items = txService.getTransactionNodes(txId).stream()
            .map(m -> {
                String logicalId = (String) m.get("logical_id");
                String revision  = (String) m.get("revision");
                Number iterNum   = (Number) m.get("iteration");
                int iteration    = iterNum != null ? iterNum.intValue() : 0;
                String label     = logicalId + " / " + revision + "." + iteration;
                return new TxItem(
                    (String) m.get("node_id"),
                    label,
                    (String) m.get("change_type"),
                    logicalId,
                    revision,
                    iteration,
                    (String) m.get("node_type_id"),
                    (String) m.get("node_type_name"),
                    (String) m.get("lifecycle_state_id")
                );
            })
            .toList();
        return new TxDetail(
            "psm",
            txId,
            r.get("status", String.class),
            r.get("owner_id", String.class),
            String.valueOf(r.get("created_at")),
            items
        );
    }
}
