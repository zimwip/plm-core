package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	platformlib "github.com/plm/platform-lib-go"
)

func TestHrefEncoding(t *testing.T) {
	got := href(hrefBase, []string{"space 1", "dir"}, true)
	if got != "/api/dav/space%201/dir/" {
		t.Fatalf("href = %q", got)
	}
	if f := href(hrefBase, []string{"a", "f.txt"}, false); f != "/api/dav/a/f.txt" {
		t.Fatalf("file href = %q", f)
	}
	if r := href(hrefBase, nil, true); r != "/api/dav/" {
		t.Fatalf("root href = %q", r)
	}
}

func TestSegments(t *testing.T) {
	got := segments("/space%201/dir/")
	if len(got) != 2 || got[0] != "space 1" || got[1] != "dir" {
		t.Fatalf("segments = %#v", got)
	}
	if len(segments("/")) != 0 {
		t.Fatal("root should yield no segments")
	}
}

func TestMultistatusCollectionVsFile(t *testing.T) {
	size := int64(42)
	body := writeMultistatus([]msEntry{
		{href: "/api/dav/", displayName: "/", collection: true},
		{href: "/api/dav/a/f.txt", displayName: "f.txt", collection: false, contentLength: &size, contentType: "text/plain"},
	})
	if !strings.Contains(body, "<D:resourcetype><D:collection/></D:resourcetype>") {
		t.Error("missing collection resourcetype")
	}
	if !strings.Contains(body, "<D:getcontentlength>42</D:getcontentlength>") {
		t.Error("missing content length")
	}
	if !strings.Contains(body, "<D:getcontenttype>text/plain</D:getcontenttype>") {
		t.Error("missing content type")
	}
}

func TestHTTPDate(t *testing.T) {
	if d := httpDate("2026-06-16T10:11:12"); !strings.HasSuffix(d, "GMT") {
		t.Fatalf("httpDate = %q", d)
	}
	if httpDate("") != "" {
		t.Fatal("blank should yield empty")
	}
}

// TestPropfindRoot exercises the full handler → tree → pno path: a Depth-1
// PROPFIND on root must list one collection per project space.
func TestPropfindRoot(t *testing.T) {
	pno := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.URL.RawQuery, "userId=u1") {
			t.Errorf("pno query = %q", r.URL.RawQuery)
		}
		w.Write([]byte(`[{"id":"ps1","name":"Space One"}]`))
	}))
	defer pno.Close()

	reg := platformlib.NewLocalServiceRegistry()
	reg.UpdateFromSnapshot(platformlib.RegistrySnapshot{Version: 1, Services: map[string][]platformlib.ServiceInstanceInfo{
		"pno": {{InstanceID: "p", BaseURL: pno.URL, Healthy: true}},
	}})
	client := platformlib.NewServiceClient(reg, "s")
	handler := &davHandler{tree: NewTree(client, platformlib.NewConfigCache(client))}

	req := httptest.NewRequest("PROPFIND", "/", nil)
	req.Header.Set("Depth", "1")
	ctx := platformlib.WithRequestContext(req.Context(), &platformlib.RequestContext{UserID: "u1"})
	req = req.WithContext(ctx)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusMultiStatus {
		t.Fatalf("status = %d", rec.Code)
	}
	body := rec.Body.String()
	if !strings.Contains(body, "<D:href>/api/dav/</D:href>") {
		t.Error("missing root href")
	}
	if !strings.Contains(body, "<D:href>/api/dav/Space%20One/</D:href>") {
		t.Errorf("missing space href; body=%s", body)
	}
	if !strings.Contains(body, "<D:displayname>Space One</D:displayname>") {
		t.Error("missing space displayname")
	}
}

func TestPropfindInfinityRejected(t *testing.T) {
	handler := &davHandler{tree: NewTree(nil, nil)}
	req := httptest.NewRequest("PROPFIND", "/", nil)
	req.Header.Set("Depth", "infinity")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want 403", rec.Code)
	}
}

func TestWriteMethodRejected(t *testing.T) {
	handler := &davHandler{tree: NewTree(nil, nil)}
	req := httptest.NewRequest("PUT", "/x", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want 405", rec.Code)
	}
	if rec.Header().Get("Allow") != allowHeader {
		t.Errorf("Allow = %q", rec.Header().Get("Allow"))
	}
}

func TestOptions(t *testing.T) {
	handler := &davHandler{tree: NewTree(nil, nil)}
	req := httptest.NewRequest("OPTIONS", "/", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Header().Get("DAV") != "1" {
		t.Errorf("DAV = %q", rec.Header().Get("DAV"))
	}
	if rec.Header().Get("Allow") != allowHeader {
		t.Errorf("Allow = %q", rec.Header().Get("Allow"))
	}
}
