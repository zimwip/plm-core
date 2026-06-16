package platformlib

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/nats-io/nats.go"
)

const (
	configSnapshotPath   = "/internal/config/snapshot"
	configAdminCode      = "psa"
	configChangedSubject = "env.service.psa.CONFIG_CHANGED"
	configRefreshPeriod  = 5 * time.Minute
)

// NodeTypeConfig is the subset of psm-admin's node-type definition a metamodel
// consumer needs (id → name mapping). Other fields in the wire record are
// ignored.
type NodeTypeConfig struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// ConfigSnapshot is the subset of the psm-admin snapshot
// (GET /internal/config/snapshot) decoded here. Version is monotonic.
type ConfigSnapshot struct {
	Version        int64             `json:"version"`
	NodeTypes      []NodeTypeConfig  `json:"nodeTypes"`
	EntityMetadata map[string]string `json:"entityMetadata"`
}

// ConfigCache holds the latest psm-admin config snapshot, refreshed on startup,
// on NATS CONFIG_CHANGED and on a periodic fallback. Generic: it exposes the
// raw entity metadata + node-type lookup; service-specific key parsing (e.g.
// webdav.directory flags) lives in the consumer. Subset port of
// com.plm.platform.config.ConfigCache.
type ConfigCache struct {
	client *ServiceClient

	mu        sync.RWMutex
	version   int64
	metadata  map[string]string
	nodeTypes map[string]NodeTypeConfig
}

func NewConfigCache(client *ServiceClient) *ConfigCache {
	return &ConfigCache{
		client:    client,
		metadata:  map[string]string{},
		nodeTypes: map[string]NodeTypeConfig{},
	}
}

// Refresh pulls the latest snapshot from psm-admin, ignoring stale versions.
func (c *ConfigCache) Refresh(ctx context.Context) error {
	var snap ConfigSnapshot
	if err := c.client.GetJSON(ctx, configAdminCode, configSnapshotPath, &snap); err != nil {
		return err
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.version != 0 && snap.Version < c.version {
		return nil
	}
	c.version = snap.Version
	c.metadata = snap.EntityMetadata
	if c.metadata == nil {
		c.metadata = map[string]string{}
	}
	nt := make(map[string]NodeTypeConfig, len(snap.NodeTypes))
	for _, t := range snap.NodeTypes {
		nt[t.ID] = t
	}
	c.nodeTypes = nt
	return nil
}

// EntityMetadata returns a copy of the metadata map (safe to range over).
func (c *ConfigCache) EntityMetadata() map[string]string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	out := make(map[string]string, len(c.metadata))
	for k, v := range c.metadata {
		out[k] = v
	}
	return out
}

// NodeType looks up a node type by id.
func (c *ConfigCache) NodeType(id string) (NodeTypeConfig, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	t, ok := c.nodeTypes[id]
	return t, ok
}

// Start does the initial pull then keeps the cache fresh via NATS + a ticker.
func (c *ConfigCache) Start(ctx context.Context, bus *Bus) {
	if err := c.Refresh(ctx); err != nil {
		log.Printf("config snapshot initial pull failed: %v", err)
	}
	if bus != nil {
		_, _ = bus.Subscribe(configChangedSubject, func(_ *nats.Msg) {
			if err := c.Refresh(ctx); err != nil {
				log.Printf("config refresh (NATS) failed: %v", err)
			}
		})
	}
	go func() {
		t := time.NewTicker(configRefreshPeriod)
		defer t.Stop()
		for {
			select {
			case <-t.C:
				if err := c.Refresh(ctx); err != nil {
					log.Printf("config refresh (tick) failed: %v", err)
				}
			case <-ctx.Done():
				return
			}
		}
	}()
}
