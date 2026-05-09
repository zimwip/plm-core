package com.plm.node;
import com.plm.node.signature.internal.CommentService;
import com.plm.node.signature.internal.SignatureService;
import com.plm.node.transaction.internal.LockService;

import com.plm.action.ActionService;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.authz.KeyExpr;
import com.plm.platform.authz.PlmPermission;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * API REST pour les noeuds PLM.
 *
 * Toutes les opérations d'écriture passent par le ActionController central :
 *
 *   POST /api/psm/actions/{actionCode}/{id1}/{id2}/...
 *   Header: X-PLM-Tx (requis si l'action a requires_tx = true)
 *   Body:   { "parameters": { ... } }
 *
 * Ce contrôleur ne gère que les lectures.
 */
@RestController
@RequestMapping("/nodes")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService         nodeService;
    private final LockService         lockService;
    private final SignatureService    signatureService;
    private final CommentService      commentService;
    private final ActionService       actionService;
    private final SecurityContextPort secCtx;
    private final ConfigCache         configCache;

    // ── Liste ─────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> listNodes(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        @RequestParam(required = false) String type
    ) {
        return ResponseEntity.ok(nodeService.listNodes(secCtx.requireProjectSpaceId(), page, size, type));
    }

    // ── Lecture (Server-Driven UI) ────────────────────────────────────

    /**
     * Retourne le payload UI complet (attributs, actions disponibles, état, lock…).
     * txId optionnel : si fourni, montre la version OPEN de la transaction (si owner).
     */
    @GetMapping("/{nodeId}/description")
    @SuppressWarnings("unchecked")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<Map<String, Object>> getDescription(
        @PathVariable String nodeId,
        @RequestParam(required = false) String txId,
        @RequestParam(required = false) Integer versionNumber
    ) throws InterruptedException {
        if (!configCache.isPopulated()) {
            configCache.awaitPopulated(10, java.util.concurrent.TimeUnit.SECONDS);
        }
        String userId = secCtx.currentUser().getUserId();
        Map<String, Object> description = nodeService.buildObjectDescription(nodeId, userId, txId, versionNumber);

        // Resolve actions (skip for historical views)
        boolean historicalView = Boolean.TRUE.equals(description.get("historicalView"));
        List<Map<String, Object>> actions = List.of();
        if (!historicalView) {
            String nodeTypeId = (String) description.get("nodeTypeId");
            String currentStateId = (String) description.get("state");
            Map<String, Object> lockInfo = (Map<String, Object>) description.get("lock");
            boolean isLocked = Boolean.TRUE.equals(lockInfo.get("locked"));
            boolean isLockedByCurrentUser = isLocked && userId.equals(lockInfo.get("lockedBy"));
            actions = actionService.resolveActionsForNode(
                nodeId, nodeTypeId, currentStateId, isLocked, isLockedByCurrentUser);
        }

        // Derive globalCanWrite from actions
        boolean globalCanWrite = !historicalView && actions.stream()
            .anyMatch(a -> "update_node".equals(a.get("actionCode"))
                && Boolean.TRUE.equals(a.get("authorized"))
                && ((List<?>) a.getOrDefault("guardViolations", List.of())).isEmpty());

        // If not globally writable, override all attribute editable flags to false
        if (!globalCanWrite) {
            List<Map<String, Object>> attrs = (List<Map<String, Object>>) description.get("attributes");
            if (attrs != null) {
                List<Map<String, Object>> mutableAttrs = attrs.stream()
                    .map(a -> {
                        Map<String, Object> m = new java.util.HashMap<>(a);
                        m.put("editable", false);
                        return m;
                    })
                    .toList();
                description.put("attributes", mutableAttrs);
            }
        }

        description.put("actions", actions);
        return ResponseEntity.ok(description);
    }

    // ── Liens — lecture ───────────────────────────────────────────────

    @GetMapping("/{nodeId}/links/children")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<?> getChildLinks(@PathVariable String nodeId) {
        return ResponseEntity.ok(nodeService.getChildLinks(nodeId));
    }

    @GetMapping("/{nodeId}/links/parents")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<?> getParentLinks(@PathVariable String nodeId) {
        return ResponseEntity.ok(nodeService.getParentLinks(nodeId));
    }

    // ── Historique des versions ───────────────────────────────────────

    @GetMapping("/{nodeId}/versions")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<?> getVersionHistory(@PathVariable String nodeId) {
        return ResponseEntity.ok(nodeService.getVersionHistory(nodeId));
    }

    @GetMapping("/{nodeId}/versions/diff")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<?> getVersionDiff(
            @PathVariable String nodeId,
            @RequestParam int v1,
            @RequestParam int v2) {
        return ResponseEntity.ok(nodeService.getVersionDiff(nodeId, v1, v2));
    }

    // ── Lock info ─────────────────────────────────────────────────────

    @GetMapping("/{nodeId}/lock")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<?> getLockInfo(@PathVariable String nodeId) {
        LockService.LockInfo info = lockService.getLockInfo(nodeId);
        return ResponseEntity.ok(Map.of(
            "locked",   info.locked(),
            "lockedBy", info.lockedBy() != null ? info.lockedBy() : ""
        ));
    }

    // ── Signatures — lecture ──────────────────────────────────────────

    @GetMapping("/{nodeId}/signatures")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<?> getSignatures(@PathVariable String nodeId) {
        return ResponseEntity.ok(signatureService.getSignaturesForCurrentVersion(nodeId));
    }

    @GetMapping("/{nodeId}/signatures/history")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<?> getSignatureHistory(@PathVariable String nodeId) {
        return ResponseEntity.ok(signatureService.getFullSignatureHistory(nodeId));
    }

    // ── Comments ─────────────────────────────────────────────────────

    @GetMapping("/{nodeId}/comments")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<?> getComments(@PathVariable String nodeId) {
        return ResponseEntity.ok(commentService.getComments(nodeId));
    }

    @PostMapping("/{nodeId}/comments")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<?> addComment(
        @PathVariable String nodeId,
        @RequestBody  Map<String, Object> body
    ) {
        String userId        = secCtx.currentUser().getUserId();
        String nodeVersionId = (String) body.get("nodeVersionId");
        String text          = (String) body.get("text");
        String parentId      = (String) body.get("parentCommentId");
        String attributeName = (String) body.get("attributeName");
        String id = commentService.addComment(nodeId, nodeVersionId, userId, text, parentId, attributeName);
        return ResponseEntity.ok(Map.of("commentId", id));
    }

    @PatchMapping("/{nodeId}/external-id")
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public ResponseEntity<?> updateExternalId(
        @PathVariable String nodeId,
        @RequestBody  Map<String, Object> body
    ) {
        String externalId = (String) body.get("externalId");
        nodeService.updateExternalId(nodeId, externalId);
        return ResponseEntity.ok(Map.of());
    }
}
