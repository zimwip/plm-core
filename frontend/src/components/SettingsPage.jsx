import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  LayersIcon, LifecycleIcon, CloseIcon,
  ChevronRightIcon, ChevronDownIcon, HexIcon, TerminalIcon, PlusIcon,
  EditIcon, TrashIcon, UsersIcon, UserIcon, ShieldIcon, BookIcon, WorkflowIcon, CpuIcon, CopyIcon,
} from './Icons';
import { NODE_ICONS, NODE_ICON_NAMES } from './Icons';
import ApiPlayground from './ApiPlayground';
import UserManual from './UserManual';
import LifecycleDiagram from './LifecycleDiagram';

export const SECTIONS = [
  { key: 'node-types',      label: 'Node Types',     Icon: LayersIcon,    requiredPermission: 'MANAGE_METAMODEL' },
  { key: 'lifecycles',      label: 'Lifecycles',     Icon: LifecycleIcon, requiredPermission: 'MANAGE_METAMODEL' },
  { key: 'proj-spaces',     label: 'Project Spaces', Icon: HexIcon,       requiredPermission: 'MANAGE_ROLES'     },
  { key: 'users-roles',     label: 'Users & Roles',  Icon: UsersIcon,     requiredPermission: 'MANAGE_ROLES'     },
  { key: 'access-rights',   label: 'Access Rights',  Icon: ShieldIcon,    requiredPermission: 'MANAGE_ROLES'     },
  { key: 'algorithms',      label: 'Algorithms',     Icon: CpuIcon,       requiredPermission: 'MANAGE_METAMODEL' },
  { key: 'guards',          label: 'Actions & Guards', Icon: WorkflowIcon, requiredPermission: 'MANAGE_METAMODEL' },
  { key: 'api-playground',  label: 'API Playground', Icon: TerminalIcon,  requiredPermission: null               },
  { key: 'user-manual',     label: 'User Manual',    Icon: BookIcon,      requiredPermission: null               },
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
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={!!form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} />
          Required field
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={!!form.asName} onChange={e => setForm(f => ({ ...f, asName: e.target.checked }))} />
          Use as display name <span style={{ color: 'var(--accent)', marginLeft: 2 }}>★</span>
        </label>
      </div>
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
export function NodeTypesSection({ userId, canWrite, toast }) {
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

  useWebSocket(
    '/topic/metamodel',
    (evt) => { if (evt.event === 'METAMODEL_CHANGED') loadTypes(); },
    userId,
  );

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
          name:             form.name?.trim(),
          description:      form.description?.trim() || null,
          lifecycleId:      form.lifecycleId || null,
          numberingScheme:  form.numberingScheme || 'ALPHA_NUMERIC',
          versionPolicy:    form.versionPolicy   || 'ITERATE',
          color:            form.color  || null,
          icon:             form.icon   || null,
          parentNodeTypeId: form.parentNodeTypeId || null,
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
          asName:         !!form.asName,
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
          asName:         !!form.asName,
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

      } else if (type === 'edit-parent') {
        await api.updateNodeTypeParent(userId, ctx.nodeTypeId, form.parentNodeTypeId || null);
        await loadTypes();
        setExpanded(null);
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
            modal.type === 'edit-parent'     ? 'Change Parent' :
            modal.type === 'create-attr'     ? 'Add Attribute' :
            modal.type === 'edit-attr'       ? 'Edit Attribute' :
            modal.type === 'create-link'     ? 'Add Link Type' :
            modal.type === 'edit-link'       ? `Edit Link Type — ${modal.ctx.linkName}` : ''
          }
          width={modal.type === 'edit-link' ? 620 : 480}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
          saveLabel={['edit-identity','edit-attr','edit-link','edit-parent'].includes(modal.type) ? 'Update' : 'Create'}
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
            <Field label="Parent node type (optional)">
              <select className="field-input" value={form.parentNodeTypeId || ''} onChange={e => setForm(f => ({ ...f, parentNodeTypeId: e.target.value }))}>
                <option value="">None</option>
                {types.map(nt => {
                  const tid = nt.id || nt.ID;
                  return <option key={tid} value={tid}>{nt.name || nt.NAME || tid}</option>;
                })}
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

          {/* ── Edit parent node type ── */}
          {modal.type === 'edit-parent' && <>
            <Field label="Parent node type">
              <select
                className="field-input"
                autoFocus
                value={form.parentNodeTypeId || ''}
                onChange={e => setForm(f => ({ ...f, parentNodeTypeId: e.target.value }))}
              >
                <option value="">None (root type)</option>
                {types
                  .filter(nt => (nt.id || nt.ID) !== modal.ctx.nodeTypeId)
                  .map(nt => {
                    const tid = nt.id || nt.ID;
                    return <option key={tid} value={tid}>{nt.name || nt.NAME || tid}</option>;
                  })}
              </select>
            </Field>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              Attributes, actions, and link types defined on the parent type will be inherited. State rule overrides can be configured per attribute.
            </div>
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
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, padding: '6px 8px', background: 'var(--accent-dim)', borderRadius: 4 }}>
              History collapse is now managed via State Actions on lifecycle states.
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
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={!!form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} />
                Required field
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={!!form.asName} onChange={e => setForm(f => ({ ...f, asName: e.target.checked }))} />
                Use as display name <span style={{ color: 'var(--accent)', marginLeft: 2 }}>★</span>
              </label>
            </div>
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
        const numScheme      = nt.numbering_scheme   || nt.NUMBERING_SCHEME   || 'ALPHA_NUMERIC';
        const verPolicy      = nt.version_policy     || nt.VERSION_POLICY     || 'ITERATE';
        const lcId        = nt.lifecycle_id       || nt.LIFECYCLE_ID       || null;
        const lcName      = lifecycles.find(lc => (lc.id || lc.ID) === lcId)?.name || lcId || '—';
        const ntColor     = nt.color || nt.COLOR || null;
        const ntIcon      = nt.icon  || nt.ICON  || null;
        const NtIcon      = ntIcon ? NODE_ICONS[ntIcon] : null;
        const parentId    = nt.parent_node_type_id || nt.PARENT_NODE_TYPE_ID || null;
        const parentName  = parentId ? (typeNameMap[parentId] || parentId) : null;
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
                {/* Inheritance */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>Inheritance</span>
                  {canWrite && (
                    <button className="panel-icon-btn" title="Change parent" onClick={() => openModal('edit-parent', { nodeTypeId: id }, { parentNodeTypeId: parentId || '' })}>
                      <EditIcon size={12} strokeWidth={2} color="var(--accent)" />
                    </button>
                  )}
                </div>
                <table className="settings-table">
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--muted)', width: 110 }}>Inherits from</td>
                      <td>
                        {parentName
                          ? <span className="settings-badge">{parentName}</span>
                          : <span style={{ color: 'var(--muted2)' }}>—</span>
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Identifier */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 }}>
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
                    <button className="panel-icon-btn" title="Add attribute" onClick={() => openModal('create-attr', { nodeTypeId: id }, { dataType: 'STRING', widgetType: 'TEXT', required: false, asName: false })}>
                      <PlusIcon size={12} strokeWidth={2.5} color="var(--accent)" />
                    </button>
                  )}
                </div>
                {ntAttrs.length === 0 ? (
                  <div className="settings-empty-row">No attributes defined</div>
                ) : (
                  <table className="settings-table">
                    <thead>
                      <tr><th>Name</th><th>Label</th><th>Type</th><th>Req</th><th>As Name</th><th>Section</th><th></th></tr>
                    </thead>
                    <tbody>
                      {[...ntAttrs]
                        .sort((a, b) => (a.display_order || a.DISPLAY_ORDER || 0) - (b.display_order || b.DISPLAY_ORDER || 0))
                        .map(a => {
                          const aid      = a.id          || a.ID;
                          const aname    = a.name        || a.NAME;
                          const albl     = a.label       || a.LABEL       || aname;
                          const atype    = a.widget_type || a.WIDGET_TYPE || 'TEXT';
                          const areq     = !!(a.required || a.REQUIRED);
                          const aAsNm    = !!(a.as_name  || a.AS_NAME);
                          const asec     = a.display_section || a.DISPLAY_SECTION || '—';
                          const aInherited   = !!(a.inherited || a.INHERITED);
                          const aInheritedFrom = a.inherited_from || a.INHERITED_FROM || null;
                          return (
                            <tr key={aid}>
                              <td className="settings-td-mono">
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  {aname}
                                  {aInherited && (
                                    <span style={{ fontSize: 9, background: 'var(--accent-dim,rgba(99,179,237,.15))', color: 'var(--accent)', borderRadius: 3, padding: '1px 4px', fontFamily: 'sans-serif', letterSpacing: '.02em', whiteSpace: 'nowrap' }}>
                                      from {aInheritedFrom || 'parent'}
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td>{albl}</td>
                              <td><span className="settings-badge">{atype}</span></td>
                              <td style={{ color: areq ? 'var(--success)' : 'var(--muted)' }}>{areq ? '✓' : '—'}</td>
                              <td style={{ color: aAsNm ? 'var(--accent)' : 'var(--muted)', fontWeight: aAsNm ? 600 : 400 }}>{aAsNm ? '★' : '—'}</td>
                              <td style={{ color: 'var(--muted)' }}>{asec}</td>
                              <td>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  {canWrite && !aInherited && (
                                    <button className="panel-icon-btn" title="Edit" onClick={() => openModal('edit-attr', { nodeTypeId: id, attrId: aid }, {
                                      label:          albl,
                                      dataType:       a.data_type      || a.DATA_TYPE      || 'STRING',
                                      widgetType:     a.widget_type    || a.WIDGET_TYPE    || 'TEXT',
                                      required:       areq,
                                      asName:         aAsNm,
                                      displaySection: a.display_section || a.DISPLAY_SECTION || '',
                                      displayOrder:   a.display_order  ?? a.DISPLAY_ORDER  ?? '',
                                    })}>
                                      <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
                                    </button>
                                  )}
                                  {canWrite && !aInherited && (
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

function StateFormFields({ form, setForm, knownMetaKeys = [] }) {
  const meta = form.metadata || {};
  const setMeta = (key, val) => setForm(f => ({
    ...f,
    metadata: { ...(f.metadata || {}), [key]: val ? 'true' : undefined },
  }));

  // Known keys from @Metadata annotations
  const knownKeyNames = new Set(knownMetaKeys.map(k => k.key));
  // Extra keys in current metadata not covered by known keys
  const extraKeys = Object.keys(meta).filter(k => !knownKeyNames.has(k));

  return (
    <>
      <Field label="State Name *">
        <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. In Review" />
      </Field>
      <Field label="Display Order">
        <input className="field-input" type="number" min="0" value={form.displayOrder ?? ''} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} placeholder="0" style={{ width: 100 }} />
      </Field>
      <Field label="Flags">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form.isInitial} onChange={e => setForm(f => ({ ...f, isInitial: e.target.checked }))} />
            <span className="lc-state-flag" style={{ opacity: form.isInitial ? 1 : 0.4 }}>INIT</span>
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>Initial state — entry point of the lifecycle</span>
          </label>
        </div>
      </Field>
      <Field label="Metadata">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {knownMetaKeys.map(mk => (
            <label key={mk.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={meta[mk.key] === 'true'} onChange={e => setMeta(mk.key, e.target.checked)} />
              <span className="lc-state-flag" style={{ opacity: meta[mk.key] === 'true' ? 1 : 0.4 }}>{mk.key.toUpperCase()}</span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{mk.description}</span>
            </label>
          ))}
          {knownMetaKeys.length === 0 && (
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>No metadata keys registered in backend</span>
          )}
          {/* Extra keys not declared by @Metadata */}
          {extraKeys.map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{k}</span>
              <span style={{ color: 'var(--muted)' }}>=</span>
              <span style={{ color: 'var(--text)' }}>{meta[k]}</span>
              <button className="panel-icon-btn" onClick={() => {
                const copy = { ...(form.metadata || {}) };
                delete copy[k];
                setForm(f => ({ ...f, metadata: copy }));
              }} title="Remove"><TrashIcon size={10} strokeWidth={2} color="var(--danger)" /></button>
            </div>
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

export function LifecyclesSection({ userId, canWrite, toast }) {
  const [lcs,         setLcs]         = useState([]);
  const [expanded,    setExpanded]    = useState(null);
  const [lcData,      setLcData]      = useState({});
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null);
  const [form,        setForm]        = useState({});
  const [saving,      setSaving]      = useState(false);
  const [roles,       setRoles]       = useState([]);
  const [sigReqRole,  setSigReqRole]  = useState('');
  const [sigReqBusy,  setSigReqBusy]  = useState(false);
  const [transGuards, setTransGuards] = useState({});  // transitionId → guard[]
  const [instances,   setInstances]   = useState([]);
  const [stateActions, setStateActions] = useState({});  // stateId → action[]
  const [expandedState, setExpandedState] = useState(null);
  const [expandedTrans, setExpandedTrans] = useState(null);
  const [knownMetaKeys, setKnownMetaKeys] = useState([]);

  function loadLcs() {
    return api.getLifecycles(userId).then(d => setLcs(Array.isArray(d) ? d : []));
  }

  useEffect(() => {
    loadLcs().finally(() => setLoading(false));
    api.getRoles(userId).then(d => setRoles(Array.isArray(d) ? d : [])).catch(() => {});
    api.listAllInstances(userId).then(d => setInstances(Array.isArray(d) ? d : [])).catch(() => {});
    api.getMetadataKeys(userId, 'LIFECYCLE_STATE').then(d => setKnownMetaKeys(Array.isArray(d) ? d : [])).catch(() => {});
  }, [userId]);

  useWebSocket(
    '/topic/metamodel',
    (evt) => { if (evt.event === 'METAMODEL_CHANGED') loadLcs(); },
    userId,
  );

  async function refreshLcData(id) {
    const [states, transitions] = await Promise.all([
      api.getLifecycleStates(userId, id),
      api.getLifecycleTransitions(userId, id),
    ]);
    const transList = Array.isArray(transitions) ? transitions : [];
    setLcData(s => ({ ...s, [id]: {
      states:      Array.isArray(states) ? states : [],
      transitions: transList,
    }}));
    // Load guards for each transition
    for (const t of transList) {
      const tid = t.id || t.ID;
      api.listTransitionGuards(userId, tid)
        .then(g => setTransGuards(s => ({ ...s, [tid]: Array.isArray(g) ? g : [] })))
        .catch(() => {});
    }
    // Load state actions for each state
    const statesList = Array.isArray(states) ? states : [];
    for (const st of statesList) {
      const sid = st.id || st.ID;
      api.listLifecycleStateActions(userId, id, sid)
        .then(a => setStateActions(s => ({ ...s, [sid]: Array.isArray(a) ? a : [] })))
        .catch(() => {});
    }
  }

  async function expand(lc) {
    const id = lc.id || lc.ID;
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!lcData[id]) await refreshLcData(id).catch(e => toast(e, 'error'));
  }

  function openModal(type, ctx = {}, defaults = {}) { setForm(defaults); setModal({ type, ctx }); setSigReqRole(''); }
  function closeModal() { setModal(null); setForm({}); setSigReqRole(''); }

  async function handleSave() {
    setSaving(true);
    try {
      const { type, ctx } = modal;
      // Clean metadata: remove keys with undefined/null values
      const rawMeta = form.metadata || {};
      const cleanMeta = {};
      for (const [k, v] of Object.entries(rawMeta)) {
        if (v != null) cleanMeta[k] = v;
      }
      const stateBody = {
        name:         form.name?.trim(),
        isInitial:    !!form.isInitial,
        metadata:     cleanMeta,
        displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : 0,
        color:        form.color || null,
      };
      const transBody = {
        name:            form.name?.trim(),
        fromStateId:     form.fromStateId,
        toStateId:       form.toStateId,
        actionType:      form.actionType || 'NONE',
        versionStrategy: form.versionStrategy || 'NONE',
      };

      if (type === 'create-lc') {
        await api.createLifecycle(userId, { name: form.name?.trim(), description: form.description?.trim() || null });
        await loadLcs();
      } else if (type === 'duplicate-lc') {
        await api.duplicateLifecycle(userId, ctx.sourceId, form.name?.trim());
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

  async function addSigReq(transId, lcId) {
    if (!sigReqRole) return;
    setSigReqBusy(true);
    try {
      await api.addTransitionSignatureRequirement(userId, transId, sigReqRole);
      setSigReqRole('');
      await refreshLcData(lcId);
    } catch (e) { toast(e, 'error'); } finally { setSigReqBusy(false); }
  }

  async function removeSigReq(transId, reqId, lcId) {
    setSigReqBusy(true);
    try {
      await api.removeTransitionSignatureRequirement(userId, transId, reqId);
      await refreshLcData(lcId);
    } catch (e) { toast(e, 'error'); } finally { setSigReqBusy(false); }
  }

  const saveDisabled = () => {
    if (!modal || saving) return true;
    const { type } = modal;
    if (type === 'create-lc' || type === 'duplicate-lc') return !form.name?.trim();
    if (type === 'create-state' || type === 'edit-state') return !form.name?.trim();
    if (type === 'create-transition' || type === 'edit-transition') return !form.name?.trim() || !form.fromStateId || !form.toStateId;
    return false;
  };

  if (loading) return <div className="settings-loading">Loading…</div>;

  const modalTitle = {
    'create-lc':         'New Lifecycle',
    'duplicate-lc':      'Duplicate Lifecycle',
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
          width={modal.type?.includes('state') ? 520 : modal.type === 'edit-transition' ? 520 : 480}
        >
          {modal.type === 'create-lc' && <>
            <Field label="Name *">
              <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Standard" />
            </Field>
            <Field label="Description">
              <input className="field-input" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </Field>
          </>}

          {modal.type === 'duplicate-lc' && <>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
              Duplicating <strong style={{ color: 'var(--text)' }}>{modal.ctx.sourceName}</strong> — copies all states, transitions, guards, signature requirements, state actions, and metadata.
            </div>
            <Field label="New Name *">
              <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Standard (v2)" />
            </Field>
          </>}

          {(modal.type === 'create-state' || modal.type === 'edit-state') && (
            <StateFormFields form={form} setForm={setForm} knownMetaKeys={knownMetaKeys} />
          )}

          {(modal.type === 'create-transition' || modal.type === 'edit-transition') && (
            <TransitionFormFields form={form} setForm={setForm} states={modal.ctx.states || []} />
          )}

          {modal.type === 'edit-transition' && canWrite && (() => {
            const lcId    = modal.ctx.lifecycleId;
            const transId = modal.ctx.transId;
            const trans   = lcData[lcId]?.transitions?.find(t => (t.id || t.ID) === transId);
            const sigReqs = trans?.signatureRequirements || [];
            const usedRoleIds = new Set(sigReqs.map(r => r.roleRequired));
            return (
              <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  Signature Requirements
                </div>
                {sigReqs.length === 0 && (
                  <div className="settings-empty-row" style={{ fontSize: 11 }}>No signatures required for this transition</div>
                )}
                {sigReqs.map(req => (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12 }}>
                    <span style={{ flex: 1, color: 'var(--text)' }}>
                      {roles.find(r => (r.id || r.ID) === req.roleRequired)?.name || req.roleRequired}
                    </span>
                    <button className="panel-icon-btn" disabled={sigReqBusy}
                      onClick={() => removeSigReq(transId, req.id, lcId)}
                      title="Remove requirement">
                      <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <select className="field-input" style={{ flex: 1, fontSize: 12 }}
                    value={sigReqRole} onChange={e => setSigReqRole(e.target.value)}>
                    <option value="">Add required role…</option>
                    {roles.map(r => {
                      const rid = r.id || r.ID;
                      return <option key={rid} value={rid} disabled={usedRoleIds.has(rid)}>{r.name || r.NAME || rid}</option>;
                    })}
                  </select>
                  <button className="btn btn-sm" disabled={!sigReqRole || sigReqBusy}
                    onClick={() => addSigReq(transId, lcId)}>
                    Add
                  </button>
                </div>
              </div>
            );
          })()}
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
                <button className="panel-icon-btn" title="Duplicate lifecycle" style={{ marginLeft: 'auto' }} onClick={e => {
                  e.stopPropagation();
                  openModal('duplicate-lc', { sourceId: id, sourceName: name }, { name: `${name} (copy)` });
                }}>
                  <CopyIcon size={12} strokeWidth={2} color="var(--accent)" />
                </button>
              )}
              {canWrite && (
                <button className="panel-icon-btn" title="Delete lifecycle" onClick={e => deleteLifecycle(e, lc)}>
                  <TrashIcon size={12} strokeWidth={2} color="var(--danger, #f87171)" />
                </button>
              )}
            </div>

            {isExp && data && (
              <div className="settings-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                {/* ── Diagram preview ─────────────────────── */}
                {data.states?.length > 0 && (
                  <div style={{ marginBottom: 16, overflowX: 'auto' }}>
                    <LifecycleDiagram
                      lifecycleId={id}
                      userId={userId}
                      previewMode
                    />
                  </div>
                )}

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
                  const meta  = s.metadata || {};
                  const flags = [
                    (s.is_initial || s.IS_INITIAL) ? 'INIT' : null,
                    ...Object.keys(meta).map(k => k.toUpperCase()),
                  ].filter(Boolean);
                  const order = s.display_order ?? s.DISPLAY_ORDER ?? 0;
                  const isStateExp = expandedState === sid;
                  const sActions = stateActions[sid] || [];

                  return (
                    <div key={sid} style={{ marginBottom: 3 }}>
                      {/* ── State header (collapsible) ── */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '6px 8px', borderRadius: isStateExp ? '5px 5px 0 0' : 5,
                        background: 'rgba(255,255,255,.02)',
                        border: '1px solid var(--border)',
                        borderBottom: isStateExp ? '1px solid var(--border2)' : '1px solid var(--border)',
                        cursor: 'pointer',
                      }} onClick={() => setExpandedState(isStateExp ? null : sid)}>
                        <span style={{ flexShrink: 0 }}>
                          {isStateExp
                            ? <ChevronDownIcon size={11} strokeWidth={2} color="var(--muted)" />
                            : <ChevronRightIcon size={11} strokeWidth={2} color="var(--muted)" />}
                        </span>
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
                        {/* Action count badge */}
                        {sActions.length > 0 && (
                          <span className="settings-badge" title={`${sActions.length} state action(s)`}>
                            {sActions.length} action{sActions.length > 1 ? 's' : ''}
                          </span>
                        )}
                        {/* Order badge */}
                        <span style={{ fontSize: 10, color: 'var(--muted)', minWidth: 24, textAlign: 'right' }}>#{order}</span>
                        {/* Edit/Delete */}
                        {canWrite && (
                          <button className="panel-icon-btn" title="Edit state" onClick={e => { e.stopPropagation(); openModal('edit-state', { lifecycleId: id, stateId: sid }, {
                            name:         sname,
                            isInitial:    !!(s.is_initial  || s.IS_INITIAL),
                            metadata:     { ...meta },
                            displayOrder: order,
                            color,
                          }); }}>
                            <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
                          </button>
                        )}
                        {canWrite && (
                          <button className="panel-icon-btn" title="Delete state" onClick={e => { e.stopPropagation(); deleteState(id, s); }}>
                            <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
                          </button>
                        )}
                      </div>

                      {/* ── State body (expanded) ── */}
                      {isStateExp && (
                        <div style={{
                          padding: '10px 12px',
                          background: 'rgba(255,255,255,.01)',
                          border: '1px solid var(--border)',
                          borderTop: 'none',
                          borderRadius: '0 0 5px 5px',
                        }}>
                          {/* State info */}
                          <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 11 }}>
                            <div><span style={{ color: 'var(--muted)' }}>ID</span> <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)', fontSize: 10 }}>{sid}</span></div>
                            <div><span style={{ color: 'var(--muted)' }}>Order</span> <span style={{ color: 'var(--text)' }}>{order}</span></div>
                          </div>

                          {/* Metadata */}
                          {Object.keys(meta).length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Metadata</div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {Object.entries(meta).map(([k, v]) => (
                                  <span key={k} style={{
                                    fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 6px',
                                    borderRadius: 3, background: 'var(--accent-dim)', color: 'var(--accent)',
                                    border: '1px solid rgba(106,172,255,.2)',
                                  }}>{k}={v}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* State Actions */}
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                            State Actions
                          </div>

                          {sActions.length === 0 && (
                            <div className="settings-empty-row" style={{ fontSize: 11, marginBottom: 8 }}>No actions attached to this state</div>
                          )}

                          {sActions.map(a => (
                            <div key={a.id} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '4px 6px', marginBottom: 2, borderRadius: 3,
                              background: 'rgba(255,255,255,.02)',
                              border: '1px solid var(--border)',
                              fontSize: 11,
                            }}>
                              <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 600 }}>{a.algorithmCode || a.instanceName}</span>
                              <span className="settings-badge" style={{
                                background: a.trigger === 'ON_ENTER' ? 'rgba(52,211,153,.15)' : 'rgba(248,113,113,.15)',
                                color:      a.trigger === 'ON_ENTER' ? '#34d399' : '#f87171',
                                fontSize: 9,
                              }}>{a.trigger}</span>
                              <span className="settings-badge" style={{
                                background: a.executionMode === 'TRANSACTIONAL' ? 'rgba(167,139,250,.15)' : 'rgba(250,204,21,.15)',
                                color:      a.executionMode === 'TRANSACTIONAL' ? '#a78bfa' : '#facc15',
                                fontSize: 9,
                              }}>{a.executionMode}</span>
                              <span style={{ flex: 1 }} />
                              {canWrite && (
                                <button className="panel-icon-btn" title="Detach action" onClick={async () => {
                                  try {
                                    await api.detachLifecycleStateAction(userId, id, sid, a.id);
                                    setStateActions(prev => ({ ...prev, [sid]: (prev[sid] || []).filter(x => x.id !== a.id) }));
                                    toast('Action detached', 'success');
                                  } catch (err) { toast(err, 'error'); }
                                }}>
                                  <TrashIcon size={10} strokeWidth={2} color="var(--danger, #f87171)" />
                                </button>
                              )}
                            </div>
                          ))}

                          {/* Attach new action */}
                          {canWrite && (() => {
                            const stateActionInstances = instances.filter(i => i.typeName === 'State Action');
                            return (
                              <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                                <select className="field-input" id={`sa-inst-${sid}`} style={{ flex: 1, fontSize: 11 }} defaultValue="">
                                  <option value="">Select action instance…</option>
                                  {stateActionInstances.map(i => <option key={i.id} value={i.id}>{i.algorithmName || i.name} — {i.name}</option>)}
                                  {stateActionInstances.length === 0 && <option disabled>No State Action instances available</option>}
                                </select>
                                <select className="field-input" id={`sa-trigger-${sid}`} style={{ width: 100, fontSize: 11 }} defaultValue="ON_ENTER">
                                  <option value="ON_ENTER">ON_ENTER</option>
                                  <option value="ON_EXIT">ON_EXIT</option>
                                </select>
                                <select className="field-input" id={`sa-mode-${sid}`} style={{ width: 130, fontSize: 11 }} defaultValue="TRANSACTIONAL">
                                  <option value="TRANSACTIONAL">TRANSACTIONAL</option>
                                  <option value="POST_COMMIT">POST_COMMIT</option>
                                </select>
                                <button className="btn btn-sm" style={{ fontSize: 10 }} onClick={async () => {
                                  const instEl = document.getElementById(`sa-inst-${sid}`);
                                  const trigEl = document.getElementById(`sa-trigger-${sid}`);
                                  const modeEl = document.getElementById(`sa-mode-${sid}`);
                                  if (!instEl?.value) return;
                                  try {
                                    await api.attachLifecycleStateAction(userId, id, sid, instEl.value, trigEl.value, modeEl.value);
                                    const updated = await api.listLifecycleStateActions(userId, id, sid);
                                    setStateActions(prev => ({ ...prev, [sid]: Array.isArray(updated) ? updated : [] }));
                                    instEl.value = '';
                                    toast('Action attached', 'success');
                                  } catch (err) { toast(err, 'error'); }
                                }}>Attach</button>
                              </div>
                            );
                          })()}
                        </div>
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
                  const vstrat    = t.version_strategy || t.VERSION_STRATEGY;
                  const actType   = t.action_type || t.ACTION_TYPE || 'NONE';
                  const tGuards   = transGuards[tid] || [];
                  const isTransExp = expandedTrans === tid;
                  const sigReqs   = t.signatureRequirements || [];
                  const guardInstances = instances.filter(i => i.typeName === 'Action Guard' || i.typeName === 'Lifecycle Guard');

                  return (
                    <div key={tid} style={{ marginBottom: 3 }}>
                      {/* ── Transition header (collapsible) ── */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '6px 8px',
                        borderRadius: isTransExp ? '5px 5px 0 0' : 5,
                        background: 'rgba(255,255,255,.02)',
                        border: '1px solid var(--border)',
                        borderBottom: isTransExp ? '1px solid var(--border2)' : '1px solid var(--border)',
                        cursor: 'pointer',
                      }} onClick={() => setExpandedTrans(isTransExp ? null : tid)}>
                        <span style={{ flexShrink: 0 }}>
                          {isTransExp
                            ? <ChevronDownIcon size={11} strokeWidth={2} color="var(--muted)" />
                            : <ChevronRightIcon size={11} strokeWidth={2} color="var(--muted)" />}
                        </span>
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
                        {/* Summary badges */}
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {tGuards.length > 0 && (
                            <span className="settings-badge" title={tGuards.map(g => g.algorithmCode).join(', ')}>
                              {tGuards.length} guard{tGuards.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {vstrat && vstrat !== 'NONE' && <span className="settings-badge">{vstrat}</span>}
                          {sigReqs.length > 0 && (
                            <span className="settings-badge" style={{ background: 'rgba(139,92,246,.18)', color: '#a78bfa' }}>
                              {sigReqs.length} sign.
                            </span>
                          )}
                        </div>
                        {/* Edit/Delete */}
                        {canWrite && (
                          <button className="panel-icon-btn" title="Edit transition" onClick={e => { e.stopPropagation(); openModal('edit-transition', { lifecycleId: id, transId: tid, states }, {
                            name: tname, fromStateId: fromId, toStateId: toId,
                            actionType: actType, versionStrategy: vstrat || 'NONE',
                          }); }}>
                            <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
                          </button>
                        )}
                        {canWrite && (
                          <button className="panel-icon-btn" title="Delete transition" onClick={e => { e.stopPropagation(); deleteTransition(id, t); }}>
                            <TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" />
                          </button>
                        )}
                      </div>

                      {/* ── Transition body (expanded) ── */}
                      {isTransExp && (
                        <div style={{
                          padding: '10px 12px',
                          background: 'rgba(255,255,255,.01)',
                          border: '1px solid var(--border)',
                          borderTop: 'none',
                          borderRadius: '0 0 5px 5px',
                        }}>
                          {/* Info row */}
                          <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 11, flexWrap: 'wrap' }}>
                            <div><span style={{ color: 'var(--muted)' }}>ID</span> <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)', fontSize: 10 }}>{tid}</span></div>
                            <div><span style={{ color: 'var(--muted)' }}>Action Type</span> <span style={{ color: 'var(--text)' }}>{actType}</span></div>
                            <div><span style={{ color: 'var(--muted)' }}>Version Strategy</span> <span style={{ color: 'var(--text)' }}>{vstrat || 'NONE'}</span></div>
                          </div>

                          {/* Guards section */}
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                            Guards
                          </div>

                          {tGuards.length === 0 && (
                            <div className="settings-empty-row" style={{ fontSize: 11, marginBottom: 8 }}>No guards attached</div>
                          )}

                          {tGuards.map(g => (
                            <div key={g.id} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '4px 6px', marginBottom: 2, borderRadius: 3,
                              background: 'rgba(255,255,255,.02)',
                              border: '1px solid var(--border)',
                              fontSize: 11,
                            }}>
                              <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 600 }}>{g.algorithmCode || g.instanceName}</span>
                              <span className={`settings-badge ${g.effect === 'BLOCK' ? 'badge-warn' : ''}`} style={{ fontSize: 9 }}>{g.effect}</span>
                              <span style={{ flex: 1 }} />
                              {canWrite && (
                                <button className="panel-icon-btn" title="Detach guard" onClick={async () => {
                                  try {
                                    await api.detachTransitionGuard(userId, g.id);
                                    setTransGuards(s => ({ ...s, [tid]: (s[tid] || []).filter(x => x.id !== g.id) }));
                                    toast('Guard detached', 'success');
                                  } catch (err) { toast(err, 'error'); }
                                }}>
                                  <TrashIcon size={10} strokeWidth={2} color="var(--danger, #f87171)" />
                                </button>
                              )}
                            </div>
                          ))}

                          {canWrite && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                              <select className="field-input" id={`tg-inst-${tid}`} style={{ flex: 1, fontSize: 11 }} defaultValue="">
                                <option value="">Select guard instance…</option>
                                {guardInstances.map(i => <option key={i.id} value={i.id}>{i.algorithmName || i.name} — {i.name}</option>)}
                              </select>
                              <select className="field-input" id={`tg-effect-${tid}`} style={{ width: 80, fontSize: 11 }} defaultValue="BLOCK">
                                <option value="BLOCK">BLOCK</option>
                                <option value="HIDE">HIDE</option>
                              </select>
                              <button className="btn btn-sm" style={{ fontSize: 10 }} onClick={async () => {
                                const instEl = document.getElementById(`tg-inst-${tid}`);
                                const effectEl = document.getElementById(`tg-effect-${tid}`);
                                if (!instEl?.value) return;
                                try {
                                  await api.attachTransitionGuard(userId, tid, instEl.value, effectEl.value, 0);
                                  const g = await api.listTransitionGuards(userId, tid);
                                  setTransGuards(s => ({ ...s, [tid]: Array.isArray(g) ? g : [] }));
                                  instEl.value = '';
                                  toast('Guard attached', 'success');
                                } catch (err) { toast(err, 'error'); }
                              }}>Attach</button>
                            </div>
                          )}

                          {/* Signature Requirements section */}
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 14, marginBottom: 6 }}>
                            Signature Requirements
                          </div>

                          {sigReqs.length === 0 && (
                            <div className="settings-empty-row" style={{ fontSize: 11, marginBottom: 8 }}>No signatures required</div>
                          )}

                          {sigReqs.map(req => (
                            <div key={req.id} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '4px 6px', marginBottom: 2, borderRadius: 3,
                              background: 'rgba(255,255,255,.02)',
                              border: '1px solid var(--border)',
                              fontSize: 11,
                            }}>
                              <span style={{ color: 'var(--text)', flex: 1 }}>
                                {roles.find(r => (r.id || r.ID) === req.roleRequired)?.name || req.roleRequired}
                              </span>
                              {canWrite && (
                                <button className="panel-icon-btn" disabled={sigReqBusy} title="Remove requirement"
                                  onClick={() => removeSigReq(tid, req.id, id)}>
                                  <TrashIcon size={10} strokeWidth={2} color="var(--danger, #f87171)" />
                                </button>
                              )}
                            </div>
                          ))}

                          {canWrite && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                              <select className="field-input" style={{ flex: 1, fontSize: 11 }}
                                value={sigReqRole} onChange={e => setSigReqRole(e.target.value)}>
                                <option value="">Add required role…</option>
                                {roles.map(r => {
                                  const rid = r.id || r.ID;
                                  const used = sigReqs.some(sr => sr.roleRequired === rid);
                                  return <option key={rid} value={rid} disabled={used}>{r.name || r.NAME || rid}</option>;
                                })}
                              </select>
                              <button className="btn btn-sm" style={{ fontSize: 10 }} disabled={!sigReqRole || sigReqBusy}
                                onClick={() => addSigReq(tid, id)}>
                                Add
                              </button>
                            </div>
                          )}
                        </div>
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

/* ── Scope-driven permission matrix for one role ─────────────────── */
/**
 * Renders NODE and LIFECYCLE scope permission tables for a single role.
 * Fully introspection-driven: permissions, node types, and transitions
 * are loaded from backend; the UI adapts to any configuration change.
 */
function NodeTypeActionsPanel({ userId, projectSpaceId, roleId, canWrite, toast,
                                nodePerms, lcPerms, nodeTypes, transitions }) {
  // Bulk policies loaded per role — Set of "permCode|ntId|transId" keys
  const [policies, setPolicies] = useState(null);

  useEffect(() => {
    setPolicies(null);
    api.getRolePolicies(userId, roleId).then(rows => {
      const set = new Set();
      (Array.isArray(rows) ? rows : []).forEach(r => {
        const pc = r.permissionCode || r.permission_code;
        const nt = r.nodeTypeId     || r.node_type_id || '';
        const tr = r.transitionId   || r.transition_id || '';
        set.add(`${pc}|${nt}|${tr}`);
      });
      setPolicies(set);
    }).catch(() => setPolicies(new Set()));
  }, [userId, roleId, projectSpaceId]);

  const pKey = (permCode, ntId, transId) => `${permCode}|${ntId || ''}|${transId || ''}`;

  async function togglePerm(permCode, ntId, transId) {
    if (!canWrite || !policies) return;
    const key = pKey(permCode, ntId, transId);
    const isGranted = policies.has(key);
    setPolicies(s => { const n = new Set(s); isGranted ? n.delete(key) : n.add(key); return n; });
    try {
      if (isGranted) {
        await api.removeActionPermissionForSpace(userId, projectSpaceId, ntId, permCode, roleId, transId || null);
      } else {
        await api.addActionPermissionForSpace(userId, projectSpaceId, ntId, permCode, roleId, transId || null);
      }
    } catch (err) {
      setPolicies(s => { const n = new Set(s); isGranted ? n.add(key) : n.delete(key); return n; });
      toast(err, 'error');
    }
  }

  if (!policies) return <div style={{ padding: '4px 0', color: 'var(--muted)', fontSize: 11 }}>Loading policies…</div>;
  if (nodeTypes.length === 0) return <div className="settings-empty-row">No node types defined.</div>;

  const thStyle = { padding: '4px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', background: 'var(--bg2, var(--bg))', whiteSpace: 'nowrap', verticalAlign: 'bottom' };
  const tdStyle = { padding: '3px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' };

  function CheckCell({ permCode, ntId, transId }) {
    const isGranted = policies.has(pKey(permCode, ntId, transId));
    return (
      <td style={tdStyle}>
        <button className="panel-icon-btn" disabled={!canWrite}
          title={!canWrite ? 'Requires MANAGE_ROLES' : isGranted ? 'Revoke' : 'Grant'}
          onClick={() => togglePerm(permCode, ntId, transId)}
          style={{ margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, cursor: canWrite ? 'pointer' : 'default' }}>
          {isGranted
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>}
        </button>
      </td>
    );
  }

  function StickyNtCell({ ntId, ntName }) {
    return (
      <td style={{ ...tdStyle, textAlign: 'left', position: 'sticky', left: 0, background: 'var(--bg)', zIndex: 1, minWidth: 120 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{ntName}</div>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--muted)' }}>{ntId}</div>
      </td>
    );
  }

  return (
    <div>
      {/* ── NODE scope permissions ── */}
      {nodePerms.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Node Scope Permissions</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>Role + node type check.</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%' }}>
              <thead><tr>
                <th style={{ ...thStyle, textAlign: 'left', minWidth: 120, position: 'sticky', left: 0, zIndex: 1 }}>Node Type</th>
                {nodePerms.map(p => (
                  <th key={p.permissionCode} style={{ ...thStyle, minWidth: 72 }}>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--accent)', marginBottom: 1 }}>{p.permissionCode}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 400 }}>{p.displayName}</div>
                  </th>
                ))}
              </tr></thead>
              <tbody>
                {nodeTypes.map(nt => {
                  const ntId = nt.id || nt.ID, ntName = nt.name || nt.NAME || ntId;
                  return (
                    <tr key={ntId}>
                      <StickyNtCell ntId={ntId} ntName={ntName} />
                      {nodePerms.map(p => <CheckCell key={p.permissionCode} permCode={p.permissionCode} ntId={ntId} transId={null} />)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LIFECYCLE scope permissions ── */}
      {lcPerms.length > 0 && transitions.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Lifecycle Scope Permissions</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>Role + node type + transition check.</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%' }}>
              <thead><tr>
                <th style={{ ...thStyle, textAlign: 'left', minWidth: 120, position: 'sticky', left: 0, zIndex: 1 }}>Node Type</th>
                {transitions.map(t => (
                  <th key={t.id} style={{ ...thStyle, minWidth: 100 }}>
                    <div style={{ fontSize: 9, color: 'var(--text)', fontWeight: 500 }}>{t.label}</div>
                  </th>
                ))}
              </tr></thead>
              <tbody>
                {nodeTypes.filter(nt => nt.lifecycle_id || nt.lifecycleId).map(nt => {
                  const ntId = nt.id || nt.ID, ntName = nt.name || nt.NAME || ntId;
                  const lcId = nt.lifecycle_id || nt.lifecycleId;
                  return (
                    <tr key={ntId}>
                      <StickyNtCell ntId={ntId} ntName={ntName} />
                      {transitions.map(t => {
                        if (t.lifecycleId !== lcId) return <td key={t.id} style={tdStyle}><span style={{ color: 'var(--border)', fontSize: 11 }}>—</span></td>;
                        return <CheckCell key={t.id} permCode={lcPerms[0].permissionCode} ntId={ntId} transId={t.id} />;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {nodePerms.length === 0 && lcPerms.length === 0 && (
        <div className="settings-empty-row">No permissions configured.</div>
      )}
    </div>
  );
}

/* ── Project Spaces section ──────────────────────────────────────── */
export function ProjectSpacesSection({ userId, canWrite, toast }) {
  const [spaces,  setSpaces]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ name: '', description: '' });
  const [saving,  setSaving]  = useState(false);

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
      {spaces.length === 0 && <div className="settings-empty-row">No project spaces yet.</div>}
      {spaces.map(ps => {
        const id     = ps.id          || ps.ID;
        const name   = ps.name        || ps.NAME || id;
        const desc   = ps.description || ps.DESCRIPTION || '';
        const active = ps.active !== false && ps.ACTIVE !== false;
        return (
          <div key={id} className="settings-card" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <HexIcon size={13} color={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth={1.5} />
              <span className="settings-card-name" style={{ marginLeft: 4 }}>{name}</span>
              <span className="settings-card-id">{id}</span>
              {!active && <span className="settings-badge settings-badge--warn">Inactive</span>}
            </div>
            {desc && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, paddingLeft: 19 }}>{desc}</div>}
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
export function UsersRolesSection({ userId, canWrite, toast }) {
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

/* ── Permission Catalog (inside Access Rights) ─────────────────────── */
function PermissionCatalog({ permissions, userId, canWrite, toast, onReload }) {
  const [expanded, setExpanded]     = useState(false);
  const [modal, setModal]           = useState(null); // null | 'create' | permissionCode (edit)
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({ code: '', scope: 'GLOBAL', displayName: '', description: '', displayOrder: 0 });

  function openCreate() {
    setForm({ code: '', scope: 'GLOBAL', displayName: '', description: '', displayOrder: 0 });
    setModal('create');
  }
  function openEdit(p) {
    setForm({ code: p.permissionCode, scope: p.scope, displayName: p.displayName, description: p.description || '', displayOrder: 0 });
    setModal(p.permissionCode);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal === 'create') {
        if (!form.code.trim() || !form.displayName.trim()) { toast('Code and label required', 'error'); setSaving(false); return; }
        await api.createPermission(userId, form.code.trim().toUpperCase(), form.scope, form.displayName.trim(), form.description.trim() || null, form.displayOrder);
        toast('Permission created');
      } else {
        await api.updatePermission(userId, modal, form.displayName.trim(), form.description.trim() || null, form.displayOrder);
        toast('Permission updated');
      }
      setModal(null);
      onReload();
    } catch (e) { toast(e, 'error'); }
    setSaving(false);
  }

  const grouped = { GLOBAL: [], NODE: [], LIFECYCLE: [] };
  permissions.forEach(p => { if (grouped[p.scope]) grouped[p.scope].push(p); });

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 4 }}
        onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" />
                   : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
        <ShieldIcon size={13} color="var(--accent)" strokeWidth={1.5} />
        <span style={{ fontSize: 13, fontWeight: 700 }}>Permission Catalog</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>({permissions.length})</span>
        {canWrite && expanded && (
          <button className="btn btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={e => { e.stopPropagation(); openCreate(); }}>
            <PlusIcon size={11} /> Add
          </button>
        )}
      </div>

      {expanded && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
          {['GLOBAL', 'NODE', 'LIFECYCLE'].map(scope => {
            const items = grouped[scope] || [];
            if (items.length === 0) return null;
            return (
              <div key={scope}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
                  color: 'var(--muted)', padding: '6px 10px', background: 'rgba(0,0,0,.03)', borderBottom: '1px solid var(--border)' }}>
                  {scope} scope
                </div>
                {items.map(p => (
                  <div key={p.permissionCode} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
                    borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <code style={{ fontSize: 11, color: 'var(--accent)', minWidth: 180, fontWeight: 500 }}>{p.permissionCode}</code>
                    <span style={{ flex: 1, color: 'var(--text)' }}>{p.displayName}</span>
                    {p.description && (
                      <span style={{ fontSize: 10, color: 'var(--muted)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.description}
                      </span>
                    )}
                    {canWrite && (
                      <button className="panel-icon-btn" title="Edit" onClick={() => openEdit(p)}
                        style={{ flexShrink: 0, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <EditIcon size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <MetaModal title={modal === 'create' ? 'New Permission' : `Edit ${modal}`}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}
          saveLabel={modal === 'create' ? 'Create' : 'Save'}>
          {modal === 'create' && (
            <>
              <Field label="Permission Code">
                <input className="field-input" value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="e.g. MANAGE_EXPORTS" style={{ textTransform: 'uppercase', fontFamily: 'monospace' }} />
              </Field>
              <Field label="Scope">
                <select className="field-input" value={form.scope}
                  onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}>
                  <option value="GLOBAL">GLOBAL</option>
                  <option value="NODE">NODE</option>
                  <option value="LIFECYCLE">LIFECYCLE</option>
                </select>
              </Field>
            </>
          )}
          <Field label="Display Name">
            <input className="field-input" value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
              placeholder="e.g. Manage Exports" />
          </Field>
          <Field label="Description">
            <textarea className="field-input" rows={2} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description" />
          </Field>
        </MetaModal>
      )}
    </div>
  );
}

/* ── Access Rights section ──────────────────────────────────────────── */
export function AccessRightsSection({ userId, canWrite, toast }) {
  const [roles,       setRoles]       = useState(null);
  const [permissions, setPermissions] = useState([]); // full catalog {permissionCode, scope, displayName}
  const [nodeTypes,   setNodeTypes]   = useState([]);
  const [transitions, setTransitions] = useState([]); // {id, label, lifecycleId}
  const [spaces,      setSpaces]      = useState([]);
  const [expandedRole, setExpandedRole] = useState(null);
  const [expandedSpace, setExpandedSpace] = useState(null);
  // globalPerms: roleId → Set<permissionCode>
  const [globalPerms, setGlobalPerms] = useState({});

  // ── Load everything from backend introspection ──────────────────
  useEffect(() => {
    Promise.all([
      api.getRoles(userId),
      api.listPermissions(userId),
      api.getNodeTypes(userId),
      api.getLifecycles(userId),
      api.listProjectSpaces(userId),
    ]).then(async ([roleList, permList, ntList, lcList, spaceList]) => {
      setRoles(Array.isArray(roleList) ? roleList : []);
      setPermissions(Array.isArray(permList) ? permList : []);
      setNodeTypes(Array.isArray(ntList) ? ntList : []);
      setSpaces(Array.isArray(spaceList) ? spaceList : []);

      // Load transitions for each lifecycle
      const lcs = Array.isArray(lcList) ? lcList : [];
      const allTrans = [];
      await Promise.all(lcs.map(async lc => {
        const lcId = lc.id || lc.ID;
        const trans = await api.getLifecycleTransitions(userId, lcId).catch(() => []);
        (Array.isArray(trans) ? trans : []).forEach(t => {
          const fromState = t.from_state_name || t.fromStateName || '';
          const name = t.name || t.NAME || t.id;
          allTrans.push({
            id: t.id || t.ID,
            label: fromState ? `${fromState} → ${name}` : name,
            lifecycleId: lcId,
          });
        });
      }));
      setTransitions(allTrans);
    }).catch(() => { setRoles([]); });
  }, [userId]);

  async function reloadPermissions() {
    const permList = await api.listPermissions(userId).catch(() => []);
    setPermissions(Array.isArray(permList) ? permList : []);
  }

  // Split permissions by scope
  const globalPermsSet = permissions.filter(p => p.scope === 'GLOBAL');
  const nodePerms      = permissions.filter(p => p.scope === 'NODE');
  const lcPerms        = permissions.filter(p => p.scope === 'LIFECYCLE');

  async function toggleRole(roleId) {
    if (expandedRole === roleId) { setExpandedRole(null); setExpandedSpace(null); return; }
    setExpandedRole(roleId);
    setExpandedSpace(null);
    if (globalPerms[roleId] === undefined) {
      const rows = await api.getRoleGlobalPermissions(userId, roleId).catch(() => []);
      const granted = new Set((Array.isArray(rows) ? rows : []).map(r => r.permissionCode || r.permission_code));
      setGlobalPerms(s => ({ ...s, [roleId]: granted }));
    }
  }

  async function toggleGlobalPerm(roleId, permissionCode) {
    if (!canWrite) return;
    const isGranted = (globalPerms[roleId] || new Set()).has(permissionCode);
    setGlobalPerms(s => { const n = new Set(s[roleId] || []); isGranted ? n.delete(permissionCode) : n.add(permissionCode); return { ...s, [roleId]: n }; });
    try {
      if (isGranted) await api.removeRoleGlobalPermission(userId, roleId, permissionCode);
      else           await api.addRoleGlobalPermission(userId, roleId, permissionCode);
    } catch (e) {
      setGlobalPerms(s => { const n = new Set(s[roleId] || []); isGranted ? n.add(permissionCode) : n.delete(permissionCode); return { ...s, [roleId]: n }; });
      toast(e, 'error');
    }
  }

  if (roles === null) return <div className="settings-loading">Loading…</div>;
  if (roles.length === 0) return <div className="settings-empty-row">No roles defined. Create roles first in Users &amp; Roles.</div>;

  return (
    <div className="settings-list">
      {!canWrite && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
          Read-only — requires <code>MANAGE_ROLES</code>
        </div>
      )}

      <PermissionCatalog permissions={permissions} userId={userId}
        canWrite={canWrite} toast={toast} onReload={reloadPermissions} />

      <div className="settings-sub-label" style={{ marginBottom: 6 }}>Role Grants</div>
      {roles.map(role => {
        const isExp = expandedRole === role.id;
        const roleGlobPerms = globalPerms[role.id];

        return (
          <div key={role.id} className="settings-card">
            <div className="settings-card-hd" onClick={() => toggleRole(role.id)}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <span className="settings-card-chevron">
                {isExp ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" />
                       : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
              </span>
              <ShieldIcon size={13} color="var(--accent)" strokeWidth={1.5} />
              <span className="settings-card-name" style={{ marginLeft: 4 }}>{role.name}</span>
              <span className="settings-card-id">{role.id}</span>
              {role.description && (
                <span style={{ flex: 1, fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {role.description}
                </span>
              )}
            </div>

            {isExp && (
              <div className="settings-card-body">

                {/* ── GLOBAL scope permissions ─────────────────── */}
                {globalPermsSet.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div className="settings-sub-label">Global Scope Permissions</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>
                      Role-only check — no node type context.
                    </div>
                    {globalPermsSet.map(p => {
                      const isPending = roleGlobPerms === undefined;
                      const isGranted = !isPending && roleGlobPerms.has(p.permissionCode);
                      return (
                        <div key={p.permissionCode} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                          <button className="panel-icon-btn" disabled={isPending || !canWrite}
                            title={!canWrite ? 'Requires MANAGE_ROLES' : isGranted ? `Revoke from ${role.name}` : `Grant to ${role.name}`}
                            onClick={() => toggleGlobalPerm(role.id, p.permissionCode)}
                            style={{ flexShrink: 0, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isPending
                              ? <span style={{ color: 'var(--muted)', fontSize: 10 }}>…</span>
                              : isGranted
                                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
                                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>}
                          </button>
                          <code style={{ fontSize: 11, color: 'var(--accent)', minWidth: 168 }}>{p.permissionCode}</code>
                          <span style={{ fontSize: 11, color: 'var(--text)', flex: 1 }}>{p.displayName}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── NODE + LIFECYCLE scope permissions by project space ── */}
                {(nodePerms.length > 0 || lcPerms.length > 0) && spaces.length > 0 && (
                  <div>
                    <div className="settings-sub-label">Node &amp; Lifecycle Scope Permissions</div>
                    {spaces.map(ps => {
                      const psId = ps.id || ps.ID;
                      const psName = ps.name || ps.NAME || psId;
                      const isExpSp = expandedSpace === psId;
                      return (
                        <div key={psId} style={{ marginBottom: 4, border: '1px solid var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                          <div onClick={() => setExpandedSpace(isExpSp ? null : psId)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', cursor: 'pointer',
                                     background: isExpSp ? 'rgba(99,102,241,.06)' : 'transparent' }}>
                            {isExpSp ? <ChevronDownIcon size={11} strokeWidth={2} color="var(--muted)" />
                                     : <ChevronRightIcon size={11} strokeWidth={2} color="var(--muted)" />}
                            <HexIcon size={11} color="var(--accent)" strokeWidth={1.5} />
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{psName}</span>
                            <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'monospace' }}>{psId}</span>
                          </div>
                          {isExpSp && (
                            <div style={{ padding: '6px 10px', background: 'rgba(0,0,0,.02)' }}>
                              <NodeTypeActionsPanel
                                userId={userId} projectSpaceId={psId} roleId={role.id}
                                canWrite={canWrite} toast={toast}
                                nodePerms={nodePerms} lcPerms={lcPerms}
                                nodeTypes={nodeTypes} transitions={transitions}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
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

/* ── Algorithms Section (types + instances + parameters) ────────── */

function InstanceCard({ inst, algo, userId, canWrite, toast, onReload }) {
  const [expanded, setExpanded] = useState(false);
  const [params, setParams]    = useState(null);   // algorithm parameter defs
  const [values, setValues]    = useState(null);   // instance param values
  const [editing, setEditing]  = useState(false);
  const [nameVal, setNameVal]  = useState(inst.name || '');

  async function loadParams() {
    const [paramDefs, paramVals] = await Promise.all([
      api.listAlgorithmParameters(userId, algo.id),
      api.getInstanceParams(userId, inst.id),
    ]);
    setParams(Array.isArray(paramDefs) ? paramDefs : []);
    setValues(Array.isArray(paramVals) ? paramVals : []);
  }

  function toggle() {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (params === null) loadParams().catch(() => { setParams([]); setValues([]); });
  }

  async function saveName() {
    if (!nameVal.trim() || nameVal.trim() === inst.name) { setEditing(false); return; }
    try {
      await api.updateInstance(userId, inst.id, nameVal.trim());
      toast('Name updated', 'success');
      setEditing(false);
      onReload();
    } catch (e) { toast(e, 'error'); }
  }

  async function setParamValue(parameterId, value) {
    try {
      await api.setInstanceParam(userId, inst.id, parameterId, value);
      const updated = await api.getInstanceParams(userId, inst.id);
      setValues(Array.isArray(updated) ? updated : []);
      toast('Parameter saved', 'success');
    } catch (e) { toast(e, 'error'); }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete instance "${inst.name}"?\n\nAll guard/action attachments using this instance will be removed.`)) return;
    try {
      await api.deleteInstance(userId, inst.id);
      toast('Instance deleted', 'success');
      onReload();
    } catch (e) { toast(e, 'error'); }
  }

  return (
    <div style={{ marginBottom: 2 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 6px',
        borderRadius: expanded ? '4px 4px 0 0' : 4,
        background: 'rgba(255,255,255,.02)',
        border: '1px solid var(--border)',
        borderBottom: expanded ? '1px solid var(--border2)' : '1px solid var(--border)',
        cursor: 'pointer', fontSize: 12,
      }} onClick={toggle}>
        <span style={{ flexShrink: 0 }}>
          {expanded
            ? <ChevronDownIcon size={10} strokeWidth={2} color="var(--muted)" />
            : <ChevronRightIcon size={10} strokeWidth={2} color="var(--muted)" />}
        </span>
        {editing ? (
          <input className="field-input" autoFocus value={nameVal}
            onClick={e => e.stopPropagation()}
            onChange={e => setNameVal(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setEditing(false); setNameVal(inst.name || ''); } }}
            style={{ fontSize: 12, padding: '1px 4px', width: 200 }} />
        ) : (
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{inst.name || inst.id}</span>
        )}
        <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{inst.id}</span>
        <span style={{ flex: 1 }} />
        {canWrite && !editing && (
          <button className="panel-icon-btn" title="Rename" onClick={e => { e.stopPropagation(); setEditing(true); setNameVal(inst.name || ''); }}>
            <EditIcon size={10} strokeWidth={2} color="var(--accent)" />
          </button>
        )}
        {canWrite && (
          <button className="panel-icon-btn" title="Delete instance" onClick={e => { e.stopPropagation(); handleDelete(); }}>
            <TrashIcon size={10} strokeWidth={2} color="var(--danger, #f87171)" />
          </button>
        )}
      </div>

      {expanded && (
        <div style={{
          padding: '8px 10px',
          background: 'rgba(255,255,255,.01)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
        }}>
          {params === null && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Loading parameters…</div>}

          {params !== null && params.length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>No parameters defined for this algorithm</div>
          )}

          {params !== null && params.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                Parameters
              </div>
              {params.map(p => {
                const paramName  = p.paramName  || p.param_name;
                const paramLabel = p.paramLabel || p.param_label || paramName;
                const paramId    = p.id || p.ID;
                const dataType   = p.dataType || p.data_type || 'STRING';
                const required   = p.required === 1 || p.required === true;
                const defaultVal = p.defaultValue || p.default_value || '';
                const currentVal = values?.find(v => (v.paramName || v.param_name) === paramName);
                const currentValue = currentVal?.value ?? '';

                return (
                  <div key={paramId} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: 11,
                  }}>
                    <span style={{ minWidth: 120, color: 'var(--text)', fontWeight: 500 }}>
                      {paramLabel}{required ? ' *' : ''}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--mono)', minWidth: 50 }}>{dataType}</span>
                    {canWrite ? (
                      <input className="field-input"
                        style={{ flex: 1, fontSize: 11, padding: '2px 6px' }}
                        value={currentValue}
                        placeholder={defaultVal ? `default: ${defaultVal}` : ''}
                        onChange={e => {
                          const newVal = e.target.value;
                          setValues(prev => {
                            const copy = [...(prev || [])];
                            const idx = copy.findIndex(v => (v.paramName || v.param_name) === paramName);
                            if (idx >= 0) copy[idx] = { ...copy[idx], value: newVal };
                            else copy.push({ paramName, value: newVal });
                            return copy;
                          });
                        }}
                        onBlur={() => setParamValue(paramId, currentValue)}
                        onKeyDown={e => { if (e.key === 'Enter') setParamValue(paramId, currentValue); }}
                      />
                    ) : (
                      <span style={{ flex: 1, color: currentValue ? 'var(--text)' : 'var(--muted)' }}>
                        {currentValue || defaultVal || '—'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AlgorithmsSection({ userId, canWrite, toast }) {
  const [tab, setTab]               = useState('catalog');
  const [algorithms, setAlgorithms] = useState(null);
  const [instances, setInstances]   = useState(null);
  const [stats, setStats]           = useState(null);
  const [timeseries, setTimeseries] = useState(null);
  const [tsHours, setTsHours]       = useState(24);
  const [expandedAlgo, setExpandedAlgo] = useState(null);
  const [newInstName, setNewInstName] = useState('');
  const [algoParams, setAlgoParams]   = useState({});  // algorithmId → param[]

  const reload = useCallback(() => {
    Promise.all([
      api.listAlgorithms(userId),
      api.listAllInstances(userId),
    ]).then(([algs, insts]) => {
      setAlgorithms(Array.isArray(algs) ? algs : []);
      setInstances(Array.isArray(insts)  ? insts  : []);
    }).catch(() => {
      setAlgorithms([]); setInstances([]);
    });
  }, [userId]);

  const loadStats = useCallback(() => {
    api.getAlgorithmStats(userId)
      .then(s => setStats(Array.isArray(s) ? s : []))
      .catch(() => setStats([]));
  }, [userId]);

  const loadTimeseries = useCallback((hours) => {
    api.getAlgorithmTimeseries(userId, hours)
      .then(ts => setTimeseries(Array.isArray(ts) ? ts : []))
      .catch(() => setTimeseries([]));
  }, [userId]);

  useEffect(() => { reload(); }, [reload]);

  async function handleCreateInstance(algorithmId) {
    const name = newInstName.trim();
    if (!name) { toast('Instance name is required', 'error'); return; }
    try {
      await api.createInstance(userId, algorithmId, name);
      setNewInstName('');
      reload();
      toast('Instance created', 'success');
    } catch (e) { toast(e, 'error'); }
  }

  if (algorithms === null) return <div className="settings-loading">Loading…</div>;

  // Group algorithms by type
  const algosByType = {};
  algorithms.forEach(a => {
    const key = a.typeName || 'Unknown';
    if (!algosByType[key]) algosByType[key] = [];
    algosByType[key].push(a);
  });

  // Group instances by algorithm
  const instancesByAlgo = {};
  (instances || []).forEach(i => {
    if (!instancesByAlgo[i.algorithmId]) instancesByAlgo[i.algorithmId] = [];
    instancesByAlgo[i.algorithmId].push(i);
  });

  const tabStyle = (key) => ({
    padding: '6px 14px', fontSize: 12, cursor: 'pointer', background: 'none', border: 'none',
    color: tab === key ? 'var(--accent)' : 'var(--muted)',
    borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
  });

  return (
    <div>
      {!canWrite && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
          Read-only — requires <code>MANAGE_METAMODEL</code>
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        {[['catalog', 'Catalog'], ['stats', 'Execution Stats'], ['graph', 'Usage Graph']].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); if (key === 'stats' && !stats) loadStats(); if (key === 'graph' && !timeseries) loadTimeseries(tsHours); }} style={tabStyle(key)}>{label}</button>
        ))}
      </div>

      {/* ── Stats tab ── */}
      {tab === 'stats' && (() => {
        // Build code → typeName lookup from algorithms list
        const codeToType = {};
        (algorithms || []).forEach(a => { codeToType[a.code] = a.typeName || 'Unknown'; });
        // Group stats by algorithm type
        const statsByType = {};
        (stats || []).forEach(s => {
          const t = codeToType[s.algorithmCode] || 'Unknown';
          if (!statsByType[t]) statsByType[t] = [];
          statsByType[t].push(s);
        });
        // Sort each group by callCount desc
        Object.values(statsByType).forEach(arr => arr.sort((a, b) => (b.callCount || 0) - (a.callCount || 0)));

        return (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className="btn btn-xs btn-primary" onClick={loadStats}>Refresh</button>
              <button className="btn btn-xs btn-danger" onClick={async () => {
                await api.resetAlgorithmStats(userId).catch(() => {});
                setStats([]);
                toast('Stats reset', 'success');
              }}>Reset</button>
            </div>
            {stats === null && (
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Loading stats…</div>
            )}
            {stats && stats.length === 0 && (
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>No algorithm executions recorded yet</div>
            )}
            {stats && stats.length > 0 && Object.entries(statsByType).map(([typeName, typeStats]) => (
              <div key={typeName} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
                  {typeName}
                </div>
                <table className="settings-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Algorithm</th>
                      <th style={{ textAlign: 'right' }}>Calls</th>
                      <th style={{ textAlign: 'right' }}>Min (ms)</th>
                      <th style={{ textAlign: 'right' }}>Avg (ms)</th>
                      <th style={{ textAlign: 'right' }}>Max (ms)</th>
                      <th style={{ textAlign: 'right' }}>Total (ms)</th>
                      <th style={{ textAlign: 'right' }}>Pending</th>
                      <th>Last Flush</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeStats.map(s => (
                      <tr key={s.algorithmCode}>
                        <td><code>{s.algorithmCode}</code></td>
                        <td style={{ textAlign: 'right' }}>{s.callCount}</td>
                        <td style={{ textAlign: 'right' }}>{typeof s.minMs === 'number' ? s.minMs.toFixed(3) : '—'}</td>
                        <td style={{ textAlign: 'right' }}>{typeof s.avgMs === 'number' ? s.avgMs.toFixed(3) : '—'}</td>
                        <td style={{ textAlign: 'right' }}>{typeof s.maxMs === 'number' ? s.maxMs.toFixed(3) : '—'}</td>
                        <td style={{ textAlign: 'right' }}>{typeof s.totalMs === 'number' ? s.totalMs.toFixed(1) : '—'}</td>
                        <td style={{ textAlign: 'right', color: s.pendingFlush > 0 ? 'var(--warn)' : 'var(--muted)' }}>{s.pendingFlush || 0}</td>
                        <td style={{ fontSize: 10, color: 'var(--muted)' }}>{s.lastFlushed || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Graph tab ── */}
      {tab === 'graph' && (() => {
        const codeToType = {};
        (algorithms || []).forEach(a => { codeToType[a.code] = a.typeName || 'Unknown'; });

        // Build per-type aggregated timeseries: { typeName → [ { windowStart, calls, totalMs } ] }
        const windowMap = {}; // windowStart → { typeName → { calls, totalMs } }
        (timeseries || []).forEach(p => {
          const t = codeToType[p.algorithmCode] || 'Unknown';
          if (!windowMap[p.windowStart]) windowMap[p.windowStart] = {};
          if (!windowMap[p.windowStart][t]) windowMap[p.windowStart][t] = { calls: 0, totalMs: 0 };
          windowMap[p.windowStart][t].calls += p.callCount || 0;
          windowMap[p.windowStart][t].totalMs += p.totalMs || 0;
        });

        const windows = Object.keys(windowMap).sort();
        const types = [...new Set(Object.values(codeToType))].sort();

        // Also build global aggregated (all types combined)
        const globalSeries = windows.map(w => {
          let calls = 0, totalMs = 0;
          Object.values(windowMap[w] || {}).forEach(v => { calls += v.calls; totalMs += v.totalMs; });
          return { windowStart: w, calls, totalMs };
        });

        // Color palette for types
        const TYPE_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
        const typeColor = (i) => TYPE_COLORS[i % TYPE_COLORS.length];

        const SVG_W = 800, SVG_H = 200, PAD = { t: 20, r: 20, b: 40, l: 50 };
        const plotW = SVG_W - PAD.l - PAD.r;
        const plotH = SVG_H - PAD.t - PAD.b;

        function renderChart(series, label, color) {
          if (series.length === 0) return <div style={{ fontSize: 11, color: 'var(--muted)' }}>No data</div>;
          const maxCalls = Math.max(...series.map(s => s.calls), 1);

          return (
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 200, display: 'block' }}>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(f => {
                const y = PAD.t + plotH * (1 - f);
                return (
                  <g key={f}>
                    <line x1={PAD.l} x2={SVG_W - PAD.r} y1={y} y2={y} stroke="var(--border)" strokeWidth={0.5} />
                    <text x={PAD.l - 4} y={y + 3} textAnchor="end" fill="var(--muted)" fontSize={9}>{Math.round(maxCalls * f)}</text>
                  </g>
                );
              })}
              {/* Bars */}
              {series.map((s, i) => {
                const barW = Math.max(plotW / series.length - 1, 2);
                const x = PAD.l + (i / series.length) * plotW;
                const h = (s.calls / maxCalls) * plotH;
                const y = PAD.t + plotH - h;
                // Show time labels at intervals
                const showLabel = series.length < 20 || i % Math.ceil(series.length / 12) === 0;
                const timeStr = s.windowStart.replace('T', ' ').slice(11, 16);
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={barW} height={h} fill={color} opacity={0.8} rx={1}>
                      <title>{s.windowStart.replace('T', ' ').slice(0, 16)} — {s.calls} calls, {s.totalMs.toFixed(1)}ms</title>
                    </rect>
                    {showLabel && (
                      <text x={x + barW / 2} y={SVG_H - PAD.b + 14} textAnchor="middle" fill="var(--muted)" fontSize={8} transform={`rotate(-45, ${x + barW / 2}, ${SVG_H - PAD.b + 14})`}>{timeStr}</text>
                    )}
                  </g>
                );
              })}
              {/* Y axis label */}
              <text x={12} y={PAD.t + plotH / 2} textAnchor="middle" fill="var(--muted)" fontSize={9} transform={`rotate(-90, 12, ${PAD.t + plotH / 2})`}>Calls</text>
              {/* Title */}
              <text x={PAD.l} y={12} fill="var(--text)" fontSize={11} fontWeight={600}>{label}</text>
            </svg>
          );
        }

        return (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
              <button className="btn btn-xs btn-primary" onClick={() => loadTimeseries(tsHours)}>Refresh</button>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Window:</span>
              {[6, 12, 24, 48].map(h => (
                <button key={h} className="btn btn-xs" onClick={() => { setTsHours(h); loadTimeseries(h); }}
                  style={{ background: tsHours === h ? 'var(--accent)' : undefined, color: tsHours === h ? '#fff' : undefined }}>{h}h</button>
              ))}
            </div>
            {timeseries === null && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Loading…</div>}
            {timeseries && timeseries.length === 0 && <div style={{ fontSize: 11, color: 'var(--muted)' }}>No windowed data yet. Stats are bucketed every 15 minutes on flush.</div>}
            {timeseries && timeseries.length > 0 && (
              <div>
                {/* Global aggregate */}
                <div style={{ marginBottom: 20, background: 'var(--bg2)', borderRadius: 6, padding: 12 }}>
                  {renderChart(globalSeries, 'All Algorithms (aggregate)', '#3b82f6')}
                </div>
                {/* Per-type breakdown */}
                {types.map((typeName, ti) => {
                  const typeSeries = windows.map(w => ({
                    windowStart: w,
                    calls: windowMap[w]?.[typeName]?.calls || 0,
                    totalMs: windowMap[w]?.[typeName]?.totalMs || 0,
                  }));
                  const hasCalls = typeSeries.some(s => s.calls > 0);
                  if (!hasCalls) return null;
                  return (
                    <div key={typeName} style={{ marginBottom: 16, background: 'var(--bg2)', borderRadius: 6, padding: 12 }}>
                      {renderChart(typeSeries, typeName, typeColor(ti))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Catalog tab ── */}
      {tab === 'catalog' && <div className="settings-list">
          {Object.entries(algosByType).map(([typeName, algos]) => (
            <div key={typeName} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
                {typeName}
              </div>
              {algos.map(algo => {
                const isExp = expandedAlgo === algo.id;
                const algoInstances = instancesByAlgo[algo.id] || [];
                return (
                  <div key={algo.id} className="settings-card" style={{ marginBottom: 4 }}>
                    <div className="settings-card-hd" onClick={() => {
                      const nextId = isExp ? null : algo.id;
                      setExpandedAlgo(nextId); setNewInstName('');
                      if (nextId && !algoParams[nextId]) {
                        api.listAlgorithmParameters(userId, nextId)
                          .then(p => setAlgoParams(s => ({ ...s, [nextId]: Array.isArray(p) ? p : [] })))
                          .catch(() => setAlgoParams(s => ({ ...s, [nextId]: [] })));
                      }
                    }} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <span className="settings-card-chevron">
                        {isExp ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" /> : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
                      </span>
                      <WorkflowIcon size={13} color="var(--accent)" strokeWidth={1.5} />
                      <span className="settings-card-name" style={{ marginLeft: 4 }}>{algo.name}</span>
                      <span className="settings-card-id">{algo.code}</span>
                      <span style={{ flex: 1, fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 8 }}>
                        {algo.description || ''}
                      </span>
                      <span className="settings-badge" style={{ marginLeft: 8 }}>{algoInstances.length} instance{algoInstances.length !== 1 ? 's' : ''}</span>
                    </div>

                    {isExp && (
                      <div className="settings-card-body" style={{ padding: '8px 12px 12px 28px' }}>
                        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                          <span>Handler: <code style={{ color: 'var(--text)' }}>{algo.handlerRef}</code></span>
                          <span>Type: <code style={{ color: 'var(--text)' }}>{algo.typeName}</code></span>
                        </div>

                        {/* ── Parameter definitions ── */}
                        {(() => {
                          const pDefs = algoParams[algo.id];
                          if (pDefs === undefined) return null;
                          if (pDefs.length === 0) return null;
                          return (
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                                Parameter Schema
                              </div>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '3px 6px', color: 'var(--muted)', fontWeight: 600, fontSize: 10 }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '3px 6px', color: 'var(--muted)', fontWeight: 600, fontSize: 10 }}>Label</th>
                                    <th style={{ textAlign: 'left', padding: '3px 6px', color: 'var(--muted)', fontWeight: 600, fontSize: 10 }}>Type</th>
                                    <th style={{ textAlign: 'center', padding: '3px 6px', color: 'var(--muted)', fontWeight: 600, fontSize: 10 }}>Req.</th>
                                    <th style={{ textAlign: 'left', padding: '3px 6px', color: 'var(--muted)', fontWeight: 600, fontSize: 10 }}>Default</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pDefs.map(p => {
                                    const pName  = p.paramName  || p.param_name;
                                    const pLabel = p.paramLabel || p.param_label || pName;
                                    const pType  = p.dataType   || p.data_type || 'STRING';
                                    const pReq   = p.required === 1 || p.required === true;
                                    const pDef   = p.defaultValue || p.default_value || '';
                                    return (
                                      <tr key={p.id || pName} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '3px 6px', fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{pName}</td>
                                        <td style={{ padding: '3px 6px', color: 'var(--text)' }}>{pLabel}</td>
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

                        {algoInstances.length === 0 && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>No instances</div>}

                        {algoInstances.map(inst => (
                          <InstanceCard key={inst.id} inst={inst} algo={algo} userId={userId} canWrite={canWrite} toast={toast} onReload={reload} />
                        ))}

                        {canWrite && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                            <input className="field-input" style={{ flex: 1, fontSize: 11, padding: '3px 6px' }}
                              placeholder="New instance name…"
                              value={newInstName}
                              onChange={e => setNewInstName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleCreateInstance(algo.id); }} />
                            <button className="btn btn-sm" style={{ fontSize: 10 }}
                              disabled={!newInstName.trim()}
                              onClick={() => handleCreateInstance(algo.id)}>
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
        </div>}
    </div>
  );
}

/* ── Guards Section (action guards + NTA guards) ────────────────── */
export function GuardsSection({ userId, canWrite, toast }) {
  const [tab, setTab]               = useState('action-guards');
  const [actions, setActions]       = useState(null);
  const [instances, setInstances]   = useState(null);
  const [nodeTypes, setNodeTypes]   = useState(null);
  const [expandedAction, setExpandedAction] = useState(null);
  const [actionGuards, setActionGuards]     = useState({});
  const [actionWrappers, setActionWrappers] = useState({});

  useEffect(() => {
    Promise.all([
      api.getAllActions(userId),
      api.listAllInstances(userId),
      api.getNodeTypes(userId),
    ]).then(([acts, insts, nts]) => {
      setActions(Array.isArray(acts)     ? acts   : []);
      setInstances(Array.isArray(insts)  ? insts  : []);
      setNodeTypes(Array.isArray(nts)    ? nts    : []);
    }).catch(() => { setActions([]); setInstances([]); setNodeTypes([]); });
  }, [userId]);

  async function loadActionGuards(actionId) {
    const guards = await api.listActionGuards(userId, actionId).catch(() => []);
    setActionGuards(s => ({ ...s, [actionId]: Array.isArray(guards) ? guards : [] }));
  }

  async function loadActionWrappers(actionId) {
    const wrappers = await api.listActionWrappers(userId, actionId).catch(() => []);
    setActionWrappers(s => ({ ...s, [actionId]: Array.isArray(wrappers) ? wrappers : [] }));
  }

  function toggleAction(actionId) {
    if (expandedAction === actionId) { setExpandedAction(null); return; }
    setExpandedAction(actionId);
    if (!actionGuards[actionId]) loadActionGuards(actionId);
    if (!actionWrappers[actionId]) loadActionWrappers(actionId);
  }

  async function handleAttachActionGuard(actionId, instanceId) {
    try {
      await api.attachActionGuard(userId, actionId, instanceId, 'HIDE', 0);
      loadActionGuards(actionId);
      toast('Guard attached', 'success');
    } catch (e) { toast(e, 'error'); }
  }

  async function handleDetachActionGuard(actionId, guardId) {
    try {
      await api.detachActionGuard(userId, actionId, guardId);
      loadActionGuards(actionId);
      toast('Guard detached', 'success');
    } catch (e) { toast(e, 'error'); }
  }

  if (actions === null) return <div className="settings-loading">Loading…</div>;

  const tabStyle = (key) => ({
    padding: '6px 14px', fontSize: 12, cursor: 'pointer', background: 'none', border: 'none',
    color: tab === key ? 'var(--accent)' : 'var(--muted)',
    borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
  });

  return (
    <div>
      {!canWrite && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
          Read-only — requires <code>MANAGE_METAMODEL</code>
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        {[['action-guards', 'Action Guards'], ['nta-guards', 'Per Node Type'], ['nta-state-actions', 'State Action Overrides']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={tabStyle(key)}>{label}</button>
        ))}
      </div>

      {/* ── Action Guards tab ── */}
      {tab === 'action-guards' && (
        <div className="settings-list">
          {actions.map(action => {
            const isExp = expandedAction === action.id;
            const guards = actionGuards[action.id] || [];
            const aCode    = action.action_code    || action.actionCode;
            const aName    = action.display_name   || action.displayName || aCode;
            const aScope   = action.scope;
            const aDesc    = action.description;
            const aCat     = action.display_category || action.displayCategory;
            const managedWith = action.managed_with || action.managedWith || null;
            const isManaged   = !!managedWith;

            // Find manager action name for display
            const managerName = isManaged
              ? (actions.find(a => a.id === managedWith)?.display_name
                || actions.find(a => a.id === managedWith)?.displayName
                || managedWith)
              : null;

            // Find managed action names for manager hint
            const managedActions = !isManaged
              ? actions.filter(a => (a.managed_with || a.managedWith) === action.id)
                  .map(a => a.action_code || a.actionCode)
              : [];

            return (
              <div key={action.id} className="settings-card" style={{ marginBottom: 4 }}>
                <div className="settings-card-hd" onClick={() => !isManaged && toggleAction(action.id)}
                  style={{ display: 'flex', alignItems: 'center', cursor: isManaged ? 'default' : 'pointer' }}>
                  {!isManaged && (
                    <span className="settings-card-chevron">
                      {isExp ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" /> : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
                    </span>
                  )}
                  {isManaged && <span style={{ width: 13, display: 'inline-block', marginRight: 4 }} />}
                  <span className="settings-card-name" style={isManaged ? { color: 'var(--muted)' } : undefined}>{aName}</span>
                  {isManaged && (
                    <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--warning, orange)', fontStyle: 'italic' }}>
                      Managed by {managerName}
                    </span>
                  )}
                  {managedActions.length > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--accent)', fontStyle: 'italic' }}>
                      Manages: {managedActions.join(', ')}
                    </span>
                  )}
                  <span style={{ flex: 1 }} />
                  {/* Managed-with selector */}
                  {canWrite && (
                    <select
                      className="field-input"
                      style={{ fontSize: 10, width: 140, padding: '1px 4px', marginRight: 8 }}
                      value={managedWith || ''}
                      onClick={e => e.stopPropagation()}
                      onChange={async e => {
                        const newManager = e.target.value || null;
                        if (newManager && !window.confirm(
                          `Set ${aCode} as managed by ${actions.find(a => a.id === newManager)?.action_code || newManager}?\n\n` +
                          `All existing guards and permissions for ${aCode} will be removed.`
                        )) { e.target.value = managedWith || ''; return; }
                        try {
                          await api.setManagedWith(userId, action.id, newManager);
                          toast(newManager ? `${aCode} now managed` : `${aCode} now independent`, 'success');
                          // Reload actions
                          const acts = await api.getAllActions(userId);
                          setActions(Array.isArray(acts) ? acts : []);
                        } catch (err) { toast(err, 'error'); }
                      }}
                    >
                      <option value="">— Independent —</option>
                      {actions
                        .filter(a => a.id !== action.id && !(a.managed_with || a.managedWith))
                        .map(a => (
                          <option key={a.id} value={a.id}>{a.action_code || a.actionCode}</option>
                        ))
                      }
                    </select>
                  )}
                  <span className="settings-badge">{aScope}</span>
                </div>

                {isExp && !isManaged && (
                  <div className="settings-card-body" style={{ padding: '8px 12px 12px 28px' }}>
                    {/* Action details */}
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                      <span>ID: <code>{action.id}</code></span>
                      <span>Code: <code>{aCode}</code></span>
                      <span>Category: <span className="settings-badge">{aCat}</span></span>
                      {aDesc && <span style={{ flexBasis: '100%' }}>{aDesc}</span>}
                    </div>

                    {/* Guards list */}
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Guards</div>
                    {guards.length === 0 && <div style={{ fontSize: 11, color: 'var(--muted)' }}>No guards attached</div>}
                    {guards.length > 0 && (
                      <table className="settings-table" style={{ width: '100%', marginBottom: 8 }}>
                        <thead>
                          <tr><th>Guard</th><th>Effect</th><th>Type</th><th></th></tr>
                        </thead>
                        <tbody>
                          {guards.map(g => (
                            <tr key={g.id}>
                              <td>{g.algorithmName} <span style={{ fontSize: 10, color: 'var(--muted)' }}>({g.algorithmCode})</span></td>
                              <td><span className={`settings-badge ${g.effect === 'BLOCK' ? 'badge-warn' : ''}`}>{g.effect}</span></td>
                              <td style={{ fontSize: 11, color: 'var(--muted)' }}>{g.typeName}</td>
                              <td style={{ textAlign: 'right' }}>
                                {canWrite && (
                                  <button className="btn btn-xs btn-danger" onClick={() => handleDetachActionGuard(action.id, g.id)}>
                                    <TrashIcon size={10} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {canWrite && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <select id={`add-guard-${action.id}`} className="field-input" style={{ fontSize: 11, flex: 1 }}>
                          {(instances || []).map(i => (
                            <option key={i.id} value={i.id}>{i.algorithmName} — {i.name || i.id}</option>
                          ))}
                        </select>
                        <button className="btn btn-xs btn-primary" onClick={() => {
                          const sel = document.getElementById(`add-guard-${action.id}`);
                          if (sel?.value) handleAttachActionGuard(action.id, sel.value);
                        }}>
                          <PlusIcon size={10} /> Attach
                        </button>
                      </div>
                    )}

                    {/* Wrappers (middleware pipeline) */}
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, marginTop: 12 }}>Wrappers (middleware pipeline)</div>
                    {(() => {
                      const wrappers = actionWrappers[action.id] || [];
                      const wrapperInstances = (instances || []).filter(i => i.typeName === 'Action Wrapper');
                      return (<>
                        {wrappers.length === 0 && <div style={{ fontSize: 11, color: 'var(--muted)' }}>No wrappers — uses default (transaction wrapper)</div>}
                        {wrappers.length > 0 && (
                          <table className="settings-table" style={{ width: '100%', marginBottom: 8 }}>
                            <thead>
                              <tr><th>Order</th><th>Wrapper</th><th>Instance</th><th></th></tr>
                            </thead>
                            <tbody>
                              {wrappers.map(w => (
                                <tr key={w.id}>
                                  <td style={{ width: 50 }}>{w.executionOrder}</td>
                                  <td>{w.algorithmName} <span style={{ fontSize: 10, color: 'var(--muted)' }}>({w.algorithmCode})</span></td>
                                  <td style={{ fontSize: 11, color: 'var(--muted)' }}>{w.instanceName}</td>
                                  <td style={{ textAlign: 'right' }}>
                                    {canWrite && (
                                      <button className="btn btn-xs btn-danger" onClick={async () => {
                                        try {
                                          await api.detachActionWrapper(userId, action.id, w.id);
                                          loadActionWrappers(action.id);
                                          toast('Wrapper detached', 'success');
                                        } catch (e) { toast(e, 'error'); }
                                      }}>
                                        <TrashIcon size={10} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {canWrite && wrapperInstances.length > 0 && (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <select id={`add-wrapper-${action.id}`} className="field-input" style={{ fontSize: 11, flex: 1 }}>
                              {wrapperInstances.map(i => (
                                <option key={i.id} value={i.id}>{i.algorithmName} — {i.name || i.id}</option>
                              ))}
                            </select>
                            <input id={`add-wrapper-order-${action.id}`} type="number" className="field-input"
                              style={{ fontSize: 11, width: 60 }} placeholder="Order" defaultValue={(wrappers.length + 1) * 10} />
                            <button className="btn btn-xs btn-primary" onClick={async () => {
                              const sel = document.getElementById(`add-wrapper-${action.id}`);
                              const ord = document.getElementById(`add-wrapper-order-${action.id}`);
                              if (!sel?.value) return;
                              try {
                                await api.attachActionWrapper(userId, action.id, sel.value, parseInt(ord?.value || '0'));
                                loadActionWrappers(action.id);
                                toast('Wrapper attached', 'success');
                              } catch (e) { toast(e, 'error'); }
                            }}>
                              <PlusIcon size={10} /> Attach
                            </button>
                          </div>
                        )}
                      </>);
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Per Node Type tab ── */}
      {tab === 'nta-guards' && (
        <NodeActionGuardsSubSection userId={userId} canWrite={canWrite} toast={toast}
          nodeTypes={nodeTypes} instances={instances} />
      )}

      {/* ── State Action Overrides tab ── */}
      {tab === 'nta-state-actions' && (
        <NodeTypeStateActionOverridesSubSection userId={userId} canWrite={canWrite} toast={toast}
          nodeTypes={nodeTypes} instances={instances} />
      )}
    </div>
  );
}

/**
 * Per (node_type × action × transition?) guard attachments. Drills down from a
 * selected node type to the list of actions wired for it, then to the guards
 * attached per action (ADD or DISABLE).
 */
function NodeActionGuardsSubSection({ userId, canWrite, toast, nodeTypes, instances }) {
  const [selectedNt, setSelectedNt] = useState(null);
  const [actionRows, setActionRows] = useState([]);
  const [expanded,   setExpanded]   = useState(null); // composite key
  const [guards,     setGuards]     = useState({});   // key → guard[]

  const rowKey = (actionCode, transitionId) => `${actionCode}|${transitionId || ''}`;

  useEffect(() => {
    if (!selectedNt) { setActionRows([]); return; }
    api.getActionsForNodeType(userId, selectedNt)
      .then(rows => setActionRows(Array.isArray(rows) ? rows : []))
      .catch(() => setActionRows([]));
  }, [userId, selectedNt]);

  async function loadGuards(actionCode, transitionId) {
    const k = rowKey(actionCode, transitionId);
    const list = await api.listNodeActionGuards(userId, selectedNt, actionCode, transitionId).catch(() => []);
    setGuards(s => ({ ...s, [k]: Array.isArray(list) ? list : [] }));
  }

  function toggle(actionCode, transitionId) {
    const k = rowKey(actionCode, transitionId);
    if (expanded === k) { setExpanded(null); return; }
    setExpanded(k);
    if (!guards[k]) loadGuards(actionCode, transitionId);
  }

  async function handleAttach(actionCode, transitionId, instanceId) {
    try {
      await api.attachNodeActionGuard(userId, selectedNt, actionCode, transitionId, instanceId, 'BLOCK', 'ADD', 0);
      loadGuards(actionCode, transitionId);
      toast('Guard attached', 'success');
    } catch (e) { toast(e, 'error'); }
  }

  async function handleDetach(actionCode, transitionId, guardId) {
    try {
      await api.detachNodeActionGuard(userId, guardId);
      loadGuards(actionCode, transitionId);
      toast('Guard detached', 'success');
    } catch (e) { toast(e, 'error'); }
  }

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Node Type:</span>
        <select className="field-input" style={{ fontSize: 12, flex: 1, maxWidth: 300 }}
          value={selectedNt || ''} onChange={e => setSelectedNt(e.target.value || null)}>
          <option value="">Select a node type…</option>
          {(nodeTypes || []).map(nt => (
            <option key={nt.id} value={nt.id}>{nt.name}</option>
          ))}
        </select>
      </div>

      {selectedNt && actionRows.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>No actions configured for this node type</div>
      )}

      <div className="settings-list">
        {actionRows.map(a => {
          const code  = a.action_code    || a.ACTION_CODE;
          const tran  = a.transition_id  || a.TRANSITION_ID || null;
          const k     = rowKey(code, tran);
          const isExp = expanded === k;
          const rows  = guards[k] || [];
          const label = a.display_name || a.DISPLAY_NAME || code;
          return (
            <div key={k} className="settings-card" style={{ marginBottom: 4 }}>
              <div className="settings-card-hd" onClick={() => toggle(code, tran)}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <span className="settings-card-chevron">
                  {isExp ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" /> : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
                </span>
                <span className="settings-card-name">{label}</span>
                <span className="settings-badge" style={{ marginLeft: 6 }}>{a.status}</span>
                {tran && <span className="settings-card-id">→ {tran}</span>}
              </div>

              {isExp && (
                <div className="settings-card-body" style={{ padding: '8px 12px 12px 28px' }}>
                  {rows.length === 0 && <div style={{ fontSize: 11, color: 'var(--muted)' }}>No per-type guards (inherits action-level + transition-level guards)</div>}
                  <table className="settings-table" style={{ width: '100%', marginBottom: 8 }}>
                    <thead>
                      <tr><th>Guard</th><th>Effect</th><th>Override</th><th></th></tr>
                    </thead>
                    <tbody>
                      {rows.map(g => (
                        <tr key={g.id}>
                          <td>{g.algorithmName} <span style={{ fontSize: 10, color: 'var(--muted)' }}>({g.algorithmCode})</span></td>
                          <td><span className={`settings-badge ${g.effect === 'BLOCK' ? 'badge-warn' : ''}`}>{g.effect}</span></td>
                          <td><span className={`settings-badge ${g.overrideAction === 'DISABLE' ? 'badge-danger' : ''}`}>{g.overrideAction}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            {canWrite && (
                              <button className="btn btn-xs btn-danger" onClick={() => handleDetach(code, tran, g.id)}>
                                <TrashIcon size={10} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {canWrite && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select id={`add-nag-${k}`} className="field-input" style={{ fontSize: 11, flex: 1 }}>
                        {(instances || []).map(i => (
                          <option key={i.id} value={i.id}>{i.algorithmName} — {i.name || i.id}</option>
                        ))}
                      </select>
                      <button className="btn btn-xs btn-primary" onClick={() => {
                        const sel = document.getElementById(`add-nag-${k}`);
                        if (sel?.value) handleAttach(code, tran, sel.value);
                      }}>
                        <PlusIcon size={10} /> Attach
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Per-node-type state action overrides (tier 2).
 * Select a node type → shows lifecycle states → shows overrides (ADD/DISABLE) for each.
 */
function NodeTypeStateActionOverridesSubSection({ userId, canWrite, toast, nodeTypes, instances }) {
  const [selectedNt, setSelectedNt] = useState(null);
  const [states, setStates] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [overrides, setOverrides] = useState({}); // stateId → override[]

  // Load lifecycle states when node type changes
  useEffect(() => {
    if (!selectedNt) { setStates([]); setOverrides({}); return; }
    const nt = (nodeTypes || []).find(n => n.id === selectedNt);
    const lcId = nt?.lifecycle_id || nt?.lifecycleId;
    if (!lcId) { setStates([]); return; }
    api.getLifecycleStates(userId, lcId)
      .then(s => setStates(Array.isArray(s) ? s : []))
      .catch(() => setStates([]));
  }, [userId, selectedNt, nodeTypes]);

  async function loadOverrides(stateId) {
    const list = await api.listNodeTypeStateActions(userId, selectedNt, stateId).catch(() => []);
    setOverrides(s => ({ ...s, [stateId]: Array.isArray(list) ? list : [] }));
  }

  function toggle(stateId) {
    if (expanded === stateId) { setExpanded(null); return; }
    setExpanded(stateId);
    if (!overrides[stateId]) loadOverrides(stateId);
  }

  async function handleAttach(stateId, instanceId, trigger, mode, overrideAction) {
    try {
      await api.attachNodeTypeStateAction(userId, selectedNt, stateId, instanceId, trigger, mode, overrideAction, 0);
      loadOverrides(stateId);
      toast('State action override attached', 'success');
    } catch (e) { toast(e, 'error'); }
  }

  async function handleDetach(stateId, attachmentId) {
    try {
      await api.detachNodeTypeStateAction(userId, attachmentId);
      loadOverrides(stateId);
      toast('Override removed', 'success');
    } catch (e) { toast(e, 'error'); }
  }

  const stateActionInstances = (instances || []).filter(i => i.typeName === 'State Action');

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Node Type:</span>
        <select className="field-input" style={{ fontSize: 12, flex: 1, maxWidth: 300 }}
          value={selectedNt || ''} onChange={e => setSelectedNt(e.target.value || null)}>
          <option value="">Select a node type…</option>
          {(nodeTypes || []).map(nt => (
            <option key={nt.id} value={nt.id}>{nt.name}</option>
          ))}
        </select>
      </div>

      {selectedNt && states.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>No lifecycle states found</div>
      )}

      <div className="settings-list">
        {states.map(st => {
          const sid = st.id || st.ID;
          const sName = st.name || st.NAME || sid;
          const isExp = expanded === sid;
          const rows = overrides[sid] || [];
          return (
            <div key={sid} className="settings-card" style={{ marginBottom: 4 }}>
              <div className="settings-card-hd" onClick={() => toggle(sid)}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <span className="settings-card-chevron">
                  {isExp ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" /> : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
                </span>
                <span className="settings-card-name">{sName}</span>
                {rows.length > 0 && <span className="settings-badge" style={{ marginLeft: 6 }}>{rows.length}</span>}
              </div>

              {isExp && (
                <div className="settings-card-body" style={{ padding: '8px 12px 12px 28px' }}>
                  {rows.length === 0 && <div style={{ fontSize: 11, color: 'var(--muted)' }}>No overrides — inherits lifecycle-level state actions</div>}
                  {rows.length > 0 && (
                    <table className="settings-table" style={{ width: '100%', marginBottom: 8 }}>
                      <thead>
                        <tr><th>Action</th><th>Trigger</th><th>Mode</th><th>Override</th><th></th></tr>
                      </thead>
                      <tbody>
                        {rows.map(o => (
                          <tr key={o.id}>
                            <td>{o.algorithmName} <span style={{ fontSize: 10, color: 'var(--muted)' }}>({o.algorithmCode})</span></td>
                            <td><span className="settings-badge" style={{
                              background: o.trigger === 'ON_ENTER' ? 'rgba(52,211,153,.15)' : 'rgba(248,113,113,.15)',
                              color: o.trigger === 'ON_ENTER' ? '#34d399' : '#f87171', fontSize: 9,
                            }}>{o.trigger}</span></td>
                            <td><span className="settings-badge" style={{
                              background: o.executionMode === 'TRANSACTIONAL' ? 'rgba(167,139,250,.15)' : 'rgba(250,204,21,.15)',
                              color: o.executionMode === 'TRANSACTIONAL' ? '#a78bfa' : '#facc15', fontSize: 9,
                            }}>{o.executionMode}</span></td>
                            <td><span className={`settings-badge ${o.overrideAction === 'DISABLE' ? 'badge-danger' : ''}`}>{o.overrideAction}</span></td>
                            <td style={{ textAlign: 'right' }}>
                              {canWrite && (
                                <button className="btn btn-xs btn-danger" onClick={() => handleDetach(sid, o.id)}>
                                  <TrashIcon size={10} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {canWrite && stateActionInstances.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <select id={`sa-override-inst-${sid}`} className="field-input" style={{ fontSize: 11, flex: 1, minWidth: 150 }}>
                        {stateActionInstances.map(i => (
                          <option key={i.id} value={i.id}>{i.algorithmName || i.name} — {i.name}</option>
                        ))}
                      </select>
                      <select id={`sa-override-trigger-${sid}`} className="field-input" style={{ width: 90, fontSize: 11 }} defaultValue="ON_ENTER">
                        <option value="ON_ENTER">ON_ENTER</option>
                        <option value="ON_EXIT">ON_EXIT</option>
                      </select>
                      <select id={`sa-override-mode-${sid}`} className="field-input" style={{ width: 130, fontSize: 11 }} defaultValue="TRANSACTIONAL">
                        <option value="TRANSACTIONAL">TRANSACTIONAL</option>
                        <option value="POST_COMMIT">POST_COMMIT</option>
                      </select>
                      <select id={`sa-override-action-${sid}`} className="field-input" style={{ width: 90, fontSize: 11 }} defaultValue="ADD">
                        <option value="ADD">ADD</option>
                        <option value="DISABLE">DISABLE</option>
                      </select>
                      <button className="btn btn-xs btn-primary" onClick={() => {
                        const inst = document.getElementById(`sa-override-inst-${sid}`)?.value;
                        const trig = document.getElementById(`sa-override-trigger-${sid}`)?.value;
                        const mode = document.getElementById(`sa-override-mode-${sid}`)?.value;
                        const act  = document.getElementById(`sa-override-action-${sid}`)?.value;
                        if (inst) handleAttach(sid, inst, trig, mode, act);
                      }}>
                        <PlusIcon size={10} /> Attach
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main SettingsPage ───────────────────────────────────────────── */
export default function SettingsPage({ userId, projectSpaceId, activeSection, onSectionChange, toast }) {
  const [globalPerms, setGlobalPerms] = useState(null); // null = loading; Set<string> once loaded

  useEffect(() => {
    api.getMyGlobalPermissions(userId)
      .then(codes => {
        const perms = new Set(Array.isArray(codes) ? codes : []);
        setGlobalPerms(perms);
        const first = SECTIONS.find(s => true); // all sections visible
        onSectionChange(first?.key ?? null);
      })
      .catch(() => {
        setGlobalPerms(new Set());
        onSectionChange('api-playground');
      });
  }, [userId, projectSpaceId]);

  // canWrite(permission) = true if user has the given permission (or permission is null = open)
  function canWrite(permission) {
    if (globalPerms === null) return false;
    if (permission === null) return true;
    return globalPerms.has(permission);
  }

  const activeSection_obj = SECTIONS.find(s => s.key === activeSection);

  return (
    <div className="settings-content">
      <div className="settings-content-hd">
        <span className="settings-content-title">{activeSection_obj?.label}</span>
      </div>
      {activeSection === null ? (
        <div style={{ padding: '32px 24px', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
      ) : activeSection === 'api-playground' ? (
        <ApiPlayground userId={userId} projectSpaceId={projectSpaceId} />
      ) : activeSection === 'user-manual' ? (
        <UserManual />
      ) : (
        <div className="settings-content-body">
          {activeSection === 'node-types'    && <NodeTypesSection    userId={userId} canWrite={canWrite('MANAGE_METAMODEL')} toast={toast} />}
          {activeSection === 'lifecycles'    && <LifecyclesSection   userId={userId} canWrite={canWrite('MANAGE_METAMODEL')} toast={toast} />}
          {activeSection === 'proj-spaces'   && <ProjectSpacesSection userId={userId} canWrite={canWrite('MANAGE_ROLES')} toast={toast} />}
          {activeSection === 'users-roles'   && <UsersRolesSection   userId={userId} canWrite={canWrite('MANAGE_ROLES')} toast={toast} />}
          {activeSection === 'access-rights' && <AccessRightsSection userId={userId} canWrite={canWrite('MANAGE_ROLES')} toast={toast} />}
          {activeSection === 'algorithms'    && <AlgorithmsSection    userId={userId} canWrite={canWrite('MANAGE_METAMODEL')} toast={toast} />}
          {activeSection === 'guards'        && <GuardsSection        userId={userId} canWrite={canWrite('MANAGE_METAMODEL')} toast={toast} />}
        </div>
      )}
    </div>
  );
}
