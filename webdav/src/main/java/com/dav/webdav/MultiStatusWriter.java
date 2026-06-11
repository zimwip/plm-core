package com.dav.webdav;

import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Hand-rolled RFC 4918 207 Multi-Status body for PROPFIND responses.
 * Only the properties common WebDAV clients (Finder, Explorer, davfs2) read.
 */
final class MultiStatusWriter {

    record Entry(String href, String displayName, boolean collection,
                 Long contentLength, String contentType, String lastModifiedHttp) {}

    private MultiStatusWriter() {}

    static String write(List<Entry> entries) {
        StringBuilder sb = new StringBuilder(512);
        sb.append("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        sb.append("<D:multistatus xmlns:D=\"DAV:\">\n");
        for (Entry e : entries) {
            sb.append("  <D:response>\n");
            sb.append("    <D:href>").append(escapeXml(e.href())).append("</D:href>\n");
            sb.append("    <D:propstat>\n");
            sb.append("      <D:prop>\n");
            sb.append("        <D:displayname>").append(escapeXml(e.displayName())).append("</D:displayname>\n");
            if (e.collection()) {
                sb.append("        <D:resourcetype><D:collection/></D:resourcetype>\n");
            } else {
                sb.append("        <D:resourcetype/>\n");
                if (e.contentLength() != null) {
                    sb.append("        <D:getcontentlength>").append(e.contentLength())
                      .append("</D:getcontentlength>\n");
                }
                if (e.contentType() != null && !e.contentType().isBlank()) {
                    sb.append("        <D:getcontenttype>").append(escapeXml(e.contentType()))
                      .append("</D:getcontenttype>\n");
                }
            }
            if (e.lastModifiedHttp() != null) {
                sb.append("        <D:getlastmodified>").append(escapeXml(e.lastModifiedHttp()))
                  .append("</D:getlastmodified>\n");
            }
            sb.append("      </D:prop>\n");
            sb.append("      <D:status>HTTP/1.1 200 OK</D:status>\n");
            sb.append("    </D:propstat>\n");
            sb.append("  </D:response>\n");
        }
        sb.append("</D:multistatus>\n");
        return sb.toString();
    }

    /** Builds an RFC 3986 percent-encoded href; collections always end with '/'. */
    static String href(String contextPath, List<String> segments, boolean collection) {
        StringBuilder sb = new StringBuilder(contextPath);
        for (String segment : segments) {
            sb.append('/').append(UriUtils.encodePathSegment(segment, StandardCharsets.UTF_8));
        }
        if (collection || segments.isEmpty()) sb.append('/');
        return sb.toString();
    }

    static String escapeXml(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder(s.length());
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '<' -> sb.append("&lt;");
                case '>' -> sb.append("&gt;");
                case '&' -> sb.append("&amp;");
                case '"' -> sb.append("&quot;");
                default  -> sb.append(c);
            }
        }
        return sb.toString();
    }
}
