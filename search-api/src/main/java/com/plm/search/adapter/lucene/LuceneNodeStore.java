package com.plm.search.adapter.lucene;

import com.plm.search.model.DynamicField;
import com.plm.search.model.SearchRequest;
import com.plm.search.model.SearchResult;
import com.plm.search.port.NodeStore;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.*;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.*;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.BytesRef;

import java.io.IOException;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class LuceneNodeStore implements NodeStore {

    private final Directory        directory;
    private final StandardAnalyzer analyzer;
    private final IndexWriter      writer;
    private final SearcherManager  searcherManager;
    private final int              topN;

    public LuceneNodeStore(String indexPath, int ramBufferMb, int topN) throws IOException {
        this.topN     = topN;
        this.analyzer = new StandardAnalyzer();

        if (indexPath == null || indexPath.isBlank()) {
            this.directory = new ByteBuffersDirectory();
        } else {
            this.directory = FSDirectory.open(Path.of(indexPath, "nodes"));
        }

        IndexWriterConfig iwc = new IndexWriterConfig(analyzer);
        iwc.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
        iwc.setRAMBufferSizeMB(ramBufferMb);
        this.writer         = new IndexWriter(directory, iwc);
        this.searcherManager = new SearcherManager(writer, null);
    }

    // ── Writes ──────────────────────────────────────────────

    @Override
    public void upsert(String id, String serviceCode, String itemCode,
                       String type, String projectSpaceId,
                       String sourceJson, List<DynamicField> fields) throws Exception {
        Document doc = new Document();
        doc.add(new StringField("_id",             id,                                        Field.Store.YES));
        doc.add(new StringField("_serviceCode",    serviceCode != null ? serviceCode : "",    Field.Store.YES));
        doc.add(new StringField("_itemCode",       itemCode    != null ? itemCode    : "",    Field.Store.YES));
        doc.add(new StringField("_type",           type        != null ? type        : "",    Field.Store.YES));
        doc.add(new StringField("_projectSpaceId", projectSpaceId != null ? projectSpaceId : "",
                                                                                               Field.Store.YES));
        doc.add(new StoredField("_source",         sourceJson != null ? sourceJson : "{}"));

        for (DynamicField field : fields) {
            String luceneName = "dyn." + field.name();
            for (Object raw : field.values()) {
                if (raw == null) continue;
                switch (field.valueType()) {
                    case "string" -> {
                        String s = raw.toString();
                        doc.add(new TextField(luceneName,            s, Field.Store.NO));
                        doc.add(new StringField(luceneName + ".kw",  s, Field.Store.YES));
                        doc.add(new TextField("_all",                s, Field.Store.NO));
                    }
                    case "enum" -> {
                        String s = raw.toString();
                        doc.add(new TextField(luceneName,            s, Field.Store.NO));
                        doc.add(new StringField(luceneName + ".kw",  s, Field.Store.YES));
                        doc.add(new TextField("_all",                s, Field.Store.NO));
                        doc.add(new StringField("_enum_fields", field.name(), Field.Store.YES));
                    }
                    case "number" -> {
                        double d = raw instanceof Number n ? n.doubleValue()
                                                           : Double.parseDouble(raw.toString());
                        doc.add(new DoublePoint(luceneName, d));
                        doc.add(new DoubleDocValuesField(luceneName + ".sv", d));
                        doc.add(new StoredField(luceneName + ".stored", d));
                        doc.add(new StringField("_range_fields", field.name(), Field.Store.YES));
                    }
                    case "date" -> {
                        long epoch = raw instanceof Number n ? n.longValue()
                                                             : Long.parseLong(raw.toString());
                        doc.add(new LongPoint(luceneName, epoch));
                        doc.add(new NumericDocValuesField(luceneName + ".sv", epoch));
                    }
                    case "boolean" -> {
                        String bv = raw.toString();
                        doc.add(new StringField(luceneName + ".kw", bv, Field.Store.YES));
                    }
                }
            }
        }

        writer.updateDocument(new Term("_id", id), doc);
    }

    @Override
    public void delete(String id) throws Exception {
        writer.deleteDocuments(new Term("_id", id));
    }

    @Override
    public void flush() throws Exception {
        writer.commit();
        searcherManager.maybeRefresh();
    }

    // ── Reads ───────────────────────────────────────────────

    @Override
    public SearchResult searchInScope(Set<String> scopeIds, SearchRequest req, int hop) throws Exception {
        if (scopeIds.isEmpty()) return SearchResult.empty();
        Query combined = new BooleanQuery.Builder()
            .add(buildMainQuery(req),      BooleanClause.Occur.MUST)
            .add(buildScopeQuery(scopeIds), BooleanClause.Occur.FILTER)
            .build();
        return executeSearch(combined, req, hop);
    }

    @Override
    public SearchResult searchGlobal(SearchRequest req) throws Exception {
        return executeSearch(buildMainQuery(req), req, 0);
    }

    private static final Set<String> FACET_EXCLUDE_DIMS = Set.of("logical_id");

    @Override
    public Map<String, Map<String, Integer>> computeFacets(
            Set<String> ids, List<String> dims) throws Exception {
        if (ids.isEmpty() || dims.isEmpty()) return Map.of();

        searcherManager.maybeRefresh();
        IndexSearcher searcher = searcherManager.acquire();
        try {
            Query scopeQuery = buildScopeQuery(ids);
            TopDocs topDocs  = searcher.search(scopeQuery, ids.size() + 1);
            var storedFields = searcher.storedFields();

            // Load all docs once
            List<Document> docs = new ArrayList<>();
            for (ScoreDoc sd : topDocs.scoreDocs) {
                docs.add(storedFields.document(sd.doc));
            }

            // Expand "*" to enum-typed field names (stored in _enum_fields marker)
            List<String> effectiveDims = new ArrayList<>();
            boolean hasWildcard = dims.contains("*");
            for (String dim : dims) {
                if (!"*".equals(dim)) effectiveDims.add(dim);
            }
            if (hasWildcard) {
                Set<String> enumDims = new LinkedHashSet<>();
                for (Document d : docs) {
                    for (String name : d.getValues("_enum_fields")) {
                        if (!FACET_EXCLUDE_DIMS.contains(name) && !effectiveDims.contains(name)) {
                            enumDims.add(name);
                        }
                    }
                }
                effectiveDims.addAll(enumDims);
            }

            Map<String, Map<String, Integer>> result = new LinkedHashMap<>();
            for (String dim : effectiveDims) {
                Map<String, Integer> counts = new LinkedHashMap<>();
                for (Document d : docs) {
                    if ("_type".equals(dim)) {
                        String v = d.get("_type");
                        if (v != null) counts.merge(v, 1, Integer::sum);
                    } else if ("_projectSpaceId".equals(dim)) {
                        String v = d.get("_projectSpaceId");
                        if (v != null && !v.isBlank()) counts.merge(v, 1, Integer::sum);
                    } else if ("_serviceCode".equals(dim)) {
                        String v = d.get("_serviceCode");
                        if (v != null && !v.isBlank()) counts.merge(v, 1, Integer::sum);
                    } else {
                        for (String v : d.getValues("dyn." + dim + ".kw")) {
                            counts.merge(v, 1, Integer::sum);
                        }
                    }
                }
                if (!counts.isEmpty()) {
                    result.put(dim, counts.entrySet().stream()
                        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                        .limit(topN)
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                            (a, b) -> a, LinkedHashMap::new)));
                }
            }
            return result;
        } finally {
            searcherManager.release(searcher);
        }
    }

    @Override
    public Map<String, double[]> computeRangeFacets(Set<String> ids) throws Exception {
        if (ids.isEmpty()) return Map.of();

        searcherManager.maybeRefresh();
        IndexSearcher searcher = searcherManager.acquire();
        try {
            Query scopeQuery = buildScopeQuery(ids);
            TopDocs topDocs  = searcher.search(scopeQuery, ids.size() + 1);
            var storedFields = searcher.storedFields();

            Set<String> rangeDims = new LinkedHashSet<>();
            List<Document> docs   = new ArrayList<>();
            for (ScoreDoc sd : topDocs.scoreDocs) {
                Document d = storedFields.document(sd.doc);
                docs.add(d);
                for (String name : d.getValues("_range_fields")) rangeDims.add(name);
            }

            Map<String, double[]> result = new LinkedHashMap<>();
            for (String dim : rangeDims) {
                double min = Double.MAX_VALUE, max = -Double.MAX_VALUE;
                for (Document d : docs) {
                    IndexableField f = d.getField("dyn." + dim + ".stored");
                    if (f == null || f.numericValue() == null) continue;
                    double v = f.numericValue().doubleValue();
                    if (v < min) min = v;
                    if (v > max) max = v;
                }
                if (min <= max) result.put(dim, new double[]{min, max});
            }
            return result;
        } finally {
            searcherManager.release(searcher);
        }
    }

    // ── Helpers ─────────────────────────────────────────────

    private SearchResult executeSearch(Query query, SearchRequest req, int hop) throws Exception {
        searcherManager.maybeRefresh();
        IndexSearcher searcher = searcherManager.acquire();
        try {
            TopDocs topDocs      = searcher.search(query, req.size());
            var     storedFields = searcher.storedFields();
            List<SearchResult.Hit> hits = new ArrayList<>();
            for (ScoreDoc sd : topDocs.scoreDocs) {
                Document d = storedFields.document(sd.doc);
                hits.add(new SearchResult.Hit(
                    d.get("_id"), d.get("_serviceCode"), d.get("_itemCode"),
                    d.get("_type"), d.get("_projectSpaceId"),
                    d.get("_source"), sd.score, hop));
            }
            int total = topDocs.totalHits.value() > Integer.MAX_VALUE
                ? Integer.MAX_VALUE : (int) topDocs.totalHits.value();
            return new SearchResult(hits, Map.of(), Map.of(), total, hop);
        } finally {
            searcherManager.release(searcher);
        }
    }

    private static String toFilterField(String dim) {
        return switch (dim) {
            case "_type" -> "_type";
            case "_projectSpaceId" -> "_projectSpaceId";
            case "_serviceCode" -> "_serviceCode";
            default -> "dyn." + dim + ".kw";
        };
    }

    private Query buildScopeQuery(Set<String> ids) {
        List<BytesRef> refs = ids.stream().map(BytesRef::new).toList();
        return new TermInSetQuery("_id", refs);
    }

    private Query buildMainQuery(SearchRequest req) throws Exception {
        BooleanQuery.Builder b         = new BooleanQuery.Builder();
        boolean              hasClauses = false;

        if (req.query() != null && !req.query().isBlank()) {
            String raw = req.query().trim();
            // "*" and "*:*" mean match-all; skip text clause so other filters still apply
            if (!"*".equals(raw) && !"*:*".equals(raw)) {
                QueryParser parser = new QueryParser("_all", analyzer);
                parser.setDefaultOperator(QueryParser.Operator.AND);
                Query textQuery;
                try {
                    textQuery = parser.parse(raw);
                } catch (Exception e) {
                    textQuery = parser.parse(QueryParser.escape(raw));
                }
                b.add(textQuery, BooleanClause.Occur.MUST);
                hasClauses = true;
            }
        }
        if (req.type() != null && !req.type().isBlank()) {
            b.add(new TermQuery(new Term("_type", req.type())), BooleanClause.Occur.FILTER);
            hasClauses = true;
        }
        if (req.projectSpaceId() != null && !req.projectSpaceId().isBlank()) {
            b.add(new TermQuery(new Term("_projectSpaceId", req.projectSpaceId())),
                  BooleanClause.Occur.FILTER);
            hasClauses = true;
        }
        if (req.filters() != null) {
            for (Map.Entry<String, String> e : req.filters().entrySet()) {
                String field = toFilterField(e.getKey());
                b.add(new TermQuery(new Term(field, e.getValue())), BooleanClause.Occur.FILTER);
                hasClauses = true;
            }
        }
        if (req.filterTerms() != null) {
            for (Map.Entry<String, List<String>> e : req.filterTerms().entrySet()) {
                String       field = toFilterField(e.getKey());
                List<String> vals  = e.getValue();
                if (vals.isEmpty()) continue;
                if (vals.size() == 1) {
                    b.add(new TermQuery(new Term(field, vals.get(0))), BooleanClause.Occur.FILTER);
                } else {
                    // OR within a dimension (e.g. type = A OR B), AND across dimensions
                    List<BytesRef> refs = vals.stream().map(BytesRef::new).toList();
                    b.add(new TermInSetQuery(field, refs), BooleanClause.Occur.FILTER);
                }
                hasClauses = true;
            }
        }
        if (req.rangeFilters() != null) {
            for (Map.Entry<String, double[]> e : req.rangeFilters().entrySet()) {
                double[] bounds = e.getValue();
                if (bounds == null || bounds.length < 2) continue;
                double lo = bounds[0], hi = bounds[1];
                if (Double.isNaN(lo) || Double.isNaN(hi)) continue;   // empty/garbage input
                if (lo > hi) { double t = lo; lo = hi; hi = t; }       // tolerate inverted range
                b.add(DoublePoint.newRangeQuery("dyn." + e.getKey(), lo, hi),
                      BooleanClause.Occur.FILTER);
                hasClauses = true;
            }
        }

        return hasClauses ? b.build() : new MatchAllDocsQuery();
    }

    @Override
    public int count() throws Exception {
        searcherManager.maybeRefresh();
        IndexSearcher searcher = searcherManager.acquire();
        try {
            return searcher.getIndexReader().numDocs();
        } finally {
            searcherManager.release(searcher);
        }
    }

    public void close() throws IOException {
        searcherManager.close();
        writer.close();
        analyzer.close();
        directory.close();
    }
}
