import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { speApi } from '../services/api';
import { getApiStats, getWindowStats, resetApiStats, subscribeApiStats } from '../services/apiStats';
import { useCacheStats, clearWorkerCache, setWorkerMaxBytes } from '../workers/stepWorkerInstance';
import { getStatusPlugins } from '../services/statusPlugins';

const POLL_MS = 10_000;
const PERF_WINDOW_MS = 30_000;
const PERF_TICK_MS = 1_000;

// Jaeger UI — served by the all-in-one container on the host, port 16686.
// Override at build time via VITE_JAEGER_URL if deployed elsewhere.
const JAEGER_URL = import.meta.env?.VITE_JAEGER_URL || 'http://localhost:16686';

// Smooth color gradient on p95 latency.
//   ≤ GREEN_AT  → pure green
//   ≥ RED_AT    → pure red
//   between     → hue interpolated from 150° (green) → 0° (red)
const GREEN_AT = 100;  // ms
const RED_AT   = 1000; // ms

function perfColor(p95Ms, errorCount = 0) {
  if (p95Ms == null || Number.isNaN(p95Ms)) return 'hsl(210, 10%, 55%)';
  if (errorCount > 0 && p95Ms < RED_AT) {
    // errors dominate: push toward red
    p95Ms = Math.max(p95Ms, RED_AT * 0.75);
  }
  const t = Math.max(0, Math.min(1, (p95Ms - GREEN_AT) / (RED_AT - GREEN_AT)));
  const hue = 150 - 150 * t;             // 150 → 0
  const sat = 60 + 25 * t;               // 60 → 85
  const lig = 55 - 5 * t;                // 55 → 50
  return `hsl(${hue.toFixed(0)}, ${sat.toFixed(0)}%, ${lig.toFixed(0)}%)`;
}

function perfLabel(p95Ms, count) {
  if (count === 0) return 'IDLE';
  if (p95Ms < GREEN_AT)     return 'FAST';
  if (p95Ms < 400)          return 'OK';
  if (p95Ms < RED_AT)       return 'SLOW';
  return 'BAD';
}

const COLOR = {
  up:       { dot: '#4dd4a0', label: 'UP'       },
  degraded: { dot: '#f0b429', label: 'DEGRADED' },
  down:     { dot: '#fc8181', label: 'DOWN'     },
  unknown:  { dot: '#6b8099', label: 'UNKNOWN'  },
};

