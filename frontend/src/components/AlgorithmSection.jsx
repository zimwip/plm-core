import React, { useState, useEffect, useCallback } from 'react';
import { platformActionsApi } from '../services/api';
import { ModuleBadge } from './SettingsPage';
import {
  PlusIcon, TrashIcon, EditIcon,
  ChevronRightIcon, ChevronDownIcon,
  WorkflowIcon,
} from './Icons';

/* ── Exported section ── */
export function AlgorithmSection({ userId, canWrite, toast }) {
  const [allAlgorithms, setAllAlgorithms] = useState(null);
  const [allInstances,  setAllInstances]  = useState(null);
  const [serviceCode, setServiceCode] = useState('');
  const [tab, setTab] = useState('catalog');
  const [stats, setStats] = useState(null);
  const [timeseries, setTimeseries] = useState(null);
  const [tsHours, setTsHours] = useState(24);

  const loadAll = useCallback(() => {
    setAllAlgorithms(null);
    setAllInstances(null);
    Promise.all([
      platformActionsApi.listAlgorithms(userId),
      platformActionsApi.listAllInstances(userId),
    ]).then(([algs, insts]) => {
      const algList  = Array.isArray(algs)  ? algs  : [];
      const instList = Array.isArray(insts) ? insts : [];
      setAllAlgorithms(algList);
      setAllInstances(instList);
      if (!serviceCode) {
        const svcs = [...new Set(algList.map(a => a.serviceCode).filter(Boolean))].sort();
        if (svcs.length > 0) setServiceCode(svcs[0]);
      }
    }).catch(() => { setAllAlgorithms([]); setAllInstances([]); });
  }, [userId]); // serviceCode intentionally excluded — only seed on first load

  useEffect(() => { loadAll(); }, [loadAll]);

  // Reset stats/timeseries when service changes
  useEffect(() => { setStats(null); setTimeseries(null); }, [serviceCode]);

  const loadStats = useCallback(() => {
    platformActionsApi.getAlgorithmStats(userId, serviceCode)
      .then(s => setStats(Array.isArray(s) ? s : []))
      .catch(() => setStats([]));
  }, [userId, serviceCode]);

  const loadTimeseries = useCallback((hours) => {
    platformActionsApi.getAlgorithmTimeseries(userId, hours, serviceCode)
      .then(ts => setTimeseries(Array.isArray(ts) ? ts : []))
      .catch(() => setTimeseries([]));
  }, [userId, serviceCode]);

  if (allAlgorithms === null)
    return <div className="settings-loading">Loading…</div>;

  const services = [...new Set(allAlgorithms.map(a => a.serviceCode).filter(Boolean))].sort();

  const tabStyle = (key) => ({
    padding: '6px 14px', fontSize: 12, cursor: 'pointer', background: 'none', border: 'none',
    color: tab === key ? 'var(--accent)' : 'var(--muted)',
    borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
  });

  return (
    <div>
      {!canWrite && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
          Read-only — requires <code>MANAGE_PLATFORM</code>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Service</span>
        <select className="field-input" style={{ width: 120, fontSize: 12, padding: '3px 6px' }}
          value={serviceCode} onChange={e => setServiceCode(e.target.value)}>
          {services.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        {[['catalog', 'Catalog'], ['stats', 'Execution Stats'], ['graph', 'Usage Graph']].map(([key, label]) => (
          <button key={key} style={tabStyle(key)} onClick={() => {
            setTab(key);
            if (key === 'stats' && !stats) loadStats();
            if (key === 'graph' && !timeseries) loadTimeseries(tsHours);
          }}>{label}</button>
        ))}
      </div>

      {serviceCode && tab === 'catalog' && (
        <AlgorithmCatalog
          userId={userId}
          serviceCode={serviceCode}
          algorithms={allAlgorithms.filter(a => a.serviceCode === serviceCode)}
          instances={allInstances ? allInstances.filter(i => i.serviceCode === serviceCode) : []}
          canWrite={canWrite}
          toast={toast}
          onReload={loadAll}
        />
      )}

      {tab === 'stats' && serviceCode && (
        <AlgorithmStatsTab
          userId={userId} serviceCode={serviceCode} canWrite={canWrite} toast={toast}
          stats={stats} onLoad={loadStats}
          onReset={async () => {
            await platformActionsApi.resetAlgorithmStats(userId, serviceCode).catch(() => {});
            setStats([]);
            toast('Stats reset', 'success');
          }}
        />
      )}

      {tab === 'graph' && serviceCode && (
        <AlgorithmGraphTab
          timeseries={timeseries} tsHours={tsHours}
          onLoad={(h) => { setTsHours(h); loadTimeseries(h); }}
        />
      )}
    </div>
  );
}

/* ── Algorithm Catalog ── */
function AlgorithmCatalog({ userId, serviceCode, algorithms, instances, canWrite, toast, onReload }) {
  const [expandedAlgo, setExpandedAlgo] = useState(null);
  const [newInstName,  setNewInstName]  = useState('');
  const [algoParams,   setAlgoParams]   = useState({});

  // Reset expansion when service changes
  useEffect(() => { setExpandedAlgo(null); setNewInstName(''); setAlgoParams({}); }, [serviceCode]);

  async function handleCreateInstance(algorithmId) {
    const name = newInstName.trim();
    if (!name) { toast('Instance name is required', 'error'); return; }
    try {
      await platformActionsApi.createInstance(userId, algorithmId, name, serviceCode);
      setNewInstName('');
      onReload();
      toast('Instance created', 'success');
    } catch (e) { toast(String(e), 'error'); }
  }

  if (algorithms.length === 0) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
        No algorithms registered for <strong>{serviceCode}</strong>.
      </div>
    );
  }

  // type → module → algorithms[]
  const algosByTypeModule = {};
  algorithms.forEach(a => {
    const t   = a.typeName   || a.type_name   || 'Unknown';
    const mod = a.moduleName || a.module_name || 'unknown';
    if (!algosByTypeModule[t])      algosByTypeModule[t]      = {};
    if (!algosByTypeModule[t][mod]) algosByTypeModule[t][mod] = [];
    algosByTypeModule[t][mod].push(a);
  });

  const instancesByAlgo = {};
  (instances || []).forEach(i => {
    const algId = i.algorithmId || i.algorithm_id;
    if (!instancesByAlgo[algId]) instancesByAlgo[algId] = [];
    instancesByAlgo[algId].push(i);
  });

  return (
    <div className="settings-list">
      {Object.entries(algosByTypeModule).sort(([a],[b]) => a.localeCompare(b)).map(([typeName, mods]) => (
        <div key={typeName} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{typeName}</span>
            <span style={{ fontSize: 10, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>type</span>
          </div>

          {Object.entries(mods).sort(([a],[b]) => a.localeCompare(b)).map(([mod, algos]) => (
            <div key={mod} style={{ marginBottom: 14, marginLeft: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <ModuleBadge module={mod} />
                <span style={{ fontSize: 9, color: 'var(--muted2)' }}>({algos.length})</span>
              </div>

              {algos.map(algo => {
                const algId       = algo.id;
                const isExp       = expandedAlgo === algId;
                const algoInsts   = instancesByAlgo[algId] || [];
                const algCode     = algo.code;
                const algName     = algo.name || algCode;

                return (
                  <div key={algId} className="settings-card" style={{ marginBottom: 4 }}>
                    <div className="settings-card-hd" onClick={() => {
                      const next = isExp ? null : algId;
                      setExpandedAlgo(next);
                      setNewInstName('');
                      if (next && !algoParams[next]) {
                        platformActionsApi.listAlgorithmParameters(userId, next)
                          .then(p => setAlgoParams(s => ({ ...s, [next]: Array.isArray(p) ? p : [] })))
                          .catch(() => setAlgoParams(s => ({ ...s, [next]: [] })));
                      }
                    }} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <span className="settings-card-chevron">
                        {isExp
                          ? <ChevronDownIcon  size={13} strokeWidth={2} color="var(--muted)" />
                          : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
                      </span>
                      <WorkflowIcon size={13} color="var(--accent)" strokeWidth={1.5} />
                      <span className="settings-card-name" style={{ marginLeft: 4 }}>{algName}</span>
                      <span className="settings-card-id">{algCode}</span>
                      <span style={{ flex: 1, fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 8 }}>
                        {algo.description || ''}
                      </span>
                      <span className="settings-badge" style={{ marginLeft: 8 }}>
                        {algoInsts.length} instance{algoInsts.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {isExp && (
                      <div className="settings-card-body" style={{ padding: '8px 12px 12px 28px' }}>
                        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                          <span>Handler: <code style={{ color: 'var(--text)' }}>{algo.handlerRef || algo.handler_ref || '—'}</code></span>
                          <span>Type: <code style={{ color: 'var(--text)' }}>{typeName}</code></span>
                        </div>

                        {/* Parameter schema */}
                        {(() => {
                          const pDefs = algoParams[algId];
                          if (!pDefs || pDefs.length === 0) return null;
                          return (
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                                Parameter Schema
                              </div>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Name','Label','Type','Req.','Default'].map(h => (
                                      <th key={h} style={{ textAlign: h === 'Req.' ? 'center' : 'left', padding: '3px 6px', color: 'var(--muted)', fontWeight: 600, fontSize: 10 }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {pDefs.map(p => {
                                    const pName  = p.paramName  || p.param_name;
                                    const pLabel = p.paramLabel || p.param_label || pName;
                                    const pType  = p.dataType   || p.data_type  || 'STRING';
                                    const pReq   = p.required === 1 || p.required === true;
                                    const pDef   = p.defaultValue || p.default_value || '';
                                    return (
                                      <tr key={p.id || pName} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '3px 6px', fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{pName}</td>
                                        <td style={{ padding: '3px 6px' }}>{pLabel}</td>
                                        <td style={{ padding: '3px 6px', fontFamily: 'var(--mono)', color: 'var(--muted)', fontSize: 10 }}>{pType}</td>
                                        <td style={{ padding: '3px 6px', textAlign: 'center' }}>{pReq ? '✓' : ''}</td>
                                        <td style={{ padding: '3px 6px', color: pDef ? 'var(--text)' : 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10 }}>{pDef || '—'}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}

                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                          Instances
                        </div>

                        {algoInsts.length === 0 && (
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>No instances</div>
                        )}

                        {algoInsts.map(inst => (
                          <InstanceCard key={inst.id} inst={inst} algo={algo}
                            userId={userId} canWrite={canWrite} toast={toast} onReload={onReload} />
                        ))}

                        {canWrite && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                            <input className="field-input" style={{ flex: 1, fontSize: 11, padding: '3px 6px' }}
                              placeholder="New instance name…"
                              value={newInstName}
                              onChange={e => setNewInstName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleCreateInstance(algId); }} />
                            <button className="btn btn-sm" style={{ fontSize: 10 }}
                              disabled={!newInstName.trim()}
                              onClick={() => handleCreateInstance(algId)}>
                              <PlusIcon size={10} strokeWidth={2.5} /> Create
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Instance card with inline param editing ── */
function InstanceCard({ inst, algo, userId, canWrite, toast, onReload }) {
  const [expanded, setExpanded] = useState(false);
  const [params,   setParams]   = useState(null);
  const [editing,  setEditing]  = useState(false);
  const [nameVal,  setNameVal]  = useState(inst.name || '');

  async function loadParams() {
    if (params !== null) return;
    try {
      const p = await platformActionsApi.getInstanceParams(userId, inst.id);
      setParams(Array.isArray(p) ? p : []);
    } catch { setParams([]); }
  }

  function toggle() {
    if (!expanded) loadParams();
    setExpanded(e => !e);
  }

  async function handleRename() {
    if (!nameVal.trim() || nameVal.trim() === inst.name) { setEditing(false); return; }
    try {
      await platformActionsApi.updateInstance(userId, inst.id, nameVal.trim());
      toast('Instance renamed', 'success');
      onReload();
    } catch (e) { toast(String(e), 'error'); }
    setEditing(false);
  }

  async function handleDelete() {
    try {
      await platformActionsApi.deleteInstance(userId, inst.id);
      toast('Instance deleted', 'success');
      onReload();
    } catch (e) { toast(String(e), 'error'); }
  }

  async function handleSetParam(parameterId, value) {
    try {
      await platformActionsApi.setInstanceParam(userId, inst.id, parameterId, value);
      const p = await platformActionsApi.getInstanceParams(userId, inst.id);
      setParams(Array.isArray(p) ? p : []);
    } catch (e) { toast(String(e), 'error'); }
  }

  return (
    <div className="settings-card" style={{ marginBottom: 2 }}>
      <div className="settings-card-hd" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={toggle}>
        <span className="settings-card-chevron">
          {expanded
            ? <ChevronDownIcon  size={11} strokeWidth={2} color="var(--muted)" />
            : <ChevronRightIcon size={11} strokeWidth={2} color="var(--muted)" />}
        </span>
        {editing ? (
          <input className="field-input" style={{ fontSize: 12, padding: '1px 4px', flex: 1 }}
            autoFocus value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === 'Enter')  handleRename();
              if (e.key === 'Escape') { setEditing(false); setNameVal(inst.name); }
            }}
            onClick={e => e.stopPropagation()} />
        ) : (
          <span className="settings-card-name" style={{ fontSize: 12, flex: 1 }}>{inst.name}</span>
        )}
        <span style={{ fontSize: 10, color: 'var(--muted2)', fontFamily: 'var(--mono)' }}>{inst.id?.slice(-8)}</span>
        {canWrite && (
          <span style={{ display: 'flex', gap: 4, marginLeft: 8 }} onClick={e => e.stopPropagation()}>
            <button className="btn btn-xs" onClick={() => { setEditing(true); setNameVal(inst.name); }}>
              <EditIcon size={10} />
            </button>
            <button className="btn btn-xs btn-danger" onClick={handleDelete}>
              <TrashIcon size={10} />
            </button>
          </span>
        )}
      </div>

      {expanded && (
        <div className="settings-card-body" style={{ padding: '6px 12px 8px 26px' }}>
          {params === null && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Loading params…</div>}
          {params !== null && params.length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>No parameters</div>
          )}
          {params !== null && params.length > 0 && (
            <table className="settings-table" style={{ width: '100%' }}>
              <thead>
                <tr><th>Parameter</th><th>Value</th></tr>
              </thead>
              <tbody>
                {params.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontSize: 11 }}>
                      {p.paramLabel || p.param_label || p.paramName || p.param_name}
                      {(p.dataType || p.data_type) && (
                        <span style={{ color: 'var(--muted2)', fontSize: 9, marginLeft: 4 }}>
                          {p.dataType || p.data_type}
                        </span>
                      )}
                    </td>
                    <td>
                      {canWrite ? (
                        <ParamValueInput
                          param={p}
                          onSave={val => handleSetParam(p.algorithmParameterId || p.algorithm_parameter_id || p.id, val)}
                        />
                      ) : (
                        <span style={{ fontSize: 11, fontFamily: 'var(--mono)' }}>
                          {p.value || <em style={{ color: 'var(--muted)' }}>—</em>}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Execution Stats tab ── */
function AlgorithmStatsTab({ stats, onLoad, onReset }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn btn-xs btn-primary" onClick={onLoad}>Refresh</button>
        <button className="btn btn-xs btn-danger" onClick={onReset}>Reset</button>
      </div>
      {stats === null && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Loading stats…</div>}
      {stats && stats.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>No algorithm executions recorded yet</div>
      )}
      {stats && stats.length > 0 && (
        <table className="settings-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Algorithm</th>
              <th style={{ textAlign: 'right' }}>Calls</th>
              <th style={{ textAlign: 'right' }}>Min (ms)</th>
              <th style={{ textAlign: 'right' }}>Avg (ms)</th>
              <th style={{ textAlign: 'right' }}>Max (ms)</th>
              <th style={{ textAlign: 'right' }}>Total (ms)</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.algorithmCode}>
                <td><code>{s.algorithmCode}</code></td>
                <td style={{ textAlign: 'right' }}>{s.callCount}</td>
                <td style={{ textAlign: 'right' }}>{typeof s.minMs === 'number' ? s.minMs.toFixed(3) : '—'}</td>
                <td style={{ textAlign: 'right' }}>{typeof s.avgMs === 'number' ? s.avgMs.toFixed(3) : '—'}</td>
                <td style={{ textAlign: 'right' }}>{typeof s.maxMs === 'number' ? s.maxMs.toFixed(3) : '—'}</td>
                <td style={{ textAlign: 'right' }}>{typeof s.totalMs === 'number' ? s.totalMs.toFixed(1) : '—'}</td>
                <td style={{ fontSize: 10, color: 'var(--muted)' }}>{s.lastFlushed || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ── Usage Graph tab ── */
function AlgorithmGraphTab({ timeseries, tsHours, onLoad }) {
  const SVG_W = 800, SVG_H = 200, PAD = { t: 20, r: 20, b: 40, l: 50 };
  const plotW = SVG_W - PAD.l - PAD.r;
  const plotH = SVG_H - PAD.t - PAD.b;

  function renderChart(series, label, color) {
    if (series.length === 0) return <div style={{ fontSize: 11, color: 'var(--muted)' }}>No data</div>;
    const maxCalls = Math.max(...series.map(s => s.calls), 1);
    return (
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 200, display: 'block' }}>
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = PAD.t + plotH * (1 - f);
          return (
            <g key={f}>
              <line x1={PAD.l} x2={SVG_W - PAD.r} y1={y} y2={y} stroke="var(--border)" strokeWidth={0.5} />
              <text x={PAD.l - 4} y={y + 3} textAnchor="end" fill="var(--muted)" fontSize={9}>{Math.round(maxCalls * f)}</text>
            </g>
          );
        })}
        {series.map((s, i) => {
          const barW = Math.max(plotW / series.length - 1, 2);
          const x = PAD.l + (i / series.length) * plotW;
          const h = (s.calls / maxCalls) * plotH;
          const y = PAD.t + plotH - h;
          const showLabel = series.length < 20 || i % Math.ceil(series.length / 12) === 0;
          const timeStr = s.windowStart.replace('T', ' ').slice(11, 16);
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} fill={color} opacity={0.8} rx={1}>
                <title>{s.windowStart.replace('T', ' ').slice(0, 16)} — {s.calls} calls, {s.totalMs.toFixed(1)}ms</title>
              </rect>
              {showLabel && (
                <text x={x + barW / 2} y={SVG_H - PAD.b + 14} textAnchor="middle" fill="var(--muted)" fontSize={8}
                  transform={`rotate(-45, ${x + barW / 2}, ${SVG_H - PAD.b + 14})`}>{timeStr}</text>
              )}
            </g>
          );
        })}
        <text x={12} y={PAD.t + plotH / 2} textAnchor="middle" fill="var(--muted)" fontSize={9}
          transform={`rotate(-90, 12, ${PAD.t + plotH / 2})`}>Calls</text>
        <text x={PAD.l} y={12} fill="var(--text)" fontSize={11} fontWeight={600}>{label}</text>
      </svg>
    );
  }

  // Aggregate timeseries into global series
  const windowMap = {};
  (timeseries || []).forEach(p => {
    if (!windowMap[p.windowStart]) windowMap[p.windowStart] = { calls: 0, totalMs: 0 };
    windowMap[p.windowStart].calls   += p.callCount || 0;
    windowMap[p.windowStart].totalMs += p.totalMs   || 0;
  });
  const globalSeries = Object.keys(windowMap).sort().map(w => ({ windowStart: w, ...windowMap[w] }));

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <button className="btn btn-xs btn-primary" onClick={() => onLoad(tsHours)}>Refresh</button>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Window:</span>
        {[6, 12, 24, 48].map(h => (
          <button key={h} className="btn btn-xs" onClick={() => onLoad(h)}
            style={{ background: tsHours === h ? 'var(--accent)' : undefined, color: tsHours === h ? '#fff' : undefined }}>{h}h</button>
        ))}
      </div>
      {timeseries === null && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Loading…</div>}
      {timeseries && timeseries.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>No windowed data yet. Stats are bucketed every 15 seconds on flush.</div>
      )}
      {timeseries && timeseries.length > 0 && (
        <div style={{ background: 'var(--bg2)', borderRadius: 6, padding: 12 }}>
          {renderChart(globalSeries, 'All Algorithms (aggregate)', '#3b82f6')}
        </div>
      )}
    </div>
  );
}

/* ── Inline param value editor ── */
function ParamValueInput({ param, onSave }) {
  const [val,   setVal]   = useState(param.value || '');
  const [dirty, setDirty] = useState(false);
  function handleChange(v) { setVal(v); setDirty(v !== (param.value || '')); }
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <input className="field-input" style={{ fontSize: 11, padding: '1px 4px', flex: 1 }}
        value={val}
        onChange={e => handleChange(e.target.value)}
        onBlur={() => { if (dirty) { onSave(val); setDirty(false); } }} />
      {dirty && (
        <button className="btn btn-xs btn-primary" onClick={() => { onSave(val); setDirty(false); }}>
          Save
        </button>
      )}
    </div>
  );
}
