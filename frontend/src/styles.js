const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ── Design tokens ───────────────────────────────────────────────── */
:root{
  /* Surfaces */
  --bg:#0d0f12;--surface:#13161b;--surface2:#181c22;
  --border:#222831;--border2:#2d3748;

  /* Text — bumped for WCAG AA contrast */
  --text:#e8edf4;
  --muted:#8fa3bd;       /* ≥4.5:1 on --bg */
  --muted2:#6b8099;      /* ~3.5:1 — secondary only */

  /* Semantic */
  --accent:#6aacff;      /* slightly brighter blue — better contrast */
  --accent-dim:rgba(106,172,255,.11);
  --accent-hover:#88beff;
  --danger:#fc8181;
  --success:#4dd4a0;     /* slightly adjusted for readability */
  --warn:#f0b429;

  /* Geometry */
  --r:5px;--r2:8px;
  --mono:'DM Mono',monospace;--sans:'Syne',sans-serif;
  --panel-w:268px;--header-h:52px;
}


html,body,#root{height:100%;overflow:hidden}
body{background:var(--bg);color:var(--text);font-family:var(--mono);font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased}

/* ── Accessibility: global focus ring ───────────────────────────── */
:focus-visible{
  outline:2px solid var(--accent);
  outline-offset:2px;
  border-radius:3px;
}
/* Remove focus ring when interacting with mouse */
:focus:not(:focus-visible){outline:none}

/* ── Scrollbar ───────────────────────────────────────────────────── */
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:99px}

/* ── Shell ───────────────────────────────────────────────────────── */
.shell{display:flex;flex-direction:column;height:100vh;overflow:hidden}

/* ── Header ──────────────────────────────────────────────────────── */
.header{
  display:grid;grid-template-columns:auto 1fr auto;align-items:center;
  padding:0 16px;height:var(--header-h);flex-shrink:0;
  background:var(--surface);border-bottom:1px solid var(--border);
  position:relative;z-index:100;
}
.header-left{display:flex;align-items:center;gap:10px}
.header-center{display:flex;align-items:center;justify-content:center;padding:0 16px}
.header-right{display:flex;align-items:center;gap:10px;justify-content:flex-end}

.brand{
  font-family:var(--sans);font-weight:800;font-size:14px;
  letter-spacing:.05em;white-space:nowrap;color:var(--text);
  display:flex;align-items:center;gap:6px;
}
.brand-mark{
  width:24px;height:24px;border-radius:5px;
  background:linear-gradient(135deg,var(--accent) 0%,#7c3aed 100%);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:800;color:#fff;flex-shrink:0;
}
.brand-sep{width:1px;height:20px;background:var(--border2);margin:0 4px}

.search-group{
  display:flex;align-items:center;width:100%;max-width:480px;
  background:var(--bg);border:1px solid var(--border2);border-radius:var(--r);
  overflow:hidden;transition:border-color .15s;
}
.search-group:focus-within{border-color:var(--accent);outline:none}
.search-icon{padding:0 10px;color:var(--muted);font-size:13px;flex-shrink:0;pointer-events:none}
.search-input{
  flex:1;padding:8px 0;background:transparent;border:none;
  color:var(--text);font-family:var(--mono);font-size:12px;outline:none;
  min-width:0;
}
.search-input::placeholder{color:var(--muted2)}
.search-divider{width:1px;height:22px;background:var(--border2);flex-shrink:0}
.search-type{
  padding:0 10px 0 8px;background:transparent;border:none;
  color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer;outline:none;
  -webkit-appearance:none;appearance:none;
}
.search-type option{background:var(--surface)}

.search-wrap{position:relative;width:100%;max-width:480px}
.search-suggestions{
  position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:300;
  background:var(--surface);border:1px solid var(--border2);
  border-radius:var(--r);box-shadow:0 8px 24px rgba(0,0,0,.35);
  overflow:hidden;
}
.search-sug-item{
  display:flex;align-items:center;gap:8px;
  padding:7px 12px;cursor:pointer;transition:background .1s;
}
.search-sug-item:hover,.search-sug-item.hi{background:var(--hover)}
.sug-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sug-lid{font-family:var(--mono);font-size:12px;color:var(--text);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0}
.sug-dname{font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
.sug-meta{font-family:var(--mono);font-size:10px;color:var(--muted);white-space:nowrap;flex-shrink:0}

.user-select-wrap{position:relative;display:flex;align-items:center;gap:8px}
.user-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.user-select{
  appearance:none;-webkit-appearance:none;
  background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);
  color:var(--text);font-family:var(--sans);font-size:12px;font-weight:600;
  padding:6px 28px 6px 10px;cursor:pointer;outline:none;
  transition:border-color .15s;min-height:32px;
}
.user-select:hover{border-color:var(--border2)}
.user-select:focus-visible{border-color:var(--accent);outline:2px solid var(--accent);outline-offset:2px}
.user-select option{background:var(--surface)}
.user-select-chevron{
  position:absolute;right:8px;top:50%;transform:translateY(-50%);
  color:var(--muted);font-size:10px;pointer-events:none;
}
.ps-select-wrap{display:flex;align-items:center;gap:6px;margin-right:6px}
.ps-select{
  appearance:none;-webkit-appearance:none;
  background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);
  color:var(--muted);font-family:var(--sans);font-size:11px;font-weight:600;
  padding:5px 24px 5px 8px;cursor:pointer;transition:border-color .15s;
}
.ps-select:focus-visible{border-color:var(--accent);outline:2px solid var(--accent);outline-offset:2px;color:var(--text)}
.ps-select option{background:var(--surface)}

/* ── Body layout ─────────────────────────────────────────────────── */
.body{display:flex;flex:1;overflow:hidden}
.editor-column{display:flex;flex-direction:column;flex:1;overflow:hidden;min-width:0}
.resize-handle{width:4px;flex-shrink:0;cursor:col-resize;background:transparent;transition:background .15s}
.resize-handle:hover,.resize-handle:active{background:var(--border2)}

/* ── Left Panel ──────────────────────────────────────────────────── */
.left-panel{
  width:var(--panel-w);flex-shrink:0;display:flex;flex-direction:column;
  background:var(--surface);border-right:1px solid var(--border);overflow:hidden;
}
.settings-section-nav{display:flex;flex-direction:column;flex:1;overflow-y:auto;padding:8px 6px}
.panel-section{display:flex;flex-direction:column;border-bottom:1px solid var(--border)}
.panel-section-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 10px;flex-shrink:0;border-bottom:1px solid var(--border);
  min-height:34px;
}
.panel-label{
  font-family:var(--sans);font-size:10px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--muted);
}
.panel-icon-btn{
  display:flex;align-items:center;justify-content:center;
  background:none;border:none;padding:4px;cursor:pointer;
  border-radius:4px;transition:background .1s;line-height:0;
}
.panel-icon-btn:hover{background:var(--accent-dim)}
.panel-icon-btn:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.panel-empty{padding:16px 12px;font-size:11px;color:var(--muted2);font-style:italic;text-align:center}

/* Node list */
.node-list{flex:1;overflow-y:auto;min-height:0}