function fmtAge(s) {
  if (s == null) return '—';
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

function fmtUptime(s) {
  if (s == null) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${ss}s`;
  return `${ss}s`;
}

function fmtMs(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (n < 10) return `${n.toFixed(1)}ms`;
  if (n < 1000) return `${Math.round(n)}ms`;
  return `${(n / 1000).toFixed(2)}s`;
}

function fmtCount(n) {
  if (n == null) return '—';
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

function fmtBytes(b) {
  if (b == null) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function latencyClass(ms) {
  if (ms < 100) return 'lat-fast';
  if (ms < 400) return 'lat-ok';
  if (ms < 1000) return 'lat-slow';
  return 'lat-bad';
}

// Small SVG percentile curve. Domain = 0..100% (sample rank), range = 0..maxMs.
function PercentileChart({ sorted }) {
  if (!sorted || sorted.length < 2) {
    return <div className="perf-chart-empty">Need at least 2 calls to plot distribution.</div>;
  }
  const W = 600, H = 90, PAD_L = 34, PAD_R = 6, PAD_T = 8, PAD_B = 18;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const max = sorted[sorted.length - 1] || 1;

  const xAt = (i) => PAD_L + (innerW * i) / (sorted.length - 1);
  const yAt = (v) => PAD_T + innerH - (innerH * v) / max;

  let path = '';
  for (let i = 0; i < sorted.length; i++) {
    const x = xAt(i).toFixed(1);
    const y = yAt(sorted[i]).toFixed(1);
    path += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
  }
  const area = path + `L${xAt(sorted.length - 1).toFixed(1)},${(PAD_T + innerH).toFixed(1)} L${PAD_L},${(PAD_T + innerH).toFixed(1)} Z`;

  // Percentile markers
  const markers = [0.5, 0.75, 0.9, 0.95, 0.99];
  const markerFor = (p) => {
    const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
    return { p, v: sorted[idx], x: xAt(idx), y: yAt(sorted[idx]) };
  };

  // Y ticks (0 / max/2 / max)
  const yTicks = [0, max / 2, max];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="perf-chart" preserveAspectRatio="none">
      {yTicks.map((t, i) => {
        const y = yAt(t);
        return (
          <g key={i}>
            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                  stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,3"/>
            <text x={PAD_L - 4} y={y + 3} textAnchor="end"
                  fontSize="9" fill="var(--muted2)" fontFamily="var(--mono)">
              {fmtMs(t)}
            </text>
          </g>
        );
      })}

      <path d={area} fill="rgba(106,172,255,0.18)"/>
      <path d={path} stroke="#6aacff" strokeWidth="1.5" fill="none"/>

      {markers.map(p => {
        const m = markerFor(p);
        return (
          <g key={p}>
            <line x1={m.x} y1={PAD_T} x2={m.x} y2={PAD_T + innerH}
                  stroke="#f0b429" strokeWidth="0.6" strokeDasharray="1,3" opacity="0.65"/>
            <circle cx={m.x} cy={m.y} r="2" fill="#f0b429"/>
            <text x={m.x} y={H - 5} textAnchor="middle"
                  fontSize="8" fill="var(--muted2)" fontFamily="var(--mono)">
              p{Math.round(p * 100)}
            </text>
          </g>
        );
      })}

      <text x={PAD_L} y={H - 5} textAnchor="start"
            fontSize="8" fill="var(--muted2)" fontFamily="var(--mono)">p0</text>
      <text x={W - PAD_R} y={H - 5} textAnchor="end"
            fontSize="8" fill="var(--muted2)" fontFamily="var(--mono)">p100</text>
    </svg>
  );
}

export default function StatusBar({ showSettings, onToggleSettings, consoleVisible, onToggleConsole }) {
  const [status, setStatus] = useState(null);
  const [error,  setError]  = useState(null);
  const [open,   setOpen]   = useState(false);
  const [tab,    setTab]    = useState('services'); // 'services' | 'perf' | 'nats'
  const [nats,   setNats]   = useState(null);
  const [natsErr, setNatsErr] = useState(null);
  const [stats,  setStats]  = useState(getApiStats());
  const [perfWindow, setPerfWindow] = useState(() => getWindowStats(PERF_WINDOW_MS));

  // Live perf window — tick every second so color reflects current 30s window
  // even when no new API calls have happened (old samples fall out).
  useEffect(() => {
    setPerfWindow(getWindowStats(PERF_WINDOW_MS));
    const id = setInterval(() => setPerfWindow(getWindowStats(PERF_WINDOW_MS)), PERF_TICK_MS);
    const unsub = subscribeApiStats(() => setPerfWindow(getWindowStats(PERF_WINDOW_MS)));
    return () => { clearInterval(id); unsub(); };
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const s = await speApi.getStatus();
      setStatus(s);
      setError(null);
    } catch (e) {
      setError(e.message || String(e));
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, POLL_MS);
    return () => clearInterval(id);
  }, [fetchStatus]);

  // Re-render stats on each recorded API call while modal open
  useEffect(() => {
    if (!open) return;
    setStats(getApiStats());
    const unsub = subscribeApiStats(() => setStats(getApiStats()));
    return unsub;
  }, [open]);

  // Fetch NATS stats when NATS tab is active (poll every 5s)
  const fetchNats = useCallback(async () => {
    try {
      const n = await speApi.getNatsStatus();
      setNats(n);
      setNatsErr(null);
    } catch (e) {
      setNatsErr(e.message || String(e));
    }
  }, []);

  useEffect(() => {
    if (!open || tab !== 'nats') return;
    fetchNats();
    const id = setInterval(fetchNats, 5000);
    return () => clearInterval(id);
  }, [open, tab, fetchNats]);

  const cacheStats  = useCacheStats();
  const statusPlugins = useMemo(() => getStatusPlugins(), []);

  const overall = error ? 'down' : (status?.overall || 'unknown');
  const color   = COLOR[overall] || COLOR.unknown;

  return (
    <>
      <div className="status-bar-row">
        {onToggleSettings && (
          <button
            type="button"
            className={`status-bar-settings${showSettings ? ' active' : ''}`}
            onClick={onToggleSettings}
            title="Settings"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>Settings</span>
          </button>
        )}
        {onToggleConsole && (
          <button
            type="button"
            className={`status-bar-settings${consoleVisible ? ' active' : ''}`}
            onClick={onToggleConsole}
            title={consoleVisible ? 'Hide console' : 'Show console'}
            style={{ marginLeft: 4 }}
          >
            <span style={{ fontSize: 11 }}>≡</span>
            <span>Console</span>
          </button>
        )}
        <button
          type="button"
          className="status-bar"
          onClick={() => setOpen(true)}
          title="Click for platform status + API perf"
        >
        <span className="status-dot" style={{ background: color.dot }} />
        <span className="status-label">PLATFORM</span>
        <span className="status-value" style={{ color: color.dot }}>{color.label}</span>
        {status?.services && (
          <span className="status-count">
            {status.services.filter(s => s.healthy).length}/{status.services.length} svc
            {status.totalInstances != null && (
              <> · {status.totalHealthyInstances}/{status.totalInstances} inst</>
            )}
          </span>
        )}
        <span
          className="perf-chip"
          style={{ background: perfColor(perfWindow.p95, perfWindow.errorCount) }}
          title={`30s window: ${perfWindow.count} calls · p95 ${fmtMs(perfWindow.p95)} · avg ${fmtMs(perfWindow.avgMs)}${perfWindow.errorCount ? ` · ${perfWindow.errorCount} err` : ''}`}
        >
          <span className="perf-chip-dot" />
          {perfLabel(perfWindow.p95, perfWindow.count)}
          {perfWindow.count > 0 && <span className="perf-chip-val">{fmtMs(perfWindow.p95)}</span>}
        </span>
        {cacheStats.cacheBytes > 0 && (
          <span
            className="cache-chip"
            title={`3D cache: ${cacheStats.entries} part${cacheStats.entries !== 1 ? 's' : ''} · ${fmtBytes(cacheStats.cacheBytes)} / ${fmtBytes(cacheStats.maxBytes)}`}
          >
            3D · {fmtBytes(cacheStats.cacheBytes)}
          </span>
        )}
      </button>
      </div>

      {open && (
        <div className="status-modal-overlay" onClick={() => setOpen(false)}>
          <div className="status-modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="Platform status">
            <div className="status-modal-header">
              <h3>Platform Status</h3>
              <a
                className="status-modal-jaeger"
                href={JAEGER_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Jaeger tracing UI"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span>Traces</span>
              </a>
              <button className="status-modal-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>

            <div className="status-tabs">
              <button
                className={`status-tab${tab === 'services' ? ' status-tab-active' : ''}`}
                onClick={() => setTab('services')}
              >Services</button>
              <button
                className={`status-tab${tab === 'perf' ? ' status-tab-active' : ''}`}
                onClick={() => setTab('perf')}
              >API Perf ({stats.overall.total})</button>
              <button
                className={`status-tab${tab === 'nats' ? ' status-tab-active' : ''}`}
                onClick={() => setTab('nats')}
              >NATS</button>
              <button
                className={`status-tab${tab === 'workers' ? ' status-tab-active' : ''}`}
                onClick={() => setTab('workers')}
              >3D Workers</button>
              {statusPlugins.map(p => (
                <button
                  key={p.key}
                  className={`status-tab${tab === p.key ? ' status-tab-active' : ''}`}
                  onClick={() => setTab(p.key)}
                >{p.label}</button>
              ))}
            </div>

            {tab === 'services' && (
              <>
                <div className="status-modal-summary">
                  <span className="status-dot" style={{ background: color.dot }} />
                  <span className="status-modal-overall" style={{ color: color.dot }}>{color.label}</span>
                  {status?.gatewayVersion && (
                    <span className="status-modal-uptime">
                      spe-api <code>{status.gatewayVersion}</code>
                    </span>
                  )}
                  {status?.gatewayUptimeSeconds != null && (
                    <span className="status-modal-uptime">
                      uptime: {fmtUptime(status.gatewayUptimeSeconds)}
                    </span>
                  )}
                  <button className="status-modal-refresh" onClick={fetchStatus}>refresh</button>
                </div>

                {error && <div className="status-modal-error">Gateway unreachable: {error}</div>}

                <table className="status-table">
                  <thead>
                    <tr>
                      <th>Service / Instance</th>
                      <th>Version</th>
                      <th>Status</th>
                      <th>Path</th>
                      <th>Affinity</th>
                      <th>Last HB</th>
                      <th>Failures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(status?.services || []).flatMap(svc => {
                      const st = svc.status || (svc.healthy ? 'up' : 'down');
                      const c  = COLOR[st] || COLOR.unknown;
                      const headerRow = (
                        <tr key={svc.serviceCode} className="status-row-service">
                          <td>
                            <code>{svc.serviceCode}</code>
                            {svc.instanceCount != null && (
                              <span className="status-inst-badge" title="healthy / total instances">
                                {svc.healthyInstances}/{svc.instanceCount} inst
                              </span>
                            )}
                          </td>
                          <td>{svc.version ? <code>{svc.version}</code> : <span className="muted">—</span>}</td>
                          <td>
                            <span className="status-dot status-dot-sm" style={{ background: c.dot }} />
                            <span style={{ color: c.dot }}>{c.label}</span>
                          </td>
                          <td>{svc.path ? <code>{svc.path}</code> : <span className="muted">—</span>}</td>
                          <td>
                            {svc.instances && svc.instances.length > 0 && (() => {
                              const tagged = svc.instances.filter(i => !i.untagged);
                              const untagged = svc.instances.filter(i => i.untagged);
                              if (tagged.length === 0) return <span className="muted">all untagged</span>;
                              const tags = [...new Set(tagged.map(i => i.spaceTag))].sort().join(', ');
                              return <span className="muted">{tags}{untagged.length ? ` + ${untagged.length} untagged` : ''}</span>;
                            })()}
                          </td>
                          <td colSpan="2">
                            {svc.registered
                              ? <span className="muted">pool of {svc.instanceCount}</span>
                              : <span className="muted">no instances registered</span>}
                          </td>
                        </tr>
                      );
                      const instanceRows = (svc.instances || []).map(inst => {
                        const ist = inst.status || (inst.healthy ? 'up' : 'down');
                        const ic  = COLOR[ist] || COLOR.unknown;
                        return (
                          <tr key={svc.serviceCode + '/' + inst.instanceId} className="status-row-instance">
                            <td><span className="status-inst-leaf">↳</span> <code className="muted">{inst.instanceId}</code></td>
                            <td>{inst.version ? <code>{inst.version}</code> : <span className="muted">—</span>}</td>
                            <td>
                              <span className="status-dot status-dot-sm" style={{ background: ic.dot }} />
                              <span style={{ color: ic.dot }}>{ic.label}</span>
                            </td>
                            <td>
                              {inst.untagged
                                ? <span className="muted">—</span>
                                : <code style={{ fontSize: '0.85em' }}>{inst.spaceTag}</code>
                              }
                            </td>
                            <td>{inst.lastHeartbeatOk ? fmtAge(inst.ageSeconds) + ' ago' : <span className="muted">never</span>}</td>
                            <td>{inst.consecutiveFailures ?? 0}</td>
                          </tr>
                        );
                      });
                      return [headerRow, ...instanceRows];
                    })}
                  </tbody>
                </table>

                {status?.timestamp && (
                  <div className="status-modal-timestamp">
                    server time: {status.timestamp}
                  </div>
                )}
              </>
            )}

            {tab === 'perf' && (
              <>
                <div
                  className="perf-window-banner"
                  style={{ '--perf-color': perfColor(perfWindow.p95, perfWindow.errorCount) }}
                >
                  <span className="perf-chip-dot perf-chip-dot-lg" />
                  <span className="perf-window-label">
                    last 30s — {perfLabel(perfWindow.p95, perfWindow.count)}
                  </span>
                  <span className="perf-window-metrics">
                    {perfWindow.count} calls · p50 {fmtMs(perfWindow.p50)} · p95 {fmtMs(perfWindow.p95)} · max {fmtMs(perfWindow.maxMs)}
                    {perfWindow.errorCount > 0 && <span className="lat-bad"> · {perfWindow.errorCount} err</span>}
                  </span>
                </div>

                <div className="status-modal-summary">
                  <span className="status-perf-summary">
                    <span>{stats.overall.total} calls</span>
                    <span>avg <strong className={latencyClass(stats.overall.avgMs)}>{fmtMs(stats.overall.avgMs)}</strong></span>
                    <span>p50 <strong className={latencyClass(stats.overall.p50)}>{fmtMs(stats.overall.p50)}</strong></span>
                    <span>p95 <strong className={latencyClass(stats.overall.p95)}>{fmtMs(stats.overall.p95)}</strong></span>
                    <span>p99 <strong className={latencyClass(stats.overall.p99)}>{fmtMs(stats.overall.p99)}</strong></span>
                    <span>max <strong className={latencyClass(stats.overall.maxMs)}>{fmtMs(stats.overall.maxMs)}</strong></span>
                    {stats.overall.errorCount > 0 && <span className="lat-bad">{stats.overall.errorCount} err</span>}
                  </span>
                  <button className="status-modal-refresh" onClick={() => { resetApiStats(); setStats(getApiStats()); }}>reset</button>
                </div>

                <div className="status-perf-note">
                  Window = last {stats.overall.windowSize} calls. Latency = browser-observed time through nginx → spe-api → {`{`}psm,pno{`}`}.
                </div>

                <PercentileChart sorted={stats.overall.sorted} />

                {stats.byEndpoint.length === 0 ? (
                  <div className="status-perf-empty">No API calls recorded yet.</div>
                ) : (
                  <div className="status-perf-scroll">
                    <table className="status-table status-table-sticky">
                      <thead>
                        <tr>
                          <th>Method</th>
                          <th>Endpoint</th>
                          <th>#</th>
                          <th>avg</th>
                          <th>p50</th>
                          <th>p95</th>
                          <th title="sorted desc by p95">max ▼</th>
                          <th>last</th>
                          <th>err</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...stats.byEndpoint].sort((a, b) => b.p95 - a.p95).map(e => (
                          <tr key={`${e.method} ${e.endpoint}`}>
                            <td><code>{e.method}</code></td>
                            <td><code title={e.endpoint}>{e.endpoint}</code></td>
                            <td>{e.count}</td>
                            <td className={latencyClass(e.avgMs)}>{fmtMs(e.avgMs)}</td>
                            <td className={latencyClass(e.p50)}>{fmtMs(e.p50)}</td>
                            <td className={latencyClass(e.p95)}>{fmtMs(e.p95)}</td>
                            <td className={latencyClass(e.maxMs)}>{fmtMs(e.maxMs)}</td>
                            <td className={latencyClass(e.lastMs)}>{fmtMs(e.lastMs)}</td>
                            <td className={e.errorCount ? 'lat-bad' : 'muted'}>{e.errorCount || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {tab === 'nats' && (
              <>
                <div className="status-modal-summary">
                  {nats ? (
                    <>
                      <span className="status-dot" style={{ background: nats.status === 'up' ? '#4dd4a0' : '#fc8181' }} />
                      <span className="status-modal-overall" style={{ color: nats.status === 'up' ? '#4dd4a0' : '#fc8181' }}>
                        {nats.status === 'up' ? 'UP' : 'DOWN'}
                      </span>
                      {nats.version && <span className="status-modal-uptime">v{nats.version}</span>}
                      {nats.uptime && <span className="status-modal-uptime">uptime: {nats.uptime}</span>}
                    </>
                  ) : (
                    <span className="muted">{natsErr ? `Error: ${natsErr}` : 'Loading...'}</span>
                  )}
                  <button className="status-modal-refresh" onClick={fetchNats}>refresh</button>
                </div>

                {nats && (
                  <>
                    <div className="nats-stats-grid">
                      <div className="nats-stat">
                        <span className="nats-stat-label">Connections</span>
                        <span className="nats-stat-value">{nats.connections ?? 0}</span>
                        <span className="nats-stat-sub">total: {nats.totalConnections ?? 0}</span>
                      </div>
                      <div className="nats-stat">
                        <span className="nats-stat-label">Subscriptions</span>
                        <span className="nats-stat-value">{nats.subscriptions ?? 0}</span>
                      </div>
                      <div className="nats-stat">
                        <span className="nats-stat-label">Messages In</span>
                        <span className="nats-stat-value">{fmtCount(nats.inMsgs)}</span>
                        <span className="nats-stat-sub">{fmtBytes(nats.inBytes)}</span>
                      </div>
                      <div className="nats-stat">
                        <span className="nats-stat-label">Messages Out</span>
                        <span className="nats-stat-value">{fmtCount(nats.outMsgs)}</span>
                        <span className="nats-stat-sub">{fmtBytes(nats.outBytes)}</span>
                      </div>
                      <div className="nats-stat">
                        <span className="nats-stat-label">Slow Consumers</span>
                        <span className={`nats-stat-value${nats.slowConsumers > 0 ? ' lat-bad' : ''}`}>
                          {nats.slowConsumers ?? 0}
                        </span>
                      </div>
                      <div className="nats-stat">
                        <span className="nats-stat-label">Sub Cache</span>
                        <span className="nats-stat-value">{nats.numCache ?? 0}</span>
                        <span className="nats-stat-sub">matches: {fmtCount(nats.numMatches)}</span>
                      </div>
                    </div>

                    {nats.connectionDetails && nats.connectionDetails.length > 0 && (
                      <>
                        <h4 className="nats-section-title">Client Connections ({nats.numConnections})</h4>
                        <div className="status-perf-scroll">
                          <table className="status-table status-table-sticky">
                            <thead>
                              <tr>
                                <th>CID</th>
                                <th>Name</th>
                                <th>Lang</th>
                                <th>Subs</th>
                                <th>Msgs In</th>
                                <th>Msgs Out</th>
                                <th>Bytes In</th>
                                <th>Bytes Out</th>
                                <th>Uptime</th>
                                <th>Idle</th>
                              </tr>
                            </thead>
                            <tbody>
                              {nats.connectionDetails.map(c => (
                                <tr key={c.cid}>
                                  <td><code>{c.cid}</code></td>
                                  <td><code title={c.name}>{c.name || '—'}</code></td>
                                  <td>{c.lang || '—'}</td>
                                  <td>{typeof c.subscriptions === 'number' ? c.subscriptions : (Array.isArray(c.subscriptions) ? c.subscriptions.length : '—')}</td>
                                  <td>{fmtCount(c.inMsgs)}</td>
                                  <td>{fmtCount(c.outMsgs)}</td>
                                  <td>{fmtBytes(c.inBytes)}</td>
                                  <td>{fmtBytes(c.outBytes)}</td>
                                  <td>{c.uptime || '—'}</td>
                                  <td>{c.idle || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {tab === 'workers' && (
              <div style={{ padding: '12px 16px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  {[
                    { v: cacheStats.workers,                    l: 'Workers' },
                    { v: cacheStats.entries,                    l: 'Cached Parts' },
                    { v: fmtBytes(cacheStats.cacheBytes),       l: 'Memory Used' },
                    { v: fmtBytes(cacheStats.maxBytes),         l: 'Memory Limit' },
                    { v: cacheStats.memHits,                    l: 'Mem Hits' },
                    { v: cacheStats.idbHits,                    l: 'IDB Hits' },
                    { v: cacheStats.netFetches,                 l: 'Downloads' },
                    { v: fmtMs(cacheStats.avgDownloadMs),       l: 'Avg Download' },
                    { v: fmtMs(cacheStats.avgParseMs),          l: 'Avg Parse' },
                  ].map(({ v, l }) => (
                    <div key={l} style={{ background: 'var(--surface2)', borderRadius: 6, padding: '8px 14px', minWidth: 90 }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{v ?? '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted2)' }}>
                  Cache: {fmtBytes(cacheStats.cacheBytes)} / {fmtBytes(cacheStats.maxBytes)} ({cacheStats.maxBytes > 0 ? ((cacheStats.cacheBytes / cacheStats.maxBytes) * 100).toFixed(1) : 0}%)
                </div>
                <div style={{ marginTop: 6, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${cacheStats.maxBytes > 0 ? Math.min(100, (cacheStats.cacheBytes / cacheStats.maxBytes) * 100) : 0}%`,
                    background: 'var(--accent)',
                    borderRadius: 3,
                    transition: 'width .3s',
                  }} />
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginRight: 4 }}>Limit / worker</span>
                  {[
                    { label: '128 MB', bytes: 128 * 1024 * 1024 },
                    { label: '256 MB', bytes: 256 * 1024 * 1024 },
                    { label: '512 MB', bytes: 512 * 1024 * 1024 },
                    { label: '1 GB',   bytes: 1024 * 1024 * 1024 },
                  ].map(({ label, bytes }) => {
                    const perWorker = cacheStats.workers > 0 ? cacheStats.maxBytes / cacheStats.workers : 0;
                    const active = Math.abs(perWorker - bytes) < 1024;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setWorkerMaxBytes(bytes)}
                        style={{
                          padding: '3px 10px', fontSize: 11, borderRadius: 4, border: '1px solid',
                          borderColor: active ? 'var(--accent)' : 'var(--border)',
                          background: active ? 'var(--accent)' : 'var(--surface2)',
                          color: active ? '#fff' : 'var(--text)',
                          cursor: 'pointer', fontWeight: active ? 700 : 400,
                        }}
                      >{label}</button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => clearWorkerCache({ idb: false })}
                    style={{
                      padding: '4px 12px', fontSize: 11, borderRadius: 4,
                      border: '1px solid var(--border)', background: 'var(--surface2)',
                      color: 'var(--text)', cursor: 'pointer',
                    }}
                  >Clear Memory</button>
                  <button
                    type="button"
                    onClick={() => clearWorkerCache({ idb: true })}
                    style={{
                      padding: '4px 12px', fontSize: 11, borderRadius: 4,
                      border: '1px solid var(--border)', background: 'var(--surface2)',
                      color: 'var(--text)', cursor: 'pointer',
                    }}
                  >Clear All + IDB</button>
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted2)' }}>
                  Avg timings = rolling average over last 50 loads per worker. IDB = IndexedDB persistent cache. Mem = in-memory LRU.
                </div>
              </div>
            )}

          {statusPlugins.map(p => tab === p.key && (
            <p.Component key={p.key} />
          ))}
          </div>
        </div>
      )}
    </>
  );
}
