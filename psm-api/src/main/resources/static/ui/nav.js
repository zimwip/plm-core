import { jsxs as l, jsx as t, Fragment as x } from "react/jsx-runtime";
import { i as S, p as _ } from "./psmApi-uItxvmzj.js";
function A({ size: e = 9, color: n = "currentColor", strokeWidth: o = 2.5 }) {
  return /* @__PURE__ */ t(
    "svg",
    {
      width: e,
      height: e,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: n,
      strokeWidth: o,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ t("polyline", { points: "9 18 15 12 9 6" })
    }
  );
}
function b({ size: e = 9, color: n = "currentColor", strokeWidth: o = 2.5 }) {
  return /* @__PURE__ */ t(
    "svg",
    {
      width: e,
      height: e,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: n,
      strokeWidth: o,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ t("polyline", { points: "6 9 12 15 18 9" })
    }
  );
}
function O({ size: e = 10, color: n = "currentColor", strokeWidth: o = 2.5 }) {
  return /* @__PURE__ */ l(
    "svg",
    {
      width: e,
      height: e,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: n,
      strokeWidth: o,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ t("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
        /* @__PURE__ */ t("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
      ]
    }
  );
}
function E({ size: e = 10, color: n = "currentColor", strokeWidth: o = 2.5 }) {
  return /* @__PURE__ */ l(
    "svg",
    {
      width: e,
      height: e,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: n,
      strokeWidth: o,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ t("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
        /* @__PURE__ */ t("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })
      ]
    }
  );
}
function T({ item: e, ctx: n }) {
  const { userId: o, stateColorMap: s } = n, r = e.revision || e.REVISION || "A", d = e.iteration ?? e.ITERATION ?? 1, c = e.lifecycle_state_id || e.LIFECYCLE_STATE_ID, v = e.logical_id || e.LOGICAL_ID || "", a = e.locked_by || e.LOCKED_BY || null, h = (e.tx_status || e.TX_STATUS || "COMMITTED") === "OPEN", i = a && a !== o, g = a && a === o;
  return /* @__PURE__ */ l(x, { children: [
    /* @__PURE__ */ t("span", { className: "ni-dot", style: { background: (s == null ? void 0 : s[c]) || "#6b7280" } }),
    /* @__PURE__ */ l("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
      v || /* @__PURE__ */ t("span", { className: "ni-no-id", children: "—" }),
      (e.display_name || e.DISPLAY_NAME) && /* @__PURE__ */ t("span", { className: "ni-dname", children: e.display_name || e.DISPLAY_NAME })
    ] }),
    /* @__PURE__ */ t("span", { className: "ni-reviter", style: h ? { color: "var(--warn)" } : void 0, children: d === 0 ? r : `${r}.${d}` }),
    i && /* @__PURE__ */ t(O, { size: 10, strokeWidth: 2.5, color: "var(--muted)", style: { flexShrink: 0 } }),
    g && /* @__PURE__ */ t(E, { size: 10, strokeWidth: 2.5, color: "var(--accent)", style: { flexShrink: 0 } })
  ] });
}
function D(e, n, o) {
  const s = e.id || e.ID, r = e.logical_id || e.LOGICAL_ID || "", d = e.locked_by || e.LOCKED_BY || null, v = (e.tx_status || e.TX_STATUS || "COMMITTED") === "OPEN", a = e.revision || "A", u = e.iteration ?? 1;
  return {
    draggable: !0,
    title: d ? `Locked by ${d}` : v ? `${u === 0 ? a : a + "." + u} — pending changes` : r || s,
    onDragStart(h) {
      h.dataTransfer.effectAllowed = "link", n == null || n.itemKey, n == null || n.displayName, h.dataTransfer.setData("text/plain", "plm-node");
    },
    onDragEnd() {
    }
  };
}
const R = Object.freeze({
  serviceCode: "psm",
  get: Object.freeze({ httpMethod: "GET", path: "/nodes/{id}/description" })
});
function M({
  link: e,
  depth: n,
  parentPath: o,
  ancestorIds: s,
  ctx: r,
  childCacheRef: d,
  expandedPaths: c,
  toggleNodeChildren: v
}) {
  const { stateColorMap: a, onNavigate: u, activeNodeId: h } = r, i = e.targetNodeId, g = e.linkPolicy === "VERSION_TO_VERSION", p = s.has(i), y = `${o}/${e.linkId}`, N = !p && c.has(y), f = d.current[i], k = f === "loading", L = 10 + n * 14, I = e.linkTypeColor || null, C = e.targetChildrenCount != null ? e.targetChildrenCount > 0 : !Array.isArray(f) || f.length > 0, w = !p && C;
  return /* @__PURE__ */ l(
    "div",
    {
      className: `ni-link-row${i === h ? " active" : ""}`,
      style: { paddingLeft: L },
      onClick: () => u(i, e.targetLogicalId || void 0, R),
      title: `${e.linkLogicalId || e.linkId} → ${e.targetLogicalId || i} ${e.targetRevision}.${e.targetIteration}`,
      children: [
        /* @__PURE__ */ t(
          "span",
          {
            className: "ni-expand",
            style: { visibility: w || k ? "visible" : "hidden" },
            onClick: (m) => {
              p ? m.stopPropagation() : v(y, i, m);
            },
            children: p ? /* @__PURE__ */ t("span", { style: { fontSize: 9, color: "var(--muted2)", lineHeight: 1 }, children: "↺" }) : k ? /* @__PURE__ */ t("span", { style: { fontSize: 9, color: "var(--muted)", lineHeight: 1 }, children: "…" }) : N ? /* @__PURE__ */ t(b, { size: 9, strokeWidth: 2.5, color: "var(--muted)" }) : /* @__PURE__ */ t(A, { size: 9, strokeWidth: 2.5, color: "var(--muted)" })
          }
        ),
        I && /* @__PURE__ */ t("span", { style: { width: 6, height: 6, borderRadius: 1, background: I, flexShrink: 0, display: "inline-block" } }),
        /* @__PURE__ */ t("span", { className: "ni-dot", style: { background: (a == null ? void 0 : a[e.targetState]) || "#6b7280" } }),
        /* @__PURE__ */ l("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, color: I || void 0 }, children: [
          e.targetLogicalId || /* @__PURE__ */ t("span", { className: "ni-no-id", style: { color: "var(--muted2)" }, children: "—" }),
          e.linkLogicalId && /* @__PURE__ */ l("span", { style: { opacity: 0.65, marginLeft: 3 }, children: [
            "[",
            e.linkLogicalId,
            "]"
          ] })
        ] }),
        /* @__PURE__ */ l("span", { className: "ni-reviter", children: [
          e.targetRevision,
          ".",
          e.targetIteration
        ] }),
        /* @__PURE__ */ t("span", { className: `ni-policy ni-policy-${g ? "v2v" : "v2m"}`, children: g ? "V2V" : "V2M" })
      ]
    }
  );
}
function $({ size: e = 11, color: n = "currentColor", strokeWidth: o = 2 }) {
  return /* @__PURE__ */ l(
    "svg",
    {
      width: e,
      height: e,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: n,
      strokeWidth: o,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ t("path", { d: "M12 17v5" }),
        /* @__PURE__ */ t("path", { d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" })
      ]
    }
  );
}
function B({ size: e = 11, color: n = "currentColor", strokeWidth: o = 2 }) {
  return /* @__PURE__ */ l(
    "svg",
    {
      width: e,
      height: e,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: n,
      strokeWidth: o,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ t("path", { d: "M12 17v5" }),
        /* @__PURE__ */ t("path", { d: "M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89" }),
        /* @__PURE__ */ t("path", { d: "m2 2 20 20" }),
        /* @__PURE__ */ t("path", { d: "M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11" })
      ]
    }
  );
}
function P({ hit: e, descriptor: n, isPinned: o, onPin: s, onUnpin: r, ctx: d }) {
  let c = {};
  try {
    c = JSON.parse(e.sourceJson || "{}");
  } catch {
  }
  const { onNavigate: v, icons: a } = d, u = c.revision || "A", h = c.iteration ?? 1, i = c.logicalId || "", g = c.name || "", p = a && (n != null && n.icon) ? a[n.icon] : null;
  return /* @__PURE__ */ l(
    "div",
    {
      className: "node-item",
      onClick: () => v(e.id, i || e.id, n),
      title: [i, g].filter(Boolean).join(" · ") || e.id,
      children: [
        p ? /* @__PURE__ */ t(p, { size: 11, color: n.color || "var(--muted)", strokeWidth: 2, style: { flexShrink: 0 } }) : n != null && n.color ? /* @__PURE__ */ t("span", { style: { width: 6, height: 6, borderRadius: 1, background: n.color, flexShrink: 0, display: "inline-block" } }) : null,
        /* @__PURE__ */ l("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
          i || /* @__PURE__ */ t("span", { className: "ni-no-id", children: "—" }),
          g && /* @__PURE__ */ t("span", { className: "ni-dname", children: g })
        ] }),
        /* @__PURE__ */ t("span", { className: "ni-reviter", children: h === 0 ? u : `${u}.${h}` }),
        /* @__PURE__ */ t(
          "button",
          {
            className: `search-pin-btn${o ? " pinned" : ""}`,
            title: o ? "Remove from basket" : "Add to basket",
            onClick: (y) => {
              y.stopPropagation(), o ? r == null || r() : s == null || s();
            },
            children: o ? /* @__PURE__ */ t(B, { size: 11, strokeWidth: 2 }) : /* @__PURE__ */ t($, { size: 11, strokeWidth: 2 })
          }
        )
      ]
    }
  );
}
const W = {
  id: "psm-nav",
  zone: "nav",
  match: { serviceCode: "psm" },
  NavLabel: T,
  SearchItem: P,
  getRowProps: D,
  ChildRow: M,
  hasItemChildren: (e) => {
    const n = e.children_count ?? e.CHILDREN_COUNT;
    return n == null || n > 0;
  },
  fetchChildren: async (e) => {
    const n = e.id || e.ID;
    try {
      const o = await _.getChildLinks(null, n);
      return Array.isArray(o) ? o : [];
    } catch {
      return [];
    }
  },
  init(e) {
    S(e);
  },
  matches(e) {
    return (e == null ? void 0 : e.serviceCode) === "psm";
  }
};
export {
  W as default
};
