import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const STATE_COLOR_FALLBACK = '#5b9cf6';
function stateColor(s) { return s?.color || s?.COLOR || STATE_COLOR_FALLBACK; }

const BOX_W      = 110;
const BOX_H      = 36;
const H_GAP      = 72;
const SVG_PAD    = 28;
// Minimum arc height for span-1 transitions; each extra step adds CURVE_STEP
const BASE_CURVE = 46;
const CURVE_STEP = 32;
// Corner radius for the square bends
const R          = 10;
// Transition button pill
const BTN_H      = 16;
const BTN_RX     = 8;
// Gap between rail end and chip edge
const CHIP_GAP   = 4;

export default function LifecycleDiagram({
  lifecycleId,
  currentStateId,
  userId,
  onTransition,               // optional: (transition) => void
  availableTransitionNames,   // optional: Set<string> — names in the actions list (all unblocked + blocked)
  transitionGuardViolations,  // optional: Map<transitionName, string[]> — non-empty = blocked
  previewMode,                // show all states colored, no interaction
}) {
  const [states, setStates]           = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [hoveredIdx, setHoveredIdx]   = useState(null);

  useEffect(() => {
    if (!lifecycleId || !userId) return;
    setLoading(true);
    Promise.all([
      api.getLifecycleStates(userId, lifecycleId).catch(() => []),
      api.getLifecycleTransitions(userId, lifecycleId).catch(() => []),
    ]).then(([s, t]) => {
      setStates(Array.isArray(s) ? s : []);
      setTransitions(Array.isArray(t) ? t : []);
    }).finally(() => setLoading(false));
  }, [lifecycleId, userId]);

  if (loading)        return <div className="lc-empty">Loading diagram…</div>;
  if (!lifecycleId)   return <div className="lc-empty">No lifecycle associated with this object type.</div>;
  if (!states.length) return <div className="lc-empty">No lifecycle states defined.</div>;

  const sorted = [...states].sort((a, b) =>
    (a.display_order ?? a.DISPLAY_ORDER ?? 0) - (b.display_order ?? b.DISPLAY_ORDER ?? 0)
  );

  const indexMap = {};
  sorted.forEach((s, i) => { indexMap[s.id || s.ID] = i; });

  // Center-x per state
  const stateX = {};
  sorted.forEach((s, i) => {
    stateX[s.id || s.ID] = SVG_PAD + i * (BOX_W + H_GAP) + BOX_W / 2;
  });

  // Enrich transitions
  const enriched = transitions.map((t, i) => {
    const fromId  = t.from_state_id || t.FROM_STATE_ID;
    const toId    = t.to_state_id   || t.TO_STATE_ID;
    const fromIdx = indexMap[fromId] ?? 0;
    const toIdx   = indexMap[toId]   ?? 0;
    const span    = toIdx - fromIdx;
    return { ...t, fromId, toId, fromIdx, toIdx, span, i };
  }).filter(t => stateX[t.fromId] && stateX[t.toId] && t.span !== 0);

  // ── Connection-point spreading ──────────────────────────────────
  // When multiple transitions share the same state edge, spread their
  // attachment x-points to avoid overlapping rails.
  //
  // Ordering per edge (left → right) to guarantee no crossings:
  //   TOP edge  (forward, left→right flow):
  //     [incoming closest→farthest]  then  [outgoing farthest→closest]
  //   BOT edge  (backward, right→left flow):
  //     [outgoing farthest→closest]  then  [incoming closest→farthest]
  //
  // "Incoming" = role 'to'  (transition arrives at this state)
  // "Outgoing" = role 'from' (transition leaves this state)
  // Distance  = |otherStateIdx − thisStateIdx|

  const SPREAD = BOX_W * 0.60; // usable spread width on each state edge

  // edgeConns: `${stateId}::top|bot` → [{tIdx, role, otherIdx}]
  const edgeConns = new Map();
  const addConn = (sid, edge, tIdx, role, otherIdx) => {
    const k = `${sid}::${edge}`;
    if (!edgeConns.has(k)) edgeConns.set(k, []);
    edgeConns.get(k).push({ tIdx, role, otherIdx });
  };
  for (const t of enriched) {
    const edge = t.span > 0 ? 'top' : 'bot';
    addConn(t.fromId, edge, t.i, 'from', t.toIdx);
    addConn(t.toId,   edge, t.i, 'to',   t.fromIdx);
  }

  // connX: tIdx → {x1, x2} — defaults to state centers
  const connX = new Map(enriched.map(t => [
    t.i, { x1: stateX[t.fromId], x2: stateX[t.toId] }
  ]));

  for (const [key, items] of edgeConns) {
    if (items.length <= 1) continue;

    const sepIdx  = key.indexOf('::');
    const stateId = key.slice(0, sepIdx);
    const edge    = key.slice(sepIdx + 2); // 'top' | 'bot'
    const idxS    = indexMap[stateId];
    const cx      = stateX[stateId];

    const dist = item => Math.abs(item.otherIdx - idxS);

    const incoming = items.filter(it => it.role === 'to');
    const outgoing = items.filter(it => it.role === 'from');

    // TOP edge (forward, left→right):
    //   incoming closest→farthest, then outgoing farthest→closest
    // BOT edge (backward, right→left):
    //   outgoing closest→farthest, then incoming farthest→closest
    let ordered;
    if (edge === 'top') {
      incoming.sort((a, b) => dist(a) - dist(b)); // closest first
      outgoing.sort((a, b) => dist(b) - dist(a)); // farthest first
      ordered = [...incoming, ...outgoing];
    } else {
      outgoing.sort((a, b) => dist(a) - dist(b)); // closest first
      incoming.sort((a, b) => dist(b) - dist(a)); // farthest first
      ordered = [...outgoing, ...incoming];
    }

    const n      = ordered.length;
    const startX = cx - SPREAD / 2;
    const step   = SPREAD / (n - 1);

    ordered.forEach(({ tIdx, role }, i) => {
      const x = startX + i * step;
      const c = connX.get(tIdx);
      if (role === 'from') c.x1 = x;
      else                 c.x2 = x;
    });
  }

  const fwdTransitions = enriched.filter(t => t.span > 0);
  const bwdTransitions = enriched.filter(t => t.span < 0);

  const maxFwdSpan = fwdTransitions.length ? Math.max(...fwdTransitions.map(t =>  t.span)) : 0;
  const maxBwdSpan = bwdTransitions.length ? Math.max(...bwdTransitions.map(t => -t.span)) : 0;

  const topSpace = maxFwdSpan > 0 ? BASE_CURVE + (maxFwdSpan - 1) * CURVE_STEP + BTN_H + 16 : 20;
  const botSpace = maxBwdSpan > 0 ? BASE_CURVE + (maxBwdSpan - 1) * CURVE_STEP + BTN_H + 28 : 30;

  const ROW_Y     = SVG_PAD + topSpace + BOX_H / 2;
  const svgWidth  = SVG_PAD * 2 + sorted.length * (BOX_W + H_GAP) - H_GAP;
  const svgHeight = ROW_Y + BOX_H / 2 + botSpace + SVG_PAD;
  const topEdgeY  = ROW_Y - BOX_H / 2;
  const botEdgeY  = ROW_Y + BOX_H / 2;

  const renderTransition = (t) => {
    const { fromId, span, i } = t;
    const name     = t.name || t.NAME || '';
    const forward  = span > 0;
    const absSpan  = Math.abs(span);
    const offset   = BASE_CURVE + (absSpan - 1) * CURVE_STEP;

    // Use spread connection points
    const { x1, x2 } = connX.get(i);
    const connY = forward ? topEdgeY : botEdgeY;

    // midY: the outer horizontal rail
    const midY = forward ? connY - offset : connY + offset;
    // midX: centre of the horizontal rail (for the label pill)
    const midX = (x1 + x2) / 2;

    // Compute displayName early — needed for path splitting (chip width)
    const fromCurrentEarly  = !previewMode && fromId === currentStateId;
    const guardViolations   = transitionGuardViolations?.get(name) ?? [];
    const hasViolations     = guardViolations.length > 0;
    const blockedEarly      = hasViolations
      || (fromCurrentEarly && availableTransitionNames != null && !availableTransitionNames.has(name));
    const displayName       = blockedEarly ? `✕ ${name}` : name;

    // Half-width of the chip — used to split the rail path around it
    const hw = displayName ? Math.max(44, displayName.length * 6 + 18) / 2 : 0;

    // Square path split around the chip:
    //   d1 = from-state side (no arrowhead)
    //   d2 = to-state side   (has arrowhead)
    // Forward (arc above boxes, left→right):
    //   d1: up → corner → horizontal stopping before chip
    //   d2: horizontal starting after chip → corner → down
    // Backward (arc below boxes, right→left):
    //   d1: down → corner → horizontal stopping before chip
    //   d2: horizontal starting after chip → corner → up
    let d1, d2;
    if (forward) {
      d1 = [
        `M ${x1},${connY}`,
        `V ${midY + R}`,
        `Q ${x1},${midY} ${x1 + R},${midY}`,
        `H ${midX - hw - CHIP_GAP}`,
      ].join(' ');
      d2 = [
        `M ${midX + hw + CHIP_GAP},${midY}`,
        `H ${x2 - R}`,
        `Q ${x2},${midY} ${x2},${midY + R}`,
        `V ${connY}`,
      ].join(' ');
    } else {
      d1 = [
        `M ${x1},${connY}`,
        `V ${midY - R}`,
        `Q ${x1},${midY} ${x1 - R},${midY}`,
        `H ${midX + hw + CHIP_GAP}`,
      ].join(' ');
      d2 = [
        `M ${midX - hw - CHIP_GAP},${midY}`,
        `H ${x2 + R}`,
        `Q ${x2},${midY} ${x2},${midY - R}`,
        `V ${connY}`,
      ].join(' ');
    }

    const fromCurrent = fromCurrentEarly;
    const blocked     = blockedEarly;
    const enabled  = fromCurrent && !blocked;
    const hovered  = enabled && hoveredIdx === i;
    const canClick = enabled && !!onTransition && !previewMode;

    // In preview mode treat every transition as "enabled"
    const activeTransition = previewMode || fromCurrent;

    // Target state color drives the transition visual
    const toState     = sorted.find(s => (s.id || s.ID) === t.toId);
    const targetColor = blocked ? '#dc2626' : (stateColor(toState) || (forward ? '#5b9cf6' : '#e8a947'));

    // Visual style
    const railColor   = targetColor;
    const railOpacity = activeTransition ? 0.70 : 0.30;
    const railWidth   = activeTransition ? 1.5 : 1;

    // Pill geometry (hw already computed above for path splitting)
    const textW = hw * 2;
    const bx    = midX - hw;
    const by    = midY - BTN_H / 2;

    // Button colors
    let btnFill, btnStroke, btnText;
    if (blocked) {
      btnFill   = '#1c0808';
      btnStroke = '#7f1d1d';
      btnText   = 'var(--danger)';
    } else if (enabled || previewMode) {
      if (hovered) {
        btnFill   = targetColor;
        btnStroke = targetColor;
        btnText   = '#ffffff';
      } else {
        btnFill   = `${targetColor}18`;
        btnStroke = `${targetColor}70`;
        btnText   = targetColor;
      }
    } else {
      btnFill   = 'var(--surface2)';
      btnStroke = 'var(--border2)';
      btnText   = 'var(--muted2)';
    }

    return (
      <g key={`t-${i}`}>
        {/* Rail — split into two segments so the chip sits inside the gap */}
        <path
          d={d1}
          fill="none"
          style={{ stroke: activeTransition ? railColor : 'var(--border2)' }}
          strokeWidth={railWidth}
          strokeDasharray={forward ? 'none' : '4,3'}
          opacity={railOpacity}
        />
        <path
          d={d2}
          fill="none"
          style={{ stroke: activeTransition ? railColor : 'var(--border2)' }}
          strokeWidth={railWidth}
          strokeDasharray={forward ? 'none' : '4,3'}
          opacity={railOpacity}
          markerEnd="url(#arr)"
        />

        {/* Transition button pill */}
        {displayName && (
          <g
            style={{ cursor: canClick ? 'pointer' : 'default' }}
            onMouseEnter={enabled ? () => setHoveredIdx(i) : undefined}
            onMouseLeave={enabled ? () => setHoveredIdx(null) : undefined}
            onClick={canClick ? () => onTransition(t) : undefined}
          >
            {/* Native tooltip showing guard violation reasons */}
            {hasViolations && (
              <title>{'Blocked:\n\u2022 ' + guardViolations.map(v => typeof v === 'string' ? v : v.message || v.guardCode).join('\n\u2022 ')}</title>
            )}
            {/* Larger invisible hit area */}
            <rect
              x={bx - 4} y={by - 4}
              width={textW + 8} height={BTN_H + 8}
              rx={BTN_RX + 4}
              fill="transparent"
            />
            <rect
              x={bx} y={by}
              width={textW} height={BTN_H}
              rx={BTN_RX}
              style={{ fill: btnFill, stroke: btnStroke }}
              strokeWidth={fromCurrent ? 1 : 0.5}
            />
            <text
              x={midX} y={midY + 5}
              textAnchor="middle"
              fontSize="9"
              fontFamily="var(--sans)"
              fontWeight="700"
              style={{ fill: btnText, userSelect: 'none', pointerEvents: 'none' }}
            >
              {displayName}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="lc-diagram">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ fontFamily: 'var(--mono)', overflow: 'visible' }}
      >
        <defs>
          {/* Arrow inherits stroke color from the referencing path via context-stroke */}
          <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,0.5 L0,6.5 L6,3.5 z" fill="context-stroke" opacity="0.7" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Transitions render first so state boxes sit on top */}
        {bwdTransitions.map(renderTransition)}
        {fwdTransitions.map(renderTransition)}

        {/* State boxes */}
        {sorted.map(s => {
          const id      = s.id      || s.ID;
          const name    = s.name    || s.NAME || id;
          const isFrozen = s.is_frozen   === 1 || s.IS_FROZEN   === 1;
          const isRel    = s.is_released === 1 || s.IS_RELEASED === 1;
          const isInit   = s.is_initial  === 1 || s.IS_INITIAL  === 1;
          const flags    = [
            isInit   ? 'INIT'   : null,
            isFrozen ? 'FROZEN' : null,
            isRel    ? 'REL'    : null,
          ].filter(Boolean).join(' · ');

          const cx = stateX[id];
          const x  = cx - BOX_W / 2;
          const y  = ROW_Y - BOX_H / 2;

          const isActive = previewMode || id === currentStateId;
          let fill, stroke, textColor;
          if (isActive) {
            const sc  = stateColor(s);
            fill      = `${sc}22`;
            stroke    = sc;
            textColor = sc;
          } else {
            fill      = 'var(--surface2)';
            stroke    = 'var(--border2)';
            textColor = 'var(--muted)';
          }

          return (
            <g key={id} filter={isActive ? 'url(#glow)' : undefined}>
              <rect
                x={x} y={y} width={BOX_W} height={BOX_H}
                rx={6}
                style={{ fill, stroke }}
                strokeWidth={isActive ? 1.5 : 1}
              />
              <text
                x={cx} y={ROW_Y + (flags ? 1 : 4)}
                textAnchor="middle"
                fontSize="11"
                fontFamily="var(--sans)"
                fontWeight={isActive ? '700' : '600'}
                style={{ fill: textColor }}
              >
                {name}
              </text>
              {flags && (
                <text
                  x={cx} y={ROW_Y + 13}
                  textAnchor="middle"
                  fontSize="7"
                  fontFamily="var(--sans)"
                  style={{ fill: isActive ? textColor : 'var(--muted2)' }}
                  opacity="0.7"
                >
                  {flags}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
