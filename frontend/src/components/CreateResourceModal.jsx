import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

/**
 * Federated create form. First row exposes two selects (Source then Type),
 * mirroring the historical "Object type" dropdown but extended across services.
 *
 * Source = `sourceLabel` (PLM, DATA, ...). Type = one descriptor within that source
 * (Document / Part / Assembly for PLM; Data file for DATA). Both default to the
 * first available entry when the modal opens.
 *
 * Below the cascade, the descriptor's `create.parameters` drive the form.
 * Parameters carry `displayOrder` and `displaySection` — the form sorts by
 * order then groups under a header per section. NodeItemContribution emits
 * the identifier fields (logical_id / external_id) at displayOrder 0..n with
 * section "Identity", so they always render before attribute groups.
 *
 * Widget map:
 *   - TEXT/NUMBER → text/number input + live pattern-match badge if
 *     `validationRegex` is set (logical-id pattern feedback);
 *   - TEXTAREA → multiline;
 *   - DROPDOWN/SELECT → JSON-parsed `allowedValues`;
 *   - FILE → multipart upload.
 */
export default function CreateResourceModal({ resources, onCreated, onClose, toast, initialDescriptor }) {
  const sources = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const d of resources || []) {
      const k = d.sourceLabel || 'OTHER';
      if (!seen.has(k)) { seen.add(k); out.push(k); }
    }
    return out;
  }, [resources]);

  const [source, setSource] = useState(
    initialDescriptor?.sourceLabel || sources[0] || ''
  );

  const types = useMemo(
    () => (resources || []).filter(d => (d.sourceLabel || 'OTHER') === source),
    [resources, source]
  );

  const [descriptor, setDescriptor] = useState(() => {
    if (initialDescriptor) {
      return (resources || []).find(d =>
        d.serviceCode === initialDescriptor.serviceCode &&
        d.itemCode    === initialDescriptor.itemCode &&
        (d.itemKey || '') === (initialDescriptor.itemKey || '')
      ) || null;
    }
    return types[0] || null;
  });

  // Reset type when source switches (skip when locked by initialDescriptor).
  useEffect(() => {
    if (!initialDescriptor) setDescriptor(types[0] || null);
  }, [source]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset values when descriptor switches.
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => { setValues({}); setErrors({}); }, [descriptor]);

  if (!descriptor) {
    return (
      <div className="overlay" role="dialog" aria-modal="true">
        <div className="card create-node-modal">
          <div className="card-hd">
            <span className="card-title">Create object</span>
            <button className="btn btn-sm" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div className="modal-scroll" style={{ padding: 24, color: 'var(--muted)' }}>
            No creatable resources available.
          </div>
        </div>
      </div>
    );
  }

  const action = descriptor.create;
  const params = (action?.parameters || []).slice().sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  // Section grouping while preserving order. Same section keeps appending;
  // a new section opens only when the running section changes.
  const groups = [];
  let currentSection = null;
  for (const p of params) {
    const sec = p.displaySection || 'Fields';
    if (groups.length === 0 || sec !== currentSection) {
      groups.push({ section: sec, items: [] });
      currentSection = sec;
    }
    groups[groups.length - 1].items.push(p);
  }

  function setField(name, value) {
    setValues(v => ({ ...v, [name]: value }));
    setErrors(e => ({ ...e, [name]: null }));
  }

  function validate() {
    const e = {};
    for (const p of params) {
      const v = values[p.name];
      if (p.required && (v == null || v === '' || (v instanceof File && v.size === 0))) {
        e[p.name] = 'Required';
      }
      if (p.validationRegex && typeof v === 'string' && v.trim()) {
        try {
          if (!new RegExp(`^(?:${p.validationRegex})$`).test(v.trim())) {
            e[p.name] = `Does not match pattern: ${p.validationRegex}`;
          }
        } catch { /* invalid regex on server side — ignore */ }
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await api.createResource(descriptor, values);
      toast(`${descriptor.displayName || descriptor.itemCode} created`, 'success');
      onCreated?.(result, descriptor);
      onClose();
    } catch (err) {
      toast(err, 'error');
    } finally { setLoading(false); }
  }

  function renderField(p) {
    const widget = (p.widgetType || 'TEXT').toUpperCase();
    const err = errors[p.name];
    const val = values[p.name];

    if (widget === 'FILE') {
      return (
        <div className="field" key={p.name}>
          <label className="field-label" htmlFor={`f-${p.name}`}>
            {p.label}{p.required && <span className="field-req"> *</span>}
          </label>
          <input
            id={`f-${p.name}`}
            type="file"
            className={`field-input${err ? ' error' : ''}`}
            onChange={e => setField(p.name, e.target.files?.[0] || null)}
          />
          {p.tooltip && <span className="field-hint">{p.tooltip}</span>}
          {err && <span className="field-hint error" role="alert">{err}</span>}
        </div>
      );
    }
    if (widget === 'TEXTAREA') {
      return (
        <div className="field" key={p.name}>
          <label className="field-label" htmlFor={`f-${p.name}`}>
            {p.label}{p.required && <span className="field-req"> *</span>}
          </label>
          <textarea
            id={`f-${p.name}`}
            className={`field-input${err ? ' error' : ''}`}
            placeholder={p.tooltip || ''}
            value={val || ''}
            onChange={e => setField(p.name, e.target.value)}
          />
          {err && <span className="field-hint error" role="alert">{err}</span>}
        </div>
      );
    }
    if (widget === 'DROPDOWN' || widget === 'SELECT') {
      const opts = p.allowedValues ? safeParse(p.allowedValues) : [];
      return (
        <div className="field" key={p.name}>
          <label className="field-label" htmlFor={`f-${p.name}`}>
            {p.label}{p.required && <span className="field-req"> *</span>}
          </label>
          <select
            id={`f-${p.name}`}
            className={`field-input${err ? ' error' : ''}`}
            value={val || ''}
            onChange={e => setField(p.name, e.target.value)}
          >
            <option value="">— select —</option>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
          {err && <span className="field-hint error" role="alert">{err}</span>}
        </div>
      );
    }

    // TEXT / NUMBER + live pattern-match badge
    const trimmed = (val || '').toString().trim();
    const regex = p.validationRegex
      ? safeRegex(`^(?:${p.validationRegex})$`)
      : null;
    const matches = !regex || !trimmed ? null : regex.test(trimmed);
    return (
      <div className="field" key={p.name}>
        <label className="field-label" htmlFor={`f-${p.name}`}>
          {p.label}{p.required && <span className="field-req"> *</span>}
        </label>
        <div className="logical-id-wrap">
          <input
            id={`f-${p.name}`}
            type={widget === 'NUMBER' ? 'number' : 'text'}
            className={`field-input${
              err              ? ' error'
              : matches === true ? ' ok'
              : matches === false ? ' error'
              : ''
            }`}
            placeholder={p.tooltip || (p.validationRegex ? `pattern: ${p.validationRegex}` : '')}
            value={val || ''}
            onChange={e => setField(p.name, e.target.value)}
          />
          {trimmed && regex && (
            <span className={`logical-id-badge ${matches ? 'ok' : 'err'}`}>
              {matches ? '✓' : '✗'}
            </span>
          )}
        </div>
        {p.validationRegex && (
          <div className="logical-id-hint">
            <span className="logical-id-hint-label">Pattern</span>
            <code className="logical-id-hint-code">{p.validationRegex}</code>
            {!trimmed && <span className="logical-id-hint-idle">start typing to validate</span>}
            {trimmed && matches === false && <span className="logical-id-hint-err">no match</span>}
            {trimmed && matches === true && <span className="logical-id-hint-ok">matches</span>}
          </div>
        )}
        {!p.validationRegex && p.tooltip && <span className="field-hint">{p.tooltip}</span>}
        {err && <span className="field-hint error" role="alert">{err}</span>}
      </div>
    );
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="card create-node-modal">
        <div className="card-hd">
          <span className="card-title">Create object</span>
          <button className="btn btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-scroll">

          {/* Row 1 — Source + Type cascade */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="field" style={{ margin: 0, flex: '0 0 180px' }}>
              <label className="field-label" htmlFor="rc-source">Source</label>
              <select
                id="rc-source"
                className="field-input"
                value={source}
                onChange={e => setSource(e.target.value)}
                disabled={!!initialDescriptor}
              >
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field" style={{ margin: 0, flex: 1 }}>
              <label className="field-label" htmlFor="rc-type">Type</label>
              <select
                id="rc-type"
                className="field-input"
                value={descriptor ? `${descriptor.serviceCode}/${descriptor.itemCode}/${descriptor.itemKey || ''}` : ''}
                onChange={e => {
                  const id = e.target.value;
                  const next = types.find(d =>
                    `${d.serviceCode}/${d.itemCode}/${d.itemKey || ''}` === id);
                  if (next) setDescriptor(next);
                }}
                disabled={!!initialDescriptor}
              >
                {types.map(d => {
                  const id = `${d.serviceCode}/${d.itemCode}/${d.itemKey || ''}`;
                  return <option key={id} value={id}>{d.displayName}</option>;
                })}
              </select>
            </div>
          </div>

          {descriptor.description && (
            <div style={{ padding: '12px 0 0', color: 'var(--muted)', fontSize: 12 }}>
              {descriptor.description}
            </div>
          )}

          {groups.map((g, gi) => (
            <React.Fragment key={`grp-${gi}-${g.section}`}>
              <div className="modal-identity-sep" style={{ marginTop: gi === 0 ? 16 : 18 }}>
                <span>{g.section}</span>
              </div>
              {g.items.map(p => renderField(p))}
            </React.Fragment>
          ))}
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

function safeRegex(src) { try { return new RegExp(src); } catch { return null; } }
function safeParse(s)   { try { return JSON.parse(s); } catch { return []; } }
