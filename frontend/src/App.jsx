import React, { useState, useEffect, useCallback } from 'react';
import { api, txApi, authoringApi } from './services/api';
import { useWebSocket } from './hooks/useWebSocket';

// ─── Users & constants ────────────────────────────────────────────────
const USERS = [
  { id: 'user-admin',   label: 'Admin',   role: 'ADMIN',    color: '#e8c547' },
  { id: 'user-alice',   label: 'Alice',   role: 'DESIGNER', color: '#5b9cf6' },
  { id: 'user-bob',     label: 'Bob',     role: 'REVIEWER', color: '#56d18e' },
  { id: 'user-charlie', label: 'Charlie', role: 'READER',   color: '#a78bfa' },
];
const STATE_COLORS = {
  'st-draft':'#5b9cf6','st-inreview':'#e8a947','st-released':'#56d18e',
  'st-frozen':'#a78bfa','st-obsolete':'#6b7280',
};
function stateLabel(s){return{'st-draft':'Draft','st-inreview':'In Review','st-released':'Released','st-frozen':'Frozen','st-obsolete':'Obsolete'}[s]||s;}

// ─── Styles ──────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d0f12;--surface:#13161b;--border:#1e2329;--border2:#252b34;
  --text:#e2e8f0;--muted:#64748b;--accent:#5b9cf6;--danger:#f87171;
  --success:#56d18e;--warn:#e8a947;--r:6px;
  --mono:'DM Mono',monospace;--sans:'Syne',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--mono);font-size:13px;line-height:1.6;min-height:100vh}
.shell{display:flex;flex-direction:column;min-height:100vh}
/* Topbar */
.topbar{display:flex;align-items:center;gap:12px;padding:0 20px;height:52px;
  background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
.brand{font-family:var(--sans);font-weight:800;font-size:15px;letter-spacing:.06em}
.brand span{color:var(--accent)}
/* Transaction bar */
.tx-bar{
  padding:6px 20px;background:rgba(91,156,246,.06);
  border-bottom:1px solid rgba(91,156,246,.15);
  display:flex;align-items:center;gap:12px;font-size:12px;
}
.tx-bar.no-tx{background:rgba(100,116,139,.04);border-bottom:1px solid var(--border)}
.tx-badge{
  display:inline-flex;align-items:center;gap:6px;
  padding:3px 10px;border-radius:99px;font-family:var(--sans);font-weight:700;font-size:11px;
}
.tx-badge.open{background:rgba(91,156,246,.15);color:var(--accent);border:1px solid rgba(91,156,246,.3)}
.tx-badge.none{background:rgba(100,116,139,.1);color:var(--muted);border:1px solid rgba(100,116,139,.2)}
/* Main layout */
.main{display:flex;flex:1;overflow:hidden}
.sidebar{width:250px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);
  display:flex;flex-direction:column;overflow-y:auto}
.content{flex:1;overflow-y:auto;padding:24px}
/* Sidebar */
.sb-section{padding:14px;border-bottom:1px solid var(--border)}
.sb-label{font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.node-item{padding:8px 10px;border-radius:var(--r);cursor:pointer;transition:background .12s;
  display:flex;align-items:center;gap:8px;border:1px solid transparent}
.node-item:hover{background:var(--border)}
.node-item.active{background:rgba(91,156,246,.1);border-color:rgba(91,156,246,.3)}
.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.node-id{font-family:var(--sans);font-weight:700;font-size:11px;color:var(--accent)}
.node-name{font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Buttons */
.btn{display:inline-flex;align-items:center;gap:6px;padding:6px 13px;border-radius:var(--r);
  font-family:var(--mono);font-size:12px;border:1px solid var(--border2);cursor:pointer;
  transition:all .12s;background:var(--surface);color:var(--text);white-space:nowrap}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn-primary{background:var(--accent);color:#0d0f12;border-color:var(--accent);font-weight:700}
.btn-primary:hover{background:#7ab3f8;border-color:#7ab3f8;color:#0d0f12}
.btn-success{border-color:var(--success);color:var(--success)}
.btn-success:hover{background:rgba(86,209,142,.1)}
.btn-danger{border-color:var(--danger);color:var(--danger)}
.btn-danger:hover{background:rgba(248,113,113,.1)}
.btn-warn{border-color:var(--warn);color:var(--warn)}
.btn-warn:hover{background:rgba(232,169,71,.1)}
.btn-sm{padding:4px 10px;font-size:11px}
.btn:disabled{opacity:.4;cursor:not-allowed}
/* Card */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.card-hd{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.card-title{font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--muted)}
.card-body{padding:16px}
/* Fields */
.field{margin-bottom:13px}
.field-label{font-size:11px;color:var(--muted);margin-bottom:4px;display:block;letter-spacing:.04em}
.field-input{width:100%;padding:7px 10px;background:var(--bg);border:1px solid var(--border2);
  border-radius:var(--r);color:var(--text);font-family:var(--mono);font-size:12px;
  transition:border-color .12s;outline:none}
.field-input:focus{border-color:var(--accent)}
.field-input[readonly]{color:var(--muted);cursor:default;border-color:var(--border)}
select.field-input{cursor:pointer}
/* Section title */
.sec{font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:var(--muted);margin:18px 0 8px;padding-bottom:5px;border-bottom:1px solid var(--border)}
.sec:first-child{margin-top:0}
/* Tabs */
.tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:16px}
.tab{padding:7px 14px;cursor:pointer;font-size:12px;color:var(--muted);
  border-bottom:2px solid transparent;transition:all .12s;font-family:var(--sans);font-weight:600}
.tab:hover{color:var(--text)}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
/* Pill */
.pill{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:99px;
  font-size:11px;font-family:var(--sans);font-weight:600}
/* Grid */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
/* Row */
.row{display:flex;align-items:center;gap:8px}
.row-between{display:flex;align-items:center;justify-content:space-between}
/* Toast */
.toasts{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:999}
.toast{padding:9px 14px;border-radius:var(--r);background:var(--surface);border:1px solid var(--border2);
  font-size:12px;min-width:240px;animation:slideIn .2s ease;display:flex;align-items:center;gap:8px}
.toast-info{border-left:3px solid var(--accent)}
.toast-success{border-left:3px solid var(--success)}
.toast-error{border-left:3px solid var(--danger)}
.toast-warn{border-left:3px solid var(--warn)}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
/* Error modals */
.err-card-func{width:460px;max-width:95vw}
.err-card-tech{width:740px;max-width:95vw;max-height:88vh;display:flex;flex-direction:column;overflow:hidden}
.err-body{display:flex;flex-direction:column;gap:10px;min-height:0;flex:1;overflow:hidden}
.err-message{font-weight:700;font-size:13px;color:var(--text);word-break:break-word;line-height:1.4}
.err-meta{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:2px}
.stack-trace{background:#070809;border:1px solid var(--border2);border-radius:4px;padding:12px;
  font-family:var(--mono);font-size:10px;color:#8b9ab0;overflow:auto;flex:1;margin:0;
  white-space:pre;line-height:1.6;min-height:100px}
/* Modal overlay */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;
  align-items:center;justify-content:center;z-index:200}
/* Misc */
.empty{text-align:center;padding:40px;color:var(--muted)}
.empty-icon{font-size:28px;margin-bottom:8px}
.divider{border:none;border-top:1px solid var(--border);margin:14px 0}
.text-muted{color:var(--muted)}
.text-accent{color:var(--accent)}
.mt8{margin-top:8px}.mt16{margin-top:16px}
.sig-item{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)}
.sig-item:last-child{border:none}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:99px}
/* TX open warning on modified nodes */
.open-banner{padding:6px 12px;background:rgba(232,169,71,.08);border:1px solid rgba(232,169,71,.25);
  border-radius:var(--r);color:var(--warn);font-size:11px;display:flex;align-items:center;gap:8px;margin-bottom:14px}
