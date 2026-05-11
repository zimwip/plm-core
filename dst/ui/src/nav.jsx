/**
 * DST nav plugin — microfrontend entry point.
 *
 * Exported as an ES module; react + react-dom are external (provided by the
 * shell via importmap). No imports from shell-internal files.
 *
 * Plugin contract:
 *   { id, zone, init(shellAPI), matches(descriptor), Component }
 *
 * Component props (injected by the shell's nav zone renderer):
 *   { shellAPI, descriptor, item, isActive }
 */

import { initDstApi } from './dstApi';

let _shellAPI = null;

function isStepLink(link) {
  const ct   = (link.targetDetails?.contentType || '').toLowerCase();
  const name = (link.displayKey || link.targetKey || '').toLowerCase();
  return ct.includes('step') || ct.includes('stp') ||
         name.endsWith('.stp') || name.endsWith('.step') || name.endsWith('.p21');
}

function prettySize(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function DstNavRow({ shellAPI, descriptor, item, isActive }) {
  const api = shellAPI ?? _shellAPI;
  const id = item.id;
  const name = item.originalName || id;
  const ct = item.contentType || '';
  const size = prettySize(item.sizeBytes);
  const color = descriptor.color || 'var(--muted2)';

  return (
    <div
      className={`node-item${isActive ? ' active' : ''}`}
      onClick={() => api?.navigate?.(id, name, descriptor)}
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

// ── NavRow — ctx interface (for sourcePlugins / BrowseNav) ────────────────────

function DstNavRowCtx({ descriptor, item, ctx, isActive }) {
  const id    = item.id;
  const name  = item.originalName || id;
  const ct    = item.contentType || '';
  const size  = prettySize(item.sizeBytes);
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

// ── LinkRow — inline link rendering in PSM PBS ────────────────────────────────

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
  const name  = link.displayKey || link.targetKey || '—';
  const ct    = details.contentType || '';
  const sz    = details.sizeBytes != null ? prettySize(details.sizeBytes) : null;
  const step  = isStepLink(link);
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
      {step && <span style={{ fontSize: 10, color: 'var(--accent, #5b9cf6)', fontWeight: 600 }}>3D</span>}
      {link.resolverError && (
        <span style={{ fontSize: 11, color: 'var(--danger, #e05252)' }} title={link.resolverError}>⚠</span>
      )}
    </span>
  );
}

export default {
  id: 'dst-nav',
  zone: 'nav',

  // sourcePlugins match contract — enables PluginLoader bridge
  match: { serviceCode: 'dst', itemCode: 'data-object' },
  // Also register LinkRow under DATA_LOCAL (targetSourceCode used in PSM PBS links)
  linkSources: ['DATA_LOCAL'],
  hasItemChildren: () => false,

  // ctx-interface exports (used by BrowseNav via sourcePlugins)
  NavRow: DstNavRowCtx,
  LinkRow: DstLinkRow,

  init(shellAPI) {
    _shellAPI = shellAPI;
    initDstApi(shellAPI);
  },

  matches(descriptor) {
    return descriptor?.serviceCode === 'dst';
  },

  // shellAPI-interface Component (used by pluginRegistry nav zone)
  Component: DstNavRow,
};
