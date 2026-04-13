import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from './Icons';

// ── Method badge ─────────────────────────────────────────────────────
const METHOD_STYLE = {
  get:    { bg: 'rgba(56,189,248,.13)',  text: '#38bdf8', border: 'rgba(56,189,248,.28)'  },
  post:   { bg: 'rgba(74,222,128,.13)',  text: '#4ade80', border: 'rgba(74,222,128,.28)'  },
  put:    { bg: 'rgba(251,191,36,.13)',  text: '#fbbf24', border: 'rgba(251,191,36,.28)'  },
  delete: { bg: 'rgba(252,129,129,.13)', text: '#fc8181', border: 'rgba(252,129,129,.28)' },
  patch:  { bg: 'rgba(167,139,250,.13)', text: '#a78bfa', border: 'rgba(167,139,250,.28)' },
};

function MethodBadge({ method }) {
  const s = METHOD_STYLE[method] || METHOD_STYLE.get;
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 3, padding: '2px 8px', fontSize: 10, fontWeight: 700,
      fontFamily: 'var(--sans)', letterSpacing: '.07em', textTransform: 'uppercase',
      flexShrink: 0, width: 58, textAlign: 'center', display: 'inline-block',
    }}>
      {method}
    </span>
  );
}

// ── Build a minimal JSON example from an OpenAPI schema ──────────────
function schemaToExample(schema, depth = 0) {
  if (!schema || depth > 4) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.type === 'object' || schema.properties) {
    const obj = {};
    Object.entries(schema.properties || {}).forEach(([k, v]) => {
      obj[k] = schemaToExample(v, depth + 1);
    });
    return obj;
  }
  if (schema.type === 'array')   return [schemaToExample(schema.items, depth + 1)];
  if (schema.type === 'string')  return schema.enum?.[0] ?? '';
  if (schema.type === 'boolean') return false;
  if (schema.type === 'integer' || schema.type === 'number') return 0;
  return null;
}

