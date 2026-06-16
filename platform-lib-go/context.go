package platformlib

import (
	"context"
	"net/http"
	"strings"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
)

// RequestContext carries inbound request state forwarded on outbound S2S calls
// — the Go analogue of the Java ServiceClientTokenContext ThreadLocal. A
// *RequestContext is stored in context.Context (by pointer) so a handler can
// mutate ProjectSpace mid-request: the WebDAV tree sets it once the
// project-space path segment resolves, mirroring DavTreeService.resolve.
type RequestContext struct {
	// Forwarded on outbound calls.
	Bearer       string
	ProjectSpace string
	JobID        string
	Traceparent  string
	Tracestate   string

	// Identity of the inbound caller (read by handlers; not re-sent as headers
	// — the Bearer already carries it).
	UserID   string
	Username string
	IsAdmin  bool
}

type reqCtxKey struct{}

// WithRequestContext binds rc to ctx (by pointer, so later mutation is visible).
func WithRequestContext(ctx context.Context, rc *RequestContext) context.Context {
	return context.WithValue(ctx, reqCtxKey{}, rc)
}

// RequestContextFrom returns the bound *RequestContext, or nil.
func RequestContextFrom(ctx context.Context) *RequestContext {
	rc, _ := ctx.Value(reqCtxKey{}).(*RequestContext)
	return rc
}

// ExtractRequestContext reads the propagated headers off an inbound request.
func ExtractRequestContext(r *http.Request) *RequestContext {
	return &RequestContext{
		Bearer:       BearerToken(r),
		ProjectSpace: r.Header.Get("X-PLM-ProjectSpace"),
		JobID:        r.Header.Get("X-Job-Id"),
		Traceparent:  r.Header.Get("traceparent"),
		Tracestate:   r.Header.Get("tracestate"),
	}
}

// BearerToken extracts the token from an "Authorization: Bearer <t>" header.
func BearerToken(r *http.Request) string {
	a := r.Header.Get("Authorization")
	if strings.HasPrefix(a, "Bearer ") {
		return strings.TrimSpace(a[len("Bearer "):])
	}
	return ""
}

// Authenticate is a net/http middleware that verifies the inbound forward JWT,
// binds a *RequestContext to the request context and continues the W3C trace.
// Requests whose path matches a public prefix bypass verification; missing or
// invalid tokens get 401.
func Authenticate(codec *Codec, publicPaths []string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			for _, p := range publicPaths {
				if strings.HasPrefix(r.URL.Path, p) {
					next.ServeHTTP(w, r)
					return
				}
			}
			token := BearerToken(r)
			if token == "" {
				http.Error(w, "missing Authorization", http.StatusUnauthorized)
				return
			}
			user, err := codec.VerifyForward(token)
			if err != nil || user.UserID == "" {
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}
			rc := ExtractRequestContext(r)
			rc.UserID = user.UserID
			rc.Username = user.Username
			rc.IsAdmin = user.IsAdmin
			// Default the space to the token claim; the path resolver may
			// override it once the space segment is known.
			if rc.ProjectSpace == "" {
				rc.ProjectSpace = user.ProjectSpaceID
			}
			ctx := WithRequestContext(r.Context(), rc)
			// Continue the distributed trace (spe-api injected W3C headers).
			ctx = otel.GetTextMapPropagator().Extract(ctx, propagation.HeaderCarrier(r.Header))
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
