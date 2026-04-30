package com.plm.source;

import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.SourceConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Read-only endpoints for the link picker UI:
 * <ul>
 *   <li>{@code GET /sources}                          — list all sources from snapshot</li>
 *   <li>{@code GET /sources/{code}/types}             — types this source's resolver supports</li>
 *   <li>{@code GET /sources/{code}/keys?type=&q=&limit=}
 *       — autocomplete keys for a given (source, type, query)</li>
 * </ul>
 *
 * Source CRUD lives in psm-admin — these endpoints serve the runtime needs of the
 * link create/edit form on psm-api.
 */
@RestController
@RequestMapping("/sources")
@RequiredArgsConstructor
public class SourceQueryController {

    private final ConfigCache configCache;
    private final SourceResolverRegistry resolverRegistry;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        List<Map<String, Object>> out = new java.util.ArrayList<>();
        for (SourceConfig s : configCache.getAllSources()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.id());
            m.put("name", s.name());
            m.put("description", s.description());
            m.put("resolverInstanceId", s.resolverInstanceId());
            m.put("resolverAlgorithmCode", s.resolverAlgorithmCode());
            m.put("builtin", s.builtin());
            m.put("versioned", s.versioned());
            m.put("color", s.color());
            m.put("icon", s.icon());
            out.add(m);
        }
        return ResponseEntity.ok(out);
    }

    @GetMapping("/{code}/types")
    public ResponseEntity<List<String>> types(@PathVariable String code) {
        return ResponseEntity.ok(resolverRegistry.getResolverFor(code).supportedTypes());
    }

    @GetMapping("/{code}/keys")
    public ResponseEntity<List<KeyHint>> keys(
        @PathVariable String code,
        @RequestParam(required = false) String type,
        @RequestParam(required = false, defaultValue = "") String q,
        @RequestParam(required = false, defaultValue = "25") int limit
    ) {
        return ResponseEntity.ok(resolverRegistry.getResolverFor(code).suggestKeys(type, q, limit));
    }
}
