package main

import (
	"fmt"
	"net/url"
	"strings"
	"time"
)

// msEntry is one resource in a 207 Multi-Status body.
type msEntry struct {
	href             string
	displayName      string
	collection       bool
	contentLength    *int64
	contentType      string
	lastModifiedHTTP string
}

// writeMultistatus renders a hand-rolled RFC 4918 207 body (port of
// MultiStatusWriter.write). Only the properties common clients (Finder,
// Explorer, davfs2) read are emitted.
func writeMultistatus(entries []msEntry) string {
	var sb strings.Builder
	sb.Grow(512)
	sb.WriteString("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n")
	sb.WriteString("<D:multistatus xmlns:D=\"DAV:\">\n")
	for _, e := range entries {
		sb.WriteString("  <D:response>\n")
		sb.WriteString("    <D:href>" + escapeXML(e.href) + "</D:href>\n")
		sb.WriteString("    <D:propstat>\n")
		sb.WriteString("      <D:prop>\n")
		sb.WriteString("        <D:displayname>" + escapeXML(e.displayName) + "</D:displayname>\n")
		if e.collection {
			sb.WriteString("        <D:resourcetype><D:collection/></D:resourcetype>\n")
		} else {
			sb.WriteString("        <D:resourcetype/>\n")
			if e.contentLength != nil {
				sb.WriteString(fmt.Sprintf("        <D:getcontentlength>%d</D:getcontentlength>\n", *e.contentLength))
			}
			if strings.TrimSpace(e.contentType) != "" {
				sb.WriteString("        <D:getcontenttype>" + escapeXML(e.contentType) + "</D:getcontenttype>\n")
			}
		}
		if e.lastModifiedHTTP != "" {
			sb.WriteString("        <D:getlastmodified>" + escapeXML(e.lastModifiedHTTP) + "</D:getlastmodified>\n")
		}
		sb.WriteString("      </D:prop>\n")
		sb.WriteString("      <D:status>HTTP/1.1 200 OK</D:status>\n")
		sb.WriteString("    </D:propstat>\n")
		sb.WriteString("  </D:response>\n")
	}
	sb.WriteString("</D:multistatus>\n")
	return sb.String()
}

// href builds an RFC 3986 percent-encoded href; collections always end with '/'.
func href(base string, segments []string, collection bool) string {
	var sb strings.Builder
	sb.WriteString(base)
	for _, segment := range segments {
		sb.WriteByte('/')
		sb.WriteString(encodePathSegment(segment))
	}
	if collection || len(segments) == 0 {
		sb.WriteByte('/')
	}
	return sb.String()
}

// encodePathSegment percent-encodes a single path segment (keeps it path-safe;
// encodes '/', '?', '#', spaces, etc.).
func encodePathSegment(s string) string {
	// url.PathEscape leaves some sub-delims unescaped but encodes the segment
	// separators and reserved chars that matter for hrefs.
	return url.PathEscape(s)
}

// httpDate converts an ISO LocalDateTime (no zone) to an RFC 1123 UTC date, the
// format WebDAV's getlastmodified expects. Returns "" on parse failure.
func httpDate(isoLocal string) string {
	if strings.TrimSpace(isoLocal) == "" {
		return ""
	}
	// created_at is an ISO local date-time without zone, e.g. 2026-06-16T10:11:12
	layouts := []string{"2006-01-02T15:04:05.999999999", "2006-01-02T15:04:05", "2006-01-02T15:04"}
	for _, l := range layouts {
		if ts, err := time.Parse(l, isoLocal); err == nil {
			return ts.UTC().Format(http1123)
		}
	}
	return ""
}

// http1123 is the RFC 1123 layout with GMT, as required by HTTP-date.
const http1123 = "Mon, 02 Jan 2006 15:04:05 GMT"

func escapeXML(s string) string {
	if s == "" {
		return ""
	}
	var sb strings.Builder
	sb.Grow(len(s))
	for _, c := range s {
		switch c {
		case '<':
			sb.WriteString("&lt;")
		case '>':
			sb.WriteString("&gt;")
		case '&':
			sb.WriteString("&amp;")
		case '"':
			sb.WriteString("&quot;")
		default:
			sb.WriteRune(c)
		}
	}
	return sb.String()
}