/* Type group header */
.type-group-hd{
  display:flex;align-items:center;gap:4px;
  padding:5px 10px;cursor:pointer;
  background:transparent;
  transition:background .1s;
  user-select:none;
}
.type-group-hd:hover{background:rgba(255,255,255,.03)}
.type-chevron{display:flex;align-items:center;flex-shrink:0;width:16px}
.type-group-name{
  flex:1;font-family:var(--sans);font-size:11px;font-weight:700;
  color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.type-group-count{
  font-family:var(--sans);font-size:10px;font-weight:700;
  color:var(--muted2);background:rgba(255,255,255,.05);
  padding:1px 6px;border-radius:99px;
}

/* Node item (under type group) */
.node-item{
  display:flex;align-items:center;gap:6px;
  padding:5px 10px 5px 12px;cursor:grab;
  border-left:2px solid transparent;
  transition:background .1s,border-color .1s;
  user-select:none;
}
.node-item:active{cursor:grabbing}
.node-item:hover{background:rgba(255,255,255,.03)}
.node-item.active{background:var(--accent-dim);border-left-color:var(--accent)}
.ni-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.ni-id{font-family:var(--sans);font-weight:700;font-size:11px;color:var(--accent);white-space:nowrap}
.ni-open{font-size:8px;color:var(--warn);flex-shrink:0;margin-left:-2px}
/* Expand toggle — shared by node rows and link rows */
.ni-expand{
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;width:14px;height:14px;
  cursor:pointer;border-radius:2px;
  transition:background .1s;
}
.ni-expand:hover{background:rgba(255,255,255,.08)}
/* Logical ID text */
.ni-logical{
  font-family:var(--mono);font-size:11px;color:var(--text);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.ni-no-id{color:var(--muted2)}
.ni-dname{font-size:10px;color:var(--muted);margin-left:4px;font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Rev.iter */
.ni-reviter{
  font-family:var(--mono);font-size:10px;color:var(--muted);
  flex-shrink:0;
}
/* Link row — child of a node in the tree */
.ni-link-row{
  display:flex;align-items:center;gap:5px;
  padding-right:10px;
  min-height:22px;cursor:pointer;
  border-left:3px solid transparent;
  transition:background .1s;
  user-select:none;
}
.ni-link-row:hover{background:rgba(255,255,255,.03)}
.ni-link-row.active{background:var(--accent-dim)}
/* Link logical ID inside a link row */
.ni-link-id{
  font-family:var(--mono);font-size:9px;font-weight:500;
  color:var(--muted);white-space:nowrap;
  max-width:64px;overflow:hidden;text-overflow:ellipsis;
  flex-shrink:0;
}
/* Version policy badge (V2M / V2V) */
.ni-policy{
  font-family:var(--sans);font-size:8px;font-weight:700;
  padding:1px 4px;border-radius:3px;flex-shrink:0;
}
.ni-policy-v2m{background:rgba(106,172,255,.15);color:var(--accent)}
.ni-policy-v2v{background:rgba(240,180,41,.15);color:var(--warn)}
/* Empty children placeholder */
.ni-child-empty{
  font-size:10px;color:var(--muted2);
  padding:3px 10px;user-select:none;
}

/* Lifecycle panel */
.lc-panel{flex:0 0 auto;max-height:38%}
.lc-list{overflow-y:auto;flex:1}
.lc-item{
  display:flex;align-items:center;gap:4px;
  padding:5px 10px;cursor:pointer;
  transition:background .1s;user-select:none;
}
.lc-item:hover{background:rgba(255,255,255,.03)}
.lc-chevron{display:flex;align-items:center;flex-shrink:0;width:16px}
.lc-name{font-size:11px;color:var(--text);font-weight:600}
.lc-loading{font-size:11px;color:var(--muted);margin-left:4px}
.lc-states{padding:2px 0 4px 26px;display:flex;flex-direction:column;gap:1px}
.lc-state-item{display:flex;align-items:center;gap:6px;padding:3px 10px 3px 0}
.lc-state-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.lc-state-name{font-size:11px;color:var(--muted);flex:1}
.lc-state-flag{
  font-size:9px;font-family:var(--sans);font-weight:700;
  padding:1px 4px;border-radius:3px;
  background:rgba(255,255,255,.07);color:var(--muted2);
}

/* Transaction panel (left panel bottom) */
.tx-panel{flex:0 0 auto;max-height:55%;display:flex;flex-direction:column}
.tx-list{flex:1;overflow-y:auto;min-height:0}
.tx-id-badge{
  margin-left:6px;font-family:var(--mono);font-size:9px;
  color:var(--accent);background:var(--accent-dim);
  padding:1px 5px;border-radius:99px;font-weight:400;vertical-align:middle;
}
.tx-count-badge{
  font-family:var(--sans);font-size:10px;font-weight:700;
  color:var(--muted2);background:rgba(255,255,255,.06);
  padding:1px 7px;border-radius:99px;
}
.tx-item{
  display:flex;align-items:center;gap:8px;
  padding:7px 10px;cursor:pointer;
  border-left:2px solid transparent;
  transition:background .1s,border-color .1s;
}
.tx-item:hover{background:rgba(106,172,255,.06);border-left-color:rgba(106,172,255,.35)}
.tx-item.active{background:var(--accent-dim);border-left-color:var(--accent)}
.tx-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:1px}
.tx-item-body{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}
.tx-item-main{display:flex;align-items:center;justify-content:space-between;gap:4px}
.tx-item-sub{display:flex;align-items:center;justify-content:space-between;gap:4px}
.tx-logical{
  font-family:var(--sans);font-weight:700;font-size:11px;color:var(--text);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;
}
.tx-reviter{font-family:var(--mono);font-size:10px;color:var(--muted2);white-space:nowrap;flex-shrink:0}
.tx-typename{font-size:10px;color:var(--muted2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.tx-ct-badge{
  font-family:var(--sans);font-size:9px;font-weight:700;letter-spacing:.04em;
  padding:1px 5px;border-radius:3px;white-space:nowrap;flex-shrink:0;
}
.tx-actions{
  display:flex;gap:6px;padding:8px 10px;flex-shrink:0;
  border-top:1px solid var(--border);
}

/* Panel footer (settings) */
.panel-footer{
  flex-shrink:0;border-top:1px solid var(--border);padding:8px;
}
.settings-btn{
  display:flex;align-items:center;gap:7px;width:100%;
  padding:7px 10px;border-radius:var(--r);
  background:none;border:1px solid transparent;cursor:pointer;
  font-family:var(--sans);font-size:11px;font-weight:600;color:var(--muted);
  transition:all .12s;text-align:left;
}
.settings-btn:hover{
  background:var(--surface2);border-color:var(--border2);color:var(--text);
}
.settings-btn.active{background:var(--accent-dim);border-color:var(--accent);color:var(--accent)}
.settings-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* ── Editor Area ─────────────────────────────────────────────────── */
.editor-area{flex:1;display:flex;flex-direction:row;overflow:hidden;background:var(--bg)}
.editor-main{display:flex;flex-direction:column;flex:1;overflow:hidden}

/* Tab bar */
.tab-bar{
  display:flex;align-items:stretch;
  background:var(--surface);border-bottom:1px solid var(--border);
  overflow-x:auto;flex-shrink:0;min-height:38px;
}
.tab-bar::-webkit-scrollbar{height:2px}
.editor-tab{
  display:flex;align-items:center;gap:5px;
  padding:0 10px;min-width:110px;max-width:170px;
  cursor:pointer;border-right:1px solid var(--border);
  font-size:11px;color:var(--muted);
  transition:background .1s,color .1s;
  border-bottom:2px solid transparent;flex-shrink:0;user-select:none;
}
.editor-tab:hover{background:var(--accent-dim);color:var(--text)}
.editor-tab.active{background:var(--bg);color:var(--text);border-bottom-color:var(--accent)}
.tab-node-id{
  font-family:var(--sans);font-weight:700;font-size:11px;color:inherit;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;
}
.tab-pin{
  display:flex;align-items:center;justify-content:center;
  opacity:.3;cursor:pointer;transition:opacity .15s;
  background:none;border:none;padding:3px;flex-shrink:0;line-height:0;border-radius:3px;
}
.tab-pin:hover{opacity:.8;background:rgba(255,255,255,.06)}
.tab-pin.active{opacity:1}
.tab-pin:focus-visible{outline:2px solid var(--accent)}
.tab-close{
  display:flex;align-items:center;justify-content:center;line-height:0;
  opacity:0;cursor:pointer;transition:opacity .1s;
  background:none;border:none;padding:3px;flex-shrink:0;border-radius:3px;
}
.editor-tab:hover .tab-close{opacity:.5}
.tab-close:hover{opacity:1!important;background:rgba(252,129,129,.12)}
.tab-close:focus-visible{opacity:1;outline:2px solid var(--danger)}
.tab-add{
  display:flex;align-items:center;justify-content:center;
  padding:0 12px;cursor:pointer;flex-shrink:0;line-height:0;
  border-radius:3px;margin:6px 4px;transition:background .12s;
}
.tab-add:hover{background:var(--accent-dim)}
.tab-bar-empty{
  flex:1;display:flex;align-items:center;padding:0 16px;
  font-size:12px;color:var(--muted2);font-style:italic;
}

/* Editor content */
.editor-content{flex:1;overflow-y:auto;padding:24px}
.editor-empty{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;color:var(--muted2);text-align:center;gap:12px;
}
.editor-empty-icon{font-size:40px;opacity:.25}
.editor-empty-text{font-family:var(--sans);font-size:13px;color:var(--muted)}
.editor-empty-hint{font-size:11px;color:var(--muted2)}


/* ── Node Editor ─────────────────────────────────────────────────── */
.node-header{
  display:flex;align-items:flex-start;justify-content:space-between;
  margin-bottom:16px;gap:12px;
}
.node-title-group{display:flex;flex-direction:column;gap:6px}
.node-identity{font-family:var(--sans);font-weight:700;font-size:18px;color:var(--text);line-height:1}
.node-display-name{font-size:15px;color:var(--muted);font-weight:400;margin-left:2px}
.node-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.node-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex-shrink:0}

.open-banner{
  display:flex;align-items:center;gap:8px;padding:6px 12px;margin-bottom:14px;
  background:rgba(240,180,41,.06);border:1px solid rgba(240,180,41,.2);
  border-radius:var(--r);color:var(--warn);font-size:11px;
}
/* ── PBS drop zone ───────────────────────────────────────────────── */
.pbs-drop-zone{position:relative;transition:outline .1s}
.pbs-drop-zone.drag-over{
  outline:2px dashed var(--accent);outline-offset:4px;border-radius:var(--r2);
}
.pbs-drop-hint{
  position:absolute;inset:0;z-index:10;
  display:flex;align-items:center;justify-content:center;
  background:rgba(13,15,18,.7);border-radius:var(--r2);
  font-size:13px;font-weight:600;color:var(--accent);
  pointer-events:none;
}
/* ── Link creation panel ─────────────────────────────────────────── */
.link-panel{
  display:flex;align-items:flex-end;flex-wrap:wrap;gap:8px;
  padding:10px 12px;margin-bottom:12px;
  background:rgba(106,172,255,.04);border:1px solid rgba(106,172,255,.18);
  border-radius:var(--r);
}
.violations-banner{
  padding:8px 12px;margin-bottom:12px;
  background:rgba(252,129,129,.06);border:1px solid rgba(252,129,129,.25);
  border-radius:var(--r);
}
.violations-banner-title{
  display:block;font-size:11px;font-weight:600;color:var(--danger);margin-bottom:4px;
}
.violations-banner-list{
  margin:0;padding-left:16px;list-style:disc;
}
.violations-banner-list li{
  font-size:11px;color:var(--danger);opacity:.9;line-height:1.6;
}

/* Sub-tabs */
.subtabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:18px}
.subtab{
  padding:8px 16px;cursor:pointer;font-size:12px;
  color:var(--muted);font-family:var(--sans);font-weight:600;
  border-bottom:2px solid transparent;transition:color .12s,border-color .12s;
}
.subtab:hover{color:var(--text)}
.subtab.active{color:var(--accent);border-bottom-color:var(--accent)}
.subtab:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.subtab-badge{
  display:inline-block;margin-left:5px;padding:1px 5px;
  border-radius:99px;font-size:9px;font-family:var(--sans);font-weight:700;
}

/* Attribute fields */
.attr-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.field{display:flex;flex-direction:column;gap:4px}
.field-label{
  font-size:10px;color:var(--muted);letter-spacing:.04em;
  display:flex;align-items:center;gap:3px;font-weight:500;
}
.field-req{color:var(--danger);font-weight:700}
.field-input{
  padding:8px 10px;background:var(--bg);border:1px solid var(--border2);
  border-radius:var(--r);color:var(--text);font-family:var(--mono);font-size:12px;
  transition:border-color .12s;outline:none;width:100%;
}
.field-input:focus{border-color:var(--accent)}
.field-input:focus-visible{border-color:var(--accent);outline:2px solid rgba(106,172,255,.3);outline-offset:0}
.field-input[readonly]{color:var(--muted);cursor:default;border-color:var(--border)}
.field-input.error{border-color:var(--danger)}
.field-input.ok{border-color:var(--success)}
select.field-input{cursor:pointer;appearance:none;-webkit-appearance:none}
.field-hint{font-size:11px;color:var(--muted);margin-top:1px}
.field-hint.error{color:var(--danger)}
.field-hint.warn{color:var(--warn)}

/* ── Logical-id pattern hint ─────────────────────────────────────── */
.logical-id-wrap{position:relative;display:flex;align-items:center}
.logical-id-wrap .field-input{padding-right:32px}
.logical-id-badge{
  position:absolute;right:8px;
  font-size:13px;font-weight:700;line-height:1;
  transition:color .15s;
}
.logical-id-badge.ok{color:var(--success)}
.logical-id-badge.err{color:var(--danger)}
.logical-id-hint{
  display:flex;align-items:center;flex-wrap:wrap;gap:6px;
  margin-top:4px;padding:5px 8px;
  background:rgba(255,255,255,.03);border:1px solid var(--border);
  border-radius:var(--r);
}
.logical-id-hint-label{
  font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:var(--muted2);flex-shrink:0;
}
.logical-id-hint-code{
  font-family:var(--mono);font-size:11px;color:var(--accent);
  background:rgba(106,172,255,.08);padding:1px 5px;border-radius:3px;
  word-break:break-all;
}
.logical-id-hint-idle{font-size:10px;color:var(--muted2);margin-left:auto}
.logical-id-hint-ok{font-size:10px;font-weight:600;color:var(--success);margin-left:auto}
.logical-id-hint-err{font-size:10px;font-weight:600;color:var(--danger);margin-left:auto}

.section-label{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--muted);
  padding-bottom:6px;border-bottom:1px solid var(--border);margin:16px 0 10px;
}
.section-label:first-child{margin-top:0}

/* History table */
.history-table{width:100%;border-collapse:collapse}
.history-table th{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--muted);
  padding:7px 10px;text-align:left;border-bottom:1px solid var(--border);
}
.history-table td{padding:7px 10px;border-bottom:1px solid var(--border);font-size:11px;vertical-align:middle}
.history-table tr:last-child td{border-bottom:none}
.history-table tr:hover td{background:rgba(255,255,255,.02)}
.history-table tr.pending-row td{background:rgba(232,169,71,.06);border-bottom:1px solid rgba(232,169,71,.18)}
.history-table tr.pending-row:hover td{background:rgba(232,169,71,.1)}
.history-table tr.historical-row td{background:rgba(251,191,36,.08);border-bottom:1px solid rgba(251,191,36,.25)}
.history-table tr.historical-row:hover td{background:rgba(251,191,36,.14)}
.pending-badge{
  display:inline-block;margin-left:6px;
  font-family:var(--sans);font-size:8px;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;padding:1px 5px;border-radius:3px;vertical-align:middle;
  background:rgba(232,169,71,.18);color:var(--warn);border:1px solid rgba(232,169,71,.35);
}
.ver-num{font-family:var(--sans);font-weight:800;font-size:13px;color:var(--accent)}
.hist-type-badge{
  font-family:var(--sans);font-size:9px;font-weight:700;letter-spacing:.05em;
  text-transform:uppercase;padding:2px 6px;border-radius:3px;
  background:rgba(106,172,255,.12);color:var(--accent);
}
.hist-type-badge[data-type="LIFECYCLE"]{background:rgba(77,212,160,.12);color:var(--success)}
.hist-type-badge[data-type="SIGNATURE"]{background:rgba(240,180,41,.12);color:var(--warn)}
.hist-comment{
  color:var(--muted);max-width:180px;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;
}
.hist-state{color:var(--muted);font-size:11px;white-space:nowrap}
.hist-by{color:var(--muted);font-size:11px}
.hist-date{color:var(--muted2);font-size:10px;white-space:nowrap}
.hist-fp{
  font-family:var(--mono);font-size:10px;
  cursor:help;letter-spacing:.03em;
}

