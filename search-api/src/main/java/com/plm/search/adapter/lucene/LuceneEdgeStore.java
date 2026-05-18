package com.plm.search.adapter.lucene;

import com.plm.search.model.ConfigContext;
import com.plm.search.port.EdgeStore;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.document.*;
import org.apache.lucene.index.*;
import org.apache.lucene.search.*;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.BytesRef;

import java.io.IOException;
import java.nio.file.Path;
import java.util.*;

@Slf4j
public class LuceneEdgeStore implements EdgeStore {

    private final Directory       directory;
    private final IndexWriter     writer;
    private final SearcherManager searcherManager;

    public LuceneEdgeStore(String indexPath, int ramBufferMb) throws IOException {
        if (indexPath == null || indexPath.isBlank()) {
            this.directory = new ByteBuffersDirectory();
        } else {
            this.directory = FSDirectory.open(Path.of(indexPath, "edges"));
        }
        IndexWriterConfig iwc = new IndexWriterConfig();
        iwc.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
        iwc.setRAMBufferSizeMB(ramBufferMb);
        this.writer         = new IndexWriter(directory, iwc);
        this.searcherManager = new SearcherManager(writer, null);
    }

    // ── Writes ──────────────────────────────────────────────

    @Override
    public void upsert(String srcId, String relType, String dstId,
                       boolean structural, Map<String, Object> validity) throws Exception {
        String edgeId = srcId + "::" + relType + "::" + dstId;
        Document doc = new Document();
        doc.add(new StringField("_edge_id",    edgeId,                       Field.Store.YES));
        doc.add(new StringField("_src",        srcId,                        Field.Store.NO));
        doc.add(new StringField("_dst",        dstId,                        Field.Store.YES));
        doc.add(new StringField("_dst_idx",    dstId,                        Field.Store.NO));
        doc.add(new StringField("_rel",        relType,                       Field.Store.NO));
        doc.add(new StringField("_structural", Boolean.toString(structural), Field.Store.NO));

        if (validity != null) {
            Object countries = validity.get("countries");
            if (countries instanceof List<?> cl && !cl.isEmpty()) {
                doc.add(new StringField("_has_country", "true", Field.Store.NO));
                for (Object c : cl) {
                    doc.add(new StringField("_v_country", c.toString(), Field.Store.NO));
                }
            }
            Object profiles = validity.get("profiles");
            if (profiles instanceof List<?> pl && !pl.isEmpty()) {
                doc.add(new StringField("_has_profile", "true", Field.Store.NO));
                for (Object p : pl) {
                    doc.add(new StringField("_v_profile", p.toString(), Field.Store.NO));
                }
            }
            Long from = validity.get("validFrom") instanceof Number n ? n.longValue() : null;
            Long to   = validity.get("validTo")   instanceof Number n ? n.longValue() : null;
            if (from != null) {
                doc.add(new StringField("_has_from", "true", Field.Store.NO));
                doc.add(new LongPoint("_v_from", from));
            }
            if (to != null) {
                doc.add(new StringField("_has_to", "true", Field.Store.NO));
                doc.add(new LongPoint("_v_to", to));
            }
        }

        writer.updateDocument(new Term("_edge_id", edgeId), doc);
    }

    @Override
    public void delete(String srcId, String relType, String dstId) throws Exception {
        String edgeId = srcId + "::" + relType + "::" + dstId;
        writer.deleteDocuments(new Term("_edge_id", edgeId));
    }

    @Override
    public void deleteForNode(String nodeId) throws Exception {
        writer.deleteDocuments(new TermQuery(new Term("_src",     nodeId)));
        writer.deleteDocuments(new TermQuery(new Term("_dst_idx", nodeId)));
    }

    @Override
    public void flush() throws Exception {
        writer.commit();
        searcherManager.maybeRefresh();
    }

    // ── Traversal ───────────────────────────────────────────

