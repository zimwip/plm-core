package com.dav.webdav;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MultiStatusWriterTest {

    @Test
    void escapesXmlSpecials() {
        assertEquals("a&amp;b &lt;tag&gt; &quot;q&quot;", MultiStatusWriter.escapeXml("a&b <tag> \"q\""));
    }

    @Test
    void hrefEncodesSegmentsAndTrailingSlashOnCollections() {
        assertEquals("/api/dav/Default%20Space/PRJ-001/",
            MultiStatusWriter.href("/api/dav", List.of("Default Space", "PRJ-001"), true));
        assertEquals("/api/dav/Default%20Space/spec%20v1.pdf",
            MultiStatusWriter.href("/api/dav", List.of("Default Space", "spec v1.pdf"), false));
        assertEquals("/api/dav/", MultiStatusWriter.href("/api/dav", List.of(), false));
    }

    @Test
    void writesCollectionAndFileEntries() {
        String xml = MultiStatusWriter.write(List.of(
            new MultiStatusWriter.Entry("/api/dav/Space/PRJ-001/", "PRJ-001", true, null, null, null),
            new MultiStatusWriter.Entry("/api/dav/Space/PRJ-001/spec.pdf", "spec.pdf", false,
                48211L, "application/pdf", "Tue, 10 Jun 2026 12:00:00 GMT")));

        assertTrue(xml.contains("<D:multistatus xmlns:D=\"DAV:\">"));
        assertTrue(xml.contains("<D:href>/api/dav/Space/PRJ-001/</D:href>"));
        assertTrue(xml.contains("<D:resourcetype><D:collection/></D:resourcetype>"));
        assertTrue(xml.contains("<D:getcontentlength>48211</D:getcontentlength>"));
        assertTrue(xml.contains("<D:getcontenttype>application/pdf</D:getcontenttype>"));
        assertTrue(xml.contains("<D:getlastmodified>Tue, 10 Jun 2026 12:00:00 GMT</D:getlastmodified>"));
        assertFalse(xml.contains("<D:getcontentlength></D:getcontentlength>"));
    }
}
