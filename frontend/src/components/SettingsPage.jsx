import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import {
  GearIcon, LayersIcon, LifecycleIcon, CloseIcon,
  ChevronRightIcon, ChevronDownIcon, HexIcon, TerminalIcon, PlusIcon,
  EditIcon, TrashIcon, UsersIcon, UserIcon, ShieldIcon,
} from './Icons';
import { NODE_ICONS, NODE_ICON_NAMES } from './Icons';
import ApiPlayground from './ApiPlayground';

const SECTIONS = [
  { key: 'node-types',      label: 'Node Types',     Icon: LayersIcon,    requiredPermission: 'MANAGE_METAMODEL' },
  { key: 'lifecycles',      label: 'Lifecycles',     Icon: LifecycleIcon, requiredPermission: 'MANAGE_METAMODEL' },
  { key: 'proj-spaces',     label: 'Project Spaces', Icon: HexIcon,       requiredPermission: 'MANAGE_ROLES'     },
  { key: 'users-roles',     label: 'Users & Roles',  Icon: UsersIcon,     requiredPermission: 'MANAGE_ROLES'     },
  { key: 'access-rights',   label: 'Access Rights',  Icon: ShieldIcon,    requiredPermission: 'MANAGE_ROLES'     },
  { key: 'api-playground',  label: 'API Playground', Icon: TerminalIcon,  requiredPermission: null               },
];

const LINK_POLICIES      = ['VERSION_TO_MASTER', 'VERSION_TO_VERSION'];
const NUMBERING_SCHEMES  = ['ALPHA_NUMERIC'];
const VERSION_POLICIES   = ['NONE', 'ITERATE', 'RELEASE'];
const DATA_TYPES         = ['STRING', 'NUMBER', 'DATE', 'BOOLEAN', 'ENUM'];
const WIDGET_TYPES   = ['TEXT', 'TEXTAREA', 'DROPDOWN', 'DATE_PICKER', 'CHECKBOX'];
const ACTION_TYPES   = ['NONE', 'REQUIRE_SIGNATURE'];
const VERSION_STRATS = ['NONE', 'ITERATE', 'REVISE'];

/* ── Shared modal shell ──────────────────────────────────────────── */
function MetaModal({ title, onClose, onSave, saving, saveLabel = 'Save', children, width = 480 }) {
  return (
    <div
      className="diff-overlay"
      style={{ zIndex: 600 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="diff-modal" style={{ width, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="diff-header">
          <span className="diff-title">{title}</span>
          <button className="diff-close" onClick={onClose}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Labelled field */
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</label>
      {children}
    </div>
  );
}

/* Color picker row: swatch + native color input + clear button */
function ColorField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 4, flexShrink: 0,
          background: value || 'var(--bg3)',
          border: '1px solid var(--border)',
        }} />
        <input
          type="color"
          className="field-input"
          style={{ width: 48, height: 28, padding: 1, cursor: 'pointer' }}
          value={value || '#6aacff'}
          onChange={e => onChange(e.target.value)}
        />
        <input
          type="text"
          className="field-input"
          style={{ flex: 1 }}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="#rrggbb"
          maxLength={7}
        />
        {value && (
          <button
            className="btn btn-sm"
            style={{ padding: '2px 8px', fontSize: 10 }}
            onClick={() => onChange('')}
          >
            Clear
          </button>
        )}
      </div>
    </Field>
  );
}

/* Icon picker grid */
function IconPicker({ value, onChange }) {
  return (
    <Field label="Icon">
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4,
        padding: '8px 0',
      }}>
        {/* "No icon" option */}
        <button
          title="No icon"
          onClick={() => onChange('')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 4, cursor: 'pointer',
            border: !value ? '2px solid var(--accent)' : '1px solid var(--border)',
            background: !value ? 'var(--accent-dim)' : 'transparent',
            fontSize: 10, color: 'var(--muted)',
          }}
        >—</button>
        {NODE_ICON_NAMES.map(name => {
          const Ic = NODE_ICONS[name];
          const selected = value === name;
          return (
            <button
              key={name}
              title={name}
              onClick={() => onChange(name)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 4, cursor: 'pointer',
                border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: selected ? 'var(--accent-dim)' : 'transparent',
              }}
            >
              <Ic size={14} strokeWidth={1.8} color={selected ? 'var(--accent)' : 'var(--muted)'} />
            </button>
          );
        })}
      </div>
      {value && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: -4 }}>{value}</div>
      )}
    </Field>
  );
}

/* Section divider inside a modal */
function ModalSection({ label, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
      {action}
    </div>
  );
}

