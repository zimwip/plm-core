import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { ChevronDownIcon, ChevronRightIcon, LayersIcon } from './Icons';

/**
 * Federated navigation section listing every browsable resource a user can see
 * across non-PSM source services (psm nodes are still rendered by the legacy
 * Objects tree to preserve link/lock/state UI). Pulls descriptors from
 * platform-api `/api/platform/browse` and lazily fetches items via each
 * descriptor's `listAction.path` on expand.
 *
 * <p>Items are rendered flat — the federated browse axis intentionally does not
 * try to re-create the psm parent/child tree for foreign sources. A click only
 * surfaces the source's own id; opening the editor on non-psm items is the next
 * frontier (Step 2 follow-up).
 */
export default function FederatedNavSection({ userId, onNavigate }) {
  const [descriptors, setDescriptors] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [items, setItems] = useState({});      // resourceKey → array
  const [loading, setLoading] = useState({});  // resourceKey → bool

  useEffect(() => {
    let cancelled = false;
    api.getBrowse(userId)
      .then(list => {
        if (cancelled) return;
        const nonPsm = (Array.isArray(list) ? list : []).filter(d => d.serviceCode !== 'psm');
        setDescriptors(nonPsm);
      })
      .catch(() => setDescriptors([]));
    return () => { cancelled = true; };
  }, [userId]);

  const grouped = useMemo(() => {
    const m = new Map();
    for (const d of descriptors) {
      const k = d.groupKey || 'OTHER';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(d);
    }
    return m;
  }, [descriptors]);

  const keyOf = (d) => `${d.serviceCode}:${d.resourceCode}:${d.resourceKey || ''}`;

  async function toggleDescriptor(d) {
    const k = keyOf(d);
    const next = new Set(expanded);
    if (next.has(k)) {
      next.delete(k);
      setExpanded(next);
      return;
    }
    next.add(k);
    setExpanded(next);
    if (items[k] || loading[k]) return;
    setLoading(s => ({ ...s, [k]: true }));
    try {
      const res = await api.fetchListableItems(userId, d.listAction, 0, 50);
      const list = Array.isArray(res) ? res : (res?.items ?? []);
      setItems(s => ({ ...s, [k]: list }));
    } catch {
      setItems(s => ({ ...s, [k]: [] }));
    } finally {
      setLoading(s => ({ ...s, [k]: false }));
    }
  }

  if (descriptors.length === 0) return null;

  return (
    <div className="panel-section" style={{ flex: '0 0 auto', minHeight: 0 }}>
      {[...grouped.entries()].map(([groupKey, ds]) => (
        <React.Fragment key={groupKey}>
          <div className="panel-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LayersIcon size={12} color="var(--muted)" strokeWidth={2} />
              <span className="panel-label">{groupKey}</span>
            </div>
          </div>
          <div className="node-list" style={{ maxHeight: 180 }}>
            {ds.map(d => {
              const k = keyOf(d);
              const isExp = expanded.has(k);
              const isLoading = !!loading[k];
              const list = items[k] || [];
              const idField    = d.listAction?.itemShape?.idField    || 'id';
              const labelField = d.listAction?.itemShape?.labelField || 'id';
              return (
                <div key={k}>
                  <div className="type-group-hd" onClick={() => toggleDescriptor(d)}>
                    <span className="type-chevron">
                      {isExp
                        ? <ChevronDownIcon  size={11} strokeWidth={2.5} color="var(--muted)" />
                        : <ChevronRightIcon size={11} strokeWidth={2.5} color="var(--muted)" />}
                    </span>
                    {d.color && (
                      <span style={{ width: 7, height: 7, borderRadius: 1, background: d.color, flexShrink: 0 }} />
                    )}
                    <span className="type-group-name">{d.displayName}</span>
                    {isExp && <span className="type-group-count">{isLoading ? '…' : list.length}</span>}
                  </div>
                  {isExp && (
                    <>
                      {isLoading && <div className="panel-empty" style={{ fontSize: 10 }}>Loading…</div>}
                      {!isLoading && list.length === 0 && (
                        <div className="panel-empty" style={{ fontSize: 10 }}>Empty</div>
                      )}
                      {!isLoading && list.map(item => {
                        const id    = item[idField] || item.id;
                        const label = item[labelField] || id;
                        return (
                          <div
                            key={id}
                            className="node-item"
                            onClick={() => onNavigate && onNavigate(id, label, d)}
                            title={label}
                          >
                            <span className="ni-expand" style={{ visibility: 'hidden' }} />
                            <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
