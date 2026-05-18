package com.plm.search.contract;

import com.plm.search.model.ConfigContext;
import com.plm.search.port.EdgeStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

public abstract class EdgeStoreContractTest {

    protected EdgeStore store;

    protected abstract EdgeStore createStore() throws Exception;

    @BeforeEach
    void setUp() throws Exception {
        store = createStore();
    }

    @Test
    void resolveHop_finds_direct_neighbors() throws Exception {
        store.upsert("A", "contains", "B", true, Map.of());
        store.upsert("A", "contains", "C", true, Map.of());
        store.flush();

        Set<String> next = store.resolveHop(Set.of("A"), ConfigContext.empty(), false);
        assertThat(next).containsExactlyInAnyOrder("B", "C");
    }

    @Test
    void upsert_idempotent() throws Exception {
        store.upsert("A", "contains", "B", true, Map.of());
        store.upsert("A", "contains", "B", true, Map.of());
        store.flush();

        Set<String> next = store.resolveHop(Set.of("A"), ConfigContext.empty(), false);
        assertThat(next).hasSize(1).contains("B");
    }

    @Test
    void structural_filter() throws Exception {
        store.upsert("A", "ref",      "B", false, Map.of());
        store.upsert("A", "contains", "C", true,  Map.of());
        store.flush();

        Set<String> structuralOnly = store.resolveHop(Set.of("A"), ConfigContext.empty(), true);
        assertThat(structuralOnly).containsExactly("C");

        Set<String> all = store.resolveHop(Set.of("A"), ConfigContext.empty(), false);
        assertThat(all).containsExactlyInAnyOrder("B", "C");
    }

    @Test
    void delete_removes_edge() throws Exception {
        store.upsert("A", "contains", "B", true, Map.of());
        store.flush();
        store.delete("A", "contains", "B");
        store.flush();

        Set<String> next = store.resolveHop(Set.of("A"), ConfigContext.empty(), false);
        assertThat(next).isEmpty();
    }

    @Test
    void deleteForNode_removes_outgoing_edges() throws Exception {
        store.upsert("X", "contains", "Y", true, Map.of());
        store.upsert("X", "contains", "Z", true, Map.of());
        store.flush();
        store.deleteForNode("X");
        store.flush();

        Set<String> next = store.resolveHop(Set.of("X"), ConfigContext.empty(), false);
        assertThat(next).isEmpty();
    }

    @Test
    void country_validity_absent_means_universal() throws Exception {
        store.upsert("A", "link", "B", true, Map.of());
        store.flush();

        // No country constraint on edge — should be reachable from any country context
        ConfigContext ctx = new ConfigContext("FR", null, null, Map.of());
        Set<String> next = store.resolveHop(Set.of("A"), ctx, false);
        assertThat(next).contains("B");
    }

    @Test
    void country_validity_constrained() throws Exception {
        store.upsert("A", "link", "B", true, Map.of("countries", java.util.List.of("FR", "DE")));
        store.upsert("A", "link", "C", true, Map.of("countries", java.util.List.of("US")));
        store.flush();

        ConfigContext frCtx = new ConfigContext("FR", null, null, Map.of());
        Set<String> frNext = store.resolveHop(Set.of("A"), frCtx, false);
        assertThat(frNext).contains("B").doesNotContain("C");

        ConfigContext usCtx = new ConfigContext("US", null, null, Map.of());
        Set<String> usNext = store.resolveHop(Set.of("A"), usCtx, false);
        assertThat(usNext).contains("C").doesNotContain("B");
    }

    @Test
    void empty_frontier_returns_empty() throws Exception {
        Set<String> next = store.resolveHop(Set.of(), ConfigContext.empty(), false);
        assertThat(next).isEmpty();
    }
}
