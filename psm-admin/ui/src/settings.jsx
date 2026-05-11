import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  Plus as PlusIcon,
  Edit2 as EditIcon,
  Trash2 as TrashIcon,
  Copy as CopyIcon,
} from 'lucide-react';
import { initPsaApi, psaApi } from './psaApi';

// Module-level refs set in init()
let _shellAPI        = null;
let _useWebSocket    = () => {};
let _LifecycleDiagram = null;
let _NODE_ICONS      = {};
let _NODE_ICON_NAMES = [];

// Cross-service helpers (set after init)
let pnoReq      = () => Promise.reject('not initialised');
let platformReq = () => Promise.reject('not initialised');

// ── Constants ─────────────────────────────────────────────────────────────────
const LINK_POLICIES     = ['VERSION_TO_MASTER', 'VERSION_TO_VERSION'];
const NUMBERING_SCHEMES = ['ALPHA_NUMERIC'];
const VERSION_POLICIES  = ['NONE', 'ITERATE', 'RELEASE'];
const DATA_TYPES        = ['STRING', 'NUMBER', 'DATE', 'BOOLEAN', 'ENUM'];
const WIDGET_TYPES      = ['TEXT', 'TEXTAREA', 'DROPDOWN', 'DATE_PICKER', 'CHECKBOX'];
const ACTION_TYPES      = ['NONE', 'REQUIRE_SIGNATURE'];
const VERSION_STRATS    = ['NONE', 'ITERATE', 'REVISE'];
const STATE_DEFAULT_COLOR = '#6b7280';
const STATE_PALETTE = [
  '#5b9cf6', '#38bdf8', '#34d399', '#a3e635',
  '#facc15', '#fb923c', '#f87171', '#e879f9',
  '#a78bfa', '#56d18e', '#e8a947', '#6b7280',
];
const ACCEPTED_FORMAT_OPTIONS = ['STEP', 'CATIA_V5'];

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function stateColor(s) {
  return s?.color || s?.COLOR || STATE_DEFAULT_COLOR;
}

function moduleColor(name) {
  if (!name) return { fg: 'var(--muted2)', bg: 'rgba(120,130,150,.14)' };
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  const hue = h % 360;
  return { fg: `hsl(${hue},70%,72%)`, bg: `hsl(${hue},55%,22%)` };
}

function ModuleBadge({ module }) {
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

// ── Shared modal shell ────────────────────────────────────────────────────────
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

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</label>
      {children}
    </div>
  );
}

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
          <button className="btn btn-sm" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => onChange('')}>
            Clear
          </button>
        )}
      </div>
    </Field>
  );
}

function IconPicker({ value, onChange }) {
  return (
    <Field label="Icon">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, padding: '8px 0' }}>
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
        {_NODE_ICON_NAMES.map(name => {
          const Ic = _NODE_ICONS[name];
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
      {value && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: -4 }}>{value}</div>}
    </Field>
  );
}

