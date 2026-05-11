import { jsxs as p, jsx as n } from "react/jsx-runtime";
import { i as v } from "./dstApi-Dmlh36CO.js";
let h = null;
function m(e) {
  var s;
  const t = (((s = e.targetDetails) == null ? void 0 : s.contentType) || "").toLowerCase(), i = (e.displayKey || e.targetKey || "").toLowerCase();
  return t.includes("step") || t.includes("stp") || i.endsWith(".stp") || i.endsWith(".step") || i.endsWith(".p21");
}
function u(e) {
  return e == null ? "—" : e < 1024 ? `${e} B` : e < 1024 * 1024 ? `${(e / 1024).toFixed(1)} KB` : e < 1024 * 1024 * 1024 ? `${(e / (1024 * 1024)).toFixed(1)} MB` : `${(e / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function y({ shellAPI: e, descriptor: t, item: i, isActive: s }) {
  const o = e ?? h, a = i.id, l = i.originalName || a, r = i.contentType || "", c = u(i.sizeBytes), d = t.color || "var(--muted2)";
  return /* @__PURE__ */ p(
    "div",
    {
      className: `node-item${s ? " active" : ""}`,
      onClick: () => {
        var f;
        return (f = o == null ? void 0 : o.navigate) == null ? void 0 : f.call(o, a, l, t);
      },
      title: `${l} — ${r || "unknown type"} · ${c}`,
      children: [
        /* @__PURE__ */ n("span", { className: "ni-expand", style: { visibility: "hidden" } }),
        /* @__PURE__ */ n("span", { style: { width: 6, height: 6, borderRadius: 1, background: d, flexShrink: 0, display: "inline-block" } }),
        /* @__PURE__ */ n("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: l }),
        /* @__PURE__ */ n("span", { className: "ni-reviter", style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted2)" }, children: c })
      ]
    }
  );
}
function g({ descriptor: e, item: t, ctx: i, isActive: s }) {
  const o = t.id, a = t.originalName || o, l = t.contentType || "", r = u(t.sizeBytes), c = e.color || "var(--muted2)";
  return /* @__PURE__ */ p(
    "div",
    {
      className: `node-item${s ? " active" : ""}`,
      onClick: () => i.onNavigate(o, a, e),
      title: `${a} — ${l || "unknown type"} · ${r}`,
      children: [
        /* @__PURE__ */ n("span", { className: "ni-expand", style: { visibility: "hidden" } }),
        /* @__PURE__ */ n("span", { style: { width: 6, height: 6, borderRadius: 1, background: c, flexShrink: 0, display: "inline-block" } }),
        /* @__PURE__ */ n("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: a }),
        /* @__PURE__ */ n("span", { className: "ni-reviter", style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted2)" }, children: r })
      ]
    }
  );
}
function x({ link: e, isEditing: t, editTargetKey: i, onEditTargetKey: s }) {
  if (t)
    return /* @__PURE__ */ n(
      "input",
      {
        className: "field-input",
        style: { padding: "2px 4px", fontSize: 12, minWidth: 180 },
        type: "text",
        placeholder: "File UUID…",
        value: i,
        onChange: (d) => s(d.target.value)
      }
    );
  const o = e.targetDetails || {}, a = e.displayKey || e.targetKey || "—", l = o.contentType || "", r = o.sizeBytes != null ? u(o.sizeBytes) : null, c = m(e);
  return /* @__PURE__ */ p("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 }, children: [
    /* @__PURE__ */ n("span", { style: { fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500 }, children: a }),
    l && /* @__PURE__ */ n("span", { style: {
      fontSize: 10,
      color: "var(--muted)",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      padding: "1px 5px",
      borderRadius: 3
    }, children: l }),
    r && /* @__PURE__ */ n("span", { style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }, children: r }),
    c && /* @__PURE__ */ n("span", { style: { fontSize: 10, color: "var(--accent, #5b9cf6)", fontWeight: 600 }, children: "3D" }),
    e.resolverError && /* @__PURE__ */ n("span", { style: { fontSize: 11, color: "var(--danger, #e05252)" }, title: e.resolverError, children: "⚠" })
  ] });
}
const N = {
  id: "dst-nav",
  zone: "nav",
  // sourcePlugins match contract — enables PluginLoader bridge
  match: { serviceCode: "dst", itemCode: "data-object" },
  // Also register LinkRow under DATA_LOCAL (targetSourceCode used in PSM PBS links)
  linkSources: ["DATA_LOCAL"],
  hasItemChildren: () => !1,
  // ctx-interface exports (used by BrowseNav via sourcePlugins)
  NavRow: g,
  LinkRow: x,
  init(e) {
    h = e, v(e);
  },
  matches(e) {
    return (e == null ? void 0 : e.serviceCode) === "dst";
  },
  // shellAPI-interface Component (used by pluginRegistry nav zone)
  Component: y
};
export {
  N as default
};
