package platformlib

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/nats-io/nats.go"
)

const (
	// Bare paths — direct S2S calls bypass the gateway; platform-api serves
	// internal endpoints at root (gateway-strip routing).
	registerPath     = "/internal/environment/register"
	snapshotPath     = "/internal/environment/snapshot"
	reRegisterPeriod = 5 * time.Minute
)

// RegistrationConfig declares this service's identity for platform-api.
type RegistrationConfig struct {
	ServiceCode   string
	SelfBaseURL   string
	PlatformURL   string
	ServiceSecret string
	SpaceTag      string
	Version       string
	ExtraPaths    []string
	Features      []string
}

// routePrefix is gateway-facing: the prefix spe-api matches before stripping.
func (c RegistrationConfig) routePrefix() string { return "/api/" + c.ServiceCode + "/**" }

// healthURL is bare — health checks hit the instance directly, which serves
// actuator at root (gateway-strip routing).
func (c RegistrationConfig) healthURL() string {
	return strings.TrimRight(c.SelfBaseURL, "/") + "/actuator/health"
}

func (c RegistrationConfig) request() RegisterRequest {
	extra := c.ExtraPaths
	if extra == nil {
		extra = []string{}
	}
	features := c.Features
	if features == nil {
		features = []string{}
	}
	return RegisterRequest{
		ServiceCode: c.ServiceCode,
		BaseURL:     c.SelfBaseURL,
		HealthURL:   c.healthURL(),
		RoutePrefix: c.routePrefix(),
		ExtraPaths:  extra,
		Version:     c.Version,
		SpaceTag:    c.SpaceTag,
		Features:    features,
	}
}

// Registrar self-registers with platform-api and keeps the local registry
// fresh. Port of PlatformRegistrationClient.
type Registrar struct {
	cfg      RegistrationConfig
	registry *LocalServiceRegistry
	http     *http.Client

	mu         sync.Mutex
	instanceID string
}

func NewRegistrar(cfg RegistrationConfig, registry *LocalServiceRegistry) *Registrar {
	return &Registrar{
		cfg:        cfg,
		registry:   registry,
		http:       &http.Client{Timeout: 10 * time.Second},
		instanceID: InstanceID(cfg.SelfBaseURL),
	}
}

func (r *Registrar) InstanceID() string {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.instanceID
}

// RegisterOnce POSTs registration then pulls the snapshot.
func (r *Registrar) RegisterOnce(ctx context.Context) error {
	body, _ := json.Marshal(r.cfg.request())
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, r.cfg.PlatformURL+registerPath, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("X-Service-Secret", r.cfg.ServiceSecret)
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		return fmt.Errorf("registration status %d", resp.StatusCode)
	}
	var parsed RegisterResponse
	if json.NewDecoder(resp.Body).Decode(&parsed) == nil && parsed.InstanceID != "" {
		r.mu.Lock()
		r.instanceID = parsed.InstanceID
		r.mu.Unlock()
	}
	r.PullSnapshot(ctx)
	return nil
}

func (r *Registrar) PullSnapshot(ctx context.Context) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, r.cfg.PlatformURL+snapshotPath, nil)
	if err != nil {
		return
	}
	req.Header.Set("X-Service-Secret", r.cfg.ServiceSecret)
	resp, err := r.http.Do(req)
	if err != nil {
		log.Printf("snapshot pull failed: %v", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		log.Printf("snapshot pull status %d", resp.StatusCode)
		return
	}
	var snap RegistrySnapshot
	if err := json.NewDecoder(resp.Body).Decode(&snap); err != nil {
		log.Printf("snapshot decode failed: %v", err)
		return
	}
	r.registry.UpdateFromSnapshot(snap)
}

func (r *Registrar) Deregister(ctx context.Context) {
	url := fmt.Sprintf("%s%s/%s/instances/%s", r.cfg.PlatformURL, registerPath, r.cfg.ServiceCode, r.InstanceID())
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return
	}
	req.Header.Set("X-Service-Secret", r.cfg.ServiceSecret)
	if resp, err := r.http.Do(req); err == nil {
		resp.Body.Close()
		log.Printf("deregistered instance %s from platform-api", r.InstanceID())
	}
}

// RegisterWithBackoff retries the initial registration until it succeeds or
// ctx is cancelled.
func (r *Registrar) RegisterWithBackoff(ctx context.Context) {
	backoffs := []time.Duration{500, 1000, 2000, 4000, 8000, 15000, 30000}
	i := 0
	for {
		if err := r.RegisterOnce(ctx); err == nil {
			log.Printf("registered with platform-api as instance %s (tag: %s)", r.InstanceID(), tagLabel(r.cfg.SpaceTag))
			return
		} else {
			wait := backoffs[min(i, len(backoffs)-1)] * time.Millisecond
			log.Printf("platform-api registration failed: %v; retry in %v", err, wait)
			select {
			case <-time.After(wait):
				i++
			case <-ctx.Done():
				return
			}
		}
	}
}

// Run launches the background lifecycle: NATS subscriptions + periodic
// re-register. Call after RegisterWithBackoff.
func (r *Registrar) Run(ctx context.Context, bus *Bus) {
	if bus != nil {
		_, _ = bus.Subscribe("env.global.PLATFORM_RESTARTED", func(_ *nats.Msg) {
			go func() {
				time.Sleep(2 * time.Second)
				// platform-api's registry version reset on restart; drop our
				// baseline so the fresh snapshot is accepted, not rejected as stale.
				r.registry.ResetVersion()
				if r.RegisterOnce(ctx) == nil {
					log.Printf("re-registered after PLATFORM_RESTARTED")
				}
			}()
		})
		_, _ = bus.Subscribe("env.global.ENVIRONMENT_CHANGED", func(_ *nats.Msg) {
			go r.PullSnapshot(ctx)
		})
	}

	go func() {
		ticker := time.NewTicker(reRegisterPeriod)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				_ = r.RegisterOnce(ctx)
			case <-ctx.Done():
				return
			}
		}
	}()
}

func tagLabel(tag string) string {
	if strings.TrimSpace(tag) == "" {
		return "untagged"
	}
	return tag
}
