import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function CreateNodeModal({ userId, nodeTypes, onCreated, onClose, toast }) {
  const firstType = nodeTypes[0];
  const [nodeTypeId,     setNodeTypeId]    = useState(firstType?.id || firstType?.ID || '');
  const [logicalId,      setLogicalId]     = useState('');
  const [externalId,     setExternalId]    = useState('');
  const [logicalLabel,   setLogicalLabel]  = useState(
    firstType?.logical_id_label || firstType?.LOGICAL_ID_LABEL || 'Identifier'
  );
  const [logicalPattern, setLogicalPattern]= useState(
    firstType?.logical_id_pattern || firstType?.LOGICAL_ID_PATTERN || ''
  );
  const [attrDefs,       setAttrDefs]      = useState([]);
  // Global attrs cache — values persist across node type switches
  const [attrs,          setAttrs]         = useState({});
  const [errors,         setErrors]        = useState({});
  const [loading,        setLoading]       = useState(false);

  useEffect(() => {
    if (!nodeTypeId) return;
    api.getNodeTypeAttributes(userId, nodeTypeId)
      .then(defs => { setAttrDefs(Array.isArray(defs) ? defs : []); setErrors({}); })
      .catch(() => setAttrDefs([]));
    // Pull identity metadata directly from the nodeTypes prop — no extra request needed
    const nt = nodeTypes.find(t => (t.id || t.ID) === nodeTypeId);
    setLogicalLabel(nt?.logical_id_label || nt?.LOGICAL_ID_LABEL || 'Identifier');
    setLogicalPattern(nt?.logical_id_pattern || nt?.LOGICAL_ID_PATTERN || '');
    // Do NOT clear logicalId / externalId / attrs — values persist across type switches
  }, [nodeTypeId, userId, nodeTypes]);

  // Live logical_id pattern check — derived, no state needed
  const logicalIdTrimmed  = logicalId.trim();
  const patternRegex      = logicalPattern ? (() => { try { return new RegExp(logicalPattern); } catch { return null; } })() : null;
  const patternMatches    = !patternRegex || !logicalIdTrimmed ? null : patternRegex.test(logicalIdTrimmed);

  function validate() {
    const e = {};
    // logical_id
    if (!logicalIdTrimmed) {
      e._logicalId = 'Required';
    } else if (patternRegex && !patternMatches) {
      e._logicalId = `Does not match pattern: ${logicalPattern}`;
    }
    // attributes
    attrDefs.forEach(d => {
      const id  = d.id  || d.ID;
      const req = d.required || d.REQUIRED;
      const val = attrs[id] || '';
      if (req && !val.trim()) e[id] = 'Required';
      const regex = d.naming_regex || d.NAMING_REGEX;
      if (regex && val.trim() && !new RegExp(regex).test(val)) e[id] = 'Format: ' + regex;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setLoading(true);
    try {
      // Only send attributes defined for the current node type
      const currentAttrIds = new Set(attrDefs.map(d => d.id || d.ID));
      const filteredAttrs  = Object.fromEntries(
        Object.entries(attrs).filter(([k]) => currentAttrIds.has(k))
      );
      const data = await api.createNode(userId, nodeTypeId, filteredAttrs, logicalId.trim(), externalId.trim() || null);
      toast('Object created', 'success');
      onCreated(data.nodeId);
      onClose();
    } catch (e) { toast(e, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="create-title">
      <div className="card create-node-modal">
        <div className="card-hd">
          <span className="card-title" id="create-title">Create object</span>
          <button className="btn btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-scroll">
          <div className="field">
            <label className="field-label" htmlFor="node-type-select">Object type</label>
            <select
              id="node-type-select"
              className="field-input"
              value={nodeTypeId}
              onChange={e => setNodeTypeId(e.target.value)}
            >
              {nodeTypes.map(nt => {
                const ntId   = nt.id   || nt.ID;
                const ntName = nt.name || nt.NAME;
                return <option key={ntId} value={ntId}>{ntName}</option>;
              })}
            </select>
          </div>

          {/* ── Core identity fields ── */}
          <div className="modal-identity-sep">
            <span>Identity</span>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="logical-id-input">
              {logicalLabel} <span className="field-req" aria-label="required">*</span>
            </label>
            <div className="logical-id-wrap">
              <input
                id="logical-id-input"
                className={`field-input${
                  errors._logicalId                          ? ' error'
                  : patternMatches === true                  ? ' ok'
                  : ''
                }`}
                placeholder={logicalPattern ? `pattern: ${logicalPattern}` : 'e.g. DOC-0042'}
                value={logicalId}
                aria-invalid={!!errors._logicalId}
                aria-describedby="logical-id-hint"
                onChange={e => { setLogicalId(e.target.value); setErrors(er => ({ ...er, _logicalId: null })); }}
              />
              {/* Live match badge — shown once the user starts typing */}
              {logicalIdTrimmed && patternRegex && (
                <span className={`logical-id-badge ${patternMatches ? 'ok' : 'err'}`}>
                  {patternMatches ? '✓' : '✗'}
                </span>
              )}
            </div>
            {/* Pattern hint — always visible when a pattern is defined */}
            {logicalPattern && (
              <div id="logical-id-hint" className="logical-id-hint">
                <span className="logical-id-hint-label">Pattern</span>
                <code className="logical-id-hint-code">{logicalPattern}</code>
                {!logicalIdTrimmed && (
                  <span className="logical-id-hint-idle">start typing to validate</span>
                )}
                {logicalIdTrimmed && patternMatches === false && (
                  <span className="logical-id-hint-err">no match</span>
                )}
                {logicalIdTrimmed && patternMatches === true && (
                  <span className="logical-id-hint-ok">matches</span>
                )}
              </div>
            )}
            {errors._logicalId && (
              <span className="field-hint error" role="alert">{errors._logicalId}</span>
            )}
          </div>
          <div className="field">
            <label className="field-label" htmlFor="external-id-input">External ID <span style={{ color: 'var(--muted2)' }}>(optional)</span></label>
            <input
              id="external-id-input"
              className="field-input"
              placeholder="Supplier / ERP reference"
              value={externalId}
              onChange={e => setExternalId(e.target.value)}
            />
          </div>

          {/* ── Additional attributes ── */}
          {attrDefs.length > 0 && (
            <div className="modal-identity-sep"><span>Attributes</span></div>
          )}
          {[...attrDefs]
            .sort((a, b) => (a.display_order || a.DISPLAY_ORDER || 0) - (b.display_order || b.DISPLAY_ORDER || 0))
            .map(d => {
              const id       = d.id         || d.ID;
              const label    = d.label      || d.LABEL    || d.name || d.NAME;
              const required = d.required   || d.REQUIRED;
              const widget   = (d.widget_type || d.WIDGET_TYPE || 'TEXT').toUpperCase();
              const rawVals  = d.allowed_values || d.ALLOWED_VALUES;
              const options  = rawVals ? JSON.parse(rawVals) : [];
              const tooltip  = d.tooltip || d.TOOLTIP;
              const err      = errors[id];
              return (
                <div className="field" key={id}>
                  <label className="field-label" htmlFor={`attr-${id}`}>
                    {label}
                    {required && <span className="field-req" aria-label="required">*</span>}
                  </label>
                  {widget === 'DROPDOWN' || widget === 'SELECT'
                    ? (
                      <select id={`attr-${id}`} className={`field-input${err ? ' error' : ''}`}
                        value={attrs[id] || ''}
                        onChange={e => { setAttrs(a => ({ ...a, [id]: e.target.value })); setErrors(er => ({ ...er, [id]: null })); }}>
                        <option value="">— select —</option>
                        {options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input id={`attr-${id}`} className={`field-input${err ? ' error' : ''}`}
                        placeholder={tooltip || ''}
                        value={attrs[id] || ''}
                        aria-invalid={!!err}
                        aria-describedby={err ? `err-${id}` : undefined}
                        onChange={e => { setAttrs(a => ({ ...a, [id]: e.target.value })); setErrors(er => ({ ...er, [id]: null })); }} />
                    )}
                  {err && <span id={`err-${id}`} className="field-hint error" role="alert">{err}</span>}
                </div>
              );
            })}
        </div>
        <div className="card-hd" style={{ borderTop: '1px solid var(--border)', borderBottom: 'none' }}>
          <div className="row flex-end" style={{ width: '100%', gap: 8 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
