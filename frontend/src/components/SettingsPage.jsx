import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api, speApi } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { getTheme, setTheme as applyTheme } from '../theme';

import {
  LayersIcon, LifecycleIcon, CloseIcon,
  ChevronRightIcon, ChevronDownIcon, HexIcon, TerminalIcon, PlusIcon,
  EditIcon, TrashIcon, UsersIcon, UserIcon, ShieldIcon, BookIcon, WorkflowIcon, CpuIcon, CopyIcon,
} from './Icons';
import { NODE_ICONS, NODE_ICON_NAMES } from './Icons';
import ApiPlayground from './ApiPlayground';
import UserManual from './UserManual';
import LifecycleDiagram from './LifecycleDiagram';
import { registerSettingsPlugin, lookupSettingsPlugin } from '../services/settingsPlugins';
import { ActionsCatalogSection } from './ActionsCatalogSection';
import { AlgorithmSection }      from './AlgorithmSection';


/* ── Spring Modulith module badge ─────────────────────────────────── */
// Deterministic color per module name — stable across reloads.
function moduleColor(name) {
  if (!name) return { fg: 'var(--muted2)', bg: 'rgba(120,130,150,.14)' };
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  const hue = h % 360;
  return { fg: `hsl(${hue},70%,72%)`, bg: `hsl(${hue},55%,22%)` };
}
export function ModuleBadge({ module }) {
  if (!module) return null;
  const c = moduleColor(module);
  return (
    <span
      title={`Spring Modulith module: ${module}`}
      style={{
        display: 'inline-block', padding: '1px 7px', borderRadius: 10,
        fontSize: 9, fontWeight: 700, letterSpacing: '.06em',
        fontFamily: 'var(--mono)', textTransform: 'uppercase',
        background: c.bg, color: c.fg,
        border: `1px solid ${c.fg}33`,
        verticalAlign: 'middle',
      }}
    >
      {module}
    </span>
  );
}