function ModalSection({ label, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
      {action}
    </div>
  );
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

function EnumPicker({ userId, enumDefinitionId, onChange }) {
  const [enums, setEnums] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    psaApi.getEnums(userId).then(d => setEnums(Array.isArray(d) ? d : [])).catch(() => setEnums([]));
  }, [userId]);

  useEffect(() => {
    if (!enumDefinitionId) { setPreview(null); return; }
    psaApi.getEnumValues(userId, enumDefinitionId)
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

function StateFormFields({ form, setForm, knownMetaKeys = [] }) {
  const meta = form.metadata || {};
  const setMeta = (key, val) => setForm(f => ({
    ...f,
    metadata: { ...(f.metadata || {}), [key]: val ? 'true' : undefined },
  }));
  const knownKeyNames = new Set(knownMetaKeys);
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

// ── Link type attribute table ─────────────────────────────────────────────────
function LinkAttrTable({ userId, linkTypeId, canWrite, toast }) {
  const [attrs, setAttrs] = useState(null);
  const [addingForm, setAddingForm] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() =>
    psaApi.getLinkTypeAttributes(userId, linkTypeId)
      .then(d => setAttrs(Array.isArray(d) ? d : []))
      .catch(() => setAttrs([])),
  [userId, linkTypeId]);

  useEffect(() => { load(); }, [load]);

  function openEdit(a) {
    setEditForm({
      label: a.label || a.LABEL || '',
      dataType: a.data_type || a.DATA_TYPE || 'STRING',
      widgetType: a.widget_type || a.WIDGET_TYPE || 'TEXT',
      required: !!(a.required || a.REQUIRED),
      enumDefinitionId: a.enum_definition_id || a.ENUM_DEFINITION_ID || null,
      displaySection: a.display_section || a.DISPLAY_SECTION || '',
      displayOrder: a.display_order ?? a.DISPLAY_ORDER ?? '',
      defaultValue: a.default_value || a.DEFAULT_VALUE || '',
      namingRegex: a.naming_regex || a.NAMING_REGEX || '',
      allowedValues: a.allowed_values || a.ALLOWED_VALUES || '',
      tooltip: a.tooltip || a.TOOLTIP || '',
    });
    setEditModal({ attr: a });
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await psaApi.updateLinkTypeAttribute(userId, linkTypeId, editModal.attr.id || editModal.attr.ID, {
        label: editForm.label,
        dataType: editForm.dataType,
        widgetType: editForm.widgetType,
        required: !!editForm.required,
        enumDefinitionId: editForm.dataType === 'ENUM' ? (editForm.enumDefinitionId || null) : null,
        displaySection: editForm.displaySection || null,
        displayOrder: editForm.displayOrder !== '' ? Number(editForm.displayOrder) : 0,
        defaultValue: editForm.defaultValue?.trim() || null,
        namingRegex: editForm.namingRegex?.trim() || null,
        allowedValues: editForm.dataType !== 'ENUM' ? (editForm.allowedValues?.trim() || null) : null,
        tooltip: editForm.tooltip?.trim() || null,
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
      await psaApi.createLinkTypeAttribute(userId, linkTypeId, {
        name: addingForm.name.trim(),
        label: addingForm.label.trim(),
        dataType: addingForm.dataType || 'STRING',
        widgetType: addingForm.widgetType || 'TEXT',
        required: !!addingForm.required,
        enumDefinitionId: addingForm.dataType === 'ENUM' ? (addingForm.enumDefinitionId || null) : null,
        displaySection: addingForm.displaySection || null,
        displayOrder: addingForm.displayOrder !== '' ? Number(addingForm.displayOrder) : 0,
        defaultValue: addingForm.defaultValue?.trim() || null,
        namingRegex: addingForm.namingRegex?.trim() || null,
        allowedValues: addingForm.dataType !== 'ENUM' ? (addingForm.allowedValues?.trim() || null) : null,
        tooltip: addingForm.tooltip?.trim() || null,
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
      await psaApi.deleteLinkTypeAttribute(userId, linkTypeId, a.id || a.ID);
      await load();
    } catch (e) { toast(e, 'error'); }
  }

  if (attrs === null) return <div style={{ fontSize: 12, color: 'var(--muted)', padding: '4px 0' }}>Loading…</div>;

  return (
    <>
      {editModal && (
        <MetaModal title="Edit Attribute" onClose={() => setEditModal(null)} onSave={saveEdit} saving={saving} saveLabel="Update">
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
          {editForm.dataType === 'ENUM' && (
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
            <input className="field-input" value={editForm.namingRegex || ''} onChange={e => setEditForm(f => ({ ...f, namingRegex: e.target.value }))} />
          </Field>
          {editForm.dataType !== 'ENUM' && (
            <Field label="Allowed values (comma-separated)">
              <input className="field-input" value={editForm.allowedValues || ''} onChange={e => setEditForm(f => ({ ...f, allowedValues: e.target.value }))} />
            </Field>
          )}
          <Field label="Tooltip">
            <input className="field-input" value={editForm.tooltip || ''} onChange={e => setEditForm(f => ({ ...f, tooltip: e.target.value }))} />
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
                      {canWrite && <button className="panel-icon-btn" title="Edit" onClick={() => openEdit(a)}><EditIcon size={11} strokeWidth={2} color="var(--accent)" /></button>}
                      {canWrite && <button className="panel-icon-btn" title="Delete" onClick={() => del(a)}><TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {attrs.length === 0 && !addingForm && <div className="settings-empty-row">No attributes</div>}

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
          {addingForm.dataType === 'ENUM' && (
            <EnumPicker userId={userId} enumDefinitionId={addingForm.enumDefinitionId || null}
              onChange={v => setAddingForm(f => ({ ...f, enumDefinitionId: v }))} />
          )}
          <input className="field-input" placeholder="Default value (optional)" value={addingForm.defaultValue || ''} onChange={e => setAddingForm(f => ({ ...f, defaultValue: e.target.value }))} />
          <input className="field-input" placeholder="Validation regex (optional)" value={addingForm.namingRegex || ''} onChange={e => setAddingForm(f => ({ ...f, namingRegex: e.target.value }))} />
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
        <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 4 }}
          onClick={() => setAddingForm({ dataType: 'STRING', widgetType: 'TEXT', required: false })}>
          <PlusIcon size={11} strokeWidth={2.5} />
          Add attribute
        </button>
      ) : null}
    </>
  );
}

// ── Link type cascade rules ───────────────────────────────────────────────────
function LinkCascadeTable({ userId, linkTypeId, sourceLifecycleId, targetLifecycleId, canWrite, toast }) {
  const [rules, setRules] = useState(null);
  const [parentTransitions, setParentTransitions] = useState([]);
  const [childStates, setChildStates] = useState([]);
  const [childTransitions, setChildTransitions] = useState([]);
  const [addForm, setAddForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() =>
    psaApi.getLinkTypeCascades(userId, linkTypeId)
      .then(d => setRules(Array.isArray(d) ? d : []))
      .catch(() => setRules([])),
  [userId, linkTypeId]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    const fetches = [];
    if (sourceLifecycleId && parentTransitions.length === 0)
      fetches.push(psaApi.getLifecycleTransitions(userId, sourceLifecycleId).then(d => setParentTransitions(Array.isArray(d) ? d : [])).catch(() => {}));
    if (targetLifecycleId && childStates.length === 0)
      fetches.push(psaApi.getLifecycleStates(userId, targetLifecycleId).then(d => setChildStates(Array.isArray(d) ? d : [])).catch(() => {}));
    if (targetLifecycleId && childTransitions.length === 0)
      fetches.push(psaApi.getLifecycleTransitions(userId, targetLifecycleId).then(d => setChildTransitions(Array.isArray(d) ? d : [])).catch(() => {}));
    Promise.all(fetches).then(() => setAddForm({ parentTransitionId: '', childFromStateId: '', childTransitionId: '' }));
  }

  async function saveAdd() {
    if (!addForm?.parentTransitionId || !addForm?.childFromStateId || !addForm?.childTransitionId) return;
    setSaving(true);
    try {
      await psaApi.createLinkTypeCascade(userId, linkTypeId, addForm.parentTransitionId, addForm.childFromStateId, addForm.childTransitionId);
      await load();
      setAddForm(null);
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function del(rule) {
    const parentTx  = rule.parent_transition_name || rule.PARENT_TRANSITION_NAME || rule.parent_transition_id;
    const childFrom = rule.child_from_state_name  || rule.CHILD_FROM_STATE_NAME  || rule.child_from_state_id;
    const childTx   = rule.child_transition_name  || rule.CHILD_TRANSITION_NAME  || rule.child_transition_id;
    if (!window.confirm(`Delete cascade rule "${parentTx} → [${childFrom}] → ${childTx}"?`)) return;
    try {
      await psaApi.deleteLinkTypeCascade(userId, linkTypeId, rule.id || rule.ID);
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

// ── Node Types section ────────────────────────────────────────────────────────
export function NodeTypesSection({ userId, canWrite, toast }) {
  const [types,      setTypes]      = useState([]);
  const [expanded,   setExpanded]   = useState(null);
  const [attrs,      setAttrs]      = useState({});
  const [links,      setLinks]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [lifecycles, setLifecycles] = useState([]);
  const [sources,    setSources]    = useState([]);
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState({});
  const [saving,     setSaving]     = useState(false);

  function loadTypes() {
    return psaApi.getNodeTypes(userId).then(d => setTypes(Array.isArray(d) ? d : []));
  }

  useEffect(() => {
    loadTypes().finally(() => setLoading(false));
    psaApi.getLifecycles(userId).then(d => setLifecycles(Array.isArray(d) ? d : []));
    psaApi.getSources(userId).then(d => setSources(Array.isArray(d) ? d : []));
  }, [userId]);

  _useWebSocket('/topic/metamodel', (evt) => { if (evt.event === 'METAMODEL_CHANGED') loadTypes(); }, userId);

  const typeNameMap = {};
  types.forEach(nt => { typeNameMap[nt.id || nt.ID] = nt.name || nt.NAME; });

  async function expand(nt) {
    const id = nt.id || nt.ID;
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    const fetches = [];
    if (!attrs[id]) {
      fetches.push(
        psaApi.getNodeTypeAttributes(userId, id)
          .then(a => setAttrs(s => ({ ...s, [id]: Array.isArray(a) ? a : [] })))
          .catch(() => setAttrs(s => ({ ...s, [id]: [] })))
      );
    }
    if (!links[id]) {
      fetches.push(
        psaApi.getNodeTypeLinkTypes(userId, id)
          .then(l => setLinks(s => ({ ...s, [id]: Array.isArray(l) ? l : [] })))
          .catch(() => setLinks(s => ({ ...s, [id]: [] })))
      );
    }
    await Promise.all(fetches);
  }

  function openModal(type, ctx = {}, defaults = {}) { setForm(defaults); setModal({ type, ctx }); }
  function closeModal() { setModal(null); setForm({}); }

  async function handleSave() {
    setSaving(true);
    try {
      const { type, ctx } = modal;
      if (type === 'create-nodetype') {
        await psaApi.createNodeType(userId, {
          name: form.name?.trim(), description: form.description?.trim() || null,
          lifecycleId: form.lifecycleId || null,
          numberingScheme: form.numberingScheme || 'ALPHA_NUMERIC',
          versionPolicy: form.versionPolicy || 'ITERATE',
          color: form.color || null, icon: form.icon || null,
          parentNodeTypeId: form.parentNodeTypeId || null,
        });
        await loadTypes();
      } else if (type === 'edit-identity') {
        await psaApi.updateNodeTypeIdentity(userId, ctx.nodeTypeId, {
          logicalIdLabel: form.logicalIdLabel || 'Identifier',
          logicalIdPattern: form.logicalIdPattern?.trim() || null,
        });
        await loadTypes(); setExpanded(null);
      } else if (type === 'edit-appearance') {
        await psaApi.updateNodeTypeAppearance(userId, ctx.nodeTypeId, form.color || null, form.icon || null);
        await loadTypes(); setExpanded(null);
      } else if (type === 'edit-lifecycle') {
        await psaApi.updateNodeTypeLifecycle(userId, ctx.nodeTypeId, form.lifecycleId || null);
        await loadTypes(); setExpanded(null);
      } else if (type === 'edit-versioning') {
        await Promise.all([
          psaApi.updateNodeTypeNumberingScheme(userId, ctx.nodeTypeId, form.numberingScheme || 'ALPHA_NUMERIC'),
          psaApi.updateNodeTypeVersionPolicy(userId, ctx.nodeTypeId, form.versionPolicy || 'ITERATE'),
        ]);
        await loadTypes(); setExpanded(null);
      } else if (type === 'create-attr') {
        await psaApi.createAttribute(userId, ctx.nodeTypeId, {
          name: form.name?.trim(), label: form.label?.trim(),
          dataType: form.dataType || 'STRING', widgetType: form.widgetType || 'TEXT',
          required: !!form.required, asName: !!form.asName,
          enumDefinitionId: form.dataType === 'ENUM' ? (form.enumDefinitionId || null) : null,
          displaySection: form.displaySection?.trim() || null,
          displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : 0,
          defaultValue: form.defaultValue?.trim() || null, namingRegex: form.namingRegex?.trim() || null,
          allowedValues: form.dataType !== 'ENUM' ? (form.allowedValues?.trim() || null) : null,
          tooltip: form.tooltip?.trim() || null,
        });
        const updated = await psaApi.getNodeTypeAttributes(userId, ctx.nodeTypeId);
        setAttrs(s => ({ ...s, [ctx.nodeTypeId]: Array.isArray(updated) ? updated : [] }));
      } else if (type === 'edit-attr') {
        await psaApi.updateAttribute(userId, ctx.nodeTypeId, ctx.attrId, {
          label: form.label?.trim(), dataType: form.dataType || 'STRING',
          widgetType: form.widgetType || 'TEXT', required: !!form.required, asName: !!form.asName,
          enumDefinitionId: form.dataType === 'ENUM' ? (form.enumDefinitionId || null) : null,
          displaySection: form.displaySection?.trim() || null,
          displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : 0,
          defaultValue: form.defaultValue?.trim() || null, namingRegex: form.namingRegex?.trim() || null,
          allowedValues: form.dataType !== 'ENUM' ? (form.allowedValues?.trim() || null) : null,
          tooltip: form.tooltip?.trim() || null,
        });
        const updated = await psaApi.getNodeTypeAttributes(userId, ctx.nodeTypeId);
        setAttrs(s => ({ ...s, [ctx.nodeTypeId]: Array.isArray(updated) ? updated : [] }));
      } else if (type === 'create-link') {
        const tgtSrc = form.targetSourceId || 'SELF';
        const tgtType = tgtSrc === 'SELF' ? (form.targetNodeTypeId || null) : (form.targetType || null);
        await psaApi.createLinkType(userId, {
          name: form.name?.trim(), sourceNodeTypeId: ctx.nodeTypeId,
          targetSourceId: tgtSrc, targetType: tgtType,
          linkPolicy: form.linkPolicy || 'VERSION_TO_MASTER',
          minCardinality: Number(form.minCardinality) || 0,
          maxCardinality: form.maxCardinality !== '' ? Number(form.maxCardinality) : null,
          color: form.color || null,
        });
        const updated = await psaApi.getNodeTypeLinkTypes(userId, ctx.nodeTypeId);
        setLinks(s => ({ ...s, [ctx.nodeTypeId]: Array.isArray(updated) ? updated : [] }));
      } else if (type === 'edit-link') {
        const eSrc = form.targetSourceId || 'SELF';
        const eType = eSrc === 'SELF' ? (form.targetNodeTypeId || null) : (form.targetType || null);
        await psaApi.updateLinkType(userId, ctx.linkTypeId, {
          name: form.name?.trim(), description: form.description?.trim() || null,
          linkPolicy: form.linkPolicy || 'VERSION_TO_MASTER',
          minCardinality: Number(form.minCardinality) || 0,
          maxCardinality: form.maxCardinality !== '' && form.maxCardinality != null ? Number(form.maxCardinality) : null,
          color: form.color || null, targetSourceId: eSrc, targetNodeTypeId: eType,
        });
        const updated = await psaApi.getNodeTypeLinkTypes(userId, ctx.nodeTypeId);
        setLinks(s => ({ ...s, [ctx.nodeTypeId]: Array.isArray(updated) ? updated : [] }));
      } else if (type === 'edit-parent') {
        await psaApi.updateNodeTypeParent(userId, ctx.nodeTypeId, form.parentNodeTypeId || null);
        await loadTypes(); setExpanded(null);
      }
      closeModal();
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function deleteNodeType(e, nt) {
    e.stopPropagation();
    if (!window.confirm(`Delete node type "${nt.name || nt.NAME}"?\n\nThis also deletes all its attributes and link types. Cannot be undone.`)) return;
    try {
      await psaApi.deleteNodeType(userId, nt.id || nt.ID);
      await loadTypes();
      if (expanded === (nt.id || nt.ID)) setExpanded(null);
    } catch (e) { toast(e, 'error'); }
  }

  async function deleteAttr(e, nodeTypeId, a) {
    e.stopPropagation();
    if (!window.confirm(`Delete attribute "${a.label || a.LABEL || a.name || a.NAME}"?`)) return;
    try {
      await psaApi.deleteAttribute(userId, nodeTypeId, a.id || a.ID);
      const updated = await psaApi.getNodeTypeAttributes(userId, nodeTypeId);
      setAttrs(s => ({ ...s, [nodeTypeId]: Array.isArray(updated) ? updated : [] }));
    } catch (e) { toast(e, 'error'); }
  }

  async function deleteLt(e, nodeTypeId, lt) {
    e.stopPropagation();
    if (!window.confirm(`Delete link type "${lt.name || lt.NAME}"?`)) return;
    try {
      await psaApi.deleteLinkType(userId, lt.id || lt.ID);
      const updated = await psaApi.getNodeTypeLinkTypes(userId, nodeTypeId);
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
          saving={saveDisabled()}
          saveLabel={['edit-identity','edit-attr','edit-link','edit-parent'].includes(modal.type) ? 'Update' : 'Create'}
        >
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
                {lifecycles.map(lc => { const lid = lc.id || lc.ID; return <option key={lid} value={lid}>{lc.name || lc.NAME || lid}</option>; })}
              </select>
            </Field>
            <Field label="Numbering Scheme">
              <select className="field-input" value={form.numberingScheme || 'ALPHA_NUMERIC'} onChange={e => setForm(f => ({ ...f, numberingScheme: e.target.value }))}>
                {NUMBERING_SCHEMES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Version Policy">
              <select className="field-input" value={form.versionPolicy || 'ITERATE'} onChange={e => setForm(f => ({ ...f, versionPolicy: e.target.value }))}>
                {VERSION_POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Parent node type (optional)">
              <select className="field-input" value={form.parentNodeTypeId || ''} onChange={e => setForm(f => ({ ...f, parentNodeTypeId: e.target.value }))}>
                <option value="">None</option>
                {types.map(nt => { const tid = nt.id || nt.ID; return <option key={tid} value={tid}>{nt.name || nt.NAME || tid}</option>; })}
              </select>
            </Field>
          </>}
          {modal.type === 'edit-identity' && <>
            <Field label="Label">
              <input className="field-input" autoFocus value={form.logicalIdLabel || ''} onChange={e => setForm(f => ({ ...f, logicalIdLabel: e.target.value }))} placeholder="Identifier" />
            </Field>
            <Field label="Validation Pattern (regex)">
              <input className="field-input" value={form.logicalIdPattern || ''} onChange={e => setForm(f => ({ ...f, logicalIdPattern: e.target.value }))} placeholder="e.g. ^[A-Z]{2}-\d{4}$" />
            </Field>
          </>}
          {modal.type === 'edit-parent' && <>
            <Field label="Parent node type">
              <select className="field-input" autoFocus value={form.parentNodeTypeId || ''} onChange={e => setForm(f => ({ ...f, parentNodeTypeId: e.target.value }))}>
                <option value="">None (root type)</option>
                {types.filter(nt => (nt.id || nt.ID) !== modal.ctx.nodeTypeId).map(nt => {
                  const tid = nt.id || nt.ID;
                  return <option key={tid} value={tid}>{nt.name || nt.NAME || tid}</option>;
                })}
              </select>
            </Field>
          </>}
          {modal.type === 'edit-lifecycle' && <>
            <Field label="Lifecycle">
              <select className="field-input" autoFocus value={form.lifecycleId || ''} onChange={e => setForm(f => ({ ...f, lifecycleId: e.target.value }))}>
                <option value="">None</option>
                {lifecycles.map(lc => { const lid = lc.id || lc.ID; return <option key={lid} value={lid}>{lc.name || lc.NAME || lid}</option>; })}
              </select>
            </Field>
          </>}
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
          </>}
          {modal.type === 'edit-appearance' && <>
            <ColorField label="Color" value={form.color || ''} onChange={v => setForm(f => ({ ...f, color: v }))} />
            <IconPicker value={form.icon || ''} onChange={v => setForm(f => ({ ...f, icon: v }))} />
          </>}
          {modal.type === 'create-attr' && <AttrFields form={form} setForm={setForm} userId={userId} />}
          {modal.type === 'edit-attr'   && <AttrFields form={form} setForm={setForm} autoFocusName={false} userId={userId} />}
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
            <ColorField label="Color" value={form.color || ''} onChange={v => setForm(f => ({ ...f, color: v }))} />
          </>}
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
            <ColorField label="Color" value={form.color || ''} onChange={v => setForm(f => ({ ...f, color: v }))} />
            <ModalSection label="Attributes" />
            <LinkAttrTable userId={userId} linkTypeId={modal.ctx.linkTypeId} canWrite={canWrite} toast={toast} />
            <ModalSection label="Cascade Rules" />
            {(() => {
              const srcNt = types.find(t => (t.id || t.ID) === modal.ctx.nodeTypeId);
              const tgtNt = types.find(t => (t.id || t.ID) === modal.ctx.targetNodeTypeId);
              return (
                <LinkCascadeTable
                  userId={userId}
                  linkTypeId={modal.ctx.linkTypeId}
                  sourceLifecycleId={srcNt?.lifecycle_id || srcNt?.LIFECYCLE_ID}
                  targetLifecycleId={tgtNt?.lifecycle_id || tgtNt?.LIFECYCLE_ID}
                  canWrite={canWrite}
                  toast={toast}
                />
              );
            })()}
          </>}
        </MetaModal>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        {canWrite && (
          <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={() => openModal('create-nodetype', {}, { lifecycleId: lifecycles[0] ? (lifecycles[0].id || lifecycles[0].ID) : '', numberingScheme: 'ALPHA_NUMERIC', versionPolicy: 'ITERATE' })}>
            <PlusIcon size={11} strokeWidth={2.5} />
            New node type
          </button>
        )}
      </div>

      {types.map(nt => {
        const id        = nt.id   || nt.ID;
        const name      = nt.name || nt.NAME || id;
        const isExp     = expanded === id;
        const ntAttrs   = attrs[id] || [];
        const ntLinks   = links[id] || [];
        const lidLabel  = nt.logical_id_label   || nt.LOGICAL_ID_LABEL   || 'Identifier';
        const lidPattern = nt.logical_id_pattern || nt.LOGICAL_ID_PATTERN || '';
        const numScheme = nt.numbering_scheme || nt.NUMBERING_SCHEME || 'ALPHA_NUMERIC';
        const verPolicy = nt.version_policy   || nt.VERSION_POLICY   || 'ITERATE';
        const lcId      = nt.lifecycle_id     || nt.LIFECYCLE_ID     || null;
        const lcName    = lifecycles.find(lc => (lc.id || lc.ID) === lcId)?.name || lcId || '—';
        const ntColor   = nt.color || nt.COLOR || null;
        const ntIcon    = nt.icon  || nt.ICON  || null;
        const NtIcon    = ntIcon ? _NODE_ICONS[ntIcon] : null;
        const parentId  = nt.parent_node_type_id || nt.PARENT_NODE_TYPE_ID || null;
        const parentName = parentId ? (typeNameMap[parentId] || parentId) : null;
        return (
          <div key={id} className="settings-card">
            <div className="settings-card-hd" onClick={() => expand(nt)} style={{ display: 'flex', alignItems: 'center' }}>
              <span className="settings-card-chevron">
                {isExp ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" /> : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
              </span>
              {NtIcon
                ? <NtIcon size={14} strokeWidth={2} color={ntColor || 'var(--muted)'} style={{ marginRight: 4, flexShrink: 0 }} />
                : ntColor ? <span style={{ width: 10, height: 10, borderRadius: '50%', background: ntColor, flexShrink: 0, marginRight: 4 }} /> : null
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
                      <td>{parentName ? <span className="settings-badge">{parentName}</span> : <span style={{ color: 'var(--muted2)' }}>—</span>}</td>
                    </tr>
                  </tbody>
                </table>

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
                    <tr><td style={{ color: 'var(--muted)', width: 110 }}>Label</td><td className="settings-td-mono">{lidLabel}</td></tr>
                    <tr><td style={{ color: 'var(--muted)' }}>Pattern</td><td className="settings-td-mono">{lidPattern || '—'}</td></tr>
                  </tbody>
                </table>

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
                    <tr><td style={{ color: 'var(--muted)', width: 110 }}>Numbering</td><td><span className="settings-badge">{numScheme}</span></td></tr>
                    <tr><td style={{ color: 'var(--muted)' }}>Policy</td><td><span className="settings-badge">{verPolicy}</span></td></tr>
                  </tbody>
                </table>

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
                      <td>{ntColor ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: ntColor, display: 'inline-block' }} /><span className="settings-td-mono" style={{ fontSize: 10 }}>{ntColor}</span></span> : <span style={{ color: 'var(--muted2)' }}>—</span>}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--muted)' }}>Icon</td>
                      <td>{NtIcon ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><NtIcon size={13} strokeWidth={2} color={ntColor || 'var(--muted)'} /><span style={{ fontSize: 10, color: 'var(--muted)' }}>{ntIcon}</span></span> : <span style={{ color: 'var(--muted2)' }}>—</span>}</td>
                    </tr>
                  </tbody>
                </table>

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
                    <thead><tr><th>Name</th><th>Label</th><th>Type</th><th>Req</th><th>As Name</th><th>Section</th><th></th></tr></thead>
                    <tbody>
                      {[...ntAttrs].sort((a, b) => (a.display_order || a.DISPLAY_ORDER || 0) - (b.display_order || b.DISPLAY_ORDER || 0)).map(a => {
                        const aid = a.id || a.ID;
                        const aname = a.name || a.NAME;
                        const albl  = a.label || a.LABEL || aname;
                        const atype = a.widget_type || a.WIDGET_TYPE || 'TEXT';
                        const areq  = !!(a.required || a.REQUIRED);
                        const aAsNm = !!(a.as_name || a.AS_NAME);
                        const asec  = a.display_section || a.DISPLAY_SECTION || '—';
                        const aInherited = !!(a.inherited || a.INHERITED);
                        const aInheritedFrom = a.inherited_from || a.INHERITED_FROM || null;
                        return (
                          <tr key={aid}>
                            <td className="settings-td-mono">
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                {aname}
                                {aInherited && <span style={{ fontSize: 9, background: 'var(--accent-dim,rgba(99,179,237,.15))', color: 'var(--accent)', borderRadius: 3, padding: '1px 4px', whiteSpace: 'nowrap' }}>from {aInheritedFrom || 'parent'}</span>}
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
                                    name: aname, label: albl,
                                    dataType: a.data_type || a.DATA_TYPE || 'STRING',
                                    widgetType: a.widget_type || a.WIDGET_TYPE || 'TEXT',
                                    required: areq, asName: aAsNm,
                                    enumDefinitionId: a.enum_definition_id || a.ENUM_DEFINITION_ID || null,
                                    displaySection: a.display_section || a.DISPLAY_SECTION || '',
                                    displayOrder: a.display_order ?? a.DISPLAY_ORDER ?? '',
                                    defaultValue: a.default_value || a.DEFAULT_VALUE || '',
                                    namingRegex: a.naming_regex || a.NAMING_REGEX || '',
                                    allowedValues: a.allowed_values || a.ALLOWED_VALUES || '',
                                    tooltip: a.tooltip || a.TOOLTIP || '',
                                  })}><EditIcon size={11} strokeWidth={2} color="var(--accent)" /></button>
                                )}
                                {canWrite && !aInherited && (
                                  <button className="panel-icon-btn" title="Delete" onClick={e => deleteAttr(e, id, a)}><TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" /></button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

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
                    <thead><tr><th></th><th>Name</th><th>Target</th><th>Policy</th><th>Cardinality</th><th></th></tr></thead>
                    <tbody>
                      {ntLinks.map(lt => {
                        const lid    = lt.id   || lt.ID;
                        const lname  = lt.name || lt.NAME || lid;
                        const tgtSrc = lt.target_source_id || lt.TARGET_SOURCE_ID || 'SELF';
                        const tgtId  = lt.target_type || lt.TARGET_TYPE;
                        const tgtName = tgtId ? (tgtSrc === 'SELF' ? (typeNameMap[tgtId] || tgtId) : `${tgtSrc}:${tgtId}`) : 'Any';
                        const policy = lt.link_policy || lt.LINK_POLICY || '—';
                        const minC   = lt.min_cardinality ?? lt.MIN_CARDINALITY ?? 0;
                        const maxC   = lt.max_cardinality ?? lt.MAX_CARDINALITY;
                        const card   = maxC == null ? `${minC}..*` : `${minC}..${maxC}`;
                        const ltColor = lt.color || lt.COLOR || null;
                        const lInherited = !!(lt.inherited || lt.INHERITED);
                        const lInheritedFrom = lt.inherited_from || lt.INHERITED_FROM || null;
                        return (
                          <tr key={lid} style={lInherited ? { opacity: 0.75 } : undefined}>
                            <td style={{ width: 18 }}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: ltColor || 'var(--border)' }} /></td>
                            <td className="settings-td-mono">
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                {lname}
                                {lInherited && <span style={{ fontSize: 9, background: 'var(--accent-dim,rgba(99,179,237,.15))', color: 'var(--accent)', borderRadius: 3, padding: '1px 4px', whiteSpace: 'nowrap' }}>from {lInheritedFrom || 'parent'}</span>}
                              </span>
                            </td>
                            <td>{tgtName}</td>
                            <td><span className="settings-badge">{policy}</span></td>
                            <td style={{ color: 'var(--muted)' }}>{card}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {canWrite && !lInherited && (
                                  <button className="panel-icon-btn" title="Edit link type" onClick={() => openModal('edit-link', { nodeTypeId: id, linkTypeId: lid, linkName: lname, targetNodeTypeId: tgtId }, {
                                    name: lname, description: lt.description || lt.DESCRIPTION || '',
                                    linkPolicy: policy, minCardinality: String(minC),
                                    maxCardinality: maxC != null ? String(maxC) : '',
                                    color: ltColor || '', targetSourceId: tgtSrc,
                                    targetNodeTypeId: tgtId || '',
                                    targetType: tgtSrc !== 'SELF' ? (tgtId || '') : '',
                                  })}><EditIcon size={11} strokeWidth={2} color="var(--accent)" /></button>
                                )}
                                {canWrite && !lInherited && (
                                  <button className="panel-icon-btn" title="Delete link type" onClick={e => deleteLt(e, id, lt)}><TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" /></button>
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

// ── Domains section ───────────────────────────────────────────────────────────
export function DomainsSection({ userId, canWrite, toast }) {
  const [domains,  setDomains]  = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [attrs,    setAttrs]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);

  function loadDomains() {
    return psaApi.getDomains(userId).then(d => setDomains(Array.isArray(d) ? d : []));
  }

  useEffect(() => { loadDomains().finally(() => setLoading(false)); }, [userId]);
  _useWebSocket('/topic/metamodel', (evt) => { if (evt.event === 'METAMODEL_CHANGED') loadDomains(); }, userId);

  async function expand(dom) {
    const id = dom.id;
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!attrs[id]) {
      try {
        const a = await psaApi.getDomainAttributes(userId, id);
        setAttrs(s => ({ ...s, [id]: Array.isArray(a) ? a : [] }));
      } catch { setAttrs(s => ({ ...s, [id]: [] })); }
    }
  }

  function openModal(type, ctx = {}, defaults = {}) { setForm(defaults); setModal({ type, ctx }); }
  function closeModal() { setModal(null); setForm({}); }

  async function handleSave() {
    setSaving(true);
    try {
      const { type, ctx } = modal;
      if (type === 'create-domain') {
        await psaApi.createDomain(userId, { name: form.name?.trim(), description: form.description?.trim() || null, color: form.color || null, icon: form.icon || null });
        await loadDomains();
      } else if (type === 'edit-domain') {
        await psaApi.updateDomain(userId, ctx.domainId, { name: form.name?.trim(), description: form.description?.trim() || null, color: form.color || null, icon: form.icon || null });
        await loadDomains();
      } else if (type === 'create-attr') {
        await psaApi.createDomainAttribute(userId, ctx.domainId, {
          name: form.name?.trim(), label: form.label?.trim(),
          dataType: form.dataType || 'STRING', widgetType: form.widgetType || 'TEXT',
          required: !!form.required,
          enumDefinitionId: form.dataType === 'ENUM' ? (form.enumDefinitionId || null) : null,
          displaySection: form.displaySection?.trim() || null,
          displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : 0,
          defaultValue: form.defaultValue?.trim() || null, namingRegex: form.namingRegex?.trim() || null,
          allowedValues: form.dataType !== 'ENUM' ? (form.allowedValues?.trim() || null) : null,
          tooltip: form.tooltip?.trim() || null,
        });
        const updated = await psaApi.getDomainAttributes(userId, ctx.domainId);
        setAttrs(s => ({ ...s, [ctx.domainId]: Array.isArray(updated) ? updated : [] }));
      } else if (type === 'edit-attr') {
        await psaApi.updateDomainAttribute(userId, ctx.domainId, ctx.attrId, {
          name: form.name?.trim(), label: form.label?.trim(),
          dataType: form.dataType || 'STRING', widgetType: form.widgetType || 'TEXT',
          required: !!form.required,
          enumDefinitionId: form.dataType === 'ENUM' ? (form.enumDefinitionId || null) : null,
          displaySection: form.displaySection?.trim() || null,
          displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : 0,
          defaultValue: form.defaultValue?.trim() || null, namingRegex: form.namingRegex?.trim() || null,
          allowedValues: form.dataType !== 'ENUM' ? (form.allowedValues?.trim() || null) : null,
          tooltip: form.tooltip?.trim() || null,
        });
        const updated = await psaApi.getDomainAttributes(userId, ctx.domainId);
        setAttrs(s => ({ ...s, [ctx.domainId]: Array.isArray(updated) ? updated : [] }));
      }
      closeModal();
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function deleteDomain(e, dom) {
    e.stopPropagation();
    if (!window.confirm(`Delete domain "${dom.name}"?\n\nThis also deletes all its attributes. Cannot be undone.`)) return;
    try {
      await psaApi.deleteDomain(userId, dom.id);
      await loadDomains();
      if (expanded === dom.id) setExpanded(null);
    } catch (e) { toast(e, 'error'); }
  }

  async function deleteAttr(e, domainId, a) {
    e.stopPropagation();
    if (!window.confirm(`Delete attribute "${a.label || a.name}"?`)) return;
    try {
      await psaApi.deleteDomainAttribute(userId, domainId, a.id);
      const updated = await psaApi.getDomainAttributes(userId, domainId);
      setAttrs(s => ({ ...s, [domainId]: Array.isArray(updated) ? updated : [] }));
    } catch (e) { toast(e, 'error'); }
  }

  if (loading) return <div className="settings-loading">Loading…</div>;

  return (
    <div className="settings-list">
      {modal && (
        <MetaModal
          title={modal.type === 'create-domain' ? 'New Domain' : modal.type === 'edit-domain' ? 'Edit Domain' : modal.type === 'create-attr' ? 'Add Attribute' : 'Edit Attribute'}
          width={480}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
          saveLabel={['edit-domain','edit-attr'].includes(modal.type) ? 'Update' : 'Create'}
        >
          {(modal.type === 'create-domain' || modal.type === 'edit-domain') && <>
            <Field label="Name *">
              <input className="field-input" autoFocus value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electrical" />
            </Field>
            <Field label="Description">
              <input className="field-input" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </Field>
            <ColorField label="Color" value={form.color || ''} onChange={v => setForm(f => ({ ...f, color: v }))} />
          </>}
          {modal.type === 'create-attr' && <AttrFields form={form} setForm={setForm} hideAsName={true} userId={userId} />}
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
            {form.dataType === 'ENUM' && <EnumPicker userId={userId} enumDefinitionId={form.enumDefinitionId || null} onChange={v => setForm(f => ({ ...f, enumDefinitionId: v }))} />}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
              <Field label="Section"><input className="field-input" value={form.displaySection || ''} onChange={e => setForm(f => ({ ...f, displaySection: e.target.value }))} /></Field>
              <Field label="Order"><input className="field-input" type="number" min="0" value={form.displayOrder ?? ''} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} /></Field>
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
          <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => openModal('create-domain', {}, {})}>
            <PlusIcon size={11} strokeWidth={2.5} />
            New domain
          </button>
        )}
      </div>

      {domains.map(dom => {
        const id = dom.id;
        const name = dom.name || id;
        const isExp = expanded === id;
        const domAttrs = attrs[id] || [];
        const domColor = dom.color || null;
        return (
          <div key={id} className="settings-card">
            <div className="settings-card-hd" onClick={() => expand(dom)} style={{ display: 'flex', alignItems: 'center' }}>
              <span className="settings-card-chevron">
                {isExp ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" /> : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
              </span>
              {domColor && <span style={{ width: 10, height: 10, borderRadius: '50%', background: domColor, flexShrink: 0, marginRight: 4 }} />}
              <span className="settings-card-name">{name}</span>
              <span className="settings-card-id">{id}</span>
              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                {canWrite && <button className="panel-icon-btn" title="Edit domain" onClick={e => { e.stopPropagation(); openModal('edit-domain', { domainId: id }, { name: dom.name, description: dom.description || '', color: domColor || '' }); }}><EditIcon size={12} strokeWidth={2} color="var(--accent)" /></button>}
                {canWrite && <button className="panel-icon-btn" title="Delete domain" onClick={e => deleteDomain(e, dom)}><TrashIcon size={12} strokeWidth={2} color="var(--danger, #f87171)" /></button>}
              </div>
            </div>
            {isExp && (
              <div className="settings-card-body">
                {dom.description && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{dom.description}</div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="settings-sub-label" style={{ margin: 0 }}>Attributes</span>
                  {canWrite && <button className="panel-icon-btn" title="Add attribute" onClick={() => openModal('create-attr', { domainId: id }, { dataType: 'STRING', widgetType: 'TEXT', required: false })}><PlusIcon size={12} strokeWidth={2.5} color="var(--accent)" /></button>}
                </div>
                {domAttrs.length === 0 ? <div className="settings-empty-row">No attributes defined</div> : (
                  <table className="settings-table">
                    <thead><tr><th>Name</th><th>Label</th><th>Type</th><th>Req</th><th>Section</th><th></th></tr></thead>
                    <tbody>
                      {[...domAttrs].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(a => (
                        <tr key={a.id}>
                          <td className="settings-td-mono">{a.name}</td>
                          <td>{a.label || a.name}</td>
                          <td><span className="settings-badge">{a.widget_type || 'TEXT'}</span></td>
                          <td style={{ color: a.required ? 'var(--success)' : 'var(--muted)' }}>{a.required ? '✓' : '—'}</td>
                          <td style={{ color: 'var(--muted)' }}>{a.display_section || '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {canWrite && <button className="panel-icon-btn" title="Edit" onClick={() => openModal('edit-attr', { domainId: id, attrId: a.id }, {
                                name: a.name, label: a.label || a.name,
                                dataType: a.data_type || 'STRING', widgetType: a.widget_type || 'TEXT',
                                required: !!a.required, enumDefinitionId: a.enum_definition_id || null,
                                displaySection: a.display_section || '', displayOrder: a.display_order ?? '',
                                defaultValue: a.default_value || '', namingRegex: a.naming_regex || '',
                                allowedValues: a.allowed_values || '', tooltip: a.tooltip || '',
                              })}><EditIcon size={11} strokeWidth={2} color="var(--accent)" /></button>}
                              {canWrite && <button className="panel-icon-btn" title="Delete" onClick={e => deleteAttr(e, id, a)}><TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" /></button>}
                            </div>
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
      })}
      {domains.length === 0 && <div className="settings-empty-row">No domains defined yet</div>}
    </div>
  );
}

// ── Enums section ─────────────────────────────────────────────────────────────
export function EnumsSection({ userId, canWrite, toast }) {
  const [enums,        setEnums]        = useState([]);
  const [expanded,     setExpanded]     = useState(null);
  const [values,       setValues]       = useState({});
  const [modal,        setModal]        = useState(null);
  const [form,         setForm]         = useState({});
  const [saving,       setSaving]       = useState(false);
  const [addingValue,  setAddingValue]  = useState(null);
  const [editingValue, setEditingValue] = useState(null);

  const loadEnums = useCallback(() =>
    psaApi.getEnums(userId).then(d => setEnums(Array.isArray(d) ? d : [])).catch(() => setEnums([])),
  [userId]);

  useEffect(() => { loadEnums(); }, [loadEnums]);

  function loadValues(enumId) {
    psaApi.getEnumValues(userId, enumId)
      .then(d => setValues(s => ({ ...s, [enumId]: Array.isArray(d) ? d : [] })))
      .catch(() => setValues(s => ({ ...s, [enumId]: [] })));
  }

  function toggle(id) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!values[id]) loadValues(id);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { type, ctx } = modal;
      if (type === 'create-enum') {
        await psaApi.createEnum(userId, { name: form.name?.trim(), description: form.description?.trim() || null });
        await loadEnums();
      } else if (type === 'edit-enum') {
        await psaApi.updateEnum(userId, ctx.enumId, { name: form.name?.trim(), description: form.description?.trim() || null });
        await loadEnums();
      }
      setModal(null); setForm({});
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function deleteEnum(e, en) {
    e.stopPropagation();
    if (!window.confirm(`Delete enumeration "${en.name}"?\n\nThis also deletes all its values. Cannot be undone.`)) return;
    try {
      await psaApi.deleteEnum(userId, en.id);
      await loadEnums();
      if (expanded === en.id) setExpanded(null);
    } catch (e) { toast(e, 'error'); }
  }

  async function addValue(enumId) {
    if (!addingValue?.value?.trim()) return;
    setSaving(true);
    try {
      await psaApi.addEnumValue(userId, enumId, { value: addingValue.value.trim(), label: addingValue.label?.trim() || null });
      loadValues(enumId);
      setAddingValue(null);
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function deleteValue(enumId, v) {
    if (!window.confirm(`Delete value "${v.value}"?`)) return;
    try {
      await psaApi.deleteEnumValue(userId, enumId, v.id);
      loadValues(enumId);
    } catch (e) { toast(e, 'error'); }
  }

  async function saveEditValue() {
    if (!editingValue) return;
    setSaving(true);
    try {
      await psaApi.updateEnumValue(userId, editingValue.enumId, editingValue.id, {
        value: editingValue.value?.trim(), label: editingValue.label?.trim() || null, displayOrder: editingValue.displayOrder ?? 0,
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
      await psaApi.reorderEnumValues(userId, enumId, reordered.map(v => v.id));
    } catch (e) { toast(e, 'error'); loadValues(enumId); }
  }

  return (
    <div className="settings-section">
      {modal && (
        <MetaModal
          title={modal.type === 'create-enum' ? 'New Enumeration' : 'Edit Enumeration'}
          width={420}
          onClose={() => { setModal(null); setForm({}); }}
          onSave={handleSave}
          saving={saving || !form.name?.trim()}
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
            onClick={() => { setModal({ type: 'create-enum', ctx: {} }); setForm({}); }}>
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
                {isExp ? <ChevronDownIcon size={13} strokeWidth={2} color="var(--muted)" /> : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
              </span>
              <span className="settings-card-name">{en.name}</span>
              <span className="settings-badge" style={{ marginLeft: 6 }}>{en.valueCount} value{en.valueCount !== 1 ? 's' : ''}</span>
              {en.description && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>{en.description}</span>}
              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                {canWrite && <button className="panel-icon-btn" title="Edit" onClick={e => { e.stopPropagation(); setModal({ type: 'edit-enum', ctx: { enumId: en.id } }); setForm({ name: en.name, description: en.description || '' }); }}><EditIcon size={12} strokeWidth={2} color="var(--accent)" /></button>}
                {canWrite && <button className="panel-icon-btn" title="Delete" onClick={e => deleteEnum(e, en)}><TrashIcon size={12} strokeWidth={2} color="var(--danger, #f87171)" /></button>}
              </div>
            </div>
            {isExp && (
              <div className="settings-card-body" style={{ padding: '8px 16px 12px' }}>
                {vals.length > 0 && (
                  <table className="settings-table" style={{ marginBottom: 8 }}>
                    <thead><tr><th style={{ width: 40 }}>#</th><th>Value</th><th>Label</th><th style={{ width: 1 }}></th></tr></thead>
                    <tbody>
                      {vals.map((v, idx) => {
                        const isEditing = editingValue?.id === v.id;
                        return isEditing ? (
                          <tr key={v.id}>
                            <td style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>{idx}</td>
                            <td><input className="field-input" autoFocus value={editingValue.value || ''} onChange={e => setEditingValue(ev => ({ ...ev, value: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') saveEditValue(); if (e.key === 'Escape') setEditingValue(null); }} style={{ fontSize: 12, padding: '2px 6px' }} /></td>
                            <td><input className="field-input" value={editingValue.label || ''} onChange={e => setEditingValue(ev => ({ ...ev, label: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') saveEditValue(); if (e.key === 'Escape') setEditingValue(null); }} placeholder="(optional)" style={{ fontSize: 12, padding: '2px 6px' }} /></td>
                            <td>
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                                <button className="btn btn-primary btn-sm" onClick={saveEditValue} disabled={saving || !editingValue.value?.trim()} style={{ fontSize: 11, padding: '2px 8px' }}>Save</button>
                                <button className="btn btn-sm" onClick={() => setEditingValue(null)} style={{ fontSize: 11, padding: '2px 8px' }}>Cancel</button>
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
                                {canWrite && idx > 0 && <button className="panel-icon-btn" title="Move up" onClick={() => moveValue(en.id, idx, -1)} style={{ fontSize: 10 }}>▲</button>}
                                {canWrite && idx < vals.length - 1 && <button className="panel-icon-btn" title="Move down" onClick={() => moveValue(en.id, idx, 1)} style={{ fontSize: 10 }}>▼</button>}
                                {canWrite && <button className="panel-icon-btn" title="Edit" onClick={() => setEditingValue({ id: v.id, enumId: en.id, value: v.value, label: v.label || '', displayOrder: idx })}><EditIcon size={11} strokeWidth={2} color="var(--accent)" /></button>}
                                {canWrite && <button className="panel-icon-btn" title="Delete" onClick={() => deleteValue(en.id, v)}><TrashIcon size={11} strokeWidth={2} color="var(--danger, #f87171)" /></button>}
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
                    <input className="field-input" autoFocus placeholder="Value *" value={addingValue.value || ''} onChange={e => setAddingValue(a => ({ ...a, value: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') addValue(en.id); }} style={{ flex: 1 }} />
                    <input className="field-input" placeholder="Label (optional)" value={addingValue.label || ''} onChange={e => setAddingValue(a => ({ ...a, label: e.target.value }))} style={{ flex: 1 }} />
                    <button className="btn btn-primary btn-sm" onClick={() => addValue(en.id)} disabled={saving || !addingValue.value?.trim()}>Add</button>
                    <button className="btn btn-sm" onClick={() => setAddingValue(null)}>Cancel</button>
                  </div>
                ) : canWrite ? (
                  <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }} onClick={() => setAddingValue({ enumId: en.id, value: '', label: '' })}>
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

// ── Lifecycles section ────────────────────────────────────────────────────────
function LifecyclesSection({ userId, canWrite, toast }) {
  const [lcs,           setLcs]           = useState([]);
  const [expanded,      setExpanded]      = useState(null);
  const [lcData,        setLcData]        = useState({});
  const [loading,       setLoading]       = useState(true);
  const [modal,         setModal]         = useState(null);
  const [form,          setForm]          = useState({});
  const [saving,        setSaving]        = useState(false);
  const [roles,         setRoles]         = useState([]);
  const [sigReqRole,    setSigReqRole]    = useState('');
  const [sigReqBusy,    setSigReqBusy]    = useState(false);
  const [transGuards,   setTransGuards]   = useState({});
  const [instances,     setInstances]     = useState([]);
  const [stateActions,  setStateActions]  = useState({});
  const [expandedState, setExpandedState] = useState(null);
  const [expandedTrans, setExpandedTrans] = useState(null);
  const [knownMetaKeys, setKnownMetaKeys] = useState([]);

  const LcDiagram = _LifecycleDiagram;

  function loadLcs() {
    return psaApi.getLifecycles(userId).then(d => setLcs(Array.isArray(d) ? d : []));
  }

  useEffect(() => {
    loadLcs().finally(() => setLoading(false));
    pnoReq('GET', '/roles').then(d => setRoles(Array.isArray(d) ? d : [])).catch(() => {});
    platformReq('GET', '/algorithms/instances').then(d => setInstances(Array.isArray(d) ? d : [])).catch(() => {});
    psaApi.getMetadataKeys(userId, 'LIFECYCLE_STATE').then(d => setKnownMetaKeys(Array.isArray(d) ? d : [])).catch(() => {});
  }, [userId]);

  _useWebSocket(
    '/topic/metamodel',
    (evt) => { if (evt.event === 'METAMODEL_CHANGED') loadLcs(); },
    userId,
  );

  async function refreshLcData(id) {
    const [states, transitions] = await Promise.all([
      psaApi.getLifecycleStates(userId, id),
      psaApi.getLifecycleTransitions(userId, id),
    ]);
    const transList = Array.isArray(transitions) ? transitions : [];
    setLcData(s => ({ ...s, [id]: {
      states:      Array.isArray(states) ? states : [],
      transitions: transList,
    }}));
    for (const t of transList) {
      const tid = t.id || t.ID;
      psaApi.listTransitionGuards(userId, tid)
        .then(g => setTransGuards(s => ({ ...s, [tid]: Array.isArray(g) ? g : [] })))
        .catch(() => {});
    }
    const statesList = Array.isArray(states) ? states : [];
    for (const st of statesList) {
      const sid = st.id || st.ID;
      psaApi.listLifecycleStateActions(userId, id, sid)
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
        await psaApi.createLifecycle(userId, { name: form.name?.trim(), description: form.description?.trim() || null });
        await loadLcs();
      } else if (type === 'duplicate-lc') {
        await psaApi.duplicateLifecycle(userId, ctx.sourceId, form.name?.trim());
        await loadLcs();
      } else if (type === 'create-state') {
        await psaApi.addLifecycleState(userId, ctx.lifecycleId, stateBody);
        await refreshLcData(ctx.lifecycleId);
      } else if (type === 'edit-state') {
        await psaApi.updateLifecycleState(userId, ctx.lifecycleId, ctx.stateId, stateBody);
        await refreshLcData(ctx.lifecycleId);
      } else if (type === 'create-transition') {
        await psaApi.addLifecycleTransition(userId, ctx.lifecycleId, transBody);
        await refreshLcData(ctx.lifecycleId);
      } else if (type === 'edit-transition') {
        await psaApi.updateLifecycleTransition(userId, ctx.lifecycleId, ctx.transId, transBody);
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
      await psaApi.deleteLifecycle(userId, lc.id || lc.ID);
      await loadLcs();
      if (expanded === (lc.id || lc.ID)) setExpanded(null);
    } catch (e) { toast(e, 'error'); }
  }

  async function deleteState(lcId, s) {
    if (!window.confirm(`Delete state "${s.name || s.NAME}"?\n\nAttribute state rules for this state will also be deleted.`)) return;
    try {
      await psaApi.deleteLifecycleState(userId, lcId, s.id || s.ID);
      await refreshLcData(lcId);
    } catch (e) { toast(e, 'error'); }
  }

  async function deleteTransition(lcId, t) {
    if (!window.confirm(`Delete transition "${t.name || t.NAME}"?`)) return;
    try {
      await psaApi.deleteLifecycleTransition(userId, lcId, t.id || t.ID);
      await refreshLcData(lcId);
    } catch (e) { toast(e, 'error'); }
  }

  async function addSigReq(transId, lcId) {
    if (!sigReqRole) return;
    setSigReqBusy(true);
    try {
      await psaApi.addTransitionSignatureRequirement(userId, transId, sigReqRole);
      setSigReqRole('');
      await refreshLcData(lcId);
    } catch (e) { toast(e, 'error'); } finally { setSigReqBusy(false); }
  }

  async function removeSigReq(transId, reqId, lcId) {
    setSigReqBusy(true);
    try {
      await psaApi.removeTransitionSignatureRequirement(userId, transId, reqId);
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

                {data.states?.length > 0 && LcDiagram && (
                  <div style={{ marginBottom: 16, overflowX: 'auto' }}>
                    <LcDiagram lifecycleId={id} userId={userId} previewMode />
                  </div>
                )}

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
                        <span style={{
                          width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                          background: color, boxShadow: `0 0 0 2px ${color}33`,
                        }} />
                        <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', flex: 1 }}>{sname}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {flags.map(f => (
                            <span key={f} className="lc-state-flag" style={{ background: color + '22', color, borderColor: color + '55' }}>{f}</span>
                          ))}
                        </div>
                        {sActions.length > 0 && (
                          <span className="settings-badge" title={`${sActions.length} state action(s)`}>
                            {sActions.length} action{sActions.length > 1 ? 's' : ''}
                          </span>
                        )}
                        <span style={{ fontSize: 10, color: 'var(--muted)', minWidth: 24, textAlign: 'right' }}>#{order}</span>
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

                      {isStateExp && (
                        <div style={{
                          padding: '10px 12px',
                          background: 'var(--subtle-bg2)',
                          border: '1px solid var(--border)',
                          borderTop: 'none',
                          borderRadius: '0 0 5px 5px',
                        }}>
                          <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 11 }}>
                            <div><span style={{ color: 'var(--muted)' }}>ID</span> <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)', fontSize: 10 }}>{sid}</span></div>
                            <div><span style={{ color: 'var(--muted)' }}>Order</span> <span style={{ color: 'var(--text)' }}>{order}</span></div>
                          </div>

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
                                    await psaApi.detachLifecycleStateAction(userId, id, sid, a.id);
                                    setStateActions(prev => ({ ...prev, [sid]: (prev[sid] || []).filter(x => x.id !== a.id) }));
                                    toast('Action detached', 'success');
                                  } catch (err) { toast(err, 'error'); }
                                }}>
                                  <TrashIcon size={10} strokeWidth={2} color="var(--danger, #f87171)" />
                                </button>
                              )}
                            </div>
                          ))}

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
                                    await psaApi.attachLifecycleStateAction(userId, id, sid, instEl.value, trigEl.value, modeEl.value);
                                    const updated = await psaApi.listLifecycleStateActions(userId, id, sid);
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
                        <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', minWidth: 90 }}>{tname}</span>
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

                      {isTransExp && (
                        <div style={{
                          padding: '10px 12px',
                          background: 'var(--subtle-bg2)',
                          border: '1px solid var(--border)',
                          borderTop: 'none',
                          borderRadius: '0 0 5px 5px',
                        }}>
                          <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 11, flexWrap: 'wrap' }}>
                            <div><span style={{ color: 'var(--muted)' }}>ID</span> <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)', fontSize: 10 }}>{tid}</span></div>
                            <div><span style={{ color: 'var(--muted)' }}>Action Type</span> <span style={{ color: 'var(--text)' }}>{actType}</span></div>
                            <div><span style={{ color: 'var(--muted)' }}>Version Strategy</span> <span style={{ color: 'var(--text)' }}>{vstrat || 'NONE'}</span></div>
                          </div>

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
                                      await psaApi.updateTransitionGuard(userId, g.id, newEffect);
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
                                    await psaApi.detachTransitionGuard(userId, g.id);
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
                                  await psaApi.attachTransitionGuard(userId, tid, instEl.value, effectEl.value, 0);
                                  const g = await psaApi.listTransitionGuards(userId, tid);
                                  setTransGuards(s => ({ ...s, [tid]: Array.isArray(g) ? g : [] }));
                                  instEl.value = '';
                                  toast('Guard attached', 'success');
                                } catch (err) { toast(err, 'error'); }
                              }}>Attach</button>
                            </div>
                          )}

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

// ── Sources section ────────────────────────────────────────────────────────────
function SourcesSection({ userId, canWrite, toast }) {
  const [sources,   setSources]   = useState([]);
  const [resolvers, setResolvers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);

  async function load() {
    const [s, r] = await Promise.all([
      psaApi.getSources(userId).catch(() => []),
      psaApi.getSourceResolvers(userId).catch(() => []),
    ]);
    setSources(Array.isArray(s) ? s : []);
    setResolvers(Array.isArray(r) ? r : []);
  }
  useEffect(() => { load().finally(() => setLoading(false)); }, [userId]);

  function openCreate() {
    setForm({ id: '', name: '', description: '', resolverInstanceId: resolvers[0]?.instanceId || '', color: '', icon: '' });
    setModal({ kind: 'create' });
  }
  function openEdit(src) {
    setForm({ id: src.id, name: src.name, description: src.description || '', resolverInstanceId: src.resolverInstanceId, color: src.color || '', icon: src.icon || '' });
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
        await psaApi.createSource(userId, { id: form.id?.trim(), ...payload });
        toast('Source created', 'success');
      } else {
        await psaApi.updateSource(userId, modal.original.id, payload);
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
      await psaApi.deleteSource(userId, src.id);
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
          <button className="btn btn-primary btn-sm" onClick={openCreate} disabled={resolvers.length === 0}>
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
            const Ic = s.icon ? _NODE_ICONS[s.icon] : null;
            return (
              <tr key={s.id}>
                <td>
                  {Ic
                    ? <Ic size={16} strokeWidth={1.8} color={s.color || 'var(--muted)'} />
                    : <span style={{ color: 'var(--muted2)' }}>—</span>}
                </td>
                <td className="settings-td-mono">
                  {s.id}{' '}
                  {s.builtin && <span className="settings-badge" style={{ marginLeft: 4 }}>built-in</span>}
                </td>
                <td>{s.name}</td>
                <td><span className="settings-badge">{s.resolverAlgorithmCode}</span></td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{s.description}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {canWrite && !s.builtin && (
                    <>
                      <button className="panel-icon-btn" title="Edit" onClick={() => openEdit(s)}>
                        <EditIcon size={12} strokeWidth={2} color="var(--accent)" />
                      </button>
                      <button className="panel-icon-btn" title="Delete" onClick={() => remove(s)} style={{ marginLeft: 4 }}>
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
          saving={saving || !form.name || !form.resolverInstanceId || (modal.kind === 'create' && !form.id)}
        >
          <Field label="ID">
            <input className="field-input" value={form.id || ''} disabled={modal.kind === 'edit'}
              onChange={e => setForm(f => ({ ...f, id: e.target.value }))} placeholder="e.g. FILE_LOCAL" />
          </Field>
          <Field label="Name">
            <input className="field-input" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Description">
            <textarea className="field-input" rows={2} value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </Field>
          <Field label="Resolver">
            <select className="field-input" value={form.resolverInstanceId || ''}
              onChange={e => setForm(f => ({ ...f, resolverInstanceId: e.target.value }))}>
              <option value="">— select —</option>
              {resolvers.map(r => (
                <option key={r.instanceId} value={r.instanceId}>{r.algorithmCode} — {r.instanceName}</option>
              ))}
            </select>
          </Field>
          <ColorField label="Color" value={form.color} onChange={c => setForm(f => ({ ...f, color: c }))} />
          <IconPicker value={form.icon} onChange={i => setForm(f => ({ ...f, icon: i }))} />
        </MetaModal>
      )}
    </div>
  );
}

// ── Import Contexts section ────────────────────────────────────────────────────
function ImportContextsSection({ userId, canWrite, toast }) {
  const [contexts,            setContexts]            = useState([]);
  const [importInstances,     setImportInstances]     = useState([]);
  const [validationInstances, setValidationInstances] = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [modal,               setModal]               = useState(null);
  const [form,                setForm]                = useState({});
  const [saving,              setSaving]              = useState(false);

  async function load() {
    const [c, imp, val] = await Promise.all([
      psaApi.getImportContexts().catch(() => []),
      psaApi.getImportAlgorithmInstances().catch(() => []),
      psaApi.getValidationAlgorithmInstances().catch(() => []),
    ]);
    setContexts(Array.isArray(c) ? c : []);
    setImportInstances(Array.isArray(imp) ? imp : []);
    setValidationInstances(Array.isArray(val) ? val : []);
  }
  useEffect(() => { load().finally(() => setLoading(false)); }, [userId]);

  function openCreate() {
    setForm({ code: '', label: '', allowedRootNodeTypes: '', acceptedFormats: '', importContextAlgorithmInstanceId: '', nodeValidationAlgorithmInstanceId: '' });
    setModal({ kind: 'create' });
  }
  function openEdit(ctx) {
    setForm({
      code: ctx.code, label: ctx.label,
      allowedRootNodeTypes: ctx.allowedRootNodeTypes || '',
      acceptedFormats: ctx.acceptedFormats || '',
      importContextAlgorithmInstanceId: ctx.importContextAlgorithmInstanceId || '',
      nodeValidationAlgorithmInstanceId: ctx.nodeValidationAlgorithmInstanceId || '',
    });
    setModal({ kind: 'edit', original: ctx });
  }
  function closeModal() { setModal(null); setForm({}); }

  function instLabel(inst) { return inst.name || inst.instanceName || inst.algorithmCode || inst.instanceId || inst.id || '?'; }
  function instId(inst)    { return inst.instanceId || inst.id; }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        code:  form.code?.trim(),
        label: form.label?.trim(),
        allowedRootNodeTypes:              form.allowedRootNodeTypes?.trim() || null,
        acceptedFormats:                   form.acceptedFormats?.trim() || null,
        importContextAlgorithmInstanceId:  form.importContextAlgorithmInstanceId || null,
        nodeValidationAlgorithmInstanceId: form.nodeValidationAlgorithmInstanceId || null,
      };
      if (modal.kind === 'create') {
        await psaApi.createImportContext(payload);
        toast('Import context created', 'success');
      } else {
        await psaApi.updateImportContext(modal.original.id, payload);
        toast('Import context updated', 'success');
      }
      closeModal();
      await load();
    } catch (e) { toast(e, 'error'); }
    finally { setSaving(false); }
  }

  async function remove(ctx) {
    if (!window.confirm(`Delete import context "${ctx.label}" (${ctx.code})?`)) return;
    try {
      await psaApi.deleteImportContext(ctx.id);
      toast('Import context deleted', 'success');
      await load();
    } catch (e) { toast(e, 'error'); }
  }

  function instName(instances, id) {
    if (!id) return '—';
    const inst = instances.find(i => instId(i) === id);
    return inst ? instLabel(inst) : id;
  }

  if (loading) return <div style={{ padding: 16, color: 'var(--muted)' }}>Loading…</div>;

  return (
    <div style={{ padding: '0 16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, fontSize: 12, color: 'var(--muted)' }}>
          Import contexts bind a logical code to algorithm instances for CAD file processing
          (cad-api) and node validation (psm-api). The built-in{' '}
          <span className="settings-badge">default</span> context uses service-level default
          algorithms when no specific context is requested.
        </div>
        {canWrite && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <PlusIcon size={11} strokeWidth={2} /> Add Context
          </button>
        )}
      </div>

      <table className="settings-table">
        <thead>
          <tr>
            <th style={{ width: 140 }}>Code</th>
            <th>Label</th>
            <th>Import algorithm</th>
            <th>Validation algorithm</th>
            <th style={{ width: 90 }}></th>
          </tr>
        </thead>
        <tbody>
          {contexts.map(ctx => (
            <tr key={ctx.id}>
              <td className="settings-td-mono">
                {ctx.code}
                {ctx.code === 'default' && <span className="settings-badge" style={{ marginLeft: 4 }}>built-in</span>}
              </td>
              <td>{ctx.label}</td>
              <td style={{ fontSize: 12, color: 'var(--muted)' }}>{instName(importInstances, ctx.importContextAlgorithmInstanceId)}</td>
              <td style={{ fontSize: 12, color: 'var(--muted)' }}>{instName(validationInstances, ctx.nodeValidationAlgorithmInstanceId)}</td>
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                {canWrite && (
                  <>
                    <button className="panel-icon-btn" title="Edit" onClick={() => openEdit(ctx)}>
                      <EditIcon size={12} strokeWidth={2} color="var(--accent)" />
                    </button>
                    {ctx.code !== 'default' && (
                      <button className="panel-icon-btn" title="Delete" onClick={() => remove(ctx)} style={{ marginLeft: 4 }}>
                        <TrashIcon size={12} strokeWidth={2} color="var(--danger)" />
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <MetaModal
          title={modal.kind === 'create' ? 'New Import Context' : `Edit ${modal.original.label}`}
          onClose={closeModal}
          onSave={save}
          saving={saving || !form.label || (modal.kind === 'create' && !form.code)}
        >
          <Field label="Code">
            <input className="field-input" value={form.code || ''} disabled={modal.kind === 'edit'}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. catia-v5-mech" />
          </Field>
          <Field label="Label">
            <input className="field-input" value={form.label || ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
          </Field>
          <Field label="Accepted formats">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {ACCEPTED_FORMAT_OPTIONS.map(fmt => {
                const raw = form.acceptedFormats || '';
                const checked = raw.includes(`"${fmt}"`);
                function toggle() {
                  let arr = [];
                  try { arr = JSON.parse(raw || '[]'); } catch { arr = []; }
                  arr = checked ? arr.filter(f => f !== fmt) : [...arr, fmt];
                  setForm(f => ({ ...f, acceptedFormats: arr.length ? JSON.stringify(arr) : '' }));
                }
                return (
                  <label key={fmt} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                    <input type="checkbox" checked={checked} onChange={toggle} />
                    {fmt}
                  </label>
                );
              })}
            </div>
          </Field>
          <Field label="Import algorithm instance">
            <select className="field-input" value={form.importContextAlgorithmInstanceId || ''}
              onChange={e => setForm(f => ({ ...f, importContextAlgorithmInstanceId: e.target.value }))}>
              <option value="">— none (use default) —</option>
              {importInstances.map(inst => (
                <option key={instId(inst)} value={instId(inst)}>{instLabel(inst)}</option>
              ))}
            </select>
          </Field>
          <Field label="Node validation algorithm instance">
            <select className="field-input" value={form.nodeValidationAlgorithmInstanceId || ''}
              onChange={e => setForm(f => ({ ...f, nodeValidationAlgorithmInstanceId: e.target.value }))}>
              <option value="">— none (use default) —</option>
              {validationInstances.map(inst => (
                <option key={instId(inst)} value={instId(inst)}>{instLabel(inst)}</option>
              ))}
            </select>
          </Field>
        </MetaModal>
      )}
    </div>
  );
}

// ── Plugin export ─────────────────────────────────────────────────────────────
export default {
  id: 'psa-settings',
  zone: 'settings',
  init(shellAPI) {
    _shellAPI          = shellAPI;
    _useWebSocket      = shellAPI.useWebSocket ?? (() => {});
    _LifecycleDiagram  = shellAPI.components?.LifecycleDiagram ?? null;
    _NODE_ICONS        = shellAPI.icons?.NODE_ICONS ?? {};
    _NODE_ICON_NAMES   = Object.keys(_NODE_ICONS);
    pnoReq      = (m, p, b) => shellAPI.http.serviceRequest('pno', m, p, b);
    platformReq = (m, p, b) => shellAPI.http.serviceRequest('platform', m, p, b);
    initPsaApi(shellAPI);
  },
  sections: {
    'node-types':      NodeTypesSection,
    'domains':         DomainsSection,
    'enums':           EnumsSection,
    'lifecycles':      LifecyclesSection,
    'sources':         SourcesSection,
    'import-contexts': ImportContextsSection,
  },
};
