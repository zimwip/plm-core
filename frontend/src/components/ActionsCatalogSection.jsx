import React, { useState, useEffect, useCallback } from 'react';
import { platformActionsApi } from '../services/api';
import { ModuleBadge } from './SettingsPage';
import {
  PlusIcon, TrashIcon,
  ChevronRightIcon, ChevronDownIcon,
  ShieldIcon, CpuIcon, ZapIcon,
} from './Icons';

/* ── Exported section ─────────────────────────────────────────────── */
export function ActionsCatalogSection({ userId, canWrite, toast }) {
  const [allActions, setAllActions] = useState(null);
  const [serviceCode, setServiceCode] = useState('');
  const [tab, setTab] = useState('actions');

  useEffect(() => {
    platformActionsApi.listActions(userId)
      .then(acts => {
        const list = Array.isArray(acts) ? acts : [];
        setAllActions(list);
        if (!serviceCode) {
          const svcs = [...new Set(list.map(a => a.serviceCode).filter(Boolean))].sort();
          if (svcs.length > 0) setServiceCode(svcs[0]);
        }
      })
      .catch(() => setAllActions([]));
  }, [userId]); // serviceCode intentionally excluded — only seed on first load

  if (allActions === null)
    return <div className="settings-loading">Loading…</div>;

  const services = [...new Set(allActions.map(a => a.serviceCode).filter(Boolean))].sort();

  const tabStyle = (key) => ({
    padding: '6px 14px', fontSize: 12, cursor: 'pointer',
    background: 'none', border: 'none',
    color: tab === key ? 'var(--accent)' : 'var(--muted)',
    borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
  });

  return (
    <div>
      {!canWrite && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
          Read-only — requires <code>MANAGE_PLATFORM</code>
        </div>
      )}

      {/* Service selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Service</span>
        <select
          className="field-input"
          style={{ width: 120, fontSize: 12, padding: '3px 6px' }}
          value={serviceCode}
          onChange={e => setServiceCode(e.target.value)}
        >
          {services.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        <button style={tabStyle('actions')}           onClick={() => setTab('actions')}>Actions</button>
        <button style={tabStyle('algorithm-catalog')} onClick={() => setTab('algorithm-catalog')}>Algorithm Catalog</button>
      </div>

      {tab === 'actions'           && <ActionsTab           userId={userId} serviceCode={serviceCode} dbActions={allActions.filter(a => a.serviceCode === serviceCode)} canWrite={canWrite} toast={toast} />}
      {tab === 'algorithm-catalog' && <AlgorithmCatalogTab  userId={userId} serviceCode={serviceCode} canWrite={canWrite} toast={toast} />}
    </div>
  );
}

/* ── Actions tab — merges registry (live) + DB (metadata) ─────────── */
function ActionsTab({ userId, serviceCode, dbActions: dbActionsProp, canWrite, toast }) {
  const [localDbActions, setLocalDbActions] = useState(null);
  const [catalog, setCatalog]               = useState(null);
  const [instances, setInstances]           = useState(null);
  const [expanded, setExpanded]             = useState(null);
  const [guards, setGuards]                 = useState({});
  const [wrappers, setWrappers]             = useState({});

  // Use prop as source of truth; localDbActions tracks in-place edits (description)
  const dbActions = localDbActions ?? dbActionsProp;

  function handleDescriptionSaved(actionId, newDesc) {
    setLocalDbActions(prev => (prev ?? dbActionsProp).map(a => a.id === actionId ? { ...a, description: newDesc } : a));
  }

  useEffect(() => {
    if (!serviceCode) return;
    setLocalDbActions(null); setCatalog(null); setExpanded(null); setGuards({}); setWrappers({});
    Promise.all([
      platformActionsApi.getServiceCatalog(serviceCode),
      platformActionsApi.listAllInstances(userId, serviceCode),
    ]).then(([cat, insts]) => {
      setCatalog(cat);
      setInstances(Array.isArray(insts) ? insts : []);
    }).catch(() => { setCatalog({ handlers: [], guards: [] }); setInstances([]); });
  }, [userId, serviceCode]);

  async function loadGuards(actionId) {
    const g = await platformActionsApi.listActionGuards(userId, actionId).catch(() => []);
    setGuards(s => ({ ...s, [actionId]: Array.isArray(g) ? g : [] }));
  }

  async function loadWrappers(actionId) {
    const w = await platformActionsApi.listActionWrappers(userId, actionId).catch(() => []);
    setWrappers(s => ({ ...s, [actionId]: Array.isArray(w) ? w : [] }));
  }

  function toggleAction(actionId) {
    if (expanded === actionId) { setExpanded(null); return; }
    setExpanded(actionId);
    if (!guards[actionId])   loadGuards(actionId);
    if (!wrappers[actionId]) loadWrappers(actionId);
  }

  async function handleAttachGuard(actionId, instanceId, effect) {
    try {
      await platformActionsApi.attachActionGuard(userId, actionId, instanceId, effect || 'HIDE', 0);
      loadGuards(actionId);
      toast('Guard attached', 'success');
    } catch (e) { toast(String(e), 'error'); }
  }

  async function handleDetachGuard(actionId, guardId) {
    try {
      await platformActionsApi.detachActionGuard(userId, actionId, guardId);
      loadGuards(actionId);
      toast('Guard detached', 'success');
    } catch (e) { toast(String(e), 'error'); }
  }

  async function handleUpdateGuardEffect(actionId, guardId, effect) {
    try {
      await platformActionsApi.updateActionGuard(userId, actionId, guardId, effect);
      setGuards(s => ({
        ...s,
        [actionId]: (s[actionId] || []).map(g => g.id === guardId ? { ...g, effect } : g),
      }));
    } catch (e) { toast(String(e), 'error'); }
  }

  async function handleAttachWrapper(actionId, instanceId, executionOrder) {
    try {
      await platformActionsApi.attachActionWrapper(userId, actionId, instanceId, executionOrder, serviceCode);
      loadWrappers(actionId);
      toast('Wrapper attached', 'success');
    } catch (e) { toast(String(e), 'error'); }
  }

  if (catalog === null) return <div className="settings-loading">Loading…</div>;

  // Build merged action list: DB actions indexed by actionCode, registry handlers as fallback
  const dbByCode = {};
  dbActions.forEach(a => { dbByCode[(a.actionCode || a.action_code || '').toUpperCase()] = a; });

  const registryHandlers = catalog.handlers || [];

  // All action codes: union of registry + DB
  const allCodes = new Set([
    ...registryHandlers.map(h => (h.code || '').toUpperCase()),
    ...Object.keys(dbByCode),
  ]);

  const merged = Array.from(allCodes).map(code => {
    const db  = dbByCode[code];
    const reg = registryHandlers.find(h => (h.code || '').toUpperCase() === code);
    if (db) {
      return {
        ...db,
        _fromDb: true,
        _module: db.handlerModuleName || db.handler_module_name || reg?.module || 'unknown',
      };
    }
    // Registry-only (not seeded yet)
    return {
      id:              null,
      actionCode:      reg.code,
      displayName:     reg.label || reg.code,
      scope:           null,
      displayCategory: null,
      displayOrder:    9999,
      description:     null,
      _fromDb:         false,
      _module:         reg.module || 'unknown',
    };
  });

  // Sort: DB actions by displayOrder, registry-only at end sorted by code
  merged.sort((a, b) => {
    if (a._fromDb && b._fromDb) return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    if (a._fromDb) return -1;
    if (b._fromDb) return 1;
    return (a.actionCode || '').localeCompare(b.actionCode || '');
  });

  if (merged.length === 0) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
        No actions registered for <strong>{serviceCode}</strong>.
      </div>
    );
  }

  // Group by module
  const byModule = {};
  merged.forEach(a => {
    const mod = a._module || 'unknown';
    if (!byModule[mod]) byModule[mod] = [];
    byModule[mod].push(a);
  });

  const guardInstances = (instances || []).filter(i =>
    (i.typeName || '').toLowerCase().includes('guard'));

  const wrapperInstances = (instances || []).filter(i =>
    (i.typeName || '').toLowerCase().includes('wrapper'));

  return (
    <div className="settings-list">
      {Object.entries(byModule).sort(([a],[b]) => a.localeCompare(b)).map(([mod, actionsInMod]) => (
        <div key={mod} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
            <ModuleBadge module={mod} />
            <span style={{ fontSize: 9, color: 'var(--muted2)' }}>({actionsInMod.length})</span>
          </div>
          {actionsInMod.map(action => {
            const actionKey = action.id || action.actionCode;
            const isOpen    = expanded === actionKey;
            const aCode     = action.actionCode || action.action_code;
            const aName     = action.displayName || action.display_name || aCode;
            const aScope    = action.scope;
            const aCat      = action.displayCategory || action.display_category;
            const actionGuards   = guards[actionKey]   || [];
            const actionWrappers = wrappers[actionKey] || [];

            return (
              <div key={actionKey} className="settings-card" style={{ marginBottom: 4, opacity: action._fromDb ? 1 : 0.6 }}>
                <div className="settings-card-hd" onClick={() => action._fromDb && toggleAction(actionKey)}
                  style={{ display: 'flex', alignItems: 'center', cursor: action._fromDb ? 'pointer' : 'default' }}>
                  {action._fromDb ? (
                    <span className="settings-card-chevron">
                      {isOpen
                        ? <ChevronDownIcon  size={13} strokeWidth={2} color="var(--muted)" />
                        : <ChevronRightIcon size={13} strokeWidth={2} color="var(--muted)" />}
                    </span>
                  ) : (
                    <span className="settings-card-chevron" style={{ width: 18, color: 'var(--muted2)', fontSize: 9 }}>—</span>
                  )}
                  <span className="settings-card-name">{aName}</span>
                  {!action._fromDb && (
                    <span style={{ fontSize: 9, color: 'var(--muted2)', marginLeft: 6, fontStyle: 'italic' }}>not seeded</span>
                  )}
                  <span style={{ flex: 1 }} />
                  {aScope && <span className="settings-badge">{aScope}</span>}
                  {aCat  && <span className="settings-badge" style={{ marginLeft: 4 }}>{aCat}</span>}
                </div>

                {isOpen && action._fromDb && (
                  <div className="settings-card-body" style={{ padding: '8px 12px 12px 28px' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                      <span>Code: <code>{aCode}</code></span>
                    </div>

                    {/* Description */}
                    <DescriptionRow
                      description={action.description}
                      actionId={actionKey}
                      userId={userId}
                      canWrite={canWrite}
                      onSaved={(newDesc) => handleDescriptionSaved(actionKey, newDesc)}
                    />

                    {/* Guards */}
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Guards</div>
                    {actionGuards.length === 0 && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>No guards attached</div>
                    )}
                    {actionGuards.length > 0 && (
                      <table className="settings-table" style={{ width: '100%', marginBottom: 8 }}>
                        <thead>
                          <tr><th>Guard</th><th>Effect</th><th></th></tr>
                        </thead>
                        <tbody>
                          {actionGuards.map(g => (
                            <tr key={g.id}>
                              <td>
                                {g.algorithmName || g.algorithm_name}
                                {(g.algorithmCode || g.algorithm_code) && (
                                  <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 6 }}>
                                    ({g.algorithmCode || g.algorithm_code})
                                  </span>
                                )}
                              </td>
                              <td>
                                {canWrite ? (
                                  <select className="field-input" style={{ fontSize: 11, padding: '1px 4px' }}
                                    value={g.effect}
                                    onChange={e => handleUpdateGuardEffect(actionKey, g.id, e.target.value)}>
                                    <option value="HIDE">HIDE</option>
                                    <option value="BLOCK">BLOCK</option>
                                  </select>
                                ) : (
                                  <span className={`settings-badge${g.effect === 'BLOCK' ? ' badge-warn' : ''}`}>{g.effect}</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {canWrite && (
                                  <button className="btn btn-xs btn-danger" onClick={() => handleDetachGuard(actionKey, g.id)}>
                                    <TrashIcon size={10} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {canWrite && guardInstances.length > 0 && (
                      <AttachGuardRow
                        instances={guardInstances}
                        onAttach={(iid, eff) => handleAttachGuard(actionKey, iid, eff)}
                      />
                    )}

                    {/* Wrappers */}
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, marginTop: 12 }}>Wrappers</div>
                    {actionWrappers.length === 0 && (
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>No wrappers</div>
                    )}
                    {actionWrappers.length > 0 && (
                      <table className="settings-table" style={{ width: '100%' }}>
                        <thead>
                          <tr><th>Order</th><th>Wrapper</th><th>Instance</th><th></th></tr>
                        </thead>
                        <tbody>
                          {actionWrappers.map(w => (
                            <tr key={w.id}>
                              <td style={{ width: 50 }}>{w.executionOrder || w.execution_order}</td>
                              <td>
                                {w.algorithmName || w.algorithm_name}
                                {(w.algorithmCode || w.algorithm_code) && (
                                  <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 6 }}>
                                    ({w.algorithmCode || w.algorithm_code})
                                  </span>
                                )}
                              </td>
                              <td style={{ fontSize: 11, color: 'var(--muted)' }}>{w.instanceName || w.instance_name}</td>
                              <td style={{ textAlign: 'right' }}>
                                {canWrite && (
                                  <button className="btn btn-xs btn-danger" onClick={async () => {
                                    try {
                                      await platformActionsApi.detachActionWrapper(userId, actionKey, w.id);
                                      loadWrappers(actionKey);
                                      toast('Wrapper detached', 'success');
                                    } catch (e) { toast(String(e), 'error'); }
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
                      <AttachWrapperRow
                        instances={wrapperInstances}
                        onAttach={(iid, order) => handleAttachWrapper(actionKey, iid, order)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Algorithm Catalog tab — 3 sub-tabs ───────────────────────────── */
const ALG_SUB_TABS = [
  { key: 'handler', label: 'Action Handler', filter: t => t.toLowerCase().includes('handler') },
  { key: 'guard',   label: 'Guard',          filter: t => t.toLowerCase().includes('guard') },
  { key: 'wrapper', label: 'Wrapper',        filter: t => t.toLowerCase().includes('wrapper') },
];

function AlgorithmCatalogTab({ userId, serviceCode }) {
  const [instances, setInstances] = useState(null);
  const [sub, setSub]             = useState('handler');

  useEffect(() => {
    if (!serviceCode) return;
    setInstances(null);
    platformActionsApi.listAllInstances(userId, serviceCode)
      .then(insts => setInstances(Array.isArray(insts) ? insts : []))
      .catch(() => setInstances([]));
  }, [userId, serviceCode]);

  const subTabStyle = (key) => ({
    padding: '4px 12px', fontSize: 11, cursor: 'pointer',
    background: 'none', border: 'none',
    color: sub === key ? 'var(--accent)' : 'var(--muted)',
    borderBottom: sub === key ? '2px solid var(--accent)' : '2px solid transparent',
  });

  if (instances === null) return <div className="settings-loading">Loading…</div>;

  const currentDef = ALG_SUB_TABS.find(t => t.key === sub);
  const filtered   = (instances || []).filter(i => currentDef?.filter(i.typeName || i.type_name || ''));

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        {ALG_SUB_TABS.map(t => (
          <button key={t.key} style={subTabStyle(t.key)} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
          No {currentDef?.label.toLowerCase()} instances for <strong>{serviceCode}</strong>.
        </div>
      ) : (
        <div className="settings-list">
          {filtered.map(inst => {
            const icon = sub === 'guard'
              ? <ShieldIcon size={12} color="var(--accent)" strokeWidth={1.8} />
              : sub === 'wrapper'
                ? <CpuIcon size={12} color="var(--muted2)" strokeWidth={1.8} />
                : <ZapIcon  size={12} color="var(--muted)"  strokeWidth={1.8} />;
            return (
              <div key={inst.id} className="settings-card"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
                {icon}
                <span className="settings-card-name" style={{ flex: 1, fontSize: 12 }}>{inst.name}</span>
                <span style={{ fontSize: 10, color: 'var(--muted2)', fontFamily: 'var(--mono)' }}>
                  {inst.algorithmCode || inst.algorithm_code}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Editable description row ─────────────────────────────────────── */
function DescriptionRow({ description, actionId, userId, canWrite, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [val,     setVal]     = useState(description || '');

  const save = useCallback(async () => {
    await platformActionsApi.updateAction(userId, actionId, { description: val });
    onSaved(val);
    setEditing(false);
  }, [userId, actionId, val, onSaved]);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Description</div>
      {editing ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            className="field-input"
            style={{ flex: 1, fontSize: 11 }}
            value={val}
            onChange={e => setVal(e.target.value)}
          />
          <button className="btn btn-xs btn-primary" onClick={save}>Save</button>
          <button className="btn btn-xs" onClick={() => { setVal(description || ''); setEditing(false); }}>✕</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11,
            color: description ? 'var(--text)' : 'var(--muted)',
            fontStyle: description ? 'normal' : 'italic',
          }}>
            {description || 'No description'}
          </span>
          {canWrite && (
            <button className="btn btn-xs" onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Shared attach wrapper row ────────────────────────────────────── */
function AttachWrapperRow({ instances, onAttach }) {
  const [instanceId, setInstanceId] = useState('');
  const [order, setOrder] = useState(10);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
      <select className="field-input" style={{ fontSize: 11, flex: 1 }}
        value={instanceId} onChange={e => setInstanceId(e.target.value)}>
        <option value="">— attach wrapper —</option>
        {instances.map(i => (
          <option key={i.id} value={i.id}>
            {i.algorithmName || i.algorithm_name} — {i.name || i.id}
          </option>
        ))}
      </select>
      <input type="number" className="field-input" style={{ fontSize: 11, width: 60, padding: '3px 4px' }}
        value={order} min={1}
        onChange={e => setOrder(Number(e.target.value))}
        placeholder="Order" />
      <button className="btn btn-xs btn-primary"
        disabled={!instanceId}
        onClick={() => { if (!instanceId) return; onAttach(instanceId, order); setInstanceId(''); }}>
        <PlusIcon size={10} /> Attach
      </button>
    </div>
  );
}

/* ── Shared attach guard row ──────────────────────────────────────── */
function AttachGuardRow({ instances, onAttach }) {
  const [instanceId, setInstanceId] = useState('');
  const [effect, setEffect] = useState('HIDE');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
      <select className="field-input" style={{ fontSize: 11, flex: 1 }}
        value={instanceId} onChange={e => setInstanceId(e.target.value)}>
        <option value="">— attach guard —</option>
        {instances.map(i => (
          <option key={i.id} value={i.id}>
            {i.algorithmName || i.algorithm_name} — {i.name || i.id}
          </option>
        ))}
      </select>
      <select className="field-input" style={{ fontSize: 11, width: 90, padding: '3px 4px' }}
        value={effect} onChange={e => setEffect(e.target.value)}>
        <option value="HIDE">HIDE</option>
        <option value="BLOCK">BLOCK</option>
      </select>
      <button className="btn btn-xs btn-primary"
        disabled={!instanceId}
        onClick={() => { if (!instanceId) return; onAttach(instanceId, effect); setInstanceId(''); }}>
        <PlusIcon size={10} /> Attach
      </button>
    </div>
  );
}
