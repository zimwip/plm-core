// ws-gateway (Go) — NATS → WebSocket push relay. Port of the Java ws-gateway.
//
// External path /api/ws is reached through spe-api, which verifies the session
// token and injects a forward JWT (typ=fwd) on the Authorization header before
// proxying the upgrade. This service verifies that forward JWT, then bridges
// NATS subjects (global.> plus a per-project subscription) to the browser.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gorilla/websocket"
	platformlib "github.com/plm/platform-lib-go"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"
)

const serviceCode = "ws"

func env(key, def string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return def
}

func main() {
	secret := os.Getenv("PLM_SERVICE_SECRET")
	if secret == "" {
		log.Fatal("PLM_SERVICE_SECRET is required")
	}
	codec, err := platformlib.NewCodec(secret, atoiDefault(env("PLM_JWT_CLOCK_SKEW_SECONDS", "5"), 5))
	if err != nil {
		log.Fatalf("codec: %v", err)
	}

	port := env("WS_PORT", "8085")
	registry := platformlib.NewLocalServiceRegistry()

	// NATS is required for a push relay.
	bus, err := platformlib.ConnectNats(env("NATS_URL", "nats://nats:4222"), serviceCode)
	if err != nil {
		log.Fatalf("nats connect: %v", err)
	}
	defer bus.Close()

	// Self-register so spe-api can route /api/ws to this instance.
	registrar := platformlib.NewRegistrar(platformlib.RegistrationConfig{
		ServiceCode:   serviceCode,
		SelfBaseURL:   env("SPE_SELF_BASE_URL", "http://ws-gateway:8085"),
		PlatformURL:   env("PLM_PLATFORM_URL", "http://platform-api:8084"),
		ServiceSecret: secret,
		SpaceTag:      env("SPE_SPACE_TAG", ""),
		Version:       "0.1.0",
	}, registry)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go func() {
		registrar.RegisterWithBackoff(ctx)
		registrar.Run(ctx, bus)
	}()

	// OpenTelemetry: OTLP export + W3C propagation (same Jaeger as the Java
	// services). Non-fatal — the relay still runs if the collector is absent.
	if shutdown, err := platformlib.InitTracer(ctx, serviceCode, env("OTEL_EXPORTER_OTLP_ENDPOINT", "http://jaeger:4318")); err != nil {
		log.Printf("otel init failed: %v", err)
	} else {
		defer func() { _ = shutdown(context.Background()) }()
	}

	upgrader := websocket.Upgrader{
		// spe-api terminates auth and origin; allow all here.
		CheckOrigin: func(_ *http.Request) bool { return true },
	}

	wsHandler := func(w http.ResponseWriter, r *http.Request) {
		token := bearerToken(r)
		if token == "" {
			log.Printf("WS handshake rejected: no Authorization header")
			http.Error(w, "missing Authorization", http.StatusUnauthorized)
			return
		}
		user, err := codec.VerifyForward(token)
		if err != nil || user.UserID == "" {
			log.Printf("WS handshake rejected: invalid forward JWT: %v", err)
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}
		// Continue the distributed trace: extract the inbound W3C context
		// (spe-api injected it on the upgrade request) and open a connection span.
		traceCtx := otel.GetTextMapPropagator().Extract(r.Context(), propagation.HeaderCarrier(r.Header))
		_, span := otel.Tracer(serviceCode).Start(traceCtx, "ws.connect", trace.WithSpanKind(trace.SpanKindServer))
		span.SetAttributes(attribute.String("plm.user_id", user.UserID))

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("WS upgrade failed: %v", err)
			span.End()
			return
		}
		log.Printf("WS connected: user=%s", user.UserID)
		session := &wsSession{conn: conn, bus: bus, userID: user.UserID, span: span}
		go session.run()
	}

	// The gateway strips /api/ws, so the upgrade arrives at root "/".
	// "/actuator/health" is more specific and matches first.
	mux := http.NewServeMux()
	mux.HandleFunc("/actuator/health", healthHandler)
	mux.HandleFunc("/", wsHandler)

	addr := "0.0.0.0:" + port
	log.Printf("ws-gateway (go) listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("serve: %v", err)
	}
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(`{"status":"UP"}`))
}

func bearerToken(r *http.Request) string {
	authz := r.Header.Get("Authorization")
	if strings.HasPrefix(authz, "Bearer ") {
		return strings.TrimSpace(authz[len("Bearer "):])
	}
	return ""
}

func atoiDefault(s string, def int) int {
	if n, err := strconv.Atoi(s); err == nil {
		return n
	}
	return def
}
