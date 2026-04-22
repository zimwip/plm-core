// In-memory API call performance tracker.
// Rolling window of last N samples. Aggregates per (method, endpoint).
//
// Purpose: measure end-user latency of going through nginx → spe-api → psm/pno
// to make the impact of the gateway indirection visible.

const MAX_SAMPLES = 500;

// Each sample: { method, endpoint, status, durationMs, ok, at }
const samples = [];

const subscribers = new Set();
function notify() { subscribers.forEach(fn => { try { fn(); } catch {} }); }

export function subscribeApiStats(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// Normalize path so /nodes/<uuid>/description aggregates with peers.
const UUID_RE = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const NUM_RE  = /\/\d+(?=\/|$)/g;

export function normalizeEndpoint(fullPath) {
  const noQuery = fullPath.split('?')[0];
  return noQuery.replace(UUID_RE, '/{id}').replace(NUM_RE, '/{n}');
}

export function recordApiCall({ method, endpoint, status, durationMs, ok }) {
  samples.push({
    method,
    endpoint: normalizeEndpoint(endpoint),
    status,
    durationMs,
    ok,
    at: Date.now(),
  });
  if (samples.length > MAX_SAMPLES) samples.shift();
  notify();
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

export function getApiStats() {
  const byKey = new Map();
  for (const s of samples) {
    const key = `${s.method} ${s.endpoint}`;
    let entry = byKey.get(key);
    if (!entry) {
      entry = { method: s.method, endpoint: s.endpoint, durations: [], errorCount: 0, lastMs: 0, lastAt: 0 };
      byKey.set(key, entry);
    }
    entry.durations.push(s.durationMs);
    if (!s.ok) entry.errorCount++;
    entry.lastMs = s.durationMs;
    entry.lastAt = s.at;
  }

  const byEndpoint = [];
  for (const e of byKey.values()) {
    const sorted = [...e.durations].sort((a, b) => a - b);
    const sum = e.durations.reduce((a, b) => a + b, 0);
    byEndpoint.push({
      method:     e.method,
      endpoint:   e.endpoint,
      count:      e.durations.length,
      avgMs:      sum / e.durations.length,
      p50:        percentile(sorted, 0.5),
      p95:        percentile(sorted, 0.95),
      maxMs:      sorted[sorted.length - 1],
      lastMs:     e.lastMs,
      lastAt:     e.lastAt,
      errorCount: e.errorCount,
    });
  }
  byEndpoint.sort((a, b) => b.count - a.count);

  const all = samples.map(s => s.durationMs).sort((a, b) => a - b);
  const sumAll = all.reduce((a, b) => a + b, 0);
  const overall = {
    total:      samples.length,
    windowSize: MAX_SAMPLES,
    avgMs:      all.length ? sumAll / all.length : 0,
    p50:        percentile(all, 0.5),
    p75:        percentile(all, 0.75),
    p90:        percentile(all, 0.9),
    p95:        percentile(all, 0.95),
    p99:        percentile(all, 0.99),
    maxMs:      all.length ? all[all.length - 1] : 0,
    errorCount: samples.filter(s => !s.ok).length,
    sorted:     all,
  };
  return { overall, byEndpoint };
}

export function resetApiStats() {
  samples.length = 0;
  notify();
}

// Stats restricted to the last windowMs milliseconds.
export function getWindowStats(windowMs) {
  const cutoff = Date.now() - windowMs;
  const window = samples.filter(s => s.at >= cutoff);
  const durations = window.map(s => s.durationMs).sort((a, b) => a - b);
  const sum = durations.reduce((a, b) => a + b, 0);
  return {
    windowMs,
    count:      window.length,
    avgMs:      durations.length ? sum / durations.length : 0,
    p50:        percentile(durations, 0.5),
    p95:        percentile(durations, 0.95),
    maxMs:      durations.length ? durations[durations.length - 1] : 0,
    errorCount: window.filter(s => !s.ok).length,
  };
}