/* Diff button in history table */
.btn-diff{
  font-family:var(--mono);font-size:10px;letter-spacing:.04em;
  padding:2px 7px;border-radius:3px;cursor:pointer;
  background:rgba(106,172,255,.08);color:var(--accent);
  border:1px solid rgba(106,172,255,.18);
  transition:background .15s,border-color .15s;white-space:nowrap;
}
.btn-diff:hover{background:rgba(106,172,255,.18);border-color:rgba(106,172,255,.35)}
.btn-diff:disabled{opacity:.4;cursor:default}

/* Diff modal overlay */
.diff-overlay{
  position:fixed;inset:0;z-index:500;
  background:rgba(0,0,0,.6);backdrop-filter:blur(3px);
  display:flex;align-items:center;justify-content:center;
}
.diff-modal{
  background:var(--surface);border:1px solid var(--border2);border-radius:var(--r2);
  width:min(760px,95vw);max-height:85vh;overflow:hidden;
  display:flex;flex-direction:column;
  box-shadow:0 24px 64px rgba(0,0,0,.5);
}
.diff-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 20px;border-bottom:1px solid var(--border);
  flex-shrink:0;
}
.diff-title{font-family:var(--sans);font-weight:700;font-size:14px;color:var(--text)}
.diff-close{
  background:none;border:none;cursor:pointer;
  color:var(--muted);font-size:16px;padding:2px 6px;border-radius:var(--r);
  transition:color .15s;
}
.diff-close:hover{color:var(--text)}
.diff-meta-row{
  display:flex;align-items:stretch;gap:0;
  border-bottom:1px solid var(--border);flex-shrink:0;
}
.diff-meta-cell{flex:1;padding:12px 20px}
.diff-meta-old{border-right:1px solid var(--border);background:rgba(252,129,129,.03)}
.diff-meta-new{background:rgba(77,212,160,.03)}
.diff-arrow{
  display:flex;align-items:center;padding:0 10px;
  color:var(--muted2);font-size:18px;flex-shrink:0;
}
.diff-meta-label{font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
.diff-meta-rev{font-family:var(--sans);font-weight:800;font-size:20px;color:var(--accent);margin-bottom:6px}
.diff-meta-sub{font-size:10px;color:var(--muted2);margin-top:6px}
.diff-state-change{
  padding:8px 20px;font-size:11px;
  background:rgba(240,180,41,.05);border-bottom:1px solid rgba(240,180,41,.15);
  flex-shrink:0;display:flex;align-items:center;gap:6px;
}
.diff-no-changes{
  padding:32px 20px;text-align:center;color:var(--muted);font-size:12px;
}
.diff-body{overflow-y:auto;flex:1;padding:0}
.diff-attr-section{padding:0}
.diff-section-title{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.07em;
  text-transform:uppercase;color:var(--muted);
  padding:10px 20px 6px;
}
.diff-empty-section{padding:0 20px 12px;color:var(--muted2);font-size:11px}
.diff-table{width:100%;border-collapse:collapse}
.diff-table th{
  font-family:var(--sans);font-size:9px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--muted);
  padding:5px 12px;text-align:left;border-bottom:1px solid var(--border);
}
.diff-table td{padding:7px 12px;border-bottom:1px solid var(--border);font-size:11px;vertical-align:top}
.diff-table tr:last-child td{border-bottom:none}
.diff-attr-name{color:var(--muted);width:150px;min-width:100px;white-space:nowrap}
.diff-old-col{background:rgba(252,129,129,.04)}
.diff-new-col{background:rgba(77,212,160,.04)}
.diff-val-old{color:var(--danger);background:rgba(252,129,129,.06)}
.diff-val-new{color:var(--success);background:rgba(77,212,160,.06)}
.diff-row-unchanged td{opacity:.55}
.diff-empty{opacity:.4}
.diff-unchanged-details{border-top:1px solid var(--border);padding:0}
.diff-unchanged-details summary{padding:10px 20px 6px;list-style:none}
.diff-unchanged-details summary::-webkit-details-marker{display:none}
.diff-unchanged-details[open] summary{border-bottom:1px solid var(--border)}
/* Link diff */
.diff-link-entry{border-top:1px solid var(--border)}
.diff-link-entry:first-of-type{border-top:none}
.diff-link-summary{
  list-style:none;cursor:pointer;
  padding:7px 20px;display:flex;align-items:center;gap:0;font-size:12px;
  user-select:none;
}
.diff-link-summary::-webkit-details-marker{display:none}
.diff-link-summary:hover{background:rgba(255,255,255,.03)}
.diff-link-detail{
  padding:6px 20px 10px 36px;border-top:1px solid var(--border);
  background:rgba(0,0,0,.12);
}
.diff-link-detail-row{
  display:flex;align-items:baseline;gap:12px;
  padding:3px 0;font-size:11px;
}
.diff-link-unch-row{
  display:flex;align-items:center;
  padding:4px 20px;font-size:11px;color:var(--muted2);
  border-top:1px solid var(--border);
}
.diff-link-unch-row:first-child{border-top:none}
.diff-fp-row{
  display:flex;align-items:center;gap:4px;
  padding:8px 20px;border-top:1px solid var(--border);
  font-family:var(--mono);font-size:10px;flex-shrink:0;
}
.diff-fp-label{color:var(--muted);margin-right:8px;font-family:var(--sans);font-size:9px;letter-spacing:.05em;text-transform:uppercase}
.diff-fp-val{letter-spacing:.03em}

