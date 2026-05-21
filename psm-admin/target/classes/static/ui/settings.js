import { jsx as e, jsxs as i, Fragment as ne } from "react/jsx-runtime";
import { forwardRef as et, createElement as je, useState as x, useEffect as Se, useCallback as He } from "react";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ot = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), tt = (...t) => t.filter((n, r, c) => !!n && n.trim() !== "" && c.indexOf(n) === r).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var st = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ct = et(
  ({
    color: t = "currentColor",
    size: n = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: c,
    className: k = "",
    children: P,
    iconNode: u,
    ...m
  }, V) => je(
    "svg",
    {
      ref: V,
      ...st,
      width: n,
      height: n,
      stroke: t,
      strokeWidth: c ? Number(r) * 24 / Number(n) : r,
      className: tt("lucide", k),
      ...m
    },
    [
      ...u.map(([Y, O]) => je(Y, O)),
      ...Array.isArray(P) ? P : [P]
    ]
  )
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pe = (t, n) => {
  const r = et(
    ({ className: c, ...k }, P) => je(ct, {
      ref: P,
      iconNode: n,
      className: tt(`lucide-${ot(t)}`, c),
      ...k
    })
  );
  return r.displayName = `${t}`, r;
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Re = Pe("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Oe = Pe("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ut = Pe("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pe = Pe("Pen", [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ge = Pe("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ae = Pe("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
let nt = null;
function pt(t) {
  nt = t.http;
}
const I = (t, n, r) => nt.serviceRequest("psa", t, n, r), f = {
  // ── Metadata keys ─────────────────────────────────────────────────
  getMetadataKeys: (t, n) => I("GET", n ? `/metamodel/metadata/keys/${n}` : "/metamodel/metadata/keys"),
  // ── Node types ────────────────────────────────────────────────────
  getNodeTypes: (t) => I("GET", "/metamodel/nodetypes"),
  createNodeType: (t, n) => I("POST", "/metamodel/nodetypes", n),
  deleteNodeType: (t, n) => I("DELETE", `/metamodel/nodetypes/${n}`),
  updateNodeTypeIdentity: (t, n, r) => I("PUT", `/metamodel/nodetypes/${n}/identity`, r),
  updateNodeTypeNumberingScheme: (t, n, r) => I("PUT", `/metamodel/nodetypes/${n}/numbering-scheme`, { numberingScheme: r }),
  updateNodeTypeVersionPolicy: (t, n, r) => I("PUT", `/metamodel/nodetypes/${n}/version-policy`, { versionPolicy: r }),
  updateNodeTypeCollapseHistory: (t, n, r) => I("PUT", `/metamodel/nodetypes/${n}/collapse-history`, { collapseHistory: r }),
  updateNodeTypeLifecycle: (t, n, r) => I("PUT", `/metamodel/nodetypes/${n}/lifecycle`, { lifecycleId: r || null }),
  updateNodeTypeAppearance: (t, n, r, c) => I("PUT", `/metamodel/nodetypes/${n}/appearance`, { color: r || null, icon: c || null }),
  updateNodeTypeParent: (t, n, r) => I("PUT", `/metamodel/nodetypes/${n}/parent`, { parentNodeTypeId: r || null }),
  // ── Node type attributes ──────────────────────────────────────────
  getNodeTypeAttributes: (t, n) => I("GET", `/metamodel/nodetypes/${n}/attributes`),
  createAttribute: (t, n, r) => I("POST", `/metamodel/nodetypes/${n}/attributes`, r),
  updateAttribute: (t, n, r, c) => I("PUT", `/metamodel/nodetypes/${n}/attributes/${r}`, c),
  deleteAttribute: (t, n, r) => I("DELETE", `/metamodel/nodetypes/${n}/attributes/${r}`),
  // ── Node type actions ─────────────────────────────────────────────
  getAllActions: (t) => I("GET", "/metamodel/actions"),
  getActionsForNodeType: (t, n) => I("GET", `/metamodel/nodetypes/${n}/actions`),
  registerCustomAction: (t, n) => I("POST", "/metamodel/actions", n),
  // ── Link types ────────────────────────────────────────────────────
  getLinkTypes: (t) => I("GET", "/metamodel/linktypes"),
  getNodeTypeLinkTypes: (t, n) => I("GET", `/metamodel/nodetypes/${n}/linktypes`),
  createLinkType: (t, n) => I("POST", "/metamodel/linktypes", n),
  updateLinkType: (t, n, r) => I("PUT", `/metamodel/linktypes/${n}`, r),
  deleteLinkType: (t, n) => I("DELETE", `/metamodel/linktypes/${n}`),
  // ── Link type attributes ──────────────────────────────────────────
  getLinkTypeAttributes: (t, n) => I("GET", `/metamodel/linktypes/${n}/attributes`),
  createLinkTypeAttribute: (t, n, r) => I("POST", `/metamodel/linktypes/${n}/attributes`, r),
  updateLinkTypeAttribute: (t, n, r, c) => I("PUT", `/metamodel/linktypes/${n}/attributes/${r}`, c),
  deleteLinkTypeAttribute: (t, n, r) => I("DELETE", `/metamodel/linktypes/${n}/attributes/${r}`),
  // ── Link type cascade rules ───────────────────────────────────────
  getLinkTypeCascades: (t, n) => I("GET", `/metamodel/linktypes/${n}/cascades`),
  createLinkTypeCascade: (t, n, r, c, k) => I("POST", `/metamodel/linktypes/${n}/cascades`, { parentTransitionId: r, childFromStateId: c, childTransitionId: k }),
  deleteLinkTypeCascade: (t, n, r) => I("DELETE", `/metamodel/linktypes/${n}/cascades/${r}`),
  // ── Lifecycles ────────────────────────────────────────────────────
  getLifecycles: (t) => I("GET", "/metamodel/lifecycles"),
  getLifecycleStates: (t, n) => I("GET", `/metamodel/lifecycles/${n}/states`),
  getLifecycleTransitions: (t, n) => I("GET", `/metamodel/lifecycles/${n}/transitions`),
  createLifecycle: (t, n) => I("POST", "/metamodel/lifecycles", n),
  duplicateLifecycle: (t, n, r) => I("POST", `/metamodel/lifecycles/${n}/duplicate`, { name: r }),
  deleteLifecycle: (t, n) => I("DELETE", `/metamodel/lifecycles/${n}`),
  // ── Lifecycle states ──────────────────────────────────────────────
  addLifecycleState: (t, n, r) => I("POST", `/metamodel/lifecycles/${n}/states`, r),
  updateLifecycleState: (t, n, r, c) => I("PUT", `/metamodel/lifecycles/${n}/states/${r}`, c),
  deleteLifecycleState: (t, n, r) => I("DELETE", `/metamodel/lifecycles/${n}/states/${r}`),
  // ── Lifecycle state actions ───────────────────────────────────────
  listLifecycleStateActions: (t, n, r) => I("GET", `/metamodel/lifecycles/${n}/states/${r}/actions`),
  attachLifecycleStateAction: (t, n, r, c, k, P, u = 0) => I("POST", `/metamodel/lifecycles/${n}/states/${r}/actions`, { instanceId: c, trigger: k, executionMode: P, displayOrder: u }),
  detachLifecycleStateAction: (t, n, r, c) => I("DELETE", `/metamodel/lifecycles/${n}/states/${r}/actions/${c}`),
  // ── Lifecycle transitions ─────────────────────────────────────────
  addLifecycleTransition: (t, n, r) => I("POST", `/metamodel/lifecycles/${n}/transitions`, r),
  updateLifecycleTransition: (t, n, r, c) => I("PUT", `/metamodel/lifecycles/${n}/transitions/${r}`, c),
  deleteLifecycleTransition: (t, n, r) => I("DELETE", `/metamodel/lifecycles/${n}/transitions/${r}`),
  // ── Transition signature requirements ────────────────────────────
  addTransitionSignatureRequirement: (t, n, r, c = 0) => I("POST", `/metamodel/transitions/${n}/signature-requirements`, { roleId: r, displayOrder: c }),
  removeTransitionSignatureRequirement: (t, n, r) => I("DELETE", `/metamodel/transitions/${n}/signature-requirements/${r}`),
  // ── Transition guards ─────────────────────────────────────────────
  listTransitionGuards: (t, n) => I("GET", `/metamodel/lifecycles/transitions/${n}/guards`),
  attachTransitionGuard: (t, n, r, c, k) => I("POST", `/metamodel/lifecycles/transitions/${n}/guards`, { instanceId: r, effect: c, displayOrder: k }),
  updateTransitionGuard: (t, n, r) => I("PUT", `/metamodel/lifecycles/transitions/guards/${n}`, { effect: r }),
  detachTransitionGuard: (t, n) => I("DELETE", `/metamodel/lifecycles/transitions/guards/${n}`),
  // ── Sources ───────────────────────────────────────────────────────
  getSources: (t) => I("GET", "/sources"),
  getSourceResolvers: (t) => I("GET", "/sources/resolvers"),
  createSource: (t, n) => I("POST", "/sources", n),
  updateSource: (t, n, r) => I("PUT", `/sources/${n}`, r),
  deleteSource: (t, n) => I("DELETE", `/sources/${n}`),
  // ── Import contexts ───────────────────────────────────────────────
  getImportContexts: () => I("GET", "/admin/import-contexts"),
  createImportContext: (t) => I("POST", "/admin/import-contexts", t),
  updateImportContext: (t, n) => I("PUT", `/admin/import-contexts/${t}`, n),
  deleteImportContext: (t) => I("DELETE", `/admin/import-contexts/${t}`),
  getImportAlgorithmInstances: () => I("GET", "/admin/import-contexts/algorithm-instances/import"),
  getValidationAlgorithmInstances: () => I("GET", "/admin/import-contexts/algorithm-instances/validation"),
  // ── Domains ───────────────────────────────────────────────────────
  getDomains: (t) => I("GET", "/domains"),
  createDomain: (t, n) => I("POST", "/domains", n),
  updateDomain: (t, n, r) => I("PUT", `/domains/${n}`, r),
  deleteDomain: (t, n) => I("DELETE", `/domains/${n}`),
  getDomainAttributes: (t, n) => I("GET", `/domains/${n}/attributes`),
  createDomainAttribute: (t, n, r) => I("POST", `/domains/${n}/attributes`, r),
  updateDomainAttribute: (t, n, r, c) => I("PUT", `/domains/${n}/attributes/${r}`, c),
  deleteDomainAttribute: (t, n, r) => I("DELETE", `/domains/${n}/attributes/${r}`),
  // ── Enums ─────────────────────────────────────────────────────────
  getEnums: (t) => I("GET", "/enums"),
  getEnumDetail: (t, n) => I("GET", `/enums/${n}`),
  createEnum: (t, n) => I("POST", "/enums", n),
  updateEnum: (t, n, r) => I("PUT", `/enums/${n}`, r),
  deleteEnum: (t, n) => I("DELETE", `/enums/${n}`),
  getEnumValues: (t, n) => I("GET", `/enums/${n}/values`),
  addEnumValue: (t, n, r) => I("POST", `/enums/${n}/values`, r),
  updateEnumValue: (t, n, r, c) => I("PUT", `/enums/${n}/values/${r}`, c),
  deleteEnumValue: (t, n, r) => I("DELETE", `/enums/${n}/values/${r}`),
  reorderEnumValues: (t, n, r) => I("PUT", `/enums/${n}/values/reorder`, r)
};
let Ue = () => {
}, at = null, Me = {}, it = [], lt = () => Promise.reject("not initialised"), rt = () => Promise.reject("not initialised");
const Xe = ["VERSION_TO_MASTER", "VERSION_TO_VERSION"], Ke = ["ALPHA_NUMERIC"], Qe = ["NONE", "ITERATE", "RELEASE"], Ve = ["STRING", "NUMBER", "DATE", "BOOLEAN", "ENUM"], Ge = ["TEXT", "TEXTAREA", "DROPDOWN", "DATE_PICKER", "CHECKBOX"], mt = ["NONE", "REQUIRE_SIGNATURE"], ht = ["NONE", "ITERATE", "REVISE"], $e = "#6b7280", yt = [
  "#5b9cf6",
  "#38bdf8",
  "#34d399",
  "#a3e635",
  "#facc15",
  "#fb923c",
  "#f87171",
  "#e879f9",
  "#a78bfa",
  "#56d18e",
  "#e8a947",
  "#6b7280"
], gt = ["STEP", "CATIA_V5"];
function We(t) {
  return (t == null ? void 0 : t.color) || (t == null ? void 0 : t.COLOR) || $e;
}
function ft(t) {
  if (!t) return { fg: "var(--muted2)", bg: "rgba(120,130,150,.14)" };
  let n = 0;
  for (let c = 0; c < t.length; c++) n = n * 31 + t.charCodeAt(c) & 16777215;
  const r = n % 360;
  return { fg: `hsl(${r},70%,72%)`, bg: `hsl(${r},55%,22%)` };
}
function Ze({ module: t }) {
  if (!t) return null;
  const n = ft(t);
  return /* @__PURE__ */ e(
    "span",
    {
      title: `Spring Modulith module: ${t}`,
      style: {
        display: "inline-block",
        padding: "1px 7px",
        borderRadius: 10,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: ".06em",
        fontFamily: "var(--mono)",
        textTransform: "uppercase",
        background: n.bg,
        color: n.fg,
        border: `1px solid ${n.fg}33`,
        verticalAlign: "middle"
      },
      children: t
    }
  );
}
function De({ title: t, onClose: n, onSave: r, saving: c, saveLabel: k = "Save", children: P, width: u = 480 }) {
  return /* @__PURE__ */ e(
    "div",
    {
      className: "diff-overlay",
      style: { zIndex: 600 },
      onClick: (m) => {
        m.target === m.currentTarget && n();
      },
      children: /* @__PURE__ */ i("div", { className: "diff-modal", style: { width: u, maxHeight: "85vh", display: "flex", flexDirection: "column" }, children: [
        /* @__PURE__ */ i("div", { className: "diff-header", children: [
          /* @__PURE__ */ e("span", { className: "diff-title", children: t }),
          /* @__PURE__ */ e("button", { className: "diff-close", onClick: n, children: "×" })
        ] }),
        /* @__PURE__ */ e("div", { style: { flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }, children: P }),
        /* @__PURE__ */ i("div", { style: { padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8, flexShrink: 0 }, children: [
          /* @__PURE__ */ e("button", { className: "btn", onClick: n, children: "Cancel" }),
          /* @__PURE__ */ e("button", { className: "btn btn-primary", onClick: r, disabled: c, children: c ? "Saving…" : k })
        ] })
      ] })
    }
  );
}
function b({ label: t, children: n }) {
  return /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
    /* @__PURE__ */ e("label", { style: { fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }, children: t }),
    n
  ] });
}
function ze({ label: t, value: n, onChange: r }) {
  return /* @__PURE__ */ e(b, { label: t, children: /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
    /* @__PURE__ */ e("div", { style: {
      width: 28,
      height: 28,
      borderRadius: 4,
      flexShrink: 0,
      background: n || "var(--bg3)",
      border: "1px solid var(--border)"
    } }),
    /* @__PURE__ */ e(
      "input",
      {
        type: "color",
        className: "field-input",
        style: { width: 48, height: 28, padding: 1, cursor: "pointer" },
        value: n || "#6aacff",
        onChange: (c) => r(c.target.value)
      }
    ),
    /* @__PURE__ */ e(
      "input",
      {
        type: "text",
        className: "field-input",
        style: { flex: 1 },
        value: n || "",
        onChange: (c) => r(c.target.value),
        placeholder: "#rrggbb",
        maxLength: 7
      }
    ),
    n && /* @__PURE__ */ e("button", { className: "btn btn-sm", style: { padding: "2px 8px", fontSize: 10 }, onClick: () => r(""), children: "Clear" })
  ] }) });
}
function dt({ value: t, onChange: n }) {
  return /* @__PURE__ */ i(b, { label: "Icon", children: [
    /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4, padding: "8px 0" }, children: [
      /* @__PURE__ */ e(
        "button",
        {
          title: "No icon",
          onClick: () => n(""),
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 4,
            cursor: "pointer",
            border: t ? "1px solid var(--border)" : "2px solid var(--accent)",
            background: t ? "transparent" : "var(--accent-dim)",
            fontSize: 10,
            color: "var(--muted)"
          },
          children: "—"
        }
      ),
      it.map((r) => {
        const c = Me[r], k = t === r;
        return /* @__PURE__ */ e(
          "button",
          {
            title: r,
            onClick: () => n(r),
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 4,
              cursor: "pointer",
              border: k ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: k ? "var(--accent-dim)" : "transparent"
            },
            children: /* @__PURE__ */ e(c, { size: 14, strokeWidth: 1.8, color: k ? "var(--accent)" : "var(--muted)" })
          },
          r
        );
      })
    ] }),
    t && /* @__PURE__ */ e("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: -4 }, children: t })
  ] });
}
function Je({ label: t, action: n }) {
  return /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }, children: [
    /* @__PURE__ */ e("span", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--muted)" }, children: t }),
    n
  ] });
}
function vt({ value: t, onChange: n }) {
  return /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
    /* @__PURE__ */ e("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }, children: yt.map((r) => /* @__PURE__ */ e(
      "button",
      {
        onClick: () => n(r),
        style: {
          width: "100%",
          aspectRatio: "1",
          borderRadius: 4,
          background: r,
          border: "none",
          cursor: "pointer",
          outline: t === r ? "2px solid var(--text)" : "2px solid transparent",
          outlineOffset: 2
        },
        title: r
      },
      r
    )) }),
    /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ e("label", { style: { fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }, children: "Custom" }),
      /* @__PURE__ */ e(
        "input",
        {
          type: "color",
          value: t || $e,
          onChange: (r) => n(r.target.value),
          style: { width: 36, height: 28, padding: 2, border: "1px solid var(--border2)", borderRadius: 4, background: "var(--surface)", cursor: "pointer" }
        }
      ),
      /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }, children: t || $e })
    ] })
  ] });
}
function qe({ userId: t, enumDefinitionId: n, onChange: r }) {
  const [c, k] = x(null), [P, u] = x(null);
  return Se(() => {
    f.getEnums(t).then((m) => k(Array.isArray(m) ? m : [])).catch(() => k([]));
  }, [t]), Se(() => {
    if (!n) {
      u(null);
      return;
    }
    f.getEnumValues(t, n).then((m) => u(Array.isArray(m) ? m : [])).catch(() => u([]));
  }, [t, n]), c === null ? /* @__PURE__ */ e(b, { label: "Enumeration", children: /* @__PURE__ */ e("span", { style: { fontSize: 12, color: "var(--muted)" }, children: "Loading…" }) }) : /* @__PURE__ */ i(ne, { children: [
    /* @__PURE__ */ e(b, { label: "Enumeration *", children: /* @__PURE__ */ i("select", { className: "field-input", value: n || "", onChange: (m) => r(m.target.value || null), children: [
      /* @__PURE__ */ e("option", { value: "", children: "Select an enumeration…" }),
      c.map((m) => /* @__PURE__ */ i("option", { value: m.id, children: [
        m.name,
        " (",
        m.valueCount,
        " value",
        m.valueCount !== 1 ? "s" : "",
        ")"
      ] }, m.id))
    ] }) }),
    P && P.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: P.map((m) => /* @__PURE__ */ e("span", { style: {
      display: "inline-block",
      background: "var(--accent-dim, #e0e7ff)",
      color: "var(--fg)",
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: 11
    }, children: m.label || m.value }, m.id)) })
  ] });
}
function Ye({ form: t, setForm: n, autoFocusName: r = !0, hideAsName: c = !1, userId: k }) {
  const P = t.dataType || "STRING";
  return /* @__PURE__ */ i(ne, { children: [
    /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ e(b, { label: "Name (internal key) *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: r, value: t.name || "", onChange: (u) => n((m) => ({ ...m, name: u.target.value })), placeholder: "e.g. reviewNote" }) }),
      /* @__PURE__ */ e(b, { label: "Label (display) *", children: /* @__PURE__ */ e("input", { className: "field-input", value: t.label || "", onChange: (u) => n((m) => ({ ...m, label: u.target.value })), placeholder: "e.g. Review Note" }) })
    ] }),
    /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ e(b, { label: "Data Type", children: /* @__PURE__ */ e("select", { className: "field-input", value: P, onChange: (u) => n((m) => ({ ...m, dataType: u.target.value })), children: Ve.map((u) => /* @__PURE__ */ e("option", { value: u, children: u }, u)) }) }),
      /* @__PURE__ */ e(b, { label: "Widget", children: /* @__PURE__ */ e("select", { className: "field-input", value: t.widgetType || "TEXT", onChange: (u) => n((m) => ({ ...m, widgetType: u.target.value })), children: Ge.map((u) => /* @__PURE__ */ e("option", { value: u, children: u }, u)) }) })
    ] }),
    /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }, children: [
      /* @__PURE__ */ e(b, { label: "Section", children: /* @__PURE__ */ e("input", { className: "field-input", value: t.displaySection || "", onChange: (u) => n((m) => ({ ...m, displaySection: u.target.value })), placeholder: "e.g. Details" }) }),
      /* @__PURE__ */ e(b, { label: "Order", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: t.displayOrder ?? "", onChange: (u) => n((m) => ({ ...m, displayOrder: u.target.value })), placeholder: "0" }) })
    ] }),
    /* @__PURE__ */ e(b, { label: "Default value", children: /* @__PURE__ */ e("input", { className: "field-input", value: t.defaultValue || "", onChange: (u) => n((m) => ({ ...m, defaultValue: u.target.value })), placeholder: "Optional" }) }),
    /* @__PURE__ */ e(b, { label: "Validation regex", children: /* @__PURE__ */ e("input", { className: "field-input", value: t.namingRegex || "", onChange: (u) => n((m) => ({ ...m, namingRegex: u.target.value })), placeholder: "e.g. ^[A-Z]{3}-[0-9]+$" }) }),
    P !== "ENUM" && /* @__PURE__ */ e(b, { label: "Allowed values (comma-separated)", children: /* @__PURE__ */ e("input", { className: "field-input", value: t.allowedValues || "", onChange: (u) => n((m) => ({ ...m, allowedValues: u.target.value })), placeholder: "e.g. Low,Medium,High" }) }),
    /* @__PURE__ */ e(b, { label: "Tooltip", children: /* @__PURE__ */ e("input", { className: "field-input", value: t.tooltip || "", onChange: (u) => n((m) => ({ ...m, tooltip: u.target.value })), placeholder: "Hint shown next to the field" }) }),
    /* @__PURE__ */ i("div", { style: { display: "flex", gap: 20, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ i("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 }, children: [
        /* @__PURE__ */ e("input", { type: "checkbox", checked: !!t.required, onChange: (u) => n((m) => ({ ...m, required: u.target.checked })) }),
        "Required field"
      ] }),
      !c && /* @__PURE__ */ i("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 }, children: [
        /* @__PURE__ */ e("input", { type: "checkbox", checked: !!t.asName, onChange: (u) => n((m) => ({ ...m, asName: u.target.checked })) }),
        "Use as display name ",
        /* @__PURE__ */ e("span", { style: { color: "var(--accent)", marginLeft: 2 }, children: "★" })
      ] })
    ] }),
    P === "ENUM" && k && /* @__PURE__ */ e(
      qe,
      {
        userId: k,
        enumDefinitionId: t.enumDefinitionId || null,
        onChange: (u) => n((m) => ({ ...m, enumDefinitionId: u }))
      }
    )
  ] });
}
function bt({ form: t, setForm: n, knownMetaKeys: r = [] }) {
  const c = t.metadata || {}, k = (m, V) => n((Y) => ({
    ...Y,
    metadata: { ...Y.metadata || {}, [m]: V ? "true" : void 0 }
  })), P = new Set(r), u = Object.keys(c).filter((m) => !P.has(m));
  return /* @__PURE__ */ i(ne, { children: [
    /* @__PURE__ */ e(b, { label: "State Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: t.name || "", onChange: (m) => n((V) => ({ ...V, name: m.target.value })), placeholder: "e.g. In Review" }) }),
    /* @__PURE__ */ e(b, { label: "Display Order", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: t.displayOrder ?? "", onChange: (m) => n((V) => ({ ...V, displayOrder: m.target.value })), placeholder: "0", style: { width: 100 } }) }),
    /* @__PURE__ */ e(b, { label: "Flags", children: /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: /* @__PURE__ */ i("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }, children: [
      /* @__PURE__ */ e("input", { type: "checkbox", checked: !!t.isInitial, onChange: (m) => n((V) => ({ ...V, isInitial: m.target.checked })) }),
      /* @__PURE__ */ e("span", { className: "lc-state-flag", style: { opacity: t.isInitial ? 1 : 0.4 }, children: "INIT" }),
      /* @__PURE__ */ e("span", { style: { color: "var(--muted)", fontSize: 11 }, children: "Initial state — entry point of the lifecycle" })
    ] }) }) }),
    /* @__PURE__ */ e(b, { label: "Metadata", children: /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
      r.map((m) => /* @__PURE__ */ i("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }, children: [
        /* @__PURE__ */ e("input", { type: "checkbox", checked: c[m] === "true", onChange: (V) => k(m, V.target.checked) }),
        /* @__PURE__ */ e("span", { className: "lc-state-flag", style: { opacity: c[m] === "true" ? 1 : 0.4 }, children: m.toUpperCase() })
      ] }, m)),
      r.length === 0 && /* @__PURE__ */ e("span", { style: { color: "var(--muted)", fontSize: 11 }, children: "No metadata keys registered in backend" }),
      u.map((m) => /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11 }, children: [
        /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--accent)" }, children: m }),
        /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "=" }),
        /* @__PURE__ */ e("span", { style: { color: "var(--text)" }, children: c[m] }),
        /* @__PURE__ */ e("button", { className: "panel-icon-btn", onClick: () => {
          const V = { ...t.metadata || {} };
          delete V[m], n((Y) => ({ ...Y, metadata: V }));
        }, title: "Remove", children: /* @__PURE__ */ e(ae, { size: 10, strokeWidth: 2, color: "var(--danger)" }) })
      ] }, m))
    ] }) }),
    /* @__PURE__ */ e(b, { label: "Color", children: /* @__PURE__ */ e(vt, { value: t.color || $e, onChange: (m) => n((V) => ({ ...V, color: m })) }) })
  ] });
}
function Nt({ form: t, setForm: n, states: r }) {
  return /* @__PURE__ */ i(ne, { children: [
    /* @__PURE__ */ e(b, { label: "Transition Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: t.name || "", onChange: (c) => n((k) => ({ ...k, name: c.target.value })), placeholder: "e.g. freeze" }) }),
    /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ e(b, { label: "From State *", children: /* @__PURE__ */ i("select", { className: "field-input", value: t.fromStateId || "", onChange: (c) => n((k) => ({ ...k, fromStateId: c.target.value })), children: [
        /* @__PURE__ */ e("option", { value: "", children: "Select…" }),
        r.map((c) => {
          const k = c.id || c.ID;
          return /* @__PURE__ */ e("option", { value: k, children: c.name || c.NAME || k }, k);
        })
      ] }) }),
      /* @__PURE__ */ e(b, { label: "To State *", children: /* @__PURE__ */ i("select", { className: "field-input", value: t.toStateId || "", onChange: (c) => n((k) => ({ ...k, toStateId: c.target.value })), children: [
        /* @__PURE__ */ e("option", { value: "", children: "Select…" }),
        r.map((c) => {
          const k = c.id || c.ID;
          return /* @__PURE__ */ e("option", { value: k, children: c.name || c.NAME || k }, k);
        })
      ] }) })
    ] }),
    /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ e(b, { label: "Action Type", children: /* @__PURE__ */ e("select", { className: "field-input", value: t.actionType || "NONE", onChange: (c) => n((k) => ({ ...k, actionType: c.target.value })), children: mt.map((c) => /* @__PURE__ */ e("option", { value: c, children: c }, c)) }) }),
      /* @__PURE__ */ e(b, { label: "Version Strategy", children: /* @__PURE__ */ e("select", { className: "field-input", value: t.versionStrategy || "NONE", onChange: (c) => n((k) => ({ ...k, versionStrategy: c.target.value })), children: ht.map((c) => /* @__PURE__ */ e("option", { value: c, children: c }, c)) }) })
    ] })
  ] });
}
function Tt({ userId: t, linkTypeId: n, canWrite: r, toast: c }) {
  var o, D;
  const [k, P] = x(null), [u, m] = x(null), [V, Y] = x(null), [O, T] = x({}), [B, h] = x(!1), S = He(
    () => f.getLinkTypeAttributes(t, n).then((l) => P(Array.isArray(l) ? l : [])).catch(() => P([])),
    [t, n]
  );
  Se(() => {
    S();
  }, [S]);
  function X(l) {
    T({
      label: l.label || l.LABEL || "",
      dataType: l.data_type || l.DATA_TYPE || "STRING",
      widgetType: l.widget_type || l.WIDGET_TYPE || "TEXT",
      required: !!(l.required || l.REQUIRED),
      enumDefinitionId: l.enum_definition_id || l.ENUM_DEFINITION_ID || null,
      displaySection: l.display_section || l.DISPLAY_SECTION || "",
      displayOrder: l.display_order ?? l.DISPLAY_ORDER ?? "",
      defaultValue: l.default_value || l.DEFAULT_VALUE || "",
      namingRegex: l.naming_regex || l.NAMING_REGEX || "",
      allowedValues: l.allowed_values || l.ALLOWED_VALUES || "",
      tooltip: l.tooltip || l.TOOLTIP || ""
    }), Y({ attr: l });
  }
  async function J() {
    var l, g, v, p;
    h(!0);
    try {
      await f.updateLinkTypeAttribute(t, n, V.attr.id || V.attr.ID, {
        label: O.label,
        dataType: O.dataType,
        widgetType: O.widgetType,
        required: !!O.required,
        enumDefinitionId: O.dataType === "ENUM" && O.enumDefinitionId || null,
        displaySection: O.displaySection || null,
        displayOrder: O.displayOrder !== "" ? Number(O.displayOrder) : 0,
        defaultValue: ((l = O.defaultValue) == null ? void 0 : l.trim()) || null,
        namingRegex: ((g = O.namingRegex) == null ? void 0 : g.trim()) || null,
        allowedValues: O.dataType !== "ENUM" && ((v = O.allowedValues) == null ? void 0 : v.trim()) || null,
        tooltip: ((p = O.tooltip) == null ? void 0 : p.trim()) || null
      }), await S(), Y(null);
    } catch (C) {
      c(C, "error");
    } finally {
      h(!1);
    }
  }
  async function w() {
    var l, g, v, p, C, y;
    if (!(!((l = u == null ? void 0 : u.name) != null && l.trim()) || !((g = u == null ? void 0 : u.label) != null && g.trim()))) {
      h(!0);
      try {
        await f.createLinkTypeAttribute(t, n, {
          name: u.name.trim(),
          label: u.label.trim(),
          dataType: u.dataType || "STRING",
          widgetType: u.widgetType || "TEXT",
          required: !!u.required,
          enumDefinitionId: u.dataType === "ENUM" && u.enumDefinitionId || null,
          displaySection: u.displaySection || null,
          displayOrder: u.displayOrder !== "" ? Number(u.displayOrder) : 0,
          defaultValue: ((v = u.defaultValue) == null ? void 0 : v.trim()) || null,
          namingRegex: ((p = u.namingRegex) == null ? void 0 : p.trim()) || null,
          allowedValues: u.dataType !== "ENUM" && ((C = u.allowedValues) == null ? void 0 : C.trim()) || null,
          tooltip: ((y = u.tooltip) == null ? void 0 : y.trim()) || null
        }), await S(), m(null);
      } catch (M) {
        c(M, "error");
      } finally {
        h(!1);
      }
    }
  }
  async function Z(l) {
    const g = l.label || l.LABEL || l.name || l.NAME;
    if (window.confirm(`Delete attribute "${g}"?`))
      try {
        await f.deleteLinkTypeAttribute(t, n, l.id || l.ID), await S();
      } catch (v) {
        c(v, "error");
      }
  }
  return k === null ? /* @__PURE__ */ e("div", { style: { fontSize: 12, color: "var(--muted)", padding: "4px 0" }, children: "Loading…" }) : /* @__PURE__ */ i(ne, { children: [
    V && /* @__PURE__ */ i(De, { title: "Edit Attribute", onClose: () => Y(null), onSave: J, saving: B, saveLabel: "Update", children: [
      /* @__PURE__ */ e(b, { label: "Label (display) *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: O.label || "", onChange: (l) => T((g) => ({ ...g, label: l.target.value })) }) }),
      /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ e(b, { label: "Data Type", children: /* @__PURE__ */ e("select", { className: "field-input", value: O.dataType || "STRING", onChange: (l) => T((g) => ({ ...g, dataType: l.target.value })), children: Ve.map((l) => /* @__PURE__ */ e("option", { value: l, children: l }, l)) }) }),
        /* @__PURE__ */ e(b, { label: "Widget", children: /* @__PURE__ */ e("select", { className: "field-input", value: O.widgetType || "TEXT", onChange: (l) => T((g) => ({ ...g, widgetType: l.target.value })), children: Ge.map((l) => /* @__PURE__ */ e("option", { value: l, children: l }, l)) }) })
      ] }),
      O.dataType === "ENUM" && /* @__PURE__ */ e(
        qe,
        {
          userId: t,
          enumDefinitionId: O.enumDefinitionId || null,
          onChange: (l) => T((g) => ({ ...g, enumDefinitionId: l }))
        }
      ),
      /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }, children: [
        /* @__PURE__ */ e(b, { label: "Section", children: /* @__PURE__ */ e("input", { className: "field-input", value: O.displaySection || "", onChange: (l) => T((g) => ({ ...g, displaySection: l.target.value })) }) }),
        /* @__PURE__ */ e(b, { label: "Order", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: O.displayOrder ?? "", onChange: (l) => T((g) => ({ ...g, displayOrder: l.target.value })) }) })
      ] }),
      /* @__PURE__ */ e(b, { label: "Default value", children: /* @__PURE__ */ e("input", { className: "field-input", value: O.defaultValue || "", onChange: (l) => T((g) => ({ ...g, defaultValue: l.target.value })), placeholder: "Optional" }) }),
      /* @__PURE__ */ e(b, { label: "Validation regex", children: /* @__PURE__ */ e("input", { className: "field-input", value: O.namingRegex || "", onChange: (l) => T((g) => ({ ...g, namingRegex: l.target.value })) }) }),
      O.dataType !== "ENUM" && /* @__PURE__ */ e(b, { label: "Allowed values (comma-separated)", children: /* @__PURE__ */ e("input", { className: "field-input", value: O.allowedValues || "", onChange: (l) => T((g) => ({ ...g, allowedValues: l.target.value })) }) }),
      /* @__PURE__ */ e(b, { label: "Tooltip", children: /* @__PURE__ */ e("input", { className: "field-input", value: O.tooltip || "", onChange: (l) => T((g) => ({ ...g, tooltip: l.target.value })) }) }),
      /* @__PURE__ */ i("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 }, children: [
        /* @__PURE__ */ e("input", { type: "checkbox", checked: !!O.required, onChange: (l) => T((g) => ({ ...g, required: l.target.checked })) }),
        "Required field"
      ] })
    ] }),
    k.length > 0 && /* @__PURE__ */ i("table", { className: "settings-table", style: { marginBottom: 8 }, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { children: [
        /* @__PURE__ */ e("th", { children: "Name" }),
        /* @__PURE__ */ e("th", { children: "Label" }),
        /* @__PURE__ */ e("th", { children: "Type" }),
        /* @__PURE__ */ e("th", { children: "Req" }),
        /* @__PURE__ */ e("th", {})
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: [...k].sort((l, g) => (l.display_order || l.DISPLAY_ORDER || 0) - (g.display_order || g.DISPLAY_ORDER || 0)).map((l) => {
        const g = l.id || l.ID, v = l.name || l.NAME, p = l.label || l.LABEL || v, C = l.data_type || l.DATA_TYPE || "STRING", y = !!(l.required || l.REQUIRED);
        return /* @__PURE__ */ i("tr", { children: [
          /* @__PURE__ */ e("td", { className: "settings-td-mono", children: v }),
          /* @__PURE__ */ e("td", { children: p }),
          /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: C }) }),
          /* @__PURE__ */ e("td", { style: { color: y ? "var(--success)" : "var(--muted)" }, children: y ? "✓" : "—" }),
          /* @__PURE__ */ e("td", { children: /* @__PURE__ */ i("div", { style: { display: "flex", gap: 4 }, children: [
            r && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => X(l), children: /* @__PURE__ */ e(pe, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
            r && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: () => Z(l), children: /* @__PURE__ */ e(ae, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
          ] }) })
        ] }, g);
      }) })
    ] }),
    k.length === 0 && !u && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No attributes" }),
    u ? /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: 8, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: 12, marginTop: 4 }, children: [
      /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
        /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, placeholder: "Name (key) *", value: u.name || "", onChange: (l) => m((g) => ({ ...g, name: l.target.value })) }),
        /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Label (display) *", value: u.label || "", onChange: (l) => m((g) => ({ ...g, label: l.target.value })) })
      ] }),
      /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 8 }, children: [
        /* @__PURE__ */ e("select", { className: "field-input", value: u.dataType || "STRING", onChange: (l) => m((g) => ({ ...g, dataType: l.target.value })), children: Ve.map((l) => /* @__PURE__ */ e("option", { value: l, children: l }, l)) }),
        /* @__PURE__ */ e("select", { className: "field-input", value: u.widgetType || "TEXT", onChange: (l) => m((g) => ({ ...g, widgetType: l.target.value })), children: Ge.map((l) => /* @__PURE__ */ e("option", { value: l, children: l }, l)) }),
        /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", placeholder: "Order", value: u.displayOrder ?? "", onChange: (l) => m((g) => ({ ...g, displayOrder: l.target.value })) })
      ] }),
      u.dataType === "ENUM" && /* @__PURE__ */ e(
        qe,
        {
          userId: t,
          enumDefinitionId: u.enumDefinitionId || null,
          onChange: (l) => m((g) => ({ ...g, enumDefinitionId: l }))
        }
      ),
      /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Default value (optional)", value: u.defaultValue || "", onChange: (l) => m((g) => ({ ...g, defaultValue: l.target.value })) }),
      /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Validation regex (optional)", value: u.namingRegex || "", onChange: (l) => m((g) => ({ ...g, namingRegex: l.target.value })) }),
      u.dataType !== "ENUM" && /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Allowed values comma-separated (optional)", value: u.allowedValues || "", onChange: (l) => m((g) => ({ ...g, allowedValues: l.target.value })) }),
      /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Tooltip (optional)", value: u.tooltip || "", onChange: (l) => m((g) => ({ ...g, tooltip: l.target.value })) }),
      /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ i("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12 }, children: [
          /* @__PURE__ */ e("input", { type: "checkbox", checked: !!u.required, onChange: (l) => m((g) => ({ ...g, required: l.target.checked })) }),
          "Required"
        ] }),
        /* @__PURE__ */ i("div", { style: { display: "flex", gap: 6 }, children: [
          /* @__PURE__ */ e("button", { className: "btn", onClick: () => m(null), children: "Cancel" }),
          /* @__PURE__ */ e("button", { className: "btn btn-primary", onClick: w, disabled: B || !((o = u.name) != null && o.trim()) || !((D = u.label) != null && D.trim()), children: B ? "Adding…" : "Add" })
        ] })
      ] })
    ] }) : r ? /* @__PURE__ */ i(
      "button",
      {
        className: "btn btn-sm",
        style: { display: "flex", alignItems: "center", gap: 5, alignSelf: "flex-start", marginTop: 4 },
        onClick: () => m({ dataType: "STRING", widgetType: "TEXT", required: !1 }),
        children: [
          /* @__PURE__ */ e(ge, { size: 11, strokeWidth: 2.5 }),
          "Add attribute"
        ]
      }
    ) : null
  ] });
}
function It({ userId: t, linkTypeId: n, sourceLifecycleId: r, targetLifecycleId: c, canWrite: k, toast: P }) {
  const [u, m] = x(null), [V, Y] = x([]), [O, T] = x([]), [B, h] = x([]), [S, X] = x(null), [J, w] = x(!1), Z = He(
    () => f.getLinkTypeCascades(t, n).then((v) => m(Array.isArray(v) ? v : [])).catch(() => m([])),
    [t, n]
  );
  Se(() => {
    Z();
  }, [Z]);
  function o() {
    const v = [];
    r && V.length === 0 && v.push(f.getLifecycleTransitions(t, r).then((p) => Y(Array.isArray(p) ? p : [])).catch(() => {
    })), c && O.length === 0 && v.push(f.getLifecycleStates(t, c).then((p) => T(Array.isArray(p) ? p : [])).catch(() => {
    })), c && B.length === 0 && v.push(f.getLifecycleTransitions(t, c).then((p) => h(Array.isArray(p) ? p : [])).catch(() => {
    })), Promise.all(v).then(() => X({ parentTransitionId: "", childFromStateId: "", childTransitionId: "" }));
  }
  async function D() {
    if (!(!(S != null && S.parentTransitionId) || !(S != null && S.childFromStateId) || !(S != null && S.childTransitionId))) {
      w(!0);
      try {
        await f.createLinkTypeCascade(t, n, S.parentTransitionId, S.childFromStateId, S.childTransitionId), await Z(), X(null);
      } catch (v) {
        P(v, "error");
      } finally {
        w(!1);
      }
    }
  }
  async function l(v) {
    const p = v.parent_transition_name || v.PARENT_TRANSITION_NAME || v.parent_transition_id, C = v.child_from_state_name || v.CHILD_FROM_STATE_NAME || v.child_from_state_id, y = v.child_transition_name || v.CHILD_TRANSITION_NAME || v.child_transition_id;
    if (window.confirm(`Delete cascade rule "${p} → [${C}] → ${y}"?`))
      try {
        await f.deleteLinkTypeCascade(t, n, v.id || v.ID), await Z();
      } catch (M) {
        P(M, "error");
      }
  }
  const g = (v) => /* @__PURE__ */ e("span", { style: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: v || "#6b7280", flexShrink: 0 } });
  return u === null ? /* @__PURE__ */ e("div", { style: { fontSize: 12, color: "var(--muted)", padding: "4px 0" }, children: "Loading…" }) : !r || !c ? /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "Cascade rules require both source and target node types to have a lifecycle." }) : /* @__PURE__ */ i(ne, { children: [
    u.length > 0 && /* @__PURE__ */ i("table", { className: "settings-table", style: { marginBottom: 8 }, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { children: [
        /* @__PURE__ */ e("th", { children: "Parent transition" }),
        /* @__PURE__ */ e("th", {}),
        /* @__PURE__ */ e("th", { children: "Child state" }),
        /* @__PURE__ */ e("th", {}),
        /* @__PURE__ */ e("th", { children: "Child transition" }),
        /* @__PURE__ */ e("th", {})
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: u.map((v) => {
        const p = v.child_from_state_color || v.CHILD_FROM_STATE_COLOR, C = v.parent_transition_name || v.PARENT_TRANSITION_NAME || v.parent_transition_id, y = v.child_from_state_name || v.CHILD_FROM_STATE_NAME || v.child_from_state_id, M = v.child_transition_name || v.CHILD_TRANSITION_NAME || v.child_transition_id;
        return /* @__PURE__ */ i("tr", { children: [
          /* @__PURE__ */ e("td", { style: { fontSize: 12 }, children: C }),
          /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: "→" }),
          /* @__PURE__ */ e("td", { children: /* @__PURE__ */ i("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            g(p),
            /* @__PURE__ */ e("span", { style: { color: p || "var(--text)", fontSize: 12 }, children: y })
          ] }) }),
          /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: "→" }),
          /* @__PURE__ */ e("td", { style: { fontSize: 12 }, children: M }),
          /* @__PURE__ */ e("td", { children: k && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: () => l(v), children: /* @__PURE__ */ e(ae, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) }) })
        ] }, v.id || v.ID);
      }) })
    ] }),
    u.length === 0 && !S && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No cascade rules — child nodes will not be automatically transitioned." }),
    S ? /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: 8, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }, children: [
      /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 8, alignItems: "center" }, children: [
        /* @__PURE__ */ i("select", { className: "field-input", value: S.parentTransitionId, onChange: (v) => X((p) => ({ ...p, parentTransitionId: v.target.value })), children: [
          /* @__PURE__ */ e("option", { value: "", children: "Parent transition…" }),
          V.map((v) => {
            const p = v.id || v.ID;
            return /* @__PURE__ */ e("option", { value: p, children: v.name || v.NAME || p }, p);
          })
        ] }),
        /* @__PURE__ */ e("span", { style: { color: "var(--muted)", fontSize: 13 }, children: "→" }),
        /* @__PURE__ */ i("select", { className: "field-input", value: S.childFromStateId, onChange: (v) => X((p) => ({ ...p, childFromStateId: v.target.value })), children: [
          /* @__PURE__ */ e("option", { value: "", children: "Child state…" }),
          O.map((v) => {
            const p = v.id || v.ID;
            return /* @__PURE__ */ e("option", { value: p, children: v.name || v.NAME || p }, p);
          })
        ] }),
        /* @__PURE__ */ e("span", { style: { color: "var(--muted)", fontSize: 13 }, children: "→" }),
        /* @__PURE__ */ i("select", { className: "field-input", value: S.childTransitionId, onChange: (v) => X((p) => ({ ...p, childTransitionId: v.target.value })), children: [
          /* @__PURE__ */ e("option", { value: "", children: "Child transition…" }),
          B.map((v) => {
            const p = v.id || v.ID;
            return /* @__PURE__ */ e("option", { value: p, children: v.name || v.NAME || p }, p);
          })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { style: { display: "flex", justifyContent: "flex-end", gap: 6 }, children: [
        /* @__PURE__ */ e("button", { className: "btn", onClick: () => X(null), children: "Cancel" }),
        /* @__PURE__ */ e("button", { className: "btn btn-primary", onClick: D, disabled: J || !S.parentTransitionId || !S.childFromStateId || !S.childTransitionId, children: J ? "Adding…" : "Add Rule" })
      ] })
    ] }) : k ? /* @__PURE__ */ i("button", { className: "btn btn-sm", style: { display: "flex", alignItems: "center", gap: 5, alignSelf: "flex-start", marginTop: 4 }, onClick: o, children: [
      /* @__PURE__ */ e(ge, { size: 11, strokeWidth: 2.5 }),
      "Add rule"
    ] }) : null
  ] });
}
function Et({ userId: t, canWrite: n, toast: r }) {
  const [c, k] = x([]), [P, u] = x(null), [m, V] = x({}), [Y, O] = x({}), [T, B] = x(!0), [h, S] = x([]), [X, J] = x([]), [w, Z] = x(null), [o, D] = x({}), [l, g] = x(!1);
  function v() {
    return f.getNodeTypes(t).then((a) => k(Array.isArray(a) ? a : []));
  }
  Se(() => {
    v().finally(() => B(!1)), f.getLifecycles(t).then((a) => S(Array.isArray(a) ? a : [])), f.getSources(t).then((a) => J(Array.isArray(a) ? a : []));
  }, [t]), Ue("/topic/metamodel", (a) => {
    a.event === "METAMODEL_CHANGED" && v();
  }, t);
  const p = {};
  c.forEach((a) => {
    p[a.id || a.ID] = a.name || a.NAME;
  });
  async function C(a) {
    const d = a.id || a.ID;
    if (P === d) {
      u(null);
      return;
    }
    u(d);
    const $ = [];
    m[d] || $.push(
      f.getNodeTypeAttributes(t, d).then((U) => V((F) => ({ ...F, [d]: Array.isArray(U) ? U : [] }))).catch(() => V((U) => ({ ...U, [d]: [] })))
    ), Y[d] || $.push(
      f.getNodeTypeLinkTypes(t, d).then((U) => O((F) => ({ ...F, [d]: Array.isArray(U) ? U : [] }))).catch(() => O((U) => ({ ...U, [d]: [] })))
    ), await Promise.all($);
  }
  function y(a, d = {}, $ = {}) {
    D($), Z({ type: a, ctx: d });
  }
  function M() {
    Z(null), D({});
  }
  async function Q() {
    var a, d, $, U, F, oe, le, be, Ne, he, re, ve, de, Te, Ae, xe, we, _, s;
    g(!0);
    try {
      const { type: z, ctx: q } = w;
      if (z === "create-nodetype")
        await f.createNodeType(t, {
          name: (a = o.name) == null ? void 0 : a.trim(),
          description: ((d = o.description) == null ? void 0 : d.trim()) || null,
          lifecycleId: o.lifecycleId || null,
          numberingScheme: o.numberingScheme || "ALPHA_NUMERIC",
          versionPolicy: o.versionPolicy || "ITERATE",
          color: o.color || null,
          icon: o.icon || null,
          parentNodeTypeId: o.parentNodeTypeId || null
        }), await v();
      else if (z === "edit-identity")
        await f.updateNodeTypeIdentity(t, q.nodeTypeId, {
          logicalIdLabel: o.logicalIdLabel || "Identifier",
          logicalIdPattern: (($ = o.logicalIdPattern) == null ? void 0 : $.trim()) || null
        }), await v(), u(null);
      else if (z === "edit-appearance")
        await f.updateNodeTypeAppearance(t, q.nodeTypeId, o.color || null, o.icon || null), await v(), u(null);
      else if (z === "edit-lifecycle")
        await f.updateNodeTypeLifecycle(t, q.nodeTypeId, o.lifecycleId || null), await v(), u(null);
      else if (z === "edit-versioning")
        await Promise.all([
          f.updateNodeTypeNumberingScheme(t, q.nodeTypeId, o.numberingScheme || "ALPHA_NUMERIC"),
          f.updateNodeTypeVersionPolicy(t, q.nodeTypeId, o.versionPolicy || "ITERATE")
        ]), await v(), u(null);
      else if (z === "create-attr") {
        await f.createAttribute(t, q.nodeTypeId, {
          name: (U = o.name) == null ? void 0 : U.trim(),
          label: (F = o.label) == null ? void 0 : F.trim(),
          dataType: o.dataType || "STRING",
          widgetType: o.widgetType || "TEXT",
          required: !!o.required,
          asName: !!o.asName,
          enumDefinitionId: o.dataType === "ENUM" && o.enumDefinitionId || null,
          displaySection: ((oe = o.displaySection) == null ? void 0 : oe.trim()) || null,
          displayOrder: o.displayOrder !== "" ? Number(o.displayOrder) : 0,
          defaultValue: ((le = o.defaultValue) == null ? void 0 : le.trim()) || null,
          namingRegex: ((be = o.namingRegex) == null ? void 0 : be.trim()) || null,
          allowedValues: o.dataType !== "ENUM" && ((Ne = o.allowedValues) == null ? void 0 : Ne.trim()) || null,
          tooltip: ((he = o.tooltip) == null ? void 0 : he.trim()) || null
        });
        const H = await f.getNodeTypeAttributes(t, q.nodeTypeId);
        V((G) => ({ ...G, [q.nodeTypeId]: Array.isArray(H) ? H : [] }));
      } else if (z === "edit-attr") {
        await f.updateAttribute(t, q.nodeTypeId, q.attrId, {
          label: (re = o.label) == null ? void 0 : re.trim(),
          dataType: o.dataType || "STRING",
          widgetType: o.widgetType || "TEXT",
          required: !!o.required,
          asName: !!o.asName,
          enumDefinitionId: o.dataType === "ENUM" && o.enumDefinitionId || null,
          displaySection: ((ve = o.displaySection) == null ? void 0 : ve.trim()) || null,
          displayOrder: o.displayOrder !== "" ? Number(o.displayOrder) : 0,
          defaultValue: ((de = o.defaultValue) == null ? void 0 : de.trim()) || null,
          namingRegex: ((Te = o.namingRegex) == null ? void 0 : Te.trim()) || null,
          allowedValues: o.dataType !== "ENUM" && ((Ae = o.allowedValues) == null ? void 0 : Ae.trim()) || null,
          tooltip: ((xe = o.tooltip) == null ? void 0 : xe.trim()) || null
        });
        const H = await f.getNodeTypeAttributes(t, q.nodeTypeId);
        V((G) => ({ ...G, [q.nodeTypeId]: Array.isArray(H) ? H : [] }));
      } else if (z === "create-link") {
        const H = o.targetSourceId || "SELF", G = H === "SELF" ? o.targetNodeTypeId || null : o.targetType || null;
        await f.createLinkType(t, {
          name: (we = o.name) == null ? void 0 : we.trim(),
          sourceNodeTypeId: q.nodeTypeId,
          targetSourceId: H,
          targetType: G,
          linkPolicy: o.linkPolicy || "VERSION_TO_MASTER",
          minCardinality: Number(o.minCardinality) || 0,
          maxCardinality: o.maxCardinality !== "" ? Number(o.maxCardinality) : null,
          color: o.color || null
        });
        const j = await f.getNodeTypeLinkTypes(t, q.nodeTypeId);
        O((A) => ({ ...A, [q.nodeTypeId]: Array.isArray(j) ? j : [] }));
      } else if (z === "edit-link") {
        const H = o.targetSourceId || "SELF", G = H === "SELF" ? o.targetNodeTypeId || null : o.targetType || null;
        await f.updateLinkType(t, q.linkTypeId, {
          name: (_ = o.name) == null ? void 0 : _.trim(),
          description: ((s = o.description) == null ? void 0 : s.trim()) || null,
          linkPolicy: o.linkPolicy || "VERSION_TO_MASTER",
          minCardinality: Number(o.minCardinality) || 0,
          maxCardinality: o.maxCardinality !== "" && o.maxCardinality != null ? Number(o.maxCardinality) : null,
          color: o.color || null,
          targetSourceId: H,
          targetNodeTypeId: G
        });
        const j = await f.getNodeTypeLinkTypes(t, q.nodeTypeId);
        O((A) => ({ ...A, [q.nodeTypeId]: Array.isArray(j) ? j : [] }));
      } else z === "edit-parent" && (await f.updateNodeTypeParent(t, q.nodeTypeId, o.parentNodeTypeId || null), await v(), u(null));
      M();
    } catch (z) {
      r(z, "error");
    } finally {
      g(!1);
    }
  }
  async function E(a, d) {
    if (a.stopPropagation(), !!window.confirm(`Delete node type "${d.name || d.NAME}"?

This also deletes all its attributes and link types. Cannot be undone.`))
      try {
        await f.deleteNodeType(t, d.id || d.ID), await v(), P === (d.id || d.ID) && u(null);
      } catch ($) {
        r($, "error");
      }
  }
  async function N(a, d, $) {
    if (a.stopPropagation(), !!window.confirm(`Delete attribute "${$.label || $.LABEL || $.name || $.NAME}"?`))
      try {
        await f.deleteAttribute(t, d, $.id || $.ID);
        const U = await f.getNodeTypeAttributes(t, d);
        V((F) => ({ ...F, [d]: Array.isArray(U) ? U : [] }));
      } catch (U) {
        r(U, "error");
      }
  }
  async function W(a, d, $) {
    if (a.stopPropagation(), !!window.confirm(`Delete link type "${$.name || $.NAME}"?`))
      try {
        await f.deleteLinkType(t, $.id || $.ID);
        const U = await f.getNodeTypeLinkTypes(t, d);
        O((F) => ({ ...F, [d]: Array.isArray(U) ? U : [] }));
      } catch (U) {
        r(U, "error");
      }
  }
  const ie = () => {
    var d, $, U, F, oe, le;
    if (!w || l) return !0;
    const { type: a } = w;
    return a === "create-nodetype" ? !((d = o.name) != null && d.trim()) : a === "create-attr" ? !(($ = o.name) != null && $.trim()) || !((U = o.label) != null && U.trim()) : a === "edit-attr" ? !((F = o.label) != null && F.trim()) : a === "create-link" ? !((oe = o.name) != null && oe.trim()) || !o.targetNodeTypeId : a === "edit-link" ? !((le = o.name) != null && le.trim()) : !1;
  };
  return T ? /* @__PURE__ */ e("div", { className: "settings-loading", children: "Loading…" }) : /* @__PURE__ */ i("div", { className: "settings-list", children: [
    w && /* @__PURE__ */ i(
      De,
      {
        title: w.type === "create-nodetype" ? "New Node Type" : w.type === "edit-identity" ? "Edit Identifier" : w.type === "edit-parent" ? "Change Parent" : w.type === "create-attr" ? "Add Attribute" : w.type === "edit-attr" ? "Edit Attribute" : w.type === "create-link" ? "Add Link Type" : w.type === "edit-link" ? `Edit Link Type — ${w.ctx.linkName}` : "",
        width: w.type === "edit-link" ? 620 : 480,
        onClose: M,
        onSave: Q,
        saving: ie(),
        saveLabel: ["edit-identity", "edit-attr", "edit-link", "edit-parent"].includes(w.type) ? "Update" : "Create",
        children: [
          w.type === "create-nodetype" && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ e(b, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: o.name || "", onChange: (a) => D((d) => ({ ...d, name: a.target.value })), placeholder: "e.g. Assembly" }) }),
            /* @__PURE__ */ e(b, { label: "Description", children: /* @__PURE__ */ e("input", { className: "field-input", value: o.description || "", onChange: (a) => D((d) => ({ ...d, description: a.target.value })), placeholder: "Optional description" }) }),
            /* @__PURE__ */ e(b, { label: "Lifecycle", children: /* @__PURE__ */ i("select", { className: "field-input", value: o.lifecycleId || "", onChange: (a) => D((d) => ({ ...d, lifecycleId: a.target.value })), children: [
              /* @__PURE__ */ e("option", { value: "", children: "None" }),
              h.map((a) => {
                const d = a.id || a.ID;
                return /* @__PURE__ */ e("option", { value: d, children: a.name || a.NAME || d }, d);
              })
            ] }) }),
            /* @__PURE__ */ e(b, { label: "Numbering Scheme", children: /* @__PURE__ */ e("select", { className: "field-input", value: o.numberingScheme || "ALPHA_NUMERIC", onChange: (a) => D((d) => ({ ...d, numberingScheme: a.target.value })), children: Ke.map((a) => /* @__PURE__ */ e("option", { value: a, children: a }, a)) }) }),
            /* @__PURE__ */ e(b, { label: "Version Policy", children: /* @__PURE__ */ e("select", { className: "field-input", value: o.versionPolicy || "ITERATE", onChange: (a) => D((d) => ({ ...d, versionPolicy: a.target.value })), children: Qe.map((a) => /* @__PURE__ */ e("option", { value: a, children: a }, a)) }) }),
            /* @__PURE__ */ e(b, { label: "Parent node type (optional)", children: /* @__PURE__ */ i("select", { className: "field-input", value: o.parentNodeTypeId || "", onChange: (a) => D((d) => ({ ...d, parentNodeTypeId: a.target.value })), children: [
              /* @__PURE__ */ e("option", { value: "", children: "None" }),
              c.map((a) => {
                const d = a.id || a.ID;
                return /* @__PURE__ */ e("option", { value: d, children: a.name || a.NAME || d }, d);
              })
            ] }) })
          ] }),
          w.type === "edit-identity" && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ e(b, { label: "Label", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: o.logicalIdLabel || "", onChange: (a) => D((d) => ({ ...d, logicalIdLabel: a.target.value })), placeholder: "Identifier" }) }),
            /* @__PURE__ */ e(b, { label: "Validation Pattern (regex)", children: /* @__PURE__ */ e("input", { className: "field-input", value: o.logicalIdPattern || "", onChange: (a) => D((d) => ({ ...d, logicalIdPattern: a.target.value })), placeholder: "e.g. ^[A-Z]{2}-\\d{4}$" }) })
          ] }),
          w.type === "edit-parent" && /* @__PURE__ */ e(ne, { children: /* @__PURE__ */ e(b, { label: "Parent node type", children: /* @__PURE__ */ i("select", { className: "field-input", autoFocus: !0, value: o.parentNodeTypeId || "", onChange: (a) => D((d) => ({ ...d, parentNodeTypeId: a.target.value })), children: [
            /* @__PURE__ */ e("option", { value: "", children: "None (root type)" }),
            c.filter((a) => (a.id || a.ID) !== w.ctx.nodeTypeId).map((a) => {
              const d = a.id || a.ID;
              return /* @__PURE__ */ e("option", { value: d, children: a.name || a.NAME || d }, d);
            })
          ] }) }) }),
          w.type === "edit-lifecycle" && /* @__PURE__ */ e(ne, { children: /* @__PURE__ */ e(b, { label: "Lifecycle", children: /* @__PURE__ */ i("select", { className: "field-input", autoFocus: !0, value: o.lifecycleId || "", onChange: (a) => D((d) => ({ ...d, lifecycleId: a.target.value })), children: [
            /* @__PURE__ */ e("option", { value: "", children: "None" }),
            h.map((a) => {
              const d = a.id || a.ID;
              return /* @__PURE__ */ e("option", { value: d, children: a.name || a.NAME || d }, d);
            })
          ] }) }) }),
          w.type === "edit-versioning" && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ e(b, { label: "Numbering Scheme", children: /* @__PURE__ */ e("select", { className: "field-input", autoFocus: !0, value: o.numberingScheme || "ALPHA_NUMERIC", onChange: (a) => D((d) => ({ ...d, numberingScheme: a.target.value })), children: Ke.map((a) => /* @__PURE__ */ e("option", { value: a, children: a }, a)) }) }),
            /* @__PURE__ */ e(b, { label: "Version Policy", children: /* @__PURE__ */ e("select", { className: "field-input", value: o.versionPolicy || "ITERATE", onChange: (a) => D((d) => ({ ...d, versionPolicy: a.target.value })), children: Qe.map((a) => /* @__PURE__ */ e("option", { value: a, children: a }, a)) }) })
          ] }),
          w.type === "edit-appearance" && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ e(ze, { label: "Color", value: o.color || "", onChange: (a) => D((d) => ({ ...d, color: a })) }),
            /* @__PURE__ */ e(dt, { value: o.icon || "", onChange: (a) => D((d) => ({ ...d, icon: a })) })
          ] }),
          w.type === "create-attr" && /* @__PURE__ */ e(Ye, { form: o, setForm: D, userId: t }),
          w.type === "edit-attr" && /* @__PURE__ */ e(Ye, { form: o, setForm: D, autoFocusName: !1, userId: t }),
          w.type === "create-link" && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ e(b, { label: "Link Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: o.name || "", onChange: (a) => D((d) => ({ ...d, name: a.target.value })), placeholder: "e.g. composed_of" }) }),
            /* @__PURE__ */ e(b, { label: "Target Source", children: /* @__PURE__ */ i("select", { className: "field-input", value: o.targetSourceId || "SELF", onChange: (a) => D((d) => ({ ...d, targetSourceId: a.target.value, targetNodeTypeId: "", targetType: "" })), children: [
              /* @__PURE__ */ e("option", { value: "SELF", children: "Self (PSM)" }),
              X.filter((a) => (a.id || a.ID) !== "SELF").map((a) => {
                const d = a.id || a.ID;
                return /* @__PURE__ */ e("option", { value: d, children: a.name || a.NAME || d }, d);
              })
            ] }) }),
            !o.targetSourceId || o.targetSourceId === "SELF" ? /* @__PURE__ */ e(b, { label: "Target Node Type", children: /* @__PURE__ */ i("select", { className: "field-input", value: o.targetNodeTypeId || "", onChange: (a) => D((d) => ({ ...d, targetNodeTypeId: a.target.value })), children: [
              /* @__PURE__ */ e("option", { value: "", children: "Any" }),
              c.map((a) => {
                const d = a.id || a.ID;
                return /* @__PURE__ */ e("option", { value: d, children: a.name || a.NAME || d }, d);
              })
            ] }) }) : /* @__PURE__ */ e(b, { label: "Target Type", children: /* @__PURE__ */ e("input", { className: "field-input", value: o.targetType || "", onChange: (a) => D((d) => ({ ...d, targetType: a.target.value })), placeholder: "Type name in source" }) }),
            /* @__PURE__ */ e(b, { label: "Link Policy", children: /* @__PURE__ */ e("select", { className: "field-input", value: o.linkPolicy || "VERSION_TO_MASTER", onChange: (a) => D((d) => ({ ...d, linkPolicy: a.target.value })), children: Xe.map((a) => /* @__PURE__ */ e("option", { value: a, children: a }, a)) }) }),
            /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
              /* @__PURE__ */ e(b, { label: "Min Cardinality", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: o.minCardinality ?? "0", onChange: (a) => D((d) => ({ ...d, minCardinality: a.target.value })) }) }),
              /* @__PURE__ */ e(b, { label: "Max (blank = unlimited)", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: o.maxCardinality ?? "", onChange: (a) => D((d) => ({ ...d, maxCardinality: a.target.value })), placeholder: "∞" }) })
            ] }),
            /* @__PURE__ */ e(ze, { label: "Color", value: o.color || "", onChange: (a) => D((d) => ({ ...d, color: a })) })
          ] }),
          w.type === "edit-link" && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ e(b, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: o.name || "", onChange: (a) => D((d) => ({ ...d, name: a.target.value })) }) }),
            /* @__PURE__ */ e(b, { label: "Description", children: /* @__PURE__ */ e("input", { className: "field-input", value: o.description || "", onChange: (a) => D((d) => ({ ...d, description: a.target.value })), placeholder: "Optional description" }) }),
            /* @__PURE__ */ e(b, { label: "Target Source", children: /* @__PURE__ */ i("select", { className: "field-input", value: o.targetSourceId || "SELF", onChange: (a) => D((d) => ({ ...d, targetSourceId: a.target.value, targetNodeTypeId: "", targetType: "" })), children: [
              /* @__PURE__ */ e("option", { value: "SELF", children: "Self (PSM)" }),
              X.filter((a) => (a.id || a.ID) !== "SELF").map((a) => {
                const d = a.id || a.ID;
                return /* @__PURE__ */ e("option", { value: d, children: a.name || a.NAME || d }, d);
              })
            ] }) }),
            !o.targetSourceId || o.targetSourceId === "SELF" ? /* @__PURE__ */ e(b, { label: "Target Node Type", children: /* @__PURE__ */ i("select", { className: "field-input", value: o.targetNodeTypeId || "", onChange: (a) => D((d) => ({ ...d, targetNodeTypeId: a.target.value })), children: [
              /* @__PURE__ */ e("option", { value: "", children: "Any" }),
              c.map((a) => {
                const d = a.id || a.ID;
                return /* @__PURE__ */ e("option", { value: d, children: a.name || a.NAME || d }, d);
              })
            ] }) }) : /* @__PURE__ */ e(b, { label: "Target Type", children: /* @__PURE__ */ e("input", { className: "field-input", value: o.targetType || "", onChange: (a) => D((d) => ({ ...d, targetType: a.target.value })), placeholder: "Type name in source" }) }),
            /* @__PURE__ */ e(b, { label: "Link Policy", children: /* @__PURE__ */ e("select", { className: "field-input", value: o.linkPolicy || "VERSION_TO_MASTER", onChange: (a) => D((d) => ({ ...d, linkPolicy: a.target.value })), children: Xe.map((a) => /* @__PURE__ */ e("option", { value: a, children: a }, a)) }) }),
            /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
              /* @__PURE__ */ e(b, { label: "Min Cardinality", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: o.minCardinality ?? "0", onChange: (a) => D((d) => ({ ...d, minCardinality: a.target.value })) }) }),
              /* @__PURE__ */ e(b, { label: "Max (blank = unlimited)", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: o.maxCardinality ?? "", onChange: (a) => D((d) => ({ ...d, maxCardinality: a.target.value })), placeholder: "∞" }) })
            ] }),
            /* @__PURE__ */ e(ze, { label: "Color", value: o.color || "", onChange: (a) => D((d) => ({ ...d, color: a })) }),
            /* @__PURE__ */ e(Je, { label: "Attributes" }),
            /* @__PURE__ */ e(Tt, { userId: t, linkTypeId: w.ctx.linkTypeId, canWrite: n, toast: r }),
            /* @__PURE__ */ e(Je, { label: "Cascade Rules" }),
            (() => {
              const a = c.find(($) => ($.id || $.ID) === w.ctx.nodeTypeId), d = c.find(($) => ($.id || $.ID) === w.ctx.targetNodeTypeId);
              return /* @__PURE__ */ e(
                It,
                {
                  userId: t,
                  linkTypeId: w.ctx.linkTypeId,
                  sourceLifecycleId: (a == null ? void 0 : a.lifecycle_id) || (a == null ? void 0 : a.LIFECYCLE_ID),
                  targetLifecycleId: (d == null ? void 0 : d.lifecycle_id) || (d == null ? void 0 : d.LIFECYCLE_ID),
                  canWrite: n,
                  toast: r
                }
              );
            })()
          ] })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: n && /* @__PURE__ */ i(
      "button",
      {
        className: "btn btn-sm",
        style: { display: "flex", alignItems: "center", gap: 5 },
        onClick: () => y("create-nodetype", {}, { lifecycleId: h[0] ? h[0].id || h[0].ID : "", numberingScheme: "ALPHA_NUMERIC", versionPolicy: "ITERATE" }),
        children: [
          /* @__PURE__ */ e(ge, { size: 11, strokeWidth: 2.5 }),
          "New node type"
        ]
      }
    ) }),
    c.map((a) => {
      var _;
      const d = a.id || a.ID, $ = a.name || a.NAME || d, U = P === d, F = m[d] || [], oe = Y[d] || [], le = a.logical_id_label || a.LOGICAL_ID_LABEL || "Identifier", be = a.logical_id_pattern || a.LOGICAL_ID_PATTERN || "", Ne = a.numbering_scheme || a.NUMBERING_SCHEME || "ALPHA_NUMERIC", he = a.version_policy || a.VERSION_POLICY || "ITERATE", re = a.lifecycle_id || a.LIFECYCLE_ID || null, ve = ((_ = h.find((s) => (s.id || s.ID) === re)) == null ? void 0 : _.name) || re || "—", de = a.color || a.COLOR || null, Te = a.icon || a.ICON || null, Ae = Te ? Me[Te] : null, xe = a.parent_node_type_id || a.PARENT_NODE_TYPE_ID || null, we = xe ? p[xe] || xe : null;
      return /* @__PURE__ */ i("div", { className: "settings-card", children: [
        /* @__PURE__ */ i("div", { className: "settings-card-hd", onClick: () => C(a), style: { display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ e("span", { className: "settings-card-chevron", children: U ? /* @__PURE__ */ e(Re, { size: 13, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(Oe, { size: 13, strokeWidth: 2, color: "var(--muted)" }) }),
          Ae ? /* @__PURE__ */ e(Ae, { size: 14, strokeWidth: 2, color: de || "var(--muted)", style: { marginRight: 4, flexShrink: 0 } }) : de ? /* @__PURE__ */ e("span", { style: { width: 10, height: 10, borderRadius: "50%", background: de, flexShrink: 0, marginRight: 4 } }) : null,
          /* @__PURE__ */ e("span", { className: "settings-card-name", children: $ }),
          /* @__PURE__ */ e("span", { className: "settings-card-id", children: d }),
          n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete node type", style: { marginLeft: "auto" }, onClick: (s) => E(s, a), children: /* @__PURE__ */ e(ae, { size: 12, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
        ] }),
        U && /* @__PURE__ */ i("div", { className: "settings-card-body", children: [
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Inheritance" }),
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Change parent", onClick: () => y("edit-parent", { nodeTypeId: d }, { parentNodeTypeId: xe || "" }), children: /* @__PURE__ */ e(pe, { size: 12, strokeWidth: 2, color: "var(--accent)" }) })
          ] }),
          /* @__PURE__ */ e("table", { className: "settings-table", children: /* @__PURE__ */ e("tbody", { children: /* @__PURE__ */ i("tr", { children: [
            /* @__PURE__ */ e("td", { style: { color: "var(--muted)", width: 110 }, children: "Inherits from" }),
            /* @__PURE__ */ e("td", { children: we ? /* @__PURE__ */ e("span", { className: "settings-badge", children: we }) : /* @__PURE__ */ e("span", { style: { color: "var(--muted2)" }, children: "—" }) })
          ] }) }) }),
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Identifier" }),
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit identifier", onClick: () => y("edit-identity", { nodeTypeId: d }, { logicalIdLabel: le, logicalIdPattern: be }), children: /* @__PURE__ */ e(pe, { size: 12, strokeWidth: 2, color: "var(--accent)" }) })
          ] }),
          /* @__PURE__ */ e("table", { className: "settings-table", children: /* @__PURE__ */ i("tbody", { children: [
            /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)", width: 110 }, children: "Label" }),
              /* @__PURE__ */ e("td", { className: "settings-td-mono", children: le })
            ] }),
            /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: "Pattern" }),
              /* @__PURE__ */ e("td", { className: "settings-td-mono", children: be || "—" })
            ] })
          ] }) }),
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Lifecycle" }),
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Change lifecycle", onClick: () => y("edit-lifecycle", { nodeTypeId: d }, { lifecycleId: re || "" }), children: /* @__PURE__ */ e(pe, { size: 12, strokeWidth: 2, color: "var(--accent)" }) })
          ] }),
          /* @__PURE__ */ e("table", { className: "settings-table", children: /* @__PURE__ */ e("tbody", { children: /* @__PURE__ */ i("tr", { children: [
            /* @__PURE__ */ e("td", { style: { color: "var(--muted)", width: 110 }, children: "Lifecycle" }),
            /* @__PURE__ */ e("td", { children: re ? /* @__PURE__ */ e("span", { className: "settings-badge", children: ve }) : /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "—" }) })
          ] }) }) }),
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Versioning" }),
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit versioning", onClick: () => y("edit-versioning", { nodeTypeId: d }, { numberingScheme: Ne, versionPolicy: he }), children: /* @__PURE__ */ e(pe, { size: 12, strokeWidth: 2, color: "var(--accent)" }) })
          ] }),
          /* @__PURE__ */ e("table", { className: "settings-table", children: /* @__PURE__ */ i("tbody", { children: [
            /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)", width: 110 }, children: "Numbering" }),
              /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: Ne }) })
            ] }),
            /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: "Policy" }),
              /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: he }) })
            ] })
          ] }) }),
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Appearance" }),
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit appearance", onClick: () => y("edit-appearance", { nodeTypeId: d }, { color: de || "", icon: Te || "" }), children: /* @__PURE__ */ e(pe, { size: 12, strokeWidth: 2, color: "var(--accent)" }) })
          ] }),
          /* @__PURE__ */ e("table", { className: "settings-table", children: /* @__PURE__ */ i("tbody", { children: [
            /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)", width: 110 }, children: "Color" }),
              /* @__PURE__ */ e("td", { children: de ? /* @__PURE__ */ i("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
                /* @__PURE__ */ e("span", { style: { width: 12, height: 12, borderRadius: 3, background: de, display: "inline-block" } }),
                /* @__PURE__ */ e("span", { className: "settings-td-mono", style: { fontSize: 10 }, children: de })
              ] }) : /* @__PURE__ */ e("span", { style: { color: "var(--muted2)" }, children: "—" }) })
            ] }),
            /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: "Icon" }),
              /* @__PURE__ */ e("td", { children: Ae ? /* @__PURE__ */ i("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
                /* @__PURE__ */ e(Ae, { size: 13, strokeWidth: 2, color: de || "var(--muted)" }),
                /* @__PURE__ */ e("span", { style: { fontSize: 10, color: "var(--muted)" }, children: Te })
              ] }) : /* @__PURE__ */ e("span", { style: { color: "var(--muted2)" }, children: "—" }) })
            ] })
          ] }) }),
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Attributes" }),
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Add attribute", onClick: () => y("create-attr", { nodeTypeId: d }, { dataType: "STRING", widgetType: "TEXT", required: !1, asName: !1 }), children: /* @__PURE__ */ e(ge, { size: 12, strokeWidth: 2.5, color: "var(--accent)" }) })
          ] }),
          F.length === 0 ? /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No attributes defined" }) : /* @__PURE__ */ i("table", { className: "settings-table", children: [
            /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("th", { children: "Name" }),
              /* @__PURE__ */ e("th", { children: "Label" }),
              /* @__PURE__ */ e("th", { children: "Type" }),
              /* @__PURE__ */ e("th", { children: "Req" }),
              /* @__PURE__ */ e("th", { children: "As Name" }),
              /* @__PURE__ */ e("th", { children: "Section" }),
              /* @__PURE__ */ e("th", {})
            ] }) }),
            /* @__PURE__ */ e("tbody", { children: [...F].sort((s, z) => (s.display_order || s.DISPLAY_ORDER || 0) - (z.display_order || z.DISPLAY_ORDER || 0)).map((s) => {
              const z = s.id || s.ID, q = s.name || s.NAME, H = s.label || s.LABEL || q, G = s.widget_type || s.WIDGET_TYPE || "TEXT", j = !!(s.required || s.REQUIRED), A = !!(s.as_name || s.AS_NAME), L = s.display_section || s.DISPLAY_SECTION || "—", te = !!(s.inherited || s.INHERITED), se = s.inherited_from || s.INHERITED_FROM || null;
              return /* @__PURE__ */ i("tr", { children: [
                /* @__PURE__ */ e("td", { className: "settings-td-mono", children: /* @__PURE__ */ i("span", { style: { display: "flex", alignItems: "center", gap: 5 }, children: [
                  q,
                  te && /* @__PURE__ */ i("span", { style: { fontSize: 9, background: "var(--accent-dim,rgba(99,179,237,.15))", color: "var(--accent)", borderRadius: 3, padding: "1px 4px", whiteSpace: "nowrap" }, children: [
                    "from ",
                    se || "parent"
                  ] })
                ] }) }),
                /* @__PURE__ */ e("td", { children: H }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: G }) }),
                /* @__PURE__ */ e("td", { style: { color: j ? "var(--success)" : "var(--muted)" }, children: j ? "✓" : "—" }),
                /* @__PURE__ */ e("td", { style: { color: A ? "var(--accent)" : "var(--muted)", fontWeight: A ? 600 : 400 }, children: A ? "★" : "—" }),
                /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: L }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ i("div", { style: { display: "flex", gap: 4 }, children: [
                  n && !te && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => y("edit-attr", { nodeTypeId: d, attrId: z }, {
                    name: q,
                    label: H,
                    dataType: s.data_type || s.DATA_TYPE || "STRING",
                    widgetType: s.widget_type || s.WIDGET_TYPE || "TEXT",
                    required: j,
                    asName: A,
                    enumDefinitionId: s.enum_definition_id || s.ENUM_DEFINITION_ID || null,
                    displaySection: s.display_section || s.DISPLAY_SECTION || "",
                    displayOrder: s.display_order ?? s.DISPLAY_ORDER ?? "",
                    defaultValue: s.default_value || s.DEFAULT_VALUE || "",
                    namingRegex: s.naming_regex || s.NAMING_REGEX || "",
                    allowedValues: s.allowed_values || s.ALLOWED_VALUES || "",
                    tooltip: s.tooltip || s.TOOLTIP || ""
                  }), children: /* @__PURE__ */ e(pe, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                  n && !te && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: (me) => N(me, d, s), children: /* @__PURE__ */ e(ae, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
                ] }) })
              ] }, z);
            }) })
          ] }),
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Outgoing Links" }),
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Add link type", onClick: () => y("create-link", { nodeTypeId: d }, { linkPolicy: "VERSION_TO_MASTER", minCardinality: "0", targetSourceId: "SELF", targetNodeTypeId: c[0] ? c[0].id || c[0].ID : "" }), children: /* @__PURE__ */ e(ge, { size: 12, strokeWidth: 2.5, color: "var(--accent)" }) })
          ] }),
          oe.length === 0 ? /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No outgoing links defined" }) : /* @__PURE__ */ i("table", { className: "settings-table", children: [
            /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("th", {}),
              /* @__PURE__ */ e("th", { children: "Name" }),
              /* @__PURE__ */ e("th", { children: "Target" }),
              /* @__PURE__ */ e("th", { children: "Policy" }),
              /* @__PURE__ */ e("th", { children: "Cardinality" }),
              /* @__PURE__ */ e("th", {})
            ] }) }),
            /* @__PURE__ */ e("tbody", { children: oe.map((s) => {
              const z = s.id || s.ID, q = s.name || s.NAME || z, H = s.target_source_id || s.TARGET_SOURCE_ID || "SELF", G = s.target_type || s.TARGET_TYPE, j = G ? H === "SELF" ? p[G] || G : `${H}:${G}` : "Any", A = s.link_policy || s.LINK_POLICY || "—", L = s.min_cardinality ?? s.MIN_CARDINALITY ?? 0, te = s.max_cardinality ?? s.MAX_CARDINALITY, se = te == null ? `${L}..*` : `${L}..${te}`, me = s.color || s.COLOR || null, ce = !!(s.inherited || s.INHERITED), fe = s.inherited_from || s.INHERITED_FROM || null;
              return /* @__PURE__ */ i("tr", { style: ce ? { opacity: 0.75 } : void 0, children: [
                /* @__PURE__ */ e("td", { style: { width: 18 }, children: /* @__PURE__ */ e("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: me || "var(--border)" } }) }),
                /* @__PURE__ */ e("td", { className: "settings-td-mono", children: /* @__PURE__ */ i("span", { style: { display: "flex", alignItems: "center", gap: 5 }, children: [
                  q,
                  ce && /* @__PURE__ */ i("span", { style: { fontSize: 9, background: "var(--accent-dim,rgba(99,179,237,.15))", color: "var(--accent)", borderRadius: 3, padding: "1px 4px", whiteSpace: "nowrap" }, children: [
                    "from ",
                    fe || "parent"
                  ] })
                ] }) }),
                /* @__PURE__ */ e("td", { children: j }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: A }) }),
                /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: se }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ i("div", { style: { display: "flex", gap: 4 }, children: [
                  n && !ce && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit link type", onClick: () => y("edit-link", { nodeTypeId: d, linkTypeId: z, linkName: q, targetNodeTypeId: G }, {
                    name: q,
                    description: s.description || s.DESCRIPTION || "",
                    linkPolicy: A,
                    minCardinality: String(L),
                    maxCardinality: te != null ? String(te) : "",
                    color: me || "",
                    targetSourceId: H,
                    targetNodeTypeId: G || "",
                    targetType: H !== "SELF" && G || ""
                  }), children: /* @__PURE__ */ e(pe, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                  n && !ce && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete link type", onClick: (Ie) => W(Ie, d, s), children: /* @__PURE__ */ e(ae, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
                ] }) })
              ] }, z);
            }) })
          ] })
        ] })
      ] }, d);
    })
  ] });
}
function Ct({ userId: t, canWrite: n, toast: r }) {
  const [c, k] = x([]), [P, u] = x(null), [m, V] = x({}), [Y, O] = x(!0), [T, B] = x(null), [h, S] = x({}), [X, J] = x(!1);
  function w() {
    return f.getDomains(t).then((p) => k(Array.isArray(p) ? p : []));
  }
  Se(() => {
    w().finally(() => O(!1));
  }, [t]), Ue("/topic/metamodel", (p) => {
    p.event === "METAMODEL_CHANGED" && w();
  }, t);
  async function Z(p) {
    const C = p.id;
    if (P === C) {
      u(null);
      return;
    }
    if (u(C), !m[C])
      try {
        const y = await f.getDomainAttributes(t, C);
        V((M) => ({ ...M, [C]: Array.isArray(y) ? y : [] }));
      } catch {
        V((y) => ({ ...y, [C]: [] }));
      }
  }
  function o(p, C = {}, y = {}) {
    S(y), B({ type: p, ctx: C });
  }
  function D() {
    B(null), S({});
  }
  async function l() {
    var p, C, y, M, Q, E, N, W, ie, a, d, $, U, F, oe, le, be, Ne;
    J(!0);
    try {
      const { type: he, ctx: re } = T;
      if (he === "create-domain")
        await f.createDomain(t, { name: (p = h.name) == null ? void 0 : p.trim(), description: ((C = h.description) == null ? void 0 : C.trim()) || null, color: h.color || null, icon: h.icon || null }), await w();
      else if (he === "edit-domain")
        await f.updateDomain(t, re.domainId, { name: (y = h.name) == null ? void 0 : y.trim(), description: ((M = h.description) == null ? void 0 : M.trim()) || null, color: h.color || null, icon: h.icon || null }), await w();
      else if (he === "create-attr") {
        await f.createDomainAttribute(t, re.domainId, {
          name: (Q = h.name) == null ? void 0 : Q.trim(),
          label: (E = h.label) == null ? void 0 : E.trim(),
          dataType: h.dataType || "STRING",
          widgetType: h.widgetType || "TEXT",
          required: !!h.required,
          enumDefinitionId: h.dataType === "ENUM" && h.enumDefinitionId || null,
          displaySection: ((N = h.displaySection) == null ? void 0 : N.trim()) || null,
          displayOrder: h.displayOrder !== "" ? Number(h.displayOrder) : 0,
          defaultValue: ((W = h.defaultValue) == null ? void 0 : W.trim()) || null,
          namingRegex: ((ie = h.namingRegex) == null ? void 0 : ie.trim()) || null,
          allowedValues: h.dataType !== "ENUM" && ((a = h.allowedValues) == null ? void 0 : a.trim()) || null,
          tooltip: ((d = h.tooltip) == null ? void 0 : d.trim()) || null
        });
        const ve = await f.getDomainAttributes(t, re.domainId);
        V((de) => ({ ...de, [re.domainId]: Array.isArray(ve) ? ve : [] }));
      } else if (he === "edit-attr") {
        await f.updateDomainAttribute(t, re.domainId, re.attrId, {
          name: ($ = h.name) == null ? void 0 : $.trim(),
          label: (U = h.label) == null ? void 0 : U.trim(),
          dataType: h.dataType || "STRING",
          widgetType: h.widgetType || "TEXT",
          required: !!h.required,
          enumDefinitionId: h.dataType === "ENUM" && h.enumDefinitionId || null,
          displaySection: ((F = h.displaySection) == null ? void 0 : F.trim()) || null,
          displayOrder: h.displayOrder !== "" ? Number(h.displayOrder) : 0,
          defaultValue: ((oe = h.defaultValue) == null ? void 0 : oe.trim()) || null,
          namingRegex: ((le = h.namingRegex) == null ? void 0 : le.trim()) || null,
          allowedValues: h.dataType !== "ENUM" && ((be = h.allowedValues) == null ? void 0 : be.trim()) || null,
          tooltip: ((Ne = h.tooltip) == null ? void 0 : Ne.trim()) || null
        });
        const ve = await f.getDomainAttributes(t, re.domainId);
        V((de) => ({ ...de, [re.domainId]: Array.isArray(ve) ? ve : [] }));
      }
      D();
    } catch (he) {
      r(he, "error");
    } finally {
      J(!1);
    }
  }
  async function g(p, C) {
    if (p.stopPropagation(), !!window.confirm(`Delete domain "${C.name}"?

This also deletes all its attributes. Cannot be undone.`))
      try {
        await f.deleteDomain(t, C.id), await w(), P === C.id && u(null);
      } catch (y) {
        r(y, "error");
      }
  }
  async function v(p, C, y) {
    if (p.stopPropagation(), !!window.confirm(`Delete attribute "${y.label || y.name}"?`))
      try {
        await f.deleteDomainAttribute(t, C, y.id);
        const M = await f.getDomainAttributes(t, C);
        V((Q) => ({ ...Q, [C]: Array.isArray(M) ? M : [] }));
      } catch (M) {
        r(M, "error");
      }
  }
  return Y ? /* @__PURE__ */ e("div", { className: "settings-loading", children: "Loading…" }) : /* @__PURE__ */ i("div", { className: "settings-list", children: [
    T && /* @__PURE__ */ i(
      De,
      {
        title: T.type === "create-domain" ? "New Domain" : T.type === "edit-domain" ? "Edit Domain" : T.type === "create-attr" ? "Add Attribute" : "Edit Attribute",
        width: 480,
        onClose: D,
        onSave: l,
        saving: X,
        saveLabel: ["edit-domain", "edit-attr"].includes(T.type) ? "Update" : "Create",
        children: [
          (T.type === "create-domain" || T.type === "edit-domain") && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ e(b, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: h.name || "", onChange: (p) => S((C) => ({ ...C, name: p.target.value })), placeholder: "e.g. Electrical" }) }),
            /* @__PURE__ */ e(b, { label: "Description", children: /* @__PURE__ */ e("input", { className: "field-input", value: h.description || "", onChange: (p) => S((C) => ({ ...C, description: p.target.value })), placeholder: "Optional description" }) }),
            /* @__PURE__ */ e(ze, { label: "Color", value: h.color || "", onChange: (p) => S((C) => ({ ...C, color: p })) })
          ] }),
          T.type === "create-attr" && /* @__PURE__ */ e(Ye, { form: h, setForm: S, hideAsName: !0, userId: t }),
          T.type === "edit-attr" && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ e(b, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: h.name || "", onChange: (p) => S((C) => ({ ...C, name: p.target.value })) }) }),
            /* @__PURE__ */ e(b, { label: "Label (display) *", children: /* @__PURE__ */ e("input", { className: "field-input", value: h.label || "", onChange: (p) => S((C) => ({ ...C, label: p.target.value })) }) }),
            /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
              /* @__PURE__ */ e(b, { label: "Data Type", children: /* @__PURE__ */ e("select", { className: "field-input", value: h.dataType || "STRING", onChange: (p) => S((C) => ({ ...C, dataType: p.target.value })), children: Ve.map((p) => /* @__PURE__ */ e("option", { value: p, children: p }, p)) }) }),
              /* @__PURE__ */ e(b, { label: "Widget", children: /* @__PURE__ */ e("select", { className: "field-input", value: h.widgetType || "TEXT", onChange: (p) => S((C) => ({ ...C, widgetType: p.target.value })), children: Ge.map((p) => /* @__PURE__ */ e("option", { value: p, children: p }, p)) }) })
            ] }),
            h.dataType === "ENUM" && /* @__PURE__ */ e(qe, { userId: t, enumDefinitionId: h.enumDefinitionId || null, onChange: (p) => S((C) => ({ ...C, enumDefinitionId: p })) }),
            /* @__PURE__ */ i("div", { style: { display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }, children: [
              /* @__PURE__ */ e(b, { label: "Section", children: /* @__PURE__ */ e("input", { className: "field-input", value: h.displaySection || "", onChange: (p) => S((C) => ({ ...C, displaySection: p.target.value })) }) }),
              /* @__PURE__ */ e(b, { label: "Order", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: h.displayOrder ?? "", onChange: (p) => S((C) => ({ ...C, displayOrder: p.target.value })) }) })
            ] }),
            /* @__PURE__ */ i("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 }, children: [
              /* @__PURE__ */ e("input", { type: "checkbox", checked: !!h.required, onChange: (p) => S((C) => ({ ...C, required: p.target.checked })) }),
              "Required field"
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: n && /* @__PURE__ */ i("button", { className: "btn btn-sm", style: { display: "flex", alignItems: "center", gap: 5 }, onClick: () => o("create-domain", {}, {}), children: [
      /* @__PURE__ */ e(ge, { size: 11, strokeWidth: 2.5 }),
      "New domain"
    ] }) }),
    c.map((p) => {
      const C = p.id, y = p.name || C, M = P === C, Q = m[C] || [], E = p.color || null;
      return /* @__PURE__ */ i("div", { className: "settings-card", children: [
        /* @__PURE__ */ i("div", { className: "settings-card-hd", onClick: () => Z(p), style: { display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ e("span", { className: "settings-card-chevron", children: M ? /* @__PURE__ */ e(Re, { size: 13, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(Oe, { size: 13, strokeWidth: 2, color: "var(--muted)" }) }),
          E && /* @__PURE__ */ e("span", { style: { width: 10, height: 10, borderRadius: "50%", background: E, flexShrink: 0, marginRight: 4 } }),
          /* @__PURE__ */ e("span", { className: "settings-card-name", children: y }),
          /* @__PURE__ */ e("span", { className: "settings-card-id", children: C }),
          /* @__PURE__ */ i("div", { style: { display: "flex", gap: 4, marginLeft: "auto" }, children: [
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit domain", onClick: (N) => {
              N.stopPropagation(), o("edit-domain", { domainId: C }, { name: p.name, description: p.description || "", color: E || "" });
            }, children: /* @__PURE__ */ e(pe, { size: 12, strokeWidth: 2, color: "var(--accent)" }) }),
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete domain", onClick: (N) => g(N, p), children: /* @__PURE__ */ e(ae, { size: 12, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
          ] })
        ] }),
        M && /* @__PURE__ */ i("div", { className: "settings-card-body", children: [
          p.description && /* @__PURE__ */ e("div", { style: { fontSize: 11, color: "var(--muted)", marginBottom: 8 }, children: p.description }),
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Attributes" }),
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Add attribute", onClick: () => o("create-attr", { domainId: C }, { dataType: "STRING", widgetType: "TEXT", required: !1 }), children: /* @__PURE__ */ e(ge, { size: 12, strokeWidth: 2.5, color: "var(--accent)" }) })
          ] }),
          Q.length === 0 ? /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No attributes defined" }) : /* @__PURE__ */ i("table", { className: "settings-table", children: [
            /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("th", { children: "Name" }),
              /* @__PURE__ */ e("th", { children: "Label" }),
              /* @__PURE__ */ e("th", { children: "Type" }),
              /* @__PURE__ */ e("th", { children: "Req" }),
              /* @__PURE__ */ e("th", { children: "Section" }),
              /* @__PURE__ */ e("th", {})
            ] }) }),
            /* @__PURE__ */ e("tbody", { children: [...Q].sort((N, W) => (N.display_order || 0) - (W.display_order || 0)).map((N) => /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("td", { className: "settings-td-mono", children: N.name }),
              /* @__PURE__ */ e("td", { children: N.label || N.name }),
              /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: N.widget_type || "TEXT" }) }),
              /* @__PURE__ */ e("td", { style: { color: N.required ? "var(--success)" : "var(--muted)" }, children: N.required ? "✓" : "—" }),
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: N.display_section || "—" }),
              /* @__PURE__ */ e("td", { children: /* @__PURE__ */ i("div", { style: { display: "flex", gap: 4 }, children: [
                n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => o("edit-attr", { domainId: C, attrId: N.id }, {
                  name: N.name,
                  label: N.label || N.name,
                  dataType: N.data_type || "STRING",
                  widgetType: N.widget_type || "TEXT",
                  required: !!N.required,
                  enumDefinitionId: N.enum_definition_id || null,
                  displaySection: N.display_section || "",
                  displayOrder: N.display_order ?? "",
                  defaultValue: N.default_value || "",
                  namingRegex: N.naming_regex || "",
                  allowedValues: N.allowed_values || "",
                  tooltip: N.tooltip || ""
                }), children: /* @__PURE__ */ e(pe, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: (W) => v(W, C, N), children: /* @__PURE__ */ e(ae, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
              ] }) })
            ] }, N.id)) })
          ] })
        ] })
      ] }, C);
    }),
    c.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No domains defined yet" })
  ] });
}
function St({ userId: t, canWrite: n, toast: r }) {
  var Q;
  const [c, k] = x([]), [P, u] = x(null), [m, V] = x({}), [Y, O] = x(null), [T, B] = x({}), [h, S] = x(!1), [X, J] = x(null), [w, Z] = x(null), o = He(
    () => f.getEnums(t).then((E) => k(Array.isArray(E) ? E : [])).catch(() => k([])),
    [t]
  );
  Se(() => {
    o();
  }, [o]);
  function D(E) {
    f.getEnumValues(t, E).then((N) => V((W) => ({ ...W, [E]: Array.isArray(N) ? N : [] }))).catch(() => V((N) => ({ ...N, [E]: [] })));
  }
  function l(E) {
    if (P === E) {
      u(null);
      return;
    }
    u(E), m[E] || D(E);
  }
  async function g() {
    var E, N, W, ie;
    S(!0);
    try {
      const { type: a, ctx: d } = Y;
      a === "create-enum" ? (await f.createEnum(t, { name: (E = T.name) == null ? void 0 : E.trim(), description: ((N = T.description) == null ? void 0 : N.trim()) || null }), await o()) : a === "edit-enum" && (await f.updateEnum(t, d.enumId, { name: (W = T.name) == null ? void 0 : W.trim(), description: ((ie = T.description) == null ? void 0 : ie.trim()) || null }), await o()), O(null), B({});
    } catch (a) {
      r(a, "error");
    } finally {
      S(!1);
    }
  }
  async function v(E, N) {
    if (E.stopPropagation(), !!window.confirm(`Delete enumeration "${N.name}"?

This also deletes all its values. Cannot be undone.`))
      try {
        await f.deleteEnum(t, N.id), await o(), P === N.id && u(null);
      } catch (W) {
        r(W, "error");
      }
  }
  async function p(E) {
    var N, W;
    if ((N = X == null ? void 0 : X.value) != null && N.trim()) {
      S(!0);
      try {
        await f.addEnumValue(t, E, { value: X.value.trim(), label: ((W = X.label) == null ? void 0 : W.trim()) || null }), D(E), J(null);
      } catch (ie) {
        r(ie, "error");
      } finally {
        S(!1);
      }
    }
  }
  async function C(E, N) {
    if (window.confirm(`Delete value "${N.value}"?`))
      try {
        await f.deleteEnumValue(t, E, N.id), D(E);
      } catch (W) {
        r(W, "error");
      }
  }
  async function y() {
    var E, N;
    if (w) {
      S(!0);
      try {
        await f.updateEnumValue(t, w.enumId, w.id, {
          value: (E = w.value) == null ? void 0 : E.trim(),
          label: ((N = w.label) == null ? void 0 : N.trim()) || null,
          displayOrder: w.displayOrder ?? 0
        }), D(w.enumId), Z(null);
      } catch (W) {
        r(W, "error");
      } finally {
        S(!1);
      }
    }
  }
  async function M(E, N, W) {
    const ie = m[E];
    if (!ie) return;
    const a = N + W;
    if (a < 0 || a >= ie.length) return;
    const d = [...ie];
    [d[N], d[a]] = [d[a], d[N]], V(($) => ({ ...$, [E]: d }));
    try {
      await f.reorderEnumValues(t, E, d.map(($) => $.id));
    } catch ($) {
      r($, "error"), D(E);
    }
  }
  return /* @__PURE__ */ i("div", { className: "settings-section", children: [
    Y && /* @__PURE__ */ i(
      De,
      {
        title: Y.type === "create-enum" ? "New Enumeration" : "Edit Enumeration",
        width: 420,
        onClose: () => {
          O(null), B({});
        },
        onSave: g,
        saving: h || !((Q = T.name) != null && Q.trim()),
        saveLabel: Y.type === "edit-enum" ? "Update" : "Create",
        children: [
          /* @__PURE__ */ e(b, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: T.name || "", onChange: (E) => B((N) => ({ ...N, name: E.target.value })), placeholder: "e.g. Materials" }) }),
          /* @__PURE__ */ e(b, { label: "Description", children: /* @__PURE__ */ e("input", { className: "field-input", value: T.description || "", onChange: (E) => B((N) => ({ ...N, description: E.target.value })), placeholder: "Optional description" }) })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: n && /* @__PURE__ */ i(
      "button",
      {
        className: "btn btn-sm",
        style: { display: "flex", alignItems: "center", gap: 5 },
        onClick: () => {
          O({ type: "create-enum", ctx: {} }), B({});
        },
        children: [
          /* @__PURE__ */ e(ge, { size: 11, strokeWidth: 2.5 }),
          "New enumeration"
        ]
      }
    ) }),
    c.map((E) => {
      var ie;
      const N = P === E.id, W = m[E.id] || [];
      return /* @__PURE__ */ i("div", { className: "settings-card", children: [
        /* @__PURE__ */ i("div", { className: "settings-card-hd", onClick: () => l(E.id), style: { display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ e("span", { className: "settings-card-chevron", children: N ? /* @__PURE__ */ e(Re, { size: 13, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(Oe, { size: 13, strokeWidth: 2, color: "var(--muted)" }) }),
          /* @__PURE__ */ e("span", { className: "settings-card-name", children: E.name }),
          /* @__PURE__ */ i("span", { className: "settings-badge", style: { marginLeft: 6 }, children: [
            E.valueCount,
            " value",
            E.valueCount !== 1 ? "s" : ""
          ] }),
          E.description && /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--muted)", marginLeft: 8 }, children: E.description }),
          /* @__PURE__ */ i("div", { style: { display: "flex", gap: 4, marginLeft: "auto" }, children: [
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: (a) => {
              a.stopPropagation(), O({ type: "edit-enum", ctx: { enumId: E.id } }), B({ name: E.name, description: E.description || "" });
            }, children: /* @__PURE__ */ e(pe, { size: 12, strokeWidth: 2, color: "var(--accent)" }) }),
            n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: (a) => v(a, E), children: /* @__PURE__ */ e(ae, { size: 12, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
          ] })
        ] }),
        N && /* @__PURE__ */ i("div", { className: "settings-card-body", style: { padding: "8px 16px 12px" }, children: [
          W.length > 0 && /* @__PURE__ */ i("table", { className: "settings-table", style: { marginBottom: 8 }, children: [
            /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("th", { style: { width: 40 }, children: "#" }),
              /* @__PURE__ */ e("th", { children: "Value" }),
              /* @__PURE__ */ e("th", { children: "Label" }),
              /* @__PURE__ */ e("th", { style: { width: 1 } })
            ] }) }),
            /* @__PURE__ */ e("tbody", { children: W.map((a, d) => {
              var U;
              return (w == null ? void 0 : w.id) === a.id ? /* @__PURE__ */ i("tr", { children: [
                /* @__PURE__ */ e("td", { style: { textAlign: "center", color: "var(--muted)", fontSize: 11 }, children: d }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: w.value || "", onChange: (F) => Z((oe) => ({ ...oe, value: F.target.value })), onKeyDown: (F) => {
                  F.key === "Enter" && y(), F.key === "Escape" && Z(null);
                }, style: { fontSize: 12, padding: "2px 6px" } }) }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("input", { className: "field-input", value: w.label || "", onChange: (F) => Z((oe) => ({ ...oe, label: F.target.value })), onKeyDown: (F) => {
                  F.key === "Enter" && y(), F.key === "Escape" && Z(null);
                }, placeholder: "(optional)", style: { fontSize: 12, padding: "2px 6px" } }) }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ i("div", { style: { display: "flex", gap: 4, justifyContent: "flex-end", whiteSpace: "nowrap" }, children: [
                  /* @__PURE__ */ e("button", { className: "btn btn-primary btn-sm", onClick: y, disabled: h || !((U = w.value) != null && U.trim()), style: { fontSize: 11, padding: "2px 8px" }, children: "Save" }),
                  /* @__PURE__ */ e("button", { className: "btn btn-sm", onClick: () => Z(null), style: { fontSize: 11, padding: "2px 8px" }, children: "Cancel" })
                ] }) })
              ] }, a.id) : /* @__PURE__ */ i("tr", { children: [
                /* @__PURE__ */ e("td", { style: { textAlign: "center", color: "var(--muted)", fontSize: 11 }, children: d }),
                /* @__PURE__ */ e("td", { className: "settings-td-mono", children: a.value }),
                /* @__PURE__ */ e("td", { style: { color: a.label ? "var(--fg)" : "var(--muted)" }, children: a.label || "—" }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ i("div", { style: { display: "flex", gap: 2, justifyContent: "flex-end", whiteSpace: "nowrap" }, children: [
                  n && d > 0 && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Move up", onClick: () => M(E.id, d, -1), style: { fontSize: 10 }, children: "▲" }),
                  n && d < W.length - 1 && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Move down", onClick: () => M(E.id, d, 1), style: { fontSize: 10 }, children: "▼" }),
                  n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => Z({ id: a.id, enumId: E.id, value: a.value, label: a.label || "", displayOrder: d }), children: /* @__PURE__ */ e(pe, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                  n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: () => C(E.id, a), children: /* @__PURE__ */ e(ae, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
                ] }) })
              ] }, a.id);
            }) })
          ] }),
          W.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No values yet" }),
          n && (X == null ? void 0 : X.enumId) === E.id ? /* @__PURE__ */ i("div", { style: { display: "flex", gap: 6, alignItems: "center", marginTop: 4 }, children: [
            /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, placeholder: "Value *", value: X.value || "", onChange: (a) => J((d) => ({ ...d, value: a.target.value })), onKeyDown: (a) => {
              a.key === "Enter" && p(E.id);
            }, style: { flex: 1 } }),
            /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Label (optional)", value: X.label || "", onChange: (a) => J((d) => ({ ...d, label: a.target.value })), style: { flex: 1 } }),
            /* @__PURE__ */ e("button", { className: "btn btn-primary btn-sm", onClick: () => p(E.id), disabled: h || !((ie = X.value) != null && ie.trim()), children: "Add" }),
            /* @__PURE__ */ e("button", { className: "btn btn-sm", onClick: () => J(null), children: "Cancel" })
          ] }) : n ? /* @__PURE__ */ i("button", { className: "btn btn-sm", style: { display: "flex", alignItems: "center", gap: 5, marginTop: 4 }, onClick: () => J({ enumId: E.id, value: "", label: "" }), children: [
            /* @__PURE__ */ e(ge, { size: 11, strokeWidth: 2.5 }),
            "Add value"
          ] }) : null
        ] })
      ] }, E.id);
    }),
    c.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No enumerations defined yet" })
  ] });
}
function At({ userId: t, canWrite: n, toast: r }) {
  var we;
  const [c, k] = x([]), [P, u] = x(null), [m, V] = x({}), [Y, O] = x(!0), [T, B] = x(null), [h, S] = x({}), [X, J] = x(!1), [w, Z] = x([]), [o, D] = x(""), [l, g] = x(!1), [v, p] = x({}), [C, y] = x([]), [M, Q] = x({}), [E, N] = x(null), [W, ie] = x(null), [a, d] = x([]), $ = at;
  function U() {
    return f.getLifecycles(t).then((_) => k(Array.isArray(_) ? _ : []));
  }
  Se(() => {
    U().finally(() => O(!1)), lt("GET", "/roles").then((_) => Z(Array.isArray(_) ? _ : [])).catch(() => {
    }), rt("GET", "/algorithms/instances").then((_) => y(Array.isArray(_) ? _ : [])).catch(() => {
    }), f.getMetadataKeys(t, "LIFECYCLE_STATE").then((_) => d(Array.isArray(_) ? _ : [])).catch(() => {
    });
  }, [t]), Ue(
    "/topic/metamodel",
    (_) => {
      _.event === "METAMODEL_CHANGED" && U();
    },
    t
  );
  async function F(_) {
    const [s, z] = await Promise.all([
      f.getLifecycleStates(t, _),
      f.getLifecycleTransitions(t, _)
    ]), q = Array.isArray(z) ? z : [];
    V((G) => ({ ...G, [_]: {
      states: Array.isArray(s) ? s : [],
      transitions: q
    } }));
    for (const G of q) {
      const j = G.id || G.ID;
      f.listTransitionGuards(t, j).then((A) => p((L) => ({ ...L, [j]: Array.isArray(A) ? A : [] }))).catch(() => {
      });
    }
    const H = Array.isArray(s) ? s : [];
    for (const G of H) {
      const j = G.id || G.ID;
      f.listLifecycleStateActions(t, _, j).then((A) => Q((L) => ({ ...L, [j]: Array.isArray(A) ? A : [] }))).catch(() => {
      });
    }
  }
  async function oe(_) {
    const s = _.id || _.ID;
    if (P === s) {
      u(null);
      return;
    }
    u(s), m[s] || await F(s).catch((z) => r(z, "error"));
  }
  function le(_, s = {}, z = {}) {
    S(z), B({ type: _, ctx: s }), D("");
  }
  function be() {
    B(null), S({}), D("");
  }
  async function Ne() {
    var _, s, z, q, H;
    J(!0);
    try {
      const { type: G, ctx: j } = T, A = h.metadata || {}, L = {};
      for (const [me, ce] of Object.entries(A))
        ce != null && (L[me] = ce);
      const te = {
        name: (_ = h.name) == null ? void 0 : _.trim(),
        isInitial: !!h.isInitial,
        metadata: L,
        displayOrder: h.displayOrder !== "" ? Number(h.displayOrder) : 0,
        color: h.color || null
      }, se = {
        name: (s = h.name) == null ? void 0 : s.trim(),
        fromStateId: h.fromStateId,
        toStateId: h.toStateId,
        actionType: h.actionType || "NONE",
        versionStrategy: h.versionStrategy || "NONE"
      };
      G === "create-lc" ? (await f.createLifecycle(t, { name: (z = h.name) == null ? void 0 : z.trim(), description: ((q = h.description) == null ? void 0 : q.trim()) || null }), await U()) : G === "duplicate-lc" ? (await f.duplicateLifecycle(t, j.sourceId, (H = h.name) == null ? void 0 : H.trim()), await U()) : G === "create-state" ? (await f.addLifecycleState(t, j.lifecycleId, te), await F(j.lifecycleId)) : G === "edit-state" ? (await f.updateLifecycleState(t, j.lifecycleId, j.stateId, te), await F(j.lifecycleId)) : G === "create-transition" ? (await f.addLifecycleTransition(t, j.lifecycleId, se), await F(j.lifecycleId)) : G === "edit-transition" && (await f.updateLifecycleTransition(t, j.lifecycleId, j.transId, se), await F(j.lifecycleId)), be();
    } catch (G) {
      r(G, "error");
    } finally {
      J(!1);
    }
  }
  async function he(_, s) {
    if (_.stopPropagation(), !!window.confirm(`Delete lifecycle "${s.name || s.NAME}"?

This deletes all states, transitions and attribute state rules. Cannot be undone.`))
      try {
        await f.deleteLifecycle(t, s.id || s.ID), await U(), P === (s.id || s.ID) && u(null);
      } catch (z) {
        r(z, "error");
      }
  }
  async function re(_, s) {
    if (window.confirm(`Delete state "${s.name || s.NAME}"?

Attribute state rules for this state will also be deleted.`))
      try {
        await f.deleteLifecycleState(t, _, s.id || s.ID), await F(_);
      } catch (z) {
        r(z, "error");
      }
  }
  async function ve(_, s) {
    if (window.confirm(`Delete transition "${s.name || s.NAME}"?`))
      try {
        await f.deleteLifecycleTransition(t, _, s.id || s.ID), await F(_);
      } catch (z) {
        r(z, "error");
      }
  }
  async function de(_, s) {
    if (o) {
      g(!0);
      try {
        await f.addTransitionSignatureRequirement(t, _, o), D(""), await F(s);
      } catch (z) {
        r(z, "error");
      } finally {
        g(!1);
      }
    }
  }
  async function Te(_, s, z) {
    g(!0);
    try {
      await f.removeTransitionSignatureRequirement(t, _, s), await F(z);
    } catch (q) {
      r(q, "error");
    } finally {
      g(!1);
    }
  }
  if (Y) return /* @__PURE__ */ e("div", { className: "settings-loading", children: "Loading…" });
  const Ae = {
    "create-lc": "New Lifecycle",
    "duplicate-lc": "Duplicate Lifecycle",
    "create-state": "Add State",
    "edit-state": "Edit State",
    "create-transition": "Add Transition",
    "edit-transition": "Edit Transition"
  }[T == null ? void 0 : T.type] || "", xe = T && ["edit-state", "edit-transition"].includes(T.type);
  return /* @__PURE__ */ i("div", { className: "settings-list", children: [
    T && /* @__PURE__ */ i(
      De,
      {
        title: Ae,
        onClose: be,
        onSave: Ne,
        saving: X,
        saveLabel: xe ? "Update" : "Create",
        width: (we = T.type) != null && we.includes("state") || T.type === "edit-transition" ? 520 : 480,
        children: [
          T.type === "create-lc" && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ e(b, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: h.name || "", onChange: (_) => S((s) => ({ ...s, name: _.target.value })), placeholder: "e.g. Standard" }) }),
            /* @__PURE__ */ e(b, { label: "Description", children: /* @__PURE__ */ e("input", { className: "field-input", value: h.description || "", onChange: (_) => S((s) => ({ ...s, description: _.target.value })), placeholder: "Optional description" }) })
          ] }),
          T.type === "duplicate-lc" && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ i("div", { style: { fontSize: 11, color: "var(--muted)", marginBottom: 8 }, children: [
              "Duplicating ",
              /* @__PURE__ */ e("strong", { style: { color: "var(--text)" }, children: T.ctx.sourceName }),
              " — copies all states, transitions, guards, signature requirements, state actions, and metadata."
            ] }),
            /* @__PURE__ */ e(b, { label: "New Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: h.name || "", onChange: (_) => S((s) => ({ ...s, name: _.target.value })), placeholder: "e.g. Standard (v2)" }) })
          ] }),
          (T.type === "create-state" || T.type === "edit-state") && /* @__PURE__ */ e(bt, { form: h, setForm: S, knownMetaKeys: a }),
          (T.type === "create-transition" || T.type === "edit-transition") && /* @__PURE__ */ e(Nt, { form: h, setForm: S, states: T.ctx.states || [] }),
          T.type === "edit-transition" && n && (() => {
            var G, j;
            const _ = T.ctx.lifecycleId, s = T.ctx.transId, z = (j = (G = m[_]) == null ? void 0 : G.transitions) == null ? void 0 : j.find((A) => (A.id || A.ID) === s), q = (z == null ? void 0 : z.signatureRequirements) || [], H = new Set(q.map((A) => A.roleRequired));
            return /* @__PURE__ */ i("div", { style: { marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }, children: [
              /* @__PURE__ */ e("div", { style: { fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }, children: "Signature Requirements" }),
              q.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { fontSize: 11 }, children: "No signatures required for this transition" }),
              q.map((A) => {
                var L;
                return /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 12 }, children: [
                  /* @__PURE__ */ e("span", { style: { flex: 1, color: "var(--text)" }, children: ((L = w.find((te) => (te.id || te.ID) === A.roleRequired)) == null ? void 0 : L.name) || A.roleRequired }),
                  /* @__PURE__ */ e(
                    "button",
                    {
                      className: "panel-icon-btn",
                      disabled: l,
                      onClick: () => Te(s, A.id, _),
                      title: "Remove requirement",
                      children: /* @__PURE__ */ e(ae, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" })
                    }
                  )
                ] }, A.id);
              }),
              /* @__PURE__ */ i("div", { style: { display: "flex", gap: 6, marginTop: 8 }, children: [
                /* @__PURE__ */ i(
                  "select",
                  {
                    className: "field-input",
                    style: { flex: 1, fontSize: 12 },
                    value: o,
                    onChange: (A) => D(A.target.value),
                    children: [
                      /* @__PURE__ */ e("option", { value: "", children: "Add required role…" }),
                      w.map((A) => {
                        const L = A.id || A.ID;
                        return /* @__PURE__ */ e("option", { value: L, disabled: H.has(L), children: A.name || A.NAME || L }, L);
                      })
                    ]
                  }
                ),
                /* @__PURE__ */ e(
                  "button",
                  {
                    className: "btn btn-sm",
                    disabled: !o || l,
                    onClick: () => de(s, _),
                    children: "Add"
                  }
                )
              ] })
            ] });
          })()
        ]
      }
    ),
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: n && /* @__PURE__ */ i("button", { className: "btn btn-sm", style: { display: "flex", alignItems: "center", gap: 5 }, onClick: () => le("create-lc"), children: [
      /* @__PURE__ */ e(ge, { size: 11, strokeWidth: 2.5 }),
      "New lifecycle"
    ] }) }),
    c.map((_) => {
      var j;
      const s = _.id || _.ID, z = _.name || _.NAME || s, q = P === s, H = m[s], G = (H == null ? void 0 : H.states) || [];
      return /* @__PURE__ */ i("div", { className: "settings-card", children: [
        /* @__PURE__ */ i("div", { className: "settings-card-hd", onClick: () => oe(_), style: { display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ e("span", { className: "settings-card-chevron", children: q ? /* @__PURE__ */ e(Re, { size: 13, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(Oe, { size: 13, strokeWidth: 2, color: "var(--muted)" }) }),
          /* @__PURE__ */ e("span", { className: "settings-card-name", children: z }),
          /* @__PURE__ */ e("span", { className: "settings-card-id", children: s }),
          n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Duplicate lifecycle", style: { marginLeft: "auto" }, onClick: (A) => {
            A.stopPropagation(), le("duplicate-lc", { sourceId: s, sourceName: z }, { name: `${z} (copy)` });
          }, children: /* @__PURE__ */ e(ut, { size: 12, strokeWidth: 2, color: "var(--accent)" }) }),
          n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete lifecycle", onClick: (A) => he(A, _), children: /* @__PURE__ */ e(ae, { size: 12, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
        ] }),
        q && H && /* @__PURE__ */ i("div", { className: "settings-card-body", style: { display: "flex", flexDirection: "column", gap: 0 }, children: [
          ((j = H.states) == null ? void 0 : j.length) > 0 && $ && /* @__PURE__ */ e("div", { style: { marginBottom: 16, overflowX: "auto" }, children: /* @__PURE__ */ e($, { lifecycleId: s, userId: t, previewMode: !0 }) }),
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "States" }),
            n && /* @__PURE__ */ e(
              "button",
              {
                className: "panel-icon-btn",
                title: "Add state",
                onClick: () => le("create-state", { lifecycleId: s }, { color: $e, displayOrder: "" }),
                children: /* @__PURE__ */ e(ge, { size: 12, strokeWidth: 2.5, color: "var(--accent)" })
              }
            )
          ] }),
          G.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { marginBottom: 12 }, children: "No states defined" }),
          G.map((A) => {
            const L = A.id || A.ID, te = A.name || A.NAME || L, se = We(A), me = A.metadata || {}, ce = [
              A.is_initial || A.IS_INITIAL ? "INIT" : null,
              ...Object.keys(me).map((K) => K.toUpperCase())
            ].filter(Boolean), fe = A.display_order ?? A.DISPLAY_ORDER ?? 0, Ie = E === L, ke = M[L] || [];
            return /* @__PURE__ */ i("div", { style: { marginBottom: 3 }, children: [
              /* @__PURE__ */ i("div", { style: {
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 8px",
                borderRadius: Ie ? "5px 5px 0 0" : 5,
                background: "var(--subtle-bg)",
                border: "1px solid var(--border)",
                borderBottom: Ie ? "1px solid var(--border2)" : "1px solid var(--border)",
                cursor: "pointer"
              }, onClick: () => N(Ie ? null : L), children: [
                /* @__PURE__ */ e("span", { style: { flexShrink: 0 }, children: Ie ? /* @__PURE__ */ e(Re, { size: 11, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(Oe, { size: 11, strokeWidth: 2, color: "var(--muted)" }) }),
                /* @__PURE__ */ e("span", { style: {
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: se,
                  boxShadow: `0 0 0 2px ${se}33`
                } }),
                /* @__PURE__ */ e("span", { style: { fontWeight: 600, fontSize: 12, color: "var(--text)", flex: 1 }, children: te }),
                /* @__PURE__ */ e("div", { style: { display: "flex", gap: 4 }, children: ce.map((K) => /* @__PURE__ */ e("span", { className: "lc-state-flag", style: { background: se + "22", color: se, borderColor: se + "55" }, children: K }, K)) }),
                ke.length > 0 && /* @__PURE__ */ i("span", { className: "settings-badge", title: `${ke.length} state action(s)`, children: [
                  ke.length,
                  " action",
                  ke.length > 1 ? "s" : ""
                ] }),
                /* @__PURE__ */ i("span", { style: { fontSize: 10, color: "var(--muted)", minWidth: 24, textAlign: "right" }, children: [
                  "#",
                  fe
                ] }),
                n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit state", onClick: (K) => {
                  K.stopPropagation(), le("edit-state", { lifecycleId: s, stateId: L }, {
                    name: te,
                    isInitial: !!(A.is_initial || A.IS_INITIAL),
                    metadata: { ...me },
                    displayOrder: fe,
                    color: se
                  });
                }, children: /* @__PURE__ */ e(pe, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete state", onClick: (K) => {
                  K.stopPropagation(), re(s, A);
                }, children: /* @__PURE__ */ e(ae, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
              ] }),
              Ie && /* @__PURE__ */ i("div", { style: {
                padding: "10px 12px",
                background: "var(--subtle-bg2)",
                border: "1px solid var(--border)",
                borderTop: "none",
                borderRadius: "0 0 5px 5px"
              }, children: [
                /* @__PURE__ */ i("div", { style: { display: "flex", gap: 16, marginBottom: 12, fontSize: 11 }, children: [
                  /* @__PURE__ */ i("div", { children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "ID" }),
                    " ",
                    /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--text)", fontSize: 10 }, children: L })
                  ] }),
                  /* @__PURE__ */ i("div", { children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "Order" }),
                    " ",
                    /* @__PURE__ */ e("span", { style: { color: "var(--text)" }, children: fe })
                  ] })
                ] }),
                Object.keys(me).length > 0 && /* @__PURE__ */ i("div", { style: { marginBottom: 12 }, children: [
                  /* @__PURE__ */ e("div", { style: { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }, children: "Metadata" }),
                  /* @__PURE__ */ e("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: Object.entries(me).map(([K, ee]) => /* @__PURE__ */ i("span", { style: {
                    fontSize: 10,
                    fontFamily: "var(--mono)",
                    padding: "2px 6px",
                    borderRadius: 3,
                    background: "var(--accent-dim)",
                    color: "var(--accent)",
                    border: "1px solid rgba(106,172,255,.2)"
                  }, children: [
                    K,
                    "=",
                    ee
                  ] }, K)) })
                ] }),
                /* @__PURE__ */ e("div", { style: { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }, children: "State Actions" }),
                ke.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { fontSize: 11, marginBottom: 8 }, children: "No actions attached to this state" }),
                ke.map((K) => /* @__PURE__ */ i("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 6px",
                  marginBottom: 2,
                  borderRadius: 3,
                  background: "var(--subtle-bg)",
                  border: "1px solid var(--border)",
                  fontSize: 11
                }, children: [
                  /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 600 }, children: K.algorithmCode || K.instanceName }),
                  /* @__PURE__ */ e(Ze, { module: K.moduleName }),
                  /* @__PURE__ */ e("span", { className: "settings-badge", style: {
                    background: K.trigger === "ON_ENTER" ? "rgba(52,211,153,.15)" : "rgba(248,113,113,.15)",
                    color: K.trigger === "ON_ENTER" ? "#34d399" : "#f87171",
                    fontSize: 9
                  }, children: K.trigger }),
                  /* @__PURE__ */ e("span", { className: "settings-badge", style: {
                    background: K.executionMode === "TRANSACTIONAL" ? "rgba(167,139,250,.15)" : "rgba(250,204,21,.15)",
                    color: K.executionMode === "TRANSACTIONAL" ? "#a78bfa" : "#facc15",
                    fontSize: 9
                  }, children: K.executionMode }),
                  /* @__PURE__ */ e("span", { style: { flex: 1 } }),
                  n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Detach action", onClick: async () => {
                    try {
                      await f.detachLifecycleStateAction(t, s, L, K.id), Q((ee) => ({ ...ee, [L]: (ee[L] || []).filter((Ee) => Ee.id !== K.id) })), r("Action detached", "success");
                    } catch (ee) {
                      r(ee, "error");
                    }
                  }, children: /* @__PURE__ */ e(ae, { size: 10, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
                ] }, K.id)),
                n && (() => {
                  const K = C.filter((ee) => ee.typeName === "State Action");
                  return /* @__PURE__ */ i("div", { style: { display: "flex", gap: 6, marginTop: 6, alignItems: "center" }, children: [
                    /* @__PURE__ */ i("select", { className: "field-input", id: `sa-inst-${L}`, style: { flex: 1, fontSize: 11 }, defaultValue: "", children: [
                      /* @__PURE__ */ e("option", { value: "", children: "Select action instance…" }),
                      K.map((ee) => /* @__PURE__ */ i("option", { value: ee.id, children: [
                        ee.algorithmName || ee.name,
                        " — ",
                        ee.name
                      ] }, ee.id)),
                      K.length === 0 && /* @__PURE__ */ e("option", { disabled: !0, children: "No State Action instances available" })
                    ] }),
                    /* @__PURE__ */ i("select", { className: "field-input", id: `sa-trigger-${L}`, style: { width: 100, fontSize: 11 }, defaultValue: "ON_ENTER", children: [
                      /* @__PURE__ */ e("option", { value: "ON_ENTER", children: "ON_ENTER" }),
                      /* @__PURE__ */ e("option", { value: "ON_EXIT", children: "ON_EXIT" })
                    ] }),
                    /* @__PURE__ */ i("select", { className: "field-input", id: `sa-mode-${L}`, style: { width: 130, fontSize: 11 }, defaultValue: "TRANSACTIONAL", children: [
                      /* @__PURE__ */ e("option", { value: "TRANSACTIONAL", children: "TRANSACTIONAL" }),
                      /* @__PURE__ */ e("option", { value: "POST_COMMIT", children: "POST_COMMIT" })
                    ] }),
                    /* @__PURE__ */ e("button", { className: "btn btn-sm", style: { fontSize: 10 }, onClick: async () => {
                      const ee = document.getElementById(`sa-inst-${L}`), Ee = document.getElementById(`sa-trigger-${L}`), Le = document.getElementById(`sa-mode-${L}`);
                      if (ee != null && ee.value)
                        try {
                          await f.attachLifecycleStateAction(t, s, L, ee.value, Ee.value, Le.value);
                          const Ce = await f.listLifecycleStateActions(t, s, L);
                          Q((Fe) => ({ ...Fe, [L]: Array.isArray(Ce) ? Ce : [] })), ee.value = "", r("Action attached", "success");
                        } catch (Ce) {
                          r(Ce, "error");
                        }
                    }, children: "Attach" })
                  ] });
                })()
              ] })
            ] }, L);
          }),
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 6 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Transitions" }),
            n && /* @__PURE__ */ e(
              "button",
              {
                className: "panel-icon-btn",
                title: "Add transition",
                onClick: () => le("create-transition", { lifecycleId: s, states: G }, { actionType: "NONE", versionStrategy: "NONE" }),
                children: /* @__PURE__ */ e(ge, { size: 12, strokeWidth: 2.5, color: "var(--accent)" })
              }
            )
          ] }),
          H.transitions.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No transitions defined" }),
          H.transitions.map((A) => {
            const L = A.id || A.ID, te = A.name || A.NAME || L, se = A.from_state_id || A.FROM_STATE_ID || "", me = A.to_state_id || A.TO_STATE_ID || "", ce = G.find((R) => (R.id || R.ID) === se), fe = G.find((R) => (R.id || R.ID) === me), Ie = We(ce), ke = We(fe), K = A.version_strategy || A.VERSION_STRATEGY, ee = A.action_type || A.ACTION_TYPE || "NONE", Ee = v[L] || [], Le = W === L, Ce = A.signatureRequirements || [], Fe = C.filter((R) => R.typeName === "Action Guard" || R.typeName === "Lifecycle Guard");
            return /* @__PURE__ */ i("div", { style: { marginBottom: 3 }, children: [
              /* @__PURE__ */ i("div", { style: {
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 8px",
                borderRadius: Le ? "5px 5px 0 0" : 5,
                background: "var(--subtle-bg)",
                border: "1px solid var(--border)",
                borderBottom: Le ? "1px solid var(--border2)" : "1px solid var(--border)",
                cursor: "pointer"
              }, onClick: () => ie(Le ? null : L), children: [
                /* @__PURE__ */ e("span", { style: { flexShrink: 0 }, children: Le ? /* @__PURE__ */ e(Re, { size: 11, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(Oe, { size: 11, strokeWidth: 2, color: "var(--muted)" }) }),
                /* @__PURE__ */ e("span", { style: { fontWeight: 600, fontSize: 12, color: "var(--text)", minWidth: 90 }, children: te }),
                /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", gap: 5, flex: 1, fontSize: 11 }, children: [
                  /* @__PURE__ */ i("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                    /* @__PURE__ */ e("span", { style: { width: 8, height: 8, borderRadius: "50%", background: Ie, flexShrink: 0 } }),
                    /* @__PURE__ */ e("span", { style: { color: Ie }, children: (ce == null ? void 0 : ce.name) || (ce == null ? void 0 : ce.NAME) || se })
                  ] }),
                  /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "→" }),
                  /* @__PURE__ */ i("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                    /* @__PURE__ */ e("span", { style: { width: 8, height: 8, borderRadius: "50%", background: ke, flexShrink: 0 } }),
                    /* @__PURE__ */ e("span", { style: { color: ke }, children: (fe == null ? void 0 : fe.name) || (fe == null ? void 0 : fe.NAME) || me })
                  ] })
                ] }),
                /* @__PURE__ */ i("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" }, children: [
                  Ee.length > 0 && /* @__PURE__ */ i("span", { className: "settings-badge", title: Ee.map((R) => R.algorithmCode).join(", "), children: [
                    Ee.length,
                    " guard",
                    Ee.length > 1 ? "s" : ""
                  ] }),
                  K && K !== "NONE" && /* @__PURE__ */ e("span", { className: "settings-badge", children: K }),
                  Ce.length > 0 && /* @__PURE__ */ i("span", { className: "settings-badge", style: { background: "rgba(139,92,246,.18)", color: "#a78bfa" }, children: [
                    Ce.length,
                    " sign."
                  ] })
                ] }),
                n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit transition", onClick: (R) => {
                  R.stopPropagation(), le("edit-transition", { lifecycleId: s, transId: L, states: G }, {
                    name: te,
                    fromStateId: se,
                    toStateId: me,
                    actionType: ee,
                    versionStrategy: K || "NONE"
                  });
                }, children: /* @__PURE__ */ e(pe, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete transition", onClick: (R) => {
                  R.stopPropagation(), ve(s, A);
                }, children: /* @__PURE__ */ e(ae, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
              ] }),
              Le && /* @__PURE__ */ i("div", { style: {
                padding: "10px 12px",
                background: "var(--subtle-bg2)",
                border: "1px solid var(--border)",
                borderTop: "none",
                borderRadius: "0 0 5px 5px"
              }, children: [
                /* @__PURE__ */ i("div", { style: { display: "flex", gap: 16, marginBottom: 12, fontSize: 11, flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ i("div", { children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "ID" }),
                    " ",
                    /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--text)", fontSize: 10 }, children: L })
                  ] }),
                  /* @__PURE__ */ i("div", { children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "Action Type" }),
                    " ",
                    /* @__PURE__ */ e("span", { style: { color: "var(--text)" }, children: ee })
                  ] }),
                  /* @__PURE__ */ i("div", { children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "Version Strategy" }),
                    " ",
                    /* @__PURE__ */ e("span", { style: { color: "var(--text)" }, children: K || "NONE" })
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { style: { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }, children: "Guards" }),
                Ee.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { fontSize: 11, marginBottom: 8 }, children: "No guards attached" }),
                Ee.map((R) => /* @__PURE__ */ i("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 6px",
                  marginBottom: 2,
                  borderRadius: 3,
                  background: "var(--subtle-bg)",
                  border: "1px solid var(--border)",
                  fontSize: 11
                }, children: [
                  /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 600 }, children: R.algorithmName || R.algorithmCode || R.instanceName }),
                  R.algorithmCode && R.algorithmName && /* @__PURE__ */ i("span", { style: { fontSize: 10, color: "var(--muted)" }, children: [
                    "(",
                    R.algorithmCode,
                    ")"
                  ] }),
                  /* @__PURE__ */ e(Ze, { module: R.moduleName }),
                  n ? /* @__PURE__ */ i(
                    "select",
                    {
                      className: "field-input",
                      style: { fontSize: 10, padding: "0 4px", height: 20 },
                      value: R.effect,
                      onChange: async (ue) => {
                        const ye = ue.target.value;
                        try {
                          await f.updateTransitionGuard(t, R.id, ye), p((_e) => ({
                            ..._e,
                            [L]: (_e[L] || []).map((Be) => Be.id === R.id ? { ...Be, effect: ye } : Be)
                          })), r("Effect updated", "success");
                        } catch (_e) {
                          r(_e, "error");
                        }
                      },
                      children: [
                        /* @__PURE__ */ e("option", { value: "HIDE", children: "HIDE" }),
                        /* @__PURE__ */ e("option", { value: "BLOCK", children: "BLOCK" })
                      ]
                    }
                  ) : /* @__PURE__ */ e("span", { className: `settings-badge ${R.effect === "BLOCK" ? "badge-warn" : ""}`, style: { fontSize: 9 }, children: R.effect }),
                  /* @__PURE__ */ e("span", { style: { flex: 1 } }),
                  n && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Detach guard", onClick: async () => {
                    try {
                      await f.detachTransitionGuard(t, R.id), p((ue) => ({ ...ue, [L]: (ue[L] || []).filter((ye) => ye.id !== R.id) })), r("Guard detached", "success");
                    } catch (ue) {
                      r(ue, "error");
                    }
                  }, children: /* @__PURE__ */ e(ae, { size: 10, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
                ] }, R.id)),
                n && /* @__PURE__ */ i("div", { style: { display: "flex", gap: 6, marginTop: 4, alignItems: "center" }, children: [
                  /* @__PURE__ */ i("select", { className: "field-input", id: `tg-inst-${L}`, style: { flex: 1, fontSize: 11 }, defaultValue: "", children: [
                    /* @__PURE__ */ e("option", { value: "", children: "Select guard instance…" }),
                    Fe.map((R) => /* @__PURE__ */ i("option", { value: R.id, children: [
                      R.algorithmName || R.name,
                      " — ",
                      R.name
                    ] }, R.id))
                  ] }),
                  /* @__PURE__ */ i("select", { className: "field-input", id: `tg-effect-${L}`, style: { width: 80, fontSize: 11 }, defaultValue: "BLOCK", children: [
                    /* @__PURE__ */ e("option", { value: "BLOCK", children: "BLOCK" }),
                    /* @__PURE__ */ e("option", { value: "HIDE", children: "HIDE" })
                  ] }),
                  /* @__PURE__ */ e("button", { className: "btn btn-sm", style: { fontSize: 10 }, onClick: async () => {
                    const R = document.getElementById(`tg-inst-${L}`), ue = document.getElementById(`tg-effect-${L}`);
                    if (R != null && R.value)
                      try {
                        await f.attachTransitionGuard(t, L, R.value, ue.value, 0);
                        const ye = await f.listTransitionGuards(t, L);
                        p((_e) => ({ ..._e, [L]: Array.isArray(ye) ? ye : [] })), R.value = "", r("Guard attached", "success");
                      } catch (ye) {
                        r(ye, "error");
                      }
                  }, children: "Attach" })
                ] }),
                /* @__PURE__ */ e("div", { style: { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 14, marginBottom: 6 }, children: "Signature Requirements" }),
                Ce.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { fontSize: 11, marginBottom: 8 }, children: "No signatures required" }),
                Ce.map((R) => {
                  var ue;
                  return /* @__PURE__ */ i("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 6px",
                    marginBottom: 2,
                    borderRadius: 3,
                    background: "var(--subtle-bg)",
                    border: "1px solid var(--border)",
                    fontSize: 11
                  }, children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--text)", flex: 1 }, children: ((ue = w.find((ye) => (ye.id || ye.ID) === R.roleRequired)) == null ? void 0 : ue.name) || R.roleRequired }),
                    n && /* @__PURE__ */ e(
                      "button",
                      {
                        className: "panel-icon-btn",
                        disabled: l,
                        title: "Remove requirement",
                        onClick: () => Te(L, R.id, s),
                        children: /* @__PURE__ */ e(ae, { size: 10, strokeWidth: 2, color: "var(--danger, #f87171)" })
                      }
                    )
                  ] }, R.id);
                }),
                n && /* @__PURE__ */ i("div", { style: { display: "flex", gap: 6, marginTop: 4, alignItems: "center" }, children: [
                  /* @__PURE__ */ i(
                    "select",
                    {
                      className: "field-input",
                      style: { flex: 1, fontSize: 11 },
                      value: o,
                      onChange: (R) => D(R.target.value),
                      children: [
                        /* @__PURE__ */ e("option", { value: "", children: "Add required role…" }),
                        w.map((R) => {
                          const ue = R.id || R.ID, ye = Ce.some((_e) => _e.roleRequired === ue);
                          return /* @__PURE__ */ e("option", { value: ue, disabled: ye, children: R.name || R.NAME || ue }, ue);
                        })
                      ]
                    }
                  ),
                  /* @__PURE__ */ e(
                    "button",
                    {
                      className: "btn btn-sm",
                      style: { fontSize: 10 },
                      disabled: !o || l,
                      onClick: () => de(L, s),
                      children: "Add"
                    }
                  )
                ] })
              ] })
            ] }, L);
          })
        ] })
      ] }, s);
    })
  ] });
}
function xt({ userId: t, canWrite: n, toast: r }) {
  const [c, k] = x([]), [P, u] = x([]), [m, V] = x(!0), [Y, O] = x(null), [T, B] = x({}), [h, S] = x(!1);
  async function X() {
    const [l, g] = await Promise.all([
      f.getSources(t).catch(() => []),
      f.getSourceResolvers(t).catch(() => [])
    ]);
    k(Array.isArray(l) ? l : []), u(Array.isArray(g) ? g : []);
  }
  Se(() => {
    X().finally(() => V(!1));
  }, [t]);
  function J() {
    var l;
    B({ id: "", name: "", description: "", resolverInstanceId: ((l = P[0]) == null ? void 0 : l.instanceId) || "", color: "", icon: "" }), O({ kind: "create" });
  }
  function w(l) {
    B({ id: l.id, name: l.name, description: l.description || "", resolverInstanceId: l.resolverInstanceId, color: l.color || "", icon: l.icon || "" }), O({ kind: "edit", original: l });
  }
  function Z() {
    O(null), B({});
  }
  async function o() {
    var l, g, v;
    S(!0);
    try {
      const p = {
        name: (l = T.name) == null ? void 0 : l.trim(),
        description: ((g = T.description) == null ? void 0 : g.trim()) || null,
        resolverInstanceId: T.resolverInstanceId,
        color: T.color || null,
        icon: T.icon || null
      };
      Y.kind === "create" ? (await f.createSource(t, { id: (v = T.id) == null ? void 0 : v.trim(), ...p }), r("Source created", "success")) : (await f.updateSource(t, Y.original.id, p), r("Source updated", "success")), Z(), await X();
    } catch (p) {
      r(p, "error");
    } finally {
      S(!1);
    }
  }
  async function D(l) {
    if (window.confirm(`Delete source "${l.name}" (${l.id})?`))
      try {
        await f.deleteSource(t, l.id), r("Source deleted", "success"), await X();
      } catch (g) {
        r(g, "error");
      }
  }
  return m ? /* @__PURE__ */ e("div", { style: { padding: 16, color: "var(--muted)" }, children: "Loading…" }) : /* @__PURE__ */ i("div", { style: { padding: "0 16px 24px" }, children: [
    /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }, children: [
      /* @__PURE__ */ i("div", { style: { flex: 1, fontSize: 12, color: "var(--muted)" }, children: [
        "Sources declare the systems that host link targets. Each source binds to a resolver (algorithm of type ",
        /* @__PURE__ */ e("code", { children: "algtype-source-resolver" }),
        "). The built-in",
        " ",
        /* @__PURE__ */ e("span", { className: "settings-badge", children: "SELF" }),
        " source targets nodes inside this PLM instance and is not editable."
      ] }),
      n && /* @__PURE__ */ i("button", { className: "btn btn-primary btn-sm", onClick: J, disabled: P.length === 0, children: [
        /* @__PURE__ */ e(ge, { size: 11, strokeWidth: 2 }),
        " Add Source"
      ] })
    ] }),
    /* @__PURE__ */ i("table", { className: "settings-table", children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { children: [
        /* @__PURE__ */ e("th", { style: { width: 40 } }),
        /* @__PURE__ */ e("th", { style: { width: 160 }, children: "ID" }),
        /* @__PURE__ */ e("th", { children: "Name" }),
        /* @__PURE__ */ e("th", { children: "Resolver" }),
        /* @__PURE__ */ e("th", { children: "Description" }),
        /* @__PURE__ */ e("th", { style: { width: 90 } })
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: c.map((l) => {
        const g = l.icon ? Me[l.icon] : null;
        return /* @__PURE__ */ i("tr", { children: [
          /* @__PURE__ */ e("td", { children: g ? /* @__PURE__ */ e(g, { size: 16, strokeWidth: 1.8, color: l.color || "var(--muted)" }) : /* @__PURE__ */ e("span", { style: { color: "var(--muted2)" }, children: "—" }) }),
          /* @__PURE__ */ i("td", { className: "settings-td-mono", children: [
            l.id,
            " ",
            l.builtin && /* @__PURE__ */ e("span", { className: "settings-badge", style: { marginLeft: 4 }, children: "built-in" })
          ] }),
          /* @__PURE__ */ e("td", { children: l.name }),
          /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: l.resolverAlgorithmCode }) }),
          /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: l.description }),
          /* @__PURE__ */ e("td", { style: { textAlign: "right", whiteSpace: "nowrap" }, children: n && !l.builtin && /* @__PURE__ */ i(ne, { children: [
            /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => w(l), children: /* @__PURE__ */ e(pe, { size: 12, strokeWidth: 2, color: "var(--accent)" }) }),
            /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: () => D(l), style: { marginLeft: 4 }, children: /* @__PURE__ */ e(ae, { size: 12, strokeWidth: 2, color: "var(--danger)" }) })
          ] }) })
        ] }, l.id);
      }) })
    ] }),
    Y && /* @__PURE__ */ i(
      De,
      {
        title: Y.kind === "create" ? "New Source" : `Edit ${Y.original.name}`,
        onClose: Z,
        onSave: o,
        saving: h || !T.name || !T.resolverInstanceId || Y.kind === "create" && !T.id,
        children: [
          /* @__PURE__ */ e(b, { label: "ID", children: /* @__PURE__ */ e(
            "input",
            {
              className: "field-input",
              value: T.id || "",
              disabled: Y.kind === "edit",
              onChange: (l) => B((g) => ({ ...g, id: l.target.value })),
              placeholder: "e.g. FILE_LOCAL"
            }
          ) }),
          /* @__PURE__ */ e(b, { label: "Name", children: /* @__PURE__ */ e("input", { className: "field-input", value: T.name || "", onChange: (l) => B((g) => ({ ...g, name: l.target.value })) }) }),
          /* @__PURE__ */ e(b, { label: "Description", children: /* @__PURE__ */ e(
            "textarea",
            {
              className: "field-input",
              rows: 2,
              value: T.description || "",
              onChange: (l) => B((g) => ({ ...g, description: l.target.value }))
            }
          ) }),
          /* @__PURE__ */ e(b, { label: "Resolver", children: /* @__PURE__ */ i(
            "select",
            {
              className: "field-input",
              value: T.resolverInstanceId || "",
              onChange: (l) => B((g) => ({ ...g, resolverInstanceId: l.target.value })),
              children: [
                /* @__PURE__ */ e("option", { value: "", children: "— select —" }),
                P.map((l) => /* @__PURE__ */ i("option", { value: l.instanceId, children: [
                  l.algorithmCode,
                  " — ",
                  l.instanceName
                ] }, l.instanceId))
              ]
            }
          ) }),
          /* @__PURE__ */ e(ze, { label: "Color", value: T.color, onChange: (l) => B((g) => ({ ...g, color: l })) }),
          /* @__PURE__ */ e(dt, { value: T.icon, onChange: (l) => B((g) => ({ ...g, icon: l })) })
        ]
      }
    )
  ] });
}
function kt({ userId: t, canWrite: n, toast: r }) {
  const [c, k] = x([]), [P, u] = x([]), [m, V] = x([]), [Y, O] = x(!0), [T, B] = x(null), [h, S] = x({}), [X, J] = x(!1);
  async function w() {
    const [y, M, Q] = await Promise.all([
      f.getImportContexts().catch(() => []),
      f.getImportAlgorithmInstances().catch(() => []),
      f.getValidationAlgorithmInstances().catch(() => [])
    ]);
    k(Array.isArray(y) ? y : []), u(Array.isArray(M) ? M : []), V(Array.isArray(Q) ? Q : []);
  }
  Se(() => {
    w().finally(() => O(!1));
  }, [t]);
  function Z() {
    S({ code: "", label: "", allowedRootNodeTypes: "", acceptedFormats: "", importContextAlgorithmInstanceId: "", nodeValidationAlgorithmInstanceId: "" }), B({ kind: "create" });
  }
  function o(y) {
    S({
      code: y.code,
      label: y.label,
      allowedRootNodeTypes: y.allowedRootNodeTypes || "",
      acceptedFormats: y.acceptedFormats || "",
      importContextAlgorithmInstanceId: y.importContextAlgorithmInstanceId || "",
      nodeValidationAlgorithmInstanceId: y.nodeValidationAlgorithmInstanceId || ""
    }), B({ kind: "edit", original: y });
  }
  function D() {
    B(null), S({});
  }
  function l(y) {
    return y.name || y.instanceName || y.algorithmCode || y.instanceId || y.id || "?";
  }
  function g(y) {
    return y.instanceId || y.id;
  }
  async function v() {
    var y, M, Q, E;
    J(!0);
    try {
      const N = {
        code: (y = h.code) == null ? void 0 : y.trim(),
        label: (M = h.label) == null ? void 0 : M.trim(),
        allowedRootNodeTypes: ((Q = h.allowedRootNodeTypes) == null ? void 0 : Q.trim()) || null,
        acceptedFormats: ((E = h.acceptedFormats) == null ? void 0 : E.trim()) || null,
        importContextAlgorithmInstanceId: h.importContextAlgorithmInstanceId || null,
        nodeValidationAlgorithmInstanceId: h.nodeValidationAlgorithmInstanceId || null
      };
      T.kind === "create" ? (await f.createImportContext(N), r("Import context created", "success")) : (await f.updateImportContext(T.original.id, N), r("Import context updated", "success")), D(), await w();
    } catch (N) {
      r(N, "error");
    } finally {
      J(!1);
    }
  }
  async function p(y) {
    if (window.confirm(`Delete import context "${y.label}" (${y.code})?`))
      try {
        await f.deleteImportContext(y.id), r("Import context deleted", "success"), await w();
      } catch (M) {
        r(M, "error");
      }
  }
  function C(y, M) {
    if (!M) return "—";
    const Q = y.find((E) => g(E) === M);
    return Q ? l(Q) : M;
  }
  return Y ? /* @__PURE__ */ e("div", { style: { padding: 16, color: "var(--muted)" }, children: "Loading…" }) : /* @__PURE__ */ i("div", { style: { padding: "0 16px 24px" }, children: [
    /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }, children: [
      /* @__PURE__ */ i("div", { style: { flex: 1, fontSize: 12, color: "var(--muted)" }, children: [
        "Import contexts bind a logical code to algorithm instances for CAD file processing (cad-api) and node validation (psm-api). The built-in",
        " ",
        /* @__PURE__ */ e("span", { className: "settings-badge", children: "default" }),
        " context uses service-level default algorithms when no specific context is requested."
      ] }),
      n && /* @__PURE__ */ i("button", { className: "btn btn-primary btn-sm", onClick: Z, children: [
        /* @__PURE__ */ e(ge, { size: 11, strokeWidth: 2 }),
        " Add Context"
      ] })
    ] }),
    /* @__PURE__ */ i("table", { className: "settings-table", children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { children: [
        /* @__PURE__ */ e("th", { style: { width: 140 }, children: "Code" }),
        /* @__PURE__ */ e("th", { children: "Label" }),
        /* @__PURE__ */ e("th", { children: "Import algorithm" }),
        /* @__PURE__ */ e("th", { children: "Validation algorithm" }),
        /* @__PURE__ */ e("th", { style: { width: 90 } })
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: c.map((y) => /* @__PURE__ */ i("tr", { children: [
        /* @__PURE__ */ i("td", { className: "settings-td-mono", children: [
          y.code,
          y.code === "default" && /* @__PURE__ */ e("span", { className: "settings-badge", style: { marginLeft: 4 }, children: "built-in" })
        ] }),
        /* @__PURE__ */ e("td", { children: y.label }),
        /* @__PURE__ */ e("td", { style: { fontSize: 12, color: "var(--muted)" }, children: C(P, y.importContextAlgorithmInstanceId) }),
        /* @__PURE__ */ e("td", { style: { fontSize: 12, color: "var(--muted)" }, children: C(m, y.nodeValidationAlgorithmInstanceId) }),
        /* @__PURE__ */ e("td", { style: { textAlign: "right", whiteSpace: "nowrap" }, children: n && /* @__PURE__ */ i(ne, { children: [
          /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => o(y), children: /* @__PURE__ */ e(pe, { size: 12, strokeWidth: 2, color: "var(--accent)" }) }),
          y.code !== "default" && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: () => p(y), style: { marginLeft: 4 }, children: /* @__PURE__ */ e(ae, { size: 12, strokeWidth: 2, color: "var(--danger)" }) })
        ] }) })
      ] }, y.id)) })
    ] }),
    T && /* @__PURE__ */ i(
      De,
      {
        title: T.kind === "create" ? "New Import Context" : `Edit ${T.original.label}`,
        onClose: D,
        onSave: v,
        saving: X || !h.label || T.kind === "create" && !h.code,
        children: [
          /* @__PURE__ */ e(b, { label: "Code", children: /* @__PURE__ */ e(
            "input",
            {
              className: "field-input",
              value: h.code || "",
              disabled: T.kind === "edit",
              onChange: (y) => S((M) => ({ ...M, code: y.target.value })),
              placeholder: "e.g. catia-v5-mech"
            }
          ) }),
          /* @__PURE__ */ e(b, { label: "Label", children: /* @__PURE__ */ e("input", { className: "field-input", value: h.label || "", onChange: (y) => S((M) => ({ ...M, label: y.target.value })) }) }),
          /* @__PURE__ */ e(b, { label: "Accepted formats", children: /* @__PURE__ */ e("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }, children: gt.map((y) => {
            const M = h.acceptedFormats || "", Q = M.includes(`"${y}"`);
            function E() {
              let N = [];
              try {
                N = JSON.parse(M || "[]");
              } catch {
                N = [];
              }
              N = Q ? N.filter((W) => W !== y) : [...N, y], S((W) => ({ ...W, acceptedFormats: N.length ? JSON.stringify(N) : "" }));
            }
            return /* @__PURE__ */ i("label", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }, children: [
              /* @__PURE__ */ e("input", { type: "checkbox", checked: Q, onChange: E }),
              y
            ] }, y);
          }) }) }),
          /* @__PURE__ */ e(b, { label: "Import algorithm instance", children: /* @__PURE__ */ i(
            "select",
            {
              className: "field-input",
              value: h.importContextAlgorithmInstanceId || "",
              onChange: (y) => S((M) => ({ ...M, importContextAlgorithmInstanceId: y.target.value })),
              children: [
                /* @__PURE__ */ e("option", { value: "", children: "— none (use default) —" }),
                P.map((y) => /* @__PURE__ */ e("option", { value: g(y), children: l(y) }, g(y)))
              ]
            }
          ) }),
          /* @__PURE__ */ e(b, { label: "Node validation algorithm instance", children: /* @__PURE__ */ i(
            "select",
            {
              className: "field-input",
              value: h.nodeValidationAlgorithmInstanceId || "",
              onChange: (y) => S((M) => ({ ...M, nodeValidationAlgorithmInstanceId: y.target.value })),
              children: [
                /* @__PURE__ */ e("option", { value: "", children: "— none (use default) —" }),
                m.map((y) => /* @__PURE__ */ e("option", { value: g(y), children: l(y) }, g(y)))
              ]
            }
          ) })
        ]
      }
    )
  ] });
}
const Lt = {
  id: "psa-settings",
  zone: "settings",
  init(t) {
    var n, r;
    Ue = t.useWebSocket ?? (() => {
    }), at = ((n = t.components) == null ? void 0 : n.LifecycleDiagram) ?? null, Me = ((r = t.icons) == null ? void 0 : r.NODE_ICONS) ?? {}, it = Object.keys(Me), lt = (c, k, P) => t.http.serviceRequest("pno", c, k, P), rt = (c, k, P) => t.http.serviceRequest("platform", c, k, P), pt(t);
  },
  sections: {
    "node-types": Et,
    domains: Ct,
    enums: St,
    lifecycles: At,
    sources: xt,
    "import-contexts": kt
  }
};
export {
  Ct as DomainsSection,
  St as EnumsSection,
  Et as NodeTypesSection,
  Lt as default
};
