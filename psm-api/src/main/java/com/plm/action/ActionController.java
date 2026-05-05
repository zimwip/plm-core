package com.plm.action;

import com.plm.action.internal.ActionDispatcher;
import com.plm.platform.action.ActionResult;
import com.plm.shared.security.SecurityContextPort;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Generic action controller — single entry point for all action dispatch.
 *
 * URL pattern: {@code POST /api/psm/actions/{actionCode}/{id1}/{id2}/...}
 * Path IDs are interpreted by the action's scope definition.
 */
@RestController
@RequestMapping("/actions")
@RequiredArgsConstructor
public class ActionController {

    private final ActionDispatcher    actionDispatcher;
    private final SecurityContextPort secCtx;

    @PostMapping("/{actionCode}/**")
    public ResponseEntity<?> executeWithIds(
        @PathVariable String actionCode,
        @RequestHeader(value = "X-PLM-Tx", required = false) String txIdHeader,
        @RequestBody Map<String, Object> body,
        HttpServletRequest request
    ) {
        return doExecute(actionCode, extractPathIds(request, actionCode), txIdHeader, body);
    }

    @PostMapping("/{actionCode}")
    public ResponseEntity<?> executeNoIds(
        @PathVariable String actionCode,
        @RequestHeader(value = "X-PLM-Tx", required = false) String txIdHeader,
        @RequestBody Map<String, Object> body
    ) {
        return doExecute(actionCode, List.of(), txIdHeader, body);
    }

    private ResponseEntity<?> doExecute(
        String actionCode,
        List<String> pathIds,
        String txIdHeader,
        Map<String, Object> body
    ) {
        String userId = secCtx.currentUser().getUserId();

        @SuppressWarnings("unchecked")
        Map<String, String> params = (Map<String, String>) body.getOrDefault("parameters", Map.of());

        ActionResult result = actionDispatcher.dispatch(actionCode, pathIds, userId, txIdHeader, params);
        return ResponseEntity.ok(result.data());
    }

    /**
     * Extracts path segments after {@code /actions/{actionCode}/} (relative
     * to the service context-path).
     */
    private List<String> extractPathIds(HttpServletRequest request, String actionCode) {
        String path = request.getRequestURI();
        String ctx = request.getContextPath();
        if (ctx != null && !ctx.isEmpty() && path.startsWith(ctx)) {
            path = path.substring(ctx.length());
        }
        String prefix = "/actions/" + actionCode + "/";
        int idx = path.indexOf(prefix);
        if (idx < 0) return List.of();
        String rest = path.substring(idx + prefix.length());
        if (rest.isEmpty()) return List.of();
        return Arrays.stream(rest.split("/"))
                .filter(s -> !s.isBlank())
                .toList();
    }
}