/* Signatures */
.sig-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)}
.sig-item:last-child{border-bottom:none}
.sig-meaning{font-family:var(--sans);font-weight:700;font-size:11px;color:var(--success)}
.sig-by{flex:1;font-size:11px;color:var(--muted)}
.sig-comment{font-size:11px;color:var(--muted2);font-style:italic}
.sign-panel{
  display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;
  padding:10px 14px;margin-bottom:14px;
  background:rgba(77,212,160,.05);border:1px solid rgba(77,212,160,.15);border-radius:var(--r);
}

/* History + lifecycle merged tab */
.history-lc-section{padding-bottom:4px}
.history-lc-label{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.07em;
  text-transform:uppercase;color:var(--muted);margin-bottom:8px;
  display:flex;align-items:center;gap:8px;
}
.history-lc-divider{
  display:flex;align-items:center;gap:10px;
  margin:16px 0 12px;color:var(--muted);font-size:10px;
  font-family:var(--sans);font-weight:700;letter-spacing:.07em;text-transform:uppercase;
}
.history-lc-divider::before,.history-lc-divider::after{
  content:'';flex:1;height:1px;background:var(--border);
}

/* Lifecycle diagram */
.lc-diagram{overflow-x:auto;padding:8px 0;display:flex;justify-content:center}
.lc-diagram svg{display:block}
.lc-empty{padding:24px;color:var(--muted2);font-size:12px;font-style:italic}

