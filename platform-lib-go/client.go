package platformlib

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
)

const (
	defaultMaxRetries = 3
	registryWait      = 15 * time.Second
)

// ServiceClient resolves a logical serviceCode to a live instance via the
// LocalServiceRegistry and performs S2S calls, attaching the service secret and
// forwarding the inbound RequestContext (auth + trace). It retries on transport
// errors and 5xx only; 4xx is terminal. Port of
// com.plm.platform.client.ServiceClient (mirrors platform-lib-rs client.rs).
//
// Paths are BARE, root-relative (e.g. "/nodes", "/internal/config/snapshot").
// The registry instance serves at root (gateway-strip routing) — do NOT include
// the "/api/<code>" prefix, which is gateway-facing only.
type ServiceClient struct {
	registry   *LocalServiceRegistry
	secret     string
	http       *http.Client
	maxRetries int
}

func NewServiceClient(registry *LocalServiceRegistry, secret string) *ServiceClient {
	return &ServiceClient{
		registry:   registry,
		secret:     secret,
		http:       &http.Client{Timeout: 30 * time.Second},
		maxRetries: defaultMaxRetries,
	}
}

// UpstreamError is a non-2xx response surfaced so callers (and the retry policy)
// can classify it.
type UpstreamError struct {
	Status int
	Body   string
}

func (e *UpstreamError) Error() string {
	return fmt.Sprintf("upstream status %d: %s", e.Status, e.Body)
}

// GetJSON performs GET serviceCode/path and decodes the JSON body into out
// (pass nil to discard).
func (c *ServiceClient) GetJSON(ctx context.Context, serviceCode, path string, out any) error {
	_, body, err := c.RequestRaw(ctx, http.MethodGet, serviceCode, path, nil, "")
	if err != nil {
		return err
	}
	if out == nil {
		return nil
	}
	return json.Unmarshal(body, out)
}

// PostJSON performs POST serviceCode/path with a JSON body and decodes the reply
// into out (pass nil to discard).
func (c *ServiceClient) PostJSON(ctx context.Context, serviceCode, path string, body, out any) error {
	payload, err := json.Marshal(body)
	if err != nil {
		return err
	}
	_, resp, err := c.RequestRaw(ctx, http.MethodPost, serviceCode, path, payload, "application/json")
	if err != nil {
		return err
	}
	if out == nil {
		return nil
	}
	return json.Unmarshal(resp, out)
}

// RequestRaw performs the call and buffers the response body. On a non-2xx it
// returns the status, body and an *UpstreamError.
func (c *ServiceClient) RequestRaw(ctx context.Context, method, serviceCode, path string, body []byte, contentType string) (int, []byte, error) {
	resp, err := c.request(ctx, method, serviceCode, path, body, contentType)
	if err != nil {
		if ue, ok := err.(*UpstreamError); ok {
			return ue.Status, []byte(ue.Body), err
		}
		return 0, nil, err
	}
	defer resp.Body.Close()
	b, err := io.ReadAll(resp.Body)
	return resp.StatusCode, b, err
}

// StreamRaw performs the call and returns the live response so the body streams
// to the caller without buffering (used to proxy dst content). The caller MUST
// close resp.Body.
func (c *ServiceClient) StreamRaw(ctx context.Context, method, serviceCode, path string) (*http.Response, error) {
	return c.request(ctx, method, serviceCode, path, nil, "")
}

// request runs the resolve + retry loop and returns a live 2xx response (caller
// closes Body) or an error. Transport errors and 5xx retry with backoff; 4xx is
// terminal.
func (c *ServiceClient) request(ctx context.Context, method, serviceCode, path string, body []byte, contentType string) (*http.Response, error) {
	c.awaitRegistry(ctx)
	var lastErr error
	for attempt := 0; ; attempt++ {
		var rdr io.Reader
		if body != nil {
			rdr = bytes.NewReader(body)
		}
		resp, err := c.send(ctx, method, serviceCode, path, rdr, contentType)
		if err != nil {
			lastErr = err
			if attempt < c.maxRetries {
				c.backoff(ctx, attempt)
				continue
			}
			return nil, lastErr
		}
		if resp.StatusCode >= 500 {
			b, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			lastErr = &UpstreamError{Status: resp.StatusCode, Body: string(b)}
			if attempt < c.maxRetries {
				c.backoff(ctx, attempt)
				continue
			}
			return nil, lastErr
		}
		if resp.StatusCode >= 400 {
			b, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			return nil, &UpstreamError{Status: resp.StatusCode, Body: string(b)}
		}
		return resp, nil
	}
}

// send issues a single attempt against a freshly-picked instance.
func (c *ServiceClient) send(ctx context.Context, method, serviceCode, path string, body io.Reader, contentType string) (*http.Response, error) {
	inst, ok := c.registry.PickInstance(serviceCode)
	if !ok {
		return nil, fmt.Errorf("no instance for service %s", serviceCode)
	}
	url := strings.TrimRight(inst.BaseURL, "/") + path
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-Service-Secret", c.secret)
	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}
	if rc := RequestContextFrom(ctx); rc != nil {
		if rc.Bearer != "" {
			req.Header.Set("Authorization", "Bearer "+rc.Bearer)
		}
		if rc.ProjectSpace != "" {
			req.Header.Set("X-PLM-ProjectSpace", rc.ProjectSpace)
		}
		if rc.JobID != "" {
			req.Header.Set("X-Job-Id", rc.JobID)
		}
		if rc.Traceparent != "" {
			req.Header.Set("traceparent", rc.Traceparent)
		}
		if rc.Tracestate != "" {
			req.Header.Set("tracestate", rc.Tracestate)
		}
	}
	// Inject the current span context (canonical W3C propagation; overrides the
	// raw copy above when a live span exists).
	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))
	return c.http.Do(req)
}

func (c *ServiceClient) awaitRegistry(ctx context.Context) {
	if c.registry.IsPopulated() {
		return
	}
	wctx, cancel := context.WithTimeout(ctx, registryWait)
	defer cancel()
	c.registry.AwaitPopulated(wctx)
}

func (c *ServiceClient) backoff(ctx context.Context, attempt int) {
	d := time.Duration(100*(1<<uint(attempt))) * time.Millisecond
	select {
	case <-time.After(d):
	case <-ctx.Done():
	}
}
