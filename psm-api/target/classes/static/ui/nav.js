import { jsxs as s, jsx as t, Fragment as x } from "react/jsx-runtime";
import { i as w, p as S } from "./psmApi-Br1g6HiW.js";
function E({ size: n = 9, color: e = "currentColor", strokeWidth: o = 2.5 }) {
  return /* @__PURE__ */ t(
    "svg",
    {
      width: n,
      height: n,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: e,
      strokeWidth: o,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ t("polyline", { points: "9 18 15 12 9 6" })
    }
  );
}
function T({ size: n = 9, color: e = "currentColor", strokeWidth: o = 2.5 }) {
  return /* @__PURE__ */ t(
    "svg",
    {
      width: n,
      height: n,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: e,
      strokeWidth: o,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ t("polyline", { points: "6 9 12 15 18 9" })
    }
  );
}
function A({ size: n = 10, color: e = "currentColor", strokeWidth: o = 2.5 }) {
  return /* @__PURE__ */ s(
    "svg",
    {
      width: n,
      height: n,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: e,
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
function O({ size: n = 10, color: e = "currentColor", strokeWidth: o = 2.5 }) {
  return /* @__PURE__ */ s(
    "svg",
    {
      width: n,
      height: n,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: e,
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
function D({ item: n, ctx: e }) {
  const { userId: o, stateColorMap: r } = e, c = n.revision || n.REVISION || "A", l = n.iteration ?? n.ITERATION ?? 1, u = n.lifecycle_state_id || n.LIFECYCLE_STATE_ID, h = n.logical_id || n.LOGICAL_ID || "", i = n.locked_by || n.LOCKED_BY || null, d = (n.tx_status || n.TX_STATUS || "COMMITTED") === "OPEN", a = i && i !== o, v = i && i === o;
  return /* @__PURE__ */ s(x, { children: [
    /* @__PURE__ */ t("span", { className: "ni-dot", style: { background: (r == null ? void 0 : r[u]) || "#6b7280" } }),
    /* @__PURE__ */ s("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
      h || /* @__PURE__ */ t("span", { className: "ni-no-id", children: "—" }),
      (n.display_name || n.DISPLAY_NAME) && /* @__PURE__ */ t("span", { className: "ni-dname", children: n.display_name || n.DISPLAY_NAME })
    ] }),
    /* @__PURE__ */ t("span", { className: "ni-reviter", style: d ? { color: "var(--warn)" } : void 0, children: l === 0 ? c : `${c}.${l}` }),
    a && /* @__PURE__ */ t(A, { size: 10, strokeWidth: 2.5, color: "var(--muted)", style: { flexShrink: 0 } }),
    v && /* @__PURE__ */ t(O, { size: 10, strokeWidth: 2.5, color: "var(--accent)", style: { flexShrink: 0 } })
  ] });
}
function b(n, e, o) {
  const r = n.id || n.ID, c = n.logical_id || n.LOGICAL_ID || "", l = n.locked_by || n.LOCKED_BY || null, h = (n.tx_status || n.TX_STATUS || "COMMITTED") === "OPEN", i = n.revision || "A", g = n.iteration ?? 1;
  return {
    draggable: !0,
    title: l ? `Locked by ${l}` : h ? `${g === 0 ? i : i + "." + g} — pending changes` : c || r,
    onDragStart(d) {
      d.dataTransfer.effectAllowed = "link", e == null || e.itemKey, e == null || e.displayName, d.dataTransfer.setData("text/plain", "plm-node");
    },
    onDragEnd() {
    }
  };
}
const P = Object.freeze({
  serviceCode: "psm",
  itemCode: "node",
  itemKey: null,
  get: Object.freeze({ httpMethod: "GET", path: "/nodes/{id}/description" })
});
function R({
  link: n,
  depth: e,
  parentPath: o,
  ancestorIds: r,
  ctx: c,
  childCacheRef: l,
  expandedPaths: u,
  toggleNodeChildren: h
}) {
  const { stateColorMap: i, onNavigate: g, activeNodeId: d } = c, a = n.targetNodeId, v = n.linkPolicy === "VERSION_TO_VERSION", p = r.has(a), f = `${o}/${n.linkId}`, N = !p && u.has(f), y = l.current[a], C = y === "loading", k = 10 + e * 14, I = n.linkTypeColor || null, _ = n.targetChildrenCount != null ? n.targetChildrenCount > 0 : !Array.isArray(y) || y.length > 0, m = !p && _;
  return /* @__PURE__ */ s(
    "div",
    {
      className: `ni-link-row${a === d ? " active" : ""}`,
      style: { paddingLeft: k },
      onClick: () => g(a, n.targetLogicalId || void 0, P),
      title: `${n.linkLogicalId || n.linkId} → ${n.targetLogicalId || a} ${n.targetRevision}.${n.targetIteration}`,
      children: [
        /* @__PURE__ */ t(
          "span",
          {
            className: "ni-expand",
            style: { visibility: m || C ? "visible" : "hidden" },
            onClick: (L) => {
              p ? L.stopPropagation() : h(f, a, L);
            },
            children: p ? /* @__PURE__ */ t("span", { style: { fontSize: 9, color: "var(--muted2)", lineHeight: 1 }, children: "↺" }) : C ? /* @__PURE__ */ t("span", { style: { fontSize: 9, color: "var(--muted)", lineHeight: 1 }, children: "…" }) : N ? /* @__PURE__ */ t(T, { size: 9, strokeWidth: 2.5, color: "var(--muted)" }) : /* @__PURE__ */ t(E, { size: 9, strokeWidth: 2.5, color: "var(--muted)" })
          }
        ),
        I && /* @__PURE__ */ t("span", { style: { width: 6, height: 6, borderRadius: 1, background: I, flexShrink: 0, display: "inline-block" } }),
        /* @__PURE__ */ t("span", { className: "ni-dot", style: { background: (i == null ? void 0 : i[n.targetState]) || "#6b7280" } }),
        /* @__PURE__ */ s("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, color: I || void 0 }, children: [
          n.targetLogicalId || /* @__PURE__ */ t("span", { className: "ni-no-id", style: { color: "var(--muted2)" }, children: "—" }),
          n.linkLogicalId && /* @__PURE__ */ s("span", { style: { opacity: 0.65, marginLeft: 3 }, children: [
            "[",
            n.linkLogicalId,
            "]"
          ] })
        ] }),
        /* @__PURE__ */ s("span", { className: "ni-reviter", children: [
          n.targetRevision,
          ".",
          n.targetIteration
        ] }),
        /* @__PURE__ */ t("span", { className: `ni-policy ni-policy-${v ? "v2v" : "v2m"}`, children: v ? "V2V" : "V2M" })
      ]
    }
  );
}
const B = {
  id: "psm-nav",
  zone: "nav",
  match: { serviceCode: "psm", itemCode: "node" },
  NavLabel: D,
  getRowProps: b,
  ChildRow: R,
  hasItemChildren: (n) => {
    const e = n.children_count ?? n.CHILDREN_COUNT;
    return e == null || e > 0;
  },
  fetchChildren: async (n) => {
    const e = n.id || n.ID;
    try {
      const o = await S.getChildLinks(null, e);
      return Array.isArray(o) ? o : [];
    } catch {
      return [];
    }
  },
  init(n) {
    w(n);
  },
  matches(n) {
    return (n == null ? void 0 : n.serviceCode) === "psm";
  }
};
export {
  B as default
};
