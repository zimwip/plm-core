package platformlib

import (
	"context"
	"math"
	"sync"
	"sync/atomic"
)

// LocalServiceRegistry is an in-memory mirror of the platform registry,
// rejecting stale snapshots (monotonic version) and selecting instances
// round-robin with a health-aware fallback. Port of the Java class.
type LocalServiceRegistry struct {
	mu        sync.RWMutex
	version   int64
	services  map[string][]ServiceInstanceInfo
	populated bool
	rr        map[string]*uint64

	readyOnce sync.Once
	ready     chan struct{}
}

func NewLocalServiceRegistry() *LocalServiceRegistry {
	return &LocalServiceRegistry{
		services: map[string][]ServiceInstanceInfo{},
		rr:       map[string]*uint64{},
		ready:    make(chan struct{}),
	}
}

// UpdateFromSnapshot applies a snapshot, ignoring stale ones (version <=
// current once populated).
func (r *LocalServiceRegistry) UpdateFromSnapshot(s RegistrySnapshot) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.populated && s.Version <= r.version {
		return
	}
	r.version = s.Version
	r.services = s.Services
	r.populated = true
	r.readyOnce.Do(func() { close(r.ready) })
}

// ResetVersion drops the monotonic baseline so the next snapshot is accepted
// regardless of version. Used on PLATFORM_RESTARTED: platform-api's registry
// version resets on restart, so a fresh lower-versioned snapshot would
// otherwise be rejected as stale.
func (r *LocalServiceRegistry) ResetVersion() {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.version = math.MinInt64
}

func (r *LocalServiceRegistry) IsPopulated() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.populated
}

func (r *LocalServiceRegistry) Version() int64 {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.version
}

func (r *LocalServiceRegistry) AllServiceCodes() []string {
	r.mu.RLock()
	defer r.mu.RUnlock()
	codes := make([]string, 0, len(r.services))
	for c := range r.services {
		codes = append(codes, c)
	}
	return codes
}

func (r *LocalServiceRegistry) Instances(serviceCode string) []ServiceInstanceInfo {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return append([]ServiceInstanceInfo(nil), r.services[serviceCode]...)
}

// PickInstance returns a round-robin instance, preferring healthy ones.
func (r *LocalServiceRegistry) PickInstance(serviceCode string) (ServiceInstanceInfo, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	all := r.services[serviceCode]
	if len(all) == 0 {
		return ServiceInstanceInfo{}, false
	}
	pool := make([]ServiceInstanceInfo, 0, len(all))
	for _, i := range all {
		if i.Healthy {
			pool = append(pool, i)
		}
	}
	if len(pool) == 0 {
		pool = all
	}
	counter, ok := r.rr[serviceCode]
	if !ok {
		var c uint64
		counter = &c
		r.rr[serviceCode] = counter
	}
	idx := atomic.AddUint64(counter, 1) - 1
	return pool[idx%uint64(len(pool))], true
}

// AwaitPopulated blocks until the first snapshot arrives or ctx is done.
// Returns true if populated.
func (r *LocalServiceRegistry) AwaitPopulated(ctx context.Context) bool {
	if r.IsPopulated() {
		return true
	}
	select {
	case <-r.ready:
		return true
	case <-ctx.Done():
		return r.IsPopulated()
	}
}