/* Inline sign panel */
.sign-panel{padding:12px 14px;background:rgba(86,209,142,.06);border:1px solid rgba(86,209,142,.2);
  border-radius:var(--r);margin-bottom:14px}
/* Commit modal */
.commit-modal{width:440px}
/* Version history */
.ver-row{display:grid;grid-template-columns:40px 70px 120px 130px 1fr 100px;gap:0;
  padding:8px 12px;border-bottom:1px solid var(--border);font-size:11px;align-items:center}
.ver-row:last-child{border:none}
.ver-row.header{background:rgba(255,255,255,.02);color:var(--muted);
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.ver-num{font-family:var(--sans);font-weight:800;font-size:13px;color:var(--accent)}
.ver-rev{font-family:var(--sans);font-weight:700;font-size:12px}
/* Nav tabs (page switch) */
.nav-tab{padding:5px 13px;border-radius:var(--r);font-size:11px;font-family:var(--sans);font-weight:600;
  cursor:pointer;color:var(--muted);border:1px solid transparent;transition:all .12s}
.nav-tab:hover{color:var(--text)}
.nav-tab.active{background:rgba(91,156,246,.12);color:var(--accent);border-color:rgba(91,156,246,.2)}
/* Settings layout */
.settings-wrap{padding:24px;max-width:1100px}
.settings-split{display:grid;grid-template-columns:260px 1fr;gap:16px;align-items:start}
/* Table */
.tbl{width:100%;border-collapse:collapse}
.tbl th{font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);padding:8px 12px;text-align:left;border-bottom:1px solid var(--border)}
.tbl td{padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;vertical-align:middle}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:rgba(255,255,255,.02);cursor:pointer}
.tbl tr.sel td{background:rgba(91,156,246,.08)}
/* Flag badges */
.flag{display:inline-block;padding:1px 6px;border-radius:3px;font-size:10px;font-family:var(--sans);font-weight:700;margin-right:3px}
.flag-init{background:rgba(91,156,246,.15);color:var(--accent)}
.flag-frozen{background:rgba(167,139,250,.15);color:#a78bfa}
.flag-rel{background:rgba(86,209,142,.15);color:var(--success)}
/* State node in lifecycle viz */
.lc-flow{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.lc-state{padding:5px 12px;border-radius:99px;font-size:11px;font-family:var(--sans);font-weight:600;
  border:1px solid var(--border2);background:var(--bg)}
`;

// ─── Toast ───────────────────────────────────────────────────────────
let _tid = 0;
function useToasts() {
  const [toasts, setToasts]         = useState([]);
  const [errorDetail, setErrDetail] = useState(null);
  const toast = useCallback((msgOrErr, type='info') => {
    const msg    = typeof msgOrErr === 'string' ? msgOrErr : (msgOrErr?.message || String(msgOrErr));
    const detail = (typeof msgOrErr !== 'string' && msgOrErr?.detail) ? msgOrErr.detail : null;
    const id = ++_tid;
    setToasts(t => [...t, {id, msg, type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
    // Errors with a backend payload → open the error popup immediately
    if (type === 'error' && detail) setErrDetail(detail);
  }, []);
  return {toasts, toast, errorDetail, setErrDetail};
}
function Toasts({toasts}) {
  return <div className="toasts">{toasts.map(t =>
    <div key={t.id} className={`toast toast-${t.type}`}>
      <span>{t.type==='success'?'✓':t.type==='error'?'✗':t.type==='warn'?'⚠':'ℹ'}</span>
      {t.msg}
    </div>)}</div>;
}

function ErrorDetailModal({detail, onClose}) {
  const isTech = detail.category === 'TECHNICAL';
  const stack  = isTech && Array.isArray(detail.stackTrace)
    ? detail.stackTrace.join('\n') : null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className={`card ${isTech ? 'err-card-tech' : 'err-card-func'}`}
           onClick={e => e.stopPropagation()}>
        <div className="card-hd row-between">
          <span className="card-title" style={{color: isTech ? 'var(--danger)' : 'var(--warn)'}}>
            {isTech ? '✗ Unexpected error' : '⚠ Error'}
          </span>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className={`card-body ${isTech ? 'err-body' : ''}`}>
          <div className="err-message">{detail.error}</div>
          {isTech && detail.type && (
            <div className="err-meta">{detail.type}</div>
          )}
          {detail.path && (
            <div className="err-meta">{detail.path}</div>
          )}
          {stack && <pre className="stack-trace">{stack}</pre>}
        </div>
      </div>
    </div>
  );
}

// ─── State pill ──────────────────────────────────────────────────────
function StatePill({stateId}) {
  const c = STATE_COLORS[stateId]||'#6b7280';
  return <span className="pill" style={{color:c,background:`${c}18`,border:`1px solid ${c}30`}}>
    <span style={{width:5,height:5,borderRadius:'50%',background:c,display:'inline-block'}}/>
    {stateLabel(stateId)}
  </span>;
}

// ─── Transaction bar ─────────────────────────────────────────────────
function TxBar({tx, onCommit, onRollback}) {
  const hasTx = !!tx;
  return (
    <div className={`tx-bar ${hasTx?'':'no-tx'}`}>
      {hasTx ? <>
        <span className="tx-badge open">⬡ TX OPEN</span>
        <span className="text-muted" style={{fontSize:11}}>
          <span style={{opacity:.6}}>{(tx.ID || tx.id || '').slice(0,8)}…</span>
        </span>
        <span style={{flex:1}}/>
        <button className="btn btn-success btn-sm" onClick={onCommit}>Commit</button>
        <button className="btn btn-danger  btn-sm" onClick={onRollback}>Rollback</button>
      </> : <>
        <span className="tx-badge none">○ No open transaction</span>
        <span style={{flex:1}}/>
      </>}
    </div>
  );
}


// ─── Commit modal ─────────────────────────────────────────────────────
function CommitModal({userId, txId, onCommitted, onClose, toast}) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit() {
    if (!comment.trim()) { toast('Commit comment is required','warn'); return; }
    setLoading(true);
    try {
      await txApi.commit(userId, txId, comment);
      toast('Transaction committed','success');
      onCommitted();
      onClose();
    } catch(e) { toast(e,'error'); }
    finally { setLoading(false); }
  }
  return (
    <div className="overlay">
      <div className="card commit-modal">
        <div className="card-hd row-between">
          <span className="card-title">Commit transaction</span>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label">Commit comment *</label>
            <input className="field-input" placeholder="Describe what you changed…"
              value={comment} onChange={e=>setComment(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&submit()} autoFocus/>
          </div>
          <p className="text-muted" style={{fontSize:11,marginBottom:14}}>
            After commit, all changes will be visible to everyone and locks will be released.
          </p>
          <div className="row" style={{justifyContent:'flex-end',gap:8}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-success" onClick={submit} disabled={loading||!comment.trim()}>
              {loading?'Committing…':'✓ Commit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Node modal ────────────────────────────────────────────────
function CreateNodeModal({userId, nodeTypes, onCreated, onClose, toast}) {
  const [nodeTypeId, setNodeTypeId] = useState(nodeTypes[0]?.id||'');
  const [attrs, setAttrs] = useState({});
  const [loading, setLoading] = useState(false);
  const FIELDS = {
    'nt-document':[
      {id:'ad-doc-number',label:'Number *',placeholder:'DOC-0001'},
      {id:'ad-doc-title',label:'Title *',placeholder:'My Document'},
      {id:'ad-doc-author',label:'Author *',placeholder:'Alice'},
      {id:'ad-doc-cat',label:'Category *',type:'select',options:['Design','Test','Spec','Procedure','Report']},
      {id:'ad-doc-desc',label:'Description',placeholder:'…'},
    ],
    'nt-part':[
      {id:'ad-part-number',label:'Part Number *',placeholder:'P-000001'},
      {id:'ad-part-name',label:'Name *',placeholder:'Bolt M8'},
      {id:'ad-part-material',label:'Material',type:'select',options:['Steel','Aluminum','Titanium','Composite','Plastic']},
      {id:'ad-part-weight',label:'Weight (kg)',placeholder:'0.05'},
    ],
  };
  const fields = FIELDS[nodeTypeId]||[];
  async function submit() {
    setLoading(true);
    try {
      const data = await api.createNode(userId, nodeTypeId, attrs);
      toast('Node created','success');
      onCreated(data.nodeId);
      onClose();
    } catch(e) { toast(e,'error'); }
    finally { setLoading(false); }
  }
  return (
    <div className="overlay">
      <div className="card" style={{width:460,maxHeight:'80vh',overflow:'auto'}}>
        <div className="card-hd row-between">
          <span className="card-title">Create node</span>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label">Node type</label>
            <select className="field-input" value={nodeTypeId}
              onChange={e=>{setNodeTypeId(e.target.value);setAttrs({});}}>
              {nodeTypes.map(nt=><option key={nt.id} value={nt.id}>{nt.name||nt.NAME}</option>)}
            </select>
          </div>
          {fields.map(f=>(
            <div className="field" key={f.id}>
              <label className="field-label">{f.label}</label>
              {f.type==='select'
                ? <select className="field-input" value={attrs[f.id]||''}
                    onChange={e=>setAttrs(a=>({...a,[f.id]:e.target.value}))}>
                    <option value="">— select —</option>
                    {f.options.map(o=><option key={o}>{o}</option>)}
                  </select>
                : <input className="field-input" placeholder={f.placeholder}
                    value={attrs[f.id]||''} onChange={e=>setAttrs(a=>({...a,[f.id]:e.target.value}))}/>}
            </div>
          ))}
          <div className="row mt16" style={{justifyContent:'flex-end',gap:8}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading?'Creating…':'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Node Detail Panel ────────────────────────────────────────────────
function NodeDetail({nodeId, user, tx, toast, onAutoOpenTx}) {
  const [desc, setDesc]     = useState(null);
  const [sigs, setSigs]     = useState([]);
  const [history, setHistory] = useState([]);
  const [edits, setEdits]   = useState({});
  const [dirty, setDirty]   = useState(false);
  const [tab, setTab]       = useState('attributes');
  const [loading, setLoading] = useState(false);
  const [signPanel, setSignPanel] = useState(false);
  const [sigMeaning, setSigMeaning] = useState('Reviewed');
  const [sigComment, setSigComment] = useState('');

  const txId = tx?.ID || tx?.id || null;

  const load = useCallback(async () => {
    try {
      const [d, s, h] = await Promise.all([
        api.getNodeDescription(user.id, nodeId, txId),
        api.getSignatures(user.id, nodeId).catch(()=>[]),
        api.getVersionHistory(user.id, nodeId).catch(()=>[]),
      ]);
      setDesc(d); setSigs(Array.isArray(s)?s:[]); setHistory(Array.isArray(h)?h:[]); setEdits({}); setDirty(false);
    } catch(e) { toast(e,'error'); }
  }, [nodeId, user.id, txId, toast]);

  useEffect(()=>{ load(); }, [load]);

  useWebSocket(nodeId, (evt) => {
    if (['STATE_CHANGED','LOCK_RELEASED'].includes(evt.event)) load();
  });

  // Guard: authoring operations require an open tx — auto-opens if needed
  async function requireTx(fn) {
    const activeTxId = txId || await onAutoOpenTx();
    if (!activeTxId) return;
    fn(activeTxId);
  }

  async function handleCheckout() {
    setLoading(true);
    try {
      const activeTxId = txId || await onAutoOpenTx();
      if (!activeTxId) return;
      await authoringApi.checkout(user.id, activeTxId, nodeId);
      load();  // reload shows OPEN version with editing enabled
    } catch(e) { toast(e,'error'); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    requireTx(async (activeTxId) => {
      setLoading(true);
      try {
        await authoringApi.modify(user.id, activeTxId, nodeId, edits, 'Manual edit');
        toast('Saved','success'); load();
      } catch(e) { toast(e,'error'); }
      finally { setLoading(false); }
    });
  }

  // Lifecycle transitions: fully auto-transactional (open → do → commit/rollback)
  // Cannot run while user has an open content tx (backend only allows one tx per user)
  async function handleTransition(transitionId, name) {
    if (txId) {
      toast('Commit or rollback your current transaction before changing lifecycle state', 'warn');
      return;
    }
    setLoading(true);
    let autoTxId = null;
    try {
      const opened = await txApi.open(user.id, null);
      autoTxId = opened.txId;
      await authoringApi.transition(user.id, autoTxId, nodeId, transitionId);
      await txApi.commit(user.id, autoTxId, `Transition: ${name}`);
      toast(`"${name}" applied`, 'success');
      load();
    } catch(e) {
      if (autoTxId) await txApi.rollback(user.id, autoTxId).catch(()=>{});
      toast(e,'error');
    } finally { setLoading(false); }
  }

  // Signatures: same fully auto-transactional pattern
  async function handleSign() {
    if (txId) {
      toast('Commit or rollback your current transaction before signing', 'warn');
      return;
    }
    setLoading(true);
    let autoTxId = null;
    try {
      const opened = await txApi.open(user.id, null);
      autoTxId = opened.txId;
      await authoringApi.sign(user.id, autoTxId, nodeId, sigMeaning, sigComment||null);
      await txApi.commit(user.id, autoTxId, `Signature: ${sigMeaning}`);
      toast('Signature recorded', 'success');
      setSigComment('');
      load();
    } catch(e) {
      if (autoTxId) await txApi.rollback(user.id, autoTxId).catch(()=>{});
      toast(e,'error');
    } finally { setLoading(false); }
  }

  if (!desc) return <div className="empty"><div className="empty-icon">◎</div>Loading…</div>;

  const bySection = desc.attributes.reduce((acc,a)=>{
    const s=a.section||'General'; if(!acc[s]) acc[s]=[];
    acc[s].push(a); return acc;
  },{});

  const isOpenVersion = desc.txStatus === 'OPEN';
  const actionColor = n => /approv|releas/i.test(n)?'btn-success':/reject|obsol/i.test(n)?'btn-danger':'';

  return (
    <div>
      {/* Header */}
      <div className="row-between" style={{marginBottom:14}}>
        <div className="row" style={{gap:8}}>
          <span style={{fontFamily:'var(--sans)',fontWeight:800,fontSize:22}}>{desc.identity}</span>
          <StatePill stateId={desc.state}/>
          {isOpenVersion && (
            <span className="pill" style={{color:'var(--warn)',background:'rgba(232,169,71,.12)',border:'1px solid rgba(232,169,71,.3)'}}>
              ✎ in tx
            </span>
          )}
          {desc.lock?.locked && (
            <span className="pill" style={{color:'var(--muted)',background:'rgba(100,116,139,.1)',border:'1px solid rgba(100,116,139,.2)',fontSize:10}}>
              🔒 {desc.lock.lockedBy}
            </span>
          )}
        </div>
        <div className="row" style={{gap:6}}>
          {!isOpenVersion && desc?.canWrite && (
            <button className="btn btn-sm" onClick={handleCheckout} disabled={loading}
              title="Lock this node and open it for editing in a transaction">
              ✎ Checkout
            </button>
          )}
          {desc.actions.map(a => {
            if (a.type === 'SIGN') return (
              <button key="sign" className={`btn btn-sm btn-success ${signPanel?'active':''}`}
                disabled={loading}
                title={txId ? 'Commit or rollback your transaction before signing' : ''}
                onClick={()=>setSignPanel(p=>!p)}>
                ✦ Sign
              </button>
            );
            // TRANSITION
            return (
              <button key={a.id} className={`btn btn-sm ${actionColor(a.name)}`}
                disabled={loading}
                title={txId ? 'Commit or rollback your transaction first' : ''}
                onClick={()=>handleTransition(a.id, a.name)}>
                {a.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* TX warning if showing an OPEN version */}
      {isOpenVersion && (
        <div className="open-banner">
          ⚡ You are viewing your own uncommitted changes — not yet visible to others
        </div>
      )}

      {/* Inline sign panel — shown when user clicks the Sign action button */}
      {signPanel && (()=>{
        const signAction = desc.actions.find(a => a.type === 'SIGN');
        if (!signAction) return null;
        return (
          <div className="sign-panel">
            <div className="row" style={{gap:8,flexWrap:'wrap',alignItems:'flex-end'}}>
              <div className="field" style={{margin:0,flex:'0 0 160px'}}>
                <label className="field-label">Meaning</label>
                <select className="field-input" value={sigMeaning} onChange={e=>setSigMeaning(e.target.value)}>
                  {(signAction.meanings||[]).map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="field" style={{margin:0,flex:1}}>
                <label className="field-label">Comment (optional)</label>
                <input className="field-input" placeholder="…" value={sigComment} onChange={e=>setSigComment(e.target.value)}/>
              </div>
              <button className="btn btn-success btn-sm" disabled={loading} onClick={async()=>{
                await handleSign(); setSignPanel(false);
              }}>✦ Sign</button>
              <button className="btn btn-sm" onClick={()=>setSignPanel(false)}>Cancel</button>
            </div>
          </div>
        );
      })()}

      {/* Tabs */}
      <div className="tabs">
        {['attributes','signatures','history'].map(t=>(
          <div key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t==='signatures'&&sigs.length>0&&(
              <span style={{marginLeft:5,fontSize:10,background:'rgba(86,209,142,.2)',
                color:'var(--success)',borderRadius:99,padding:'1px 5px'}}>{sigs.length}</span>
            )}
            {t==='history'&&history.length>0&&(
              <span style={{marginLeft:5,fontSize:10,background:'rgba(91,156,246,.15)',
                color:'var(--accent)',borderRadius:99,padding:'1px 5px'}}>{history.length}</span>
            )}
          </div>
        ))}
      </div>

      {/* Attributes */}
      {tab==='attributes' && (
        <div>
          {Object.entries(bySection).map(([section,attrs])=>(
            <div key={section}>
              <div className="sec">{section}</div>
              <div className="g2">
                {[...attrs].sort((a,b)=>a.displayOrder-b.displayOrder).map(attr=>(
                  <div className="field" key={attr.id}>
                    <label className="field-label">{attr.label}</label>
                    <input className="field-input"
                      readOnly={!attr.editable||!txId}
                      value={edits[attr.id]!==undefined?edits[attr.id]:(attr.value||'')}
                      onChange={e=>{
                        if(!attr.editable||!txId) return;
                        setEdits(ed=>({...ed,[attr.id]:e.target.value}));
                        setDirty(true);
                      }}/>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {dirty && desc.canWrite && txId && (
            <div className="row mt16" style={{justifyContent:'flex-end',gap:8}}>
              <button className="btn" onClick={()=>{setEdits({});setDirty(false);}}>Discard</button>
              <button className="btn btn-primary" disabled={loading} onClick={handleSave}>
                {loading?'Saving…':'Save'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Signatures */}
      {tab==='history' && (
        <div>
          <div className="ver-row header">
            <span>#</span><span>Rev</span><span>State</span><span>Action</span><span>Comment</span><span>Who</span>
          </div>
          {history.length===0
            ? <div className="empty"><div className="empty-icon">◌</div>No versions yet</div>
            : [...history].reverse().map(v=>(
              <div key={v.version_number} className="ver-row">
                <span className="ver-num">{v.version_number}</span>
                <span className="ver-rev">{v.revision}.{v.iteration}</span>
                <span className="text-muted" style={{fontSize:11}}>
                  <StatePill stateId={v.lifecycle_state_id}/>
                </span>
                <span style={{color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {v.change_description || v.change_type || '—'}
                </span>
                <span className="text-muted" style={{fontSize:11,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {v.tx_comment
                    ? v.tx_comment
                    : <span style={{opacity:.4}}>—</span>}
                </span>
                <span className="text-muted" style={{fontSize:11,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {v.created_by || v.tx_owner || <span style={{opacity:.4}}>—</span>}
                </span>
              </div>
            ))
          }
        </div>
      )}

      {tab==='signatures' && (
        <div>
          {sigs.length===0
            ? <div className="empty"><div className="empty-icon">✦</div>No signatures yet</div>
            : sigs.map((s,i)=>(
                <div key={i} className="sig-item">
                  <span style={{fontFamily:'var(--sans)',fontWeight:700,fontSize:11,color:'var(--success)'}}>{s.meaning||s.MEANING}</span>
                  <span style={{flex:1}}>{s.signedBy||s.SIGNED_BY}</span>
                  <span className="text-muted">{s.comment||s.COMMENT||''}</span>
                </div>
              ))
          }
          {desc.actions.some(a=>a.type==='SIGN') && (
            <button className="btn btn-success btn-sm mt8"
              onClick={()=>{setTab('attributes'); setSignPanel(true);}}>
              ✦ Add signature
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar node item ────────────────────────────────────────────────
function SidebarNode({nodeId, userId, txId, selected, onClick}) {
  const [desc, setDesc] = useState(null);
  useEffect(()=>{
    api.getNodeDescription(userId, nodeId, txId).then(setDesc).catch(()=>{});
  },[nodeId, userId, txId]);
  const label = desc?.attributes?.find(a=>a.name==='name'||a.name==='title'||a.name==='partNumber'||a.name==='number')?.value
    || nodeId.slice(0,8)+'…';
  return (
    <div className={`node-item ${selected?'active':''}`} onClick={onClick}>
      <span className="dot" style={{background:STATE_COLORS[desc?.state]||'#6b7280'}}/>
      <span className="node-id">{desc?.identity||'…'}</span>
      <span className="node-name">{label}</span>
      {desc?.txStatus==='OPEN'&&<span style={{fontSize:9,color:'var(--warn)'}}>✎</span>}
    </div>
  );
}

// ─── Settings — Create Node Type modal ───────────────────────────────
function CreateNodeTypeModal({userId, lifecycles, onCreated, onClose, toast}) {
  const [name, setName]   = useState('');
  const [desc, setDesc]   = useState('');
  const [lcId, setLcId]   = useState(lifecycles[0]?.id || '');
  const [loading, setLoading] = useState(false);
  async function submit() {
    if (!name.trim()) { toast('Name is required','warn'); return; }
    setLoading(true);
    try {
      const d = await api.createNodeType(userId, {name, description: desc, lifecycleId: lcId||null});
      toast('Node type created','success');
      onCreated(d);
      onClose();
    } catch(e) { toast(e,'error'); }
    finally { setLoading(false); }
  }
  return (
    <div className="overlay">
      <div className="card" style={{width:420}}>
        <div className="card-hd row-between">
          <span className="card-title">New node type</span>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card-body">
          <div className="field"><label className="field-label">Name *</label>
            <input className="field-input" value={name} onChange={e=>setName(e.target.value)} autoFocus placeholder="e.g. Assembly"/></div>
          <div className="field"><label className="field-label">Description</label>
            <input className="field-input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Optional"/></div>
          <div className="field"><label className="field-label">Lifecycle</label>
            <select className="field-input" value={lcId} onChange={e=>setLcId(e.target.value)}>
              <option value="">— none —</option>
              {lifecycles.map(lc=><option key={lc.id} value={lc.id}>{lc.name}</option>)}
            </select></div>
          <div className="row" style={{justifyContent:'flex-end',gap:8,marginTop:16}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading||!name.trim()}>
              {loading?'Creating…':'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings — Create Attribute modal ────────────────────────────────
function CreateAttributeModal({userId, nodeTypeId, onCreated, onClose, toast}) {
  const [form, setForm] = useState({name:'',label:'',dataType:'STRING',required:false,widgetType:'TEXT',displayOrder:10,displaySection:'General',allowedValues:''});
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  async function submit() {
    if (!form.name.trim()||!form.label.trim()) { toast('Name and Label are required','warn'); return; }
    setLoading(true);
    try {
      const body = {...form, required: form.required?1:0,
        allowedValues: form.allowedValues.trim()||null};
      const d = await api.createAttribute(userId, nodeTypeId, body);
      toast('Attribute created','success');
      onCreated(d);
      onClose();
    } catch(e) { toast(e,'error'); }
    finally { setLoading(false); }
  }
  return (
    <div className="overlay">
      <div className="card" style={{width:480,maxHeight:'85vh',overflow:'auto'}}>
        <div className="card-hd row-between">
          <span className="card-title">New attribute</span>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card-body">
          <div className="g2">
            <div className="field"><label className="field-label">Name *</label>
              <input className="field-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="partNumber" autoFocus/></div>
            <div className="field"><label className="field-label">Label *</label>
              <input className="field-input" value={form.label} onChange={e=>set('label',e.target.value)} placeholder="Part Number"/></div>
          </div>
          <div className="g2">
            <div className="field"><label className="field-label">Type</label>
              <select className="field-input" value={form.dataType} onChange={e=>set('dataType',e.target.value)}>
                {['STRING','NUMBER','DATE','BOOLEAN','ENUM'].map(t=><option key={t}>{t}</option>)}
              </select></div>
            <div className="field"><label className="field-label">Widget</label>
              <select className="field-input" value={form.widgetType} onChange={e=>set('widgetType',e.target.value)}>
                {['TEXT','TEXTAREA','DROPDOWN','DATE_PICKER','CHECKBOX'].map(w=><option key={w}>{w}</option>)}
              </select></div>
          </div>
          <div className="g2">
            <div className="field"><label className="field-label">Section</label>
              <input className="field-input" value={form.displaySection} onChange={e=>set('displaySection',e.target.value)} placeholder="General"/></div>
            <div className="field"><label className="field-label">Display order</label>
              <input className="field-input" type="number" value={form.displayOrder} onChange={e=>set('displayOrder',+e.target.value)}/></div>
          </div>
          {form.dataType==='ENUM' && (
            <div className="field"><label className="field-label">Allowed values (comma-separated)</label>
              <input className="field-input" value={form.allowedValues} onChange={e=>set('allowedValues',e.target.value)} placeholder="Option A, Option B, Option C"/></div>
          )}
          <div className="field" style={{display:'flex',alignItems:'center',gap:10,marginTop:4}}>
            <input type="checkbox" id="req-cb" checked={form.required} onChange={e=>set('required',e.target.checked)} style={{accentColor:'var(--accent)'}}/>
            <label htmlFor="req-cb" style={{fontSize:12,cursor:'pointer'}}>Required field</label>
          </div>
          <div className="row" style={{justifyContent:'flex-end',gap:8,marginTop:16}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading?'Creating…':'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings — Create Link Type modal ────────────────────────────────
function CreateLinkTypeModal({userId, nodeTypes, onCreated, onClose, toast}) {
  const [form, setForm] = useState({name:'',description:'',sourceNodeTypeId:nodeTypes[0]?.id||'',targetNodeTypeId:nodeTypes[0]?.id||'',linkPolicy:'VERSION_TO_MASTER',maxCardinality:''});
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  async function submit() {
    if (!form.name.trim()) { toast('Name is required','warn'); return; }
    setLoading(true);
    try {
      const body = {...form, maxCardinality: form.maxCardinality ? +form.maxCardinality : null};
      const d = await api.createLinkType(userId, body);
      toast('Link type created','success');
      onCreated(d);
      onClose();
    } catch(e) { toast(e,'error'); }
    finally { setLoading(false); }
  }
  return (
    <div className="overlay">
      <div className="card" style={{width:460}}>
        <div className="card-hd row-between">
          <span className="card-title">New link type</span>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card-body">
          <div className="g2">
            <div className="field"><label className="field-label">Name *</label>
              <input className="field-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="composed_of" autoFocus/></div>
            <div className="field"><label className="field-label">Policy</label>
              <select className="field-input" value={form.linkPolicy} onChange={e=>set('linkPolicy',e.target.value)}>
                <option value="VERSION_TO_MASTER">VERSION_TO_MASTER</option>
                <option value="VERSION_TO_VERSION">VERSION_TO_VERSION</option>
              </select></div>
          </div>
          <div className="g2">
            <div className="field"><label className="field-label">Source node type</label>
              <select className="field-input" value={form.sourceNodeTypeId} onChange={e=>set('sourceNodeTypeId',e.target.value)}>
                {nodeTypes.map(nt=><option key={nt.id} value={nt.id}>{nt.name}</option>)}
              </select></div>
            <div className="field"><label className="field-label">Target node type</label>
              <select className="field-input" value={form.targetNodeTypeId} onChange={e=>set('targetNodeTypeId',e.target.value)}>
                {nodeTypes.map(nt=><option key={nt.id} value={nt.id}>{nt.name}</option>)}
              </select></div>
          </div>
          <div className="field"><label className="field-label">Description</label>
            <input className="field-input" value={form.description} onChange={e=>set('description',e.target.value)}/></div>
          <div className="row" style={{justifyContent:'flex-end',gap:8,marginTop:16}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading?'Creating…':'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings — Node Types tab ────────────────────────────────────────
function NodeTypesTab({userId, toast}) {
  const [nodeTypes, setNodeTypes]   = useState([]);
  const [lifecycles, setLifecycles] = useState([]);
  const [selected, setSelected]     = useState(null);
  const [attrs, setAttrs]           = useState([]);
  const [modal, setModal]           = useState(null); // 'nt'|'attr'

  useEffect(()=>{
    api.getNodeTypes(userId).then(d=>setNodeTypes(Array.isArray(d)?d:[])).catch(()=>{});
    api.getLifecycles(userId).then(d=>setLifecycles(Array.isArray(d)?d:[])).catch(()=>{});
  },[userId]);

  useEffect(()=>{
    if (!selected) { setAttrs([]); return; }
    api.getNodeTypeAttributes(userId, selected.id)
      .then(d=>setAttrs(Array.isArray(d)?d:[]))
      .catch(()=>setAttrs([]));
  },[selected, userId]);

  const lcName = id => lifecycles.find(l=>l.id===id)?.name || id || '—';

  return (
    <div>
      <div className="row-between" style={{marginBottom:14}}>
        <div className="sb-label" style={{margin:0}}>Node Types</div>
        <button className="btn btn-sm btn-primary" onClick={()=>setModal('nt')}>+ New type</button>
      </div>
      <div className="settings-split">
        {/* Left: list */}
        <div className="card">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Lifecycle</th></tr></thead>
            <tbody>
              {nodeTypes.length===0
                ? <tr><td colSpan={2} className="text-muted" style={{padding:16,textAlign:'center'}}>No node types</td></tr>
                : nodeTypes.map(nt=>(
                  <tr key={nt.id} className={selected?.id===nt.id?'sel':''} onClick={()=>setSelected(nt)}>
                    <td style={{fontFamily:'var(--sans)',fontWeight:700}}>{nt.name}</td>
                    <td className="text-muted" style={{fontSize:11}}>{lcName(nt.lifecycle_id)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {/* Right: attributes */}
        <div>
          {selected ? (
            <div className="card">
              <div className="card-hd row-between">
                <span className="card-title">{selected.name} — Attributes</span>
                <button className="btn btn-sm" onClick={()=>setModal('attr')}>+ Add attribute</button>
              </div>
              <table className="tbl">
                <thead><tr><th>Name</th><th>Label</th><th>Type</th><th>Widget</th><th>Section</th><th>Req</th></tr></thead>
                <tbody>
                  {attrs.length===0
                    ? <tr><td colSpan={6} className="text-muted" style={{padding:16,textAlign:'center'}}>No attributes</td></tr>
                    : [...attrs].sort((a,b)=>a.display_order-b.display_order).map(a=>(
                      <tr key={a.id}>
                        <td style={{fontFamily:'var(--mono)'}}>{a.name}</td>
                        <td>{a.label}</td>
                        <td><span className="pill" style={{background:'rgba(91,156,246,.1)',color:'var(--accent)',border:'1px solid rgba(91,156,246,.2)',fontSize:10}}>{a.data_type}</span></td>
                        <td className="text-muted" style={{fontSize:11}}>{a.widget_type}</td>
                        <td className="text-muted" style={{fontSize:11}}>{a.display_section||'—'}</td>
                        <td>{a.required?<span style={{color:'var(--warn)'}}>✓</span>:<span style={{color:'var(--border2)'}}>—</span>}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty" style={{paddingTop:60}}>
              <div className="empty-icon">◫</div>
              <div className="text-muted">Select a node type to view its attributes</div>
            </div>
          )}
        </div>
      </div>

      {modal==='nt' && (
        <CreateNodeTypeModal userId={userId} lifecycles={lifecycles}
          onCreated={d=>{api.getNodeTypes(userId).then(r=>setNodeTypes(Array.isArray(r)?r:[])).catch(()=>{});}}
          onClose={()=>setModal(null)} toast={toast}/>
      )}
      {modal==='attr' && selected && (
        <CreateAttributeModal userId={userId} nodeTypeId={selected.id}
          onCreated={()=>{api.getNodeTypeAttributes(userId,selected.id).then(d=>setAttrs(Array.isArray(d)?d:[])).catch(()=>{});}}
          onClose={()=>setModal(null)} toast={toast}/>
      )}
    </div>
  );
}

// ─── Settings — Lifecycles tab ────────────────────────────────────────
function LifecyclesTab({userId}) {
  const [lifecycles, setLifecycles] = useState([]);
  const [selected, setSelected]     = useState(null);
  const [states, setStates]         = useState([]);
  const [transitions, setTransitions] = useState([]);

  useEffect(()=>{
    api.getLifecycles(userId).then(d=>setLifecycles(Array.isArray(d)?d:[])).catch(()=>{});
  },[userId]);

  useEffect(()=>{
    if (!selected) { setStates([]); setTransitions([]); return; }
    Promise.all([
      api.getLifecycleStates(userId, selected.id).catch(()=>[]),
      api.getLifecycleTransitions(userId, selected.id).catch(()=>[]),
    ]).then(([s,t])=>{
      setStates(Array.isArray(s)?s:[]);
      setTransitions(Array.isArray(t)?t:[]);
    });
  },[selected, userId]);

  const stateName = id => states.find(s=>s.id===id)?.name || id;

  return (
    <div>
      <div className="sb-label" style={{marginBottom:14}}>Lifecycles</div>
      <div className="settings-split">
        <div className="card">
          <table className="tbl">
            <thead><tr><th>Name</th></tr></thead>
            <tbody>
              {lifecycles.length===0
                ? <tr><td className="text-muted" style={{padding:16,textAlign:'center'}}>No lifecycles</td></tr>
                : lifecycles.map(lc=>(
                  <tr key={lc.id} className={selected?.id===lc.id?'sel':''} onClick={()=>setSelected(lc)}>
                    <td style={{fontFamily:'var(--sans)',fontWeight:700}}>{lc.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div>
          {selected ? (
            <>
              <div className="card" style={{marginBottom:12}}>
                <div className="card-hd"><span className="card-title">States</span></div>
                <div className="card-body" style={{paddingTop:10}}>
                  <div className="lc-flow">
                    {[...states].sort((a,b)=>a.display_order-b.display_order).map(s=>(
                      <div key={s.id} className="lc-state">
                        {s.name}
                        {s.is_initial?<span className="flag flag-init" style={{marginLeft:6}}>init</span>:null}
                        {s.is_frozen?<span className="flag flag-frozen" style={{marginLeft:6}}>frozen</span>:null}
                        {s.is_released?<span className="flag flag-rel" style={{marginLeft:6}}>released</span>:null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-hd"><span className="card-title">Transitions</span></div>
                <table className="tbl">
                  <thead><tr><th>Name</th><th>From</th><th>To</th><th>Guard</th><th>Action</th></tr></thead>
                  <tbody>
                    {transitions.length===0
                      ? <tr><td colSpan={5} className="text-muted" style={{padding:16,textAlign:'center'}}>No transitions</td></tr>
                      : transitions.map(t=>(
                        <tr key={t.id}>
                          <td style={{fontFamily:'var(--sans)',fontWeight:700}}>{t.name}</td>
                          <td className="text-muted" style={{fontSize:11}}>{stateName(t.from_state_id)}</td>
                          <td style={{fontSize:11}}>→ {stateName(t.to_state_id)}</td>
                          <td className="text-muted" style={{fontSize:11}}>{t.guard_expr||'—'}</td>
                          <td className="text-muted" style={{fontSize:11}}>{t.action_type||'—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty" style={{paddingTop:60}}>
              <div className="empty-icon">⟳</div>
              <div className="text-muted">Select a lifecycle to view its states and transitions</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Settings — Link Types tab ────────────────────────────────────────
function LinkTypesTab({userId, toast}) {
  const [linkTypes, setLinkTypes] = useState([]);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [modal, setModal]         = useState(false);

  const reload = useCallback(()=>{
    api.getLinkTypes(userId).then(d=>setLinkTypes(Array.isArray(d)?d:[])).catch(()=>{});
  },[userId]);

  useEffect(()=>{
    reload();
    api.getNodeTypes(userId).then(d=>setNodeTypes(Array.isArray(d)?d:[])).catch(()=>{});
  },[userId, reload]);

  const ntName = id => nodeTypes.find(n=>n.id===id)?.name || id || '—';

  return (
    <div>
      <div className="row-between" style={{marginBottom:14}}>
        <div className="sb-label" style={{margin:0}}>Link Types</div>
        <button className="btn btn-sm btn-primary" onClick={()=>setModal(true)}>+ New link type</button>
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Name</th><th>Source</th><th>Target</th><th>Policy</th><th>Max card.</th></tr></thead>
          <tbody>
            {linkTypes.length===0
              ? <tr><td colSpan={5} className="text-muted" style={{padding:16,textAlign:'center'}}>No link types</td></tr>
              : linkTypes.map(lt=>(
                <tr key={lt.id}>
                  <td style={{fontFamily:'var(--sans)',fontWeight:700}}>{lt.name}</td>
                  <td className="text-muted" style={{fontSize:11}}>{ntName(lt.source_node_type_id)}</td>
                  <td className="text-muted" style={{fontSize:11}}>{ntName(lt.target_node_type_id)}</td>
                  <td><span className="pill" style={{background:'rgba(167,139,250,.1)',color:'#a78bfa',border:'1px solid rgba(167,139,250,.2)',fontSize:10}}>{lt.link_policy}</span></td>
                  <td className="text-muted" style={{fontSize:11}}>{lt.max_cardinality??'∞'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {modal && nodeTypes.length>0 && (
        <CreateLinkTypeModal userId={userId} nodeTypes={nodeTypes}
          onCreated={()=>reload()} onClose={()=>setModal(false)} toast={toast}/>
      )}
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────
function SettingsPage({userId, toast}) {
  const [tab, setTab] = useState('nodetypes');
  return (
    <div className="settings-wrap">
      <div className="tabs" style={{marginBottom:20}}>
        {[['nodetypes','Node Types'],['lifecycles','Lifecycles'],['linktypes','Link Types']].map(([id,label])=>(
          <div key={id} className={`tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{label}</div>
        ))}
      </div>
      {tab==='nodetypes'  && <NodeTypesTab  userId={userId} toast={toast}/>}
      {tab==='lifecycles' && <LifecyclesTab userId={userId}/>}
      {tab==='linktypes'  && <LinkTypesTab  userId={userId} toast={toast}/>}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]         = useState(USERS[1]);
  const [page, setPage]         = useState('plm');  // 'plm'|'settings'
  const [nodeTypes, setNodeTypes] = useState([]);
  const [nodes, setNodes]       = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tx, setTx]             = useState(null);   // transaction OPEN courante
  const [modal, setModal]       = useState(null);   // 'create'|'commit'
  const {toasts, toast, errorDetail, setErrDetail} = useToasts();

  // Charger les nodeTypes, la tx courante et la liste de noeuds au changement d'utilisateur
  useEffect(()=>{
    setSelectedId(null); setNodes([]); setTx(null);
    api.getNodeTypes(user.id).then(types=>setNodeTypes(Array.isArray(types)?types:[])).catch(()=>{});
    api.listNodes(user.id).then(list=>setNodes(Array.isArray(list)?list.map(n=>n.id):[]) ).catch(()=>{});
    txApi.current(user.id).then(data=>{
      if (data?.status==='OPEN') setTx(data);
      else setTx(null);
    }).catch(()=>setTx(null));
  },[user.id]);

  async function autoOpenTx() {
    if (txId) return txId;
    try {
      const data = await txApi.open(user.id, null);
      const full = await txApi.get(user.id, data.txId).catch(()=>({id: data.txId, status:'OPEN'}));
      setTx(full);
      toast('Transaction opened', 'success');
      return data.txId;
    } catch(e) { toast(e,'error'); return null; }
  }

  async function handleCommitted() {
    setTx(null);
  }

  async function handleRollback() {
    if (!tx) return;
    const txId = tx.ID||tx.id;
    try {
      await txApi.rollback(user.id, txId);
      toast('Transaction rolled back — changes discarded','warn');
      setTx(null);
    } catch(e) { toast(e,'error'); }
  }

  const txId = tx?.ID||tx?.id||null;

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        {/* Topbar */}
        <header className="topbar">
          <div className="brand">PLM<span>CORE</span></div>
          <div className="row" style={{gap:4,marginLeft:16}}>
            <div className={`nav-tab ${page==='plm'?'active':''}`} onClick={()=>setPage('plm')}>Objects</div>
            <div className={`nav-tab ${page==='settings'?'active':''}`} onClick={()=>setPage('settings')}>⚙ Settings</div>
          </div>
          <span style={{flex:1}}/>
          <div className="row" style={{gap:6}}>
            {USERS.map(u=>(
              <button key={u.id} className="btn btn-sm"
                style={user.id===u.id?{borderColor:u.color,color:u.color}:{}}
                onClick={()=>setUser(u)}>
                <span style={{width:16,height:16,borderRadius:'50%',background:`${u.color}22`,
                  color:u.color,display:'inline-flex',alignItems:'center',justifyContent:'center',
                  fontSize:10,fontWeight:700,fontFamily:'var(--sans)'}}>
                  {u.label[0]}
                </span>
                {u.label}
                <span style={{fontSize:10,opacity:.6}}>{u.role}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Transaction bar */}
        <TxBar
          tx={tx}
          onCommit={()=>setModal('commit')}
          onRollback={handleRollback}
        />

        {page==='settings' ? (
          <SettingsPage userId={user.id} toast={toast}/>
        ) : (
        <div className="main">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sb-section">
              <div className="row-between" style={{marginBottom:10}}>
                <span className="sb-label" style={{margin:0}}>Objects</span>
                <button className="btn btn-sm btn-primary"
                  onClick={async ()=>{ const t = txId || await autoOpenTx(); if(t) setModal('create'); }}>+ New</button>
              </div>
              {nodes.length===0
                ? <div className="text-muted" style={{fontSize:11,padding:'8px 0'}}>No nodes yet</div>
                : nodes.map(n=>(
                    <SidebarNode key={n} nodeId={n} userId={user.id} txId={txId}
                      selected={selectedId===n} onClick={()=>setSelectedId(n)}/>
                  ))
              }
            </div>
          </aside>

          {/* Content */}
          <main className="content">
            {selectedId
              ? <NodeDetail key={`${selectedId}-${user.id}`}
                  nodeId={selectedId} user={user} tx={tx} toast={toast}
                  onAutoOpenTx={autoOpenTx}/>
              : <div className="empty" style={{marginTop:80}}>
                  <div className="empty-icon">◎</div>
                  <div className="text-muted">Select or create a node</div>
                </div>
            }
          </main>
        </div>
        )}
      </div>

      {/* Modals */}
      {modal==='create' && (
        <CreateNodeModal userId={user.id} nodeTypes={nodeTypes}
          onCreated={id=>{
            api.listNodes(user.id).then(list=>setNodes(Array.isArray(list)?list.map(n=>n.id):[])).catch(()=>{});
            setSelectedId(id);
          }}
          onClose={()=>setModal(null)} toast={toast}/>
      )}
      {modal==='commit' && txId && (
        <CommitModal userId={user.id} txId={txId}
          onCommitted={handleCommitted}
          onClose={()=>setModal(null)} toast={toast}/>
      )}

      <Toasts toasts={toasts}/>
      {errorDetail && <ErrorDetailModal detail={errorDetail} onClose={()=>setErrDetail(null)}/>}
    </>
  );
}
