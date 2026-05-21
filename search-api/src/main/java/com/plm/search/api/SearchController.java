package com.plm.search.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.search.graph.GraphTraversalService;
import com.plm.search.model.ConfigContext;
import com.plm.search.model.SearchRequest;
import com.plm.search.model.SearchResult;
import com.plm.search.port.EdgeStore;
import com.plm.search.port.NodeStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.util.*;

/**
 * Search REST endpoints.
 *
 * POST /search       — global search (no graph traversal)
 * POST /search/graph — BFS-scoped search (non-streaming, collects all hops)
 * POST /search/stream — BFS-scoped search with SSE streaming (one event per hit)
 */
@Slf4j
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final NodeStore              nodeStore;
    private final EdgeStore              edgeStore;
    private final GraphTraversalService  traversal;
    private final ObjectMapper           objectMapper;

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        try {
            Map<String, Object> body = new java.util.LinkedHashMap<>();
            body.put("available",  true);
            body.put("nodeCount",  nodeStore.count());
            body.put("edgeCount",  edgeStore.count());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            log.warn("Index info failed: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("available", false, "nodeCount", 0, "edgeCount", 0));
        }
    }

    @PostMapping
    public ResponseEntity<SearchResult> search(
            @RequestBody SearchRequest req,
            @RequestHeader(value = "X-PLM-ProjectSpace", required = false) String psHeader) {
        req = withProjectSpace(req, psHeader);
        try {
            SearchResult result = nodeStore.searchGlobal(req);
            if (req.facetOn() != null && !req.facetOn().isEmpty() && !result.hits().isEmpty()) {
                Set<String> ids = result.hits().stream()
                    .map(SearchResult.Hit::id)
                    .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new));
                Map<String, Map<String, Integer>> facets      = nodeStore.computeFacets(ids, req.facetOn());
                Map<String, double[]>             rangeFacets = req.facetOn().contains("*")
                    ? nodeStore.computeRangeFacets(ids) : Map.of();
                result = new SearchResult(result.hits(), facets, rangeFacets, result.totalHits(), result.hopLevel());
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Global search failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/graph")
    public ResponseEntity<SearchResult> graphSearch(
            @RequestBody SearchRequest req,
            @RequestHeader(value = "X-PLM-ProjectSpace", required = false) String psHeader) {
        req = withProjectSpace(req, psHeader);
        if (req.scopeRootId() == null || req.scopeRootId().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            int maxHops = req.maxHops() != null ? req.maxHops() : 5;
            Set<String> allIds = new LinkedHashSet<>();
            allIds.add(req.scopeRootId());
            List<SearchResult.Hit> allHits = new ArrayList<>();

            var it = traversal.traverse(req.scopeRootId(), req.context(),
                                        req.structuralOnly(), maxHops);
            while (it.hasNext()) {
                var level = it.next();
                if (level.ids().isEmpty()) continue;
                SearchResult batch = nodeStore.searchInScope(level.ids(), req, level.hop());
                allHits.addAll(batch.hits());
                allIds.addAll(level.ids());
            }

            Map<String, Map<String, Integer>> facets = req.facetOn().isEmpty()
                ? Map.of() : nodeStore.computeFacets(allIds, req.facetOn());
            Map<String, double[]> rangeFacets = req.facetOn().contains("*")
                ? nodeStore.computeRangeFacets(allIds) : Map.of();

            return ResponseEntity.ok(new SearchResult(allHits, facets, rangeFacets, allHits.size(), 0));
        } catch (Exception e) {
            log.error("Graph search failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public void stream(
            @RequestBody SearchRequest req,
            @RequestHeader(value = "X-PLM-ProjectSpace", required = false) String psHeader,
            HttpServletResponse response) {
        req = withProjectSpace(req, psHeader);
        response.setContentType(MediaType.TEXT_EVENT_STREAM_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache");

        if (req.scopeRootId() == null || req.scopeRootId().isBlank()) {
            writeEvent(response, "error", "{\"message\":\"scopeRootId required\"}");
            return;
        }

        int maxHops = req.maxHops() != null ? req.maxHops() : 5;
        Set<String> allIds = new LinkedHashSet<>();
        allIds.add(req.scopeRootId());

        try {
            PrintWriter out = response.getWriter();
            var it = traversal.traverse(req.scopeRootId(), req.context(),
                                        req.structuralOnly(), maxHops);
            while (it.hasNext() && !out.checkError()) {
                var level = it.next();
                if (level.ids().isEmpty()) continue;

                SearchResult batch = nodeStore.searchInScope(level.ids(), req, level.hop());
                for (SearchResult.Hit hit : batch.hits()) {
                    String data = objectMapper.writeValueAsString(hit);
                    out.write("event: hit\ndata: " + data + "\n\n");
                }
                out.flush();
                allIds.addAll(level.ids());
            }

            if (!req.facetOn().isEmpty()) {
                Map<String, Map<String, Integer>> facets =
                    nodeStore.computeFacets(allIds, req.facetOn());
                out.write("event: facets\ndata: " + objectMapper.writeValueAsString(facets) + "\n\n");
            }
            out.write("event: done\ndata: {\"totalNodes\":" + allIds.size() + "}\n\n");
            out.flush();
        } catch (Exception e) {
            log.error("SSE stream failed: {}", e.getMessage(), e);
            writeEvent(response, "error", "{\"message\":\"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/children/{id}")
    public ResponseEntity<List<SearchResult.Hit>> children(
            @PathVariable String id,
            @RequestHeader(value = "X-PLM-ProjectSpace", required = false) String psHeader) {
        try {
            Set<String> childIds = edgeStore.resolveHop(Set.of(id), ConfigContext.empty(), false);
            if (childIds.isEmpty()) return ResponseEntity.ok(List.of());
            String ps = (psHeader != null && !psHeader.isBlank()) ? psHeader : null;
            SearchRequest fetchReq = new SearchRequest(
                null, null, ps, null, null, false,
                ConfigContext.empty(), Map.of(), Map.of(), Map.of(), List.of(), 200);
            SearchResult result = nodeStore.searchInScope(childIds, fetchReq, 1);
            return ResponseEntity.ok(result.hits());
        } catch (Exception e) {
            log.error("Children fetch failed for {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private SearchRequest withProjectSpace(SearchRequest req, String psHeader) {
        if (psHeader == null || psHeader.isBlank()) return req;
        if (req.projectSpaceId() != null && !req.projectSpaceId().isBlank()) return req;
        return new SearchRequest(req.query(), req.type(), psHeader, req.scopeRootId(),
            req.maxHops(), req.structuralOnly(), req.context(),
            req.filters(), req.filterTerms(), req.rangeFilters(), req.facetOn(), req.size());
    }

    private void writeEvent(HttpServletResponse response, String event, String data) {
        try {
            response.getWriter().write("event: " + event + "\ndata: " + data + "\n\n");
            response.getWriter().flush();
        } catch (Exception ignored) {}
    }
}
