import { jsxs as r, jsx as t } from "react/jsx-runtime";
import { i as O, p as R } from "./psmApi-Br1g6HiW.js";
function _({ size: n = 9, color: e = "currentColor", strokeWidth: a = 2.5 }) {
  return /* @__PURE__ */ t(
    "svg",
    {
      width: n,
      height: n,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: e,
      strokeWidth: a,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ t("polyline", { points: "9 18 15 12 9 6" })
    }
  );
}
function w({ size: n = 9, color: e = "currentColor", strokeWidth: a = 2.5 }) {
  return /* @__PURE__ */ t(
    "svg",
    {
      width: n,
      height: n,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: e,
      strokeWidth: a,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ t("polyline", { points: "6 9 12 15 18 9" })
    }
  );
}
function b({ size: n = 10, color: e = "currentColor", strokeWidth: a = 2.5 }) {
  return /* @__PURE__ */ r(
    "svg",
    {
      width: n,
      height: n,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: e,
      strokeWidth: a,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ t("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
        /* @__PURE__ */ t("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
      ]
    }
  );
}
function D({ size: n = 10, color: e = "currentColor", strokeWidth: a = 2.5 }) {
  return /* @__PURE__ */ r(
    "svg",
    {
      width: n,
      height: n,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: e,
      strokeWidth: a,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ t("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
        /* @__PURE__ */ t("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })
      ]
    }
  );
}
function $({
  shellAPI: n,
  descriptor: e,
  item: a,
  isActive: m,
  hasChildren: S,
  isExpanded: I,
  isLoading: v,
  onToggleChildren: y
}) {
  var E;
  const c = ((E = n == null ? void 0 : n.getStore) == null ? void 0 : E.call(n)) ?? {}, g = c.stateColorMap ?? {}, N = c.userId ?? null, l = a.id || a.ID, s = a.revision || a.REVISION || "A", i = a.iteration ?? a.ITERATION ?? 1, C = a.lifecycle_state_id || a.LIFECYCLE_STATE_ID, d = a.logical_id || a.LOGICAL_ID || "", o = a.locked_by || a.LOCKED_BY || null, p = (a.tx_status || a.TX_STATUS || "COMMITTED") === "OPEN", h = o && o !== N, L = o && o === N, f = (e == null ? void 0 : e.color) ?? null;
  function u() {
    var k;
    (k = n == null ? void 0 : n.navigate) == null || k.call(n, l, d || l, e);
  }
  function T(k) {
    k.dataTransfer.effectAllowed = "link", e == null || e.itemKey, e == null || e.displayName, k.dataTransfer.setData("text/plain", "plm-node");
  }
  return /* @__PURE__ */ r(
    "div",
    {
      className: `node-item${m ? " active" : ""}`,
      draggable: !0,
      onDragStart: T,
      onDragEnd: () => void 0,
      onClick: u,
      title: h ? `Locked by ${o}` : p ? `${i === 0 ? s : s + "." + i} — pending changes` : d || l,
      children: [
        /* @__PURE__ */ t(
          "span",
          {
            className: "ni-expand",
            style: { visibility: v || S ? "visible" : "hidden" },
            onClick: (k) => y && y(k),
            children: v ? /* @__PURE__ */ t("span", { style: { fontSize: 9, color: "var(--muted)", lineHeight: 1 }, children: "…" }) : I ? /* @__PURE__ */ t(w, { size: 9, strokeWidth: 2.5, color: "var(--muted)" }) : /* @__PURE__ */ t(_, { size: 9, strokeWidth: 2.5, color: "var(--muted)" })
          }
        ),
        f && /* @__PURE__ */ t("span", { style: { width: 6, height: 6, borderRadius: 1, background: f, flexShrink: 0, display: "inline-block" } }),
        /* @__PURE__ */ t("span", { className: "ni-dot", style: { background: g[C] || "#6b7280" } }),
        /* @__PURE__ */ r("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
          d || /* @__PURE__ */ t("span", { className: "ni-no-id", children: "—" }),
          (a.display_name || a.DISPLAY_NAME) && /* @__PURE__ */ t("span", { className: "ni-dname", children: a.display_name || a.DISPLAY_NAME })
        ] }),
        /* @__PURE__ */ t("span", { className: "ni-reviter", style: p ? { color: "var(--warn)" } : void 0, children: i === 0 ? s : `${s}.${i}` }),
        h && /* @__PURE__ */ t(b, { size: 10, strokeWidth: 2.5, color: "var(--muted)", style: { flexShrink: 0 } }),
        L && /* @__PURE__ */ t(D, { size: 10, strokeWidth: 2.5, color: "var(--accent)", style: { flexShrink: 0 } })
      ]
    }
  );
}
const M = Object.freeze({
  serviceCode: "psm",
  itemCode: "node",
  itemKey: null,
  get: Object.freeze({ httpMethod: "GET", path: "/nodes/{id}/description" })
});
function z({
  descriptor: n,
  item: e,
  ctx: a,
  isActive: m,
  hasChildren: S,
  isExpanded: I,
  isLoading: v,
  onToggleChildren: y
}) {
  const { userId: c, stateColorMap: g, onNavigate: N } = a, l = e.id || e.ID, s = e.revision || e.REVISION || "A", i = e.iteration ?? e.ITERATION ?? 1, C = e.lifecycle_state_id || e.LIFECYCLE_STATE_ID, d = e.logical_id || e.LOGICAL_ID || "", o = e.locked_by || e.LOCKED_BY || null, p = (e.tx_status || e.TX_STATUS || "COMMITTED") === "OPEN", h = o && o !== c, L = o && o === c, f = (n == null ? void 0 : n.color) ?? null;
  return /* @__PURE__ */ r(
    "div",
    {
      className: `node-item${m ? " active" : ""}`,
      draggable: !0,
      onDragStart: (u) => {
        u.dataTransfer.effectAllowed = "link", n == null || n.itemKey, n == null || n.displayName, u.dataTransfer.setData("text/plain", "plm-node");
      },
      onDragEnd: () => void 0,
      onClick: () => N(l, d || void 0, n),
      title: h ? `Locked by ${o}` : p ? `${i === 0 ? s : s + "." + i} — pending changes` : d || l,
      children: [
        /* @__PURE__ */ t(
          "span",
          {
            className: "ni-expand",
            style: { visibility: v || S ? "visible" : "hidden" },
            onClick: (u) => y && y(u),
            children: v ? /* @__PURE__ */ t("span", { style: { fontSize: 9, color: "var(--muted)", lineHeight: 1 }, children: "…" }) : I ? /* @__PURE__ */ t(w, { size: 9, strokeWidth: 2.5, color: "var(--muted)" }) : /* @__PURE__ */ t(_, { size: 9, strokeWidth: 2.5, color: "var(--muted)" })
          }
        ),
        f && /* @__PURE__ */ t("span", { style: { width: 6, height: 6, borderRadius: 1, background: f, flexShrink: 0, display: "inline-block" } }),
        /* @__PURE__ */ t("span", { className: "ni-dot", style: { background: (g == null ? void 0 : g[C]) || "#6b7280" } }),
        /* @__PURE__ */ r("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
          d || /* @__PURE__ */ t("span", { className: "ni-no-id", children: "—" }),
          (e.display_name || e.DISPLAY_NAME) && /* @__PURE__ */ t("span", { className: "ni-dname", children: e.display_name || e.DISPLAY_NAME })
        ] }),
        /* @__PURE__ */ t("span", { className: "ni-reviter", style: p ? { color: "var(--warn)" } : void 0, children: i === 0 ? s : `${s}.${i}` }),
        h && /* @__PURE__ */ t(b, { size: 10, strokeWidth: 2.5, color: "var(--muted)", style: { flexShrink: 0 } }),
        L && /* @__PURE__ */ t(D, { size: 10, strokeWidth: 2.5, color: "var(--accent)", style: { flexShrink: 0 } })
      ]
    }
  );
}
function W({
  link: n,
  depth: e,
  parentPath: a,
  ancestorIds: m,
  ctx: S,
  childCacheRef: I,
  expandedPaths: v,
  toggleNodeChildren: y
}) {
  const { stateColorMap: c, onNavigate: g, activeNodeId: N } = S, l = n.targetNodeId, s = n.linkPolicy === "VERSION_TO_VERSION", i = m.has(l), C = `${a}/${n.linkId}`, d = !i && v.has(C), o = I.current[l], x = o === "loading", p = 10 + e * 14, h = n.linkTypeColor || null, L = n.targetChildrenCount != null ? n.targetChildrenCount > 0 : !Array.isArray(o) || o.length > 0, f = !i && L;
  return /* @__PURE__ */ r(
    "div",
    {
      className: `ni-link-row${l === N ? " active" : ""}`,
      style: { paddingLeft: p },
      onClick: () => g(l, n.targetLogicalId || void 0, M),
      title: `${n.linkLogicalId || n.linkId} → ${n.targetLogicalId || l} ${n.targetRevision}.${n.targetIteration}`,
      children: [
        /* @__PURE__ */ t(
          "span",
          {
            className: "ni-expand",
            style: { visibility: f || x ? "visible" : "hidden" },
            onClick: (u) => {
              i ? u.stopPropagation() : y(C, l, u);
            },
            children: i ? /* @__PURE__ */ t("span", { style: { fontSize: 9, color: "var(--muted2)", lineHeight: 1 }, children: "↺" }) : x ? /* @__PURE__ */ t("span", { style: { fontSize: 9, color: "var(--muted)", lineHeight: 1 }, children: "…" }) : d ? /* @__PURE__ */ t(w, { size: 9, strokeWidth: 2.5, color: "var(--muted)" }) : /* @__PURE__ */ t(_, { size: 9, strokeWidth: 2.5, color: "var(--muted)" })
          }
        ),
        h && /* @__PURE__ */ t("span", { style: { width: 6, height: 6, borderRadius: 1, background: h, flexShrink: 0, display: "inline-block" } }),
        /* @__PURE__ */ t("span", { className: "ni-dot", style: { background: (c == null ? void 0 : c[n.targetState]) || "#6b7280" } }),
        /* @__PURE__ */ r("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, color: h || void 0 }, children: [
          n.targetLogicalId || /* @__PURE__ */ t("span", { className: "ni-no-id", style: { color: "var(--muted2)" }, children: "—" }),
          n.linkLogicalId && /* @__PURE__ */ r("span", { style: { opacity: 0.65, marginLeft: 3 }, children: [
            "[",
            n.linkLogicalId,
            "]"
          ] })
        ] }),
        /* @__PURE__ */ r("span", { className: "ni-reviter", children: [
          n.targetRevision,
          ".",
          n.targetIteration
        ] }),
        /* @__PURE__ */ t("span", { className: `ni-policy ni-policy-${s ? "v2v" : "v2m"}`, children: s ? "V2V" : "V2M" })
      ]
    }
  );
}
const V = {
  id: "psm-nav",
  zone: "nav",
  // sourcePlugins match contract — enables PluginLoader bridge
  match: { serviceCode: "psm", itemCode: "node" },
  // ctx-interface exports (used by BrowseNav via sourcePlugins)
  NavRow: z,
  ChildRow: W,
  hasItemChildren: (n) => {
    const e = n.children_count ?? n.CHILDREN_COUNT;
    return e == null || e > 0;
  },
  fetchChildren: async (n) => {
    const e = n.id || n.ID;
    try {
      const a = await R.getChildLinks(null, e);
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  },
  init(n) {
    O(n);
  },
  matches(n) {
    return (n == null ? void 0 : n.serviceCode) === "psm";
  },
  // shellAPI-interface Component (used by pluginRegistry nav zone)
  Component: $
};
export {
  V as default
};
