// webdav (Go) — read-only WebDAV view of the PLM graph. Port of the Java
// webdav service. External path /api/dav reaches this service through spe-api,
// which verifies the session token and injects a forward JWT (typ=fwd) on the
// Authorization header before stripping the /api/dav prefix and proxying.
//
// This service serves at root (no Spring context-path): spe-api owns the
// /api/dav segregation. Hrefs emitted in PROPFIND bodies re-add /api/dav so the
// client's follow-up requests route back through the gateway.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strconv"

	platformlib "github.com/plm/platform-lib-go"
)

const serviceCode = "dav"

func env(key, def string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return def
}

func atoiDefault(s string, def int) int {
	if n, err := strconv.Atoi(s); err == nil {
		return n
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

	port := env("WEBDAV_PORT", "8089")
	registry := platformlib.NewLocalServiceRegistry()
	client := platformlib.NewServiceClient(registry, secret)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// NATS is optional — used only to refresh the config snapshot on
	// CONFIG_CHANGED. The service still runs (with periodic refresh) without it.
	var bus *platformlib.Bus
	if env("PLM_NATS_ENABLED", "false") == "true" {
		if b, err := platformlib.ConnectNats(env("NATS_URL", "nats://nats:4222"), serviceCode); err != nil {
			log.Printf("nats connect failed: %v", err)
		} else {
			bus = b
			defer bus.Close()
		}
	}

	// Self-register so spe-api can route /api/dav to this instance, and so the
	// local registry is populated for our own S2S calls to pno/psm/dst/psa.
	registrar := platformlib.NewRegistrar(platformlib.RegistrationConfig{
		ServiceCode:   serviceCode,
		SelfBaseURL:   env("SPE_SELF_BASE_URL", "http://webdav:8089"),
		PlatformURL:   env("PLM_PLATFORM_URL", "http://platform-api:8084"),
		ServiceSecret: secret,
		SpaceTag:      env("SPE_SPACE_TAG", ""),
		Version:       "0.1.0",
	}, registry)
	go func() {
		registrar.RegisterWithBackoff(ctx)
		registrar.Run(ctx, bus)
	}()

	// Metamodel flags (webdav.directory / webdav.file) come from the psm-admin
	// config snapshot. Backgrounded: the initial pull waits for the registry.
	config := platformlib.NewConfigCache(client)
	go config.Start(ctx, bus)

	// OpenTelemetry: OTLP export + W3C propagation into the shared Jaeger.
	if shutdown, err := platformlib.InitTracer(ctx, serviceCode, env("OTEL_EXPORTER_OTLP_ENDPOINT", "http://jaeger:4318")); err != nil {
		log.Printf("otel init failed: %v", err)
	} else {
		defer func() { _ = shutdown(context.Background()) }()
	}

	handler := &davHandler{tree: NewTree(client, config)}

	mux := http.NewServeMux()
	mux.HandleFunc("/actuator/health", healthHandler)
	mux.Handle("/", platformlib.Authenticate(codec,
		[]string{"/actuator", "/v3", "/swagger-ui", "/error"})(handler))

	addr := "0.0.0.0:" + port
	log.Printf("webdav (go) listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("serve: %v", err)
	}
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(`{"status":"UP"}`))
}
