package com.plm.search.extractor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.search.extractor.ItemEventExtractor.IndexEntry;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class DstDataExtractorTest {

    private final DstDataExtractor extractor = new DstDataExtractor(new ObjectMapper());

    @Test
    void sourceCodeIsDst() {
        assertThat(extractor.sourceCode()).isEqualTo("dst");
    }

    @Test
    void extractsUpsertFromDstItemCreatedEvent() {
        Map<String, Object> event = Map.of(
            "source", "dst",
            "itemId", "file-123",
            "payload", Map.of(
                "typeCode", "data-object",
                "type", "data-object",
                "projectSpaceId", "ps-1",
                "fields", List.of(
                    Map.of("name", "originalName", "valueType", "string", "values", List.of("spec.pdf")),
                    Map.of("name", "contentType",  "valueType", "enum",   "values", List.of("application/pdf")),
                    Map.of("name", "sizeBytes",    "valueType", "number", "values", List.of(2048L))
                )
            )
        );

        Optional<IndexEntry> result = extractor.extractUpsert(event);

        assertThat(result).isPresent();
        IndexEntry entry = result.get();
        assertThat(entry.id()).isEqualTo("file-123");
        assertThat(entry.serviceCode()).isEqualTo("dst");
        assertThat(entry.itemCode()).isEqualTo("data-object");
        assertThat(entry.type()).isEqualTo("data-object");
        assertThat(entry.projectSpaceId()).isEqualTo("ps-1");
        assertThat(entry.fields()).extracting(com.plm.search.model.DynamicField::name)
            .containsExactly("originalName", "contentType", "sizeBytes");
        assertThat(entry.sourceJson()).contains("spec.pdf").contains("application/pdf");
    }

    @Test
    void emptyWhenNoPayload() {
        Map<String, Object> event = Map.of("source", "dst", "itemId", "file-123");
        assertThat(extractor.extractUpsert(event)).isEmpty();
    }

    @Test
    void emptyWhenNoItemId() {
        Map<String, Object> event = Map.of("source", "dst", "payload", Map.of("fields", List.of()));
        assertThat(extractor.extractUpsert(event)).isEmpty();
    }

    @Test
    void extractsDeleteId() {
        Map<String, Object> event = Map.of("source", "dst", "itemId", "file-123");
        assertThat(extractor.extractDelete(event)).contains("file-123");
    }
}
