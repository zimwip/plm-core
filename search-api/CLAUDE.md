# search-api — Graph-aware search service

`serviceCode` = `search` · port 8088 · URL prefix `/api/search` · Java 21 + Spring Boot 3.5 + embedded Lucene 10.1.0.

Cross-cutting search service. No DB. No Flyway. No JOOQ. Lucene-only persistence. Real-time index updates from NATS.

---

## Architecture

### Dual-index (Lucene)
- **NodeIndex** (`nodes/` subdir) — full-text + keyword + stored source JSON. `LuceneNodeStore`.
- **EdgeIndex** (`edges/` subdir) — graph traversal + contextual validity filters. `LuceneEdgeStore`.
- `SEARCH_INDEX_PATH` env → FSDirectory (prod). Empty → `ByteBuffersDirectory` (tests/in-memory).

### Port/Adapter
- `NodeStore` port + `LuceneNodeStore` adapter (default profile).
- `EdgeStore` port + `LuceneEdgeStore` adapter (default profile).
- `@Profile("opensearch")` would provide alternate adapters (not yet implemented).
- `StoreConfiguration` creates both beans with `@Profile("!opensearch")`.

### BFS traversal
- `GraphTraversalService.traverse(rootId, ctx, structuralOnly, maxHops)` returns `Iterator<BfsLevel>`.
- `BfsLevel` record: `int hop`, `Set<String> ids`.
- Pre-fetching iterator: `hasNext()` pre-fetches next hop; `visited` set prevents cycles.
- `EdgeStore.resolveHop()` — batched via `TermInSetQuery("_src", refs)` for efficiency.

### Real-time index updates
- psm-api `SearchEventPublisher` enqueues to `event_outbox` table (transactional outbox pattern).
- `OutboxPoller` in psm-api publishes from outbox to NATS.
- `NatsEventConsumer` (this service, `@ConditionalOnProperty("plm.nats.enabled")`) subscribes to `search.nodes.>` and `search.edges.>`.
- `IndexWriteService`: batch-commits every 50 writes or 500ms idle, whichever comes first.

---

## Key design choices

### Lucene field naming
- System fields: `_id`, `_type`, `_projectSpaceId`, `_source` (stored JSON).
- Dynamic attribute fields: `dyn.<name>` (TextField, full-text) + `dyn.<name>.kw` (StringField, exact/facet).
- Number fields: `dyn.<name>` (DoublePoint) + `dyn.<name>.sv` (DoubleDocValuesField) + `dyn.<name>.stored`.
- Edge system fields: `_edge_id`, `_src`, `_dst` (stored), `_dst_idx` (indexed-only for deleteForNode), `_rel`, `_structural`.
- Validity flags: `_has_country`, `_has_profile`, `_has_from`, `_has_to` (enables "absent = universal" pattern).

### "Absent = universal" pattern (edges)
Edges without a country/profile constraint are valid for all contexts. Implemented as:
```
(NOT _has_country) OR (_v_country == requestedCountry)
```
Both clauses in SHOULD with no minimum — presence of either satisfies the constraint.

### Faceted search
No Lucene `FacetsConfig`/taxonomy. Plain stored-field iteration over `TopDocs`:
- `_type`, `_projectSpaceId` → system stored fields.
- Dynamic attributes → `d.getValues("dyn.dim.kw")`.
Sorted by count desc, limited to `search.facets.top-n` (default 50).

### Lucene 10 API notes
- `TotalHits` is a Java record in Lucene 10 — backing field is private. Access via `.value()` method (record accessor), not `.value` field.
- `searcher.storedFields().document(docId)` — required in Lucene 9+.
- `SearcherManager` provides NRT (near-real-time) semantics. Call `maybeRefresh()` before each search.

---

## Endpoints

```
POST /api/search/search          — global search, no graph traversal
POST /api/search/search/graph    — BFS-scoped search (all hops, non-streaming)
POST /api/search/search/stream   — BFS-scoped search, SSE streaming
```

### SearchRequest fields
| Field | Type | Description |
|-------|------|-------------|
| `query` | String | Full-text query (Lucene query syntax) |
| `type` | String | Filter by node type name |
| `projectSpaceId` | String | Filter by project space |
| `scopeRootId` | String | Required for graph endpoints — BFS root |
| `maxHops` | Integer | BFS depth limit (default 5) |
| `structuralOnly` | Boolean | BFS: traverse only structural edges |
| `context` | ConfigContext | country, profile, asOfEpochMs for validity |
| `filters` | Map<String,String> | Exact attribute filters (dyn.field.kw) |
| `facetOn` | List<String> | Dimensions for facet counts |
| `size` | Integer | Max hits per hop (default 50) |

### SSE stream events
- `event: hit` — one per matching node (JSON `SearchResult.Hit`)
- `event: facets` — aggregated facets after all hops
- `event: done` — `{"totalNodes": N}`

---

## Configuration

```properties
search.index.path=/var/lib/search-data   # empty = in-memory
search.bfs.batch-size=512
search.bfs.max-hops=20
search.facets.top-n=50
plm.nats.enabled=true                    # enables NATS consumers
```

No database. No Vault secrets for this service beyond `plm.service.secret` (shared).

---

## Tests

```bash
docker exec search-api mvn test -f /app/pom.xml
```

Contract tests in `src/test/.../contract/`:
- `NodeStoreContractTest` (abstract) + `LuceneNodeStoreTest` (concrete)
- `EdgeStoreContractTest` (abstract) + `LuceneEdgeStoreTest` (concrete)

Tests use in-memory `ByteBuffersDirectory` (empty `indexPath`). No Spring context needed — pure unit tests on `LuceneNodeStore`/`LuceneEdgeStore`.
