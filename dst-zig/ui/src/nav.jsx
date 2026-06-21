import { initDstApi } from './dstApi';

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

// ── NavLabel — content area only (shell owns chrome) ─────────────────────────

function DstNavLabel({ item }) {
  const name = item.originalName || item.id;
  const size = prettySize(item.sizeBytes);
  return (
    <>
      <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <span className="ni-reviter" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted2)' }}>
        {size}
      </span>
    </>
  );
}

// ── Inline pin icons (no shell import allowed) ────────────────────────────────

function PinIcon({ size = 11, color = 'currentColor', strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  );
}

function PinOffIcon({ size = 11, color = 'currentColor', strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17v5" />
      <path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89" />
      <path d="m2 2 20 20" />
      <path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11" />
    </svg>
  );
}

// ── SearchItem — full search hit renderer ─────────────────────────────────────

function DstSearchItem({ hit, descriptor, isPinned, onPin, onUnpin, ctx }) {
  let source = {};
  try { source = JSON.parse(hit.sourceJson || '{}'); } catch {}
  const { onNavigate, icons } = ctx;
  const name   = source.originalName || hit.id;
  const size   = prettySize(source.sizeBytes);
  const ct     = source.contentType || '';
  const NtIcon = icons && descriptor?.icon ? icons[descriptor.icon] : null;

  return (
    <div
      className="node-item"
      onClick={() => onNavigate(hit.id, name, descriptor)}
      title={name}
    >
      {NtIcon
        ? <NtIcon size={11} color={descriptor.color || 'var(--muted)'} strokeWidth={2} style={{ flexShrink: 0 }} />
        : descriptor?.color
          ? <span style={{ width: 6, height: 6, borderRadius: 1, background: descriptor.color, flexShrink: 0, display: 'inline-block' }} />
          : null}
      <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      {ct && (
        <span style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--surface)',
          border: '1px solid var(--border)', padding: '1px 5px', borderRadius: 3, flexShrink: 0 }}>
          {ct}
        </span>
      )}
      <span className="ni-reviter" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted2)', flexShrink: 0 }}>
        {size}
      </span>
      <button
        className={`search-pin-btn${isPinned ? ' pinned' : ''}`}
        title={isPinned ? 'Remove from basket' : 'Add to basket'}
        onClick={e => { e.stopPropagation(); isPinned ? onUnpin?.() : onPin?.(); }}
      >
        {isPinned ? <PinOffIcon size={11} strokeWidth={2} /> : <PinIcon size={11} strokeWidth={2} />}
      </button>
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

  match: { serviceCode: 'dst', itemCode: 'data-object' },
  linkSources: ['DATA_LOCAL'],
  hasItemChildren: () => false,

  NavLabel: DstNavLabel,
  SearchItem: DstSearchItem,
  LinkRow: DstLinkRow,

  init(shellAPI) {
    initDstApi(shellAPI);
  },

  matches(descriptor) {
    return descriptor?.serviceCode === 'dst';
  },
};