// ── Single endpoint row ──────────────────────────────────────────────
function EndpointRow({ method, path, operation, userId, projectSpaceId }) {
  const [open,      setOpen]      = useState(false);
  const [params,    setParams]    = useState({});
  const [body,      setBody]      = useState('');
  const [response,  setResponse]  = useState(null);
  const [executing, setExecuting] = useState(false);
  const [plmUser,   setPlmUser]   = useState(userId);
  const [plmSpace,  setPlmSpace]  = useState(projectSpaceId || '');

  // Keep pre-filled headers in sync if parent props change
  useEffect(() => { setPlmUser(userId); },           [userId]);
  useEffect(() => { setPlmSpace(projectSpaceId || ''); }, [projectSpaceId]);

  const parameters = operation.parameters || [];
  const hasBody    = ['post', 'put', 'patch'].includes(method);

  // Pre-fill body from spec example / schema on first open
  useEffect(() => {
    if (!open || !hasBody || body) return;
    const content = operation.requestBody?.content?.['application/json'];
    if (!content) return;
    let example = content.example ?? content.schema?.example;
    if (example === undefined && content.schema) example = schemaToExample(content.schema);
    if (example != null) setBody(JSON.stringify(example, null, 2));
  }, [open, hasBody, operation, body]);

  async function execute() {
    setExecuting(true);
    setResponse(null);

    let url = path;
    parameters.filter(p => p.in === 'path').forEach(p => {
      url = url.replace(`{${p.name}}`, encodeURIComponent(params[p.name] ?? ''));
    });

    const qp = new URLSearchParams();
    parameters.filter(p => p.in === 'query').forEach(p => {
      if (params[p.name]) qp.append(p.name, params[p.name]);
    });
    const qs = qp.toString();
    if (qs) url += '?' + qs;

    const hdrs = { 'Content-Type': 'application/json' };
    if (plmUser)  hdrs['X-PLM-User']         = plmUser;
    if (plmSpace) hdrs['X-PLM-ProjectSpace']  = plmSpace;
    parameters.filter(p => p.in === 'header').forEach(p => {
      if (params[p.name]) hdrs[p.name] = params[p.name];
    });

    try {
      const res  = await fetch(url, {
        method: method.toUpperCase(),
        headers: hdrs,
        body: hasBody && body.trim() ? body : undefined,
      });
      const text = await res.text();
      let pretty = text;
      try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      setResponse({ status: res.status, ok: res.ok, body: pretty || '(empty)' });
    } catch (e) {
      setResponse({ status: 0, ok: false, body: `Network error: ${e.message}` });
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className={`pg-row${open ? ' pg-row--open' : ''}`}>
      {/* Collapsed header */}
      <div className="pg-row-hd" onClick={() => setOpen(o => !o)}>
        <span className="pg-chevron">
          {open
            ? <ChevronDownIcon  size={11} strokeWidth={2.5} color="var(--muted2)" />
            : <ChevronRightIcon size={11} strokeWidth={2.5} color="var(--muted2)" />
          }
        </span>
        <MethodBadge method={method} />
        <code className="pg-path">{path}</code>
        {operation.summary && (
          <span className="pg-summary">{operation.summary}</span>
        )}
      </div>

      {/* Expanded body */}
      {open && (
        <div className="pg-row-body">

          {/* PLM request headers — always visible, pre-filled, editable */}
          <div className="pg-section">
            <div className="pg-section-label">Headers</div>
            <div className="pg-header-grid">
              <div className="pg-header-row">
                <code className="pg-header-name">X-PLM-User</code>
                <input
                  className="pg-input pg-header-input"
                  value={plmUser}
                  onChange={e => setPlmUser(e.target.value)}
                  placeholder="user-alice"
                />
              </div>
              <div className="pg-header-row">
                <code className="pg-header-name">X-PLM-ProjectSpace</code>
                <input
                  className="pg-input pg-header-input"
                  value={plmSpace}
                  onChange={e => setPlmSpace(e.target.value)}
                  placeholder="ps-default"
                />
              </div>
            </div>
          </div>

          {/* Parameters */}
          {parameters.length > 0 && (
            <div className="pg-section">
              <div className="pg-section-label">Parameters</div>
              <div className="pg-params-grid">
                {parameters.map(p => (
                  <div key={p.name} className="pg-param">
                    <div className="pg-param-hd">
                      <code className="pg-param-name">{p.name}</code>
                      <span className="pg-param-in">{p.in}</span>
                      {p.required && <span className="pg-param-req">req</span>}
                      {p.description && <span className="pg-param-desc">{p.description}</span>}
                    </div>
                    <input
                      className="pg-input"
                      placeholder={String(p.schema?.example ?? p.schema?.type ?? '')}
                      value={params[p.name] ?? ''}
                      onChange={e => setParams(ps => ({ ...ps, [p.name]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request body */}
          {hasBody && (
            <div className="pg-section">
              <div className="pg-section-label">
                Body
                <span className="pg-section-sub">application/json</span>
              </div>
              <textarea
                className="pg-body-editor"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={5}
                spellCheck={false}
                placeholder="{}"
              />
            </div>
          )}

          {/* Execute bar */}
          <div className="pg-exec-bar">
            <button
              className="btn btn-primary btn-sm"
              onClick={execute}
              disabled={executing}
              style={{ minWidth: 90 }}
            >
              {executing ? 'Sending…' : '▶ Execute'}
            </button>
            <span className="pg-exec-meta">
              as <strong>{userId}</strong>
            </span>
            {response && (
              <button className="btn btn-xs" style={{ marginLeft: 'auto' }} onClick={() => setResponse(null)}>
                Clear
              </button>
            )}
          </div>

          {/* Response */}
          {response && (
            <div className="pg-response">
              <div className="pg-response-hd">
                <span className="pg-status" style={{
                  background: response.ok ? 'rgba(77,212,160,.15)' : 'rgba(252,129,129,.15)',
                  color:      response.ok ? 'var(--success)'        : 'var(--danger)',
                  border:    `1px solid ${response.ok ? 'rgba(77,212,160,.3)' : 'rgba(252,129,129,.3)'}`,
                }}>
                  {response.status || 'ERR'}
                </span>
                <span className="pg-response-label">{response.ok ? 'OK' : 'Error'}</span>
              </div>
              <pre className="pg-response-body">{response.body}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function ApiPlayground({ userId, projectSpaceId }) {
  const [spec,         setSpec]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [filter,       setFilter]       = useState('');
  const [collapsedTags, setCollapsedTags] = useState({});

  const loadSpec = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/v3/api-docs')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — is the backend running?`);
        return r.json();
      })
      .then(data => { setSpec(data); setLoading(false); })
      .catch(e  => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => { loadSpec(); }, [loadSpec]);

  const taggedOps = useMemo(() => {
    if (!spec?.paths) return [];
    const groups = {};
    Object.entries(spec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, op]) => {
        if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) return;
        const tag = op.tags?.[0] ?? 'default';
        if (!groups[tag]) groups[tag] = [];
        groups[tag].push({ method, path, operation: op });
      });
    });
    const ORDER = ['get', 'post', 'put', 'patch', 'delete'];
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, ops]) => [
        tag,
        [...ops].sort((a, b) => ORDER.indexOf(a.method) - ORDER.indexOf(b.method)),
      ]);
  }, [spec]);

  const filteredOps = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return taggedOps;
    return taggedOps
      .map(([tag, ops]) => [
        tag,
        ops.filter(({ method, path, operation }) =>
          method.includes(q) ||
          path.toLowerCase().includes(q) ||
          (operation.summary || '').toLowerCase().includes(q) ||
          tag.toLowerCase().includes(q)
        ),
      ])
      .filter(([, ops]) => ops.length > 0);
  }, [taggedOps, filter]);

  function toggleTag(tag) {
    setCollapsedTags(prev => ({ ...prev, [tag]: !prev[tag] }));
  }

  const totalPaths = spec ? Object.keys(spec.paths || {}).length : 0;

  if (loading) return <div className="settings-loading">Fetching OpenAPI spec…</div>;

  if (error) return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--danger)' }}>✗ {error}</span>
      <button className="btn btn-sm" style={{ alignSelf: 'flex-start' }} onClick={loadSpec}>Retry</button>
    </div>
  );

  return (
    <div className="pg-shell">
      {/* Top bar */}
      <div className="pg-topbar">
        <span className="pg-topbar-title">{spec?.info?.title}</span>
        <span className="pg-topbar-ver">v{spec?.info?.version}</span>
        <span className="pg-topbar-meta">{totalPaths} paths</span>
        <span className="pg-topbar-user">
          as <strong>{userId}</strong>
          {projectSpaceId && (
            <span style={{ marginLeft: 8, color: 'var(--accent)', opacity: .75 }}>· {projectSpaceId}</span>
          )}
        </span>
        <button className="btn btn-xs pg-topbar-refresh" onClick={loadSpec} title="Reload spec">⟳ Reload</button>
      </div>

      {/* Filter */}
      <div className="pg-filter">
        <input
          className="pg-filter-input"
          placeholder="Filter endpoints…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        {filter && (
          <button className="btn btn-xs" onClick={() => setFilter('')}>Clear</button>
        )}
      </div>

      {/* Endpoint list */}
      <div className="pg-list">
        {filteredOps.length === 0 && (
          <div style={{ padding: '32px 20px', fontSize: 12, color: 'var(--muted2)', fontStyle: 'italic' }}>
            No endpoints match &ldquo;{filter}&rdquo;
          </div>
        )}
        {filteredOps.map(([tag, ops]) => {
          const collapsed = !!collapsedTags[tag];
          return (
            <div key={tag} className="pg-group">
              {/* Tag header */}
              <div className="pg-group-hd" onClick={() => toggleTag(tag)}>
                <span className="pg-chevron">
                  {collapsed
                    ? <ChevronRightIcon size={11} strokeWidth={2.5} color="var(--muted2)" />
                    : <ChevronDownIcon  size={11} strokeWidth={2.5} color="var(--muted2)" />
                  }
                </span>
                <span className="pg-group-name">{tag}</span>
                <span className="pg-group-count">{ops.length}</span>
              </div>

              {/* Endpoint rows */}
              {!collapsed && ops.map(({ method, path, operation }) => (
                <EndpointRow
                  key={`${method}:${path}`}
                  method={method}
                  path={path}
                  operation={operation}
                  userId={userId}
                  projectSpaceId={projectSpaceId}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