/* ── Reusable attribute form fields ─────────────────────────────── */
function AttrFields({ form, setForm, autoFocusName = true }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Name (internal key) *">
          <input className="field-input" autoFocus={autoFocusName} value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. reviewNote" />
        </Field>
        <Field label="Label (display) *">
          <input className="field-input" value={form.label || ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Review Note" />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Data Type">
          <select className="field-input" value={form.dataType || 'STRING'} onChange={e => setForm(f => ({ ...f, dataType: e.target.value }))}>
            {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Widget">
          <select className="field-input" value={form.widgetType || 'TEXT'} onChange={e => setForm(f => ({ ...f, widgetType: e.target.value }))}>
            {WIDGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
        <Field label="Section">
          <input className="field-input" value={form.displaySection || ''} onChange={e => setForm(f => ({ ...f, displaySection: e.target.value }))} placeholder="e.g. Details" />
        </Field>
        <Field label="Order">
          <input className="field-input" type="number" min="0" value={form.displayOrder ?? ''} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} placeholder="0" />
        </Field>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={!!form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} />
        Required field
      </label>
    </>
  );
}

/* ── Inline link-type attribute table (used inside Edit Link modal) ─ */
function LinkAttrTable({ userId, linkTypeId, canWrite, toast }) {
  const [attrs,       setAttrs]       = useState(null);
  const [addingForm,  setAddingForm]  = useState(null);
  const [editModal,   setEditModal]   = useState(null); // { attr }
  const [editForm,    setEditForm]    = useState({});
  const [saving,      setSaving]      = useState(false);

  const load = useCallback(() =>
    api.getLinkTypeAttributes(userId, linkTypeId)
       .then(d => setAttrs(Array.isArray(d) ? d : []))
       .catch(() => setAttrs([])),
  [userId, linkTypeId]);

  useEffect(() => { load(); }, [load]);

  function openEdit(a) {
    setEditForm({
      label:          a.label          || a.LABEL          || '',
      dataType:       a.data_type      || a.DATA_TYPE      || 'STRING',
      widgetType:     a.widget_type    || a.WIDGET_TYPE    || 'TEXT',
      required:       !!(a.required    || a.REQUIRED),
      displaySection: a.display_section || a.DISPLAY_SECTION || '',
      displayOrder:   a.display_order  ?? a.DISPLAY_ORDER  ?? '',
    });
    setEditModal({ attr: a });
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await api.updateLinkTypeAttribute(userId, linkTypeId, editModal.attr.id || editModal.attr.ID, {
        label:          editForm.label,
        dataType:       editForm.dataType,
        widgetType:     editForm.widgetType,
        required:       !!editForm.required,
        displaySection: editForm.displaySection || null,
        displayOrder:   editForm.displayOrder !== '' ? Number(editForm.displayOrder) : 0,
      });
      await load();
      setEditModal(null);
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function saveAdd() {
    if (!addingForm?.name?.trim() || !addingForm?.label?.trim()) return;
    setSaving(true);
    try {
      await api.createLinkTypeAttribute(userId, linkTypeId, {
        name:           addingForm.name.trim(),
        label:          addingForm.label.trim(),
        dataType:       addingForm.dataType || 'STRING',
        widgetType:     addingForm.widgetType || 'TEXT',
        required:       !!addingForm.required,
        displaySection: addingForm.displaySection || null,
        displayOrder:   addingForm.displayOrder !== '' ? Number(addingForm.displayOrder) : 0,
      });
      await load();
      setAddingForm(null);
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function del(a) {
    const name = a.label || a.LABEL || a.name || a.NAME;
    if (!window.confirm(`Delete attribute "${name}"?`)) return;
    try {
      await api.deleteLinkTypeAttribute(userId, linkTypeId, a.id || a.ID);
      await load();
    } catch (e) { toast(e, 'error'); }
  }

  if (attrs === null) return <div style={{ fontSize: 12, color: 'var(--muted)', padding: '4px 0' }}>Loading…</div>;

  return (
    <>
      {editModal && (
        <MetaModal
          title="Edit Attribute"
          onClose={() => setEditModal(null)}
          onSave={saveEdit}
          saving={saving}
          saveLabel="Update"
        >
          <Field label="Label (display) *">
            <input className="field-input" autoFocus value={editForm.label || ''} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Data Type">
              <select className="field-input" value={editForm.dataType || 'STRING'} onChange={e => setEditForm(f => ({ ...f, dataType: e.target.value }))}>
                {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Widget">
              <select className="field-input" value={editForm.widgetType || 'TEXT'} onChange={e => setEditForm(f => ({ ...f, widgetType: e.target.value }))}>
                {WIDGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
            <Field label="Section">
              <input className="field-input" value={editForm.displaySection || ''} onChange={e => setEditForm(f => ({ ...f, displaySection: e.target.value }))} />
            </Field>
            <Field label="Order">
              <input className="field-input" type="number" min="0" value={editForm.displayOrder ?? ''} onChange={e => setEditForm(f => ({ ...f, displayOrder: e.target.value }))} />
            </Field>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={!!editForm.required} onChange={e => setEditForm(f => ({ ...f, required: e.target.checked }))} />
            Required field
          </label>
        </MetaModal>
      )}

      {attrs.length > 0 && (
        <table className="settings-table" style={{ marginBottom: 8 }}>
          <thead>
            <tr><th>Name</th><th>Label</th><th>Type</th><th>Req</th><th></th></tr>
          </thead>
          <tbody>
            {[...attrs].sort((a, b) => (a.display_order || a.DISPLAY_ORDER || 0) - (b.display_order || b.DISPLAY_ORDER || 0)).map(a => {
              const aid   = a.id    || a.ID;
              const aname = a.name  || a.NAME;
              const albl  = a.label || a.LABEL || aname;
              const atype = a.data_type || a.DATA_TYPE || 'STRING';
              const areq  = !!(a.required || a.REQUIRED);
              return (
                <tr key={aid}>
                  <td className="settings-td-mono">{aname}</td>
                  <td>{albl}</td>
                  <td><span className="settings-badge">{atype}</span></td>
                  <td style={{ color: areq ? 'var(--success)' : 'var(--muted)' }}>{areq ? '✓' : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {canWrite && (
                        <button className="panel-icon-btn" title="Edit" onClick={() => openEdit(a)}>
                          <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
                        </button>
                      )}
                      {canWrite && (
                        <button className="panel-icon-btn" title="Delete" onClick={() => del(a)}>
                          <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {attrs.length === 0 && !addingForm && (
        <div className="settings-empty-row">No attributes</div>
      )}

      {addingForm ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface2, rgba(255,255,255,.03))', border: '1px solid var(--border)', borderRadius: 6, padding: 12, marginTop: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input className="field-input" autoFocus placeholder="Name (key) *" value={addingForm.name || ''} onChange={e => setAddingForm(f => ({ ...f, name: e.target.value }))} />
            <input className="field-input" placeholder="Label (display) *" value={addingForm.label || ''} onChange={e => setAddingForm(f => ({ ...f, label: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 8 }}>
            <select className="field-input" value={addingForm.dataType || 'STRING'} onChange={e => setAddingForm(f => ({ ...f, dataType: e.target.value }))}>
              {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="field-input" value={addingForm.widgetType || 'TEXT'} onChange={e => setAddingForm(f => ({ ...f, widgetType: e.target.value }))}>
              {WIDGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="field-input" type="number" min="0" placeholder="Order" value={addingForm.displayOrder ?? ''} onChange={e => setAddingForm(f => ({ ...f, displayOrder: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <input type="checkbox" checked={!!addingForm.required} onChange={e => setAddingForm(f => ({ ...f, required: e.target.checked }))} />
              Required
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn" onClick={() => setAddingForm(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveAdd} disabled={saving || !addingForm.name?.trim() || !addingForm.label?.trim()}>
                {saving ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      ) : canWrite ? (
        <button
          className="btn btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 4 }}
          onClick={() => setAddingForm({ dataType: 'STRING', widgetType: 'TEXT', required: false })}
        >
          <PlusIcon size={11} strokeWidth={2.5} />
          Add attribute
        </button>
      ) : null}
    </>
  );
}

/* ── Link type cascade rules (used inside Edit Link modal) ──────── */
function LinkCascadeTable({ userId, linkTypeId, sourceLifecycleId, targetLifecycleId, canWrite, toast }) {
  const [rules,            setRules]            = useState(null);
  const [parentTransitions, setParentTransitions] = useState([]);
  const [childStates,      setChildStates]      = useState([]);
  const [childTransitions, setChildTransitions] = useState([]);
  const [addForm,          setAddForm]          = useState(null); // { parentTransitionId, childFromStateId, childTransitionId }
  const [saving,           setSaving]           = useState(false);

  const load = useCallback(() =>
    api.getLinkTypeCascades(userId, linkTypeId)
       .then(d => setRules(Array.isArray(d) ? d : []))
       .catch(() => setRules([])),
  [userId, linkTypeId]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    const fetches = [];
    if (sourceLifecycleId && parentTransitions.length === 0)
      fetches.push(api.getLifecycleTransitions(userId, sourceLifecycleId).then(d => setParentTransitions(Array.isArray(d) ? d : [])).catch(() => {}));
    if (targetLifecycleId && childStates.length === 0)
      fetches.push(api.getLifecycleStates(userId, targetLifecycleId).then(d => setChildStates(Array.isArray(d) ? d : [])).catch(() => {}));
    if (targetLifecycleId && childTransitions.length === 0)
      fetches.push(api.getLifecycleTransitions(userId, targetLifecycleId).then(d => setChildTransitions(Array.isArray(d) ? d : [])).catch(() => {}));
    Promise.all(fetches).then(() => setAddForm({ parentTransitionId: '', childFromStateId: '', childTransitionId: '' }));
  }

  async function saveAdd() {
    if (!addForm?.parentTransitionId || !addForm?.childFromStateId || !addForm?.childTransitionId) return;
    setSaving(true);
    try {
      await api.createLinkTypeCascade(userId, linkTypeId, addForm.parentTransitionId, addForm.childFromStateId, addForm.childTransitionId);
      await load();
      setAddForm(null);
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function del(rule) {
    const parentTx   = rule.parent_transition_name || rule.PARENT_TRANSITION_NAME || rule.parent_transition_id;
    const childFrom  = rule.child_from_state_name  || rule.CHILD_FROM_STATE_NAME  || rule.child_from_state_id;
    const childTx    = rule.child_transition_name  || rule.CHILD_TRANSITION_NAME  || rule.child_transition_id;
    if (!window.confirm(`Delete cascade rule "${parentTx} → [${childFrom}] → ${childTx}"?`)) return;
    try {
      await api.deleteLinkTypeCascade(userId, linkTypeId, rule.id || rule.ID);
      await load();
    } catch (e) { toast(e, 'error'); }
  }

  const dot = (color) => (
    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color || '#6b7280', flexShrink: 0 }} />
  );

  if (rules === null) return <div style={{ fontSize: 12, color: 'var(--muted)', padding: '4px 0' }}>Loading…</div>;

  if (!sourceLifecycleId || !targetLifecycleId) return (
    <div className="settings-empty-row">Cascade rules require both source and target node types to have a lifecycle.</div>
  );

  return (
    <>
      {rules.length > 0 && (
        <table className="settings-table" style={{ marginBottom: 8 }}>
          <thead>
            <tr><th>Parent transition</th><th></th><th>Child state</th><th></th><th>Child transition</th><th></th></tr>
          </thead>
          <tbody>
            {rules.map(r => {
              const childFromColor = r.child_from_state_color || r.CHILD_FROM_STATE_COLOR;
              const parentTxName  = r.parent_transition_name || r.PARENT_TRANSITION_NAME || r.parent_transition_id;
              const childFromName = r.child_from_state_name  || r.CHILD_FROM_STATE_NAME  || r.child_from_state_id;
              const childTxName   = r.child_transition_name  || r.CHILD_TRANSITION_NAME  || r.child_transition_id;
              return (
                <tr key={r.id || r.ID}>
                  <td style={{ fontSize: 12 }}>{parentTxName}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>→</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {dot(childFromColor)}
                      <span style={{ color: childFromColor || 'var(--text)', fontSize: 12 }}>{childFromName}</span>
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>→</td>
                  <td style={{ fontSize: 12 }}>{childTxName}</td>
                  <td>
                    {canWrite && (
                      <button className="panel-icon-btn" title="Delete" onClick={() => del(r)}>
                        <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {rules.length === 0 && !addForm && (
        <div className="settings-empty-row">No cascade rules — child nodes will not be automatically transitioned.</div>
      )}

      {addForm ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface2, rgba(255,255,255,.03))', border: '1px solid var(--border)', borderRadius: 6, padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 8, alignItems: 'center' }}>
            <select className="field-input" value={addForm.parentTransitionId} onChange={e => setAddForm(f => ({ ...f, parentTransitionId: e.target.value }))}>
              <option value="">Parent transition…</option>
              {parentTransitions.map(t => { const tid = t.id || t.ID; return <option key={tid} value={tid}>{t.name || t.NAME || tid}</option>; })}
            </select>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>→</span>
            <select className="field-input" value={addForm.childFromStateId} onChange={e => setAddForm(f => ({ ...f, childFromStateId: e.target.value }))}>
              <option value="">Child state…</option>
              {childStates.map(s => { const sid = s.id || s.ID; return <option key={sid} value={sid}>{s.name || s.NAME || sid}</option>; })}
            </select>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>→</span>
            <select className="field-input" value={addForm.childTransitionId} onChange={e => setAddForm(f => ({ ...f, childTransitionId: e.target.value }))}>
              <option value="">Child transition…</option>
              {childTransitions.map(t => { const tid = t.id || t.ID; return <option key={tid} value={tid}>{t.name || t.NAME || tid}</option>; })}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            <button className="btn" onClick={() => setAddForm(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveAdd} disabled={saving || !addForm.parentTransitionId || !addForm.childFromStateId || !addForm.childTransitionId}>
              {saving ? 'Adding…' : 'Add Rule'}
            </button>
          </div>
        </div>
      ) : canWrite ? (
        <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 4 }} onClick={openAdd}>
          <PlusIcon size={11} strokeWidth={2.5} />
          Add rule
        </button>
      ) : null}
    </>
  );
}

/* ── Node Types section ──────────────────────────────────────────── */
function NodeTypesSection({ userId, canWrite, toast }) {
  const [types,      setTypes]      = useState([]);
  const [expanded,   setExpanded]   = useState(null);
  const [attrs,      setAttrs]      = useState({});
  const [links,      setLinks]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [lifecycles, setLifecycles] = useState([]);
  const [modal,      setModal]      = useState(null); // { type, ctx }
  const [form,       setForm]       = useState({});
  const [saving,     setSaving]     = useState(false);

  function loadTypes() {
    return api.getNodeTypes(userId).then(d => setTypes(Array.isArray(d) ? d : []));
  }

  useEffect(() => {
    loadTypes().finally(() => setLoading(false));
    api.getLifecycles(userId).then(d => setLifecycles(Array.isArray(d) ? d : []));
  }, [userId]);

  const typeNameMap = useMemo(() => {
    const m = {};
    types.forEach(nt => { m[nt.id || nt.ID] = nt.name || nt.NAME; });
    return m;
  }, [types]);

  async function expand(nt) {
    const id = nt.id || nt.ID;
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    const fetches = [];
    if (!attrs[id]) {
      fetches.push(
        api.getNodeTypeAttributes(userId, id)
          .then(a => setAttrs(s => ({ ...s, [id]: Array.isArray(a) ? a : [] })))
          .catch(() => setAttrs(s => ({ ...s, [id]: [] })))
      );
    }
    if (!links[id]) {
      fetches.push(
        api.getNodeTypeLinkTypes(userId, id)
          .then(l => setLinks(s => ({ ...s, [id]: Array.isArray(l) ? l : [] })))
          .catch(() => setLinks(s => ({ ...s, [id]: [] })))
      );
    }
    await Promise.all(fetches);
  }

  function openModal(type, ctx = {}, defaults = {}) {
    setForm(defaults);
    setModal({ type, ctx });
  }
  function closeModal() { setModal(null); setForm({}); }

  async function handleSave() {
    setSaving(true);
    try {
      const { type, ctx } = modal;
      if (type === 'create-nodetype') {
        await api.createNodeType(userId, {
          name:            form.name?.trim(),
          description:     form.description?.trim() || null,
          lifecycleId:     form.lifecycleId || null,
          numberingScheme: form.numberingScheme || 'ALPHA_NUMERIC',
          versionPolicy:   form.versionPolicy   || 'ITERATE',
          color:           form.color  || null,
          icon:            form.icon   || null,
        });
        await loadTypes();

      } else if (type === 'edit-identity') {
        await api.updateNodeTypeIdentity(userId, ctx.nodeTypeId, {
          logicalIdLabel:   form.logicalIdLabel || 'Identifier',
          logicalIdPattern: form.logicalIdPattern?.trim() || null,
        });
        await loadTypes();
        setExpanded(null);

      } else if (type === 'edit-appearance') {
        await api.updateNodeTypeAppearance(userId, ctx.nodeTypeId, form.color || null, form.icon || null);
        await loadTypes();
        setExpanded(null);

      } else if (type === 'edit-lifecycle') {
        await api.updateNodeTypeLifecycle(userId, ctx.nodeTypeId, form.lifecycleId || null);
        await loadTypes();
        setExpanded(null);

      } else if (type === 'edit-versioning') {
        await Promise.all([
          api.updateNodeTypeNumberingScheme(userId, ctx.nodeTypeId, form.numberingScheme || 'ALPHA_NUMERIC'),
          api.updateNodeTypeVersionPolicy(userId, ctx.nodeTypeId, form.versionPolicy || 'ITERATE'),
        ]);
        await loadTypes();
        setExpanded(null);

      } else if (type === 'create-attr') {
        await api.createAttribute(userId, ctx.nodeTypeId, {
          name:           form.name?.trim(),
          label:          form.label?.trim(),
          dataType:       form.dataType || 'STRING',
          widgetType:     form.widgetType || 'TEXT',
          required:       !!form.required,
          displaySection: form.displaySection?.trim() || null,
          displayOrder:   form.displayOrder !== '' ? Number(form.displayOrder) : 0,
        });
        const updated = await api.getNodeTypeAttributes(userId, ctx.nodeTypeId);
        setAttrs(s => ({ ...s, [ctx.nodeTypeId]: Array.isArray(updated) ? updated : [] }));

      } else if (type === 'edit-attr') {
        await api.updateAttribute(userId, ctx.nodeTypeId, ctx.attrId, {
          label:          form.label?.trim(),
          dataType:       form.dataType || 'STRING',
          widgetType:     form.widgetType || 'TEXT',
          required:       !!form.required,
          displaySection: form.displaySection?.trim() || null,
          displayOrder:   form.displayOrder !== '' ? Number(form.displayOrder) : 0,
        });
        const updated = await api.getNodeTypeAttributes(userId, ctx.nodeTypeId);
        setAttrs(s => ({ ...s, [ctx.nodeTypeId]: Array.isArray(updated) ? updated : [] }));

      } else if (type === 'create-link') {
        await api.createLinkType(userId, {
          name:             form.name?.trim(),
          sourceNodeTypeId: ctx.nodeTypeId,
          targetNodeTypeId: form.targetNodeTypeId,
          linkPolicy:       form.linkPolicy || 'VERSION_TO_MASTER',
          minCardinality:   Number(form.minCardinality) || 0,
          maxCardinality:   form.maxCardinality !== '' ? Number(form.maxCardinality) : null,
          color:            form.color || null,
        });
        const updated = await api.getNodeTypeLinkTypes(userId, ctx.nodeTypeId);
        setLinks(s => ({ ...s, [ctx.nodeTypeId]: Array.isArray(updated) ? updated : [] }));

      } else if (type === 'edit-link') {
        await api.updateLinkType(userId, ctx.linkTypeId, {
          name:           form.name?.trim(),
          description:    form.description?.trim() || null,
          linkPolicy:     form.linkPolicy || 'VERSION_TO_MASTER',
          minCardinality: Number(form.minCardinality) || 0,
          maxCardinality: form.maxCardinality !== '' && form.maxCardinality != null ? Number(form.maxCardinality) : null,
          color:          form.color || null,
        });
        const updated = await api.getNodeTypeLinkTypes(userId, ctx.nodeTypeId);
        setLinks(s => ({ ...s, [ctx.nodeTypeId]: Array.isArray(updated) ? updated : [] }));
      }

      closeModal();
    } catch (e) {
      toast(e, 'error');
    } finally { setSaving(false); }
  }

  async function deleteNodeType(e, nt) {
    e.stopPropagation();
    if (!window.confirm(`Delete node type "${nt.name || nt.NAME}"?\n\nThis also deletes all its attributes and link types. Cannot be undone.`)) return;
    try {
      await api.deleteNodeType(userId, nt.id || nt.ID);
      await loadTypes();
      if (expanded === (nt.id || nt.ID)) setExpanded(null);
    } catch (e) { toast(e, 'error'); }
  }

  async function deleteAttr(e, nodeTypeId, a) {
    e.stopPropagation();
    if (!window.confirm(`Delete attribute "${a.label || a.LABEL || a.name || a.NAME}"?`)) return;
    try {
      await api.deleteAttribute(userId, nodeTypeId, a.id || a.ID);
      const updated = await api.getNodeTypeAttributes(userId, nodeTypeId);
      setAttrs(s => ({ ...s, [nodeTypeId]: Array.isArray(updated) ? updated : [] }));
    } catch (e) { toast(e, 'error'); }
  }

  async function deleteLt(e, nodeTypeId, lt) {
    e.stopPropagation();
    if (!window.confirm(`Delete link type "${lt.name || lt.NAME}"?`)) return;
    try {
      await api.deleteLinkType(userId, lt.id || lt.ID);
      const updated = await api.getNodeTypeLinkTypes(userId, nodeTypeId);
      setLinks(s => ({ ...s, [nodeTypeId]: Array.isArray(updated) ? updated : [] }));
    } catch (e) { toast(e, 'error'); }
  }

  const saveDisabled = () => {
    if (!modal || saving) return true;
    const { type } = modal;
    if (type === 'create-nodetype') return !form.name?.trim();
    if (type === 'create-attr')     return !form.name?.trim() || !form.label?.trim();
    if (type === 'edit-attr')       return !form.label?.trim();
    if (type === 'create-link')     return !form.name?.trim() || !form.targetNodeTypeId;
    if (type === 'edit-link')       return !form.name?.trim();
    return false;
  };

  if (loading) return <div className="settings-loading">Loading…</div>;

  return (
    <div className="settings-list">
      {/* ── Modal ── */}
      {modal && (
        <MetaModal
          title={
            modal.type === 'create-nodetype' ? 'New Node Type' :
            modal.type === 'edit-identity'   ? 'Edit Identifier' :
            modal.type === 'create-attr'     ? 'Add Attribute' :
            modal.type === 'edit-attr'       ? 'Edit Attribute' :
            modal.type === 'create-link'     ? 'Add Link Type' :
            modal.type === 'edit-link'       ? `Edit Link Type — ${modal.ctx.linkName}` : ''
          }
          width={modal.type === 'edit-link' ? 620 : 480}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
          saveLabel={['edit-identity','edit-attr','edit-link'].includes(modal.type) ? 'Update' : 'Create'}
        >
          {/* ── New node type ── */}
          {modal.type === 'create-nodetype' && <>
            <Field label="Name *">
              <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Assembly" />
            </Field>
            <Field label="Description">
              <input className="field-input" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </Field>
            <Field label="Lifecycle">
              <select className="field-input" value={form.lifecycleId || ''} onChange={e => setForm(f => ({ ...f, lifecycleId: e.target.value }))}>
                <option value="">None</option>
                {lifecycles.map(lc => {
                  const lid = lc.id || lc.ID;
                  return <option key={lid} value={lid}>{lc.name || lc.NAME || lid}</option>;
                })}
              </select>
            </Field>
            <Field label="Numbering Scheme">
              <select className="field-input" value={form.numberingScheme || 'ALPHA_NUMERIC'} onChange={e => setForm(f => ({ ...f, numberingScheme: e.target.value }))}>
                {NUMBERING_SCHEMES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Version Policy" tooltip="Controls how the version number advances on each checkout">
              <select className="field-input" value={form.versionPolicy || 'ITERATE'} onChange={e => setForm(f => ({ ...f, versionPolicy: e.target.value }))}>
                {VERSION_POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </>}

          {/* ── Edit identifier ── */}
          {modal.type === 'edit-identity' && <>
            <Field label="Label">
              <input className="field-input" autoFocus value={form.logicalIdLabel || ''} onChange={e => setForm(f => ({ ...f, logicalIdLabel: e.target.value }))} placeholder="Identifier" />
            </Field>
            <Field label="Validation Pattern (regex)">
              <input className="field-input" value={form.logicalIdPattern || ''} onChange={e => setForm(f => ({ ...f, logicalIdPattern: e.target.value }))} placeholder="e.g. ^[A-Z]{2}-\d{4}$" />
            </Field>
          </>}

          {/* ── Edit lifecycle ── */}
          {modal.type === 'edit-lifecycle' && <>
            <Field label="Lifecycle">
              <select className="field-input" autoFocus value={form.lifecycleId || ''} onChange={e => setForm(f => ({ ...f, lifecycleId: e.target.value }))}>
                <option value="">None</option>
                {lifecycles.map(lc => {
                  const lid = lc.id || lc.ID;
                  return <option key={lid} value={lid}>{lc.name || lc.NAME || lid}</option>;
                })}
              </select>
            </Field>
          </>}

          {/* ── Edit versioning ── */}
          {modal.type === 'edit-versioning' && <>
            <Field label="Numbering Scheme">
              <select className="field-input" autoFocus value={form.numberingScheme || 'ALPHA_NUMERIC'} onChange={e => setForm(f => ({ ...f, numberingScheme: e.target.value }))}>
                {NUMBERING_SCHEMES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Version Policy">
              <select className="field-input" value={form.versionPolicy || 'ITERATE'} onChange={e => setForm(f => ({ ...f, versionPolicy: e.target.value }))}>
                {VERSION_POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: -4 }}>
              {form.versionPolicy === 'NONE'    && 'Checkout does not change the visible version number (traceability only).'}
              {form.versionPolicy === 'ITERATE' && 'Checkout increments the iteration: A.1 → A.2.'}
              {form.versionPolicy === 'RELEASE' && 'Checkout starts a new revision: A.3 → B.1.'}
            </div>
          </>}

          {/* ── Edit appearance (node type color + icon) ── */}
          {modal.type === 'edit-appearance' && <>
            <ColorField
              label="Color"
              value={form.color || ''}
              onChange={v => setForm(f => ({ ...f, color: v }))}
            />
            <IconPicker
              value={form.icon || ''}
              onChange={v => setForm(f => ({ ...f, icon: v }))}
            />
          </>}

          {/* ── Create attribute ── */}
          {modal.type === 'create-attr' && (
            <AttrFields form={form} setForm={setForm} />
          )}

          {/* ── Edit attribute ── */}
          {modal.type === 'edit-attr' && <>
            <Field label="Label (display) *">
              <input className="field-input" autoFocus value={form.label || ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Data Type">
                <select className="field-input" value={form.dataType || 'STRING'} onChange={e => setForm(f => ({ ...f, dataType: e.target.value }))}>
                  {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Widget">
                <select className="field-input" value={form.widgetType || 'TEXT'} onChange={e => setForm(f => ({ ...f, widgetType: e.target.value }))}>
                  {WIDGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
              <Field label="Section">
                <input className="field-input" value={form.displaySection || ''} onChange={e => setForm(f => ({ ...f, displaySection: e.target.value }))} />
              </Field>
              <Field label="Order">
                <input className="field-input" type="number" min="0" value={form.displayOrder ?? ''} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} />
              </Field>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={!!form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} />
              Required field
            </label>
          </>}

          {/* ── Create link type ── */}
          {modal.type === 'create-link' && <>
            <Field label="Link Name *">
              <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. composed_of" />
            </Field>
            <Field label="Target Node Type *">
              <select className="field-input" value={form.targetNodeTypeId || ''} onChange={e => setForm(f => ({ ...f, targetNodeTypeId: e.target.value }))}>
                <option value="">Select…</option>
                {types.map(t => { const tid = t.id || t.ID; return <option key={tid} value={tid}>{t.name || t.NAME || tid}</option>; })}
              </select>
            </Field>
            <Field label="Link Policy">
              <select className="field-input" value={form.linkPolicy || 'VERSION_TO_MASTER'} onChange={e => setForm(f => ({ ...f, linkPolicy: e.target.value }))}>
                {LINK_POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Min Cardinality">
                <input className="field-input" type="number" min="0" value={form.minCardinality ?? '0'} onChange={e => setForm(f => ({ ...f, minCardinality: e.target.value }))} />
              </Field>
              <Field label="Max (blank = unlimited)">
                <input className="field-input" type="number" min="0" value={form.maxCardinality ?? ''} onChange={e => setForm(f => ({ ...f, maxCardinality: e.target.value }))} placeholder="∞" />
              </Field>
            </div>
            <ColorField
              label="Color"
              value={form.color || ''}
              onChange={v => setForm(f => ({ ...f, color: v }))}
            />
          </>}

          {/* ── Edit link type ── */}
          {modal.type === 'edit-link' && <>
            <Field label="Name *">
              <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Description">
              <input className="field-input" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </Field>
            <Field label="Link Policy">
              <select className="field-input" value={form.linkPolicy || 'VERSION_TO_MASTER'} onChange={e => setForm(f => ({ ...f, linkPolicy: e.target.value }))}>
                {LINK_POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Min Cardinality">
                <input className="field-input" type="number" min="0" value={form.minCardinality ?? '0'} onChange={e => setForm(f => ({ ...f, minCardinality: e.target.value }))} />
              </Field>
              <Field label="Max (blank = unlimited)">
                <input className="field-input" type="number" min="0" value={form.maxCardinality ?? ''} onChange={e => setForm(f => ({ ...f, maxCardinality: e.target.value }))} placeholder="∞" />
              </Field>
            </div>
            <ColorField
              label="Color"
              value={form.color || ''}
              onChange={v => setForm(f => ({ ...f, color: v }))}
            />

            <ModalSection label="Attributes" />
            <LinkAttrTable userId={userId} linkTypeId={modal.ctx.linkTypeId} canWrite={canWrite} toast={toast} />

            <ModalSection label="Cascade Rules" />
            {(() => {
              const srcNt = types.find(t => (t.id || t.ID) === modal.ctx.nodeTypeId);
              const tgtNt = types.find(t => (t.id || t.ID) === modal.ctx.targetNodeTypeId);
              const srcLcId = srcNt?.lifecycle_id || srcNt?.LIFECYCLE_ID;
              const tgtLcId = tgtNt?.lifecycle_id || tgtNt?.LIFECYCLE_ID;
              return (
                <LinkCascadeTable
                  userId={userId}
                  linkTypeId={modal.ctx.linkTypeId}
                  sourceLifecycleId={srcLcId}
                  targetLifecycleId={tgtLcId}
                  canWrite={canWrite}
                  toast={toast}
                />
              );
            })()}
          </>}
        </MetaModal>
      )}

      {/* ── New node type button ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        {canWrite && (
          <button
            className="btn btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={() => openModal('create-nodetype', {}, { lifecycleId: lifecycles[0] ? (lifecycles[0].id || lifecycles[0].ID) : '', numberingScheme: 'ALPHA_NUMERIC', versionPolicy: 'ITERATE' })}
          >
            <PlusIcon size={11} strokeWidth={2.5} />
            New node type
          </button>
        )}
      </div>

      {types.map(nt => {
        const id         = nt.id   || nt.ID;
        const name       = nt.name || nt.NAME || id;
        const isExp      = expanded === id;
        const ntAttrs    = attrs[id] || [];
        const ntLinks    = links[id] || [];
        const lidLabel    = nt.logical_id_label   || nt.LOGICAL_ID_LABEL   || 'Identifier';
        const lidPattern  = nt.logical_id_pattern || nt.LOGICAL_ID_PATTERN || '';
        const numScheme   = nt.numbering_scheme   || nt.NUMBERING_SCHEME   || 'ALPHA_NUMERIC';
        const verPolicy   = nt.version_policy     || nt.VERSION_POLICY     || 'ITERATE';
        const lcId        = nt.lifecycle_id       || nt.LIFECYCLE_ID       || null;
        const lcName      = lifecycles.find(lc => (lc.id || lc.ID) === lcId)?.name || lcId || '—';
        const ntColor     = nt.color || nt.COLOR || null;
        const ntIcon      = nt.icon  || nt.ICON  || null;
        const NtIcon      = ntIcon ? NODE_ICONS[ntIcon] : null;
        return (
          <div key={id} className="settings-card">
            <div className="settings-card-hd" onClick={() => expand(nt)} style={{ display: 'flex', alignItems: 'center' }}>
              <span className="settings-card-chevron">
                {isExp
                  ? <ChevronDownIcon  size={13} strokeWidth={2} color="var(--muted)" />
                  : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />
                }
              </span>
              {NtIcon
                ? <NtIcon size={14} strokeWidth={2} color={ntColor || 'var(--muted)'} style={{ marginRight: 4, flexShrink: 0 }} />
                : ntColor
                  ? <span style={{ width: 10, height: 10, borderRadius: '50%', background: ntColor, flexShrink: 0, marginRight: 4 }} />
                  : null
              }
              <span className="settings-card-name">{name}</span>
              <span className="settings-card-id">{id}</span>
              {canWrite && (
                <button className="panel-icon-btn" title="Delete node type" style={{ marginLeft: 'auto' }} onClick={e => deleteNodeType(e, nt)}>
                  <TrashIcon size={12} strokeWidth={2} color="var(--danger, #f87171)" />
                </button>
              )}
            </div>

            {isExp && (
              <div className="settings-card-body">
                {/* Identifier */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>Identifier</span>
                  {canWrite && (
                    <button className="panel-icon-btn" title="Edit identifier" onClick={() => openModal('edit-identity', { nodeTypeId: id }, { logicalIdLabel: lidLabel, logicalIdPattern: lidPattern })}>
                      <EditIcon size={12} strokeWidth={2} color="var(--accent)" />
                    </button>
                  )}
                </div>
                <table className="settings-table">
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--muted)', width: 110 }}>Label</td>
                      <td className="settings-td-mono">{lidLabel}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--muted)' }}>Pattern</td>
                      <td className="settings-td-mono">{lidPattern || '—'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Lifecycle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>Lifecycle</span>
                  {canWrite && (
                    <button className="panel-icon-btn" title="Change lifecycle" onClick={() => openModal('edit-lifecycle', { nodeTypeId: id }, { lifecycleId: lcId || '' })}>
                      <EditIcon size={12} strokeWidth={2} color="var(--accent)" />
                    </button>
                  )}
                </div>
                <table className="settings-table">
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--muted)', width: 110 }}>Lifecycle</td>
                      <td>{lcId ? <span className="settings-badge">{lcName}</span> : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Versioning */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>Versioning</span>
                  {canWrite && (
                    <button className="panel-icon-btn" title="Edit versioning" onClick={() => openModal('edit-versioning', { nodeTypeId: id }, { numberingScheme: numScheme, versionPolicy: verPolicy })}>
                      <EditIcon size={12} strokeWidth={2} color="var(--accent)" />
                    </button>
                  )}
                </div>
                <table className="settings-table">
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--muted)', width: 110 }}>Numbering</td>
                      <td><span className="settings-badge">{numScheme}</span></td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--muted)' }}>Policy</td>
                      <td><span className="settings-badge">{verPolicy}</span></td>
                    </tr>
                  </tbody>
                </table>

                {/* Appearance */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>Appearance</span>
                  {canWrite && (
                    <button className="panel-icon-btn" title="Edit appearance" onClick={() => openModal('edit-appearance', { nodeTypeId: id }, { color: ntColor || '', icon: ntIcon || '' })}>
                      <EditIcon size={12} strokeWidth={2} color="var(--accent)" />
                    </button>
                  )}
                </div>
                <table className="settings-table">
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--muted)', width: 110 }}>Color</td>
                      <td>
                        {ntColor
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 12, height: 12, borderRadius: 3, background: ntColor, display: 'inline-block' }} />
                              <span className="settings-td-mono" style={{ fontSize: 10 }}>{ntColor}</span>
                            </span>
                          : <span style={{ color: 'var(--muted2)' }}>—</span>
                        }
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--muted)' }}>Icon</td>
                      <td>
                        {NtIcon
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <NtIcon size={13} strokeWidth={2} color={ntColor || 'var(--muted)'} />
                              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{ntIcon}</span>
                            </span>
                          : <span style={{ color: 'var(--muted2)' }}>—</span>
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Attributes */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>Attributes</span>
                  {canWrite && (
                    <button className="panel-icon-btn" title="Add attribute" onClick={() => openModal('create-attr', { nodeTypeId: id }, { dataType: 'STRING', widgetType: 'TEXT', required: false })}>
                      <PlusIcon size={12} strokeWidth={2.5} color="var(--accent)" />
                    </button>
                  )}
                </div>
                {ntAttrs.length === 0 ? (
                  <div className="settings-empty-row">No attributes defined</div>
                ) : (
                  <table className="settings-table">
                    <thead>
                      <tr><th>Name</th><th>Label</th><th>Type</th><th>Req</th><th>Section</th><th></th></tr>
                    </thead>
                    <tbody>
                      {[...ntAttrs]
                        .sort((a, b) => (a.display_order || a.DISPLAY_ORDER || 0) - (b.display_order || b.DISPLAY_ORDER || 0))
                        .map(a => {
                          const aid   = a.id          || a.ID;
                          const aname = a.name        || a.NAME;
                          const albl  = a.label       || a.LABEL       || aname;
                          const atype = a.widget_type || a.WIDGET_TYPE || 'TEXT';
                          const areq  = !!(a.required || a.REQUIRED);
                          const asec  = a.display_section || a.DISPLAY_SECTION || '—';
                          return (
                            <tr key={aid}>
                              <td className="settings-td-mono">{aname}</td>
                              <td>{albl}</td>
                              <td><span className="settings-badge">{atype}</span></td>
                              <td style={{ color: areq ? 'var(--success)' : 'var(--muted)' }}>{areq ? '✓' : '—'}</td>
                              <td style={{ color: 'var(--muted)' }}>{asec}</td>
                              <td>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  {canWrite && (
                                    <button className="panel-icon-btn" title="Edit" onClick={() => openModal('edit-attr', { nodeTypeId: id, attrId: aid }, {
                                      label:          albl,
                                      dataType:       a.data_type      || a.DATA_TYPE      || 'STRING',
                                      widgetType:     a.widget_type    || a.WIDGET_TYPE    || 'TEXT',
                                      required:       areq,
                                      displaySection: a.display_section || a.DISPLAY_SECTION || '',
                                      displayOrder:   a.display_order  ?? a.DISPLAY_ORDER  ?? '',
                                    })}>
                                      <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
                                    </button>
                                  )}
                                  {canWrite && (
                                    <button className="panel-icon-btn" title="Delete" onClick={e => deleteAttr(e, id, a)}>
                                      <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}

                {/* Outgoing Links */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>Outgoing Links</span>
                  {canWrite && (
                    <button className="panel-icon-btn" title="Add link type" onClick={() => openModal('create-link', { nodeTypeId: id }, { linkPolicy: 'VERSION_TO_MASTER', minCardinality: '0', targetNodeTypeId: types[0] ? (types[0].id || types[0].ID) : '' })}>
                      <PlusIcon size={12} strokeWidth={2.5} color="var(--accent)" />
                    </button>
                  )}
                </div>
                {ntLinks.length === 0 ? (
                  <div className="settings-empty-row">No outgoing links defined</div>
                ) : (
                  <table className="settings-table">
                    <thead>
                      <tr><th></th><th>Name</th><th>Target</th><th>Policy</th><th>Cardinality</th><th></th></tr>
                    </thead>
                    <tbody>
                      {ntLinks.map(lt => {
                        const lid   = lt.id   || lt.ID;
                        const lname = lt.name || lt.NAME || lid;
                        const tgtId = lt.target_node_type_id || lt.TARGET_NODE_TYPE_ID;
                        const tgtName = tgtId ? (typeNameMap[tgtId] || tgtId) : 'Any';
                        const policy  = lt.link_policy || lt.LINK_POLICY || '—';
                        const minC    = lt.min_cardinality ?? lt.MIN_CARDINALITY ?? 0;
                        const maxC    = lt.max_cardinality ?? lt.MAX_CARDINALITY;
                        const card    = maxC == null ? `${minC}..*` : `${minC}..${maxC}`;
                        const ltColor = lt.color || lt.COLOR || null;
                        return (
                          <tr key={lid}>
                            <td style={{ width: 18 }}>
                              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: ltColor || 'var(--border)' }} title={ltColor || 'No color'} />
                            </td>
                            <td className="settings-td-mono">{lname}</td>
                            <td>{tgtName}</td>
                            <td><span className="settings-badge">{policy}</span></td>
                            <td style={{ color: 'var(--muted)' }}>{card}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {canWrite && (
                                  <button className="panel-icon-btn" title="Edit link type" onClick={() => openModal('edit-link', {
                                    nodeTypeId:       id,
                                    linkTypeId:       lid,
                                    linkName:         lname,
                                    targetNodeTypeId: tgtId,
                                  }, {
                                    name:           lname,
                                    description:    lt.description || lt.DESCRIPTION || '',
                                    linkPolicy:     policy,
                                    minCardinality: String(minC),
                                    maxCardinality: maxC != null ? String(maxC) : '',
                                    color:          ltColor || '',
                                  })}>
                                    <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
                                  </button>
                                )}
                                {canWrite && (
                                  <button className="panel-icon-btn" title="Delete link type" onClick={e => deleteLt(e, id, lt)}>
                                    <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Lifecycles section ──────────────────────────────────────────── */
const STATE_DEFAULT_COLOR = '#6b7280';
const STATE_PALETTE = [
  '#5b9cf6', '#38bdf8', '#34d399', '#a3e635',
  '#facc15', '#fb923c', '#f87171', '#e879f9',
  '#a78bfa', '#56d18e', '#e8a947', '#6b7280',
];

function stateColor(s) {
  return s?.color || s?.COLOR || STATE_DEFAULT_COLOR;
}

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
        {STATE_PALETTE.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: '100%', aspectRatio: '1', borderRadius: 4, background: c, border: 'none',
              cursor: 'pointer',
              outline: value === c ? '2px solid var(--text)' : '2px solid transparent',
              outlineOffset: 2,
              transition: 'outline .1s',
            }}
            title={c}
          />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Custom</label>
        <input
          type="color"
          value={value || STATE_DEFAULT_COLOR}
          onChange={e => onChange(e.target.value)}
          style={{ width: 36, height: 28, padding: 2, border: '1px solid var(--border2)', borderRadius: 4, background: 'var(--surface)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{value || STATE_DEFAULT_COLOR}</span>
      </div>
    </div>
  );
}

function StateFormFields({ form, setForm }) {
  return (
    <>
      <Field label="State Name *">
        <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. In Review" />
      </Field>
      <Field label="Display Order">
        <input className="field-input" type="number" min="0" value={form.displayOrder ?? ''} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} placeholder="0" style={{ width: 100 }} />
      </Field>
      <Field label="Tags">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['isInitial', 'INIT',   'Initial state — entry point of the lifecycle'],
            ['isFrozen',  'FROZEN', 'Frozen — lock cascades to children via V2M links'],
            ['isReleased','REL',    'Released — triggers a revision bump on the node'],
          ].map(([key, badge, desc]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
              <span className="lc-state-flag" style={{ opacity: form[key] ? 1 : 0.4 }}>{badge}</span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{desc}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="Color">
        <ColorPicker value={form.color || STATE_DEFAULT_COLOR} onChange={c => setForm(f => ({ ...f, color: c }))} />
      </Field>
    </>
  );
}

function TransitionFormFields({ form, setForm, states }) {
  return (
    <>
      <Field label="Transition Name *">
        <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. freeze" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="From State *">
          <select className="field-input" value={form.fromStateId || ''} onChange={e => setForm(f => ({ ...f, fromStateId: e.target.value }))}>
            <option value="">Select…</option>
            {states.map(s => { const sid = s.id || s.ID; return <option key={sid} value={sid}>{s.name || s.NAME || sid}</option>; })}
          </select>
        </Field>
        <Field label="To State *">
          <select className="field-input" value={form.toStateId || ''} onChange={e => setForm(f => ({ ...f, toStateId: e.target.value }))}>
            <option value="">Select…</option>
            {states.map(s => { const sid = s.id || s.ID; return <option key={sid} value={sid}>{s.name || s.NAME || sid}</option>; })}
          </select>
        </Field>
      </div>
      <Field label="Guard Expression">
        <input className="field-input" value={form.guardExpr || ''} onChange={e => setForm(f => ({ ...f, guardExpr: e.target.value }))} placeholder="e.g. all_required_filled" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Action Type">
          <select className="field-input" value={form.actionType || 'NONE'} onChange={e => setForm(f => ({ ...f, actionType: e.target.value }))}>
            {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Version Strategy">
          <select className="field-input" value={form.versionStrategy || 'NONE'} onChange={e => setForm(f => ({ ...f, versionStrategy: e.target.value }))}>
            {VERSION_STRATS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
      </div>
    </>
  );
}

function LifecyclesSection({ userId, canWrite, toast }) {
  const [lcs,      setLcs]      = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [lcData,   setLcData]   = useState({});
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);

  function loadLcs() {
    return api.getLifecycles(userId).then(d => setLcs(Array.isArray(d) ? d : []));
  }

  useEffect(() => { loadLcs().finally(() => setLoading(false)); }, [userId]);

  async function refreshLcData(id) {
    const [states, transitions] = await Promise.all([
      api.getLifecycleStates(userId, id),
      api.getLifecycleTransitions(userId, id),
    ]);
    setLcData(s => ({ ...s, [id]: {
      states:      Array.isArray(states)      ? states      : [],
      transitions: Array.isArray(transitions) ? transitions : [],
    }}));
  }

  async function expand(lc) {
    const id = lc.id || lc.ID;
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!lcData[id]) await refreshLcData(id).catch(e => toast(e, 'error'));
  }

  function openModal(type, ctx = {}, defaults = {}) { setForm(defaults); setModal({ type, ctx }); }
  function closeModal() { setModal(null); setForm({}); }

  async function handleSave() {
    setSaving(true);
    try {
      const { type, ctx } = modal;
      const stateBody = {
        name:         form.name?.trim(),
        isInitial:    !!form.isInitial,
        isFrozen:     !!form.isFrozen,
        isReleased:   !!form.isReleased,
        displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : 0,
        color:        form.color || null,
      };
      const transBody = {
        name:            form.name?.trim(),
        fromStateId:     form.fromStateId,
        toStateId:       form.toStateId,
        guardExpr:       form.guardExpr?.trim() || null,
        actionType:      form.actionType || 'NONE',
        versionStrategy: form.versionStrategy || 'NONE',
      };

      if (type === 'create-lc') {
        await api.createLifecycle(userId, { name: form.name?.trim(), description: form.description?.trim() || null });
        await loadLcs();
      } else if (type === 'create-state') {
        await api.addLifecycleState(userId, ctx.lifecycleId, stateBody);
        await refreshLcData(ctx.lifecycleId);
      } else if (type === 'edit-state') {
        await api.updateLifecycleState(userId, ctx.lifecycleId, ctx.stateId, stateBody);
        await refreshLcData(ctx.lifecycleId);
      } else if (type === 'create-transition') {
        await api.addLifecycleTransition(userId, ctx.lifecycleId, transBody);
        await refreshLcData(ctx.lifecycleId);
      } else if (type === 'edit-transition') {
        await api.updateLifecycleTransition(userId, ctx.lifecycleId, ctx.transId, transBody);
        await refreshLcData(ctx.lifecycleId);
      }
      closeModal();
    } catch (e) {
      toast(e, 'error');
    } finally { setSaving(false); }
  }

  async function deleteLifecycle(e, lc) {
    e.stopPropagation();
    if (!window.confirm(`Delete lifecycle "${lc.name || lc.NAME}"?\n\nThis deletes all states, transitions and attribute state rules. Cannot be undone.`)) return;
    try {
      await api.deleteLifecycle(userId, lc.id || lc.ID);
      await loadLcs();
      if (expanded === (lc.id || lc.ID)) setExpanded(null);
    } catch (e) { toast(e, 'error'); }
  }

  async function deleteState(lcId, s) {
    if (!window.confirm(`Delete state "${s.name || s.NAME}"?\n\nAttribute state rules for this state will also be deleted.`)) return;
    try {
      await api.deleteLifecycleState(userId, lcId, s.id || s.ID);
      await refreshLcData(lcId);
    } catch (e) { toast(e, 'error'); }
  }

  async function deleteTransition(lcId, t) {
    if (!window.confirm(`Delete transition "${t.name || t.NAME}"?`)) return;
    try {
      await api.deleteLifecycleTransition(userId, lcId, t.id || t.ID);
      await refreshLcData(lcId);
    } catch (e) { toast(e, 'error'); }
  }

  const saveDisabled = () => {
    if (!modal || saving) return true;
    const { type } = modal;
    if (type === 'create-lc') return !form.name?.trim();
    if (type === 'create-state' || type === 'edit-state') return !form.name?.trim();
    if (type === 'create-transition' || type === 'edit-transition') return !form.name?.trim() || !form.fromStateId || !form.toStateId;
    return false;
  };

  if (loading) return <div className="settings-loading">Loading…</div>;

  const modalTitle = {
    'create-lc':         'New Lifecycle',
    'create-state':      'Add State',
    'edit-state':        'Edit State',
    'create-transition': 'Add Transition',
    'edit-transition':   'Edit Transition',
  }[modal?.type] || '';

  const isEdit = modal && ['edit-state','edit-transition'].includes(modal.type);

  return (
    <div className="settings-list">
      {modal && (
        <MetaModal
          title={modalTitle}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
          saveLabel={isEdit ? 'Update' : 'Create'}
          width={modal.type?.includes('state') ? 520 : 480}
        >
          {modal.type === 'create-lc' && <>
            <Field label="Name *">
              <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Standard" />
            </Field>
            <Field label="Description">
              <input className="field-input" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </Field>
          </>}

          {(modal.type === 'create-state' || modal.type === 'edit-state') && (
            <StateFormFields form={form} setForm={setForm} />
          )}

          {(modal.type === 'create-transition' || modal.type === 'edit-transition') && (
            <TransitionFormFields form={form} setForm={setForm} states={modal.ctx.states || []} />
          )}
        </MetaModal>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        {canWrite && (
          <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => openModal('create-lc')}>
            <PlusIcon size={11} strokeWidth={2.5} />
            New lifecycle
          </button>
        )}
      </div>

      {lcs.map(lc => {
        const id    = lc.id   || lc.ID;
        const name  = lc.name || lc.NAME || id;
        const isExp = expanded === id;
        const data  = lcData[id];
        const states = data?.states || [];

        return (
          <div key={id} className="settings-card">
            <div className="settings-card-hd" onClick={() => expand(lc)} style={{ display: 'flex', alignItems: 'center' }}>
              <span className="settings-card-chevron">
                {isExp ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" /> : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
              </span>
              <span className="settings-card-name">{name}</span>
              <span className="settings-card-id">{id}</span>
              {canWrite && (
                <button className="panel-icon-btn" title="Delete lifecycle" style={{ marginLeft: 'auto' }} onClick={e => deleteLifecycle(e, lc)}>
                  <TrashIcon size={12} strokeWidth={2} color="var(--danger, #f87171)" />
                </button>
              )}
            </div>

            {isExp && data && (
              <div className="settings-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                {/* ── States ─────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>States</span>
                  {canWrite && (
                    <button className="panel-icon-btn" title="Add state"
                      onClick={() => openModal('create-state', { lifecycleId: id }, { color: STATE_DEFAULT_COLOR, displayOrder: '' })}>
                      <PlusIcon size={12} strokeWidth={2.5} color="var(--accent)" />
                    </button>
                  )}
                </div>

                {states.length === 0 && <div className="settings-empty-row" style={{ marginBottom: 12 }}>No states defined</div>}

                {states.map(s => {
                  const sid   = s.id   || s.ID;
                  const sname = s.name || s.NAME || sid;
                  const color = stateColor(s);
                  const flags = [
                    (s.is_initial  || s.IS_INITIAL)  ? 'INIT'   : null,
                    (s.is_frozen   || s.IS_FROZEN)   ? 'FROZEN' : null,
                    (s.is_released || s.IS_RELEASED) ? 'REL'    : null,
                  ].filter(Boolean);
                  const order = s.display_order ?? s.DISPLAY_ORDER ?? 0;
                  return (
                    <div key={sid} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '6px 8px', borderRadius: 5, marginBottom: 3,
                      background: 'rgba(255,255,255,.02)',
                      border: '1px solid var(--border)',
                    }}>
                      {/* Color swatch */}
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                        background: color, boxShadow: `0 0 0 2px ${color}33`,
                      }} />
                      {/* Name */}
                      <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', flex: 1 }}>{sname}</span>
                      {/* Flags */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        {flags.map(f => (
                          <span key={f} className="lc-state-flag" style={{ background: color + '22', color, borderColor: color + '55' }}>{f}</span>
                        ))}
                      </div>
                      {/* Order badge */}
                      <span style={{ fontSize: 10, color: 'var(--muted)', minWidth: 24, textAlign: 'right' }}>#{order}</span>
                      {/* Actions */}
                      {canWrite && (
                        <button className="panel-icon-btn" title="Edit state" onClick={() => openModal('edit-state', { lifecycleId: id, stateId: sid }, {
                          name:         sname,
                          isInitial:    !!(s.is_initial  || s.IS_INITIAL),
                          isFrozen:     !!(s.is_frozen   || s.IS_FROZEN),
                          isReleased:   !!(s.is_released || s.IS_RELEASED),
                          displayOrder: order,
                          color,
                        })}>
                          <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
                        </button>
                      )}
                      {canWrite && (
                        <button className="panel-icon-btn" title="Delete state" onClick={() => deleteState(id, s)}>
                          <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* ── Transitions ────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 6 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>Transitions</span>
                  {canWrite && (
                    <button className="panel-icon-btn" title="Add transition"
                      onClick={() => openModal('create-transition', { lifecycleId: id, states }, { actionType: 'NONE', versionStrategy: 'NONE' })}>
                      <PlusIcon size={12} strokeWidth={2.5} color="var(--accent)" />
                    </button>
                  )}
                </div>

                {data.transitions.length === 0 && <div className="settings-empty-row">No transitions defined</div>}

                {data.transitions.map(t => {
                  const tid    = t.id   || t.ID;
                  const tname  = t.name || t.NAME || tid;
                  const fromId = t.from_state_id || t.FROM_STATE_ID || '';
                  const toId   = t.to_state_id   || t.TO_STATE_ID   || '';
                  const fromS  = states.find(s => (s.id || s.ID) === fromId);
                  const toS    = states.find(s => (s.id || s.ID) === toId);
                  const fromColor = stateColor(fromS);
                  const toColor   = stateColor(toS);
                  const guard  = t.guard_expr      || t.GUARD_EXPR;
                  const vstrat = t.version_strategy || t.VERSION_STRATEGY;
                  return (
                    <div key={tid} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '6px 8px', borderRadius: 5, marginBottom: 3,
                      background: 'rgba(255,255,255,.02)',
                      border: '1px solid var(--border)',
                    }}>
                      {/* Name */}
                      <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', minWidth: 90 }}>{tname}</span>
                      {/* From → To */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, fontSize: 11 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: fromColor, flexShrink: 0 }} />
                          <span style={{ color: fromColor }}>{fromS?.name || fromS?.NAME || fromId}</span>
                        </span>
                        <span style={{ color: 'var(--muted)' }}>→</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: toColor, flexShrink: 0 }} />
                          <span style={{ color: toColor }}>{toS?.name || toS?.NAME || toId}</span>
                        </span>
                      </div>
                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        {guard && <span className="settings-badge" title="Guard">{guard}</span>}
                        {vstrat && vstrat !== 'NONE' && <span className="settings-badge">{vstrat}</span>}
                      </div>
                      {/* Actions */}
                      {canWrite && (
                        <button className="panel-icon-btn" title="Edit transition" onClick={() => openModal('edit-transition', { lifecycleId: id, transId: tid, states }, {
                          name:            tname,
                          fromStateId:     fromId,
                          toStateId:       toId,
                          guardExpr:       guard || '',
                          actionType:      t.action_type || t.ACTION_TYPE || 'NONE',
                          versionStrategy: vstrat || 'NONE',
                        })}>
                          <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
                        </button>
                      )}
                      {canWrite && (
                        <button className="panel-icon-btn" title="Delete transition" onClick={() => deleteTransition(id, t)}>
                          <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
                        </button>
                      )}
                    </div>
                  );
                })}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Action permissions for one project space ────────────────────── */
function ProjectSpacePermissions({ userId, projectSpaceId, canWrite, toast }) {
  const [roles,    setRoles]    = useState([]);
  const [types,    setTypes]    = useState([]);
  const [selRole,  setSelRole]  = useState(null);   // { id, name }
  const [expanded, setExpanded] = useState(null);   // nodeTypeId
  const [actions,  setActions]  = useState({});     // ntId → action[]
  const [perms,    setPerms]    = useState({});     // ntaId → roleId[]
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRoles(userId).then(d => {
        const list = Array.isArray(d) ? d : [];
        setRoles(list);
        if (list.length > 0) setSelRole(list[0]);
      }),
      api.getNodeTypes(userId).then(d => setTypes(Array.isArray(d) ? d : [])),
    ]).finally(() => setLoading(false));
  }, [userId, projectSpaceId]);

  function selectRole(role) {
    setSelRole(role);
    setExpanded(null);
    setPerms({});
  }

  async function expandNt(nt) {
    const id = nt.id || nt.ID;
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    let list = actions[id];
    if (!list) {
      const raw = await api.getActionsForNodeType(userId, id).catch(() => []);
      list = Array.isArray(raw) ? raw : [];
      setActions(s => ({ ...s, [id]: list }));
    }
    if (selRole) await loadPerms(id, list);
  }

  async function loadPerms(nodeTypeId, actionList) {
    await Promise.all(actionList.map(async nta => {
      const ntaId = nta.nta_id || nta.NTA_ID;
      if (perms[ntaId] !== undefined) return;
      const p = await api.getActionPermissionsForSpace(userId, projectSpaceId, nodeTypeId, ntaId).catch(() => []);
      const allowed = (Array.isArray(p) ? p : []).map(r => r.role_id || r.ROLE_ID);
      setPerms(s => ({ ...s, [ntaId]: allowed }));
    }));
  }

  async function togglePerm(nodeTypeId, nta) {
    if (!selRole) return;
    const ntaId = nta.nta_id || nta.NTA_ID;
    const current = perms[ntaId] || [];
    const isGranted = current.includes(selRole.id);
    try {
      if (isGranted) {
        await api.removeActionPermissionForSpace(userId, projectSpaceId, nodeTypeId, ntaId, selRole.id, null);
        setPerms(s => ({ ...s, [ntaId]: (s[ntaId] || []).filter(r => r !== selRole.id) }));
      } else {
        await api.addActionPermissionForSpace(userId, projectSpaceId, nodeTypeId, ntaId, selRole.id, null);
        setPerms(s => ({ ...s, [ntaId]: [...(s[ntaId] || []), selRole.id] }));
      }
    } catch (err) { toast(err, 'error'); }
  }

  if (loading) return <div style={{ padding: '12px 0', color: 'var(--muted)', fontSize: 12 }}>Loading…</div>;

  return (
    <div style={{ paddingTop: 12 }}>
      {/* Header row: label + role selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="settings-sub-label" style={{ margin: 0 }}>Action Permissions</span>
        {roles.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Role:</span>
            <select
              className="field-input"
              style={{ height: 24, fontSize: 11, padding: '0 6px', minWidth: 110 }}
              value={selRole?.id || ''}
              onChange={e => { const r = roles.find(r => r.id === e.target.value); if (r) selectRole(r); }}
            >
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {roles.length === 0 && (
        <div className="settings-empty-row">No non-admin roles defined. Create roles first.</div>
      )}

      {selRole && (
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>
          Expand a node type to grant or revoke actions for <strong>{selRole.name}</strong>.
          Zero grants = action is open to all roles.
        </div>
      )}

      {selRole && types.map(nt => {
        const id       = nt.id   || nt.ID;
        const name     = nt.name || nt.NAME || id;
        const isExp    = expanded === id;
        const ntActions = actions[id] || [];

        return (
          <div key={id} style={{ marginBottom: 4, border: '1px solid var(--border)', borderRadius: 5, overflow: 'hidden' }}>
            <div
              onClick={() => expandNt(nt)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', cursor: 'pointer',
                       background: isExp ? 'rgba(99,102,241,.06)' : 'transparent' }}
            >
              {isExp
                ? <ChevronDownIcon  size={11} strokeWidth={2} color="var(--muted)" />
                : <ChevronRightIcon size={11} strokeWidth={2} color="var(--muted)" />
              }
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{name}</span>
              <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'monospace' }}>{id}</span>
            </div>

            {isExp && (
              <div style={{ background: 'rgba(0,0,0,.03)', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ntActions.length === 0 ? (
                  <div className="settings-empty-row">No actions registered</div>
                ) : (
                  [...ntActions]
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                    .map(nta => {
                      const ntaId    = nta.nta_id      || nta.NTA_ID;
                      const code     = nta.action_code || nta.ACTION_CODE || ntaId;
                      const dispName = nta.display_name_override || nta.DISPLAY_NAME_OVERRIDE
                                    || nta.display_name          || nta.DISPLAY_NAME || code;
                      const category = nta.display_category || nta.DISPLAY_CATEGORY || '—';
                      const ntaPerms = perms[ntaId];
                      const isPending = ntaPerms === undefined;
                      const isGranted = !isPending && ntaPerms.includes(selRole.id);

                      return (
                        <div key={ntaId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
                          <button
                            className="panel-icon-btn"
                            disabled={isPending || !canWrite}
                            title={!canWrite ? 'Requires MANAGE_ROLES' : isGranted ? `Revoke ${selRole.name}` : `Grant ${selRole.name}`}
                            onClick={() => togglePerm(id, nta)}
                            style={{ flexShrink: 0, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            {isPending
                              ? <span style={{ color: 'var(--muted)', fontSize: 10 }}>…</span>
                              : isGranted
                                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
                                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>
                            }
                          </button>
                          <code style={{ fontSize: 11, color: 'var(--muted)', minWidth: 130 }}>{code}</code>
                          <span style={{ fontSize: 11, color: 'var(--text)', flex: 1 }}>{dispName}</span>
                          <span className="settings-badge">{category}</span>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Project Spaces section ──────────────────────────────────────── */
function ProjectSpacesSection({ userId, canWrite, toast }) {
  const [spaces,   setSpaces]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState({ name: '', description: '' });
  const [saving,   setSaving]   = useState(false);

  function load() {
    return api.listProjectSpaces(userId).then(d => setSpaces(Array.isArray(d) ? d : []));
  }
  useEffect(() => { load().finally(() => setLoading(false)); }, [userId]);

  async function submit() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.createProjectSpace(userId, form.name.trim(), form.description.trim() || null);
      await load();
      setModal(false);
      setForm({ name: '', description: '' });
    } catch (e) {
      toast(e, 'error');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="settings-loading">Loading…</div>;

  return (
    <div className="settings-list">
      {modal && (
        <MetaModal title="New Project Space" onClose={() => { setModal(false); setForm({ name: '', description: '' }); }} onSave={submit} saving={saving} saveLabel="Create">
          <Field label="Name *">
            <input className="field-input" autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Prototype-2026" />
          </Field>
          <Field label="Description">
            <input className="field-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
          </Field>
        </MetaModal>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        {canWrite && (
          <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => { setForm({ name: '', description: '' }); setModal(true); }}>
            <PlusIcon size={11} strokeWidth={2.5} />
            New space
          </button>
        )}
      </div>
      {spaces.map(ps => {
        const id    = ps.id   || ps.ID;
        const name  = ps.name || ps.NAME || id;
        const desc  = ps.description || ps.DESCRIPTION || '';
        const active = ps.active !== false && ps.ACTIVE !== false;
        const isExp = expanded === id;
        return (
          <div key={id} className="settings-card">
            <div className="settings-card-hd" onClick={() => setExpanded(isExp ? null : id)} style={{ display: 'flex', alignItems: 'center' }}>
              <span className="settings-card-chevron">
                {isExp
                  ? <ChevronDownIcon  size={13} strokeWidth={2} color="var(--muted)" />
                  : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />
                }
              </span>
              <HexIcon size={13} color={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth={1.5} />
              <span className="settings-card-name" style={{ marginLeft: 4 }}>{name}</span>
              <span className="settings-card-id">{id}</span>
              {desc && <span style={{ flex: 1, fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 8 }}>{desc}</span>}
              {!active && <span className="settings-badge settings-badge--warn">Inactive</span>}
            </div>
            {isExp && (
              <div className="settings-card-body">
                <ProjectSpacePermissions userId={userId} projectSpaceId={id} canWrite={canWrite} toast={toast} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Roles sub-section ───────────────────────────────────────────── */
function RolesSubSection({ userId, canWrite, toast }) {
  const [roles,    setRoles]    = useState(null);
  const [modal,    setModal]    = useState(null);   // null | 'create' | { role }
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() =>
    api.getRoles(userId).then(d => setRoles(Array.isArray(d) ? d : [])), [userId]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.createRole(userId, form.name.trim(), form.description?.trim() || null);
      } else {
        await api.updateRole(userId, modal.role.id, form.name.trim(), form.description?.trim() || null);
      }
      await load();
      setModal(null);
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function del(role) {
    if (!window.confirm(`Delete role "${role.name}"?\nAll user assignments for this role will also be removed.`)) return;
    setDeleting(role.id);
    try {
      await api.deleteRole(userId, role.id);
      await load();
    } catch (e) { toast(e, 'error'); }
    finally { setDeleting(null); }
  }

  if (!roles) return <div className="settings-loading">Loading…</div>;

  return (
    <div className="settings-list">
      {modal && (
        <MetaModal
          title={modal === 'create' ? 'New Role' : `Edit — ${modal.role.name}`}
          onClose={() => setModal(null)}
          onSave={save}
          saving={saving}
          saveLabel={modal === 'create' ? 'Create' : 'Save'}
        >
          <Field label="Name *">
            <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. APPROVER" />
          </Field>
          <Field label="Description">
            <textarea className="field-input" rows={2} style={{ resize: 'vertical' }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
          </Field>
        </MetaModal>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        {canWrite && (
          <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={() => { setForm({ name: '', description: '' }); setModal('create'); }}>
            <PlusIcon size={11} strokeWidth={2.5} /> New role
          </button>
        )}
      </div>
      {roles.length === 0 && <div className="settings-empty-row">No roles yet.</div>}
      {roles.map(role => (
        <div key={role.id} className="settings-card" style={{ padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldIcon size={13} color="var(--accent)" strokeWidth={1.5} />
            <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{role.name}</span>
            <span className="settings-card-id">{role.id}</span>
            {canWrite && (
              <button className="panel-icon-btn" title="Edit role" onClick={() => { setForm({ name: role.name, description: role.description || '' }); setModal({ role }); }}>
                <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
              </button>
            )}
            {canWrite && (
              <button className="panel-icon-btn" title="Delete role" disabled={deleting === role.id} onClick={() => del(role)}>
                <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
              </button>
            )}
          </div>
          {role.description && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, paddingLeft: 21 }}>{role.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Users sub-section ───────────────────────────────────────────── */
function UsersSubSection({ userId, canWrite, toast }) {
  const [users,       setUsers]       = useState(null);
  const [roles,       setRoles]       = useState([]);
  const [spaces,      setSpaces]      = useState([]);
  const [expanded,    setExpanded]    = useState(null);
  const [assignments, setAssignments] = useState({});   // targetUserId → []
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState({ username: '', displayName: '', email: '' });
  const [saving,      setSaving]      = useState(false);
  const [assignForm,  setAssignForm]  = useState({});   // targetUserId → { roleId, spaceId }
  const [assigning,   setAssigning]   = useState(null);
  const [removing,    setRemoving]    = useState(null);
  const [togglingAdmin, setTogglingAdmin] = useState(null);

  const loadUsers = useCallback(() =>
    api.listUsers(userId).then(d => setUsers(Array.isArray(d) ? d : [])), [userId]);

  const loadAssignments = useCallback(async (targetUserId) => {
    const raw = await api.getUserRoles(userId, targetUserId).catch(() => []);
    setAssignments(s => ({ ...s, [targetUserId]: Array.isArray(raw) ? raw : [] }));
  }, [userId]);

  useEffect(() => {
    loadUsers();
    api.getRoles(userId).then(d => setRoles(Array.isArray(d) ? d : []));
    api.listProjectSpaces(userId).then(d => setSpaces(Array.isArray(d) ? d : []));
  }, [userId]);

  async function expandUser(u) {
    const uid = u.id;
    if (expanded === uid) { setExpanded(null); return; }
    setExpanded(uid);
    await loadAssignments(uid);
    setAssignForm(s => ({
      ...s,
      [uid]: s[uid] || { roleId: roles[0]?.id || '', spaceId: spaces[0]?.id || spaces[0]?.ID || '' },
    }));
  }

  async function createUser() {
    if (!form.username.trim()) return;
    setSaving(true);
    try {
      await api.createUser(userId, form.username.trim(), form.displayName.trim() || null, form.email.trim() || null);
      await loadUsers();
      setModal(false);
      setForm({ username: '', displayName: '', email: '' });
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function deactivate(u) {
    if (!window.confirm(`Deactivate user "${u.username}"?`)) return;
    try {
      await api.deactivateUser(userId, u.id);
      await loadUsers();
    } catch (e) { toast(e, 'error'); }
  }

  async function addAssignment(targetUserId) {
    const { roleId, spaceId } = assignForm[targetUserId] || {};
    if (!roleId || !spaceId) return;
    setAssigning(targetUserId);
    try {
      await api.assignRole(userId, targetUserId, roleId, spaceId);
      await loadAssignments(targetUserId);
    } catch (e) { toast(e, 'error'); }
    finally { setAssigning(null); }
  }

  async function removeAssignment(targetUserId, roleId, spaceId) {
    const key = `${targetUserId}:${roleId}:${spaceId}`;
    setRemoving(key);
    try {
      await api.removeRole(userId, targetUserId, roleId, spaceId);
      await loadAssignments(targetUserId);
    } catch (e) { toast(e, 'error'); }
    finally { setRemoving(null); }
  }

  async function toggleAdmin(u, newValue) {
    setTogglingAdmin(u.id);
    try {
      await api.setUserAdmin(userId, u.id, newValue);
      await loadUsers();
    } catch (e) { toast(e, 'error'); }
    finally { setTogglingAdmin(null); }
  }

  if (!users) return <div className="settings-loading">Loading…</div>;

  return (
    <div className="settings-list">
      {modal && (
        <MetaModal title="New User" onClose={() => { setModal(false); setForm({ username: '', displayName: '', email: '' }); }} onSave={createUser} saving={saving} saveLabel="Create">
          <Field label="Username *">
            <input className="field-input" autoFocus value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. john.doe" />
          </Field>
          <Field label="Display Name">
            <input className="field-input" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} placeholder="e.g. John Doe" />
          </Field>
          <Field label="Email">
            <input className="field-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. john@company.com" />
          </Field>
        </MetaModal>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        {canWrite && (
          <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => { setForm({ username: '', displayName: '', email: '' }); setModal(true); }}>
            <PlusIcon size={11} strokeWidth={2.5} /> New user
          </button>
        )}
      </div>
      {users.length === 0 && <div className="settings-empty-row">No users found.</div>}
      {users.map(u => {
        const uid    = u.id;
        const isExp  = expanded === uid;
        const asgns  = assignments[uid] || [];
        const active = u.active !== false;
        return (
          <div key={uid} className="settings-card">
            <div className="settings-card-hd" style={{ display: 'flex', alignItems: 'center' }} onClick={() => expandUser(u)}>
              <span className="settings-card-chevron">
                {isExp ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" /> : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
              </span>
              <UserIcon size={13} color={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth={1.5} />
              <span className="settings-card-name" style={{ marginLeft: 4 }}>{u.username}</span>
              {u.displayName && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>{u.displayName}</span>}
              <span className="settings-card-id">{uid}</span>
              {u.email && <span style={{ flex: 1, fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 8 }}>{u.email}</span>}
              {!active && <span className="settings-badge settings-badge--warn">Inactive</span>}
              {u.isAdmin && <span className="settings-badge settings-badge--warn" title="Administrator">Admin</span>}
              {canWrite && (
                <select
                  className="field-input"
                  style={{ height: 22, fontSize: 10, padding: '0 4px', width: 'auto', marginLeft: 6, flexShrink: 0 }}
                  value={u.isAdmin ? 'admin' : 'user'}
                  disabled={togglingAdmin === uid}
                  onClick={e => e.stopPropagation()}
                  onChange={e => { e.stopPropagation(); toggleAdmin(u, e.target.value === 'admin'); }}
                  title="Admin status"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              )}
              {canWrite && (
                <button className="panel-icon-btn" title="Deactivate user" style={{ marginLeft: 4 }}
                  onClick={e => { e.stopPropagation(); deactivate(u); }}>
                  <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
                </button>
              )}
            </div>
            {isExp && (
              <div className="settings-card-body" style={{ paddingTop: 10 }}>
                <span className="settings-sub-label" style={{ display: 'block', margin: '0 0 8px' }}>Role Assignments</span>
                {asgns.length === 0 && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>No role assignments yet.</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                  {asgns.map(a => {
                    const key = `${uid}:${a.id}:${a.projectSpaceId}`;
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '3px 0' }}>
                        <ShieldIcon size={11} color="var(--accent)" strokeWidth={1.5} />
                        <span style={{ fontWeight: 600, minWidth: 80 }}>{a.name}</span>
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>in</span>
                        <HexIcon size={10} color="var(--muted)" strokeWidth={1.5} />
                        <span style={{ color: 'var(--fg)', fontSize: 11 }}>{a.projectSpaceName}</span>
                        <button className="panel-icon-btn" title="Remove assignment" disabled={removing === key}
                          onClick={() => removeAssignment(uid, a.id, a.projectSpaceId)}>
                          <CloseIcon size={10} strokeWidth={2.5} color="var(--danger, #f87171)" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {canWrite && roles.length > 0 && spaces.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                    <select className="field-input" style={{ height: 24, fontSize: 11, padding: '0 6px', flex: 1 }}
                      value={assignForm[uid]?.roleId || ''}
                      onChange={e => setAssignForm(s => ({ ...s, [uid]: { ...(s[uid] || {}), roleId: e.target.value } }))}>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>in</span>
                    <select className="field-input" style={{ height: 24, fontSize: 11, padding: '0 6px', flex: 1 }}
                      value={assignForm[uid]?.spaceId || ''}
                      onChange={e => setAssignForm(s => ({ ...s, [uid]: { ...(s[uid] || {}), spaceId: e.target.value } }))}>
                      {spaces.map(sp => <option key={sp.id || sp.ID} value={sp.id || sp.ID}>{sp.name || sp.NAME}</option>)}
                    </select>
                    <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                      disabled={assigning === uid}
                      onClick={() => addAssignment(uid)}>
                      <PlusIcon size={10} strokeWidth={2.5} /> Assign
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Users & Roles section (tab switcher) ────────────────────────── */
function UsersRolesSection({ userId, canWrite, toast }) {
  const [tab, setTab] = useState('roles');
  return (
    <div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
        {[['roles', 'Roles'], ['users', 'Users']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px 16px', fontSize: 12, fontWeight: 600,
            color: tab === key ? 'var(--accent)' : 'var(--muted)',
            borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
            letterSpacing: '.02em',
          }}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'roles'
        ? <RolesSubSection userId={userId} canWrite={canWrite} toast={toast} />
        : <UsersSubSection userId={userId} canWrite={canWrite} toast={toast} />
      }
    </div>
  );
}

/* ── Main SettingsPage ───────────────────────────────────────────── */
export default function SettingsPage({ userId, projectSpaceId, onClose, toast }) {
  const [activeSection, setActiveSection] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null); // null = loading

  useEffect(() => {
    api.getUserContext(userId, projectSpaceId)
      .then(ctx => {
        const admin = !!ctx?.isAdmin;
        setIsAdmin(admin);
        // Default to first visible section
        const first = SECTIONS.find(s => !s.adminOnly || admin);
        setActiveSection(first?.key ?? null);
      })
      .catch(() => {
        setIsAdmin(false);
        setActiveSection('api-playground');
      });
  }, [userId, projectSpaceId]);

  const visibleSections = isAdmin === null ? [] : SECTIONS.filter(s => !s.adminOnly || isAdmin);

  return (
    <div className="settings-page">
      <div className="settings-sidenav">
        <div className="settings-sidenav-title">
          <GearIcon size={14} color="var(--accent)" strokeWidth={1.8} />
          Settings &amp; Metadata
        </div>
        <div className="settings-sidenav-items">
          {visibleSections.map(({ key, label, Icon }) => (
            <div key={key} className={`settings-nav-item ${activeSection === key ? 'active' : ''}`} onClick={() => setActiveSection(key)}>
              <Icon size={13} strokeWidth={1.8} color={activeSection === key ? 'var(--accent)' : 'var(--muted)'} />
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="settings-content">
        <div className="settings-content-hd">
          <span className="settings-content-title">{visibleSections.find(s => s.key === activeSection)?.label}</span>
          <button className="btn btn-sm" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CloseIcon size={12} strokeWidth={2.5} />
            Close
          </button>
        </div>
        {activeSection === null ? (
          <div style={{ padding: '32px 24px', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        ) : activeSection === 'api-playground' ? (
          <ApiPlayground userId={userId} projectSpaceId={projectSpaceId} />
        ) : (
          <div className="settings-content-body">
            {activeSection === 'node-types'   && <NodeTypesSection     userId={userId} toast={toast} />}
            {activeSection === 'lifecycles'   && <LifecyclesSection    userId={userId} toast={toast} />}
            {activeSection === 'proj-spaces'  && <ProjectSpacesSection userId={userId} toast={toast} />}
            {activeSection === 'users-roles'  && <UsersRolesSection    userId={userId} toast={toast} />}
          </div>
        )}
      </div>
    </div>
  );
}
