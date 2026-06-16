package main

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

// hrefBase is the gateway-facing prefix the client uses. spe-api strips it
// inbound; we re-add it on every emitted href so follow-up requests route back.
const hrefBase = "/api/" + serviceCode

const allowHeader = "OPTIONS, PROPFIND, GET, HEAD"

var writeMethods = map[string]bool{
	"PUT": true, "POST": true, "DELETE": true, "MKCOL": true, "COPY": true,
	"MOVE": true, "PROPPATCH": true, "LOCK": true, "UNLOCK": true,
}

// davHandler is the WebDAV protocol entry point (port of WebDavFilter).
// Read-only: OPTIONS, PROPFIND (Depth 0/1), GET, HEAD; write verbs get 405.
type davHandler struct {
	tree *Tree
}

func (h *davHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "OPTIONS":
		h.handleOptions(w)
	case "PROPFIND":
		h.handlePropfind(w, r)
	case "GET", "HEAD":
		h.handleGet(w, r, r.Method == "HEAD")
	default:
		if writeMethods[r.Method] {
			w.Header().Set("Allow", allowHeader)
			http.Error(w, "Read-only WebDAV", http.StatusMethodNotAllowed)
			return
		}
		http.NotFound(w, r)
	}
}

func (h *davHandler) handleOptions(w http.ResponseWriter) {
	w.Header().Set("DAV", "1")
	w.Header().Set("Allow", allowHeader)
	w.Header().Set("MS-Author-Via", "DAV")
	w.WriteHeader(http.StatusOK)
}

func (h *davHandler) handlePropfind(w http.ResponseWriter, r *http.Request) {
	depthHeader := r.Header.Get("Depth")
	// RFC default is infinity, which we refuse (RFC 4918 allows 403 here).
	if depthHeader == "" || strings.EqualFold(depthHeader, "infinity") {
		http.Error(w, "Depth: infinity not supported", http.StatusForbidden)
		return
	}
	depth := 0
	if strings.TrimSpace(depthHeader) == "1" {
		depth = 1
	}

	segments := segments(r.URL.Path)
	resource, ok := h.tree.Resolve(r.Context(), segments)
	if !ok {
		http.NotFound(w, r)
		return
	}

	entries := []msEntry{entryFor(resource, segments)}
	if depth == 1 && resource.IsCollection() {
		for _, child := range h.tree.Children(r.Context(), resource) {
			childSegments := append(append([]string{}, segments...), child.Name())
			entries = append(entries, entryFor(child, childSegments))
		}
	}

	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	w.WriteHeader(http.StatusMultiStatus)
	_, _ = w.Write([]byte(writeMultistatus(entries)))
}

func (h *davHandler) handleGet(w http.ResponseWriter, r *http.Request, headOnly bool) {
	segments := segments(r.URL.Path)
	resource, ok := h.tree.Resolve(r.Context(), segments)
	if !ok {
		http.NotFound(w, r)
		return
	}
	if resource.IsCollection() {
		// Browsers GET collections; WebDAV clients use PROPFIND.
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		if !headOnly {
			_, _ = fmt.Fprintf(w, "%s/ (WebDAV collection — use PROPFIND)", resource.Name())
		}
		return
	}
	file := resource.(fileEntry)
	if headOnly {
		if file.contentType != "" {
			w.Header().Set("Content-Type", file.contentType)
		}
		if file.sizeBytes != nil {
			w.Header().Set("Content-Length", fmt.Sprint(*file.sizeBytes))
		}
		w.WriteHeader(http.StatusOK)
		return
	}
	h.tree.StreamFile(r.Context(), file.dataID, w)
}

// entryFor builds a multistatus entry for a resource at the given path segments.
func entryFor(resource Resource, segments []string) msEntry {
	var size *int64
	var contentType, lastModified string
	switch res := resource.(type) {
	case fileEntry:
		size = res.sizeBytes
		contentType = res.contentType
	case nodeDir:
		lastModified = httpDate(res.createdAt)
	}
	name := resource.Name()
	if len(segments) == 0 {
		name = "/"
	}
	return msEntry{
		href:            href(hrefBase, segments, resource.IsCollection()),
		displayName:     name,
		collection:      resource.IsCollection(),
		contentLength:   size,
		contentType:     contentType,
		lastModifiedHTTP: lastModified,
	}
}

// segments splits a path into decoded, non-empty segments.
func segments(path string) []string {
	out := []string{}
	for _, raw := range strings.Split(path, "/") {
		if raw == "" {
			continue
		}
		if dec, err := url.PathUnescape(raw); err == nil {
			out = append(out, dec)
		} else {
			out = append(out, raw)
		}
	}
	return out
}