/* ── Settings Page ───────────────────────────────────────────────── */
.settings-page{display:flex;flex:1;overflow:hidden;background:var(--bg)}
.settings-sidenav{
  width:200px;flex-shrink:0;background:var(--surface);
  border-right:1px solid var(--border);display:flex;flex-direction:column;padding:16px 0;
}
.settings-sidenav-title{
  display:flex;align-items:center;gap:8px;padding:0 14px 14px;
  font-family:var(--sans);font-size:11px;font-weight:700;color:var(--text);
  letter-spacing:.04em;border-bottom:1px solid var(--border);margin-bottom:8px;
}
.settings-sidenav-items{display:flex;flex-direction:column;gap:1px;padding:4px 6px}
.settings-nav-item{
  display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;
  border-radius:var(--r);font-family:var(--sans);font-size:12px;font-weight:600;
  color:var(--muted);transition:all .12s;
}
.settings-nav-item:hover{background:var(--surface2);color:var(--text)}
.settings-nav-item.active{background:var(--accent-dim);color:var(--accent)}
.settings-nav-item:focus-visible{outline:2px solid var(--accent)}

.settings-content{display:flex;flex-direction:column;flex:1;overflow:hidden}
.settings-content-hd{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 20px;border-bottom:1px solid var(--border);flex-shrink:0;
}
.settings-content-title{
  font-family:var(--sans);font-weight:800;font-size:16px;color:var(--text);
}
.settings-content-body{flex:1;overflow-y:auto;padding:16px 20px}
.settings-loading{padding:24px;color:var(--muted2);font-style:italic;font-size:12px}
.settings-list{display:flex;flex-direction:column;gap:8px}
.settings-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);overflow:hidden;
}
.settings-card--flat{
  display:flex;align-items:center;gap:10px;padding:10px 14px;
}
.settings-card-hd{
  display:flex;align-items:center;gap:8px;padding:10px 14px;cursor:pointer;
  transition:background .1s;
}
.settings-card-hd:hover{background:rgba(255,255,255,.02)}
.settings-card-chevron{display:flex;align-items:center;flex-shrink:0}
.settings-card-name{font-family:var(--sans);font-weight:700;font-size:12px;color:var(--text);flex:1}
.settings-card-id{font-family:var(--mono);font-size:10px;color:var(--muted2)}
.settings-card-body{padding:0 14px 14px;border-top:1px solid var(--border)}
.settings-sub-label{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--muted);margin:12px 0 6px;
}
.settings-lc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.settings-state-row{display:flex;align-items:center;gap:6px;padding:3px 0}
.settings-state-name{font-size:12px;color:var(--muted);flex:1}
.settings-transition-row{display:flex;align-items:center;justify-content:space-between;padding:3px 0}
.settings-tx-arrow{font-family:var(--mono);font-size:11px;color:var(--muted)}
.settings-empty-row{font-size:11px;color:var(--muted2);font-style:italic;padding:8px 0}
.settings-add-link-form{margin-top:8px;background:rgba(255,255,255,.03);border:1px solid var(--border2);border-radius:var(--r);padding:10px 12px;display:flex;flex-direction:column;gap:8px}
.settings-add-link-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.settings-add-link-row .field-input{font-size:11px;padding:4px 8px;height:28px}
.settings-add-link-actions{display:flex;justify-content:flex-end;gap:6px}
.settings-form-error{font-size:11px;color:var(--danger);background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:3px;padding:5px 9px}
.settings-badge{
  font-family:var(--sans);font-size:10px;font-weight:700;padding:2px 7px;
  border-radius:3px;background:rgba(255,255,255,.07);color:var(--muted);
  white-space:nowrap;
}
.settings-badge--warn{background:rgba(240,180,41,.12);color:var(--warn)}
.settings-table{width:100%;border-collapse:collapse;margin-top:4px}
.settings-table th{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--muted);padding:6px 10px;text-align:left;
  border-bottom:1px solid var(--border);
}
.settings-table td{padding:6px 10px;border-bottom:1px solid var(--border);font-size:11px;vertical-align:middle}
.settings-table tr:last-child td{border-bottom:none}
.settings-table tr:hover td{background:rgba(255,255,255,.02)}
.settings-td-mono{font-family:var(--mono);color:var(--accent)}

/* ── Shared Components ───────────────────────────────────────────── */

/* State pill */
.pill{
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 9px;border-radius:99px;
  font-size:11px;font-family:var(--sans);font-weight:600;
}
.pill-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}

/* Buttons */
.btn{
  display:inline-flex;align-items:center;gap:5px;
  padding:6px 12px;border-radius:var(--r);
  font-family:var(--mono);font-size:12px;line-height:1.2;
  border:1px solid var(--border2);cursor:pointer;
  transition:all .12s;background:var(--surface);color:var(--text);
  white-space:nowrap;min-height:30px;
}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.btn-primary{background:var(--accent);color:#05070a;border-color:var(--accent);font-weight:700}
.btn-primary:hover{background:var(--accent-hover);border-color:var(--accent-hover);color:#05070a}
.btn-success{border-color:rgba(77,212,160,.5);color:var(--success)}
.btn-success:hover{background:rgba(77,212,160,.1);border-color:var(--success)}
.btn-danger{border-color:rgba(252,129,129,.5);color:var(--danger)}
.btn-danger:hover{background:rgba(252,129,129,.1);border-color:var(--danger)}
.btn-warn{border-color:rgba(240,180,41,.5);color:var(--warn)}
.btn-warn:hover{background:rgba(240,180,41,.1);border-color:var(--warn)}
.btn-sm{padding:4px 9px;font-size:11px;min-height:26px}
.btn-xs{padding:2px 7px;font-size:10px;min-height:22px}
.btn:disabled{opacity:.4;cursor:not-allowed;pointer-events:none}

/* Card */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);overflow:hidden}
.card-hd{
  padding:12px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
}
.card-title{font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.card-body{padding:16px}

/* Overlay / modal */
.overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.8);
  display:flex;align-items:center;justify-content:center;z-index:2000;
  backdrop-filter:blur(3px);
}

/* Toasts */
.toasts{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:400}
.toast{
  padding:9px 14px;border-radius:var(--r);background:var(--surface);
  border:1px solid var(--border2);font-size:12px;min-width:240px;
  animation:toastIn .18s ease;display:flex;align-items:center;gap:8px;
  box-shadow:0 4px 24px rgba(0,0,0,.5);color:var(--text);
}
.toast-info{border-left:3px solid var(--accent)}
.toast-success{border-left:3px solid var(--success)}
.toast-error{border-left:3px solid var(--danger)}
.toast-warn{border-left:3px solid var(--warn)}
@keyframes toastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}

