import { jsx as t, jsxs as s, Fragment as g } from "react/jsx-runtime";
import { i as y } from "./dstApi-Dmlh36CO.js";
function x(e) {
  var a;
  const n = (((a = e.targetDetails) == null ? void 0 : a.contentType) || "").toLowerCase(), o = (e.displayKey || e.targetKey || "").toLowerCase();
  return n.includes("step") || n.includes("stp") || o.endsWith(".stp") || o.endsWith(".step") || o.endsWith(".p21");
}
function u(e) {
  return e == null ? "—" : e < 1024 ? `${e} B` : e < 1024 * 1024 ? `${(e / 1024).toFixed(1)} KB` : e < 1024 * 1024 * 1024 ? `${(e / (1024 * 1024)).toFixed(1)} MB` : `${(e / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function S({ item: e }) {
  const n = e.originalName || e.id, o = u(e.sizeBytes);
  return /* @__PURE__ */ s(g, { children: [
    /* @__PURE__ */ t("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: n }),
    /* @__PURE__ */ t("span", { className: "ni-reviter", style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted2)" }, children: o })
  ] });
}
function z({ size: e = 11, color: n = "currentColor", strokeWidth: o = 2 }) {
  return /* @__PURE__ */ s(
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
function k({ size: e = 11, color: n = "currentColor", strokeWidth: o = 2 }) {
  return /* @__PURE__ */ s(
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
function w({ hit: e, descriptor: n, isPinned: o, onPin: a, onUnpin: r, ctx: h }) {
  let i = {};
  try {
    i = JSON.parse(e.sourceJson || "{}");
  } catch {
  }
  const { onNavigate: c, icons: d } = h, l = i.originalName || e.id, m = u(i.sizeBytes), f = i.contentType || "", p = d && (n != null && n.icon) ? d[n.icon] : null;
  return /* @__PURE__ */ s(
    "div",
    {
      className: "node-item",
      onClick: () => c(e.id, l, n),
      title: l,
      children: [
        p ? /* @__PURE__ */ t(p, { size: 11, color: n.color || "var(--muted)", strokeWidth: 2, style: { flexShrink: 0 } }) : n != null && n.color ? /* @__PURE__ */ t("span", { style: { width: 6, height: 6, borderRadius: 1, background: n.color, flexShrink: 0, display: "inline-block" } }) : null,
        /* @__PURE__ */ t("span", { className: "ni-logical", style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: l }),
        f && /* @__PURE__ */ t("span", { style: {
          fontSize: 10,
          color: "var(--muted)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "1px 5px",
          borderRadius: 3,
          flexShrink: 0
        }, children: f }),
        /* @__PURE__ */ t("span", { className: "ni-reviter", style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted2)", flexShrink: 0 }, children: m }),
        /* @__PURE__ */ t(
          "button",
          {
            className: `search-pin-btn${o ? " pinned" : ""}`,
            title: o ? "Remove from basket" : "Add to basket",
            onClick: (v) => {
              v.stopPropagation(), o ? r == null || r() : a == null || a();
            },
            children: o ? /* @__PURE__ */ t(k, { size: 11, strokeWidth: 2 }) : /* @__PURE__ */ t(z, { size: 11, strokeWidth: 2 })
          }
        )
      ]
    }
  );
}
function N({ link: e, isEditing: n, editTargetKey: o, onEditTargetKey: a }) {
  if (n)
    return /* @__PURE__ */ t(
      "input",
      {
        className: "field-input",
        style: { padding: "2px 4px", fontSize: 12, minWidth: 180 },
        type: "text",
        placeholder: "File UUID…",
        value: o,
        onChange: (l) => a(l.target.value)
      }
    );
  const r = e.targetDetails || {}, h = e.displayKey || e.targetKey || "—", i = r.contentType || "", c = r.sizeBytes != null ? u(r.sizeBytes) : null, d = x(e);
  return /* @__PURE__ */ s("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 }, children: [
    /* @__PURE__ */ t("span", { style: { fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500 }, children: h }),
    i && /* @__PURE__ */ t("span", { style: {
      fontSize: 10,
      color: "var(--muted)",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      padding: "1px 5px",
      borderRadius: 3
    }, children: i }),
    c && /* @__PURE__ */ t("span", { style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }, children: c }),
    d && /* @__PURE__ */ t("span", { style: { fontSize: 10, color: "var(--accent, #5b9cf6)", fontWeight: 600 }, children: "3D" }),
    e.resolverError && /* @__PURE__ */ t("span", { style: { fontSize: 11, color: "var(--danger, #e05252)" }, title: e.resolverError, children: "⚠" })
  ] });
}
const C = {
  id: "dst-nav",
  zone: "nav",
  match: { serviceCode: "dst", itemCode: "data-object" },
  linkSources: ["DATA_LOCAL"],
  hasItemChildren: () => !1,
  NavLabel: S,
  SearchItem: w,
  LinkRow: N,
  init(e) {
    y(e);
  },
  matches(e) {
    return (e == null ? void 0 : e.serviceCode) === "dst";
  }
};
export {
  C as default
};
