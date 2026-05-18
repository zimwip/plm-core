package com.plm.platform.api.transaction;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Platform-level transaction federation endpoint.
 *
 * Aggregates open transactions across all services that declared the
 * "transaction" feature. Per-service lifecycle operations (commit, rollback,
 * addItem, removeItems) are routed to the owning service via
 * {@link TransactionFederatorClient}.
 *
 * All endpoints require a valid JWT — the auth filter on platform-api enforces
 * this, and ServiceClient forwards the token to each downstream service so
 * per-user scoping works automatically.
 *
 * URL prefix: /api/platform/transactions (via server.servlet.context-path)
 */
@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionFederatorController {

    private final TransactionFederatorClient federatorClient;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listTransactions(
        @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(federatorClient.fetchOpenTransactions());
    }

    @PostMapping("/{serviceCode}")
    public ResponseEntity<Map<String, Object>> openTransaction(
        @PathVariable String serviceCode
    ) {
        return ResponseEntity.ok(federatorClient.openTransaction(serviceCode));
    }

    @GetMapping("/{serviceCode}/{txId}")
    public ResponseEntity<Map<String, Object>> getTransaction(
        @PathVariable String serviceCode,
        @PathVariable String txId
    ) {
        return ResponseEntity.ok(federatorClient.getTransaction(serviceCode, txId));
    }

    @PostMapping("/{serviceCode}/{txId}/commit")
    public ResponseEntity<Map<String, Object>> commit(
        @PathVariable String serviceCode,
        @PathVariable String txId,
        @RequestBody Map<String, Object> body
    ) {
        return ResponseEntity.ok(federatorClient.commit(serviceCode, txId, body));
    }

    @PostMapping("/{serviceCode}/{txId}/rollback")
    public ResponseEntity<Map<String, Object>> rollback(
        @PathVariable String serviceCode,
        @PathVariable String txId
    ) {
        return ResponseEntity.ok(federatorClient.rollback(serviceCode, txId));
    }

    @PostMapping("/{serviceCode}/{txId}/items")
    public ResponseEntity<Map<String, Object>> addItem(
        @PathVariable String serviceCode,
        @PathVariable String txId,
        @RequestBody Map<String, Object> body
    ) {
        return ResponseEntity.ok(federatorClient.addItem(serviceCode, txId, body));
    }

    @DeleteMapping("/{serviceCode}/{txId}/items")
    public ResponseEntity<Map<String, Object>> removeItems(
        @PathVariable String serviceCode,
        @PathVariable String txId,
        @RequestBody Map<String, Object> body
    ) {
        return ResponseEntity.ok(federatorClient.removeItems(serviceCode, txId, body));
    }
}
