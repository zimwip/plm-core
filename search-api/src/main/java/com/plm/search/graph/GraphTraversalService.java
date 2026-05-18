package com.plm.search.graph;

import com.plm.search.model.ConfigContext;
import com.plm.search.port.EdgeStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Stateless BFS over the EdgeStore. Each call to {@link #traverse} returns
 * an iterator of BFS levels. The caller emits results per level for streaming.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GraphTraversalService {

    private final EdgeStore edgeStore;

    public record BfsLevel(int hop, Set<String> ids) {}

    /**
     * BFS starting from rootId. Returns levels lazily (each next() call advances one hop).
     * The root node itself is returned as hop 0.
     */
    public Iterator<BfsLevel> traverse(String rootId, ConfigContext ctx,
                                       boolean structuralOnly, int maxHops) {
        return new Iterator<>() {
            private Set<String> frontier  = Set.of(rootId);
            private final Set<String> visited = new HashSet<>(Set.of(rootId));
            private int     hop            = 0;
            private boolean rootEmitted    = false;
            // next frontier pre-fetched so hasNext() is accurate after root is emitted
            private Set<String> nextFrontier = null;

            @Override
            public boolean hasNext() {
                if (!rootEmitted) return true;
                if (nextFrontier == null) prefetch();
                return !nextFrontier.isEmpty() && hop < maxHops;
            }

            @Override
            public BfsLevel next() {
                if (!rootEmitted) {
                    rootEmitted = true;
                    return new BfsLevel(0, new HashSet<>(frontier));
                }
                if (nextFrontier == null) prefetch();
                frontier     = nextFrontier;
                nextFrontier = null;
                hop++;
                return new BfsLevel(hop, new HashSet<>(frontier));
            }

            private void prefetch() {
                try {
                    Set<String> raw = new HashSet<>(
                        edgeStore.resolveHop(frontier, ctx, structuralOnly));
                    raw.removeAll(visited);
                    visited.addAll(raw);
                    nextFrontier = raw;
                } catch (Exception e) {
                    log.error("BFS hop failed at level {}: {}", hop + 1, e.getMessage(), e);
                    nextFrontier = Set.of();
                }
            }
        };
    }
}