/* ── My Profile Section ──────────────────────────────────────────── */
function MyProfileSection({ userId, canWrite, toast }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getUser(userId, userId).then(setProfile).catch(() => {});
  }, [userId]);

  function startEdit() {
    setForm({ displayName: profile?.displayName || '', email: profile?.email || '' });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateUser(userId, userId, form.displayName.trim(), form.email.trim());
      const updated = await api.getUser(userId, userId);
      setProfile(updated);
      setEditing(false);
      toast('Profile updated', 'success');
    } catch (e) {
      toast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <div className="settings-loading">Loading…</div>;

  return (
    <div className="settings-list">
      <div className="settings-card" style={{ padding: '14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <UserIcon size={15} color="var(--accent)" strokeWidth={1.5} />
          <span className="settings-card-name" style={{ fontSize: 13 }}>{profile.username}</span>
          {profile.isAdmin && <span className="settings-badge settings-badge--accent">Admin</span>}
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Display Name">
              <input className="field-input" autoFocus value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} />
            </Field>
            <Field label="Email">
              <input className="field-input" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </Field>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 23 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Display Name</div>
              <div style={{ fontSize: 12, color: 'var(--text)' }}>{profile.displayName || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Email</div>
              <div style={{ fontSize: 12, color: 'var(--text)' }}>{profile.email || '—'}</div>
            </div>
            {canWrite && (
              <div style={{ marginTop: 4 }}>
                <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={startEdit}>
                  <EditIcon size={11} strokeWidth={2} />
                  Edit
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ThemeSelector />
    </div>
  );
}

/* ── Theme Selector ──────────────────────────────────────────────── */
const THEME_OPTIONS = [
  { value: 'dark',   label: 'Dark',   icon: '●' },
  { value: 'light',  label: 'Light',  icon: '○' },
  { value: 'system', label: 'System', icon: '◐' },
];

function ThemeSelector() {
  const [current, setCurrent] = useState(getTheme);

  function handleChange(value) {
    setCurrent(value);
    applyTheme(value);
  }

  return (
    <div className="settings-card" style={{ padding: '14px 14px' }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>Theme</div>
      <div className="theme-selector">
        {THEME_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`theme-option${current === opt.value ? ' theme-option--active' : ''}`}
            onClick={() => handleChange(opt.value)}
          >
            <span className="theme-option-icon">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const LINK_POLICIES      = ['VERSION_TO_MASTER', 'VERSION_TO_VERSION'];
const NUMBERING_SCHEMES  = ['ALPHA_NUMERIC'];
const VERSION_POLICIES   = ['NONE', 'ITERATE', 'RELEASE'];
const DATA_TYPES         = ['STRING', 'NUMBER', 'DATE', 'BOOLEAN', 'ENUM'];
const WIDGET_TYPES   = ['TEXT', 'TEXTAREA', 'DROPDOWN', 'DATE_PICKER', 'CHECKBOX'];
const ACTION_TYPES   = ['NONE', 'REQUIRE_SIGNATURE'];
const VERSION_STRATS = ['NONE', 'ITERATE', 'REVISE'];

/* ── Enum definition picker (fetches list, shows dropdown + value preview) ── */
function EnumPicker({ userId, enumDefinitionId, onChange }) {
  const [enums, setEnums] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    api.getEnums(userId).then(d => setEnums(Array.isArray(d) ? d : [])).catch(() => setEnums([]));
  }, [userId]);

  useEffect(() => {
    if (!enumDefinitionId) { setPreview(null); return; }
    api.getEnumValues(userId, enumDefinitionId)
      .then(d => setPreview(Array.isArray(d) ? d : []))
      .catch(() => setPreview([]));
  }, [userId, enumDefinitionId]);

  if (enums === null) return <Field label="Enumeration"><span style={{ fontSize: 12, color: 'var(--muted)' }}>Loading…</span></Field>;

  return (
    <>
      <Field label="Enumeration *">
        <select className="field-input" value={enumDefinitionId || ''} onChange={e => onChange(e.target.value || null)}>
          <option value="">Select an enumeration…</option>
          {enums.map(en => (
            <option key={en.id} value={en.id}>{en.name} ({en.valueCount} value{en.valueCount !== 1 ? 's' : ''})</option>
          ))}
        </select>
      </Field>
      {preview && preview.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {preview.map(v => (
            <span key={v.id} style={{
              display: 'inline-block',
              background: 'var(--accent-dim, #e0e7ff)', color: 'var(--fg)',
              padding: '2px 8px', borderRadius: 4, fontSize: 11,
            }}>{v.label || v.value}</span>
          ))}
        </div>
      )}
    </>
  );
}

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
function AttrFields({ form, setForm, autoFocusName = true, hideAsName = false, userId }) {
  const dt = form.dataType || 'STRING';
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
          <select className="field-input" value={dt} onChange={e => setForm(f => ({ ...f, dataType: e.target.value }))}>
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
      <Field label="Default value">
        <input className="field-input" value={form.defaultValue || ''} onChange={e => setForm(f => ({ ...f, defaultValue: e.target.value }))} placeholder="Optional" />
      </Field>
      <Field label="Validation regex">
        <input className="field-input" value={form.namingRegex || ''} onChange={e => setForm(f => ({ ...f, namingRegex: e.target.value }))} placeholder="e.g. ^[A-Z]{3}-[0-9]+$" />
      </Field>
      {dt !== 'ENUM' && (
        <Field label="Allowed values (comma-separated)">
          <input className="field-input" value={form.allowedValues || ''} onChange={e => setForm(f => ({ ...f, allowedValues: e.target.value }))} placeholder="e.g. Low,Medium,High" />
        </Field>
      )}
      <Field label="Tooltip">
        <input className="field-input" value={form.tooltip || ''} onChange={e => setForm(f => ({ ...f, tooltip: e.target.value }))} placeholder="Hint shown next to the field" />
      </Field>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={!!form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} />
          Required field
        </label>
        {!hideAsName && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={!!form.asName} onChange={e => setForm(f => ({ ...f, asName: e.target.checked }))} />
            Use as display name <span style={{ color: 'var(--accent)', marginLeft: 2 }}>★</span>
          </label>
        )}
      </div>
      {dt === 'ENUM' && userId && (
        <EnumPicker userId={userId} enumDefinitionId={form.enumDefinitionId || null}
          onChange={v => setForm(f => ({ ...f, enumDefinitionId: v }))} />
      )}
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
      enumDefinitionId: a.enum_definition_id || a.ENUM_DEFINITION_ID || null,
      displaySection: a.display_section || a.DISPLAY_SECTION || '',
      displayOrder:   a.display_order  ?? a.DISPLAY_ORDER  ?? '',
      defaultValue:   a.default_value  || a.DEFAULT_VALUE  || '',
      namingRegex:    a.naming_regex   || a.NAMING_REGEX   || '',
      allowedValues:  a.allowed_values || a.ALLOWED_VALUES || '',
      tooltip:        a.tooltip        || a.TOOLTIP        || '',
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
        enumDefinitionId: editForm.dataType === 'ENUM' ? (editForm.enumDefinitionId || null) : null,
        displaySection: editForm.displaySection || null,
        displayOrder:   editForm.displayOrder !== '' ? Number(editForm.displayOrder) : 0,
        defaultValue:   editForm.defaultValue?.trim() || null,
        namingRegex:    editForm.namingRegex?.trim() || null,
        allowedValues:  editForm.dataType !== 'ENUM' ? (editForm.allowedValues?.trim() || null) : null,
        tooltip:        editForm.tooltip?.trim() || null,
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
        enumDefinitionId: addingForm.dataType === 'ENUM' ? (addingForm.enumDefinitionId || null) : null,
        displaySection: addingForm.displaySection || null,
        displayOrder:   addingForm.displayOrder !== '' ? Number(addingForm.displayOrder) : 0,
        defaultValue:   addingForm.defaultValue?.trim() || null,
        namingRegex:    addingForm.namingRegex?.trim() || null,
        allowedValues:  addingForm.dataType !== 'ENUM' ? (addingForm.allowedValues?.trim() || null) : null,
        tooltip:        addingForm.tooltip?.trim() || null,
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
          {(editForm.dataType === 'ENUM') && (
            <EnumPicker userId={userId} enumDefinitionId={editForm.enumDefinitionId || null}
              onChange={v => setEditForm(f => ({ ...f, enumDefinitionId: v }))} />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
            <Field label="Section">
              <input className="field-input" value={editForm.displaySection || ''} onChange={e => setEditForm(f => ({ ...f, displaySection: e.target.value }))} />
            </Field>
            <Field label="Order">
              <input className="field-input" type="number" min="0" value={editForm.displayOrder ?? ''} onChange={e => setEditForm(f => ({ ...f, displayOrder: e.target.value }))} />
            </Field>
          </div>
          <Field label="Default value">
            <input className="field-input" value={editForm.defaultValue || ''} onChange={e => setEditForm(f => ({ ...f, defaultValue: e.target.value }))} placeholder="Optional" />
          </Field>
          <Field label="Validation regex">
            <input className="field-input" value={editForm.namingRegex || ''} onChange={e => setEditForm(f => ({ ...f, namingRegex: e.target.value }))} placeholder="e.g. ^[A-Z]{3}-[0-9]+$" />
          </Field>
          {editForm.dataType !== 'ENUM' && (
            <Field label="Allowed values (comma-separated)">
              <input className="field-input" value={editForm.allowedValues || ''} onChange={e => setEditForm(f => ({ ...f, allowedValues: e.target.value }))} placeholder="e.g. Low,Medium,High" />
            </Field>
          )}
          <Field label="Tooltip">
            <input className="field-input" value={editForm.tooltip || ''} onChange={e => setEditForm(f => ({ ...f, tooltip: e.target.value }))} placeholder="Hint shown next to the field" />
          </Field>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, marginTop: 4 }}>
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
          {(addingForm.dataType === 'ENUM') && (
            <EnumPicker userId={userId} enumDefinitionId={addingForm.enumDefinitionId || null}
              onChange={v => setAddingForm(f => ({ ...f, enumDefinitionId: v }))} />
          )}
          <input className="field-input" placeholder="Default value (optional)" value={addingForm.defaultValue || ''} onChange={e => setAddingForm(f => ({ ...f, defaultValue: e.target.value }))} />
          <input className="field-input" placeholder="Validation regex (optional, e.g. ^[A-Z]+$)" value={addingForm.namingRegex || ''} onChange={e => setAddingForm(f => ({ ...f, namingRegex: e.target.value }))} />
          {addingForm.dataType !== 'ENUM' && (
            <input className="field-input" placeholder="Allowed values comma-separated (optional)" value={addingForm.allowedValues || ''} onChange={e => setAddingForm(f => ({ ...f, allowedValues: e.target.value }))} />
          )}
          <input className="field-input" placeholder="Tooltip (optional)" value={addingForm.tooltip || ''} onChange={e => setAddingForm(f => ({ ...f, tooltip: e.target.value }))} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: 12 }}>
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
  const [sources,    setSources]    = useState([]);
  const [modal,      setModal]      = useState(null); // { type, ctx }
  const [form,       setForm]       = useState({});
  const [saving,     setSaving]     = useState(false);

  function loadTypes() {
    return api.getNodeTypes(userId).then(d => setTypes(Array.isArray(d) ? d : []));
  }

  useEffect(() => {
    loadTypes().finally(() => setLoading(false));
    api.getLifecycles(userId).then(d => setLifecycles(Array.isArray(d) ? d : []));
    api.getSourcesAdmin(userId).then(d => setSources(Array.isArray(d) ? d : []));
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
          enumDefinitionId: form.dataType === 'ENUM' ? (form.enumDefinitionId || null) : null,
          displaySection: form.displaySection?.trim() || null,
          displayOrder:   form.displayOrder !== '' ? Number(form.displayOrder) : 0,
          defaultValue:   form.defaultValue?.trim() || null,
          namingRegex:    form.namingRegex?.trim() || null,
          allowedValues:  form.dataType !== 'ENUM' ? (form.allowedValues?.trim() || null) : null,
          tooltip:        form.tooltip?.trim() || null,
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
          enumDefinitionId: form.dataType === 'ENUM' ? (form.enumDefinitionId || null) : null,
          displaySection: form.displaySection?.trim() || null,
          displayOrder:   form.displayOrder !== '' ? Number(form.displayOrder) : 0,
          defaultValue:   form.defaultValue?.trim() || null,
          namingRegex:    form.namingRegex?.trim() || null,
          allowedValues:  form.dataType !== 'ENUM' ? (form.allowedValues?.trim() || null) : null,
          tooltip:        form.tooltip?.trim() || null,
        });
        const updated = await api.getNodeTypeAttributes(userId, ctx.nodeTypeId);
        setAttrs(s => ({ ...s, [ctx.nodeTypeId]: Array.isArray(updated) ? updated : [] }));

      } else if (type === 'create-link') {
        const tgtSrc = form.targetSourceId || 'SELF';
        const tgtType = tgtSrc === 'SELF' ? (form.targetNodeTypeId || null) : (form.targetType || null);
        await api.createLinkType(userId, {
          name:             form.name?.trim(),
          sourceNodeTypeId: ctx.nodeTypeId,
          targetSourceId:   tgtSrc,
          targetType:       tgtType,
          linkPolicy:       form.linkPolicy || 'VERSION_TO_MASTER',
          minCardinality:   Number(form.minCardinality) || 0,
          maxCardinality:   form.maxCardinality !== '' ? Number(form.maxCardinality) : null,
          color:            form.color || null,
        });
        const updated = await api.getNodeTypeLinkTypes(userId, ctx.nodeTypeId);
        setLinks(s => ({ ...s, [ctx.nodeTypeId]: Array.isArray(updated) ? updated : [] }));

      } else if (type === 'edit-link') {
        const eSrc = form.targetSourceId || 'SELF';
        const eType = eSrc === 'SELF' ? (form.targetNodeTypeId || null) : (form.targetType || null);
        await api.updateLinkType(userId, ctx.linkTypeId, {
          name:             form.name?.trim(),
          description:      form.description?.trim() || null,
          linkPolicy:       form.linkPolicy || 'VERSION_TO_MASTER',
          minCardinality:   Number(form.minCardinality) || 0,
          maxCardinality:   form.maxCardinality !== '' && form.maxCardinality != null ? Number(form.maxCardinality) : null,
          color:            form.color || null,
          targetSourceId:   eSrc,
          targetNodeTypeId: eType,
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
            <AttrFields form={form} setForm={setForm} userId={userId} />
          )}

          {/* ── Edit attribute ── */}
          {modal.type === 'edit-attr' && (
            <AttrFields form={form} setForm={setForm} autoFocusName={false} userId={userId} />
          )}

          {/* ── Create link type ── */}
          {modal.type === 'create-link' && <>
            <Field label="Link Name *">
              <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. composed_of" />
            </Field>
            <Field label="Target Source">
              <select className="field-input" value={form.targetSourceId || 'SELF'} onChange={e => setForm(f => ({ ...f, targetSourceId: e.target.value, targetNodeTypeId: '', targetType: '' }))}>
                <option value="SELF">Self (PSM)</option>
                {sources.filter(s => (s.id || s.ID) !== 'SELF').map(s => { const sid = s.id || s.ID; return <option key={sid} value={sid}>{s.name || s.NAME || sid}</option>; })}
              </select>
            </Field>
            {(!form.targetSourceId || form.targetSourceId === 'SELF') ? (
              <Field label="Target Node Type">
                <select className="field-input" value={form.targetNodeTypeId || ''} onChange={e => setForm(f => ({ ...f, targetNodeTypeId: e.target.value }))}>
                  <option value="">Any</option>
                  {types.map(t => { const tid = t.id || t.ID; return <option key={tid} value={tid}>{t.name || t.NAME || tid}</option>; })}
                </select>
              </Field>
            ) : (
              <Field label="Target Type">
                <input className="field-input" value={form.targetType || ''} onChange={e => setForm(f => ({ ...f, targetType: e.target.value }))} placeholder="Type name in source" />
              </Field>
            )}
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
            <Field label="Target Source">
              <select className="field-input" value={form.targetSourceId || 'SELF'} onChange={e => setForm(f => ({ ...f, targetSourceId: e.target.value, targetNodeTypeId: '', targetType: '' }))}>
                <option value="SELF">Self (PSM)</option>
                {sources.filter(s => (s.id || s.ID) !== 'SELF').map(s => { const sid = s.id || s.ID; return <option key={sid} value={sid}>{s.name || s.NAME || sid}</option>; })}
              </select>
            </Field>
            {(!form.targetSourceId || form.targetSourceId === 'SELF') ? (
              <Field label="Target Node Type">
                <select className="field-input" value={form.targetNodeTypeId || ''} onChange={e => setForm(f => ({ ...f, targetNodeTypeId: e.target.value }))}>
                  <option value="">Any</option>
                  {types.map(t => { const tid = t.id || t.ID; return <option key={tid} value={tid}>{t.name || t.NAME || tid}</option>; })}
                </select>
              </Field>
            ) : (
              <Field label="Target Type">
                <input className="field-input" value={form.targetType || ''} onChange={e => setForm(f => ({ ...f, targetType: e.target.value }))} placeholder="Type name in source" />
              </Field>
            )}
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
                                      name:           a.name           || a.NAME           || '',
                                      label:          albl,
                                      dataType:       a.data_type      || a.DATA_TYPE      || 'STRING',
                                      widgetType:     a.widget_type    || a.WIDGET_TYPE    || 'TEXT',
                                      required:       areq,
                                      asName:         aAsNm,
                                      enumDefinitionId: a.enum_definition_id || a.ENUM_DEFINITION_ID || null,
                                      displaySection: a.display_section || a.DISPLAY_SECTION || '',
                                      displayOrder:   a.display_order  ?? a.DISPLAY_ORDER  ?? '',
                                      defaultValue:   a.default_value  || a.DEFAULT_VALUE  || '',
                                      namingRegex:    a.naming_regex   || a.NAMING_REGEX   || '',
                                      allowedValues:  a.allowed_values || a.ALLOWED_VALUES || '',
                                      tooltip:        a.tooltip        || a.TOOLTIP        || '',
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
                    <button className="panel-icon-btn" title="Add link type" onClick={() => openModal('create-link', { nodeTypeId: id }, { linkPolicy: 'VERSION_TO_MASTER', minCardinality: '0', targetSourceId: 'SELF', targetNodeTypeId: types[0] ? (types[0].id || types[0].ID) : '' })}>
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
                        const tgtSrc  = lt.target_source_id || lt.TARGET_SOURCE_ID || 'SELF';
                        const tgtId = lt.target_type || lt.TARGET_TYPE;
                        const tgtName = tgtId
                          ? (tgtSrc === 'SELF' ? (typeNameMap[tgtId] || tgtId) : `${tgtSrc}:${tgtId}`)
                          : 'Any';
                        const policy  = lt.link_policy || lt.LINK_POLICY || '—';
                        const minC    = lt.min_cardinality ?? lt.MIN_CARDINALITY ?? 0;
                        const maxC    = lt.max_cardinality ?? lt.MAX_CARDINALITY;
                        const card    = maxC == null ? `${minC}..*` : `${minC}..${maxC}`;
                        const ltColor = lt.color || lt.COLOR || null;
                        const lInherited    = !!(lt.inherited || lt.INHERITED);
                        const lInheritedFrom = lt.inherited_from || lt.INHERITED_FROM || null;
                        return (
                          <tr key={lid} style={lInherited ? { opacity: 0.75 } : undefined}>
                            <td style={{ width: 18 }}>
                              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: ltColor || 'var(--border)' }} title={ltColor || 'No color'} />
                            </td>
                            <td className="settings-td-mono">
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                {lname}
                                {lInherited && (
                                  <span style={{ fontSize: 9, background: 'var(--accent-dim,rgba(99,179,237,.15))', color: 'var(--accent)', borderRadius: 3, padding: '1px 4px', fontFamily: 'sans-serif', letterSpacing: '.02em', whiteSpace: 'nowrap' }}>
                                    from {lInheritedFrom || 'parent'}
                                  </span>
                                )}
                              </span>
                            </td>
                            <td>{tgtName}</td>
                            <td><span className="settings-badge">{policy}</span></td>
                            <td style={{ color: 'var(--muted)' }}>{card}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {canWrite && !lInherited && (
                                  <button className="panel-icon-btn" title="Edit link type" onClick={() => openModal('edit-link', {
                                    nodeTypeId:       id,
                                    linkTypeId:       lid,
                                    linkName:         lname,
                                    targetNodeTypeId: tgtId,
                                  }, {
                                    name:             lname,
                                    description:      lt.description || lt.DESCRIPTION || '',
                                    linkPolicy:       policy,
                                    minCardinality:   String(minC),
                                    maxCardinality:   maxC != null ? String(maxC) : '',
                                    color:            ltColor || '',
                                    targetSourceId:   tgtSrc,
                                    targetNodeTypeId: tgtId || '',
                                    targetType:       tgtSrc !== 'SELF' ? (tgtId || '') : '',
                                  })}>
                                    <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
                                  </button>
                                )}
                                {canWrite && !lInherited && (
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

  // Known keys from backend (distinct meta_key values, List<String>)
  const knownKeyNames = new Set(knownMetaKeys);
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
            <label key={mk} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={meta[mk] === 'true'} onChange={e => setMeta(mk, e.target.checked)} />
              <span className="lc-state-flag" style={{ opacity: meta[mk] === 'true' ? 1 : 0.4 }}>{mk.toUpperCase()}</span>
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

/* ── Domains Section ─────────────────────────────────────────────── */
export function DomainsSection({ userId, canWrite, toast }) {
  const [domains,   setDomains]   = useState([]);
  const [expanded,  setExpanded]  = useState(null);
  const [attrs,     setAttrs]     = useState({});
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);

  function loadDomains() {
    return api.getDomains(userId).then(d => setDomains(Array.isArray(d) ? d : []));
  }

  useEffect(() => {
    loadDomains().finally(() => setLoading(false));
  }, [userId]);

  useWebSocket(
    '/topic/metamodel',
    (evt) => { if (evt.event === 'METAMODEL_CHANGED') loadDomains(); },
    userId,
  );

  async function expand(dom) {
    const id = dom.id;
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!attrs[id]) {
      try {
        const a = await api.getDomainAttributes(userId, id);
        setAttrs(s => ({ ...s, [id]: Array.isArray(a) ? a : [] }));
      } catch { setAttrs(s => ({ ...s, [id]: [] })); }
    }
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
      if (type === 'create-domain') {
        await api.createDomain(userId, {
          name:        form.name?.trim(),
          description: form.description?.trim() || null,
          color:       form.color || null,
          icon:        form.icon || null,
        });
        await loadDomains();

      } else if (type === 'edit-domain') {
        await api.updateDomain(userId, ctx.domainId, {
          name:        form.name?.trim(),
          description: form.description?.trim() || null,
          color:       form.color || null,
          icon:        form.icon || null,
        });
        await loadDomains();

      } else if (type === 'create-attr') {
        await api.createDomainAttribute(userId, ctx.domainId, {
          name:           form.name?.trim(),
          label:          form.label?.trim(),
          dataType:       form.dataType || 'STRING',
          widgetType:     form.widgetType || 'TEXT',
          required:       !!form.required,
          enumDefinitionId: form.dataType === 'ENUM' ? (form.enumDefinitionId || null) : null,
          displaySection: form.displaySection?.trim() || null,
          displayOrder:   form.displayOrder !== '' ? Number(form.displayOrder) : 0,
          defaultValue:   form.defaultValue?.trim() || null,
          namingRegex:    form.namingRegex?.trim() || null,
          allowedValues:  form.dataType !== 'ENUM' ? (form.allowedValues?.trim() || null) : null,
          tooltip:        form.tooltip?.trim() || null,
        });
        const updated = await api.getDomainAttributes(userId, ctx.domainId);
        setAttrs(s => ({ ...s, [ctx.domainId]: Array.isArray(updated) ? updated : [] }));

      } else if (type === 'edit-attr') {
        await api.updateDomainAttribute(userId, ctx.domainId, ctx.attrId, {
          name:           form.name?.trim(),
          label:          form.label?.trim(),
          dataType:       form.dataType || 'STRING',
          widgetType:     form.widgetType || 'TEXT',
          required:       !!form.required,
          enumDefinitionId: form.dataType === 'ENUM' ? (form.enumDefinitionId || null) : null,
          displaySection: form.displaySection?.trim() || null,
          displayOrder:   form.displayOrder !== '' ? Number(form.displayOrder) : 0,
          defaultValue:   form.defaultValue?.trim() || null,
          namingRegex:    form.namingRegex?.trim() || null,
          allowedValues:  form.dataType !== 'ENUM' ? (form.allowedValues?.trim() || null) : null,
          tooltip:        form.tooltip?.trim() || null,
        });
        const updated = await api.getDomainAttributes(userId, ctx.domainId);
        setAttrs(s => ({ ...s, [ctx.domainId]: Array.isArray(updated) ? updated : [] }));
      }

      closeModal();
    } catch (e) {
      toast(e, 'error');
    } finally { setSaving(false); }
  }

  async function deleteDomain(e, dom) {
    e.stopPropagation();
    if (!window.confirm(`Delete domain "${dom.name}"?\n\nThis also deletes all its attributes. Cannot be undone.`)) return;
    try {
      await api.deleteDomain(userId, dom.id);
      await loadDomains();
      if (expanded === dom.id) setExpanded(null);
    } catch (e) { toast(e, 'error'); }
  }

  async function deleteAttr(e, domainId, a) {
    e.stopPropagation();
    if (!window.confirm(`Delete attribute "${a.label || a.name}"?`)) return;
    try {
      await api.deleteDomainAttribute(userId, domainId, a.id);
      const updated = await api.getDomainAttributes(userId, domainId);
      setAttrs(s => ({ ...s, [domainId]: Array.isArray(updated) ? updated : [] }));
    } catch (e) { toast(e, 'error'); }
  }

  const saveDisabled = () => {
    if (!modal || saving) return true;
    const { type } = modal;
    if (type === 'create-domain') return !form.name?.trim();
    if (type === 'edit-domain')   return !form.name?.trim();
    if (type === 'create-attr')   return !form.name?.trim() || !form.label?.trim();
    if (type === 'edit-attr')     return !form.name?.trim() || !form.label?.trim();
    return false;
  };

  if (loading) return <div className="settings-loading">Loading…</div>;

  return (
    <div className="settings-list">
      {modal && (
        <MetaModal
          title={
            modal.type === 'create-domain' ? 'New Domain' :
            modal.type === 'edit-domain'   ? 'Edit Domain' :
            modal.type === 'create-attr'   ? 'Add Attribute' :
            modal.type === 'edit-attr'     ? 'Edit Attribute' : ''
          }
          width={480}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
          saveDisabled={saveDisabled()}
          saveLabel={['edit-domain','edit-attr'].includes(modal.type) ? 'Update' : 'Create'}
        >
          {(modal.type === 'create-domain' || modal.type === 'edit-domain') && <>
            <Field label="Name *">
              <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electrical" />
            </Field>
            <Field label="Description">
              <input className="field-input" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </Field>
            <ColorField
              label="Color"
              value={form.color || ''}
              onChange={v => setForm(f => ({ ...f, color: v }))}
            />
          </>}

          {modal.type === 'create-attr' && (
            <AttrFields form={form} setForm={setForm} hideName={false} hideAsName={true} userId={userId} />
          )}

          {modal.type === 'edit-attr' && <>
            <Field label="Name *">
              <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Label (display) *">
              <input className="field-input" value={form.label || ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
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
            {(form.dataType === 'ENUM') && (
              <EnumPicker userId={userId} enumDefinitionId={form.enumDefinitionId || null}
                onChange={v => setForm(f => ({ ...f, enumDefinitionId: v }))} />
            )}
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
        </MetaModal>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        {canWrite && (
          <button
            className="btn btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={() => openModal('create-domain', {}, {})}
          >
            <PlusIcon size={11} strokeWidth={2.5} />
            New domain
          </button>
        )}
      </div>

      {domains.map(dom => {
        const id     = dom.id;
        const name   = dom.name || id;
        const isExp  = expanded === id;
        const domAttrs = attrs[id] || [];
        const domColor = dom.color || null;

        return (
          <div key={id} className="settings-card">
            <div className="settings-card-hd" onClick={() => expand(dom)} style={{ display: 'flex', alignItems: 'center' }}>
              <span className="settings-card-chevron">
                {isExp
                  ? <ChevronDownIcon  size={13} strokeWidth={2} color="var(--muted)" />
                  : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />
                }
              </span>
              {domColor && <span style={{ width: 10, height: 10, borderRadius: '50%', background: domColor, flexShrink: 0, marginRight: 4 }} />}
              <span className="settings-card-name">{name}</span>
              <span className="settings-card-id">{id}</span>
              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                {canWrite && (
                  <button className="panel-icon-btn" title="Edit domain" onClick={e => { e.stopPropagation(); openModal('edit-domain', { domainId: id }, { name: dom.name, description: dom.description || '', color: domColor || '' }); }}>
                    <EditIcon size={12} strokeWidth={2} color="var(--accent)" />
                  </button>
                )}
                {canWrite && (
                  <button className="panel-icon-btn" title="Delete domain" onClick={e => deleteDomain(e, dom)}>
                    <TrashIcon size={12} strokeWidth={2} color="var(--danger, #f87171)" />
                  </button>
                )}
              </div>
            </div>

            {isExp && (
              <div className="settings-card-body">
                {dom.description && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{dom.description}</div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>Attributes</span>
                  {canWrite && (
                    <button className="panel-icon-btn" title="Add attribute" onClick={() => openModal('create-attr', { domainId: id }, { dataType: 'STRING', widgetType: 'TEXT', required: false })}>
                      <PlusIcon size={12} strokeWidth={2.5} color="var(--accent)" />
                    </button>
                  )}
                </div>
                {domAttrs.length === 0 ? (
                  <div className="settings-empty-row">No attributes defined</div>
                ) : (
                  <table className="settings-table">
                    <thead>
                      <tr><th>Name</th><th>Label</th><th>Type</th><th>Req</th><th>Section</th><th></th></tr>
                    </thead>
                    <tbody>
                      {[...domAttrs]
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        .map(a => {
                          const aid   = a.id;
                          const aname = a.name;
                          const albl  = a.label || aname;
                          const atype = a.widget_type || 'TEXT';
                          const areq  = !!(a.required);
                          const asec  = a.display_section || '—';
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
                                    <button className="panel-icon-btn" title="Edit" onClick={() => openModal('edit-attr', { domainId: id, attrId: aid }, {
                                      name:           aname,
                                      label:          albl,
                                      dataType:       a.data_type || 'STRING',
                                      widgetType:     a.widget_type || 'TEXT',
                                      required:       areq,
                                      enumDefinitionId: a.enum_definition_id || null,
                                      displaySection: a.display_section || '',
                                      displayOrder:   a.display_order ?? '',
                                      defaultValue:   a.default_value || '',
                                      namingRegex:    a.naming_regex || '',
                                      allowedValues:  a.allowed_values || '',
                                      tooltip:        a.tooltip || '',
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
              </div>
            )}
          </div>
        );
      })}

      {domains.length === 0 && <div className="settings-empty-row">No domains defined yet</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENUMS SECTION
   ═══════════════════════════════════════════════════════════════ */

export function EnumsSection({ userId, canWrite, toast }) {
  const [enums,      setEnums]      = useState([]);
  const [expanded,   setExpanded]   = useState(null);
  const [values,     setValues]     = useState({}); // { enumId: [...] }
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState({});
  const [saving,     setSaving]     = useState(false);
  const [addingValue, setAddingValue] = useState(null); // { enumId, value, label }
  const [editingValue, setEditingValue] = useState(null); // { id, enumId, value, label }

  const loadEnums = useCallback(() =>
    api.getEnums(userId).then(d => setEnums(Array.isArray(d) ? d : [])).catch(() => setEnums([])),
  [userId]);

  useEffect(() => { loadEnums(); }, [loadEnums]);

  function loadValues(enumId) {
    api.getEnumValues(userId, enumId)
      .then(d => setValues(s => ({ ...s, [enumId]: Array.isArray(d) ? d : [] })))
      .catch(() => setValues(s => ({ ...s, [enumId]: [] })));
  }

  function toggle(id) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!values[id]) loadValues(id);
  }

  function openModal(type, ctx, init) {
    setModal({ type, ctx });
    setForm(init || {});
  }
  function closeModal() { setModal(null); setForm({}); }

  async function handleSave() {
    setSaving(true);
    try {
      const { type, ctx } = modal;
      if (type === 'create-enum') {
        await api.createEnum(userId, { name: form.name?.trim(), description: form.description?.trim() || null });
        await loadEnums();
      } else if (type === 'edit-enum') {
        await api.updateEnum(userId, ctx.enumId, { name: form.name?.trim(), description: form.description?.trim() || null });
        await loadEnums();
      }
      closeModal();
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function deleteEnum(e, en) {
    e.stopPropagation();
    if (!window.confirm(`Delete enumeration "${en.name}"?\n\nThis also deletes all its values. Cannot be undone.`)) return;
    try {
      await api.deleteEnum(userId, en.id);
      await loadEnums();
      if (expanded === en.id) setExpanded(null);
    } catch (e) { toast(e, 'error'); }
  }

  async function addValue(enumId) {
    if (!addingValue?.value?.trim()) return;
    setSaving(true);
    try {
      await api.addEnumValue(userId, enumId, { value: addingValue.value.trim(), label: addingValue.label?.trim() || null });
      loadValues(enumId);
      setAddingValue(null);
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function deleteValue(enumId, v) {
    if (!window.confirm(`Delete value "${v.value}"?`)) return;
    try {
      await api.deleteEnumValue(userId, enumId, v.id);
      loadValues(enumId);
    } catch (e) { toast(e, 'error'); }
  }

  async function saveEditValue() {
    if (!editingValue) return;
    setSaving(true);
    try {
      await api.updateEnumValue(userId, editingValue.enumId, editingValue.id, {
        value: editingValue.value?.trim(),
        label: editingValue.label?.trim() || null,
        displayOrder: editingValue.displayOrder ?? 0,
      });
      loadValues(editingValue.enumId);
      setEditingValue(null);
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function moveValue(enumId, idx, dir) {
    const vals = values[enumId];
    if (!vals) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= vals.length) return;
    const reordered = [...vals];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setValues(s => ({ ...s, [enumId]: reordered }));
    try {
      await api.reorderEnumValues(userId, enumId, reordered.map(v => v.id));
    } catch (e) { toast(e, 'error'); loadValues(enumId); }
  }

  const saveDisabled = () => {
    if (!modal || saving) return true;
    if (modal.type === 'create-enum' || modal.type === 'edit-enum') return !form.name?.trim();
    return false;
  };

  return (
    <div className="settings-section">
      {modal && (
        <MetaModal
          title={modal.type === 'create-enum' ? 'New Enumeration' : 'Edit Enumeration'}
          width={420}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
          saveDisabled={saveDisabled()}
          saveLabel={modal.type === 'edit-enum' ? 'Update' : 'Create'}
        >
          <Field label="Name *">
            <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Materials" />
          </Field>
          <Field label="Description">
            <input className="field-input" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
          </Field>
        </MetaModal>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        {canWrite && (
          <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={() => openModal('create-enum', {}, {})}>
            <PlusIcon size={11} strokeWidth={2.5} />
            New enumeration
          </button>
        )}
      </div>

      {enums.map(en => {
        const isExp = expanded === en.id;
        const vals = values[en.id] || [];
        return (
          <div key={en.id} className="settings-card">
            <div className="settings-card-hd" onClick={() => toggle(en.id)} style={{ display: 'flex', alignItems: 'center' }}>
              <span className="settings-card-chevron">
                {isExp
                  ? <ChevronDownIcon  size={13} strokeWidth={2} color="var(--muted)" />
                  : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />
                }
              </span>
              <span className="settings-card-name">{en.name}</span>
              <span className="settings-badge" style={{ marginLeft: 6 }}>{en.valueCount} value{en.valueCount !== 1 ? 's' : ''}</span>
              {en.description && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>{en.description}</span>}
              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                {canWrite && (
                  <button className="panel-icon-btn" title="Edit" onClick={e => { e.stopPropagation(); openModal('edit-enum', { enumId: en.id }, { name: en.name, description: en.description || '' }); }}>
                    <EditIcon size={12} strokeWidth={2} color="var(--accent)" />
                  </button>
                )}
                {canWrite && (
                  <button className="panel-icon-btn" title="Delete" onClick={e => deleteEnum(e, en)}>
                    <TrashIcon size={12} strokeWidth={2} color="var(--danger, #f87171)" />
                  </button>
                )}
              </div>
            </div>

            {isExp && (
              <div className="settings-card-body" style={{ padding: '8px 16px 12px' }}>
                {vals.length > 0 && (
                  <table className="settings-table" style={{ marginBottom: 8 }}>
                    <thead>
                      <tr><th style={{ width: 40 }}>#</th><th>Value</th><th>Label</th><th style={{ width: 1 }}></th></tr>
                    </thead>
                    <tbody>
                      {vals.map((v, idx) => {
                        const isEditing = editingValue?.id === v.id;
                        return isEditing ? (
                          <tr key={v.id}>
                            <td style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>{idx}</td>
                            <td>
                              <input className="field-input" autoFocus value={editingValue.value || ''}
                                onChange={e => setEditingValue(ev => ({ ...ev, value: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveEditValue(); } if (e.key === 'Escape') setEditingValue(null); }}
                                style={{ fontSize: 12, padding: '2px 6px' }} />
                            </td>
                            <td>
                              <input className="field-input" value={editingValue.label || ''}
                                onChange={e => setEditingValue(ev => ({ ...ev, label: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveEditValue(); } if (e.key === 'Escape') setEditingValue(null); }}
                                placeholder="(optional)"
                                style={{ fontSize: 12, padding: '2px 6px' }} />
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                                <button className="btn btn-primary btn-sm" onClick={saveEditValue} disabled={saving || !editingValue.value?.trim()}
                                  style={{ fontSize: 11, padding: '2px 8px' }}>Save</button>
                                <button className="btn btn-sm" onClick={() => setEditingValue(null)}
                                  style={{ fontSize: 11, padding: '2px 8px' }}>Cancel</button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr key={v.id}>
                            <td style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>{idx}</td>
                            <td className="settings-td-mono">{v.value}</td>
                            <td style={{ color: v.label ? 'var(--fg)' : 'var(--muted)' }}>{v.label || '—'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                                {canWrite && idx > 0 && (
                                  <button className="panel-icon-btn" title="Move up" onClick={() => moveValue(en.id, idx, -1)}
                                    style={{ fontSize: 10 }}>▲</button>
                                )}
                                {canWrite && idx < vals.length - 1 && (
                                  <button className="panel-icon-btn" title="Move down" onClick={() => moveValue(en.id, idx, 1)}
                                    style={{ fontSize: 10 }}>▼</button>
                                )}
                                {canWrite && (
                                  <button className="panel-icon-btn" title="Edit" onClick={() => setEditingValue({ id: v.id, enumId: en.id, value: v.value, label: v.label || '', displayOrder: idx })}>
                                    <EditIcon size={11} strokeWidth={2} color="var(--accent)" />
                                  </button>
                                )}
                                {canWrite && (
                                  <button className="panel-icon-btn" title="Delete" onClick={() => deleteValue(en.id, v)}>
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
                {vals.length === 0 && <div className="settings-empty-row">No values yet</div>}

                {canWrite && addingValue?.enumId === en.id ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                    <input className="field-input" autoFocus placeholder="Value *" value={addingValue.value || ''}
                      onChange={e => setAddingValue(a => ({ ...a, value: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addValue(en.id); } }}
                      style={{ flex: 1 }} />
                    <input className="field-input" placeholder="Label (optional)" value={addingValue.label || ''}
                      onChange={e => setAddingValue(a => ({ ...a, label: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addValue(en.id); } }}
                      style={{ flex: 1 }} />
                    <button className="btn btn-primary btn-sm" onClick={() => addValue(en.id)}
                      disabled={saving || !addingValue.value?.trim()}>Add</button>
                    <button className="btn btn-sm" onClick={() => setAddingValue(null)}>Cancel</button>
                  </div>
                ) : canWrite ? (
                  <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}
                    onClick={() => setAddingValue({ enumId: en.id, value: '', label: '' })}>
                    <PlusIcon size={11} strokeWidth={2.5} />
                    Add value
                  </button>
                ) : null}
              </div>
            )}
          </div>
        );
      })}

      {enums.length === 0 && <div className="settings-empty-row">No enumerations defined yet</div>}
    </div>
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
                        background: 'var(--subtle-bg)',
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
                          background: 'var(--subtle-bg2)',
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
                              background: 'var(--subtle-bg)',
                              border: '1px solid var(--border)',
                              fontSize: 11,
                            }}>
                              <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 600 }}>{a.algorithmCode || a.instanceName}</span>
                              <ModuleBadge module={a.moduleName} />
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
                        background: 'var(--subtle-bg)',
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
                          background: 'var(--subtle-bg2)',
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
                              background: 'var(--subtle-bg)',
                              border: '1px solid var(--border)',
                              fontSize: 11,
                            }}>
                              <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 600 }}>{g.algorithmName || g.algorithmCode || g.instanceName}</span>
                              {g.algorithmCode && g.algorithmName && (
                                <span style={{ fontSize: 10, color: 'var(--muted)' }}>({g.algorithmCode})</span>
                              )}
                              <ModuleBadge module={g.moduleName} />
                              {canWrite ? (
                                <select className="field-input" style={{ fontSize: 10, padding: '0 4px', height: 20 }}
                                  value={g.effect}
                                  onChange={async (e) => {
                                    const newEffect = e.target.value;
                                    try {
                                      await api.updateTransitionGuard(userId, g.id, newEffect);
                                      setTransGuards(s => ({
                                        ...s,
                                        [tid]: (s[tid] || []).map(x => x.id === g.id ? { ...x, effect: newEffect } : x),
                                      }));
                                      toast('Effect updated', 'success');
                                    } catch (err) { toast(err, 'error'); }
                                  }}>
                                  <option value="HIDE">HIDE</option>
                                  <option value="BLOCK">BLOCK</option>
                                </select>
                              ) : (
                                <span className={`settings-badge ${g.effect === 'BLOCK' ? 'badge-warn' : ''}`} style={{ fontSize: 9 }}>{g.effect}</span>
                              )}
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
                              background: 'var(--subtle-bg)',
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
function NodeTypeActionsPanel({ userId, roleId, canWrite, toast,
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
  }, [userId, roleId]);

  const pKey = (permCode, ntId, transId) => `${permCode}|${ntId || ''}|${transId || ''}`;

  async function togglePerm(permCode, ntId, transId) {
    if (!canWrite || !policies) return;
    const key = pKey(permCode, ntId, transId);
    const isGranted = policies.has(key);
    setPolicies(s => { const n = new Set(s); isGranted ? n.delete(key) : n.add(key); return n; });
    try {
      if (isGranted) {
        await api.removePermissionGrant(userId, ntId, permCode, roleId, transId || null);
      } else {
        await api.addPermissionGrant(userId, ntId, permCode, roleId, transId || null);
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
  const [expanded, setExpanded] = useState(null); // expanded space id
  const [tagCatalog, setTagCatalog] = useState({}); // { serviceCode: [tag1, tag2] }
  const [spaceTags, setSpaceTags] = useState({}); // { serviceCode: [tag1] }
  const [tagSaving, setTagSaving] = useState(false);

  function load() {
    return api.listProjectSpaces(userId).then(d => setSpaces(Array.isArray(d) ? d : []));
  }
  useEffect(() => { load().finally(() => setLoading(false)); }, [userId]);

  // Load tag catalog from SPE when component mounts
  useEffect(() => {
    speApi.getRegistryTags().then(setTagCatalog).catch(() => {});
  }, []);

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

  async function toggleExpand(spaceId) {
    if (expanded === spaceId) { setExpanded(null); return; }
    setExpanded(spaceId);
    try {
      const tags = await api.getProjectSpaceServiceTags(userId, spaceId);
      setSpaceTags(tags || {});
    } catch (e) { setSpaceTags({}); }
  }

  async function toggleIsolated(ps) {
    const id = ps.id || ps.ID;
    const currentIsolated = ps.isolated === true;
    try {
      await api.setProjectSpaceIsolated(userId, id, !currentIsolated);
      await load();
      toast(!currentIsolated ? 'Isolation enabled' : 'Isolation disabled');
    } catch (e) { toast(e, 'error'); }
  }

  async function saveTag(spaceId, serviceCode, tags) {
    setTagSaving(true);
    try {
      await api.setProjectSpaceServiceTags(userId, spaceId, serviceCode, tags);
      const updated = await api.getProjectSpaceServiceTags(userId, spaceId);
      setSpaceTags(updated || {});
      toast('Tags updated');
    } catch (e) {
      toast(e, 'error');
    } finally { setTagSaving(false); }
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
        const id       = ps.id          || ps.ID;
        const name     = ps.name        || ps.NAME || id;
        const desc     = ps.description || ps.DESCRIPTION || '';
        const active   = ps.active !== false && ps.ACTIVE !== false;
        const isolated = ps.isolated === true;
        const parentId = ps.parentId    || ps.PARENT_ID || null;
        const isExpanded = expanded === id;

        return (
          <div key={id} className="settings-card" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => toggleExpand(id)}>
              {isExpanded ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
              <HexIcon size={13} color={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth={1.5} />
              <span className="settings-card-name" style={{ marginLeft: 4 }}>{name}</span>
              <span className="settings-card-id">{id}</span>
              {parentId && <span className="settings-badge" title={`Child of ${parentId}`}>child</span>}
              {isolated && <span className="settings-badge settings-badge--warn">Isolated</span>}
              {!active && <span className="settings-badge settings-badge--warn">Inactive</span>}
            </div>
            {desc && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, paddingLeft: 19 }}>{desc}</div>}

            {isExpanded && (
              <div style={{ marginTop: 10, paddingLeft: 19, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                {/* Isolated toggle */}
                {canWrite && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={isolated} onChange={() => toggleIsolated(ps)} />
                      <span>Isolated</span>
                    </label>
                    <span className="muted" style={{ fontSize: 10 }}>Exclusive tag ownership, no untagged routing</span>
                  </div>
                )}

                {/* Service tag configuration */}
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Service Tags</div>
                {Object.keys(tagCatalog).length === 0 ? (
                  <div className="muted" style={{ fontSize: 11 }}>No services registered with tags.</div>
                ) : (
                  <table className="status-table" style={{ fontSize: 11 }}>
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Available Tags</th>
                        <th>Assigned</th>
                        {canWrite && <th></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(tagCatalog).map(([svc, available]) => {
                        const assigned = spaceTags[svc] || [];
                        return (
                          <tr key={svc}>
                            <td><code>{svc}</code></td>
                            <td>
                              {available.length === 0
                                ? <span className="muted">none</span>
                                : available.map(t => (
                                    <span key={t} style={{
                                      display: 'inline-block', padding: '1px 6px', margin: '1px 2px',
                                      borderRadius: 3, fontSize: 10,
                                      background: assigned.includes(t) ? 'var(--accent-bg)' : 'var(--bg2)',
                                      color: assigned.includes(t) ? 'var(--accent)' : 'var(--muted)',
                                      border: `1px solid ${assigned.includes(t) ? 'var(--accent)' : 'var(--border)'}`,
                                      cursor: canWrite ? 'pointer' : 'default',
                                    }}
                                    onClick={canWrite ? () => {
                                      const next = assigned.includes(t)
                                        ? assigned.filter(x => x !== t)
                                        : [...assigned, t];
                                      saveTag(id, svc, next);
                                    } : undefined}
                                    title={canWrite ? (assigned.includes(t) ? 'Click to remove' : 'Click to assign') : ''}
                                    >{t}</span>
                                  ))
                              }
                            </td>
                            <td>
                              {assigned.length === 0
                                ? <span className="muted">—</span>
                                : assigned.join(', ')
                              }
                            </td>
                            {canWrite && (
                              <td>
                                {assigned.length > 0 && (
                                  <button className="btn btn-sm btn-ghost" style={{ fontSize: 10, padding: '1px 6px' }}
                                    onClick={() => saveTag(id, svc, [])}
                                    disabled={tagSaving}
                                  >clear</button>
                                )}
                              </td>
                            )}
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

  // Dynamic grouping — surface every scope the catalog actually contains
  // (GLOBAL, NODE, LIFECYCLE plus any service-contributed scope like DATA).
  // Order: well-known scopes first, then everything else alphabetically.
  const KNOWN_ORDER = ['GLOBAL', 'NODE', 'LIFECYCLE'];
  const grouped = {};
  permissions.forEach(p => {
    if (!p.scope) return;
    if (!grouped[p.scope]) grouped[p.scope] = [];
    grouped[p.scope].push(p);
  });
  const scopeOrder = [
    ...KNOWN_ORDER.filter(s => grouped[s]),
    ...Object.keys(grouped).filter(s => !KNOWN_ORDER.includes(s)).sort(),
  ];

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
          {scopeOrder.map(scope => {
            const items = grouped[scope] || [];
            if (items.length === 0) return null;
            return (
              <div key={scope}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
                  color: 'var(--muted)', padding: '6px 10px', background: 'var(--subtle-bg)', borderBottom: '1px solid var(--border)' }}>
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
                  {/* Well-known scopes first, then any service-contributed
                      scope already present in the catalog (DATA, future). */}
                  {[...KNOWN_ORDER, ...Object.keys(grouped).filter(s => !KNOWN_ORDER.includes(s)).sort()]
                    .filter((s, i, a) => a.indexOf(s) === i)
                    .map(s => <option key={s} value={s}>{s}</option>)}
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
  const [expandedRole, setExpandedRole] = useState(null);
  // globalPerms: roleId → Set<permissionCode>
  const [globalPerms, setGlobalPerms] = useState({});
  // scopePerms: roleId → { scopeCode → Set<permissionCode> } for non-GLOBAL/NODE/LIFECYCLE scopes (e.g. dst's DATA).
  const [scopePerms, setScopePerms] = useState({});

  // ── Load everything from backend introspection ──────────────────
  useEffect(() => {
    Promise.all([
      api.getRoles(userId),
      api.listPermissions(userId),
      api.getNodeTypes(userId),
      api.getLifecycles(userId),
    ]).then(async ([roleList, permList, ntList, lcList]) => {
      setRoles(Array.isArray(roleList) ? roleList : []);
      const normPerms = (Array.isArray(permList) ? permList : []).map(p => ({
        ...p,
        permissionCode: p.permissionCode || p.permission_code,
        displayName:    p.displayName    || p.display_name,
        displayOrder:   p.displayOrder   ?? p.display_order,
      }));
      setPermissions(normPerms);
      setNodeTypes(Array.isArray(ntList) ? ntList : []);

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
    const normalized = (Array.isArray(permList) ? permList : []).map(p => ({
      ...p,
      permissionCode: p.permissionCode || p.permission_code,
      displayName:    p.displayName    || p.display_name,
      displayOrder:   p.displayOrder   ?? p.display_order,
    }));
    setPermissions(normalized);
  }

  // Split permissions by scope. Anything that isn't GLOBAL/NODE/LIFECYCLE is
  // treated as a role-only "extra scope" (e.g. dst's DATA) and rendered with
  // the same toggle UI as GLOBAL via the generic /scope-permissions endpoints.
  const globalPermsSet = permissions.filter(p => p.scope === 'GLOBAL');
  const nodePerms      = permissions.filter(p => p.scope === 'NODE');
  const lcPerms        = permissions.filter(p => p.scope === 'LIFECYCLE');
  const KNOWN_SCOPES   = new Set(['GLOBAL', 'NODE', 'LIFECYCLE']);
  const extraScopes    = [...new Set(permissions.map(p => p.scope).filter(s => s && !KNOWN_SCOPES.has(s)))];
  const permsByScope   = (sc) => permissions.filter(p => p.scope === sc);

  async function toggleRole(roleId) {
    if (expandedRole === roleId) { setExpandedRole(null); return; }
    setExpandedRole(roleId);
    if (globalPerms[roleId] === undefined) {
      const rows = await api.getRoleGlobalPermissions(userId, roleId).catch(() => []);
      const granted = new Set((Array.isArray(rows) ? rows : []).map(r => r.permissionCode || r.permission_code));
      setGlobalPerms(s => ({ ...s, [roleId]: granted }));
    }
    if (extraScopes.length > 0 && !scopePerms[roleId]) {
      const entries = await Promise.all(extraScopes.map(async sc => {
        const rows = await api.getRoleScopePermissions(userId, roleId, sc).catch(() => []);
        const set = new Set((Array.isArray(rows) ? rows : []).map(r => r.permissionCode || r.permission_code));
        return [sc, set];
      }));
      setScopePerms(s => ({ ...s, [roleId]: Object.fromEntries(entries) }));
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

  async function toggleScopePerm(roleId, scopeCode, permissionCode) {
    if (!canWrite) return;
    const cur = (scopePerms[roleId] && scopePerms[roleId][scopeCode]) || new Set();
    const isGranted = cur.has(permissionCode);
    const next = new Set(cur);
    if (isGranted) next.delete(permissionCode); else next.add(permissionCode);
    setScopePerms(s => ({ ...s, [roleId]: { ...(s[roleId] || {}), [scopeCode]: next } }));
    try {
      if (isGranted) await api.removeRoleScopePermission(userId, roleId, scopeCode, permissionCode);
      else           await api.addRoleScopePermission(userId, roleId, scopeCode, permissionCode);
    } catch (e) {
      setScopePerms(s => ({ ...s, [roleId]: { ...(s[roleId] || {}), [scopeCode]: cur } }));
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
                    <div className="settings-sub-label">Global Permissions</div>
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

                {/* ── Extra (role-only) scope permissions: DATA, future ── */}
                {extraScopes.map(sc => {
                  const perms = permsByScope(sc);
                  if (perms.length === 0) return null;
                  const granted = (scopePerms[role.id] && scopePerms[role.id][sc]);
                  return (
                    <div key={sc} style={{ marginBottom: 14 }}>
                      <div className="settings-sub-label">{sc} Permissions</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>
                        Role-only check — scope {sc} has no key context.
                      </div>
                      {perms.map(p => {
                        const isPending = granted === undefined;
                        const isGranted = !isPending && granted.has(p.permissionCode);
                        return (
                          <div key={p.permissionCode} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                            <button className="panel-icon-btn" disabled={isPending || !canWrite}
                              title={!canWrite ? 'Requires MANAGE_ROLES' : isGranted ? `Revoke from ${role.name}` : `Grant to ${role.name}`}
                              onClick={() => toggleScopePerm(role.id, sc, p.permissionCode)}
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
                  );
                })}

                {/* ── NODE + LIFECYCLE scope permissions ── */}
                {(nodePerms.length > 0 || lcPerms.length > 0) && (
                  <NodeTypeActionsPanel
                    userId={userId} roleId={role.id}
                    canWrite={canWrite} toast={toast}
                    nodePerms={nodePerms} lcPerms={lcPerms}
                    nodeTypes={nodeTypes} transitions={transitions}
                  />
                )}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Platform Environment Section ───────────────────────────────── */
/* ── Platform Environment Section ───────────────────────────────── */
function PlatformEnvironmentSection({ userId, canWrite, toast }) {
  const [expectedServices, setExpectedServices] = useState([]);
  const [status, setStatus] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [busy, setBusy] = useState(false);

  // Match backend ExpectedServicesConfig.BASELINE — baseline service codes
  // that cannot be removed from the expected list.
  const BASELINE = ['pno', 'platform', 'spe'];

  async function refresh() {
    try {
      const [env, st] = await Promise.all([
        speApi.getEnvironment(),
        speApi.getStatus(),
      ]);
      setExpectedServices(env.expectedServices || []);
      setStatus(st);
    } catch (e) {
      toast(e?.message || String(e), 'error');
    }
  }

  useEffect(() => { refresh(); }, []);

  const statusMap = {};
  (status?.services || []).forEach(svc => {
    statusMap[svc.serviceCode] = svc;
  });

  async function handleAdd() {
    const code = newCode.trim();
    if (!code) return;
    setBusy(true);
    try {
      await speApi.addExpectedService(code);
      setNewCode('');
      setAdding(false);
      toast('Service added', 'success');
      refresh();
    } catch (e) { toast(e?.message || String(e), 'error'); }
    finally { setBusy(false); }
  }

  async function handleRemove(code) {
    if (!window.confirm(`Remove expected service '${code}'?`)) return;
    setBusy(true);
    try {
      const result = await speApi.removeExpectedService(code);
      if (result?.baseline) {
        toast('Cannot remove baseline service', 'error');
      } else {
        toast('Service removed', 'success');
      }
      refresh();
    } catch (e) { toast(e?.message || String(e), 'error'); }
    finally { setBusy(false); }
  }

  return (
    <div className="settings-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Expected Services</h2>
        <span style={{ fontSize: 12, color: 'var(--muted2)' }}>
          Services the platform expects to be running
        </span>
        <div style={{ marginLeft: 'auto' }}>
          {canWrite && !adding && (
            <button
              className="btn btn-xs btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
              onClick={() => setAdding(true)}
            >
              <PlusIcon size={11} strokeWidth={2} />
              Add service
            </button>
          )}
        </div>
      </div>

      {!canWrite && (
        <div className="settings-banner" style={{ marginBottom: 12 }}>
          Read-only access
        </div>
      )}

      {adding && (
        <div style={{ border: '1px solid var(--border)', padding: 12, borderRadius: 6, marginBottom: 12, background: 'var(--bg-alt, rgba(255,255,255,0.02))' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="field-input"
              placeholder="Service code (e.g. my-service)"
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ flex: 1, maxWidth: 300 }}
              autoFocus
            />
            <button className="btn btn-primary btn-xs" onClick={handleAdd} disabled={busy}>
              Add
            </button>
            <button className="btn btn-xs" onClick={() => { setAdding(false); setNewCode(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <table className="settings-table">
        <thead>
          <tr>
            <th>Service Code</th>
            <th>Status</th>
            <th>Instances</th>
            <th>Version</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {expectedServices.map(code => {
            const svc = statusMap[code];
            const isBaseline = BASELINE.includes(code);
            const st = svc?.status || 'missing';
            const STATUS_COLORS = {
              up:       '#4dd4a0',
              degraded: '#f0b429',
              down:     '#fc8181',
              missing:  '#6b8099',
            };
            const dotColor = STATUS_COLORS[st] || STATUS_COLORS.missing;
            return (
              <tr key={code}>
                <td>
                  <code style={{ fontSize: 12 }}>{code}</code>
                  {isBaseline && <span className="settings-badge" style={{ marginLeft: 8, fontSize: 10 }}>baseline</span>}
                </td>
                <td>
                  <span className="status-dot" style={{ marginRight: 6, background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
                  {st}
                </td>
                <td>{svc ? `${svc.healthyInstances ?? 0}/${svc.instanceCount ?? 0}` : '\u2013'}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{svc?.version || '\u2013'}</td>
                <td>
                  {canWrite && !isBaseline && (
                    <button className="btn btn-xs btn-danger" onClick={() => handleRemove(code)} disabled={busy}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {expectedServices.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                No expected services configured (dynamic discovery mode)
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function SecretsSection({ userId, canWrite, toast }) {
  const [keys, setKeys]             = useState(null);
  const [revealed, setRevealed]     = useState({});   // { key: plaintext | null(loading) }
  const [editing, setEditing]       = useState({});   // { key: draftValue }
  const [addForm, setAddForm]       = useState(null); // null | { key, value }
  const [busy, setBusy]             = useState(false);

  async function refresh() {
    try {
      const rows = await api.listSecrets(userId);
      setKeys(Array.isArray(rows) ? rows.map(r => r.key).sort() : []);
    } catch (e) {
      toast(e?.message || String(e), 'error');
      setKeys([]);
    }
  }

  useEffect(() => { refresh(); }, [userId]);

  async function toggleReveal(key) {
    if (revealed[key] !== undefined) {
      setRevealed(r => { const c = { ...r }; delete c[key]; return c; });
      return;
    }
    setRevealed(r => ({ ...r, [key]: null }));
    try {
      const dto = await api.revealSecret(userId, key);
      setRevealed(r => ({ ...r, [key]: dto?.value ?? '' }));
    } catch (e) {
      toast(e?.message || String(e), 'error');
      setRevealed(r => { const c = { ...r }; delete c[key]; return c; });
    }
  }

  function startEdit(key) {
    setEditing(m => ({ ...m, [key]: revealed[key] ?? '' }));
  }

  function cancelEdit(key) {
    setEditing(m => { const c = { ...m }; delete c[key]; return c; });
  }

  async function saveEdit(key) {
    setBusy(true);
    try {
      await api.updateSecret(userId, key, editing[key]);
      toast(`Updated '${key}'`, 'success');
      cancelEdit(key);
      // Refresh revealed value if it was showing
      if (revealed[key] !== undefined) {
        setRevealed(r => ({ ...r, [key]: editing[key] }));
      }
    } catch (e) { toast(e?.message || String(e), 'error'); }
    finally { setBusy(false); }
  }

  async function removeKey(key) {
    if (!window.confirm(`Delete secret '${key}'? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api.deleteSecret(userId, key);
      toast(`Deleted '${key}'`, 'success');
      setRevealed(r => { const c = { ...r }; delete c[key]; return c; });
      refresh();
    } catch (e) { toast(e?.message || String(e), 'error'); }
    finally { setBusy(false); }
  }

  async function createKey() {
    if (!addForm?.key?.trim()) { toast('Key required', 'error'); return; }
    setBusy(true);
    try {
      await api.createSecret(userId, addForm.key.trim(), addForm.value ?? '');
      toast(`Created '${addForm.key}'`, 'success');
      setAddForm(null);
      refresh();
    } catch (e) {
      const msg = (e?.message || String(e)).includes('409') ? 'Key already exists' : (e?.message || String(e));
      toast(msg, 'error');
    }
    finally { setBusy(false); }
  }

  if (keys === null) return <div className="settings-loading">Loading…</div>;

  return (
    <div className="settings-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Secrets</h2>
        <span style={{ fontSize: 12, color: 'var(--muted2)' }}>Vault path: <code>secret/plm</code></span>
        <div style={{ marginLeft: 'auto' }}>
          {canWrite && !addForm && (
            <button
              className="btn btn-xs btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
              onClick={() => setAddForm({ key: '', value: '' })}
            >
              <PlusIcon size={11} strokeWidth={2} />
              Add secret
            </button>
          )}
        </div>
      </div>

      {!canWrite && (
        <div className="settings-banner" style={{ marginBottom: 12 }}>
          Read-only — MANAGE_SECRETS not granted to your role.
        </div>
      )}

      {addForm && (
        <div style={{ border: '1px solid var(--border)', padding: 12, borderRadius: 6, marginBottom: 12, background: 'var(--bg-alt, rgba(255,255,255,0.02))' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="field-input"
              placeholder="key (e.g. plm.s3.access-key)"
              value={addForm.key}
              onChange={e => setAddForm(f => ({ ...f, key: e.target.value }))}
              style={{ flex: 1 }}
            />
            <input
              className="field-input"
              placeholder="value"
              value={addForm.value}
              onChange={e => setAddForm(f => ({ ...f, value: e.target.value }))}
              style={{ flex: 2 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button className="btn btn-xs" onClick={() => setAddForm(null)} disabled={busy}>Cancel</button>
            <button className="btn btn-xs btn-primary" onClick={createKey} disabled={busy}>Create</button>
          </div>
        </div>
      )}

      <table className="settings-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Key</th>
            <th>Value</th>
            <th style={{ width: 220, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {keys.length === 0 && (
            <tr><td colSpan={3} style={{ color: 'var(--muted2)' }}>No secrets yet.</td></tr>
          )}
          {keys.map(key => {
            const revealedVal = revealed[key];
            const isEditing   = editing[key] !== undefined;
            const isRevealed  = revealedVal !== undefined;
            return (
              <tr key={key}>
                <td><code>{key}</code></td>
                <td>
                  {isEditing ? (
                    <input
                      className="field-input"
                      value={editing[key]}
                      onChange={e => setEditing(m => ({ ...m, [key]: e.target.value }))}
                      style={{ width: '100%' }}
                      autoFocus
                    />
                  ) : isRevealed ? (
                    revealedVal === null
                      ? <span style={{ color: 'var(--muted2)' }}>loading…</span>
                      : <code>{revealedVal}</code>
                  ) : (
                    <span style={{ letterSpacing: 2, color: 'var(--muted2)' }}>••••••••</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                    {isEditing ? (
                      <>
                        <button className="btn btn-xs btn-primary" onClick={() => saveEdit(key)} disabled={busy}>Save</button>
                        <button className="btn btn-xs" onClick={() => cancelEdit(key)} disabled={busy}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-xs"
                          onClick={() => toggleReveal(key)}
                          title={isRevealed ? 'Hide value' : 'Reveal value'}
                        >
                          {isRevealed ? 'Hide' : 'Reveal'}
                        </button>
                        {canWrite && (
                          <>
                            <button
                              className="btn btn-xs"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              onClick={() => startEdit(key)}
                              disabled={!isRevealed}
                              title={isRevealed ? 'Edit value' : 'Reveal first to edit'}
                            >
                              <EditIcon size={10} strokeWidth={2} />
                              Edit
                            </button>
                            <button
                              className="btn btn-xs btn-danger"
                              onClick={() => removeKey(key)}
                              disabled={busy}
                              title="Delete secret"
                            >
                              <TrashIcon size={10} strokeWidth={2} />
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Service Registry section ───────────────────────────────────────
   Read-only operational view of every service known to platform-api:
   code, instance count, healthy count, per-instance baseUrl/version/
   health/heartbeat age. The federated item catalog (`/api/platform/items`)
   fans out across the same set, so this is the
   source of truth for "what is the platform calling". Auto-refreshes
   every 5 s. */
export function ServiceRegistrySection({ userId, toast }) {
  const [grouped,  setGrouped]  = useState(null);
  const [tags,     setTags]     = useState(null);
  const [overview, setOverview] = useState(null);
  const [error,    setError]    = useState(null);

  async function reload() {
    try {
      const [g, t, o] = await Promise.all([
        api.getRegistryGrouped(userId).catch(() => ({})),
        api.getRegistryTagsAdmin(userId).catch(() => null),
        api.getRegistryOverview(userId).catch(() => null),
      ]);
      setGrouped(g);
      setTags(t);
      setOverview(o);
      setError(null);
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  useEffect(() => {
    reload();
    const t = setInterval(reload, 5000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error)        return <div className="settings-empty-row">Failed to load registry: {error}</div>;
  if (grouped === null) return <div className="settings-loading">Loading…</div>;

  const codes = Object.keys(grouped).sort();
  const ageSeconds = (iso) => {
    if (!iso) return null;
    const ms = Date.now() - new Date(iso).getTime();
    return Math.max(0, Math.round(ms / 1000));
  };
  const fmtAge = (s) => s == null ? '—' : (s < 60 ? `${s}s` : s < 3600 ? `${Math.round(s/60)}m` : `${Math.round(s/3600)}h`);

  const overviewByService = overview?.services || {};
  const settingsRegs      = overview?.settingsRegistrations || [];

  return (
    <div className="settings-list">
      {/* ── Platform federation summary ─────────────────────────── */}
      <div className="settings-sub-label">Platform Federation</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        Per-service summary as seen by platform-api ({overview?.self || 'platform'}). Settings tabs registered, live item contributions probed via {`/internal/items/visible`}. Refreshes every 5s.
      </div>
      <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ color: 'var(--muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '4px 6px' }}>Service</th>
            <th style={{ padding: '4px 6px' }}>Instances</th>
            <th style={{ padding: '4px 6px' }}>Settings tabs</th>
            <th style={{ padding: '4px 6px' }}>Items</th>
            <th style={{ padding: '4px 6px' }}>Creatable</th>
            <th style={{ padding: '4px 6px' }}>Listable</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(overviewByService).sort().map(code => {
            const e = overviewByService[code] || {};
            return (
              <tr key={code} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{code}</td>
                <td style={{ padding: '4px 6px' }}>{e.instances ?? 0}</td>
                <td style={{ padding: '4px 6px' }}>{e.settingsSections ?? 0}</td>
                <td style={{ padding: '4px 6px' }}>{e.itemDescriptors ?? 0}</td>
                <td style={{ padding: '4px 6px' }}>{e.creatableItems ?? 0}</td>
                <td style={{ padding: '4px 6px' }}>{e.listableItems ?? 0}</td>
              </tr>
            );
          })}
          {Object.keys(overviewByService).length === 0 && (
            <tr><td colSpan={6} style={{ padding: '4px 6px', color: 'var(--muted2)' }}>No services known.</td></tr>
          )}
        </tbody>
      </table>

      {settingsRegs.length > 0 && (
        <>
          <div className="settings-sub-label">Settings Registrations</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
            Sections actively registered by each service against this platform-api.
          </div>
          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: 16 }}>
            <thead>
              <tr style={{ color: 'var(--muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '4px 6px' }}>Service</th>
                <th style={{ padding: '4px 6px' }}>Instance</th>
                <th style={{ padding: '4px 6px' }}>Sections</th>
                <th style={{ padding: '4px 6px' }}>Registered at</th>
              </tr>
            </thead>
            <tbody>
              {settingsRegs.map(r => (
                <tr key={r.serviceCode + ':' + r.instanceId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{r.serviceCode}</td>
                  <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{r.instanceId}</td>
                  <td style={{ padding: '4px 6px' }}>
                    {(r.sections || []).map(s => s.key).join(', ') || '—'}
                  </td>
                  <td style={{ padding: '4px 6px' }}>{r.registeredAt || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className="settings-sub-label">Registered Services (platform-api)</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        Live snapshot from platform-api environment registry. {codes.length} service{codes.length === 1 ? '' : 's'} known.
      </div>

      {codes.length === 0 ? (
        <div className="settings-empty-row">No services registered.</div>
      ) : codes.map(code => {
        const instances = grouped[code] || [];
        const healthy   = instances.filter(i => i.healthy).length;
        return (
          <div key={code} className="settings-card">
            <div className="settings-card-hd" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="settings-card-name" style={{ fontFamily: 'monospace' }}>{code}</span>
              <span style={{ fontSize: 10, color: healthy === instances.length ? 'var(--success)' : 'var(--warn)' }}>
                {healthy}/{instances.length} healthy
              </span>
            </div>
            <div className="settings-card-body">
              <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: 'var(--muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '4px 6px' }}>Instance</th>
                    <th style={{ padding: '4px 6px' }}>Base URL</th>
                    <th style={{ padding: '4px 6px' }}>Version</th>
                    <th style={{ padding: '4px 6px' }}>Tag</th>
                    <th style={{ padding: '4px 6px' }}>Health</th>
                    <th style={{ padding: '4px 6px' }}>Last HB</th>
                    <th style={{ padding: '4px 6px' }}>Failures</th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map(i => (
                    <tr key={i.instanceId} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{i.instanceId}</td>
                      <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{i.baseUrl}</td>
                      <td style={{ padding: '4px 6px' }}>{i.version || '—'}</td>
                      <td style={{ padding: '4px 6px' }}>{i.spaceTag || '—'}</td>
                      <td style={{ padding: '4px 6px', color: i.healthy ? 'var(--success)' : 'var(--danger, #e05252)' }}>
                        {i.healthy ? 'OK' : 'DOWN'}
                      </td>
                      <td style={{ padding: '4px 6px' }}>{fmtAge(ageSeconds(i.lastHeartbeatOk))}</td>
                      <td style={{ padding: '4px 6px' }}>{i.consecutiveFailures ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {tags && Object.keys(tags).length > 0 && (
        <>
          <div className="settings-sub-label" style={{ marginTop: 16 }}>Project Space Tags</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            Service ↔ space-tag affinity (used by gateway routing).
          </div>
          <pre style={{ fontSize: 11, background: 'var(--bg2)', padding: 8, borderRadius: 4 }}>
            {JSON.stringify(tags, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}

/* ── Active section dispatcher ───────────────────────────────────── */
function ActiveSectionContent({ sectionKey, userId, projectSpaceId, canWrite, toast }) {
  if (sectionKey === null) {
    return <div style={{ padding: '32px 24px', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>;
  }
  const plugin = lookupSettingsPlugin(sectionKey);
  if (!plugin) {
    return <div style={{ padding: '32px 24px', color: 'var(--muted)', fontSize: 13 }}>Unknown section: {sectionKey}</div>;
  }
  const { Component, wrapBody } = plugin;
  const el = <Component userId={userId} projectSpaceId={projectSpaceId} canWrite={canWrite} toast={toast} />;
  return wrapBody ? <div className="settings-content-body">{el}</div> : el;
}

/* ── Main SettingsPage ───────────────────────────────────────────── */
export default function SettingsPage({ userId, projectSpaceId, activeSection, onSectionChange, settingsSections, toast }) {

  // Build canWrite lookup from backend-provided sections
  const sectionPerms = useMemo(() => {
    const map = {};
    (settingsSections || []).forEach(g => g.sections.forEach(s => { map[s.key] = s.canWrite; }));
    return map;
  }, [settingsSections]);

  // Resolve label from backend sections
  const activeSectionLabel = useMemo(() => {
    if (!settingsSections) return activeSection;
    for (const g of settingsSections) {
      const s = g.sections.find(s => s.key === activeSection);
      if (s) return s.label;
    }
    return activeSection;
  }, [settingsSections, activeSection]);

  return (
    <div className="settings-content">
      <div className="settings-content-hd">
        <span className="settings-content-title">{activeSectionLabel}</span>
      </div>
      <ActiveSectionContent
        sectionKey={activeSection}
        userId={userId}
        projectSpaceId={projectSpaceId}
        canWrite={sectionPerms[activeSection] ?? false}
        toast={toast}
      />
    </div>
  );
}

// ── Sources section ─────────────────────────────────────────────────────
// Lists Source rows from psm-admin and lets admins bind a resolver to each.
// The built-in SELF source is read-only (lock badge, no edit/delete buttons).
export function SourcesSection({ userId, canWrite, toast }) {
  const [sources, setSources] = useState([]);
  const [resolvers, setResolvers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  async function load() {
    const [s, r] = await Promise.all([
      api.getSourcesAdmin(userId).catch(() => []),
      api.getSourceResolversAdmin(userId).catch(() => []),
    ]);
    setSources(Array.isArray(s) ? s : []);
    setResolvers(Array.isArray(r) ? r : []);
  }
  useEffect(() => { load().finally(() => setLoading(false)); }, [userId]);

  function openCreate() {
    setForm({
      id: '', name: '', description: '',
      resolverInstanceId: resolvers[0]?.instanceId || '',
      color: '', icon: '',
    });
    setModal({ kind: 'create' });
  }
  function openEdit(src) {
    setForm({
      id: src.id, name: src.name, description: src.description || '',
      resolverInstanceId: src.resolverInstanceId,
      color: src.color || '', icon: src.icon || '',
    });
    setModal({ kind: 'edit', original: src });
  }
  function closeModal() { setModal(null); setForm({}); }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || null,
        resolverInstanceId: form.resolverInstanceId,
        color: form.color || null,
        icon: form.icon || null,
      };
      if (modal.kind === 'create') {
        await api.createSource(userId, { id: form.id?.trim(), ...payload });
        toast('Source created', 'success');
      } else {
        await api.updateSource(userId, modal.original.id, payload);
        toast('Source updated', 'success');
      }
      closeModal();
      await load();
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function remove(src) {
    if (!window.confirm(`Delete source "${src.name}" (${src.id})?`)) return;
    try {
      await api.deleteSource(userId, src.id);
      toast('Source deleted', 'success');
      await load();
    } catch (e) { toast(e, 'error'); }
  }

  if (loading) return <div style={{ padding: 16, color: 'var(--muted)' }}>Loading…</div>;

  return (
    <div style={{ padding: '0 16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, fontSize: 12, color: 'var(--muted)' }}>
          Sources declare the systems that host link targets. Each source binds to a resolver
          (algorithm of type <code>algtype-source-resolver</code>). The built-in{' '}
          <span className="settings-badge">SELF</span> source targets nodes inside this PLM
          instance and is not editable.
        </div>
        {canWrite && (
          <button
            className="btn btn-primary btn-sm"
            onClick={openCreate}
            disabled={resolvers.length === 0}
          >
            <PlusIcon size={11} strokeWidth={2} /> Add Source
          </button>
        )}
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}></th>
            <th style={{ width: 160 }}>ID</th>
            <th>Name</th>
            <th>Resolver</th>
            <th>Description</th>
            <th style={{ width: 90 }}></th>
          </tr>
        </thead>
        <tbody>
          {sources.map(s => {
            const Ic = s.icon ? NODE_ICONS[s.icon] : null;
            return (
              <tr key={s.id}>
                <td>
                  {Ic
                    ? <Ic size={16} strokeWidth={1.8} color={s.color || 'var(--muted)'} />
                    : <span style={{ color: 'var(--muted2)' }}>—</span>}
                </td>
                <td className="settings-td-mono">
                  {s.id}{' '}
                  {s.builtin && (
                    <span className="settings-badge" style={{ marginLeft: 4 }}>built-in</span>
                  )}
                </td>
                <td>{s.name}</td>
                <td>
                  <span className="settings-badge">{s.resolverAlgorithmCode}</span>
                </td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{s.description}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {canWrite && !s.builtin && (
                    <>
                      <button
                        className="panel-icon-btn"
                        title="Edit"
                        onClick={() => openEdit(s)}
                      >
                        <EditIcon size={12} strokeWidth={2} color="var(--accent)" />
                      </button>
                      <button
                        className="panel-icon-btn"
                        title="Delete"
                        onClick={() => remove(s)}
                        style={{ marginLeft: 4 }}
                      >
                        <TrashIcon size={12} strokeWidth={2} color="var(--danger)" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modal && (
        <MetaModal
          title={modal.kind === 'create' ? 'New Source' : `Edit ${modal.original.name}`}
          onClose={closeModal}
          onSave={save}
          saving={saving || !form.name || !form.resolverInstanceId
            || (modal.kind === 'create' && !form.id)}
        >
          <Field label="ID">
            <input
              className="field-input"
              value={form.id || ''}
              disabled={modal.kind === 'edit'}
              onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
              placeholder="e.g. FILE_LOCAL"
            />
          </Field>
          <Field label="Name">
            <input
              className="field-input"
              value={form.name || ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="field-input"
              rows={2}
              value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </Field>
          <Field label="Resolver">
            <select
              className="field-input"
              value={form.resolverInstanceId || ''}
              onChange={e => setForm(f => ({ ...f, resolverInstanceId: e.target.value }))}
            >
              <option value="">— select —</option>
              {resolvers.map(r => (
                <option key={r.instanceId} value={r.instanceId}>
                  {r.algorithmCode} — {r.instanceName}
                </option>
              ))}
            </select>
          </Field>
          <ColorField
            label="Color"
            value={form.color}
            onChange={c => setForm(f => ({ ...f, color: c }))}
          />
          <IconPicker
            value={form.icon}
            onChange={i => setForm(f => ({ ...f, icon: i }))}
          />
        </MetaModal>
      )}
    </div>
  );
}

// ── Settings section registrations ───────────────────────────────────────────
// Runs at module load. To add sections from a new service: write the component,
// call registerSettingsPlugin here (or in a dedicated plugin file imported from
// plugins/index.js). SettingsPage itself never needs to change.
registerSettingsPlugin('my-profile',           MyProfileSection);
registerSettingsPlugin('api-playground',       ApiPlayground,           { wrapBody: false });
registerSettingsPlugin('user-manual',          UserManual,              { wrapBody: false });
registerSettingsPlugin('node-types',           NodeTypesSection);
registerSettingsPlugin('domains',              DomainsSection);
registerSettingsPlugin('enums',                EnumsSection);
registerSettingsPlugin('lifecycles',           LifecyclesSection);
registerSettingsPlugin('proj-spaces',          ProjectSpacesSection);
registerSettingsPlugin('users-roles',          UsersRolesSection);
registerSettingsPlugin('access-rights',        AccessRightsSection);
registerSettingsPlugin('sources',              SourcesSection);
registerSettingsPlugin('secrets',              SecretsSection);
registerSettingsPlugin('service-registry',     ServiceRegistrySection);
registerSettingsPlugin('platform-environment', PlatformEnvironmentSection);
registerSettingsPlugin('actions-catalog',      ActionsCatalogSection);
registerSettingsPlugin('platform-algorithms',  AlgorithmSection);
