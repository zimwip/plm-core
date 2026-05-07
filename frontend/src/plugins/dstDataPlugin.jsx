import React from 'react';
import GenericDetailEditor from '../components/GenericDetailEditor';

/**
 * DST data-object plugin. The nav row is bespoke (file name + size +
 * colour dot) but the editor pane delegates entirely to
 * {@link GenericDetailEditor} — DST tells the frontend how to render
 * itself via the {@code DetailDescriptor} returned by
 * {@code GET /api/dst/data/{id}/detail}.
 *
 * <p>Reference implementation for new user services: NavRow for compact
 * list rendering, no custom editor needed when the generic
 * detail+actions contract suffices.
 */

function prettySize(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function DstNavRow({ descriptor, item, ctx, isActive }) {
  const id = item.id;
  const name = item.originalName || id;
  const ct = item.contentType || '';
  const size = prettySize(item.sizeBytes);
  const color = descriptor.color || 'var(--muted2)';
  return (
    <div
      className={`node-item${isActive ? ' active' : ''}`}
      onClick={() => ctx.onNavigate(id, name, descriptor)}
      title={`${name} — ${ct || 'unknown type'} · ${size}`}
    >
      <span className="ni-expand" style={{ visibility: 'hidden' }} />
      <span style={{ width: 6, height: 6, borderRadius: 1, background: color, flexShrink: 0, display: 'inline-block' }} />
      <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <span className="ni-reviter" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted2)' }}>
        {size}
      </span>
    </div>
  );
}

export function isStepLink(link) {
  const ct   = (link.targetDetails?.contentType || '').toLowerCase();
  const name = (link.displayKey || link.targetKey || '').toLowerCase();
  return ct.includes('step') || ct.includes('stp') ||
         name.endsWith('.stp') || name.endsWith('.step') || name.endsWith('.p21');
}

function DstLinkRow({ link, isEditing, editTargetKey, onEditTargetKey }) {
  if (isEditing) {
    return (
      <input
        className="field-input"
        style={{ padding: '2px 4px', fontSize: 12, minWidth: 180 }}
        type="text"
        placeholder="File UUID…"
        value={editTargetKey}
        onChange={e => onEditTargetKey(e.target.value)}
      />
    );
  }
  const details = link.targetDetails || {};
  const name = link.displayKey || link.targetKey || '—';
  const ct   = details.contentType || '';
  const sz   = details.sizeBytes != null ? prettySize(details.sizeBytes) : null;
  const isStep = isStepLink(link);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500 }}>{name}</span>
      {ct && (
        <span style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--surface)',
          border: '1px solid var(--border)', padding: '1px 5px', borderRadius: 3 }}>
          {ct}
        </span>
      )}
      {sz && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>{sz}</span>}
      {isStep && (
        <span style={{ fontSize: 10, color: 'var(--accent, #5b9cf6)', fontWeight: 600 }}>3D</span>
      )}
      {link.resolverError && (
        <span style={{ fontSize: 11, color: 'var(--danger, #e05252)' }} title={link.resolverError}>⚠</span>
      )}
    </span>
  );
}

export const dstDataPlugin = {
  match: { serviceCode: 'dst', itemCode: 'data-object' },
  name: 'dst-data',
  NavRow: DstNavRow,
  LinkRow: DstLinkRow,
  Editor: GenericDetailEditor,
  hasItemChildren: () => false,
};
