package platformlib

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
)

// regFor builds a registry whose serviceCode points at the test server.
func regFor(code, baseURL string) *LocalServiceRegistry {
	r := NewLocalServiceRegistry()
	r.UpdateFromSnapshot(RegistrySnapshot{Version: 1, Services: map[string][]ServiceInstanceInfo{
		code: {{InstanceID: "t", BaseURL: baseURL, Healthy: true}},
	}})
	return r
}

func TestServiceClientForwardsContextHeaders(t *testing.T) {
	var gotSecret, gotAuth, gotPS, gotJob string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotSecret = r.Header.Get("X-Service-Secret")
		gotAuth = r.Header.Get("Authorization")
		gotPS = r.Header.Get("X-PLM-ProjectSpace")
		gotJob = r.Header.Get("X-Job-Id")
		w.Write([]byte(`{"ok":true}`))
	}))
	defer srv.Close()

	c := NewServiceClient(regFor("psm", srv.URL), "svc-secret")
	ctx := WithRequestContext(context.Background(), &RequestContext{
		Bearer: "jwt-abc", ProjectSpace: "ps-9", JobID: "job-7",
	})
	var out map[string]any
	if err := c.GetJSON(ctx, "psm", "/nodes", &out); err != nil {
		t.Fatal(err)
	}
	if gotSecret != "svc-secret" {
		t.Errorf("X-Service-Secret = %q", gotSecret)
	}
	if gotAuth != "Bearer jwt-abc" {
		t.Errorf("Authorization = %q", gotAuth)
	}
	if gotPS != "ps-9" {
		t.Errorf("X-PLM-ProjectSpace = %q", gotPS)
	}
	if gotJob != "job-7" {
		t.Errorf("X-Job-Id = %q", gotJob)
	}
	if out["ok"] != true {
		t.Errorf("body not decoded: %+v", out)
	}
}

func TestServiceClientRetriesOn5xx(t *testing.T) {
	var hits int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if atomic.AddInt32(&hits, 1) < 3 {
			w.WriteHeader(http.StatusBadGateway)
			return
		}
		w.Write([]byte(`{"ok":true}`))
	}))
	defer srv.Close()

	c := NewServiceClient(regFor("psm", srv.URL), "s")
	var out map[string]any
	if err := c.GetJSON(context.Background(), "psm", "/x", &out); err != nil {
		t.Fatalf("expected success after retries, got %v", err)
	}
	if got := atomic.LoadInt32(&hits); got != 3 {
		t.Fatalf("expected 3 attempts, got %d", got)
	}
}

func TestServiceClientNoRetryOn4xx(t *testing.T) {
	var hits int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt32(&hits, 1)
		w.WriteHeader(http.StatusNotFound)
	}))
	defer srv.Close()

	c := NewServiceClient(regFor("psm", srv.URL), "s")
	status, _, err := c.RequestRaw(context.Background(), http.MethodGet, "psm", "/x", nil, "")
	if err == nil {
		t.Fatal("expected error on 4xx")
	}
	if status != http.StatusNotFound {
		t.Errorf("status = %d", status)
	}
	if got := atomic.LoadInt32(&hits); got != 1 {
		t.Fatalf("expected 1 attempt (no retry on 4xx), got %d", got)
	}
}

func TestServiceClientStreamRaw(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/octet-stream")
		w.Write([]byte("filebytes"))
	}))
	defer srv.Close()

	c := NewServiceClient(regFor("dst", srv.URL), "s")
	resp, err := c.StreamRaw(context.Background(), http.MethodGet, "dst", "/data/1/content")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	buf := new(strings.Builder)
	if _, err := io.Copy(buf, resp.Body); err != nil {
		t.Fatal(err)
	}
	if buf.String() != "filebytes" {
		t.Fatalf("body = %q", buf.String())
	}
}

func TestServiceClientNoInstance(t *testing.T) {
	c := NewServiceClient(NewLocalServiceRegistry(), "s")
	ctx, cancel := context.WithTimeout(context.Background(), 50*1000*1000) // 50ms
	defer cancel()
	if err := c.GetJSON(ctx, "ghost", "/x", nil); err == nil {
		t.Fatal("expected error when registry has no instance")
	}
}