/* Error detail */
.err-card-func{width:460px;max-width:95vw}
.err-card-tech{width:740px;max-width:95vw;max-height:88vh;display:flex;flex-direction:column;overflow:hidden}
.err-body{display:flex;flex-direction:column;gap:10px;min-height:0;flex:1;overflow:hidden}
.err-message{font-weight:700;font-size:13px;color:var(--text);word-break:break-word;line-height:1.4}
.err-meta{font-size:11px;color:var(--muted)}
.stack-trace{
  background:#050709;border:1px solid var(--border2);border-radius:4px;
  padding:12px;font-family:var(--mono);font-size:10px;color:#7b96b2;
  overflow:auto;flex:1;white-space:pre;line-height:1.7;min-height:80px;
}
.violations-list{margin:4px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px}
.violation-item{
  font-size:12px;color:var(--danger);padding:4px 8px;
  background:rgba(252,129,129,.07);border-left:2px solid var(--danger);border-radius:2px;
}

/* Modals */
.commit-modal{width:500px;max-width:95vw}
.create-node-modal{width:480px;max-width:95vw;max-height:85vh;display:flex;flex-direction:column}
.modal-scroll{flex:1;overflow-y:auto;padding:16px}
.modal-identity-sep{display:flex;align-items:center;gap:8px;margin:12px 0 8px;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted2)}
.modal-identity-sep::before,.modal-identity-sep::after{content:'';flex:1;height:1px;background:var(--border2)}

/* Misc */
.row{display:flex;align-items:center;gap:8px}
.empty{text-align:center;padding:32px 16px}
.empty-icon{font-size:24px;margin-bottom:6px;opacity:.3;color:var(--muted)}
.empty-text{font-size:12px;color:var(--muted)}
.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}
.flex-end{justify-content:flex-end}

/* ── API Playground ──────────────────────────────────────────────── */

/* Shell: flex column filling the settings-content area */
.pg-shell{
  display:flex;flex-direction:column;flex:1;overflow:hidden;min-height:0;
}

/* Top bar */
.pg-topbar{
  display:flex;align-items:center;gap:10px;padding:9px 16px;
  background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0;
}
.pg-topbar-title{font-family:var(--sans);font-weight:800;font-size:13px;color:var(--text)}
.pg-topbar-ver{
  font-family:var(--mono);font-size:10px;color:var(--accent);
  background:var(--accent-dim);padding:2px 7px;border-radius:99px;
}
.pg-topbar-meta{font-size:10px;color:var(--muted2)}
.pg-topbar-user{font-size:10px;color:var(--muted2);margin-left:auto}
.pg-topbar-user strong{color:var(--muted)}
.pg-topbar-refresh{}

/* Filter bar */
.pg-filter{
  display:flex;align-items:center;gap:8px;
  padding:8px 16px;border-bottom:1px solid var(--border);flex-shrink:0;
}
.pg-filter-input{
  flex:1;background:var(--bg);border:1px solid var(--border2);border-radius:var(--r);
  color:var(--text);font-family:var(--mono);font-size:12px;padding:6px 10px;
  outline:none;transition:border-color .15s;
}
.pg-filter-input:focus{border-color:var(--accent)}
.pg-filter-input::placeholder{color:var(--muted2)}

/* Scrollable endpoint list */
.pg-list{flex:1;overflow-y:auto;min-height:0}

/* Tag group */
.pg-group{border-bottom:1px solid var(--border)}
.pg-group-hd{
  display:flex;align-items:center;gap:8px;
  padding:8px 16px;cursor:pointer;user-select:none;
  background:var(--surface);border-bottom:1px solid var(--border);
  transition:background .1s;position:sticky;top:0;z-index:1;
}
.pg-group-hd:hover{background:var(--surface2)}
.pg-group-name{
  font-family:var(--sans);font-weight:700;font-size:11px;
  letter-spacing:.06em;text-transform:uppercase;color:var(--muted);flex:1;
}
.pg-group-count{
  font-family:var(--sans);font-size:10px;font-weight:700;color:var(--muted2);
}
.pg-chevron{display:flex;align-items:center;width:14px;flex-shrink:0}

/* Endpoint row */
.pg-row{border-bottom:1px solid var(--border)}
.pg-row:last-child{border-bottom:none}
.pg-row-hd{
  display:flex;align-items:center;gap:10px;
  padding:8px 16px 8px 32px;cursor:pointer;
  transition:background .1s;min-height:38px;
}
.pg-row-hd:hover{background:rgba(255,255,255,.02)}
.pg-row--open .pg-row-hd{background:rgba(106,172,255,.05)}
.pg-path{
  font-family:var(--mono);font-size:12px;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0;max-width:340px;
}
.pg-summary{
  font-size:11px;color:var(--muted2);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;
}

/* Expanded body */
.pg-row-body{
  padding:16px 20px 20px 32px;
  background:rgba(0,0,0,.18);border-top:1px solid var(--border);
  display:flex;flex-direction:column;gap:16px;
}

/* Section within body */
.pg-section{display:flex;flex-direction:column;gap:8px}
.pg-section-label{
  font-family:var(--sans);font-size:10px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
  display:flex;align-items:center;gap:8px;
}
.pg-section-sub{
  font-size:10px;color:var(--muted2);font-weight:400;
  letter-spacing:0;text-transform:none;
}

/* PLM header grid */
.pg-header-grid{display:flex;flex-direction:column;gap:6px}
.pg-header-row{display:flex;align-items:center;gap:10px}
.pg-header-name{
  font-family:var(--mono);font-size:11px;color:var(--muted);
  width:190px;flex-shrink:0;
}
.pg-header-input{max-width:260px}

