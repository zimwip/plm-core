package com.plm.search.contract;

import com.plm.search.model.DynamicField;
import com.plm.search.model.SearchRequest;
import com.plm.search.model.SearchResult;
import com.plm.search.port.NodeStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

public abstract class NodeStoreContractTest {

    protected NodeStore store;

    protected abstract NodeStore createStore() throws Exception;

    @BeforeEach
    void setUp() throws Exception {
        store = createStore();
    }

    @Test
    void upsert_then_searchGlobal_finds_by_type() throws Exception {
        store.upsert("n1", "psm", "nt-part", "PART", "ps1", "{}", List.of(
            new DynamicField("title", "string", List.of("Widget Pro"))));
        store.flush();

        SearchRequest req = new SearchRequest(null, "PART", null, null,
            null, false, null, null, List.of(), 10);
        SearchResult result = store.searchGlobal(req);

        assertThat(result.hits()).hasSize(1);
        assertThat(result.hits().get(0).id()).isEqualTo("n1");
        assertThat(result.hits().get(0).type()).isEqualTo("PART");
    }

    @Test
    void upsert_idempotent() throws Exception {
        store.upsert("n2", "psm", "nt-part", "PART", "ps1", "{}", List.of());
        store.upsert("n2", "psm", "nt-part", "PART", "ps1", "{\"updated\":true}", List.of(
            new DynamicField("title", "string", List.of("Updated"))));
        store.flush();

        SearchRequest req = new SearchRequest(null, "PART", null, null,
            null, false, null, null, List.of(), 10);
        SearchResult result = store.searchGlobal(req);

        assertThat(result.hits()).hasSize(1);
        assertThat(result.hits().get(0).sourceJson()).contains("updated");
    }

    @Test
    void delete_removes_node() throws Exception {
        store.upsert("n3", "psm", "nt-part", "PART", "ps1", "{}", List.of());
        store.flush();
        store.delete("n3");
        store.flush();

        SearchRequest req = new SearchRequest(null, null, null, null,
            null, false, null, null, List.of(), 10);
        SearchResult result = store.searchGlobal(req);

        assertThat(result.hits()).noneMatch(h -> "n3".equals(h.id()));
    }

    @Test
    void searchInScope_restricts_to_given_ids() throws Exception {
        store.upsert("n4", "psm", "nt-part", "PART", "ps1", "{}", List.of());
        store.upsert("n5", "psm", "nt-part", "PART", "ps1", "{}", List.of());
        store.flush();

        SearchRequest req = new SearchRequest(null, null, null, null,
            null, false, null, null, List.of(), 10);
        SearchResult result = store.searchInScope(Set.of("n4"), req, 1);

        assertThat(result.hits()).hasSize(1);
        assertThat(result.hits().get(0).id()).isEqualTo("n4");
    }

    @Test
    void string_filter_exact_match() throws Exception {
        store.upsert("n6", "psm", "nt-part", "PART", "ps1", "{}", List.of(
            new DynamicField("status", "string", List.of("ACTIVE"))));
        store.upsert("n7", "psm", "nt-part", "PART", "ps1", "{}", List.of(
            new DynamicField("status", "string", List.of("INACTIVE"))));
        store.flush();

        SearchRequest req = new SearchRequest(null, null, null, null,
            null, false, null, Map.of("status", "ACTIVE"), List.of(), 10);
        SearchResult result = store.searchGlobal(req);

        assertThat(result.hits()).hasSize(1);
        assertThat(result.hits().get(0).id()).isEqualTo("n6");
    }

    @Test
    void facets_return_counts_by_type() throws Exception {
        store.upsert("n8",  "psm", "nt-part", "PART",  "ps1", "{}", List.of());
        store.upsert("n9",  "psm", "nt-part", "PART",  "ps1", "{}", List.of());
        store.upsert("n10", "psm", "nt-assy", "ASSY",  "ps1", "{}", List.of());
        store.flush();

        Map<String, Map<String, Integer>> facets =
            store.computeFacets(Set.of("n8", "n9", "n10"), List.of("_type"));

        assertThat(facets).containsKey("_type");
        assertThat(facets.get("_type")).containsEntry("PART", 2).containsEntry("ASSY", 1);
    }

    @Test
    void searchInScope_empty_set_returns_empty() throws Exception {
        SearchRequest req = new SearchRequest(null, null, null, null,
            null, false, null, null, List.of(), 10);
        SearchResult result = store.searchInScope(Set.of(), req, 0);
        assertThat(result.hits()).isEmpty();
    }
}