    @Override
    public Set<String> resolveHop(Set<String> frontier, ConfigContext ctx,
                                  boolean structuralOnly) throws Exception {
        if (frontier.isEmpty()) return Set.of();

        searcherManager.maybeRefresh();
        IndexSearcher searcher = searcherManager.acquire();
        try {
            BooleanQuery.Builder b = new BooleanQuery.Builder();

            // Source IDs (batched into TermInSetQuery)
            List<BytesRef> refs = frontier.stream().map(BytesRef::new).toList();
            b.add(new TermInSetQuery("_src", refs), BooleanClause.Occur.MUST);

            if (structuralOnly) {
                b.add(new TermQuery(new Term("_structural", "true")), BooleanClause.Occur.FILTER);
            }

            long now = ctx.asOfEpochMs() != null ? ctx.asOfEpochMs() : System.currentTimeMillis();

            // Temporal validity
            b.add(new BooleanQuery.Builder()
                .add(new BooleanQuery.Builder()
                    .add(new TermQuery(new Term("_has_from", "true")), BooleanClause.Occur.MUST_NOT)
                    .add(new MatchAllDocsQuery(), BooleanClause.Occur.MUST).build(), BooleanClause.Occur.SHOULD)
                .add(LongPoint.newRangeQuery("_v_from", Long.MIN_VALUE, now), BooleanClause.Occur.SHOULD)
                .build(), BooleanClause.Occur.FILTER);

            b.add(new BooleanQuery.Builder()
                .add(new BooleanQuery.Builder()
                    .add(new TermQuery(new Term("_has_to", "true")), BooleanClause.Occur.MUST_NOT)
                    .add(new MatchAllDocsQuery(), BooleanClause.Occur.MUST).build(), BooleanClause.Occur.SHOULD)
                .add(LongPoint.newRangeQuery("_v_to", now, Long.MAX_VALUE), BooleanClause.Occur.SHOULD)
                .build(), BooleanClause.Occur.FILTER);

            // Country constraint: absent = universal
            if (ctx.country() != null) {
                b.add(optionalConstraint("_has_country", "_v_country", ctx.country()),
                      BooleanClause.Occur.FILTER);
            }

            // Profile constraint
            if (ctx.profile() != null) {
                b.add(optionalConstraint("_has_profile", "_v_profile", ctx.profile()),
                      BooleanClause.Occur.FILTER);
            }

            Query query = b.build();

            DstCollector collector = new DstCollector();
            searcher.search(query, collector);
            return collector.dstIds(searcher);
        } finally {
            searcherManager.release(searcher);
        }
    }

    // ── Private helpers ──────────────────────────────────────

    /** Implements "absent = universal" pattern for a constraint dimension. */
    private Query optionalConstraint(String hasFlag, String field, String value) {
        return new BooleanQuery.Builder()
            .add(new BooleanQuery.Builder()
                .add(new TermQuery(new Term(hasFlag, "true")), BooleanClause.Occur.MUST_NOT)
                .add(new MatchAllDocsQuery(), BooleanClause.Occur.MUST)
                .build(), BooleanClause.Occur.SHOULD)
            .add(new TermQuery(new Term(field, value)), BooleanClause.Occur.SHOULD)
            .build();
    }

    /** Collects destination IDs without scoring overhead. */
    static class DstCollector extends SimpleCollector {
        private final List<Integer> docIds = new ArrayList<>();
        private LeafReaderContext   ctx;

        @Override public void collect(int doc)  { docIds.add(ctx.docBase + doc); }
        @Override protected void doSetNextReader(LeafReaderContext c) { this.ctx = c; }
        @Override public ScoreMode scoreMode()  { return ScoreMode.COMPLETE_NO_SCORES; }

        Set<String> dstIds(IndexSearcher searcher) throws IOException {
            Set<String> ids = new HashSet<>();
            var stored = searcher.storedFields();
            for (int d : docIds) {
                String dst = stored.document(d).get("_dst");
                if (dst != null) ids.add(dst);
            }
            return ids;
        }
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
        directory.close();
    }
}