/* Params grid */
.pg-params-grid{display:flex;flex-direction:column;gap:10px}
.pg-param{display:flex;flex-direction:column;gap:4px}
.pg-param-hd{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.pg-param-name{font-family:var(--mono);font-size:11px;color:var(--accent)}
.pg-param-in{
  font-family:var(--sans);font-size:9px;font-weight:700;letter-spacing:.05em;
  text-transform:uppercase;color:var(--muted2);background:rgba(255,255,255,.06);
  padding:1px 5px;border-radius:3px;
}
.pg-param-req{
  font-family:var(--sans);font-size:9px;font-weight:700;letter-spacing:.05em;
  text-transform:uppercase;color:var(--danger);background:rgba(252,129,129,.1);
  padding:1px 5px;border-radius:3px;
}
.pg-param-desc{font-size:10px;color:var(--muted2)}
.pg-input{
  background:var(--bg);border:1px solid var(--border2);border-radius:var(--r);
  color:var(--text);font-family:var(--mono);font-size:11px;padding:5px 9px;
  outline:none;transition:border-color .15s;max-width:480px;
}
.pg-input:focus{border-color:var(--accent)}
.pg-input::placeholder{color:var(--muted2)}

/* ── Tx release button & confirmation ───────────────────────────── */
.tx-item{position:relative}
.tx-release-btn{
  display:none;flex-shrink:0;
  background:none;border:none;cursor:pointer;
  padding:2px;border-radius:3px;
  opacity:.6;transition:opacity .15s;
  margin-left:auto;
}
.tx-item:hover .tx-release-btn{display:flex}
.tx-release-btn:hover{opacity:1}

.tx-item-confirm{
  display:flex;align-items:center;gap:6px;
  padding:5px 8px;cursor:default;
  background:rgba(252,129,129,.07);
}
.tx-confirm-msg{
  font-size:11px;color:var(--muted);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.btn-xs{
  font-size:10px;padding:2px 7px;line-height:1.4;
  border-radius:3px;border:1px solid var(--border2);
  background:var(--surface2);color:var(--text);cursor:pointer;
}
.btn-xs:hover{border-color:var(--muted2)}
.btn-danger.btn-xs{
  background:rgba(252,129,129,.12);border-color:rgba(252,129,129,.3);color:var(--danger);
}
.btn-danger.btn-xs:hover{background:rgba(252,129,129,.22)}

/* ── Commit modal node list ─────────────────────────────────────── */
.commit-node-list{
  border:1px solid var(--border2);border-radius:var(--r);
  overflow:hidden;margin-bottom:14px;
  max-height:240px;display:flex;flex-direction:column;
}
.commit-node-list-scroll{overflow-y:auto;flex:1}
.commit-node-list-hd{
  padding:6px 10px;background:rgba(255,255,255,.03);
  border-bottom:1px solid var(--border2);
}
.commit-node-all{
  display:flex;align-items:center;gap:7px;cursor:pointer;
  font-size:11px;color:var(--muted);
}
.commit-node-all input{cursor:pointer;accent-color:var(--accent)}
.commit-node-count{
  margin-left:auto;font-size:10px;color:var(--muted2);
  background:rgba(255,255,255,.06);padding:1px 6px;border-radius:10px;
}
.commit-node-item{
  display:flex;align-items:center;gap:6px;
  padding:5px 10px;cursor:pointer;
  border-bottom:1px solid var(--border);
  font-size:11px;
  transition:background .1s;
}
.commit-node-item:last-child{border-bottom:none}
.commit-node-item:hover{background:rgba(255,255,255,.04)}
.commit-node-item input{cursor:pointer;accent-color:var(--accent);flex-shrink:0}
.commit-node-dot{
  width:6px;height:6px;border-radius:50%;flex-shrink:0;
}
.commit-node-lid{color:var(--text);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.commit-node-rev{color:var(--muted2);font-size:10px;flex-shrink:0}
.commit-node-type{color:var(--muted2);font-size:10px;flex-shrink:0;max-width:80px;overflow:hidden;text-overflow:ellipsis}
.commit-node-badge{
  font-size:9px;padding:1px 5px;border-radius:3px;flex-shrink:0;
  font-family:var(--sans);font-weight:700;letter-spacing:.05em;text-transform:uppercase;
}

/* Body editor */
.pg-body-editor{
  width:100%;max-width:600px;
  background:var(--bg);border:1px solid var(--border2);border-radius:var(--r);
  color:#7fb4d4;font-family:var(--mono);font-size:11px;line-height:1.65;
  padding:9px 11px;resize:vertical;outline:none;transition:border-color .15s;
}
.pg-body-editor:focus{border-color:var(--accent)}

/* Execute bar */
.pg-exec-bar{display:flex;align-items:center;gap:10px}
.pg-exec-meta{font-size:11px;color:var(--muted2)}
.pg-exec-meta strong{color:var(--muted);font-weight:600}

/* Response */
.pg-response{
  border:1px solid var(--border2);border-radius:var(--r);overflow:hidden;
  max-width:700px;
}
.pg-response-hd{
  display:flex;align-items:center;gap:8px;
  padding:7px 12px;background:rgba(255,255,255,.03);border-bottom:1px solid var(--border2);
}
.pg-status{
  font-family:var(--sans);font-size:11px;font-weight:800;
  padding:2px 8px;border-radius:3px;
}
.pg-response-label{font-size:11px;color:var(--muted)}
.pg-response-body{
  font-family:var(--mono);font-size:11px;line-height:1.65;color:#7fb4d4;
  padding:12px 14px;max-height:300px;overflow:auto;white-space:pre;
  background:#060810;
}

/* ── Dashboard ──────────────────────────────────────────────────────── */
.dashboard{display:flex;flex-direction:column;height:100%;overflow:hidden;background:var(--bg)}

.dash-hero{
  display:flex;align-items:center;gap:14px;
  padding:20px 28px 16px;flex-shrink:0;
  border-bottom:1px solid var(--border);
}
.dash-hero-icon{font-size:24px;opacity:.35;line-height:1}
.dash-hero-title{
  font-family:var(--sans);font-size:16px;font-weight:700;
  color:var(--text);
}
.dash-hero-sub{font-size:11px;color:var(--muted2);margin-top:2px}

.dash-body{
  flex:1;overflow-y:auto;padding:20px 28px;
  display:flex;flex-direction:column;gap:24px;
}

/* ── Sections ── */
.dash-section{display:flex;flex-direction:column;gap:10px}

.dash-section-hd{
  display:flex;align-items:center;gap:10px;
}
.dash-section-title{
  font-family:var(--sans);font-size:11px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
}
.dash-section-hint{
  font-size:10px;color:var(--muted2);
}
.dash-refresh-btn{
  margin-left:auto;background:none;border:none;cursor:pointer;
  color:var(--muted2);font-size:13px;padding:2px 5px;border-radius:3px;
  line-height:1;transition:color .15s,background .15s;
}
.dash-refresh-btn:hover:not(:disabled){color:var(--accent);background:var(--accent-dim)}
.dash-refresh-btn:disabled{opacity:.4;cursor:default}

.dash-loading{font-size:11px;color:var(--muted2);padding:12px 0}
.dash-error{font-size:11px;color:var(--danger);padding:12px 0}
.dash-empty{font-size:11px;color:var(--muted2);font-style:italic;padding:12px 0}

/* ── TX card ── */
.dash-tx-card{
  border:1px solid var(--border2);border-radius:var(--r2);
  overflow:hidden;
}
.dash-tx-header{
  display:flex;align-items:center;gap:10px;
  padding:8px 14px;background:rgba(255,255,255,.02);
  border-bottom:1px solid var(--border);
}
.dash-tx-id{
  font-family:var(--mono);font-size:10px;color:var(--muted2);
  background:rgba(255,255,255,.05);padding:1px 6px;border-radius:3px;flex-shrink:0;
}
.dash-tx-title{font-size:12px;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dash-tx-count{font-size:10px;color:var(--muted2);flex-shrink:0}

.dash-tx-nodes{display:flex;flex-direction:column}

.dash-tx-node{
  display:flex;align-items:center;gap:8px;
  padding:6px 14px;
  background:none;border:none;border-bottom:1px solid var(--border);
  text-align:left;cursor:pointer;
  transition:background .1s;width:100%;
}
.dash-tx-node:last-child{border-bottom:none}
.dash-tx-node:hover{background:rgba(255,255,255,.04)}

/* ── Work items ── */
.dash-work-list{display:flex;flex-direction:column;gap:6px}

.dash-work-item{
  display:flex;flex-direction:column;gap:6px;
  padding:10px 14px;
  background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);
  text-align:left;cursor:pointer;
  transition:background .1s,border-color .1s;width:100%;
}
.dash-work-item:hover{background:var(--surface2);border-color:var(--accent)}

.dash-work-row{display:flex;align-items:center;gap:8px}

.dash-action-chips{display:flex;flex-wrap:wrap;gap:4px}
.dash-action-chip{
  font-size:9px;padding:1px 6px;border-radius:3px;
  font-family:var(--sans);font-weight:700;letter-spacing:.05em;text-transform:uppercase;
  background:rgba(255,255,255,.06);
}

/* ── Shared atoms ── */
.dash-state-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.dash-rev{
  font-family:var(--mono);font-size:10px;color:var(--muted2);
  background:rgba(255,255,255,.05);padding:1px 5px;border-radius:3px;flex-shrink:0;
}
.dash-node-lid{
  font-family:var(--mono);font-size:12px;color:var(--text);
  flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.dash-type-chip{
  display:inline-flex;align-items:center;gap:4px;
  font-size:10px;color:var(--muted2);flex-shrink:0;
}
.dash-badge{
  font-size:9px;padding:1px 5px;border-radius:3px;flex-shrink:0;
  font-family:var(--sans);font-weight:700;letter-spacing:.05em;text-transform:uppercase;
}

/* ── Dashboard button in left panel ── */
.panel-dash-btn{
  display:flex;align-items:center;gap:7px;
  margin:8px 10px 4px;padding:6px 10px;
  background:var(--accent-dim);border:1px solid rgba(106,172,255,.2);
  border-radius:var(--r);cursor:pointer;
  font-family:var(--sans);font-size:11px;font-weight:600;color:var(--accent);
  transition:background .15s,border-color .15s;
}
.panel-dash-btn:hover{background:rgba(106,172,255,.18);border-color:rgba(106,172,255,.35)}

/* ── Comment panel ───────────────────────────────────────────────── */
.tab-comments-toggle{
  margin-left:auto;flex-shrink:0;
  padding:0 10px;height:100%;
  background:transparent;border:none;border-left:1px solid var(--border);
  cursor:pointer;font-size:15px;opacity:.6;
  transition:opacity .15s,color .15s;color:var(--muted);
}
.tab-comments-toggle:hover{opacity:1;color:var(--accent)}
.tab-comments-toggle.active{opacity:1;color:var(--accent);background:var(--accent-dim)}

.comment-resize{cursor:col-resize}

.comment-panel{
  flex-shrink:0;display:flex;flex-direction:column;
  background:var(--surface);border-left:1px solid var(--border);
  overflow:hidden;
}
.comment-panel-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 14px;font-family:var(--sans);font-weight:600;font-size:12px;
  border-bottom:1px solid var(--border);flex-shrink:0;
  text-transform:uppercase;letter-spacing:.05em;color:var(--muted);
}
.comment-count-badge{
  display:inline-block;margin-left:6px;padding:1px 6px;
  background:rgba(106,172,255,.15);color:var(--accent);
  border-radius:10px;font-size:10px;font-family:var(--sans);
}
.comment-close-btn{
  background:transparent;border:none;cursor:pointer;
  color:var(--muted);font-size:13px;padding:2px 4px;border-radius:3px;
}
.comment-close-btn:hover{color:var(--text)}

.comment-panel-list{flex:1;overflow-y:auto;padding:10px 12px}
.comment-panel-input{flex-shrink:0;padding:10px 12px;border-top:1px solid var(--border)}

.comment-version-context{
  font-size:10px;color:var(--muted);margin-bottom:6px;
  font-family:var(--sans);
}
.comment-reply-context{
  display:flex;align-items:center;justify-content:space-between;
  font-size:11px;color:var(--muted);padding:4px 8px 6px;
  background:var(--accent-dim);border-radius:4px;margin-bottom:6px;
  font-family:var(--sans);
}
.comment-cancel-reply{
  background:transparent;border:none;cursor:pointer;
  color:var(--muted);font-size:11px;padding:0 2px;
}
.comment-cancel-reply:hover{color:var(--text)}
.comment-textarea{width:100%;resize:vertical;box-sizing:border-box}
.comment-post-btn{margin-top:6px;width:100%}

.comment-empty{font-size:12px;color:var(--muted);font-style:italic;padding:8px 0}

.comment-thread{
  margin-bottom:10px;padding-bottom:10px;
  border-bottom:1px solid var(--border);
}
.comment-thread:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.comment-thread-active>.comment-item{border-color:rgba(106,172,255,.3)}

.comment-replies{margin-top:6px;margin-left:14px;border-left:2px solid var(--border2);padding-left:10px}

.comment-item{
  padding:8px 10px;border-radius:6px;
  background:var(--bg);border:1px solid transparent;
  transition:border-color .15s;
}
.comment-reply{background:transparent;border-left:none}
.comment-meta{
  display:flex;gap:6px;align-items:baseline;flex-wrap:wrap;
  margin-bottom:5px;
}
.comment-author{font-family:var(--sans);font-weight:600;font-size:12px;color:var(--text)}
.comment-attr-badge{
  font-size:10px;background:rgba(91,156,246,.15);
  color:var(--accent);padding:1px 5px;border-radius:3px;
  font-family:var(--sans);
}
.comment-version{font-size:10px;color:var(--muted2);font-family:var(--sans)}
.comment-time{font-size:10px;color:var(--muted2);margin-left:auto;font-family:var(--sans)}
.comment-text{font-size:13px;white-space:pre-wrap;line-height:1.55;color:var(--text)}
.comment-reply-btn{
  background:none;border:none;font-size:11px;color:var(--muted);
  cursor:pointer;padding:3px 0;margin-top:4px;font-family:var(--sans);
}
.comment-reply-btn:hover{color:var(--accent)}

.comment-filter-banner{
  display:flex;align-items:center;justify-content:space-between;
  padding:6px 12px;font-size:11px;font-family:var(--sans);
  background:var(--accent-dim);border-bottom:1px solid rgba(106,172,255,.2);
  flex-shrink:0;color:var(--accent);
}
.comment-filter-clear{
  background:transparent;border:none;cursor:pointer;
  font-size:11px;color:var(--accent);text-decoration:underline;font-family:var(--sans);
  padding:0;
}
.comment-filter-clear:hover{color:var(--text)}
.comment-children{padding-left:6px;margin-top:2px}
.comment-highlighted{border-color:rgba(106,172,255,.4) !important}

/* ── Attribute context menu ── */
.attr-ctx-menu{
  position:fixed;z-index:9000;
  background:var(--bg2);border:1px solid var(--border2);
  border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.25);
  padding:4px;min-width:200px;
}
.attr-ctx-item{
  display:block;width:100%;text-align:left;
  background:none;border:none;padding:7px 10px;border-radius:4px;
  font-size:13px;color:var(--text);cursor:pointer;font-family:var(--sans);
}
.attr-ctx-item:hover{background:var(--bg3)}
.attr-ctx-item code{
  font-family:var(--mono);font-size:11px;
  color:var(--accent);background:rgba(91,156,246,.12);
  padding:1px 4px;border-radius:3px;
}

/* ── Autocomplete dropdown ── */
.comment-input-wrap{position:relative}
.autocomplete-dropdown{
  position:absolute;bottom:calc(100% + 4px);left:0;right:0;
  background:var(--bg2);border:1px solid var(--border2);
  border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.25);
  list-style:none;margin:0;padding:4px;z-index:200;
  max-height:200px;overflow-y:auto;
}
.autocomplete-item{
  display:flex;align-items:baseline;gap:8px;
  padding:6px 8px;border-radius:4px;cursor:pointer;
}
.autocomplete-item.active,.autocomplete-item:hover{background:var(--accent-dim)}
.autocomplete-item-id{
  font-family:var(--mono);font-size:12px;font-weight:600;color:var(--accent);
}
.autocomplete-item-label{font-size:12px;color:var(--muted);font-family:var(--sans)}

/* ── Mention chips in rendered text ── */
.mention-chip{
  display:inline-block;border-radius:3px;
  padding:0 4px;font-size:12px;font-weight:600;
  font-family:var(--mono);line-height:1.6;
}
.mention-attr{color:var(--accent);background:rgba(91,156,246,.14)}
.mention-user{color:#a78bfa;background:rgba(167,139,250,.14)}
.comment-own{
  background:rgba(91,156,246,.06);
  border-color:rgba(91,156,246,.25);
  border-left:3px solid var(--accent);
  padding-left:8px;
}
.comment-author-own{color:var(--accent)}
.comment-you-badge{
  display:inline-block;margin-left:5px;
  font-size:9px;font-weight:700;letter-spacing:.03em;
  background:rgba(91,156,246,.18);color:var(--accent);
  padding:1px 4px;border-radius:3px;vertical-align:middle;
  text-transform:uppercase;
}
`;

export default css;
