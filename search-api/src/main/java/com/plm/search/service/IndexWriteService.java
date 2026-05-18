package com.plm.search.service;

import com.plm.search.extractor.ItemEventExtractor;
import com.plm.search.port.EdgeStore;
import com.plm.search.port.NodeStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Orchestrates writes to NodeStore and EdgeStore from incoming NATS events.
 * Buffers writes and flushes on threshold or idle timeout.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IndexWriteService {

    private static final int  COMMIT_EVERY   = 50;
    private static final long COMMIT_IDLE_MS = 500;

    private final NodeStore nodeStore;
    private final EdgeStore edgeStore;

    private final AtomicLong pending    = new AtomicLong(0);
    private volatile long    lastWrite  = System.currentTimeMillis();

    @SuppressWarnings("unchecked")
    public void handleEdgeUpsert(Map<String, Object> event) {
        try {
            String srcId      = (String) event.get("srcId");
            String relType    = (String) event.get("relType");
            String dstId      = (String) event.get("dstId");
            boolean structural = Boolean.parseBoolean(
                String.valueOf(event.getOrDefault("structural", "true")));
            Map<String, Object> validity = event.get("validity") instanceof Map<?,?> m
                ? (Map<String, Object>) m : Map.of();

            edgeStore.upsert(srcId, relType, dstId, structural, validity);
            markWrite();
        } catch (Exception e) {
            log.warn("edge upsert failed: {}", e.getMessage(), e);
        }
    }

    public void handleEdgeDelete(Map<String, Object> event) {
        try {
            String srcId   = (String) event.get("srcId");
            String relType = (String) event.get("relType");
            String dstId   = (String) event.get("dstId");
            edgeStore.delete(srcId, relType, dstId);
            markWrite();
        } catch (Exception e) {
            log.warn("edge delete failed: {}", e.getMessage(), e);
        }
    }

    public void indexEntry(ItemEventExtractor.IndexEntry entry) {
        try {
            nodeStore.upsert(entry.id(), entry.serviceCode(), entry.itemCode(),
                             entry.type(), entry.projectSpaceId(),
                             entry.sourceJson(), entry.fields());
            markWrite();
        } catch (Exception e) {
            log.warn("extractor upsert failed: id={} err={}", entry.id(), e.getMessage());
        }
    }

    public void deleteById(String id) {
        try {
            nodeStore.delete(id);
            edgeStore.deleteForNode(id);
            markWrite();
        } catch (Exception e) {
            log.warn("extractor delete failed: id={} err={}", id, e.getMessage());
        }
    }

    public void flush() {
        try {
            if (pending.get() > 0) {
                nodeStore.flush();
                edgeStore.flush();
                pending.set(0);
                log.debug("Search index flushed");
            }
        } catch (Exception e) {
            log.error("Search index flush failed: {}", e.getMessage(), e);
        }
    }

    private void markWrite() {
        lastWrite = System.currentTimeMillis();
        if (pending.incrementAndGet() >= COMMIT_EVERY) {
            flush();
        }
    }

    public long getLastWriteMs() { return lastWrite; }
    public long getPending()     { return pending.get(); }
    public long getIdleThresholdMs() { return COMMIT_IDLE_MS; }
}
